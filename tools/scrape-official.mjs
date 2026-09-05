import { mkdir, writeFile } from "node:fs/promises";

const base = "https://local.pokemon.jp";
const prefectureIds = new Map([
  ["北海道", "hokkaido"], ["青森県", "aomori"], ["岩手県", "iwate"], ["宮城県", "miyagi"], ["秋田県", "akita"], ["山形県", "yamagata"], ["福島県", "fukushima"],
  ["茨城県", "ibaraki"], ["栃木県", "tochigi"], ["群馬県", "gunma"], ["埼玉県", "saitama"], ["千葉県", "chiba"], ["東京都", "tokyo"], ["神奈川県", "kanagawa"],
  ["新潟県", "niigata"], ["富山県", "toyama"], ["石川県", "ishikawa"], ["福井県", "fukui"], ["山梨県", "yamanashi"], ["長野県", "nagano"], ["岐阜県", "gifu"], ["静岡県", "shizuoka"], ["愛知県", "aichi"],
  ["三重県", "mie"], ["滋賀県", "shiga"], ["京都府", "kyoto"], ["大阪府", "osaka"], ["兵庫県", "hyogo"], ["奈良県", "nara"], ["和歌山県", "wakayama"],
  ["鳥取県", "tottori"], ["島根県", "shimane"], ["岡山県", "okayama"], ["広島県", "hiroshima"], ["山口県", "yamaguchi"],
  ["徳島県", "tokushima"], ["香川県", "kagawa"], ["愛媛県", "ehime"], ["高知県", "kochi"],
  ["福岡県", "fukuoka"], ["佐賀県", "saga"], ["長崎県", "nagasaki"], ["熊本県", "kumamoto"], ["大分県", "oita"], ["宮崎県", "miyazaki"], ["鹿児島県", "kagoshima"], ["沖縄県", "okinawa"]
]);

function decodeHtml(value = "") {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url, attempt = 1) {
  const response = await fetch(url, { headers: { "user-agent": "personal-pokefuta-stamp-book/1.0" } });
  if (!response.ok) {
    if (attempt < 4) {
      await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
      return fetchText(url, attempt + 1);
    }
    throw new Error(`${response.status} ${url}`);
  }
  return response.text();
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function match(html, pattern) {
  return html.match(pattern)?.[1] || "";
}

async function collectPrefectureSlugs() {
  const areaPages = await Promise.all([1, 2, 3, 4, 5, 6].map((id) => fetchText(`${base}/manhole/area/${id}/`)));
  return [...new Set(areaPages.flatMap((html) => [...html.matchAll(/\/manhole\/([a-z0-9-]+)\.html/g)].map((result) => result[1])))];
}

async function collectDetailIds(slugs) {
  const pages = await mapLimit(slugs, 8, async (slug) => fetchText(`${base}/manhole/${slug}.html`));
  return [...new Set(pages.flatMap((html) => [...html.matchAll(/\/manhole\/desc\/(\d+)\//g)].map((result) => result[1])))]
    .sort((a, b) => Number(a) - Number(b));
}

function parseDetail(id, html) {
  const heading = decodeHtml(match(html, /<div class="heading">[\s\S]*?<h1>([\s\S]*?)<\/h1>/));
  const address = decodeHtml(match(html, /<div class="block map">[\s\S]*?<h2>マンホール場所<\/h2>\s*<p>([\s\S]*?)<\/p>/));
  let [prefectureName = "", city = ""] = heading.split("/");
  if (!prefectureIds.has(prefectureName)) {
    prefectureName = [...prefectureIds.keys()].find((name) => address.includes(name)) || "";
    city = heading;
  }
  const prefecture = prefectureIds.get(prefectureName);
  if (!prefecture) throw new Error(`Unknown prefecture for ${id}: ${prefectureName}`);

  const officialMap = decodeHtml(match(html, /<div class="googlemap-link">\s*<a href="([^"]+)"/));
  const pokemon = [...html.matchAll(/zukan\.pokemon\.co\.jp\/detail\/\d+[^>]*>[\s\S]*?<span>([^<]+)<\/span>/g)]
    .map((result) => decodeHtml(result[1]));

  return {
    id,
    officialId: Number(id),
    prefecture,
    prefectureName,
    city,
    area: city,
    title: `${prefectureName}・${city}のポケふた`,
    address,
    pokemon,
    officialMap,
    source: `${base}/manhole/desc/${id}/`,
    photo: "",
    photographed: "",
    visited: false,
    memo: ""
  };
}

function detailPage(spot) {
  const title = spot.title.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#8b2f24">
  <meta name="description" content="${title}の写真と設置場所を残す旅帖。">
  <title>${title}｜蓋印旅帖</title>
  <base href="../">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body data-page="spot" data-spot-id="${spot.id}">
  <a class="skip-link" href="#main">本文へ</a>
  <header class="site-header" data-site-header></header>
  <main id="main" data-page-root></main>
  <footer class="site-footer" data-site-footer></footer>
  <script src="assets/js/data.js"></script>
  <script src="assets/js/official-spots.js"></script>
  <script src="assets/js/my-collection.js"></script>
  <script src="assets/js/app.js"></script>
</body>
</html>
`;
}

const slugs = await collectPrefectureSlugs();
const ids = await collectDetailIds(slugs);
const spots = await mapLimit(ids, 10, async (id, index) => {
  const html = await fetchText(`${base}/manhole/desc/${id}/?is_modal=1`);
  if ((index + 1) % 50 === 0) console.log(`Fetched ${index + 1}/${ids.length}`);
  return parseDetail(id, html);
});

const generatedAt = new Date().toISOString();
const js = `/* Generated from ${base}/manhole/ at ${generatedAt}. Do not edit by hand. */\nwindow.POKEFUTA_DATA.spots = ${JSON.stringify(spots, null, 2)};\nwindow.POKEFUTA_DATA.official = ${JSON.stringify({ source: `${base}/manhole/`, generatedAt, count: spots.length }, null, 2)};\n`;
await writeFile("assets/js/official-spots.js", js, "utf8");

await mkdir("spots", { recursive: true });
await mapLimit(spots, 20, (spot) => writeFile(`spots/${spot.id}.html`, detailPage(spot), "utf8"));

const counts = Object.fromEntries([...prefectureIds.values()].map((prefecture) => [prefecture, spots.filter((spot) => spot.prefecture === prefecture).length]));
console.log(JSON.stringify({ prefecturePages: slugs.length, detailPages: spots.length, counts }, null, 2));
