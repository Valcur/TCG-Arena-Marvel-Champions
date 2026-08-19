async function drawIfNewCookie() {
  const cookie1 = cards?.Cookie1?.length > 0 ? cards.Cookie1[0]?.id : null
  const cookie2 = cards?.Cookie2?.length > 0 ? cards.Cookie2[0]?.id : null
  const prevCookie1 = game.data.Scripts.lastCookie1
  const prevCookie2 = game.data.Scripts.lastCookie2
  console.log(cards, functions, game.data.Scripts)
  if (cookie1 && cookie1 !== prevCookie1) {
    const cookie1Data = functions.getCardData(cookie1)
    console.log(cookie1Data)
    await functions.draw(cookie1Data?.HP ?? 2, false, "HP1")
    game.data.Scripts.lastCookie1 = cookie1.id
  }
  if (cookie2 && cookie2 !== prevCookie2) {
    const cookie2Data = functions.getCardData(cookie1)
    await functions.draw(cookie2Data?.HP ?? 2, false, "HP2")
    game.data.Scripts.lastCookie2 = cookie2.id
  }
}