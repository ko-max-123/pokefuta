# 一宮巡礼帖

全国の一宮を旧国・地方ごとに巡り、自分で撮った写真と参拝日を残す静的サイトです。

## 写真と参拝記録

1. 写真を `assets/photos` に置きます。
2. `assets/js/my-collection.js` を神社名で検索します。
3. 該当する欄へ写真の相対パスと参拝情報を書きます。

```js
"001": {
  photo: "assets/photos/ichinomiya-001.jpg",
  visited: true,
  worshipped: "2026年9月8日",
  memo: "御朱印をいただいた日。"
}
```

先頭に `/` を付けない相対パスなので、GitHub Pagesのプロジェクトページでも利用できます。

## 情報源

- 全国一の宮巡拝会: https://ichinomiya.gr.jp/
- 一の宮巡拝会「全国の一の宮」: http://ichinomiya-junpai.jp/alllist/

一宮の呼称や論社には複数の考え方があります。このサイトでは全国一の宮巡拝会の公開ページ103社を基準にしています。
