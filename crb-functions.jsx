async function drawIfNewCookie() {
  const cookie1 = cards?.Cookie1?.length > 0 ? cards.Cookie1[0] : null
  const cookie2 = cards?.Cookie2?.length > 0 ? cards.Cookie2[0] : null
  const prevCookie1 = game.data.Scripts.lastCookie1
  const prevCookie2 = game.data.Scripts.lastCookie2

  if (cookie1 && cookie1.id !== prevCookie1 && (cards?.HP2?.length ?? 0) === 0) {
    const cookie1Data = functions.getCardData(cookie1)
    //const hp1ToDraw = cookie1Data?.hp ?? 0
    const hp1ToDraw = cookie1Data?.face?.front?.hp ?? 2
    await functions.draw(hp1ToDraw, false, "HP1")
    game.data.Scripts.lastCookie1 = cookie1.id
  }

  if (cookie2 && cookie2.id !== prevCookie2 && (cards?.HP1?.length ?? 0) === 0) {
    const cookie2Data = functions.getCardData(cookie2)
    //const hp2ToDraw = cookie2Data?.hp ?? 0
    const hp2ToDraw = cookie2Data?.face?.front?.hp ?? 2
    await functions.draw(hp2ToDraw, false, "HP2")
    game.data.Scripts.lastCookie2 = cookie2.id
  }
}