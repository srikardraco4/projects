let activeCategory = "All";
let currentManga = null;
let currentPageIndex = 0;
let currentPanelIndex = 0;
let readerMode = "page";    // "page", "panel", or "vertical"
let panelStyle = "zoom";    // "zoom" (1 by 1) or "reveal" (build on same page)
let isRTL = true;
let isEditingPanels = false;

function getPageObj(manga, index) {
  const p = manga.pages[index];
  if (typeof p === "string") {
    manga.pages[index] = { src: p, panels: [] };
  }
  return manga.pages[index];
}

// --- DARK / LIGHT THEME ---
function initTheme() {
  const savedTheme = localStorage.getItem("mangapin-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  document.getElementById("themeToggle").textContent = savedTheme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("mangapin-theme", next);
  document.getElementById("themeToggle").textContent = next === "dark" ? "☀️" : "🌙";
}

// --- GALLERY & FILTERS ---
function setCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
  btn.classList.add("active");
  renderGrid();
}

function resetHome() {
  document.getElementById("searchInput").value = "";
  setCategory("All", document.querySelector(".pill"));
}

function renderGrid() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const grid = document.getElementById("mangaGrid");
  const empty = document.getElementById("emptyState");

  const filtered = MANGA_LIBRARY.filter(m => {
    const matchesCat = activeCategory === "All" || m.category === activeCategory;
    const matchesSearch = m.title.toLowerCase().includes(query) ||
                          m.category.toLowerCase().includes(query) ||
                          m.chapter.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  grid.innerHTML = "";
  empty.style.display = filtered.length === 0 ? "block" : "none";

  filtered.forEach(manga => {
    const card = document.createElement("div");
    card.className = "pin-card";
    card.onclick = () => openReader(manga);
    card.innerHTML = `
      <div class="pin-img-wrap">
        <img src="${manga.cover}" alt="${manga.title}" loading="lazy" />
        <div class="pin-overlay">
          <span class="page-count-badge">${manga.pages.length} pages</span>
          <span class="read-badge">Read</span>
        </div>
      </div>
      <div class="pin-meta">
        <div class="pin-title">${manga.title}</div>
        <div class="pin-sub">${manga.chapter} • ${manga.category}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// --- LOCAL FILE PREVIEW ---
function handleLocalUpload(event) {
  const files = Array.from(event.target.files).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true })
  );
  if (!files.length) return;

  const urls = files.map(f => URL.createObjectURL(f));
  const newManga = {
    id: Date.now(),
    title: "My Uploaded Manga (" + files.length + " pgs)",
    chapter: "Local Preview",
    category: "Oneshot",
    cover: urls[0],
    pages: urls.map(u => ({ src: u, panels: [] }))
  };

  MANGA_LIBRARY.unshift(newManga);
  renderGrid();
  openReader(newManga);
}

// --- MANGA READER ---
function openReader(manga) {
  currentManga = manga;
  currentPageIndex = 0;
  currentPanelIndex = 0;
  isEditingPanels = false;
  document.getElementById("panelEditor").style.display = "none";
  document.getElementById("readerViewport").style.display = "flex";
  document.getElementById("readerTitle").textContent = manga.title;
  document.getElementById("readerSub").textContent = manga.chapter;
  document.getElementById("readerModal").classList.add("open");
  document.body.style.overflow = "hidden";
  renderReader();
}

function closeReader() {
  document.getElementById("readerModal").classList.remove("open");
  document.body.style.overflow = "";
}

function setMode(mode) {
  if (isEditingPanels) togglePanelEditor();
  readerMode = mode;
  currentPanelIndex = 0;
  document.getElementById("btnPageMode").classList.toggle("active", mode === "page");
  document.getElementById("btnPanelMode").classList.toggle("active", mode === "panel");
  document.getElementById("btnVertMode").classList.toggle("active", mode === "vertical");
  document.getElementById("panelSubOptions").style.display = mode === "panel" ? "flex" : "none";
  document.getElementById("readerFooter").style.display = mode === "vertical" ? "none" : "flex";
  document.getElementById("btnRtl").style.display = mode === "vertical" ? "none" : "inline-block";
  renderReader();
}

function setPanelStyle(style) {
  panelStyle = style;
  document.getElementById("btnSubZoom").classList.toggle("active", style === "zoom");
  document.getElementById("btnSubReveal").classList.toggle("active", style === "reveal");
  renderReader();
}

function toggleRTL() {
  isRTL = !isRTL;
  document.getElementById("btnRtl").textContent = isRTL ? "RTL: ON" : "RTL: OFF";
  renderReader();
}

function renderReader() {
  if (isEditingPanels) return;
  const viewport = document.getElementById("readerViewport");
  viewport.innerHTML = "";

  if (readerMode === "vertical") {
    viewport.className = "reader-viewport vertical-mode";
    currentManga.pages.forEach((_, idx) => {
      const page = getPageObj(currentManga, idx);
      const img = document.createElement("img");
      img.src = page.src;
      viewport.appendChild(img);
    });
    return;
  }

  const page = getPageObj(currentManga, currentPageIndex);

  if (readerMode === "page") {
    viewport.className = "reader-viewport page-mode";
    const stage = createNavStage();
    const img = document.createElement("img");
    img.src = page.src;
    stage.appendChild(img);
    viewport.appendChild(stage);

    document.getElementById("pageIndicator").textContent =
      `Page ${currentPageIndex + 1} / ${currentManga.pages.length}`;
  } else if (readerMode === "panel") {
    viewport.className = "reader-viewport panel-mode";
    const panels = page.panels && page.panels.length ? page.panels : [{ x: 0, y: 0, w: 100, h: 100 }];
    if (currentPanelIndex >= panels.length) currentPanelIndex = 0;

    const stage = createNavStage();

    if (panelStyle === "zoom") {
      // SUB-OPTION 1: Zoomed single panel
      const panel = panels[currentPanelIndex];
      const cropBox = document.createElement("div");
      cropBox.className = "panel-crop-box";

      const img = document.createElement("img");
      img.src = page.src;
      img.onload = () => fitPanelToViewport(img, cropBox, panel, viewport);
      if (img.complete) fitPanelToViewport(img, cropBox, panel, viewport);

      cropBox.appendChild(img);
      stage.appendChild(cropBox);
    } else {
      // SUB-OPTION 2: Reveal panels one by one on the same page
      const revealStage = document.createElement("div");
      revealStage.className = "reveal-page-stage";

      const sizingImg = document.createElement("img");
      sizingImg.src = page.src;
      sizingImg.className = "reveal-sizing-img";
      revealStage.appendChild(sizingImg);

      for (let i = 0; i <= currentPanelIndex; i++) {
        const p = panels[i];
        const layer = document.createElement("img");
        layer.src = page.src;
        layer.className = "reveal-panel-layer" + (i === currentPanelIndex ? " newest" : "");
        const top = p.y;
        const right = Math.max(0, 100 - (p.x + p.w));
        const bottom = Math.max(0, 100 - (p.y + p.h));
        const left = p.x;
        layer.style.clipPath = `inset(${top}% ${right}% ${bottom}% ${left}%)`;
        revealStage.appendChild(layer);
      }

      stage.appendChild(revealStage);
    }

    viewport.appendChild(stage);
    document.getElementById("pageIndicator").textContent =
      `Page ${currentPageIndex + 1} / ${currentManga.pages.length} • Panel ${currentPanelIndex + 1} / ${panels.length}`;
  }
}

function createNavStage() {
  const stage = document.createElement("div");
  stage.className = "page-stage";

  const leftZone = document.createElement("div");
  leftZone.className = "nav-zone left";
  leftZone.onclick = () => isRTL ? nextStep() : prevStep();

  const rightZone = document.createElement("div");
  rightZone.className = "nav-zone right";
  rightZone.onclick = () => isRTL ? prevStep() : nextStep();

  stage.appendChild(leftZone);
  stage.appendChild(rightZone);
  return stage;
}

function fitPanelToViewport(img, cropBox, panel, viewport) {
  const natW = img.naturalWidth || 600;
  const natH = img.naturalHeight || 900;
  const stageW = viewport.clientWidth - 24;
  const stageH = viewport.clientHeight - 24;

  const pxW = (panel.w / 100) * natW;
  const pxH = (panel.h / 100) * natH;
  const scale = Math.min(stageW / pxW, stageH / pxH);

  cropBox.style.width = `${pxW * scale}px`;
  cropBox.style.height = `${pxH * scale}px`;

  img.style.width = `${natW * scale}px`;
  img.style.height = `${natH * scale}px`;
  img.style.left = `${-(panel.x / 100) * (natW * scale)}px`;
  img.style.top = `${-(panel.y / 100) * (natH * scale)}px`;
}

function nextStep() {
  if (readerMode === "panel") {
    const page = getPageObj(currentManga, currentPageIndex);
    const totalPanels = page.panels && page.panels.length ? page.panels.length : 1;
    if (currentPanelIndex < totalPanels - 1) {
      currentPanelIndex++;
      renderReader();
      return;
    }
  }
  if (currentPageIndex < currentManga.pages.length - 1) {
    currentPageIndex++;
    currentPanelIndex = 0;
    renderReader();
  }
}

function prevStep() {
  if (readerMode === "panel" && currentPanelIndex > 0) {
    currentPanelIndex--;
    renderReader();
    return;
  }
  if (currentPageIndex > 0) {
    currentPageIndex--;
    const prevPage = getPageObj(currentManga, currentPageIndex);
    currentPanelIndex = (readerMode === "panel" && prevPage.panels.length) ? prevPage.panels.length - 1 : 0;
    renderReader();
  }
}

// --- CREATOR PANEL EDITOR ---
function togglePanelEditor() {
  isEditingPanels = !isEditingPanels;
  document.getElementById("panelEditor").style.display = isEditingPanels ? "flex" : "none";
  document.getElementById("readerViewport").style.display = isEditingPanels ? "none" : "flex";
  document.getElementById("readerFooter").style.display = (isEditingPanels || readerMode === "vertical") ? "none" : "flex";
  document.getElementById("btnEditPanels").classList.toggle("active", isEditingPanels);

  if (isEditingPanels) {
    renderEditor();
  } else {
    setMode("panel");
  }
}

function editorChangePage(delta) {
  const next = currentPageIndex + delta;
  if (next >= 0 && next < currentManga.pages.length) {
    currentPageIndex = next;
    currentPanelIndex = 0;
    renderEditor();
  }
}

function renderEditor() {
  const page = getPageObj(currentManga, currentPageIndex);
  document.getElementById("editorPageNum").textContent = `${currentPageIndex + 1} / ${currentManga.pages.length}`;
  document.getElementById("editorImg").src = page.src;

  const boxesContainer = document.getElementById("editorBoxes");
  const listContainer = document.getElementById("panelList");
  boxesContainer.innerHTML = "";
  listContainer.innerHTML = "";

  page.panels.forEach((p, idx) => {
    const box = document.createElement("div");
    box.className = "panel-box-overlay";
    box.style.left = p.x + "%";
    box.style.top = p.y + "%";
    box.style.width = p.w + "%";
    box.style.height = p.h + "%";
    box.innerHTML = `<span class="panel-box-badge">${idx + 1}</span>`;
    boxesContainer.appendChild(box);

    const item = document.createElement("div");
    item.className = "panel-list-item";
    item.innerHTML = `
      <span>Panel #${idx + 1}</span>
      <div class="panel-item-btns">
        <button onclick="movePanel(${idx}, -1)" title="Move Up">↑</button>
        <button onclick="movePanel(${idx}, 1)" title="Move Down">↓</button>
        <button onclick="deletePanel(${idx})" title="Delete">✕</button>
      </div>
    `;
    listContainer.appendChild(item);
  });
}

function movePanel(idx, dir) {
  const panels = getPageObj(currentManga, currentPageIndex).panels;
  const target = idx + dir;
  if (target < 0 || target >= panels.length) return;
  [panels[idx], panels[target]] = [panels[target], panels[idx]];
  renderEditor();
}

function deletePanel(idx) {
  getPageObj(currentManga, currentPageIndex).panels.splice(idx, 1);
  renderEditor();
}

function clearPagePanels() {
  getPageObj(currentManga, currentPageIndex).panels = [];
  renderEditor();
}

function copyPanelJSON() {
  const formatted = currentManga.pages.map((_, idx) => {
    const p = getPageObj(currentManga, idx);
    return { src: p.src.startsWith("data:") ? "IMAGE_PATH_HERE" : p.src, panels: p.panels };
  });
  navigator.clipboard.writeText(JSON.stringify(formatted, null, 2));
  alert("Panel data copied! Paste it into your manga's `pages` array in manga-data.js.");
}

const editorStage = document.getElementById("editorStage");
const drawPreview = document.getElementById("drawPreview");
let drawStart = null;

editorStage.addEventListener("pointerdown", (e) => {
  const rect = editorStage.getBoundingClientRect();
  drawStart = {
    x: ((e.clientX - rect.left) / rect.width) * 100,
    y: ((e.clientY - rect.top) / rect.height) * 100
  };
  drawPreview.style.display = "block";
  drawPreview.style.left = drawStart.x + "%";
  drawPreview.style.top = drawStart.y + "%";
  drawPreview.style.width = "0%";
  drawPreview.style.height = "0%";
});

window.addEventListener("pointermove", (e) => {
  if (!drawStart) return;
  const rect = editorStage.getBoundingClientRect();
  const curX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
  const curY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

  drawPreview.style.left = Math.min(drawStart.x, curX) + "%";
  drawPreview.style.top = Math.min(drawStart.y, curY) + "%";
  drawPreview.style.width = Math.abs(curX - drawStart.x) + "%";
  drawPreview.style.height = Math.abs(curY - drawStart.y) + "%";
});

window.addEventListener("pointerup", (e) => {
  if (!drawStart) return;
  const rect = editorStage.getBoundingClientRect();
  const curX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
  const curY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

  const x = Number(Math.min(drawStart.x, curX).toFixed(1));
  const y = Number(Math.min(drawStart.y, curY).toFixed(1));
  const w = Number(Math.abs(curX - drawStart.x).toFixed(1));
  const h = Number(Math.abs(curY - drawStart.y).toFixed(1));

  drawStart = null;
  drawPreview.style.display = "none";

  if (w > 3 && h > 3) {
    getPageObj(currentManga, currentPageIndex).panels.push({ x, y, w, h });
    renderEditor();
  }
});

document.addEventListener("keydown", (e) => {
  if (!document.getElementById("readerModal").classList.contains("open") || isEditingPanels) return;
  if (e.key === "Escape") closeReader();
  if (readerMode === "page" || readerMode === "panel") {
    if (e.key === "ArrowRight") isRTL ? prevStep() : nextStep();
    if (e.key === "ArrowLeft")  isRTL ? nextStep() : prevStep();
  }
});

window.addEventListener("resize", () => {
  if (document.getElementById("readerModal").classList.contains("open") && readerMode === "panel" && panelStyle === "zoom") {
    renderReader();
  }
});

initTheme();
renderGrid();
