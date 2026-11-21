function makeDemoPage(title, pageNum, total, bg = "#fff", accent = "#111", height = 900) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="${height}" viewBox="0 0 600 ${height}">
      <rect width="600" height="${height}" fill="${bg}" />
      <rect x="24" y="24" width="552" height="${height - 48}" fill="none" stroke="${accent}" stroke-width="6"/>
      <rect x="44" y="44" width="512" height="${(height - 120) * 0.45}" fill="#f4f4f5" stroke="${accent}" stroke-width="4"/>
      <rect x="44" y="${64 + (height - 120) * 0.45}" width="246" height="${(height - 120) * 0.45}" fill="#e4e4e7" stroke="${accent}" stroke-width="4"/>
      <rect x="310" y="${64 + (height - 120) * 0.45}" width="246" height="${(height - 120) * 0.45}" fill="#fafafa" stroke="${accent}" stroke-width="4"/>
      <text x="300" y="130" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="34" fill="${accent}">${title}</text>
      <text x="300" y="220" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="22" fill="#71717a">PANEL 1 (TOP)</text>
      <text x="433" y="${220 + (height - 120) * 0.45}" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="20" fill="${accent}">PANEL 2 (RIGHT)</text>
      <text x="167" y="${220 + (height - 120) * 0.45}" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="20" fill="${accent}">PANEL 3 (LEFT)</text>
    </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

// Default 3-panel layout for the demo pages (in percentages: x, y, w, h)
const DEMO_PANELS = [
  { x: 6.5, y: 4.5, w: 87, h: 40 },   // Panel 1: Top wide panel
  { x: 51,  y: 46,  w: 42.5, h: 42 }, // Panel 2: Bottom right panel (RTL)
  { x: 6.5, y: 46,  w: 42.5, h: 42 }  // Panel 3: Bottom left panel
];

const MANGA_LIBRARY = [
  {
    id: 1,
    title: "Blade of the Crimson Moon",
    chapter: "Ch. 1: Awakening",
    category: "Action",
    cover: makeDemoPage("CRIMSON MOON", 1, 3, "#ffffff", "#e60023", 860),
    pages: [
      { src: makeDemoPage("CRIMSON MOON", 1, 3, "#ffffff", "#e60023", 860), panels: [...DEMO_PANELS] },
      { src: makeDemoPage("CRIMSON MOON", 2, 3, "#ffffff", "#111111", 860), panels: [...DEMO_PANELS] },
      { src: makeDemoPage("CRIMSON MOON", 3, 3, "#ffffff", "#e60023", 860), panels: [...DEMO_PANELS] }
    ]
  },
  {
    id: 2,
    title: "Starlight Bakery",
    chapter: "Ch. 1: Warm Croissants",
    category: "Slice of Life",
    cover: makeDemoPage("STARLIGHT BAKERY", 1, 2, "#fffbeb", "#b45309", 720),
    pages: [
      { src: makeDemoPage("STARLIGHT BAKERY", 1, 2, "#fffbeb", "#b45309", 800), panels: [...DEMO_PANELS] },
      { src: makeDemoPage("STARLIGHT BAKERY", 2, 2, "#fffbeb", "#b45309", 800), panels: [...DEMO_PANELS] }
    ]
  },
  {
    id: 3,
    title: "Chronicles of Aethelgard",
    chapter: "Ch. 12: The Floating Spire",
    category: "Fantasy",
    cover: makeDemoPage("AETHELGARD", 1, 3, "#f0f9ff", "#0369a1", 920),
    pages: [
      { src: makeDemoPage("AETHELGARD", 1, 3, "#f0f9ff", "#0369a1", 900), panels: [...DEMO_PANELS] },
      { src: makeDemoPage("AETHELGARD", 2, 3, "#f0f9ff", "#0369a1", 900), panels: [...DEMO_PANELS] },
      { src: makeDemoPage("AETHELGARD", 3, 3, "#f0f9ff", "#0369a1", 900), panels: [...DEMO_PANELS] }
    ]
  }
];
