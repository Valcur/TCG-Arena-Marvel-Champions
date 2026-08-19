async function placeBattlefields() {
  if (!game.isHost) return
  if (!cards?.Battlefields?.length > 0) {
    for (const card of cards?.Battlefields) {
      if (card.owner === game.playerId) {
        await functions.moveCard(card, "myBF2")
      }
    }
    await functions.repositionCards()
  }
}