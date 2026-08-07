const fs = require("fs");

const cards = JSON.parse(fs.readFileSync("./db.json", "utf8"));
const imageBaseUrl = "https://marvelcdb.com"


const result = {};

const removedAlterEgoCards = {}
const linkedCodes = new Set()

for (const card of cards) {
    if (
        card.type_code === "hero" &&
        card.linked_card &&
        card.linked_card.type_code === "alter_ego"
    ) {
        linkedCodes.add(card.linked_card.code)
    }
}

for (const card of cards) {
    if (linkedCodes.has(card.code)) continue

    const isHeroWithAlterEgo =
        card.type_code === "hero" &&
        card.linked_card &&
        card.linked_card.type_code === "alter_ego"

    const frontSource = isHeroWithAlterEgo ? card.linked_card : card
    const backSource = isHeroWithAlterEgo ? card : null

    const cardName = frontSource.name
    const cardType = frontSource.type_name ?? "UNKNOWN"
    const cardCost = frontSource.cost ?? 0

    const isHorizontal = (type) => {
        const normalized = String(type ?? "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

        return normalized === "side scheme" || normalized === "main scheme";
    };

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
        }

        removedAlterEgoCards[card.linked_card.code] = card.linked_card
    } else if (card.double_sided) {
        finalCard.face.back = {
            name: card.back_name,
            type: cardType,
            cost: cardCost,
            image: imageBaseUrl + card.backimagesrc,
            isHorizontal: false,
        }
    }

    result[card.code] = finalCard
}

fs.writeFileSync(
    "./cards.json",
    JSON.stringify(result, null, 2),
    "utf8"
);

console.log(`✔ ${Object.keys(result).length} cartes générées.`);