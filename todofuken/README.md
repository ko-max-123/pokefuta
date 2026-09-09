# 都道府県訪問帖

訪れた市・町・村を自分で追加し、写真と訪問日を残す静的サイトです。

## ブラウザから記録する

`index.html` を開き、日本地図から都道府県を選びます。「市・町・村を記録する」から入力した内容は、その端末のブラウザに保存されます。

## GitHub Pagesで記録を共有する

複数の端末で同じ記録を見る場合は、`assets/js/my-places.js` に訪問先を書きます。写真は `assets/photos` に置き、先頭に `/` を付けない相対パスで指定します。

```js
window.MY_TODOFUKEN_VISITS = [
  {
    id: "kanagawa-yokohama",
    prefecture: "神奈川県",
    municipality: "横浜市",
    visitedOn: "2026-09-09",
    photo: "assets/photos/kanagawa-yokohama.jpg",
    memo: "港を歩いた日。"
  }
];
```

ブラウザからの写真アップロード機能はありません。
