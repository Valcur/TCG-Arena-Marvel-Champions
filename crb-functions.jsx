async function drawIfNewCookie() {
  const cookie1 = cards?.Cookie1?.length > 0 ? cards.Cookie1[0]?.id : null
  const cookie2 = cards?.Cookie2?.length > 0 ? cards.Cookie2[0]?.id : null
  const prevCookie1 = game.data.Scripts.lastCookie1
  const prevCookie2 = game.data.Scripts.lastCookie2
  if (cookie1 !== prevCookie1) {
    //const cookieData = functions.getCa
    await functions.draw(2, false, "HP1")
    game.data.Scripts.lastCookie1 = cookie1.id
  }
  if (cookie2 !== prevCookie2) {
    //const cookieData = functions.getCa
    await functions.draw(2, false, "HP2")
    game.data.Scripts.lastCookie2 = cookie2.id
  }
  await functions.repositionCards()
}