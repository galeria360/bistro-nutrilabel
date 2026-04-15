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
    return ing.allergens.length
      ? '<strong style="font-weight:800;text-decoration:underline;color:#8b2020">'+ing.name.toUpperCase()+'</strong>'
      : ing.name;
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

function printKartaDania() {
  var d = getKartaData();
  var uwagi = prompt('Uwagi (opcjonalnie):', '') || '';
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
  html += '<title>Karta Dania - '+d.name+'</title>';
  html += '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">';
  html += '<style>';
  html += '* { box-sizing:border-box; margin:0; padding:0; }';
  html += 'body { font-family:"DM Sans",sans-serif; color:#1a1814; padding:20mm; font-size:11pt; }';
  html += '@page { size:A4; margin:0; }';
  html += '.header { display:flex; justify-content:space-between; border-bottom:2px solid #1a1814; padding-bottom:12px; margin-bottom:20px; }';
  html += '.dish-name { font-family:"Playfair Display",serif; font-size:24pt; font-weight:700; }';
  html += '.brand { font-family:"Playfair Display",serif; font-size:14pt; color:#d4a84b; font-weight:600; }';
  html += 'h3 { font-size:9pt; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#6b6252; margin:18px 0 8px; }';
  html += 'table { width:100%; border-collapse:collapse; font-size:10pt; }';
  html += 'th { font-size:8pt; font-weight:700; text-transform:uppercase; color:#6b6252; padding:5px 8px; text-align:right; border-bottom:2px solid #1a1814; }';
  html += 'th:first-child { text-align:left; }';
  html += 'td { padding:5px 8px; border-bottom:1px solid #e0d8cc; text-align:right; }';
  html += 'td:first-child { text-align:left; }';
  html += '.mr td { font-weight:600; }';
  html += '.sr td { color:#6b6252; font-size:9pt; }';
  html += '.sr td:first-child { padding-left:16px; }';
  html += '.ibox { background:#f9f5ec; border:1px solid #e0d8cc; border-radius:6px; padding:12px; font-size:10pt; line-height:1.7; }';
  html += '.abox { background:#fff0f0; border:1px solid #f0b0b0; border-radius:6px; padding:10px 12px; margin-top:10px; font-size:9pt; color:#8b2020; }';
  html += '.footer { margin-top:24px; font-size:8pt; color:#aaa; border-top:1px solid #e0d8cc; padding-top:8px; display:flex; justify-content:space-between; }';
  html += '</style></head><body>';
  html += '<div class="header"><div>';
  html += '<div class="dish-name">'+d.name+'</div>';
  html += '<div style="font-size:10pt;color:#6b6252;margin-top:4px">'+d.category+'</div>';
  html += '</div><div style="text-align:right">';
  html += '<div class="brand">&#127858; Gruba Micha</div>';
  html += '<div style="font-size:9pt;color:#6b6252;margin-top:4px">Data: '+new Date().toLocaleDateString('pl-PL')+'</div>';
  html += '</div></div>';
  html += '<h3>Wartość odżywcza</h3>';
  html += '<table><thead><tr><th>Wartość odżywcza</th><th>na 100 g</th><th>na porcję ('+d.portion+'g)</th></tr></thead><tbody>';
  html += '<tr class="mr"><td>Wartość energetyczna</td><td>'+d.kj.toFixed(0)+' kJ / '+d.kcal.toFixed(0)+' kcal</td><td>'+d.kjP.toFixed(0)+' kJ / '+d.kcalP.toFixed(0)+' kcal</td></tr>';
  html += '<tr class="mr"><td>Tłuszcz</td><td>'+d.fat.toFixed(1)+' g</td><td>'+(d.fat*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="sr"><td>w tym kwasy nasycone</td><td>'+d.sat.toFixed(1)+' g</td><td>'+(d.sat*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="mr"><td>Węglowodany</td><td>'+d.carb.toFixed(1)+' g</td><td>'+(d.carb*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="sr"><td>w tym cukry</td><td>'+d.sug.toFixed(1)+' g</td><td>'+(d.sug*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="mr"><td>Białko</td><td>'+d.prot.toFixed(1)+' g</td><td>'+(d.prot*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="mr"><td>Sól</td><td>'+d.salt.toFixed(2)+' g</td><td>'+(d.salt*d.pf).toFixed(2)+' g</td></tr>';
  html += '</tbody></table>';
  html += '<h3>Wykaz składników</h3>';
  html += '<div class="ibox">'+d.ingList+'</div>';
  if (d.allergenObjs.length) {
    html += '<div class="abox"><strong>Alergeny:</strong> '+d.allergenObjs.map(function(a){return a.icon+' '+a.name;}).join(' &middot; ')+'</div>';
  }
  if (uwagi) html += '<h3>Uwagi</h3><div style="border:1px solid #e0d8cc;border-radius:6px;padding:12px;min-height:60px">'+uwagi+'</div>';
  html += '<div class="footer"><span>Oznakowanie zgodne z Rozporządzeniem UE nr 1169/2011</span><span>Porcja: '+d.portion+'g &middot; Masa gotowego: '+d.cooked.toFixed(0)+'g</span></div>';
  html += '<script>window.onload=function(){window.print();}<\/script>';
  html += '</body></html>';
  var win = window.open('','_blank');
  win.document.write(html);
  win.document.close();
}

function printKartaProduktu() {
  var d = getKartaData();
  var partia = prompt('Numer partii:', '') || '—';
  var dataProdukcji = prompt('Data produkcji:', new Date().toLocaleDateString('pl-PL')) || new Date().toLocaleDateString('pl-PL');
  var skladnikiRows = d.sorted.map(function(ing){
    var loss = ing.loss || 0;
    var netto = Math.round(ing.weight * (1-loss/100));
    var nameCell = ing.allergens.length ? '<strong style="color:#8b2020">'+ing.name.toUpperCase()+'</strong>' : ing.name;
    return '<tr><td>'+nameCell+'</td><td style="text-align:right">'+ing.weight+' g</td><td style="text-align:right">'+(loss>0?loss+'%':'—')+'</td><td style="text-align:right">'+netto+' g</td></tr>';
  }).join('');
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
  html += '<title>Karta Produktu - '+d.name+'</title>';
  html += '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">';
  html += '<style>';
  html += '* { box-sizing:border-box; margin:0; padding:0; }';
  html += 'body { font-family:"DM Sans",sans-serif; color:#1a1814; padding:15mm; font-size:10pt; }';
  html += '@page { size:A4; margin:0; }';
  html += '.header { display:flex; justify-content:space-between; border-bottom:2px solid #1a1814; padding-bottom:10px; margin-bottom:14px; }';
  html += '.dish-name { font-family:"Playfair Display",serif; font-size:20pt; font-weight:700; }';
  html += '.brand { font-family:"Playfair Display",serif; font-size:12pt; color:#d4a84b; font-weight:600; }';
  html += '.partia { border:2px solid #1a1814; border-radius:5px; padding:6px 12px; display:inline-block; margin-top:6px; }';
  html += '.info-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px; }';
  html += '.info-box { background:#f5f0e8; border-radius:5px; padding:7px 10px; }';
  html += '.info-label { font-size:8pt; text-transform:uppercase; letter-spacing:.08em; color:#6b6252; }';
  html += '.info-value { font-size:11pt; font-weight:700; margin-top:2px; }';
  html += 'h3 { font-size:8pt; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#6b6252; margin:12px 0 5px; border-bottom:1px solid #e0d8cc; padding-bottom:3px; }';
  html += 'table { width:100%; border-collapse:collapse; font-size:9pt; }';
  html += 'th { font-size:7.5pt; font-weight:700; text-transform:uppercase; color:#6b6252; padding:4px 6px; text-align:right; border-bottom:2px solid #1a1814; }';
  html += 'th:first-child { text-align:left; }';
  html += 'td { padding:3px 6px; border-bottom:1px solid #e0d8cc; }';
  html += '.mr td { font-weight:600; }';
  html += '.sr td { color:#6b6252; font-size:8.5pt; }';
  html += '.sr td:first-child { padding-left:14px; }';
  html += '.ibox { background:#f9f5ec; border:1px solid #e0d8cc; border-radius:5px; padding:9px; font-size:9pt; line-height:1.7; }';
  html += '.abox { background:#fff0f0; border:1px solid #f0b0b0; border-radius:5px; padding:7px 10px; margin-top:7px; font-size:8.5pt; color:#8b2020; }';
  html += '.pbox { border:1px solid #e0d8cc; border-radius:5px; padding:9px; font-size:9pt; line-height:1.6; white-space:pre-wrap; }';
  html += '.footer { margin-top:14px; font-size:7.5pt; color:#aaa; border-top:1px solid #e0d8cc; padding-top:6px; display:flex; justify-content:space-between; }';
  html += '</style></head><body>';
  html += '<div class="header"><div>';
  html += '<div class="dish-name">'+d.name+'</div>';
  html += '<div style="font-size:8.5pt;color:#6b6252;margin-top:2px">'+d.category+' &middot; DOKUMENT WEWNĘTRZNY</div>';
  html += '<div class="partia"><div style="font-size:8pt;color:#6b6252;text-transform:uppercase;letter-spacing:.08em">Nr partii</div><div style="font-size:13pt;font-weight:700">'+partia+'</div></div>';
  html += '</div><div style="text-align:right">';
  html += '<div class="brand">&#127858; Gruba Micha</div>';
  html += '<div style="font-size:8.5pt;color:#6b6252;margin-top:4px">Data produkcji: <strong>'+dataProdukcji+'</strong></div>';
  html += '<div style="font-size:8.5pt;color:#6b6252;margin-top:2px">Wydruk: '+new Date().toLocaleDateString('pl-PL')+'</div>';
  html += '</div></div>';
  html += '<div class="info-grid">';
  html += '<div class="info-box"><div class="info-label">Masa gotowego produktu</div><div class="info-value">'+d.cooked.toFixed(0)+' g &middot; '+d.liters.toFixed(2)+' l</div></div>';
  html += '<div class="info-box"><div class="info-label">Porcja / ilość porcji</div><div class="info-value">'+d.portion+'g &middot; '+(d.cooked/d.portion).toFixed(1)+' szt</div></div>';
  html += '</div>';
  html += '<h3>Składniki — ilości dla '+d.liters.toFixed(2)+' l</h3>';
  html += '<table><thead><tr><th>Składnik</th><th style="text-align:right">Brutto (g)</th><th style="text-align:right">Straty</th><th style="text-align:right">Netto (g)</th></tr></thead><tbody>';
  html += skladnikiRows;
  html += '<tr style="font-weight:700;background:#f5f0e8"><td>ŁĄCZNIE</td><td style="text-align:right">'+d.totRaw+' g</td><td></td><td style="text-align:right">'+d.cooked.toFixed(0)+' g</td></tr>';
  html += '</tbody></table>';
  html += '<h3>Wartość odżywcza (na 100g)</h3>';
  html += '<table><thead><tr><th>Składnik</th><th style="text-align:right">na 100g</th><th style="text-align:right">na porcję ('+d.portion+'g)</th></tr></thead><tbody>';
  html += '<tr class="mr"><td>Energia</td><td style="text-align:right">'+d.kj.toFixed(0)+' kJ / '+d.kcal.toFixed(0)+' kcal</td><td style="text-align:right">'+d.kjP.toFixed(0)+' kJ / '+d.kcalP.toFixed(0)+' kcal</td></tr>';
  html += '<tr class="mr"><td>Tłuszcz</td><td style="text-align:right">'+d.fat.toFixed(1)+' g</td><td style="text-align:right">'+(d.fat*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="sr"><td>w tym nasycone</td><td style="text-align:right">'+d.sat.toFixed(1)+' g</td><td style="text-align:right">'+(d.sat*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="mr"><td>Węglowodany</td><td style="text-align:right">'+d.carb.toFixed(1)+' g</td><td style="text-align:right">'+(d.carb*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="sr"><td>w tym cukry</td><td style="text-align:right">'+d.sug.toFixed(1)+' g</td><td style="text-align:right">'+(d.sug*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="mr"><td>Białko</td><td style="text-align:right">'+d.prot.toFixed(1)+' g</td><td style="text-align:right">'+(d.prot*d.pf).toFixed(1)+' g</td></tr>';
  html += '<tr class="mr"><td>Sól</td><td style="text-align:right">'+d.salt.toFixed(2)+' g</td><td style="text-align:right">'+(d.salt*d.pf).toFixed(2)+' g</td></tr>';
  html += '</tbody></table>';
  html += '<h3>Wykaz składników i alergeny</h3>';
  html += '<div class="ibox">'+d.ingList+'</div>';
  if (d.allergenObjs.length) {
    html += '<div class="abox"><strong>Alergeny:</strong> '+d.allergenObjs.map(function(a){return a.icon+' '+a.name;}).join(' &middot; ')+'</div>';
  }
  if (d.przepisInstrukcja) html += '<h3>Instrukcja przygotowania</h3><div class="pbox">'+d.przepisInstrukcja+'</div>';
  if (d.przepisNotatki) html += '<h3>Notatki</h3><div class="pbox">'+d.przepisNotatki+'</div>';
  html += '<div class="footer"><span>Dokument wewnętrzny &middot; Gruba Micha &middot; EU 1169/2011</span><span>Partia: '+partia+' &middot; '+dataProdukcji+'</span></div>';
  html += '<script>window.onload=function(){window.print();}<\/script>';
  html += '</body></html>';
  var win = window.open('','_blank');
  win.document.write(html);
  win.document.close();
}
