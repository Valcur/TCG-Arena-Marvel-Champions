async function drawIfNewCookie() {
  const cookie1 = cards?.Cookie1?.length > 0 ? cards.Cookie1[0] : null
  const cookie2 = cards?.Cookie2?.length > 0 ? cards.Cookie2[0] : null
  const prevCookie1 = game.data.Scripts.lastCookie1
  const prevCookie2 = game.data.Scripts.lastCookie2

  if (cookie1 && cookie1.id !== prevCookie1) {
    const cookie1Data = functions.getCardData(cookie1)
    await functions.draw(cookie1Data?.HP ?? 2, false, "HP1")
    game.data.Scripts.lastCookie1 = cookie1.id
  }

  if (cookie2 && cookie2.id !== prevCookie2) {
    const cookie2Data = functions.getCardData(cookie2)
    await functions.draw(cookie2Data?.HP ?? 2, false, "HP2")
    game.data.Scripts.lastCookie2 = cookie2.id
  }
}