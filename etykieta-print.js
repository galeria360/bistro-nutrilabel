// etykieta-print.js — generator etykiety słoika A7
// Podłącz do index.html: <script src="etykieta-print.js"></script>

(function() {

// ── DOMYŚLNE ROZMIARY (px przy 96dpi, suwaki)
let CFG = {
  heroSize:    16,   // mm — wielkość nazwy zupy
  textSize:    2.4,  // mm — czcionka tekstu na stronach 2/3/4
  logoScale:   100,  // % — skala logo+hero sekcji
};

// ── POBIERZ DANE Z APLIKACJI (selektory z Gruba Micha app)
function getRecipeData() {
  // Nazwa przepisu
  const name = document.getElementById('dishName')?.value?.trim() || 'Nazwa zupy';

  // Podtyp z notatek (pierwsza linia przepisInstrukcja lub pusty)
  const instrukcja = document.getElementById('przepisInstrukcja')?.value || '';
  const subtitle = instrukcja.split('\n')[0]?.trim() || '';

  // Objętość — szukaj w dishNotes lub domyślnie 900 ml
  const notatki = document.getElementById('przepisNotatki')?.value || '';
  const volMatch = notatki.match(/(\d+\s*ml)/i);
  const volume = volMatch ? volMatch[1] : '900 ml';

  // Wartości odżywcze z totalów (pełna porcja)
  function tv(id) {
    return document.getElementById(id)?.textContent?.trim() || '—';
  }

  // Przelicz na 100ml, 450ml, 900ml na podstawie totalów
  // totalKcal = wartość całkowita przepisu
  // Pobierz wagę całkowitą żeby obliczyć per 100ml
  const totalKcal = parseFloat(tv('totalKcal')) || 0;
  const totalFat  = parseFloat(tv('totalFat'))  || 0;
  const totalCarb = parseFloat(tv('totalCarb')) || 0;
  const totalProt = parseFloat(tv('totalProt')) || 0;
  const totalSalt = parseFloat(tv('totalSalt')) || 0;
  const totalWeight = parseFloat(document.getElementById('totalRawWeight')?.textContent) || 900;

  // mKcal/mProt etc. to wartości per 100g (kolumna w tabeli)
  const per100Kcal = parseFloat(document.getElementById('mKcal')?.textContent) || 0;
  const per100Fat  = parseFloat(document.getElementById('mFat')?.textContent)  || 0;
  const per100Carb = parseFloat(document.getElementById('mCarb')?.textContent) || 0;
  const per100Sug  = parseFloat(document.getElementById('mSugar')?.textContent)|| 0;
  const per100Prot = parseFloat(document.getElementById('mProt')?.textContent) || 0;
  const per100Salt = parseFloat(document.getElementById('mSalt')?.textContent) || 0;

  function fmt(val, mult) {
    const v = val * mult / 100;
    return v > 0 ? (Number.isInteger(v) ? v : v.toFixed(1)) + (mult === 1 ? '' : '') : '—';
  }
  function fmtKcal(val, mult) {
    const v = Math.round(val * mult / 100);
    return v > 0 ? v + ' kcal' : '—';
  }
  function fmtG(val, mult) {
    const v = val * mult / 100;
    return v > 0 ? (v % 1 === 0 ? v : v.toFixed(1)) + ' g' : '—';
  }

  // Skład — buduj z listy składników w tabeli
  const rows = document.querySelectorAll('#ingredientsTable tbody tr, .ingredients-table tbody tr, table.ingredients tbody tr');
  let skladParts = [];
  rows.forEach(row => {
    const nameCell = row.querySelector('td:first-child, .ing-name');
    if (nameCell) {
      const ingName = nameCell.textContent.trim();
      if (ingName && ingName !== '—') skladParts.push(ingName);
    }
  });
  const sklad = skladParts.length > 0 ? skladParts.join(', ') : (instrukcja || 'Skład produktu...');

  // Alergeny — szukaj w tabeli składników lub ALLERGENS
  let allergens = ['Gluten', 'Mleko', 'Seler'];
  try {
    const ALLERGENS = (0,eval)('typeof ALLERGENS !== "undefined" ? ALLERGENS : null');
    if (ALLERGENS && typeof ALLERGENS === 'object') {
      const found = Object.entries(ALLERGENS)
        .filter(([,v]) => v)
        .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));
      if (found.length > 0) allergens = found;
    }
  } catch(e) {}

  return {
    name,
    subtitle,
    volume,
    sklad,
    allergens,
    nutri: {
      kcal100: fmtKcal(per100Kcal, 100),
      kcal450: fmtKcal(per100Kcal, 450),
      kcal900: fmtKcal(per100Kcal, 900),
      fat100:  fmtG(per100Fat, 100),
      fat450:  fmtG(per100Fat, 450),
      fat900:  fmtG(per100Fat, 900),
      satfat100: '—', satfat450: '—', satfat900: '—',
      carb100: fmtG(per100Carb, 100),
      carb450: fmtG(per100Carb, 450),
      carb900: fmtG(per100Carb, 900),
      sug100:  fmtG(per100Sug, 100),
      sug450:  fmtG(per100Sug, 450),
      sug900:  fmtG(per100Sug, 900),
      prot100: fmtG(per100Prot, 100),
      prot450: fmtG(per100Prot, 450),
      prot900: fmtG(per100Prot, 900),
      salt100: fmtG(per100Salt, 100),
      salt450: fmtG(per100Salt, 450),
      salt900: fmtG(per100Salt, 900),
    }
  };
}

// ── GENERUJ HTML ETYKIETY
function buildLabel(data) {
  const logoB64 = window._etyLogoB64 || '';
  const logoImg = logoB64
    ? `<img src="data:image/png;base64,${logoB64}" style="width:${CFG.logoScale*0.14}mm;height:${CFG.logoScale*0.14}mm;object-fit:contain;flex-shrink:0;">`
    : `<img src="logo.png" style="width:${CFG.logoScale*0.14}mm;height:${CFG.logoScale*0.14}mm;object-fit:contain;flex-shrink:0;">`;

  const heroH = Math.round(CFG.logoScale * 0.35) + 'mm';
  const M = '10mm';
  const T = CFG.textSize;

  function hole_l() {
    return `<div style="position:absolute;top:0;left:0;width:6mm;height:6mm;display:flex;align-items:center;justify-content:center;z-index:10;"><div style="width:4mm;height:4mm;border-radius:50%;border:0.3mm dashed #aaa;display:flex;align-items:center;justify-content:center;"><div style="width:1.2mm;height:1.2mm;border-radius:50%;background:#ccc;"></div></div></div>`;
  }
  function hole_r() {
    return `<div style="position:absolute;top:0;right:0;width:6mm;height:6mm;display:flex;align-items:center;justify-content:center;z-index:10;"><div style="width:4mm;height:4mm;border-radius:50%;border:0.3mm dashed #aaa;display:flex;align-items:center;justify-content:center;"><div style="width:1.2mm;height:1.2mm;border-radius:50%;background:#ccc;"></div></div></div>`;
  }

  const allergenTags = data.allergens.map(a =>
    `<span style="border:0.3mm solid #000;border-radius:5mm;padding:.4mm 1.5mm;font-size:${T*0.9}mm;font-weight:700;color:#000;display:inline-block;margin:.3mm;">${a}</span>`
  ).join('');

  const n = data.nutri;

  // S4 — Wartości odżywcze
  const s4 = `<div style="width:74mm;height:105mm;overflow:hidden;background:#fff;position:relative;">
    ${hole_r()}
    <div style="position:absolute;top:${M};bottom:${M};left:${M};right:${M};display:flex;flex-direction:column;justify-content:center;font-family:'DM Sans',sans-serif;">
      <div style="display:flex;align-items:center;gap:1.5mm;border-bottom:0.5mm solid #000;padding-bottom:1mm;margin-bottom:1.5mm;">
        <span style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${T*2.3}mm;color:#000;line-height:1;">4</span>
        <span style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${T*1.2}mm;letter-spacing:.4mm;text-transform:uppercase;">Wartości odżywcze</span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:${T}mm;color:#000;">
        <thead><tr>
          <th style="font-size:${T*0.9}mm;font-weight:700;text-transform:uppercase;border-bottom:0.3mm solid #000;padding:1mm 0;text-align:left;">Składnik</th>
          <th style="font-size:${T*0.9}mm;font-weight:700;text-transform:uppercase;border-bottom:0.3mm solid #000;padding:1mm 0;text-align:right;">100ml</th>
          <th style="font-size:${T*0.9}mm;font-weight:700;text-transform:uppercase;border-bottom:0.3mm solid #000;padding:1mm 0;text-align:right;">450ml</th>
          <th style="font-size:${T*0.9}mm;font-weight:700;text-transform:uppercase;border-bottom:0.3mm solid #000;padding:1mm 0;text-align:right;">900ml</th>
        </tr></thead>
        <tbody>
          <tr><td style="padding:1mm 0;border-bottom:.2mm solid #eee;font-weight:700;">Energia</td><td style="text-align:right;padding:1mm 0;border-bottom:.2mm solid #eee;font-weight:700;">${n.kcal100}</td><td style="text-align:right;padding:1mm 0;border-bottom:.2mm solid #eee;font-weight:700;">${n.kcal450}</td><td style="text-align:right;padding:1mm 0;border-bottom:.2mm solid #eee;font-weight:700;">${n.kcal900}</td></tr>
          <tr><td style="padding:1mm 0;border-bottom:.2mm solid #eee;font-weight:700;">Tłuszcz</td><td style="text-align:right;padding:1mm 0;border-bottom:.2mm solid #eee;font-weight:700;">${n.fat100}</td><td style="text-align:right;padding:1mm 0;border-bottom:.2mm solid #eee;font-weight:700;">${n.fat450}</td><td style="text-align:right;padding:1mm 0;border-bottom:.2mm solid #eee;font-weight:700;">${n.fat900}</td></tr>
          <tr><td style="padding:.8mm 0 .8mm 2mm;border-bottom:.2mm solid #eee;font-size:${T*0.85}mm;">w tym nasycone</td><td style="text-align:right;padding:.8mm 0;border-bottom:.2mm solid #eee;">${n.satfat100}</td><td style="text-align:right;padding:.8mm 0;border-bottom:.2mm solid #eee;">${n.satfat450}</td><td style="text-align:right;padding:.8mm 0;border-bottom:.2mm solid #eee;">${n.satfat900}</td></tr>
          <tr><td style="padding:1mm 0;border-bottom:.2mm solid #eee;font-weight:700;">Węglowodany</td><td style="text-align:right;padding:1mm 0;border-bottom:.2mm solid #eee;font-weight:700;">${n.carb100}</td><td style="text-align:right;padding:1mm 0;border-bottom:.2mm solid #eee;font-weight:700;">${n.carb450}</td><td style="text-align:right;padding:1mm 0;border-bottom:.2mm solid #eee;font-weight:700;">${n.carb900}</td></tr>
          <tr><td style="padding:.8mm 0 .8mm 2mm;border-bottom:.2mm solid #eee;font-size:${T*0.85}mm;">w tym cukry</td><td style="text-align:right;padding:.8mm 0;border-bottom:.2mm solid #eee;">${n.sug100}</td><td style="text-align:right;padding:.8mm 0;border-bottom:.2mm solid #eee;">${n.sug450}</td><td style="text-align:right;padding:.8mm 0;border-bottom:.2mm solid #eee;">${n.sug900}</td></tr>
          <tr><td style="padding:1mm 0;border-bottom:.2mm solid #eee;font-weight:700;">Białko</td><td style="text-align:right;padding:1mm 0;border-bottom:.2mm solid #eee;font-weight:700;">${n.prot100}</td><td style="text-align:right;padding:1mm 0;border-bottom:.2mm solid #eee;font-weight:700;">${n.prot450}</td><td style="text-align:right;padding:1mm 0;border-bottom:.2mm solid #eee;font-weight:700;">${n.prot900}</td></tr>
          <tr><td style="padding:1mm 0;font-weight:700;">Sól</td><td style="text-align:right;padding:1mm 0;font-weight:700;">${n.salt100}</td><td style="text-align:right;padding:1mm 0;font-weight:700;">${n.salt450}</td><td style="text-align:right;padding:1mm 0;font-weight:700;">${n.salt900}</td></tr>
        </tbody>
      </table>
      <div style="width:100%;height:.2mm;background:#e0e0e0;margin:2.5mm 0 1.5mm;"></div>
      <div style="font-size:${T*0.9}mm;color:#000;line-height:1.7;margin-bottom:1.5mm;"><strong>Producent:</strong> GrubaMicha Bartłomiej Radziszewski<br>ul. Polna 1, 81-745 Sopot<br>centrala@grubamicha.pl</div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:${T*0.9}mm;color:#000;font-weight:700;">grubamicha.pl</div>
        <div style="font-size:9mm;line-height:1;">♻</div>
      </div>
    </div>
  </div>`;

  // S1 — Okładka
  const s1 = `<div style="width:74mm;height:105mm;overflow:hidden;background:#fff;position:relative;">
    ${hole_l()}
    <div style="position:absolute;top:${M};bottom:${M};left:${M};right:${M};display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;">
      <div style="height:${heroH};display:flex;align-items:center;justify-content:center;gap:2mm;flex-shrink:0;">
        ${logoImg}
        <div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${CFG.logoScale*0.045}mm;text-transform:uppercase;color:#000;line-height:1.2;">Domowa kuchnia</div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:${CFG.logoScale*0.032}mm;text-transform:uppercase;color:#555;line-height:1.2;">w rodzinnym biznesie</div>
        </div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border-top:0.4mm solid #000;border-bottom:0.4mm solid #000;padding:1mm 0;">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:${T*1.1}mm;letter-spacing:2mm;text-transform:uppercase;color:#000;margin-bottom:1.5mm;">Zupa</div>
        <div style="width:100%;height:.3mm;background:#ddd;margin-bottom:2mm;"></div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${CFG.heroSize}mm;line-height:.85;text-transform:uppercase;color:#000;text-align:center;word-break:break-word;width:100%;">${data.name}</div>
        ${data.subtitle ? `<div style="font-size:${T}mm;color:#000;letter-spacing:.5mm;margin-top:2mm;text-align:center;">${data.subtitle}</div>` : ''}
        <div style="display:flex;align-items:center;justify-content:center;gap:2mm;margin-top:2mm;"><div style="width:5mm;height:.3mm;background:#000;"></div><div style="width:1mm;height:1mm;border-radius:50%;background:#000;"></div><div style="width:5mm;height:.3mm;background:#000;"></div></div>
        <div style="font-size:${T}mm;font-weight:700;letter-spacing:.8mm;border:0.4mm solid #000;border-radius:10mm;padding:.5mm 2mm;color:#000;margin-top:2mm;">${data.volume}</div>
      </div>
      <div style="display:flex;justify-content:space-around;align-items:center;padding-top:1.5mm;">
        <div style="font-size:${T*0.75}mm;font-weight:700;text-transform:uppercase;color:#000;text-align:center;line-height:1.4;flex:1;">Produkt<br>sterylizowany</div>
        <div style="width:.2mm;height:5mm;background:#e0e0e0;"></div>
        <div style="font-size:${T*0.75}mm;font-weight:700;text-transform:uppercase;color:#000;text-align:center;line-height:1.4;flex:1;">Bez<br>konserwantów</div>
        <div style="width:.2mm;height:5mm;background:#e0e0e0;"></div>
        <div style="font-size:${T*0.75}mm;font-weight:700;text-transform:uppercase;color:#000;text-align:center;line-height:1.4;flex:1;">Bez<br>ulepszaczy</div>
      </div>
    </div>
  </div>`;

  // S2 — Skład
  const s2 = `<div style="width:74mm;height:105mm;overflow:hidden;background:#fff;position:relative;">
    ${hole_l()}
    <div style="position:absolute;top:${M};bottom:${M};left:${M};right:${M};display:flex;flex-direction:column;justify-content:space-between;font-family:'DM Sans',sans-serif;">
      <div style="border-bottom:0.5mm solid #000;padding-bottom:1mm;display:flex;justify-content:flex-start;align-items:baseline;gap:1.5mm;">
        <span style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${T*1.1}mm;letter-spacing:.4mm;text-transform:uppercase;color:#000;">Skład</span>
        <span style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${T*2.2}mm;color:#000;line-height:1;">2</span>
      </div>
      <div style="font-size:${T}mm;color:#000;line-height:1.7;">${data.sklad}</div>
      <div>
        <div style="width:100%;height:.2mm;background:#e0e0e0;margin-bottom:1mm;"></div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${T*1.1}mm;letter-spacing:.5mm;text-transform:uppercase;color:#000;margin-bottom:.8mm;">Przed otwarciem</div>
        <div style="font-size:${T*0.9}mm;color:#000;line-height:1.6;">Przechowywać w temperaturze pokojowej (20–25°C), z dala od źródeł ciepła i światła słonecznego.</div>
      </div>
      <div>
        <div style="width:100%;height:.2mm;background:#e0e0e0;margin-bottom:1mm;"></div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${T*1.1}mm;letter-spacing:.5mm;text-transform:uppercase;color:#000;margin-bottom:.8mm;">Po otwarciu</div>
        <div style="font-size:${T*0.9}mm;color:#000;line-height:1.6;">Przechowywać w lodówce (4–7°C) i spożyć w ciągu 48 godzin.</div>
      </div>
      <div>
        <div style="width:100%;height:.2mm;background:#e0e0e0;margin-bottom:1mm;"></div>
        <div style="font-size:${T*0.85}mm;color:#000;line-height:1.5;font-style:italic;">Produkt wytworzony na urządzeniach mających kontakt z selerem, gorczycą i orzechami.</div>
      </div>
    </div>
  </div>`;

  // S3 — Alergeny
  const s3 = `<div style="width:74mm;height:105mm;overflow:hidden;background:#fff;position:relative;">
    ${hole_r()}
    <div style="position:absolute;top:${M};bottom:${M};left:${M};right:${M};display:flex;flex-direction:column;justify-content:space-between;font-family:'DM Sans',sans-serif;">
      <div>
        <div style="border-bottom:0.5mm solid #000;padding-bottom:1mm;margin-bottom:1.2mm;display:flex;align-items:baseline;justify-content:flex-end;gap:1.5mm;">
          <span style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${T*1.1}mm;letter-spacing:.4mm;text-transform:uppercase;color:#000;">Alergeny</span>
          <span style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${T*2.2}mm;color:#000;line-height:1;">3</span>
        </div>
        <div style="margin-bottom:.8mm;">${allergenTags}</div>
        <div style="font-size:${T*0.85}mm;color:#000;">* może zawierać śladowe ilości</div>
      </div>
      <div>
        <div style="width:100%;height:.2mm;background:#e0e0e0;margin-bottom:1mm;"></div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${T*1.1}mm;letter-spacing:.5mm;text-transform:uppercase;color:#000;margin-bottom:1mm;">Sposób podgrzania</div>
        <div style="display:flex;gap:1.2mm;font-size:${T*0.9}mm;color:#000;line-height:1.5;margin-bottom:1mm;align-items:flex-start;"><span style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${T*1.4}mm;color:#000;line-height:1;flex-shrink:0;">1</span><div>Przelej zawartość słoika do garnka.</div></div>
        <div style="display:flex;gap:1.2mm;font-size:${T*0.9}mm;color:#000;line-height:1.5;margin-bottom:1mm;align-items:flex-start;"><span style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${T*1.4}mm;color:#000;line-height:1;flex-shrink:0;">2</span><div>Podgrzewaj na średnim ogniu 5–8 min, mieszając.</div></div>
        <div style="display:flex;gap:1.2mm;font-size:${T*0.9}mm;color:#000;line-height:1.5;align-items:flex-start;"><span style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${T*1.4}mm;color:#000;line-height:1;flex-shrink:0;">3</span><div>Podawaj gdy zupa osiągnie min. 75°C.</div></div>
      </div>
      <div>
        <div style="width:100%;height:.2mm;background:#e0e0e0;margin-bottom:1mm;"></div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${T*1.1}mm;letter-spacing:.5mm;text-transform:uppercase;color:#000;margin-bottom:.8mm;">Mikrofala</div>
        <div style="font-size:${T*0.9}mm;color:#000;line-height:1.5;">Przykryj naczynie, podgrzewaj 3–4 min w 800W. Zamieszaj w połowie czasu. <strong>Nie wkładaj słoika z nakrętką!</strong></div>
      </div>
      <div>
        <div style="width:100%;height:.2mm;background:#e0e0e0;margin-bottom:1mm;"></div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${T*1.1}mm;letter-spacing:.5mm;text-transform:uppercase;color:#000;margin-bottom:.8mm;">Uwagi</div>
        <div style="font-size:${T*0.9}mm;color:#000;line-height:1.5;">Nie zamrażać po otwarciu. Nie spożywać jeśli wieczko jest wybrzuszone lub wydaje dźwięk przy otwarciu.</div>
      </div>
    </div>
  </div>`;

  return { s1, s2, s3, s4 };
}

// ── GENERUJ OKNO DRUKU
function printEtykieta() {
  const data = getRecipeData();
  const { s1, s2, s3, s4 } = buildLabel(data);

  // Pozycje 8 etykiet na stronie A4 landscape
  const pos = [
    ['0','0'],['0','74mm'],['0','148mm'],['0','222mm'],
    ['105mm','0'],['105mm','74mm'],['105mm','148mm'],['105mm','222mm']
  ];
  function pg(content, t, l) {
    return `<div style="position:absolute;top:${t};left:${l};width:74mm;height:105mm;overflow:hidden;">${content}</div>`;
  }
  const sheet1 = pos.map(([t,l],i) => i%2===0 ? pg(s4,t,l) : pg(s1,t,l)).join('');
  const sheet2 = pos.map(([t,l],i) => i%2===0 ? pg(s2,t,l) : pg(s3,t,l)).join('');

  // Zbuduj pełny HTML
  const html = `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<title>Etykieta — ${data.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;}
@page{size:A4 landscape;margin:0;}
body{margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-family:'DM Sans',sans-serif;}
.sheet{width:297mm;height:210mm;position:relative;overflow:hidden;background:#fff;page-break-after:always;break-after:page;}
.sheet:last-child{page-break-after:avoid;break-after:avoid;}
.rotated{transform:rotate(180deg);transform-origin:center center;}
</style>
</head>
<body>
<div class="sheet">${sheet1}</div>
<div class="sheet rotated">${sheet2}</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.addEventListener('load', () => {
    win.focus();
    win.print();
  });
}



// ── PANEL KONTROLNY Z SUWAKAMI
function createPanel() {
  const panel = document.createElement('div');
  panel.id = 'etykieta-panel';
  panel.style.cssText = `
    position:fixed;bottom:20px;right:20px;z-index:9999;
    background:#fff;border:1.5px solid #222;border-radius:8px;
    padding:14px 18px;font-family:'DM Sans',sans-serif;
    box-shadow:0 4px 20px rgba(0,0,0,.15);min-width:260px;
  `;

  panel.innerHTML = `
    <div style="font-weight:700;font-size:13px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
      🏷️ Etykieta słoika
      <button id="ety-close" style="background:none;border:none;font-size:16px;cursor:pointer;color:#666;">✕</button>
    </div>

    <label style="font-size:11px;color:#555;display:block;margin-bottom:2px;">
      Nazwa zupy: <strong id="ety-hero-val">${CFG.heroSize}mm</strong>
    </label>
    <input type="range" id="ety-hero" min="8" max="25" step="0.5" value="${CFG.heroSize}"
      style="width:100%;margin-bottom:10px;">

    <label style="font-size:11px;color:#555;display:block;margin-bottom:2px;">
      Tekst (str. 2/3/4): <strong id="ety-text-val">${CFG.textSize}mm</strong>
    </label>
    <input type="range" id="ety-text" min="1.5" max="4" step="0.1" value="${CFG.textSize}"
      style="width:100%;margin-bottom:10px;">

    <label style="font-size:11px;color:#555;display:block;margin-bottom:2px;">
      Logo + nagłówek: <strong id="ety-logo-val">${CFG.logoScale}%</strong>
    </label>
    <input type="range" id="ety-logo" min="60" max="150" step="5" value="${CFG.logoScale}"
      style="width:100%;margin-bottom:14px;">

    <button id="ety-print" style="
      width:100%;padding:8px;background:#222;color:#fff;
      border:none;border-radius:5px;font-size:13px;font-weight:700;
      cursor:pointer;font-family:'DM Sans',sans-serif;">
      🖨️ Drukuj etykietę
    </button>
  `;

  document.body.appendChild(panel);

  // Suwaki
  panel.querySelector('#ety-hero').addEventListener('input', e => {
    CFG.heroSize = parseFloat(e.target.value);
    panel.querySelector('#ety-hero-val').textContent = CFG.heroSize + 'mm';
  });
  panel.querySelector('#ety-text').addEventListener('input', e => {
    CFG.textSize = parseFloat(e.target.value);
    panel.querySelector('#ety-text-val').textContent = CFG.textSize + 'mm';
  });
  panel.querySelector('#ety-logo').addEventListener('input', e => {
    CFG.logoScale = parseInt(e.target.value);
    panel.querySelector('#ety-logo-val').textContent = CFG.logoScale + '%';
  });

  panel.querySelector('#ety-print').addEventListener('click', printEtykieta);
  panel.querySelector('#ety-close').addEventListener('click', () => panel.remove());
}

// ── ZAŁADUJ LOGO
function loadLogo() {
  fetch('logo.png')
    .then(r => r.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onload = e => { window._etyLogoB64 = e.target.result.split(',')[1]; };
      reader.readAsDataURL(blob);
    })
    .catch(() => console.log('Logo nie załadowane — użyj <img src="logo.png">'));
}

// ── INICJALIZACJA — dodaj przycisk do menu aplikacji
function init() {
  loadLogo();

  // Wstaw przycisk Etykieta obok przycisku Menu w nagłówku
  const menuBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().includes('Menu'));
  const btn = document.createElement('button');
  btn.textContent = '🏷️ Etykieta';
  if (menuBtn) {
    btn.className = menuBtn.className;
    menuBtn.parentNode.insertBefore(btn, menuBtn.nextSibling);
  } else {
    btn.style.cssText = 'padding:8px 14px;cursor:pointer;margin-left:8px;';
    document.body.appendChild(btn);
  }
  btn.addEventListener('click', createPanel);
}

// Uruchom po załadowaniu DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
