const fs = require("fs");

const cards = JSON.parse(fs.readFileSync("./db.json", "utf8"));
const imageBaseUrl = "https://marvelcdb.com"

const result = {};

for (const card of cards) {
    const cardName = card.name
    const cardType = card.type_name ?? "UNKNOWN"
    const cardCost = card.cost ?? 0
    result[card.code] = {
        id: card.code,

        face: {
            front: {
                name: cardName,
                type: cardType,
                cost: cardCost,
                image: imageBaseUrl + card.imagesrc,
                isHorizontal: false,
            },
        },

        name: cardName,
        type: cardType,
        cost: cardCost,

        pac: card.pack_name,

        traits: card.traits
            ? card.traits
                .split(".")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
    };
}

fs.writeFileSync(
    "./cards.json",
    JSON.stringify(result, null, 2),
    "utf8"
);

console.log(`✔ ${Object.keys(result).length} cartes générées.`);