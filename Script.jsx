const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const imageBaseUrl = "https://marvelcdb.com";
const githubImageBaseUrl = "https://valcur.github.io/TCG-Arena-Marvel-Champions/Images/Cards";
const imagesDir = path.join(__dirname, "Images", "Cards");

const cards = JSON.parse(fs.readFileSync("./db.json", "utf8"));

const result = {};

const removedLinkedCards = {};
const linkedCodes = new Set();

const isHorizontal = (type) => {
    return ["Side Scheme", "Main Scheme"].includes(type);
};

// Une carte a une "autre face" à fusionner dans le même objet final :
// - hero <-> alter_ego (identité)
// - main_scheme <-> main_scheme (recto/verso du même scheme, ex: 01097a -> linked_card 01097b)
const hasLinkedFace = (card) => {
    if (!card.linked_card) return false;
    if (card.type_code === "hero" && card.linked_card.type_code === "alter_ego") return true;
    if (card.type_code === "main_scheme" && card.linked_card.type_code === "main_scheme") return true;
    return false;
};

// Pour un code de type "01097a", retourne le code de base "01097" (celui de
// l'ancienne entrée "combo" double_sided qui existe parfois en plus de la
// paire a/b dans le db). Retourne null si le code ne se termine pas par une lettre.
const mainSchemeBaseCode = (code) => {
    const match = code.match(/^(.+?)[a-z]$/i);
    return match ? match[1] : null;
};

// Certains main scheme existent 2x dans le db : une entrée "combo"
// historique (double_sided: true, sans linked_card, ex: code "01097", avec
// imagesrc + backimagesrc) ET la paire scindée a/b (code "01097a" + son
// linked_card "01097b", chacun avec des stats par stage plus précises mais
// pas toujours sa propre image). On garde la paire a/b comme source de
// données, on ignore la combo comme carte indépendante (pour ne pas avoir
// 2x la même carte dans le résultat), mais on la garde sous la main comme
// repli pour les images manquantes.
const mainSchemeComboByBase = new Map();
const supersededMainSchemeBases = new Set();

for (const card of cards) {
    if (card.type_code !== "main_scheme") continue;

    if (card.double_sided && !card.linked_card) {
        mainSchemeComboByBase.set(card.code, card);
    }

    if (card.linked_card && card.linked_card.type_code === "main_scheme") {
        const base = mainSchemeBaseCode(card.code);
        if (base) supersededMainSchemeBases.add(base);
    }
}

// Repère les codes des cartes qui seront "avalées" comme face liée d'une
// autre carte, pour ne pas les traiter une 2e fois comme carte indépendante.
// Le check `linkedCodes.has(card.code)` protège du cas où le lien serait
// bidirectionnel (main_scheme <-> main_scheme : les 2 entrées peuvent
// chacune pointer sur l'autre) : la 1ère carte rencontrée dans le tableau
// "réclame" son lien, la 2e (déjà réclamée) est ignorée pour éviter que les
// 2 faces s'annulent mutuellement.
for (const card of cards) {
    if (!hasLinkedFace(card)) continue;
    if (linkedCodes.has(card.code)) continue;
    linkedCodes.add(card.linked_card.code);
}

// Résout l'image d'une face, avec repli sur la combo main scheme (voir
// ci-dessus) si l'entrée a/b n'a pas sa propre imagesrc/backimagesrc.
const resolveImageSrc = (source, fallbackSrc) => source.imagesrc || fallbackSrc || null;

// --- Construction des cartes ---
for (const card of cards) {
    if (linkedCodes.has(card.code)) continue;
    if (
        card.type_code === "main_scheme" &&
        !card.linked_card &&
        supersededMainSchemeBases.has(card.code)
    ) continue;

    const isLinked = hasLinkedFace(card);
    const isMainSchemeLink = isLinked && card.type_code === "main_scheme";
    const combo = isMainSchemeLink
        ? mainSchemeComboByBase.get(mainSchemeBaseCode(card.code))
        : null;

    // l'autre face (linked_card) passe en front, la carte elle-même en back
    const frontSource = isLinked ? card.linked_card : card;
    const backSource = isLinked ? card : null;

    // pour une paire main scheme, la combo fournit imagesrc (~ face "a")
    // et backimagesrc (~ face "b") en repli si l'entrée scindée n'a pas
    // sa propre image
    const frontImageSrc = resolveImageSrc(frontSource, combo?.backimagesrc);
    const backImageSrc = backSource ? resolveImageSrc(backSource, combo?.imagesrc) : null;

    if (!frontImageSrc) {
        console.warn(`⚠ Image manquante (front) pour ${card.code}`);
    }
    if (backSource && !backImageSrc) {
        console.warn(`⚠ Image manquante (back) pour ${card.code}`);
    }

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
                image: frontImageSrc ? imageBaseUrl + frontImageSrc : null,
                isHorizontal: isHorizontal(frontSource.type_name),
            },
        },
        isHorizontal: isHorizontal(frontSource.type_name),
        name: cardName,
        type: card.card_set_type_name_code === "nemesis" ? "Nemesis" : cardType,
        cost: cardCost,
        set: card.card_set_name ?? "UNKNOWN",
        pack: card.pack_name,
        boost: card.boost ?? 0,
        star: card.boost_star === true,

        traits: frontSource.traits
            ? frontSource.traits
                .split(".")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
    };

    if (isLinked) {
        finalCard.face.back = {
            name: backSource.name,
            type: backSource.type_name ?? "UNKNOWN",
            cost: backSource.cost ?? 0,
            image: backImageSrc ? imageBaseUrl + backImageSrc : null,
            isHorizontal: isHorizontal(backSource.type_name),
        };

        removedLinkedCards[card.linked_card.code] = card.linked_card;
    } else if (card.double_sided) {
        finalCard.face.back = {
            name: card.back_name,
            type: cardType,
            cost: cardCost,
            image: card.backimagesrc ? imageBaseUrl + card.backimagesrc : null,
            isHorizontal: false,
        };
    }

    result[card.code] = finalCard;
}

// --- Passe finale : images des faces horizontales ---
// Pour chaque face (front/back) avec isHorizontal = true et une image
// valide :
//   - si l'image existe déjà dans Images/Cards -> on remplace juste l'url
//   - sinon -> téléchargement, rotation -90°, sauvegarde, puis remplacement de l'url
async function processHorizontalImages(cardsResult) {
    fs.mkdirSync(imagesDir, { recursive: true });

    const facesToProcess = [];
    for (const card of Object.values(cardsResult)) {
        if (card.face.front.isHorizontal && card.face.front.image) {
            facesToProcess.push({ face: card.face.front, filename: `${card.id}.png` });
        }
        if (card.face.back?.isHorizontal && card.face.back.image) {
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