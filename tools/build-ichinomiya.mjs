import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(toolDir, "..");
const siteRoot = path.join(workspace, "ichinomiya");
const associationBase = "https://ichinomiya.gr.jp/";
const currentListUrl = "http://ichinomiya-junpai.jp/alllist/";

const regions = [
  { id: "hokkaido", name: "北海道", short: "北", note: "北の大地から巡礼をはじめる。", prefectures: ["北海道"] },
  { id: "tohoku", name: "東北", short: "奥", note: "山々と古社を訪ねる北国の道。", prefectures: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"] },
  { id: "kanto", name: "関東", short: "東", note: "武蔵野から房総、相模へ。", prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"] },
  { id: "chubu", name: "中部", short: "中", note: "山岳と海辺を結ぶ一宮の道。", prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"] },
  { id: "kinki", name: "近畿", short: "畿", note: "畿内と熊野、伊勢をめぐる。", prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"] },
  { id: "chugoku", name: "中国", short: "西", note: "山陰と山陽の古社をたどる。", prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"] },
  { id: "shikoku", name: "四国", short: "四", note: "四つの国を結ぶ静かな巡礼。", prefectures: ["徳島県", "香川県", "愛媛県", "高知県"] },
  { id: "kyushu", name: "九州・沖縄", short: "南", note: "海を渡り南の一宮へ。", prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] }
];

function getBuffer(url, allowInvalidCertificate = false) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: !allowInvalidCertificate }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        resolve(getBuffer(new URL(response.headers.location, url).href, allowInvalidCertificate));
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`${url}: HTTP ${response.statusCode}`));
        response.resume();
        return;
      }
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([0-9a-f]+);/gi, (_, number) => String.fromCodePoint(Number.parseInt(number, 16)));
}

function text(value) {
  return decodeEntities(String(value || "").replace(/<br\s*\/?\s*>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeName(value) {
  return text(value)
    .normalize("NFKC")
    .replace(/[\s・･]/g, "")
    .replace(/[（）]/g, (character) => character === "（" ? "(" : ")")
    .replace(/神杜/g, "神社")
    .replace(/鹿兒島/g, "鹿児島")
    .replace(/氣/g, "気")
    .replace(/國/g, "国")
    .replace(/彌/g, "弥")
    .replace(/小國/g, "小国")
    .replace(/敢國/g, "敢国")
    .replace(/女體/g, "女体")
    .replace(/[鹽塩]竈/g, "塩竃")
    .replace(/籠/g, "篭")
    .replace(/素盞嗚/g, "素盞鳴")
    .replace(/嚴/g, "厳")
    .replace(/(?:與止|興止)/g, "与止");
}

function decodeAssociation(buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xfe) return new TextDecoder("utf-16le").decode(buffer);
  if (buffer[0] === 0xfe && buffer[1] === 0xff) return new TextDecoder("utf-16be").decode(buffer);
  return new TextDecoder("shift_jis").decode(buffer);
}

function field(row, label, ending = "<br") {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = row.match(new RegExp(`${escaped}：([\\s\\S]*?)${ending}`, "i"));
  return match ? text(match[1]) : "";
}

async function fetchCurrentList() {
  const html = await fetch(currentListUrl).then((response) => {
    if (!response.ok) throw new Error(`${currentListUrl}: HTTP ${response.status}`);
    return response.text();
  });
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  return rows.flatMap((match) => {
    const row = match[1];
    const nameMatch = row.match(/<b>([\s\S]*?)<\/b>/i);
    if (!nameMatch) return [];
    const linkMatch = row.match(/<a\s+href="([^"]+)"[^>]*>\s*<b>/i);
    return [{
      name: text(nameMatch[1]),
      address: field(row, "所在地"),
      access: field(row, "最寄り駅", "<\\/td"),
      deity: field(row, "祭神"),
      benefit: field(row, "御神徳", "<\\/td"),
      source: linkMatch ? new URL(linkMatch[1], currentListUrl).href : currentListUrl
    }];
  });
}

function parseAssociationDetail(id, html) {
  const name = text(html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1]);
  const provinceHeading = text(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
  const province = provinceHeading.replace(/\s*一の宮\s*$/u, "").trim();
  const postalMatch = html.match(/〒\s*(\d{3})[-ー―‐－]?(\d{3,4})/u);
  let address = "";
  const contactBlock = html.match(/<p1[^>]*>([\s\S]*?)<\/p1>/i)?.[1] || html.match(/<p1[^>]*>([\s\S]*?)<br\s*\/?\s*>/i)?.[1] || "";
  const contactLines = contactBlock.split(/<br\s*\/?\s*>/i).map(text).filter(Boolean);
  const postalLineIndex = contactLines.findIndex((line) => line.includes("〒"));
  if (postalLineIndex >= 0) {
    const sameLine = contactLines[postalLineIndex].replace(/〒\s*\d{3}[-ー―‐－]?\d{3,4}/u, "").trim();
    address = sameLine || contactLines.slice(postalLineIndex + 1).find((line) => !/^(TEL|FAX)/i.test(line)) || "";
  } else {
    address = contactLines.find((line) => /(?:都|道|府|県|市|区|郡).*(?:市|区|町|村|郡)/u.test(line) && !/^(TEL|FAX)/i.test(line)) || "";
  }
  return {
    id,
    name,
    province,
    postcode: postalMatch && postalMatch[2].length === 4 ? `${postalMatch[1]}${postalMatch[2]}` : "",
    address,
    source: `${associationBase}${id}.html`
  };
}

async function prefectureFor(postcode) {
  if (!postcode) return "";
  try {
    const result = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postcode}`).then((response) => response.json());
    return result.results?.[0]?.address1 || "";
  } catch {
    return "";
  }
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const indexHtml = new TextDecoder("utf-8").decode(await getBuffer(`${associationBase}index.html`, true));
const ids = [...new Set([...indexHtml.matchAll(/href="(\d{3})\.html"/gi)].map((match) => match[1]))]
  .sort((left, right) => Number(left) - Number(right));
const currentList = await fetchCurrentList();
const currentByName = new Map(currentList.map((item) => [normalizeName(item.name), item]));

const associationShrines = await mapLimit(ids, 8, async (id) => {
  const html = decodeAssociation(await getBuffer(`${associationBase}${id}.html`, true));
  return parseAssociationDetail(id, html);
});
const unmatchedCurrent = currentList.filter((item) => !associationShrines.some((shrine) => {
  const left = normalizeName(item.name);
  const right = normalizeName(shrine.name);
  return left === right || left.includes(right) || right.includes(left);
}));

const knownPrefectures = regions.flatMap((region) => region.prefectures);
const prefectures = await mapLimit(associationShrines, 4, (shrine) => {
  const fromAddress = knownPrefectures.find((prefecture) => shrine.address.includes(prefecture));
  return fromAddress || prefectureFor(shrine.postcode);
});
const prefectureOverrides = {
  "001": "京都府", "002": "京都府", "003": "奈良県", "004": "大阪府", "005": "大阪府",
  "006": "大阪府", "007": "大阪府", "011": "三重県", "014": "愛知県", "018": "静岡県",
  "023": "埼玉県", "030": "滋賀県", "033": "長野県", "035": "群馬県", "051": "新潟県",
  "067": "岡山県", "069": "岡山県", "083": "福岡県", "098": "北海道"
};
const addressOverrides = {
  "011": "志摩市磯部町上之郷374",
  "023": "さいたま市大宮区高鼻町1-407"
};
const baseShrines = associationShrines.map((shrine, index) => {
  const listing = currentByName.get(normalizeName(shrine.name)) || currentList.find((item) => {
    const left = normalizeName(item.name);
    const right = normalizeName(shrine.name);
    return left.includes(right) || right.includes(left);
  });
  const listingAddress = listing?.address || "";
  const associationAddress = shrine.address && shrine.address !== ">" ? shrine.address : "";
  const rawAddress = listingAddress || associationAddress || addressOverrides[shrine.id] || "";
  const prefecture = knownPrefectures.find((item) => rawAddress.includes(item)) || prefectures[index] || prefectureOverrides[shrine.id] || "";
  const region = regions.find((item) => item.prefectures.includes(prefecture))?.id || "kinki";
  const fullAddress = prefecture && !rawAddress.startsWith(prefecture) ? `${prefecture}${rawAddress}` : rawAddress;
  return {
    ...shrine,
    prefecture,
    region,
    address: fullAddress,
    access: listing?.access || "",
    deity: listing?.deity || "",
    benefit: listing?.benefit || "",
    currentSource: listing?.source || currentListUrl,
    map: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shrine.name} ${fullAddress}`)}`,
    photo: "",
    visited: false,
    worshipped: "",
    memo: ""
  };
});
const manualDetails = {
  "005": {
    deity: "日本武尊・大鳥連祖神",
    benefit: "勝運・開運・厄除け",
    currentSource: "https://www.ootoritaisha.jp/taisha/"
  },
  "043": {
    deity: "彦火火出見尊・豊玉姫命",
    benefit: "海上安全・海幸大漁・安産育児",
    currentSource: "https://wakasahiko-jinja.jp/aboutus/"
  },
  "075": {
    deity: "日前大神・國懸大神",
    benefit: "国家安泰・五穀豊穣",
    currentSource: "https://www.hinokuma-jingu.com/jingu.html"
  }
};
const shrines = baseShrines.map((shrine) => ({ ...shrine, ...(manualDetails[shrine.id] || {}) }));

for (const directory of [
  siteRoot,
  path.join(siteRoot, "assets", "css"),
  path.join(siteRoot, "assets", "js"),
  path.join(siteRoot, "assets", "images"),
  path.join(siteRoot, "assets", "photos"),
  path.join(siteRoot, "shrines")
]) fs.mkdirSync(directory, { recursive: true });

const data = {
  generatedAt: new Date().toISOString(),
  source: associationBase,
  currentListSource: currentListUrl,
  regions,
  shrines
};
fs.writeFileSync(
  path.join(siteRoot, "assets", "js", "data.js"),
  `/* 全国一の宮巡拝会・一の宮巡拝会の公開情報をもとに作成 */\nwindow.ICHINOMIYA_DATA = ${JSON.stringify(data, null, 2)};\n`,
  "utf8"
);

const collectionPath = path.join(siteRoot, "assets", "js", "my-collection.js");
let existing = {};
if (fs.existsSync(collectionPath)) {
  try {
    const context = { window: { ICHINOMIYA_DATA: { shrines: structuredClone(shrines) } } };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(collectionPath, "utf8"), context);
    existing = context.window.MY_ICHINOMIYA_COLLECTION || {};
  } catch {}
}
const collectionLines = [
  "/*",
  " * 自分で撮った写真と参拝記録は、このファイルだけを編集します。",
  " * 神社名・旧国名・都道府県名で検索し、photo と visited を書き換えてください。",
  " */",
  "window.MY_ICHINOMIYA_COLLECTION = {"
];
shrines.forEach((shrine, index) => {
  const saved = existing[shrine.id] || {};
  collectionLines.push(`  // ${shrine.prefecture}｜${shrine.province}｜${shrine.name}（ID: ${shrine.id}）`);
  collectionLines.push(`  ${JSON.stringify(shrine.id)}: {`);
  collectionLines.push(`    photo: ${JSON.stringify(typeof saved.photo === "string" ? saved.photo : "")},`);
  collectionLines.push(`    visited: ${JSON.stringify(saved.visited ?? false)},`);
  collectionLines.push(`    worshipped: ${JSON.stringify(typeof saved.worshipped === "string" ? saved.worshipped : "")},`);
  collectionLines.push(`    memo: ${JSON.stringify(typeof saved.memo === "string" ? saved.memo : "")}`);
  collectionLines.push(`  }${index < shrines.length - 1 ? "," : ""}`);
  collectionLines.push("");
});
collectionLines.push("};", "", "Object.entries(window.MY_ICHINOMIYA_COLLECTION).forEach(([id, record]) => {", "  const shrine = window.ICHINOMIYA_DATA.shrines.find((item) => item.id === id);", "  if (shrine) Object.assign(shrine, record);", "});", "");
fs.writeFileSync(collectionPath, collectionLines.join("\n"), "utf8");

function htmlPage({ title, description, page, base = "", shrineId = "" }) {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#642e28">
  <meta name="description" content="${description}">
  <title>${title}</title>${base ? `\n  <base href="${base}">` : ""}
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body data-page="${page}" data-site="ichinomiya"${shrineId ? ` data-shrine-id="${shrineId}"` : ""}>
  <a class="skip-link" href="#main">本文へ</a>
  <header class="site-header" data-site-header></header>
  <main id="main" data-page-root></main>
  <footer class="site-footer" data-site-footer></footer>
  <script src="assets/js/data.js"></script>
  <script src="assets/js/my-collection.js"></script>
  <script src="assets/js/app.js"></script>
</body>
</html>
`;
}

const rootPages = [
  ["index.html", "一宮巡礼帖", "全国の一宮をめぐり、御朱印と写真を残す自分だけの巡礼帖。", "cover"],
  ["map.html", "日本地図｜一宮巡礼帖", "日本地図から地方を選び、一宮巡礼を始めるページ。", "map"],
  ["list.html", "全国の一宮｜一宮巡礼帖", "全国の一宮を一覧で見るページ。", "list"],
  ["region.html", "地方の一宮｜一宮巡礼帖", "地方と旧国ごとに一宮を見るページ。", "region"],
  ["province.html", "旧国の一宮｜一宮巡礼帖", "旧国ごとの一宮と参拝記録を見るページ。", "province"]
];
for (const [filename, title, description, page] of rootPages) {
  fs.writeFileSync(path.join(siteRoot, filename), htmlPage({ title, description, page }), "utf8");
}
for (const shrine of shrines) {
  fs.writeFileSync(
    path.join(siteRoot, "shrines", `${shrine.id}.html`),
    htmlPage({
      title: `${shrine.name}｜一宮巡礼帖`,
      description: `${shrine.province}一の宮・${shrine.name}の写真と鎮座地を残す巡礼帖。`,
      page: "shrine",
      base: "../",
      shrineId: shrine.id
    }),
    "utf8"
  );
}

fs.writeFileSync(path.join(siteRoot, ".nojekyll"), "", "utf8");
console.log(`${shrines.length}社の一宮データと詳細ページを作成しました。`);
console.log(`現行一覧: ${currentList.length}社 / 照合: ${shrines.filter((shrine) => shrine.deity || shrine.benefit || shrine.access).length}社`);
if (unmatchedCurrent.length) console.log(`現行一覧のみ: ${unmatchedCurrent.map((item) => item.name).join("、")}`);
console.log(`御祭神の照合: ${shrines.filter((shrine) => shrine.deity).length}社`);
console.log(`都道府県の照合: ${shrines.filter((shrine) => shrine.prefecture).length}社`);
