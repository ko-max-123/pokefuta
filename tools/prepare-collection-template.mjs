import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(toolDir, "..");
const officialPath = path.join(rootDir, "assets", "js", "official-spots.js");
const collectionPath = path.join(rootDir, "assets", "js", "my-collection.js");

const context = { window: { POKEFUTA_DATA: {} } };
vm.createContext(context);
vm.runInContext(fs.readFileSync(officialPath, "utf8"), context, { filename: officialPath });
vm.runInContext(fs.readFileSync(collectionPath, "utf8"), context, { filename: collectionPath });

const spots = context.window.POKEFUTA_DATA.spots;
const current = context.window.MY_POKEFUTA_COLLECTION || {};
const clean = (value) => String(value || "").replace(/[\r\n]+/g, " ").trim();

const lines = [
  "/*",
  " * 全ポケふた分の写真・訪問記録欄です。",
  " * 都道府県名、市区町村名、設置場所名、ポケモン名で検索できます。",
  " * 写真は assets/photos に置き、該当するIDの photo を書き換えてください。",
  " * 訪問数へ反映する場合は visited を true にします。",
  " */",
  "window.MY_POKEFUTA_COLLECTION = {"
];

spots.forEach((spot, index) => {
  const saved = current[spot.id] || {};
  const place = [spot.prefectureName, spot.city, spot.area].map(clean).filter(Boolean).join("｜");
  const pokemon = Array.isArray(spot.pokemon) ? spot.pokemon.map(clean).filter(Boolean).join("・") : "";
  const label = pokemon ? `${place}｜${pokemon}` : place;
  lines.push(`  // ${label}（ID: ${spot.id}）`);
  lines.push(`  ${JSON.stringify(spot.id)}: {`);
  lines.push(`    photo: ${JSON.stringify(typeof saved.photo === "string" ? saved.photo : "")},`);
  lines.push(`    visited: ${JSON.stringify(saved.visited ?? false)},`);
  lines.push(`    photographed: ${JSON.stringify(typeof saved.photographed === "string" ? saved.photographed : "")},`);
  lines.push(`    memo: ${JSON.stringify(typeof saved.memo === "string" ? saved.memo : "")}`);
  lines.push(`  }${index < spots.length - 1 ? "," : ""}`);
  lines.push("");
});

lines.push("};");
lines.push("");
lines.push("Object.entries(window.MY_POKEFUTA_COLLECTION).forEach(([id, record]) => {");
lines.push("  const spot = window.POKEFUTA_DATA.spots.find((item) => item.id === id);");
lines.push("  if (spot) Object.assign(spot, record);");
lines.push("});");
lines.push("");

fs.writeFileSync(collectionPath, lines.join("\n"), "utf8");
console.log(`${spots.length}件分の記入欄を用意しました。`);
