(function () {
  "use strict";

  const data = window.TODOFUKEN_DATA;
  const sourcePlaces = Array.isArray(window.MY_TODOFUKEN_VISITS) ? window.MY_TODOFUKEN_VISITS : [];
  const page = document.body.dataset.page;
  const root = document.querySelector("[data-page-root]");
  const query = new URLSearchParams(window.location.search);
  const storageKey = "todofuken-visit-book-places-v1";

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function readLocalPlaces() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveLocalPlaces(places) {
    localStorage.setItem(storageKey, JSON.stringify(places));
  }

  function normalizePlace(place, origin) {
    return {
      id: String(place.id || ""),
      prefecture: String(place.prefecture || ""),
      municipality: String(place.municipality || ""),
      visitedOn: String(place.visitedOn || ""),
      photo: String(place.photo || ""),
      memo: String(place.memo || ""),
      origin
    };
  }

  function getPlaces() {
    const byId = new Map();
    sourcePlaces.map((item) => normalizePlace(item, "source")).forEach((item) => byId.set(item.id, item));
    readLocalPlaces().map((item) => normalizePlace(item, "local")).forEach((item) => byId.set(item.id, item));
    return [...byId.values()].filter((item) => item.id && item.prefecture && item.municipality);
  }

  function allPrefectures() {
    return data.regions.flatMap((region) => region.prefectures);
  }

  function selectedPrefecture() {
    const requested = query.get("pref");
    return allPrefectures().includes(requested) ? requested : "東京都";
  }

  function pageShell(content, extraClass = "") {
    return `<div id="top" class="page-shell ${extraClass}"><span class="binding" aria-hidden="true"></span>${content}</div>`;
  }

  function folioHeading({ number, eyebrow, title, intro, backHref, backLabel, seal }) {
    return `
      <header class="folio-head">
        <a class="folio-back" href="${backHref}">← ${escapeHtml(backLabel)}</a>
        <div class="folio-title-row">
          <div>
            <p class="folio-number">第 ${escapeHtml(number)} 頁</p>
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <h1>${escapeHtml(title)}</h1>
            <p class="page-intro">${escapeHtml(intro)}</p>
          </div>
          <span class="page-seal" aria-hidden="true">${escapeHtml(seal)}</span>
        </div>
      </header>`;
  }

  function formatDate(date) {
    const match = String(date || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${Number(match[1])}年${Number(match[2])}月${Number(match[3])}日` : String(date || "");
  }

  function photoFrame(place, detail = false) {
    const filename = place.photo ? place.photo.split("/").pop() : `${place.prefecture}-${place.municipality}.jpg`;
    return `
      <div class="photo-frame ${detail ? "photo-large" : ""}">
        <span class="photo-empty"><b>写真はまだありません</b><small>${escapeHtml(filename)}</small></span>
        ${place.photo ? `<img data-photo src="${escapeHtml(place.photo)}" alt="${escapeHtml(place.municipality)}の訪問写真">` : ""}
      </div>`;
  }

  function placeCard(place) {
    return `
      <article class="place-card">
        <a href="place.html?id=${encodeURIComponent(place.id)}">
          ${photoFrame(place)}
          <div class="place-card-copy">
            <p>${escapeHtml(place.prefecture)}</p>
            <h2>${escapeHtml(place.municipality)}</h2>
            <time datetime="${escapeHtml(place.visitedOn)}">${place.visitedOn ? `${escapeHtml(formatDate(place.visitedOn))} 訪問` : "訪問日未記入"}</time>
          </div>
        </a>
      </article>`;
  }

  function bindPhotoFallbacks() {
    root.querySelectorAll("img[data-photo]").forEach((img) => {
      const frame = img.closest(".photo-frame");
      const loaded = () => frame?.classList.add("has-photo");
      const missing = () => { img.remove(); frame?.classList.add("is-missing"); };
      img.addEventListener("load", loaded, { once: true });
      img.addEventListener("error", missing, { once: true });
      if (img.complete) img.naturalWidth ? loaded() : missing();
    });
  }

  function renderCover() {
    const places = getPlaces();
    const prefectures = new Set(places.map((item) => item.prefecture)).size;
    root.innerHTML = `
      <section class="cover-stage">
        <a class="book-cover" href="map.html" aria-label="都道府県訪問帖をひらく">
          <span class="cover-binding" aria-hidden="true"></span>
          <span class="cover-corner top" aria-hidden="true"></span>
          <span class="cover-corner bottom" aria-hidden="true"></span>
          <span class="cover-label"><small>にほんをあるく</small><strong>都道府県<br>訪問帖</strong><i aria-hidden="true">旅</i></span>
          <span class="cover-record">${prefectures}都道府県・${places.length}市町村</span>
        </a>
        <a class="cover-open" href="map.html">表紙をひらく <span aria-hidden="true">›</span></a>
      </section>`;
  }

  function renderMap() {
    const places = getPlaces();
    const visited = new Set(places.map((item) => item.prefecture));
    root.innerHTML = pageShell(`
      <article class="folio-page">
        ${folioHeading({ number: "一", eyebrow: "旅の目次", title: "日本を巡る", intro: `47都道府県のうち、${visited.size}都道府県を記録。`, backHref: "index.html", backLabel: "表紙", seal: "旅" })}
        <section class="map-spread">
          <figure class="map-sheet">
            <div class="map-graphic">
              <img src="../assets/images/japan-regions-blank.svg" alt="地方ごとに色分けした日本地図" width="570" height="755">
              ${data.regions.map((region) => `<a class="map-hit map-hit-${region.id}" href="region.html?region=${region.id}">${escapeHtml(region.name)}</a>`).join("")}
            </div>
            <figcaption>地方を押して、都道府県を選ぶ。</figcaption>
          </figure>
          <nav class="region-index" aria-label="地方を選択">
            <p class="region-index-title">地方目次</p>
            ${data.regions.map((region, index) => {
              const count = region.prefectures.filter((prefecture) => visited.has(prefecture)).length;
              return `<a href="region.html?region=${region.id}"><span>${["壱", "弐", "参", "四", "五", "六", "七", "八"][index]}</span><strong>${escapeHtml(region.name)}</strong><small>${count} / ${region.prefectures.length}</small></a>`;
            }).join("")}
          </nav>
        </section>
      </article>`, "book-page");
  }

  function renderRegion() {
    const region = data.regions.find((item) => item.id === query.get("region")) || data.regions[0];
    const places = getPlaces();
    const visited = new Set(places.map((item) => item.prefecture));
    document.title = `${region.name}｜都道府県訪問帖`;
    root.innerHTML = pageShell(`
      <article class="folio-page">
        ${folioHeading({ number: "二", eyebrow: "都道府県を選ぶ", title: region.name, intro: `${region.prefectures.length}都道府県のうち、${region.prefectures.filter((item) => visited.has(item)).length}都道府県を記録。`, backHref: "map.html", backLabel: "日本地図", seal: region.mark })}
        <section class="folio-body">
          <div class="prefecture-grid">
            ${region.prefectures.map((prefecture) => {
              const count = places.filter((item) => item.prefecture === prefecture).length;
              return `<a class="prefecture-ticket ${count ? "has-record" : ""}" href="prefecture.html?pref=${encodeURIComponent(prefecture)}"><strong>${escapeHtml(prefecture)}</strong><span>${count ? `${count}市町村` : "未記録"}</span></a>`;
            }).join("")}
          </div>
        </section>
      </article>`, "book-page");
  }

  function renderPrefecture() {
    const prefecture = selectedPrefecture();
    const region = data.regions.find((item) => item.prefectures.includes(prefecture));
    const places = getPlaces().filter((item) => item.prefecture === prefecture);
    document.title = `${prefecture}｜都道府県訪問帖`;
    root.innerHTML = pageShell(`
      <article class="folio-page">
        ${folioHeading({ number: "三", eyebrow: "訪ねた市町村", title: prefecture, intro: places.length ? `${places.length}市町村の記憶を綴じています。` : "まだ訪問先は記録されていません。", backHref: `region.html?region=${region.id}`, backLabel: region.name, seal: "訪" })}
        <section class="folio-body">
          <a class="add-ticket" href="add.html?pref=${encodeURIComponent(prefecture)}"><span aria-hidden="true">＋</span>${escapeHtml(prefecture)}の市・町・村を記録する</a>
          <div class="place-grid">${places.length ? places.map(placeCard).join("") : `<p class="empty-note">最初の市・町・村を記録すると、ここに写真札が並びます。</p>`}</div>
        </section>
      </article>`, "book-page");
  }

  function prefectureOptions(selected) {
    return data.regions.map((region) => `<optgroup label="${escapeHtml(region.name)}">${region.prefectures.map((prefecture) => `<option value="${escapeHtml(prefecture)}" ${prefecture === selected ? "selected" : ""}>${escapeHtml(prefecture)}</option>`).join("")}</optgroup>`).join("");
  }

  function renderAdd() {
    const id = query.get("id");
    const localPlaces = readLocalPlaces();
    const editing = id ? localPlaces.find((item) => item.id === id) : null;
    const prefecture = editing?.prefecture || selectedPrefecture();
    document.title = `${editing ? "記録を直す" : "市町村を記録する"}｜都道府県訪問帖`;
    root.innerHTML = pageShell(`
      <article class="folio-page form-page">
        ${folioHeading({ number: "四", eyebrow: "旅の記録", title: editing ? "記録を直す" : "市町村を記す", intro: "入力した内容は、この端末のブラウザに保存されます。", backHref: `prefecture.html?pref=${encodeURIComponent(prefecture)}`, backLabel: prefecture, seal: "記" })}
        <section class="folio-body">
          <form id="place-form" class="entry-form">
            <label><span>都道府県</span><select name="prefecture" required>${prefectureOptions(prefecture)}</select></label>
            <label><span>市・町・村の名前</span><input name="municipality" value="${escapeHtml(editing?.municipality)}" placeholder="例：横浜市" required autocomplete="off"></label>
            <label><span>訪問日</span><input name="visitedOn" type="date" value="${escapeHtml(editing?.visitedOn)}"></label>
            <label><span>写真の相対パス</span><input name="photo" value="${escapeHtml(editing?.photo)}" placeholder="assets/photos/kanagawa-yokohama.jpg" inputmode="url"></label>
            <label class="wide"><span>ひとこと</span><textarea name="memo" rows="5" placeholder="この町で覚えておきたいこと">${escapeHtml(editing?.memo)}</textarea></label>
            <div class="form-actions wide">
              <button class="ink-button" type="submit">${editing ? "記録を書き直す" : "訪問帖に綴じる"}</button>
              ${editing ? `<button class="text-button danger" id="delete-place" type="button">この記録を削除する</button>` : ""}
            </div>
            <p class="storage-note wide">写真ファイルのアップロードは行いません。写真を <code>todofuken/assets/photos</code> に置いて、上の欄へ相対パスを入力してください。端末をまたいで表示したい記録は <code>assets/js/my-places.js</code> に書きます。</p>
          </form>
        </section>
      </article>`, "book-page");

    document.getElementById("place-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const municipality = String(form.get("municipality") || "").trim();
      const selected = String(form.get("prefecture") || "");
      if (!municipality || !allPrefectures().includes(selected)) return;
      const record = {
        id: editing?.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        prefecture: selected,
        municipality,
        visitedOn: String(form.get("visitedOn") || ""),
        photo: String(form.get("photo") || "").trim(),
        memo: String(form.get("memo") || "").trim()
      };
      const next = localPlaces.filter((item) => item.id !== record.id);
      next.push(record);
      saveLocalPlaces(next);
      window.location.href = `prefecture.html?pref=${encodeURIComponent(selected)}`;
    });

    document.getElementById("delete-place")?.addEventListener("click", () => {
      if (!window.confirm(`${editing.municipality}の記録を削除しますか？`)) return;
      saveLocalPlaces(localPlaces.filter((item) => item.id !== editing.id));
      window.location.href = `prefecture.html?pref=${encodeURIComponent(editing.prefecture)}`;
    });
  }

  function renderPlace() {
    const place = getPlaces().find((item) => item.id === query.get("id"));
    if (!place) {
      root.innerHTML = pageShell(`<article class="missing-page"><p>この記録は見つかりませんでした。</p><a href="map.html">日本地図へ戻る</a></article>`, "book-page");
      return;
    }
    document.title = `${place.municipality}｜都道府県訪問帖`;
    root.innerHTML = pageShell(`
      <article class="place-detail">
        <div class="detail-photo">
          <a class="folio-back" href="prefecture.html?pref=${encodeURIComponent(place.prefecture)}">← ${escapeHtml(place.prefecture)}</a>
          <span class="photo-tape" aria-hidden="true"></span>
          ${photoFrame(place, true)}
        </div>
        <div class="detail-copy">
          <p class="eyebrow">${escapeHtml(place.prefecture)}の訪問記録</p>
          <h1>${escapeHtml(place.municipality)}</h1>
          ${place.visitedOn ? `<time datetime="${escapeHtml(place.visitedOn)}">${escapeHtml(formatDate(place.visitedOn))}　訪問</time>` : `<p class="date-empty">訪問日未記入</p>`}
          ${place.memo ? `<p class="memo">${escapeHtml(place.memo).replaceAll("\n", "<br>")}</p>` : `<p class="memo muted">ひとことはまだありません。</p>`}
          <a class="map-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.prefecture} ${place.municipality}`)}" target="_blank" rel="noopener noreferrer">地図で場所を確認する ↗</a>
          ${place.origin === "local" ? `<a class="edit-link" href="add.html?pref=${encodeURIComponent(place.prefecture)}&id=${encodeURIComponent(place.id)}">この記録を書き直す</a>` : ""}
        </div>
      </article>`, "book-page detail-book-page");
  }

  function bindPageTurns() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target === "_blank") return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || /^https?:/i.test(href)) return;
      event.preventDefault();
      document.body.classList.add("page-leaving");
      const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 330;
      window.setTimeout(() => { window.location.href = link.href; }, delay);
    });
  }

  const renderers = { cover: renderCover, map: renderMap, region: renderRegion, prefecture: renderPrefecture, add: renderAdd, place: renderPlace };
  (renderers[page] || renderCover)();
  bindPhotoFallbacks();
  bindPageTurns();
}());
