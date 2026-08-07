const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const imageBaseUrl = "https://marvelcdb.com";
const githubImageBaseUrl = "https://valcur.github.io/TCG-Arena-Marvel-Champions/Images/Cards";
const imagesDir = path.join(__dirname, "Images", "Cards");

const cards = JSON.parse(fs.readFileSync("./db.json", "utf8"));

const result = {};

const removedAlterEgoCards = {};
const linkedCodes = new Set();

const isHorizontal = (type) => {
    return ["Side Scheme", "Main Scheme"].includes(type);
};

for (const card of cards) {
    if (
        card.type_code === "hero" &&
        card.linked_card &&
        card.linked_card.type_code === "alter_ego"
    ) {
        linkedCodes.add(card.linked_card.code);
    }
}

// --- Construction des cartes (inchangé, reste "clean") ---
for (const card of cards) {
    if (linkedCodes.has(card.code)) continue;

    const isHeroWithAlterEgo =
        card.type_code === "hero" &&
        card.linked_card &&
        card.linked_card.type_code === "alter_ego";

    const frontSource = isHeroWithAlterEgo ? card.linked_card : card;
    const backSource = isHeroWithAlterEgo ? card : null;

    const cardName = frontSource.name;
    const cardType = frontSource.type_name ?? "UNKNOWN";
    const cardCost = frontSource.cost ?? 0;

    const finalCard = {
        id: card.code,

        face: {
            front: {
                name: cardName,
                type: cardType,
                cost: cardCost,
                image: imageBaseUrl + frontSource.imagesrc,
                isHorizontal: isHorizontal(frontSource.type_name),
            },
        },
        isHorizontal: isHorizontal(frontSource.type_name),
        name: cardName,
        type: card.card_set_type_name_code === "nemesis" ? "Nemesis" : cardType,
        cost: cardCost,
        set: card.card_set_name ?? "UNKNOWN",
        pack: card.pack_name,

        traits: frontSource.traits
            ? frontSource.traits
                .split(".")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
    };

    if (isHeroWithAlterEgo) {
        finalCard.face.back = {
            name: backSource.name,
            type: backSource.type_name ?? "UNKNOWN",
            cost: backSource.cost ?? 0,
            image: imageBaseUrl + backSource.imagesrc,
            isHorizontal: isHorizontal(backSource.type_name),
        };

        removedAlterEgoCards[card.linked_card.code] = card.linked_card;
    } else if (card.double_sided) {
        finalCard.face.back = {
            name: card.back_name,
            type: cardType,
            cost: cardCost,
            image: imageBaseUrl + card.backimagesrc,
            isHorizontal: false,
        };
    }

    result[card.code] = finalCard;
}

// --- Passe finale : images des faces horizontales ---
// Pour chaque face (front/back) avec isHorizontal = true :
//   - si l'image existe déjà dans Images/Cards -> on remplace juste l'url
//   - sinon -> téléchargement, rotation -90°, sauvegarde, puis remplacement de l'url
async function processHorizontalImages(cardsResult) {
    fs.mkdirSync(imagesDir, { recursive: true });

    const facesToProcess = [];
    for (const card of Object.values(cardsResult)) {
        if (card.face.front.isHorizontal) {
            facesToProcess.push({ face: card.face.front, filename: `${card.id}.png` });
        }
        if (card.face.back?.isHorizontal) {
            facesToProcess.push({ face: card.face.back, filename: `${card.id}-back.png` });
        }
    }

    for (const { face, filename } of facesToProcess) {
        const localPath = path.join(imagesDir, filename);
        const newUrl = `${githubImageBaseUrl}/${filename}`;

        if (fs.existsSync(localPath)) {
            face.image = newUrl;
            continue;
        }

        try {
            const response = await fetch(face.image);
            if (!response.ok) {
                console.error(`✘ Échec du téléchargement (${response.status}) : ${face.image}`);
                continue;
            }
            const buffer = Buffer.from(await response.arrayBuffer());

            await sharp(buffer).rotate(-90).toFile(localPath);

            face.image = newUrl;
            console.log(`↻ ${filename}`);
        } catch (err) {
            console.error(`✘ Erreur sur ${filename} :`, err.message);
        }
    }
}

async function main() {
    await processHorizontalImages(result);

    fs.writeFileSync("./cards.json", JSON.stringify(result, null, 2), "utf8");

    console.log(`✔ ${Object.keys(result).length} cartes générées.`);
}

main();