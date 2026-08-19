async function placeBattlefields() {
  console.log("yo", game, cards)
  if (!game.isHost) return
  if (cards?.Battlefields?.length > 0) {
    for (const card of cards?.Battlefields) {
      if (card.owner === game.playerId) {
          console.log("yo success")
        await functions.moveCard(card, "myBF2")
      }
    }
    await functions.repositionCards()
  }
}