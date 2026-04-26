function getKartaData() {
  var t = getTotals();
  var cooked = parseFloat(document.getElementById('cookedWeight').value) || t.totRaw;
  var liters = parseFloat(document.getElementById('cookedLiters').value) || cooked/1000;
  var portion = parseFloat(document.getElementById('portionSize').value)||300;
  var r = 100/cooked;
  var pf = portion/100;
  var name = document.getElementById('dishName').value || 'Nazwa dania';
  var category = document.getElementById('dishCategory').value;
  var sorted = [...ingredients].sort(function(a,b){return b.weight-a.weight;});
  var allergenIds = [...new Set(sorted.flatMap(function(i){return i.allergens;}))];
  var allergenObjs = allergenIds.map(function(id){return ALLERGENS.find(function(a){return a.id===id;});}).filter(Boolean);
  var ingList = sorted.map(function(ing){
    var hasAllergen = ing.allergens.length > 0;
    var displayName = hasAllergen
      ? '<strong style="font-weight:800;text-decoration:underline;color:#8b2020">'+ing.name.toUpperCase()+'</strong>'
      : ing.name;
    if (ing.skladSzczegolowy) {
      displayName += ' <span style="font-size:9pt;color:#6b6252;">(' + ing.skladSzczegolowy + ')</span>';
    }
    return displayName;
  }).join(', ');
  return {
    name:name, category:category, cooked:cooked, liters:liters, portion:portion,
    totRaw:t.totRaw, sorted:sorted, allergenObjs:allergenObjs, ingList:ingList,
    r:r, pf:pf,
    kcal:t.totKcal*r, prot:t.totProt*r, fat:t.totFat*r, sat:t.totSat*r,
    carb:t.totCarb*r, sug:t.totSugar*r, salt:t.totSalt*r,
    kcalP:t.totKcal*r*pf, kjP:t.totKcal*r*4.184*pf, kj:t.totKcal*r*4.184,
    przepisInstrukcja:document.getElementById('przepisInstrukcja')?document.getElementById('przepisInstrukcja').value:'',
    przepisNotatki:document.getElementById('przepisNotatki')?document.getElementById('przepisNotatki').value:'',
  };
}

function openPrintWindow(html) {
  var win = window.open('','_blank');
  if (!win) { alert('Zezwól na wyskakujące okna dla tej strony i spróbuj ponownie.'); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function getStyles() {
  return '<style>'
    +'* { box-sizing:border-box; margin:0; padding:0; }'
    +'body { font-family:"DM Sans",sans-serif; color:#1a1814; padding:15mm; font-size:10pt; }'
    +'@page { size:A4; margin:0; }'
    +'.header { display:flex; justify-content:space-between; border-bottom:2px solid #1a1814; padding-bottom:10px; margin-bottom:14px; }'
    +'.dish-name { font-family:"Playfair Display",serif; font-size:22pt; font-weight:700; }'
    +'.brand { font-family:"Playfair Display",serif; font-size:13pt; color:#d4a84b; font-weight:600; }'
    +'h3 { font-size:8pt; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#6b6252; margin:12px 0 5px; border-bottom:1px solid #e0d8cc; padding-bottom:3px; }'
    +'table { width:100%; border-collapse:collapse; font-size:9.5pt; }'
    +'th { font-size:8pt; font-weight:700; text-transform:uppercase; color:#6b6252; padding:4px 8px; text-align:right; border-bottom:2px solid #1a1814; }'
    +'th:first-child { text-align:left; }'
    +'td { padding:4px 8px; border-bottom:1px solid #e0d8cc; text-align:right; }'
    +'td:first-child { text-align:left; }'
    +'.mr td { font-weight:600; }'
    +'.sr td { color:#6b6252; font-size:8.5pt; }'
    +'.sr td:first-child { padding-left:14px; }'
    +'.ibox { background:#f9f5ec; border:1px solid #e0d8cc; border-radius:5px; padding:10px; font-size:9.5pt; line-height:1.7; }'
    +'.abox { background:#fff0f0; border:1px solid #f0b0b0; border-radius:5px; padding:8px 10px; margin-top:8px; font-size:8.5pt; color:#8b2020; }'
    +'.pbox { border:1px solid #e0d8cc; border-radius:5px; padding:10px; font-size:9.5pt; line-height:1.6; white-space:pre-wrap; }'
    +'.footer { margin-top:16px; font-size:7.5pt; color:#aaa; border-top:1px solid #e0d8cc; padding-top:6px; display:flex; justify-content:space-between; }'
    +'.info-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }'
    +'.info-box { background:#f5f0e8; border-radius:5px; padding:8px 12px; }'
    +'.info-label { font-size:8pt; text-transform:uppercase; letter-spacing:.08em; color:#6b6252; }'
    +'.info-value { font-size:11pt; font-weight:700; margin-top:2px; }'
    +'.partia { border:2px solid #1a1814; border-radius:5px; padding:6px 12px; display:inline-block; margin-top:8px; }'
    +'.fill-line { border-bottom:1px solid #1a1814; display:inline-block; min-width:120px; margin-left:8px; }'
    +'@media print { .no-print { display:none; } }'
    +'</style>';
}

function getNvTable(d) {
  var html = '<table><thead><tr><th>Wartość odżywcza</th><th>na 100 g</th><th>na porcję ('+d.portion+'g)</th></tr></thead><tbody>';
  html += '<tr class="mr"><td>Wartość energetyczna</td><td>'+d.kj.toFixed(0)+' kJ / '+d.kcal.toFixed(0)+' kcal</td><td>'+d.kjP.toFixed(0)+' kJ / '+d.kcalP.toFixed(0)+' kcal</td></tr>';
  html += '<tr class="mr"><td>Tłuszcz</td><td>'+d.fat.toFixed(1)+' g</td><td>'+(d.fat*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="sr"><td>w tym kwasy nasycone</td><td>'+d.sat.toFixed(1)+' g</td><td>'+(d.sat*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="mr"><td>Węglowodany</td><td>'+d.carb.toFixed(1)+' g</td><td>'+(d.carb*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="sr"><td>w tym cukry</td><td>'+d.sug.toFixed(1)+' g</td><td>'+(d.sug*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="mr"><td>Białko</td><td>'+d.prot.toFixed(1)+' g</td><td>'+(d.prot*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="mr"><td>Sól</td><td>'+d.salt.toFixed(2)+' g</td><td>'+(d.salt*d.pf).toFixed(2)+' g</td></tr>';
  html += '</tbody></table>';
  return html;
}

function printKartaDania() {
  var d = getKartaData();
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
  html += '<title>Karta Dania - '+d.name+'</title>';
  html += '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">';
  html += getStyles();
  html += '</head><body><div class="no-print" style="position:fixed;top:15px;right:15px;z-index:999;"><button onclick="window.print()" style="background:#d4a84b;color:#1a1814;border:none;border-radius:8px;padding:10px 20px;font-size:13pt;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);">&#128438; Drukuj</button></div>';
  html += '<div class="header">';
  html += '<div><div class="dish-name">'+d.name+'</div><div style="font-size:9pt;color:#6b6252;margin-top:3px">'+d.category+'</div></div>';
  html += '<div style="text-align:right"><div class="brand">&#127858; Gruba Micha</div>';
  html += '<div style="font-size:9pt;color:#6b6252;margin-top:4px">'+new Date().toLocaleDateString('pl-PL')+'</div></div>';
  html += '</div>';
  html += '<h3>Wartość odżywcza</h3>'+getNvTable(d);
  html += '<h3>Wykaz składników</h3><div class="ibox">'+d.ingList+'</div>';
  if (d.allergenObjs.length) html += '<div class="abox"><strong>Alergeny:</strong> '+d.allergenObjs.map(function(a){return a.icon+' '+a.name;}).join(' &middot; ')+'</div>';
  html += '<h3>Uwagi</h3><div class="pbox" style="min-height:60px;"></div>';
  html += '<div class="footer"><span>Oznakowanie zgodne z Rozporządzeniem UE nr 1169/2011</span><span>Porcja: '+d.portion+'g &middot; '+d.cooked.toFixed(0)+'g gotowego</span></div>';
  html += '</body></html>';
  openPrintWindow(html);
}

function printKartaProduktu() {
  var d = getKartaData();
  var skladnikiRows = d.sorted.map(function(ing){
    var loss = ing.loss || 0;
    var netto = Math.round(ing.weight*(1-loss/100));
    var n = ing.allergens.length ? '<strong style="color:#8b2020">'+ing.name.toUpperCase()+'</strong>' : ing.name;
    return '<tr><td>'+n+'</td><td>'+ing.weight+' g</td><td>'+(loss>0?loss+'%':'—')+'</td><td>'+netto+' g</td></tr>';
  }).join('');

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
  html += '<title>Karta Produktu - '+d.name+'</title>';
  html += '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">';
  html += getStyles();
  html += '</head><body><div class="no-print" style="position:fixed;top:15px;right:15px;z-index:999;"><button onclick="window.print()" style="background:#d4a84b;color:#1a1814;border:none;border-radius:8px;padding:10px 20px;font-size:13pt;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);">&#128438; Drukuj</button></div>';
  html += '<div class="header">';
  html += '<div>';
  html += '<div class="dish-name">'+d.name+'</div>';
  html += '<div style="font-size:8.5pt;color:#6b6252;margin-top:2px">'+d.category+' &middot; DOKUMENT WEWNĘTRZNY</div>';
  html += '<div class="partia">';
  html += '<div style="font-size:8pt;color:#6b6252;text-transform:uppercase;letter-spacing:.08em">Nr partii</div>';
  html += '<div style="font-size:13pt;font-weight:700" class="fill-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>';
  html += '</div></div>';
  html += '<div style="text-align:right">';
  html += '<div class="brand">&#127858; Gruba Micha</div>';
  html += '<div style="font-size:8.5pt;color:#6b6252;margin-top:4px">Data produkcji: <span class="fill-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>';
  
  html += '</div></div>';
  html += '<div class="info-grid">';
  html += '<div class="info-box"><div class="info-label">Masa gotowego produktu</div><div class="info-value">'+d.cooked.toFixed(0)+' g &middot; '+d.liters.toFixed(2)+' l</div></div>';
  html += '<div class="info-box"><div class="info-label">Porcja / ilość porcji</div><div class="info-value">'+d.portion+'g &middot; '+(d.cooked/d.portion).toFixed(1)+' szt</div></div>';
  html += '</div>';
  html += '<h3>Składniki &mdash; ilości dla '+d.liters.toFixed(2)+' l</h3>';
  html += '<table><thead><tr><th>Składnik</th><th>Brutto (g)</th><th>Straty</th><th>Netto (g)</th></tr></thead><tbody>';
  html += skladnikiRows;
  html += '<tr style="font-weight:700;background:#f5f0e8"><td>ŁĄCZNIE</td><td>'+d.totRaw+' g</td><td></td><td>'+d.cooked.toFixed(0)+' g</td></tr>';
  html += '</tbody></table>';
  html += '<h3>Wartość odżywcza</h3>'+getNvTable(d);
  html += '<h3>Wykaz składników i alergeny</h3><div class="ibox">'+d.ingList+'</div>';
  if (d.allergenObjs.length) html += '<div class="abox"><strong>Alergeny:</strong> '+d.allergenObjs.map(function(a){return a.icon+' '+a.name;}).join(' &middot; ')+'</div>';
  if (d.przepisInstrukcja) html += '<h3>Instrukcja przygotowania</h3><div class="pbox">'+d.przepisInstrukcja+'</div>';
  if (d.przepisNotatki) html += '<h3>Notatki</h3><div class="pbox">'+d.przepisNotatki+'</div>';
  html += '<div class="footer"><span>Dokument wewnętrzny &middot; Gruba Micha &middot; EU 1169/2011</span><span>'+new Date().toLocaleDateString('pl-PL')+'</span></div>';
  html += '</body></html>';
  openPrintWindow(html);
}


let _skladIdx = null;

function openSkladModal(idx) {
  _skladIdx = idx;
  const ing = ingredients[idx];
  document.getElementById('skladModalTitle').textContent = '📋 Skład: ' + ing.name;
  document.getElementById('skladInput').value = ing.skladSzczegolowy || '';
  document.getElementById('aiSkladStatus').textContent = '';
  document.getElementById('skladAlergenyPreview').style.display = 'none';
  document.getElementById('skladModal').style.display = 'flex';
  // Pokaz wykryte alergeny jesli jest juz skład
  if (ing.skladSzczegolowy) previewSkladAlergeny(ing.skladSzczegolowy);
}

function closeSkladModal() {
  document.getElementById('skladModal').style.display = 'none';
  _skladIdx = null;
}

function previewSkladAlergeny(text) {
  const detected = detectAllergens(text);
  const el = document.getElementById('skladAlergenyPreview');
  const list = document.getElementById('skladAlergenyList');
  if (detected.length) {
    list.innerHTML = detected.map(id => {
      const a = ALLERGENS.find(x=>x.id===id);
      return '<span style="background:#c0392b22;color:var(--danger);border:1px solid #c0392b44;border-radius:4px;font-size:11px;padding:2px 7px;margin-right:4px;">'+a.icon+' '+a.name+'</span>';
    }).join('');
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}

document.addEventListener('input', function(e) {
  if (e.target.id === 'skladInput') previewSkladAlergeny(e.target.value);
});

function saveSklad() {
  if (_skladIdx === null) return;
  const sklad = document.getElementById('skladInput').value.trim();
  ingredients[_skladIdx].skladSzczegolowy = sklad;
  // Merge alergeny z podstawowych + ze składu szczegółowego
  const baseAllergens = detectAllergens(ingredients[_skladIdx].name);
  const skladAllergens = detectAllergens(sklad);
  ingredients[_skladIdx].allergens = [...new Set([...baseAllergens, ...skladAllergens])];
  const savedName = ingredients[_skladIdx] ? ingredients[_skladIdx].name : '';
  closeSkladModal();
  renderTable();
  if(savedName) showToast('✓ Zapisano skład: ' + savedName);
}

async function aiGetSklad() {
  if (_skladIdx === null) return;
  const ing = ingredients[_skladIdx];
  const key = getApiKey();
  if (!key) { showToast('Brak klucza API', true); return; }
  const btn = document.getElementById('aiSkladBtn');
  const status = document.getElementById('aiSkladStatus');
  btn.innerHTML = '<span class="spinner"></span>';
  btn.disabled = true;
  status.textContent = 'Pobieranie...';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: 'Podaj typowy skład produktu "'+ing.name+'" stosowanego w gastronomii w Polsce. Podaj TYLKO listę składników oddzielonych przecinkami, bez dodatkowego tekstu. Uwzględnij typowe składniki z etykiety.'
        }]
      })
    });
    const data = await res.json();
    if (data.content && data.content[0]) {
      const sklad = data.content[0].text.trim();
      document.getElementById('skladInput').value = sklad;
      previewSkladAlergeny(sklad);
      status.textContent = '✓ Pobrano';
    }
  } catch(e) {
    status.textContent = 'Błąd pobierania';
  }
  btn.innerHTML = '🤖 Pobierz skład AI';
  btn.disabled = false;
}
// ── BATCH PRINT ──

function toggleRecipeSelect(id, checkbox) {
  if (checkbox.checked) {
    _selectedRecipes.add(id);
  } else {
    _selectedRecipes.delete(id);
  }
  updateBatchBar();
}

function updateBatchBar() {
  const bar = document.getElementById('batchPrintBar');
  const count = document.getElementById('batchCount');
  if (!bar) return;
  if (_selectedRecipes.size > 0) {
    bar.style.display = 'flex';
    count.textContent = _selectedRecipes.size + ' zaznaczon' + (_selectedRecipes.size === 1 ? 'a' : 'ych');
  } else {
    bar.style.display = 'none';
  }
}

function clearSelection() {
  _selectedRecipes.clear();
  document.querySelectorAll('.recipe-checkbox').forEach(cb => cb.checked = false);
  updateBatchBar();
}

async function printSelectedRecipes() {
  if (!_selectedRecipes.size) return;
  const ids = [..._selectedRecipes];
  const btn = document.querySelector('#batchPrintBar .btn');
  btn.innerHTML = '<span class="spinner"></span>';
  btn.disabled = true;

  // Pobierz wszystkie receptury jednym zapytaniem
  const recipes = [];
  try {
    const res = await fetch('api.php?action=batch&ids=' + ids.join(','));
    const rows = await res.json();
    rows.forEach(function(row) {
      try { recipes.push(JSON.parse(row.data)); } catch(e) {}
    });
  } catch(e) {}

  // Generuj karty w jednym oknie
  let html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
  html += '<title>Karty Dania - ' + recipes.length + ' dań</title>';
  html += '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">';
  html += getStyles();
  html += '<style>@media print { .page-break { page-break-after: always; } .no-print { display:none !important; } } .no-print { position:fixed;top:15px;right:15px;z-index:999; }</style>';
  html += '</head><body>';
  html += '<div class="no-print"><button onclick="window.print()" style="background:#d4a84b;color:#1a1814;border:none;border-radius:8px;padding:10px 20px;font-size:13pt;font-weight:700;cursor:pointer;">🖨️ Drukuj wszystkie (' + recipes.length + ')</button></div>';

  recipes.forEach(function(r, i) {
    // Zbuduj obiekt d jak w getKartaData ale z danych receptury
    var ings = (r.ingredients || []).sort(function(a,b){return b.weight-a.weight;});
    var totRaw = ings.reduce(function(s,i){return s+i.weight;},0);
    var cooked = parseFloat(r.cookedWeight) || totRaw;
    var liters = parseFloat(r.cookedLiters) || cooked/1000;
    var portion = parseFloat(r.portionSize) || 300;
    var pf = portion/100;
    var rc = 100/cooked;

    var totKcal=0,totProt=0,totFat=0,totSat=0,totCarb=0,totSug=0,totSalt=0;
    ings.forEach(function(ing){
      var f=ing.weight/100;
      totKcal+=ing.per100.kcal*f; totProt+=ing.per100.protein*f;
      totFat+=ing.per100.fat*f; totSat+=ing.per100.saturated*f;
      totCarb+=ing.per100.carbs*f; totSug+=ing.per100.sugars*f;
      totSalt+=ing.per100.salt*f;
    });

    var allergenIds = [];
    ings.forEach(function(ing){ ing.allergens.forEach(function(a){ if(!allergenIds.includes(a)) allergenIds.push(a); }); });
    var allergenObjs = allergenIds.map(function(id){ return ALLERGENS.find(function(a){return a.id===id;}); }).filter(Boolean);
    var ingList = ings.map(function(ing){
      var hasA = ing.allergens.length > 0;
      var dn = hasA ? '<strong style="font-weight:800;text-decoration:underline;color:#8b2020">'+ing.name.toUpperCase()+'</strong>' : ing.name;
      if (ing.skladSzczegolowy) dn += ' <span style="font-size:9pt;color:#6b6252;">('+ing.skladSzczegolowy+')</span>';
      return dn;
    }).join(', ');

    var kj = totKcal*rc*4.184;
    var kcal = totKcal*rc;

    html += '<div class="' + (i < recipes.length-1 ? 'page-break' : '') + '">';
    html += '<div class="header">';
    html += '<div><div class="dish-name">'+r.name+'</div><div style="font-size:9pt;color:#6b6252;margin-top:3px">'+(r.category||'')+'</div></div>';
    html += '<div style="text-align:right"><div class="brand">&#127858; Gruba Micha</div>';
    html += '<div style="font-size:9pt;color:#6b6252;margin-top:4px">'+new Date().toLocaleDateString('pl-PL')+'</div></div>';
    html += '</div>';

    // Tabela NV
    var d = {kcal:kcal,kj:kj,fat:totFat*rc,sat:totSat*rc,carb:totCarb*rc,sug:totSug*rc,prot:totProt*rc,salt:totSalt*rc,pf:pf,portion:portion};
    html += '<h3>Wartość odżywcza</h3>';
    html += getNvTableFromData(d);

    html += '<h3>Wykaz składników</h3><div class="ibox">'+ingList+'</div>';
    if (allergenObjs.length) html += '<div class="abox"><strong>Alergeny:</strong> '+allergenObjs.map(function(a){return a.icon+' '+a.name;}).join(' &middot; ')+'</div>';
    html += '<h3>Uwagi</h3><div style="border:1px solid #1a1814;border-radius:6px;padding:12px;min-height:50px;"></div>';
    html += '<div class="footer"><span>Oznakowanie zgodne z Rozporządzeniem UE nr 1169/2011</span><span>Porcja: '+portion+'g &middot; '+cooked.toFixed(0)+'g gotowego</span></div>';
    html += '</div>';
  });

  // Generuj PDF przez ukryty iframe
  var container = document.getElementById('pdfContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'pdfContainer';
    container.style.cssText = 'position:fixed;left:-9999px;top:0;width:210mm;background:white;';
    document.body.appendChild(container);
  }
  container.innerHTML = html;

  // Uzyj html2pdf
  var script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
  script.onload = function() {
    var name = 'Karty_Dania_' + new Date().toLocaleDateString('pl-PL').replace(/\./g,'-') + '.pdf';
    html2pdf().set({
      margin: 10,
      filename: name,
      image: {type:'jpeg', quality:0.98},
      html2canvas: {scale:2, useCORS:true},
      jsPDF: {unit:'mm', format:'a4', orientation:'portrait'},
      pagebreak: {mode:'css', before:'.page-break'}
    }).from(container).save().then(function() {
      container.innerHTML = '';
      btn.innerHTML = '🖨️ Drukuj zaznaczone';
      btn.disabled = false;
      showToast('✓ PDF wygenerowany');
    });
  };
  document.head.appendChild(script);
}

function getNvTableFromData(d) {
  var html = '<table><thead><tr><th>Wartość odżywcza</th><th>na 100 g</th><th>na porcję ('+d.portion+'g)</th></tr></thead><tbody>';
  html += '<tr class="mr"><td>Wartość energetyczna</td><td>'+d.kj.toFixed(0)+' kJ / '+d.kcal.toFixed(0)+' kcal</td><td>'+(d.kjP||d.kj*d.pf).toFixed(0)+' kJ / '+(d.kcalP||d.kcal*d.pf).toFixed(0)+' kcal</td></tr>';
  html += '<tr class="mr"><td>Tłuszcz</td><td>'+d.fat.toFixed(1)+' g</td><td>'+(d.fat*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="sr"><td>w tym kwasy nasycone</td><td>'+d.sat.toFixed(1)+' g</td><td>'+(d.sat*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="mr"><td>Węglowodany</td><td>'+d.carb.toFixed(1)+' g</td><td>'+(d.carb*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="sr"><td>w tym cukry</td><td>'+d.sug.toFixed(1)+' g</td><td>'+(d.sug*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="mr"><td>Białko</td><td>'+d.prot.toFixed(1)+' g</td><td>'+(d.prot*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="mr"><td>Sól</td><td>'+d.salt.toFixed(2)+' g</td><td>'+(d.salt*d.pf).toFixed(2)+' g</td></tr>';
  html += '</tbody></table>';
  return html;
}

function selectAllRecipes() {
  document.querySelectorAll('.recipe-checkbox').forEach(function(cb) {
    cb.checked = true;
    cb.dispatchEvent(new Event('change'));
  });
  updateBatchBar();
}
