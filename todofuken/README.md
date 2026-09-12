# 都道府県訪問帖

訪れた市・町・村を写真と訪問日とともに見る、閲覧専用の静的サイトです。

## GitHub Pagesで記録を共有する

表示する訪問先は `assets/js/my-places.js` に書きます。写真は `assets/photos` に置き、先頭に `/` を付けない相対パスで指定します。

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

ブラウザ上の投稿・編集・削除・写真アップロード機能はありません。
