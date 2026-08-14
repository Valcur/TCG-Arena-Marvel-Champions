
function getVillainDeckTopCard() {
  //console.log(cards)
  //console.log("EncounterDeck:", cards?.EncounterDeck)
  const deck = cards?.EncounterDeck
  if (!deck || deck?.length === 0) return null
  return cards.EncounterDeck[cards.EncounterDeck.length - 1]
}

async function playVilainDeck() {
  const card = getVillainDeckTopCard()
  if (!card) return
  const cardData = await functions.getCardData(card)
  game.data.GameplayManager.boost = cardData.boost
  game.data.GameplayManager.star = cardData.star
  await functions.moveCard(card, "Revealed")
  await functions.repositionCards()
}

async function dealEncounter() {
  const card = getVillainDeckTopCard()
  if (!card) return
  const cardData = await functions.getCardData(card)
  const type = cardData?.face?.front?.type
  let destination = "Stack"
  if (type === "Minion") {
    destination = "EngagedEnemies"
  } else if (type === "Attachment") {
    destination = "VillainAttachments"
  } else if (type === "Side Scheme") {
    destination = "SideSchemes"
  }

  await functions.moveCard(card, destination)
  await functions.repositionCards()
}

// on cardUpdate
function displayedEngagedEnemiesValue() {
  const identityCard = card.Identity[0]
  if (!identityCard) return
  const face = identityCard.isFlipped ? "hero" : "alterego"
  // si je suis alterego: j'affiche le total scheme des minions sur moi, attque si je suis en héro
  if (face !== gameData.player.face) {

    gameData.player.face = face
    if (face === "hero") {

    } else {

    }
  }
}

// onCardEnter -> movecard, destintaion == ma section && destintaion !== original
function addedEngagedEnnemies(card) {
  const cardData = functions
}

// onCardLeave -> movecard, original == ma section && destintaion !== original

function turnEnd() {
  /*
  ✅ Place the amount of threat indicated in the main scheme’s acceleration field onto that scheme.
  If any acceleration icons or tokens are active, additional threat equal to the number of such icons and tokens is also placed at this time.
  -> manuel, on l'automatise pas

  The villain activates once per player. For each activation, any minions engaged with that player also activate.
  Deal one encounter card to each player. Deal one additional card for each hazard symbol on a card in play. 
  These additional cards are dealt in player order.
  Players reveal their dealt encounter cards. 
  The first player reveals each of their encounter cards, one card at a time, resolving each card based on its card type. 
  Each player repeats this process in player order, until no dealt encounter cards remain.
  -> bouton play top: montre la carte et affiche le nombre de boos jolimnet ou symbole etoile
  -> bouton send played cards to discard pour la fin de la phase (ou auto si on peut)
    -> on vide quand le bouton deal encounter cliqué par tous les joueurs ET stack vide
          OU au debut du tour en backup
  -> bouton deal encounter card to the clicking player:
        - Minion — When a minion is revealed, it enters play
        engaged with the player who revealed the card. Place
        the minion near that player to show that it is engaged. -> to engaged enemies of clicking player tapped
        - Treachery — When a treachery is revealed, resolve its
        effect and then place it in the encounter discard pile. -> to stack
        - Attachment — When an attachment is revealed, it
        enters play attached to the villain. -> nouvelle zone vilain attachement
        - Side Scheme — When a side scheme is revealed from
        the encounter deck, it enters play near the main scheme. -> to side schemes


  -> si je suis alterego: j'affiche le total scheme des minions sur moi, attque si je suis en héro

  Pass the first player token to the next clockwise player and end the round.*/
}

async function spawnDeck(decklist) {
  for (const category of decklist.categoriesOrder) {
    const cardsInCategory = decklist[category] || [];
    for (const card of cardsInCategory) {
      for (let i = 0; i < card.count; i++) {
        let targetSection = 'EncounterDeck'
        if (category === "Villain") {
          targetSection = "Villain"
        } else if (category === "Main Scheme") {
          targetSection = "MainScheme"
        }
        await functions.createCard(card.id, targetSection);
      }
    }
  }
}

async function iniVilainDeck() {
  await spawnDeck(villainDecks.rhino);
  await spawnDeck(encounterSets.standard);
  await spawnDeck(modularEncounterSets.bombScare);
  await functions.shuffleSection("EncounterDeck");
  await functions.repositionCards();
  game.data.GameplayManager.hp = 14 * game.turn.totalPlayers
  /*const card = cards.Villain[0]
const cardData = await functions.getCardData(card)
gamedata.villain.lifepoints = cardData.startingLifepoints*/
}


// all players have picked their deck
async function allPlayerReady() {
  if (game.isHost) {
    await iniVilainDeck()
  }
  for (const card of cards.Discard) {
    const cardData = await functions.getCardData(card)
    if (cardData.type === "Obligation") {
      card.owner = "UNOWNED"
      await functions.moveCard(card, "EncounterDeck")
      await functions.repositionCards();
    }
  }
  const identityCard = cards?.Identity?.[0]
  if (!identityCard) return
  const cardData = await functions.getCardData(identityCard)
  if (!cardData) return
  await functions.draw(cardData.handSize ?? 0)
  await functions.changeCounterValue(0, cardData.health ?? 0)
}

/*
FIN DE LA PHASE DES JOUEURS
Pour mettre fin à la phase des Joueurs, respectez les étapes
suivantes :
1. Dans l’ordre des joueurs, chaque joueur peut défausser n’importe quel nombre de cartes de sa main (et
doit défausser des cartes de sa main jusqu’à atteindre
sa taille de main s’il a plus de cartes en main que sa
taille de main).
2. Tous les joueurs piochent simultanément jusqu’à atteindre leur taille de main.
3. Tous les joueurs redressent simultanément toutes
leurs cartes. 
*/

/*
1. ✅Choisir les héros. Chaque joueur sélectionne un
héros et le place, face alter ego visible.

2. ✅Déterminer les points de vie. Chaque joueur sélectionne sur son compteur de points de vie le nombre de
points de vie de départ de son personnage, indiqué
en bas de sa carte Identité.

3. ✅Choisir le premier joueur. Les joueurs choisissent
collectivement le premier joueur et placent le pion
Premier Joueur en face de ce joueur.

4. ✅Mettre de côté les obligations. Mettez de côté la
carte Obligation de chaque héros joué.

5. ✅Mettre de côté les sets de Némésis. Pour chaque
héros joué, mettez de côté sa Némésis et les cartes
Rencontre de cette Némésis.

6. ✅Mélanger les decks des joueurs. Chaque joueur mélange son deck Joueur.

8. Choisir un méchant. Choisissez un méchant et
mettez en jeu son deck Méchant ainsi que son deck
Manigance Principale au centre de la zone de jeu.
-> Le joueur qui appuie sur play est le seul a avoir accès a la sélection du deck commun

9. ✅Déterminer les points de vie du méchant. Réglez
le compteur de points de vie du méchant à la valeur
indiquée sur sa carte Méchant.

10. Résoudre la mise en place de la manigance. Résolvez
toute instruction « Mise en place » sur la face 1A de
la carte Manigance Principale. Résolvez toute capacité « Une fois révélée » sur les cartes Rencontre qui
entrent en jeu lors de la mise en place.

11. Mélanger le deck Rencontre. Mélangez dans le deck
Rencontre du méchant les cartes Obligation mises de
côté lors de l’étape 4.
-> foreach -> movecard obligation section jsuque dans mechant deck

12. Piocher des cartes. Chaque joueur pioche des cartes
jusqu’à avoir en main un nombre de cartes égal à la
valeur de sa taille de main indiquée en bas de sa carte
Identité.
-> for reach + draw X de cardData.X

13. ✅Résoudre les mulligans. Chaque joueur peut défausser n’importe quel nombre de cartes de sa main et
piocher des cartes jusqu’à atteindre sa taille de main.
(Pour le moment, ne remélangez pas dans leurs decks
les cartes ainsi défaussées.)
-> A faire manuellement

14. ✅Résoudre les capacités de mise en place des personnages. Résolvez toute instruction « Mise en place »
inscrite sur les cartes Identité en jeu.
-> A faire manuellement
*/


const villain = {
  "rhino": {
    "name": "Rhino",
    "deck": "rhino"
  }
}

const villainDecks = {
  "rhino": {
    "categoriesOrder": [
      "Villain",
      "Main Scheme",
      "Attachment",
      "Minion",
      "Treachery",
      "Side Scheme"
    ],
    "Villain": [
      {
        "count": 1,
        "id": "01094"
      },
      {
        "count": 1,
        "id": "01095"
      },
      {
        "count": 1,
        "id": "01096"
      }
    ],
    "Main Scheme": [
      {
        "count": 1,
        "id": "01097a"
      }
    ],
    "Attachment": [
      {
        "count": 1,
        "id": "01098"
      },
      {
        "count": 2,
        "id": "01099"
      },
      {
        "count": 1,
        "id": "01100"
      }
    ],
    "Minion": [
      {
        "count": 2,
        "id": "01101"
      },
      {
        "count": 1,
        "id": "01102"
      },
      {
        "count": 1,
        "id": "01103"
      }
    ],
    "Treachery": [
      {
        "count": 2,
        "id": "01104"
      },
      {
        "count": 2,
        "id": "01105"
      },
      {
        "count": 3,
        "id": "01106"
      }
    ],
    "Side Scheme": [
      {
        "count": 1,
        "id": "01107"
      },
      {
        "count": 1,
        "id": "01108"
      }
    ]
  }
}

const encounterSets = {
  standard: {
    "categoriesOrder": [
      "Treachery"
    ],
    "Treachery": [
      {
        "count": 2,
        "id": "01186"
      },
      {
        "count": 2,
        "id": "01187"
      },
      {
        "count": 1,
        "id": "01188"
      },
      {
        "count": 1,
        "id": "01189"
      },
      {
        "count": 1,
        "id": "01190"
      }
    ]
  }
}

const modularEncounterSets = {
  "bombScare": {
    "categoriesOrder": [
      "Side Scheme",
      "Minion",
      "Treachery"
    ],
    "Side Scheme": [
      {
        "count": 1,
        "id": "01109"
      }
    ],
    "Minion": [
      {
        "count": 2,
        "id": "01110"
      }
    ],
    "Treachery": [
      {
        "count": 1,
        "id": "01111"
      },
      {
        "count": 2,
        "id": "01112"
      }
    ]
  }
}