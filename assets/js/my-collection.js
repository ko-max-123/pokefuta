/*
 * 自分の写真・訪問記録はこのファイルだけを編集します。
 * IDは公式詳細URL末尾の数字です。写真は assets/photos に置いてください。
 *
 * 記入例:
 * "474": {
 *   photo: "assets/photos/pokefuta-474.jpg",
 *   visited: true,
 *   photographed: "2026年9月5日",
 *   memo: "海岸公園を散歩した日。"
 * }
 */
window.MY_POKEFUTA_COLLECTION = {
};

Object.entries(window.MY_POKEFUTA_COLLECTION).forEach(([id, record]) => {
  const spot = window.POKEFUTA_DATA.spots.find((item) => item.id === id);
  if (spot) Object.assign(spot, record);
});
