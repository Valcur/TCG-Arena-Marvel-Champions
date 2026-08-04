function gameStart() {
  players.forEach(p => {
    moveCard("evictoin", "deck")
  });
}

function turnEnd() {
  /*
  Place the amount of threat indicated in the main scheme’s acceleration field onto that scheme.
  If any acceleration icons or tokens are active, additional threat equal to the number of such icons and tokens is also placed at this time.


  The villain activates once per player. For each activation, any minions engaged with that player also activate.
  Deal one encounter card to each player. Deal one additional card for each hazard symbol on a card in play. 
  These additional cards are dealt in player order.
  Players reveal their dealt encounter cards. 
  The first player reveals each of their encounter cards, one card at a time, resolving each card based on its card type. 
  Each player repeats this process in player order, until no dealt encounter cards remain.
  
  Pass the first player token to the next clockwise player and end the round.*/
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

4. Mettre de côté les obligations. Mettez de côté la
carte Obligation de chaque héros joué.

5. Mettre de côté les sets de Némésis. Pour chaque
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