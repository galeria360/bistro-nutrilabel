// etykieta-print.js — generator etykiety słoika A7
// Podłącz do index.html: <script src="etykieta-print.js"></script>

(function() {

// ── DOMYŚLNE ROZMIARY (px przy 96dpi, suwaki)
let CFG = {
  heroSize:    16,   // mm — wielkość nazwy zupy
  textSize:    2.4,  // mm — czcionka tekstu na stronach 2/3/4
  logoScale:   100,  // % — skala logo+hero sekcji
  porcjaG:     400,   // pojemność porcji w gramach
  jarVolume:   900,  // ml — pojemność słoika
};

// ── POBIERZ DANE Z APLIKACJI (selektory z Gruba Micha app)
function getRecipeData() {
  // Nazwa przepisu
  const name = document.getElementById('dishName')?.value?.trim() || 'Nazwa zupy';

  // Podtyp z notatek (pierwsza linia przepisInstrukcja lub pusty)
  const instrukcja = document.getElementById('przepisInstrukcja')?.value || '';
  const subtitle = instrukcja.split('\n')[0]?.trim() || '';

  // Objętość słoika z CFG (suwak)
  const volume = CFG.jarVolume + ' ml';

  // Wartości odżywcze - totalKcal/Fat/etc. już SĄ wartością per 100g (aplikacja sama dzieli)
  function parseNum(text) {
    if (!text) return 0;
    const m = text.toString().match(/[\d.,]+/);
    return m ? parseFloat(m[0].replace(',', '.')) : 0;
  }
  
  // Wartości per 100g/ml prosto z aplikacji
  const per100Kcal = parseNum(document.getElementById('totalKcal')?.textContent);
  const per100Fat  = parseNum(document.getElementById('totalFat')?.textContent);
  const per100Carb = parseNum(document.getElementById('totalCarb')?.textContent);
  const per100Sug  = (() => {
    const trs = Array.from(document.querySelectorAll('tr'));
    const tr = trs.find(t => t.children[0]?.textContent?.trim() === 'w tym cukry');
    return tr ? parseNum(tr.children[1]?.textContent) : 0;
  })();
  const per100Sat = (() => {
    const trs = Array.from(document.querySelectorAll('tr'));
    const tr = trs.find(t => t.children[0]?.textContent?.trim() === 'w tym kwasy nasycone');
    return tr ? parseNum(tr.children[1]?.textContent) : 0;
  })();
  const per100Prot = parseNum(document.getElementById('totalProt')?.textContent);
  const per100Salt = parseNum(document.getElementById('totalSalt')?.textContent);

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

  // Pobierz składniki z wagami i alergeny z tabeli
  const rows = document.querySelectorAll('#ingredientsTable tbody tr');
  const skladniki = [];
  const allergensSet = new Set();
  
  rows.forEach(row => {
    // Nazwa składnika
    const nameSpan = row.querySelector('td:first-child div div div span:first-child');
    if (!nameSpan) return;
    let ingName = Array.from(nameSpan.childNodes)
      .filter(n => n.nodeType === 3)
      .map(n => n.textContent.trim())
      .join(' ')
      .trim();
    if (!ingName) ingName = nameSpan.textContent.trim();
    // Usuń emoji
    ingName = ingName.replace(/[\uD800-\uDFFF\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
    if (!ingName || ingName.length < 2) return;
    
    // Waga (pierwszy input number)
    const weightInput = row.querySelector('input[type="number"]');
    const weight = weightInput ? parseFloat(weightInput.value) || 0 : 0;
    
    // Alergeny z td[1]
    const td1 = row.querySelectorAll('td')[1];
    if (td1) {
      td1.querySelectorAll('.badge, span').forEach(badge => {
        const a = badge.textContent.trim();
        if (a && a !== 'brak' && a !== '—' && a.length > 1 && !a.includes(',')) {
          allergensSet.add(a);
        }
      });
    }
    
    skladniki.push({ name: ingName, weight });
  });
  
  // Sortuj malejąco po wadze
  skladniki.sort((a, b) => b.weight - a.weight);
  
  // Buduj tekst składu z procentami
  const skladTotal = skladniki.reduce((sum, s) => sum + s.weight, 0);
  let sklad;
  if (skladniki.length > 0 && skladTotal > 0) {
    sklad = skladniki.map(s => {
      const pct = (s.weight / skladTotal) * 100;
      const pctStr = pct >= 0.5 && !s.name.includes('(') 
        ? ' ' + (pct >= 10 ? Math.round(pct) : pct.toFixed(1)) + '%'
        : '';
      return s.name + pctStr;
    }).join(', ');
  } else {
    sklad = instrukcja || 'Skład produktu...';
  }
  
  // Alergeny
  let allergens = Array.from(allergensSet);
  if (allergens.length === 0) allergens = ['brak'];

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
      satfat100: fmtG(per100Sat, 100), satfat450: fmtG(per100Sat, 450), satfat900: fmtG(per100Sat, 900),
      carb100: fmtG(per100Carb, 100),
      carb450: fmtG(per100Carb, 450),
      carb900: fmtG(per100Carb, 900),
      sug100: fmtG(per100Sug, 100),
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
  const logoSize = CFG.logoScale*0.18;
  const logoImg = logoB64
    ? `<img src="data:image/png;base64,${logoB64}" style="width:${logoSize}mm;height:${logoSize}mm;object-fit:contain;flex-shrink:0;mix-blend-mode:multiply;">`
    : `<img src="${location.origin}/icon.png" style="width:${logoSize}mm;height:${logoSize}mm;object-fit:contain;flex-shrink:0;mix-blend-mode:multiply;">`;

  const heroH = Math.round(CFG.logoScale * 0.35) + 'mm';
  const M = '10mm';
  const T = CFG.textSize;

  function hole_l() {
    return '';
  }
  function hole_r() {
    return '';
  }

  const allergenTags = data.allergens.map(a =>
    `<span style="border:0.3mm solid #000;border-radius:5mm;padding:.4mm 1.5mm;font-size:${T*0.9}mm;font-weight:700;color:#000;display:inline-block;margin:.3mm;">${a}</span>`
  ).join('');

  const n = data.nutri;
  const porcjaG = CFG.porcjaG;

  // Skalowanie wartości z 100g na pojemność porcji
  function scaleN(v100) {
    if (v100 === '—' || v100 == null) return '—';
    const num = parseFloat(String(v100).replace(',', '.'));
    if (isNaN(num)) return '—';
    const scaled = num * porcjaG / 100;
    if (scaled < 1) return scaled.toFixed(2).replace('.', ',');
    return scaled.toFixed(1).replace('.', ',');
  }
  function scaleKcal(v100) {
    if (v100 === '—' || v100 == null) return '—';
    const num = parseFloat(String(v100).replace(',', '.'));
    if (isNaN(num)) return '—';
    return Math.round(num * porcjaG / 100);
  }
  function kJfromKcal(kcal) {
    if (kcal === '—' || isNaN(kcal)) return '—';
    return Math.round(kcal * 4.184);
  }
  const _k100 = parseFloat(String(n.kcal100).replace(',','.')) || 0;
  const _kP   = scaleKcal(n.kcal100);
  const _kJ100 = _k100 ? kJfromKcal(_k100) : '—';
  const _kJP   = (_kP !== '—') ? kJfromKcal(_kP) : '—';

  // S4 — Wartości odżywcze (styl jak w aplikacji + dynamiczna pojemność)
  const s4 = `<div style="width:74mm;height:105mm;overflow:hidden;background:transparent;position:relative;">
    ${hole_r()}
    <div style="position:absolute;top:${M};bottom:${M};left:8mm;right:8mm;display:flex;flex-direction:column;justify-content:flex-start;font-family:'DM Sans',sans-serif;">
      <div style="margin-bottom:2mm;">
        <div style="font-weight:700;font-size:${T*1.4}mm;color:#000;line-height:1.1;margin-bottom:.5mm;">${data.name || 'Zupa'}</div>
        <div style="font-size:${T*0.85}mm;color:#444;">Porcja: ${porcjaG} g</div>
      </div>
      <table style="width:100%;border-collapse:collapse;color:#000;">
        <thead><tr>
          <th style="font-weight:600;font-size:${T*0.75}mm;letter-spacing:.2mm;text-transform:uppercase;color:#666;text-align:left;padding:1mm 1mm 1mm 0;border-bottom:.3mm solid #c8b89e;vertical-align:bottom;">WARTOŚĆ ODŻYWCZA</th>
          <th style="font-weight:600;font-size:${T*0.75}mm;letter-spacing:.2mm;text-transform:uppercase;color:#666;text-align:right;padding:1mm 1mm 1mm 0;border-bottom:.3mm solid #c8b89e;vertical-align:bottom;white-space:nowrap;">NA 100 G</th>
          <th style="font-weight:600;font-size:${T*0.75}mm;letter-spacing:.2mm;text-transform:uppercase;color:#666;text-align:right;padding:1mm 0 1mm 0;border-bottom:.3mm solid #c8b89e;vertical-align:bottom;white-space:nowrap;">NA PORCJĘ (${porcjaG}G)</th>
        </tr></thead>
        <tbody>
          <tr>
            <td style="font-size:${T*0.95}mm;font-weight:400;padding:1.2mm 1mm 1.2mm 0;border-bottom:.15mm solid #d8cab0;">Wartość energetyczna</td>
            <td style="font-size:${T*0.85}mm;text-align:right;padding:1.2mm 1mm 1.2mm 0;border-bottom:.15mm solid #d8cab0;white-space:nowrap;">${_kJ100} kJ / ${_k100 ? Math.round(_k100) : '—'} kcal</td>
            <td style="font-size:${T*0.85}mm;text-align:right;padding:1.2mm 0 1.2mm 0;border-bottom:.15mm solid #d8cab0;white-space:nowrap;">${_kJP} kJ / ${_kP} kcal</td>
          </tr>
          <tr>
            <td style="font-size:${T*0.95}mm;font-weight:400;padding:1.2mm 1mm 1.2mm 0;border-bottom:.15mm solid #d8cab0;">Tłuszcz</td>
            <td style="font-size:${T*0.95}mm;text-align:right;padding:1.2mm 1mm 1.2mm 0;border-bottom:.15mm solid #d8cab0;">${n.fat100}</td>
            <td style="font-size:${T*0.95}mm;text-align:right;padding:1.2mm 0 1.2mm 0;border-bottom:.15mm solid #d8cab0;">${scaleN(n.fat100)} g</td>
          </tr>
          <tr>
            <td style="font-size:${T*0.9}mm;font-weight:400;color:#444;padding:.8mm 1mm .8mm 3mm;border-bottom:.15mm solid #d8cab0;">w tym kwasy nasycone</td>
            <td style="font-size:${T*0.9}mm;text-align:right;padding:.8mm 1mm .8mm 0;border-bottom:.15mm solid #d8cab0;color:#444;">${n.satfat100}</td>
            <td style="font-size:${T*0.9}mm;text-align:right;padding:.8mm 0 .8mm 0;border-bottom:.15mm solid #d8cab0;color:#444;">${scaleN(n.satfat100)} g</td>
          </tr>
          <tr>
            <td style="font-size:${T*0.95}mm;font-weight:400;padding:1.2mm 1mm 1.2mm 0;border-bottom:.15mm solid #d8cab0;">Węglowodany</td>
            <td style="font-size:${T*0.95}mm;text-align:right;padding:1.2mm 1mm 1.2mm 0;border-bottom:.15mm solid #d8cab0;">${n.carb100}</td>
            <td style="font-size:${T*0.95}mm;text-align:right;padding:1.2mm 0 1.2mm 0;border-bottom:.15mm solid #d8cab0;">${scaleN(n.carb100)} g</td>
          </tr>
          <tr>
            <td style="font-size:${T*0.9}mm;font-weight:400;color:#444;padding:.8mm 1mm .8mm 3mm;border-bottom:.15mm solid #d8cab0;">w tym cukry</td>
            <td style="font-size:${T*0.9}mm;text-align:right;padding:.8mm 1mm .8mm 0;border-bottom:.15mm solid #d8cab0;color:#444;">${n.sug100}</td>
            <td style="font-size:${T*0.9}mm;text-align:right;padding:.8mm 0 .8mm 0;border-bottom:.15mm solid #d8cab0;color:#444;">${scaleN(n.sug100)} g</td>
          </tr>
          <tr>
            <td style="font-size:${T*0.95}mm;font-weight:400;padding:1.2mm 1mm 1.2mm 0;border-bottom:.15mm solid #d8cab0;">Białko</td>
            <td style="font-size:${T*0.95}mm;text-align:right;padding:1.2mm 1mm 1.2mm 0;border-bottom:.15mm solid #d8cab0;">${n.prot100}</td>
            <td style="font-size:${T*0.95}mm;text-align:right;padding:1.2mm 0 1.2mm 0;border-bottom:.15mm solid #d8cab0;">${scaleN(n.prot100)} g</td>
          </tr>
          <tr>
            <td style="font-size:${T*0.95}mm;font-weight:400;padding:1.2mm 1mm 1.2mm 0;">Sól</td>
            <td style="font-size:${T*0.95}mm;text-align:right;padding:1.2mm 1mm 1.2mm 0;">${n.salt100}</td>
            <td style="font-size:${T*0.95}mm;text-align:right;padding:1.2mm 0 1.2mm 0;">${scaleN(n.salt100)} g</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top:auto;padding-top:1.5mm;border-top:.2mm solid #c8b89e;">
        <div style="font-size:${T*0.75}mm;color:#000;line-height:1.5;"><strong>Producent:</strong> GrubaMicha Bartłomiej Radziszewski, ul. Polna 1, 81-745 Sopot</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:.8mm;">
          <div style="font-size:${T*0.8}mm;color:#000;font-weight:700;">grubamicha.pl</div>
          <div style="font-size:5mm;line-height:1;">♻</div>
        </div>
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
        
        <div style="display:flex;align-items:center;justify-content:center;gap:2mm;margin-top:2mm;"><div style="width:5mm;height:.3mm;background:#000;"></div><div style="width:1mm;height:1mm;border-radius:50%;background:#000;"></div><div style="width:5mm;height:.3mm;background:#000;"></div></div>
        <div style="font-size:${T}mm;font-weight:700;letter-spacing:.8mm;border:0.4mm solid #000;border-radius:10mm;padding:.5mm 2mm;color:#000;margin-top:2mm;">${data.volume}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding-top:2mm;gap:1mm;">
        <div style="font-size:${T*0.85}mm;font-weight:700;text-transform:uppercase;color:#000;text-align:center;letter-spacing:.5mm;">Produkt sterylizowany</div>
        <div style="font-size:${T*0.85}mm;font-weight:700;text-transform:uppercase;color:#000;text-align:center;letter-spacing:.5mm;">Bez konserwantów</div>
        <div style="font-size:${T*0.85}mm;font-weight:700;text-transform:uppercase;color:#000;text-align:center;letter-spacing:.5mm;">Bez ulepszaczy</div>
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

  // Buduj 4 etykiety w rzędzie, 2 rzędy na stronę A4 landscape (8 etykiet)
  // Strona 1: S4|S1|S4|S1 / S4|S1|S4|S1
  // Strona 2: S2|S3|S2|S3 / S2|S3|S2|S3
  const sheet1 = (s4 + s1 + s4 + s1) + (s4 + s1 + s4 + s1);
  const sheet2 = (s2 + s3 + s2 + s3) + (s2 + s3 + s2 + s3);

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
.sheet{width:297mm;height:210mm;display:flex;flex-wrap:wrap;overflow:visible;background:#fff;page-break-after:always;break-after:page;position:relative;}
.sheet > div{width:74mm;height:105mm;flex-shrink:0;}
.sheet:last-child{page-break-after:avoid;break-after:avoid;}.crop-mark{position:absolute;background:transparent;}.crop-mark::before,.crop-mark::after{content:"";position:absolute;background:#999;}.crop-mark.tl{top:3mm;left:3mm;width:5mm;height:5mm;}.crop-mark.tr{top:3mm;right:3mm;width:5mm;height:5mm;}.crop-mark.bl{bottom:3mm;left:3mm;width:5mm;height:5mm;}.crop-mark.br{bottom:3mm;right:3mm;width:5mm;height:5mm;}.crop-mark.tl::before,.crop-mark.bl::before{left:0;width:5mm;height:.3mm;}.crop-mark.tr::before,.crop-mark.br::before{right:0;width:5mm;height:.3mm;}.crop-mark.tl::before,.crop-mark.tr::before{top:0;}.crop-mark.bl::before,.crop-mark.br::before{bottom:0;}.crop-mark.tl::after,.crop-mark.tr::after{top:0;width:.3mm;height:5mm;}.crop-mark.bl::after,.crop-mark.br::after{bottom:0;width:.3mm;height:5mm;}.crop-mark.tl::after,.crop-mark.bl::after{left:0;}.crop-mark.tr::after,.crop-mark.br::after{right:0;}
.rotated{transform:rotate(180deg);transform-origin:center center;}
</style>
</head>
<body>
<div class="sheet"><div class="crop-mark tl"></div><div class="crop-mark tr"></div><div class="crop-mark bl"></div><div class="crop-mark br"></div>${sheet1}</div>
<div class="sheet rotated"><div class="crop-mark tl"></div><div class="crop-mark tr"></div><div class="crop-mark bl"></div><div class="crop-mark br"></div>${sheet2}</div>
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
      style="width:100%;margin-bottom:10px;">

    <label style="font-size:11px;color:#555;display:block;margin-bottom:2px;">
      Pojemność słoika (ml):
    </label>
    <input type="number" id="ety-jar" min="100" max="5000" step="50" value="${CFG.jarVolume}"
      style="width:100%;margin-bottom:14px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;">
<label style="font-size:11px;color:#555;display:block;margin-bottom:2px;">
      🥄 Pojemność porcji: <strong id="ety-porcja-val">${CFG.porcjaG}g</strong>
    </label>
    <input type="number" id="ety-porcja" min="50" max="2000" step="50" value="${CFG.porcjaG}"
      style="width:100%;margin-bottom:14px;padding:6px 10px;border:1px solid #ccc;border-radius:5px;font-size:13px;font-family:inherit;box-sizing:border-box;">

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
  panel.querySelector('#ety-jar').addEventListener('input', e => {
    CFG.jarVolume = parseInt(e.target.value) || 900;
  });

 panel.querySelector('#ety-porcja').addEventListener('input', e => {
    CFG.porcjaG = parseInt(e.target.value) || 400;
    panel.querySelector('#ety-porcja-val').textContent = CFG.porcjaG + 'g';
  });
  
  panel.querySelector('#ety-print').addEventListener('click', printEtykieta);
  panel.querySelector('#ety-close').addEventListener('click', () => panel.remove());
}

// ── ZAŁADUJ LOGO
function loadLogo() {
  // Spróbuj logo.png, potem icon.png jako fallback
  const tryLoad = (src) => fetch(src).then(r => {
    if (!r.ok) throw new Error('not found: ' + src);
    return r.blob();
  });
  
  tryLoad('logo.png').catch(() => tryLoad('icon.png')).then(blob => {
    const reader = new FileReader();
    reader.onload = e => { window._etyLogoB64 = e.target.result.split(',')[1]; };
    reader.readAsDataURL(blob);
  }).catch(e => console.log('Logo nie załadowane:', e.message));
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
