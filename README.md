# 三冊の旅帖

ポケフタ、一宮、都道府県の三冊から開く帳面を選び、自分の旅の記録を見る静的Webサイトです。外部ライブラリやビルド作業は不要で、GitHub Pagesへそのまま公開できます。

## ページ構成

- `index.html` — 三冊の旅帖を選ぶ目次
- `pokefuta.html` — ポケフタ帳の表紙
- `map.html` — 日本地図から地域を選ぶ入口
- `list.html` — 全国一覧
- `region.html?region=tohoku` — 地域詳細
- `prefecture.html?pref=miyagi` — 都道府県別一覧
- `spots/474.html` — 写真・場所・訪問印を表示する個別詳細
- `ichinomiya/index.html` — 一宮巡礼帖
- `todofuken/index.html` — 都道府県訪問帖

## 写真を入れる

1. 撮影した写真を `assets/photos` に置きます。
2. `assets/js/my-collection.js` を開き、該当する蓋の `photo` に写真パスを指定します。

```js
"474": {
  photo: "assets/photos/pokefuta-474.jpg",
  visited: true,
  photographed: "2026年9月5日"
}
```

写真がまだない項目には「写真はまだありません」と表示されます。アップロード機能はありません。

## 公式情報を更新する

`node tools/scrape-official.mjs` を実行すると、公式サイトから設置情報を再取得し、`assets/js/official-spots.js` と各詳細ページを更新します。自分の写真・訪問記録は `my-collection.js` に分離されているため上書きされません。

## GitHub Pagesで公開する

リポジトリの Settings → Pages を開き、公開元を `main` ブランチの `/ (root)` にします。数分後、発行されたURLから閲覧できます。

## 権利表記について

このサイトは個人の旅・撮影記録用の非公式テンプレートです。公開時は、写真や名称などの利用条件を確認し、必要に応じて権利表記を追記してください。
