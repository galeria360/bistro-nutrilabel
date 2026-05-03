// ============================================================
// menu-print.js  —  Gruba Micha | Generator Karty Menu v3
// ============================================================
(function () {
  'use strict';

  let allRecipes = [];
  let selectedForMenu = [];

  function init() {
    injectStyles();
    injectMenuModal();
    injectPortionModal();
  }

  function injectStyles() {
    const s = document.createElement('style');
    s.id = 'menuGenStyles';
    s.textContent = `
      #menuModal,#portionModal{display:none;position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.65);align-items:center;justify-content:center;}
      #menuModal.open,#portionModal.open{display:flex;}
      .mg-box{background:#fafafa;border-radius:12px;width:min(680px,95vw);max-height:88vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.4);overflow:hidden;font-family:'Segoe UI',sans-serif;}
      .mg-head{background:#1a1a1a;color:#fff;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;}
      .mg-head h2{margin:0;font-size:18px;font-weight:700;}
      .mg-close{background:none;border:none;color:#fff;font-size:22px;cursor:pointer;}
      .mg-body{padding:20px 24px;overflow-y:auto;flex:1;}
      .mg-footer{padding:16px 24px;border-top:1px solid #e0e0e0;display:flex;gap:10px;justify-content:flex-end;background:#fff;}
      .mg-search{width:100%;padding:9px 14px;border:1.5px solid #ccc;border-radius:6px;font-size:14px;margin-bottom:14px;box-sizing:border-box;}
      .mg-recipe-list{display:flex;flex-direction:column;gap:6px;max-height:240px;overflow-y:auto;border:1px solid #e0e0e0;border-radius:8px;padding:8px;margin-bottom:16px;}
      .mg-recipe-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:6px;cursor:pointer;border:1.5px solid transparent;background:#fff;}
      .mg-recipe-item:hover{background:#f0f0f0;}
      .mg-recipe-item.selected{border-color:#1a1a1a;background:#f5f5f5;}
      .mg-recipe-item input[type=checkbox]{accent-color:#1a1a1a;width:16px;height:16px;}
      .mg-ri-name{flex:1;font-size:14px;font-weight:600;}
      .mg-ri-btn{font-size:12px;padding:4px 10px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;}
      .mg-ri-btn:hover{background:#1a1a1a;color:#fff;border-color:#1a1a1a;}
      .mg-sel-label{font-size:13px;font-weight:700;color:#555;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;}
      .mg-sel-list{display:flex;flex-direction:column;gap:8px;}
      .mg-sel-item{background:#fff;border:1.5px solid #ddd;border-radius:8px;padding:10px 14px;display:flex;align-items:flex-start;gap:10px;}
      .mg-sel-item .si-name{font-weight:700;font-size:14px;flex:1;}
      .mg-sel-item .si-ports{font-size:12px;color:#555;margin-top:3px;}
      .mg-sel-item .si-acts{display:flex;gap:6px;}
      .mg-sel-item button{font-size:12px;padding:4px 10px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;}
      .mg-sel-item .btn-rm{color:#c00;border-color:#c00;}
      .mg-sel-item .btn-rm:hover{background:#c00;color:#fff;}
      .mg-empty{text-align:center;color:#aaa;font-size:14px;padding:20px;}
      .mg-btn-primary{background:#1a1a1a;color:#fff;border:none;border-radius:6px;padding:10px 22px;font-size:14px;font-weight:700;cursor:pointer;}
      .mg-btn-secondary{background:#fff;color:#333;border:1.5px solid #ccc;border-radius:6px;padding:10px 18px;font-size:14px;cursor:pointer;}
      .pm-box{background:#fff;border-radius:12px;width:min(480px,95vw);box-shadow:0 20px 60px rgba(0,0,0,.4);font-family:'Segoe UI',sans-serif;overflow:hidden;}
      .pm-list{display:flex;flex-direction:column;gap:8px;padding:16px 20px;}
      .pm-row{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;align-items:center;}
      .pm-row input{padding:7px 10px;border:1.5px solid #ccc;border-radius:5px;font-size:13px;width:100%;box-sizing:border-box;}
      .pm-row input:focus{outline:none;border-color:#1a1a1a;}
      .pm-del{background:none;border:none;color:#c00;font-size:18px;cursor:pointer;padding:4px;}
      .pm-add{margin:0 20px 16px;padding:8px 14px;border:1.5px dashed #aaa;border-radius:6px;background:#fafafa;color:#555;cursor:pointer;font-size:13px;width:calc(100% - 40px);}
      .pm-footer{padding:12px 20px;border-top:1px solid #eee;display:flex;gap:8px;justify-content:flex-end;}
    `;
    document.head.appendChild(s);
  }

  function injectMenuModal() {
    const m = document.createElement('div');
    m.id = 'menuModal';
    m.innerHTML = `<div class="mg-box">
      <div class="mg-head"><h2>&#128203; Generator Karty Menu</h2><button class="mg-close" onclick="MenuGen.closeMenuModal()">&#10005;</button></div>
      <div class="mg-body">
        <input class="mg-search" type="text" id="mgSearchInput" placeholder="Szukaj przepisu..." oninput="MenuGen.filterRecipes()">
        <div class="mg-recipe-list" id="mgRecipeList"><div class="mg-empty">Ładowanie...</div></div>
        <div class="mg-sel-label">Wybrane (<span id="mgSelCount">0</span>)</div>
        <div class="mg-sel-list" id="mgSelList"><div class="mg-empty" id="mgSelEmpty">Brak wybranych</div></div>
      </div>
      <div class="mg-footer">
        <button class="mg-btn-secondary" onclick="MenuGen.closeMenuModal()">Anuluj</button>
        <button class="mg-btn-primary" onclick="MenuGen.generateAndPrint()">&#128424; Drukuj Karty Menu</button>
      </div>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener('click', e => { if (e.target === m) closeMenuModal(); });
  }

  function injectPortionModal() {
    const m = document.createElement('div');
    m.id = 'portionModal';
    m.dataset.rid = '';
    m.innerHTML = `<div class="pm-box">
      <div class="mg-head"><h2 id="pmTitle">Porcje i ceny</h2><button class="mg-close" onclick="MenuGen.closePortionModal()">&#10005;</button></div>
      <div style="padding:10px 20px 0;font-size:12px;color:#666;">Wpisz wielkość i cenę każdej opcji. Pierwsza = miska (na miejscu+wynos), druga = słoik (tylko wynos).</div>
      <div class="pm-list" id="pmList"></div>
      <button class="pm-add" onclick="MenuGen.addPortionRow()">+ Dodaj porcję</button>
      <div class="pm-footer">
        <button class="mg-btn-secondary" onclick="MenuGen.closePortionModal()">Anuluj</button>
        <button class="mg-btn-primary" id="pmSaveBtn" onclick="MenuGen.savePortions()">Zapisz</button>
      </div>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener('click', e => { if (e.target === m) closePortionModal(); });
  }

  // ── MODAL WYBORU Z BAZY ──────────────────────────────────
  function openMenuModal() {
    document.getElementById('menuModal').classList.add('open');
    loadRecipes();
  }
  function closeMenuModal() { document.getElementById('menuModal').classList.remove('open'); }

  async function loadRecipes() {
    const list = document.getElementById('mgRecipeList');
    list.innerHTML = '<div class="mg-empty">Ładowanie...</div>';
    try {
      const res = await fetch('api.php?action=list');
      const data = await res.json();
      allRecipes = Array.isArray(data) ? data : [];
      renderRecipeList(allRecipes);
    } catch(e) { list.innerHTML = '<div class="mg-empty">Błąd ładowania</div>'; }
  }

  function filterRecipes() {
    const q = document.getElementById('mgSearchInput').value.toLowerCase();
    renderRecipeList(allRecipes.filter(r => (r.name||'').toLowerCase().includes(q)));
  }

  function renderRecipeList(recipes) {
    const list = document.getElementById('mgRecipeList');
    if (!recipes.length) { list.innerHTML = '<div class="mg-empty">Brak przepisów</div>'; return; }
    list.innerHTML = recipes.map(r => {
      const sel = selectedForMenu.some(s => s.recipe.id == r.id);
      return `<div class="mg-recipe-item ${sel?'selected':''}" id="mgri-${r.id}">
        <input type="checkbox" ${sel?'checked':''} onchange="MenuGen.toggleRecipe(${r.id},this.checked)">
        <span class="mg-ri-name">${r.name||'—'}</span>
        <button class="mg-ri-btn" onclick="MenuGen.openPortionModalFor(${r.id})">Porcje ▸</button>
      </div>`;
    }).join('');
  }

  function toggleRecipe(id, checked) {
    const recipe = allRecipes.find(r => r.id == id);
    if (!recipe) return;
    if (checked) {
      if (!selectedForMenu.some(s => s.recipe.id == id)) {
        selectedForMenu.push({ recipe, portions: [{ label: 'Porcja', size: '', price: '' }] });
      }
      document.getElementById(`mgri-${id}`)?.classList.add('selected');
    } else {
      selectedForMenu = selectedForMenu.filter(s => s.recipe.id != id);
      document.getElementById(`mgri-${id}`)?.classList.remove('selected');
    }
    renderSelList();
  }

  function renderSelList() {
    document.getElementById('mgSelCount').textContent = selectedForMenu.length;
    const list = document.getElementById('mgSelList');
    const empty = document.getElementById('mgSelEmpty');
    if (!selectedForMenu.length) { list.innerHTML = ''; if(empty){list.appendChild(empty);empty.style.display='';} return; }
    if(empty) empty.style.display='none';
    list.innerHTML = selectedForMenu.map(({recipe,portions}) => `
      <div class="mg-sel-item">
        <div style="flex:1"><div class="si-name">${recipe.name||'—'}</div>
        <div class="si-ports">${portions.map(p=>`${p.label}${p.size?' '+p.size:''} ${p.price?'— '+p.price+' zł':''}`).join(' | ')}</div></div>
        <div class="si-acts">
          <button class="mg-ri-btn" onclick="MenuGen.openPortionModalFor(${recipe.id})">Porcje</button>
          <button class="btn-rm" onclick="MenuGen.removeSelected(${recipe.id})">&#10005;</button>
        </div>
      </div>`).join('');
  }

  function removeSelected(id) {
    selectedForMenu = selectedForMenu.filter(s => s.recipe.id != id);
    const cb = document.querySelector(`#mgri-${id} input[type=checkbox]`);
    if(cb){cb.checked=false;document.getElementById(`mgri-${id}`)?.classList.remove('selected');}
    renderSelList();
  }

  // ── MODAL PORCJI (dla przepisów z bazy) ──────────────────
  async function openPortionModalFor(id) {
    let sel = selectedForMenu.find(s => s.recipe.id == id);
    let recipe = allRecipes.find(r => r.id == id);
    if (!recipe) {
      try {
        const res = await fetch(`api.php?action=get&id=${id}`);
        recipe = await res.json();
        if (!allRecipes.find(r=>r.id==id)) allRecipes.push(recipe);
      } catch(e) { return; }
    }
    if (!sel) {
      selectedForMenu.push({ recipe, portions: [{ label: 'Porcja', size: '', price: '' },{ label: 'Duża', size: '', price: '' }] });
      const cb = document.querySelector(`#mgri-${id} input[type=checkbox]`);
      if(cb){cb.checked=true;document.getElementById(`mgri-${id}`)?.classList.add('selected');}
      renderSelList();
      sel = selectedForMenu.find(s => s.recipe.id == id);
    }
    const m = document.getElementById('portionModal');
    m.dataset.rid = id;
    m.dataset.mode = 'baza';
    document.getElementById('pmTitle').textContent = `Porcje: ${recipe.name||'—'}`;
    document.getElementById('pmSaveBtn').onclick = function() { savePortions(); };
    renderPortionRows(id);
    m.classList.add('open');
  }

  function renderPortionRows(id) {
    const sel = selectedForMenu.find(s => s.recipe.id == id);
    renderPmRows(sel?.portions || []);
  }

  function renderPmRows(portions) {
    document.getElementById('pmList').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;padding:0 0 6px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase">
        <span>Nazwa</span><span>Wielkość</span><span>Cena (zł)</span><span></span>
      </div>
      ${portions.map((p,i)=>`
        <div class="pm-row">
          <input type="text" value="${p.label||''}" placeholder="np. Porcja" data-field="label" data-idx="${i}">
          <input type="text" value="${p.size||''}" placeholder="np. 450 ml" data-field="size" data-idx="${i}">
          <input type="text" value="${p.price||''}" placeholder="np. 15.00" data-field="price" data-idx="${i}">
          <button class="pm-del" onclick="MenuGen.deletePortionRow(${i})">&#10005;</button>
        </div>`).join('')}`;
  }

  function addPortionRow() {
    const m = document.getElementById('portionModal');
    const id = m.dataset.rid;
    const mode = m.dataset.mode;
    if (mode === 'current') {
      selectedForMenu[0].portions.push({label:'',size:'',price:''});
      renderPmRows(selectedForMenu[0].portions);
    } else {
      const sel = selectedForMenu.find(s => s.recipe.id == id);
      if(sel){sel.portions.push({label:'',size:'',price:''});renderPmRows(sel.portions);}
    }
  }

  function deletePortionRow(idx) {
    const m = document.getElementById('portionModal');
    const id = m.dataset.rid;
    const mode = m.dataset.mode;
    const portions = mode === 'current' ? selectedForMenu[0]?.portions : selectedForMenu.find(s=>s.recipe.id==id)?.portions;
    if(portions && portions.length > 1){ portions.splice(idx,1); renderPmRows(portions); }
  }

  function savePortions() {
    const m = document.getElementById('portionModal');
    const id = m.dataset.rid;
    const mode = m.dataset.mode;
    const rows = Array.from(document.querySelectorAll('#pmList .pm-row')).map(row=>({
      label: row.querySelector('[data-field="label"]').value.trim(),
      size:  row.querySelector('[data-field="size"]').value.trim(),
      price: row.querySelector('[data-field="price"]').value.trim(),
    })).filter(p => p.label || p.size || p.price);
    if (mode === 'current') {
      selectedForMenu[0].portions = rows;
      closePortionModal();
      generateAndPrint();
      setTimeout(() => { selectedForMenu = []; }, 1000);
    } else {
      const sel = selectedForMenu.find(s => s.recipe.id == id);
      if(sel) sel.portions = rows;
      closePortionModal();
      renderSelList();
    }
  }

  function closePortionModal() { document.getElementById('portionModal').classList.remove('open'); }

  // ── DRUKUJ AKTUALNY PRZEPIS ───────────────────────────────
  function printCurrentRecipe() {
    const name = document.getElementById('dishName')?.value?.trim() || '';
    if (!name) { alert('Otwórz przepis — wpisz nazwę dania.'); return; }

    const category = document.getElementById('dishCategory')?.value || 'Danie gorące';

    // Wartości odżywcze z elementów DOM (na 100g ugotowanego)
    const kcal = cleanNum(document.getElementById('totalKcal')?.textContent);
    const fat  = cleanNum(document.getElementById('totalFat')?.textContent);
    const carb = cleanNum(document.getElementById('totalCarb')?.textContent);
    const salt = cleanNum(document.getElementById('totalSalt')?.textContent);

    // Białko i nasycone — licz z window.ingredients
    let protein = '', saturated = '', sugars = '';
    let skladParts = [];
    let allergenSet = new Set();

    try {
      if (window.ingredients && window.ingredients.length) {
        // masa ugotowana
        const cookedG = parseFloat(document.getElementById('cookedWeight')?.value) || 0;
        const ratio = cookedG > 0 ? 100 / cookedG : 0;

        let totProtein = 0, totSat = 0, totSugars = 0;
        window.ingredients.forEach(ing => {
          const w = parseFloat(ing.weight) || 0;
          if (ing.per100) {
            totProtein += (ing.per100.protein || 0) * w / 100;
            totSat     += (ing.per100.saturated || 0) * w / 100;
            totSugars  += (ing.per100.sugars || 0) * w / 100;
          }
          // skład
          if (ing.name) skladParts.push(ing.name);
          // alergeny
          if (ing.allergens && Array.isArray(ing.allergens)) {
            ing.allergens.forEach(a => allergenSet.add(a));
          }
        });

        if (ratio > 0) {
          protein   = (totProtein * ratio).toFixed(1).replace(/\.0$/,'');
          saturated = (totSat * ratio).toFixed(1).replace(/\.0$/,'');
          sugars    = (totSugars * ratio).toFixed(1).replace(/\.0$/,'');
        }
      }
    } catch(e) { console.warn('MenuGen: błąd czytania składników', e); }

    // Alergeny — tłumacz ID na nazwy przez ALLERGENS
    let allergenNames = [];
    try {
      if (window.ALLERGENS && allergenSet.size) {
        allergenNames = Array.from(allergenSet).map(id => {
          const a = window.ALLERGENS.find(x => x.id === id);
          return a ? a.name : id;
        });
      }
    } catch(e) {}

    // Jeśli brak alergenów z ingredients, spróbuj z etykiety EU
    if (!allergenNames.length) {
      try {
        const allergenLegend = document.querySelector('.allergen-legend, #allergenList');
        if (allergenLegend) {
          allergenNames = Array.from(allergenLegend.querySelectorAll('.legend-item, .allergen-item'))
            .map(el => el.textContent.trim().replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, ''));
        }
      } catch(e) {}
    }

    const recipe = {
      name,
      category,
      kcal,
      fat,
      carbs: carb,
      salt,
      protein,
      saturated_fat: saturated,
      sugars,
      ingredients: skladParts.join(', '),
      allergens: allergenNames,
    };

    // Otwórz modal porcji
    selectedForMenu = [{ recipe, portions: [
      { label: 'Porcja', size: '450 ml', price: '' },
      { label: 'Duża',   size: '900 ml', price: '' },
    ]}];

    const m = document.getElementById('portionModal');
    m.dataset.rid = 'current';
    m.dataset.mode = 'current';
    document.getElementById('pmTitle').textContent = `Porcje i ceny: ${name}`;
    renderPmRows(selectedForMenu[0].portions);
    m.classList.add('open');
  }

  // helper — wyciąga liczbę z tekstu "34 kcal" → "34"
  function cleanNum(txt) {
    if (!txt) return '';
    const m = txt.match(/[\d.,]+/);
    return m ? m[0].replace(',','.') : '';
  }

  // ── GENEROWANIE HTML ──────────────────────────────────────
  function generateAndPrint() {
    if (!selectedForMenu.length) { alert('Wybierz przepis.'); return; }
    const win = window.open('','_blank','width=950,height=800');
    if (!win) { alert('Zezwól na wyskakujące okna dla tej strony i spróbuj ponownie.'); return; }
    win.document.write(buildPrintHTML());
    win.document.close();
  }

  function buildPrintHTML() {
    return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<title>Karta Menu — Gruba Micha</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
@page{size:A4 portrait;margin:0;}
body{background:#fff;font-family:'Space Grotesk',sans-serif;}
.menu-card{width:210mm;height:297mm;background:#fff;display:flex;flex-direction:column;page-break-after:always;overflow:hidden;}
.menu-card:last-child{page-break-after:avoid;}
.mc-toprow{padding:16px 36px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e4e4e4;flex-shrink:0;}
.mc-top-cat{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#000;}
.mc-top-brand{font-family:'Syne',sans-serif;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#000;}
.mc-hero{padding:36px 36px 30px;text-align:center;flex:1;display:flex;flex-direction:column;justify-content:center;}
.mc-hero-cat{font-family:'Syne',sans-serif;font-weight:800;font-size:30px;color:#000;text-transform:uppercase;letter-spacing:14px;margin-bottom:16px;}
.mc-hero-rule{width:100%;height:1px;background:#e4e4e4;margin-bottom:22px;}
.mc-hero-title{font-family:'Syne',sans-serif;font-weight:800;color:#000;text-transform:uppercase;letter-spacing:-2px;margin:0 0 14px;word-break:break-word;line-height:.9;font-size:clamp(36px,10vw,78px);}
.mc-hero-desc{font-size:13px;color:#000;font-weight:500;letter-spacing:2px;}
.mc-deco{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:16px;}
.mc-deco-line{width:40px;height:1px;background:#000;}
.mc-deco-dot{width:5px;height:5px;border-radius:50%;background:#000;}
.mc-info{padding:16px 36px;border-top:1px solid #e4e4e4;border-bottom:1px solid #e4e4e4;display:grid;grid-template-columns:68px 1fr;row-gap:10px;column-gap:18px;flex-shrink:0;}
.mc-info-key{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#000;padding-top:2px;}
.mc-info-val{font-size:11px;color:#000;line-height:1.6;}
.mc-atag{display:inline-block;border:1.5px solid #000;border-radius:100px;padding:2px 9px;font-size:10px;font-weight:600;color:#000;margin:2px 3px 0 0;}
.mc-prices{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #e4e4e4;flex-shrink:0;}
.mc-tile{padding:18px 20px 16px;display:flex;flex-direction:row;align-items:center;gap:18px;}
.mc-tile:first-child{border-right:1px solid #e4e4e4;}
.mc-tile-left{display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0;}
.mc-vol{font-size:10px;font-weight:700;letter-spacing:1.5px;color:#000;white-space:nowrap;}
.mc-tile-right{display:flex;flex-direction:column;gap:8px;flex:1;}
.mc-avail{display:flex;flex-direction:column;gap:4px;}
.mc-avail-row{display:flex;align-items:center;gap:7px;font-size:10px;font-weight:700;color:#000;}
.mc-avail-row.dim{color:#ccc;font-weight:500;}
.mc-dot{width:6px;height:6px;border-radius:50%;background:#000;flex-shrink:0;}
.mc-dot-dim{width:6px;height:6px;border-radius:50%;border:1.5px solid #ccc;flex-shrink:0;}
.mc-divider{width:100%;height:1px;background:#e4e4e4;}
.mc-price-lbl{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#000;}
.mc-price{font-family:'Syne',sans-serif;font-weight:800;font-size:36px;line-height:1;color:#000;letter-spacing:-1px;}
.mc-zl{font-size:16px;font-weight:500;margin-left:2px;color:#000;}
.mc-kaucja{padding:9px 36px;border-bottom:1px solid #e4e4e4;display:flex;align-items:center;gap:8px;flex-shrink:0;}
.mc-kaucja-txt{font-size:8.5px;color:#000;line-height:1;white-space:nowrap;}
.mc-kaucja-txt b{font-weight:700;}
.mc-nutri{padding:14px 36px 18px;flex-shrink:0;}
.mc-nutri-head{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.mc-nutri-lbl{font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#000;white-space:nowrap;}
.mc-nutri-rule{flex:1;height:1px;background:#e4e4e4;}
.mc-nutri-ref{font-size:9px;color:#000;letter-spacing:1px;white-space:nowrap;font-weight:500;}
.mc-nutri-row{display:grid;grid-template-columns:repeat(7,1fr);border:1.5px solid #000;}
.mc-ncol{padding:10px 0 10px 10px;border-right:1px solid #e4e4e4;box-sizing:border-box;}
.mc-ncol:last-child{border-right:none;}
.mc-ncol.sub{background:#f9f9f9;}
.mc-ncol.sub-first{border-left:2px solid #ccc;}
.mc-nc-lbl{font-size:7px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#000;margin-bottom:4px;}
.mc-nc-lbl-sub{font-size:6.5px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:#000;margin-bottom:4px;opacity:.7;}
.mc-nc-val{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:#000;line-height:1;letter-spacing:-.5px;}
.mc-nc-unit{font-size:9px;color:#000;margin-top:1px;font-weight:500;}
.mc-footer{padding:13px 36px;border-top:1px solid #e4e4e4;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.mc-footer-l{font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#000;}
.mc-footer-r{font-size:11px;color:#000;letter-spacing:.5px;font-weight:700;}
.no-print{position:fixed;top:0;left:0;right:0;background:#1a1a1a;color:#fff;padding:12px 24px;display:flex;gap:12px;align-items:center;z-index:9999;font-family:sans-serif;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.no-print{display:none!important;}}
</style>
</head>
<body>
${selectedForMenu.map(({recipe,portions}) => buildCard(recipe,portions)).join('')}
<div class="no-print">
  <span style="font-weight:700;font-size:15px">&#128424; Gruba Micha — Karta Menu</span>
  <span style="flex:1;font-size:13px;color:#aaa">${selectedForMenu.length} kart</span>
  <button onclick="window.print()" style="background:#fff;color:#1a1a1a;border:none;border-radius:5px;padding:8px 20px;font-weight:700;font-size:14px;cursor:pointer;">Drukuj / Zapisz PDF</button>
  <button onclick="window.close()" style="background:none;border:1px solid #555;color:#fff;border-radius:5px;padding:8px 14px;font-size:14px;cursor:pointer;">Zamknij</button>
</div>
</body></html>`;
  }

  const BOWL_SVG = `<svg width="58" height="52" viewBox="0 0 64 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 18 C20 14 23 12 23 8" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round"/><path d="M32 18 C32 14 35 12 35 8" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round"/><path d="M44 18 C44 14 47 12 47 8" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round"/><path d="M4 28 Q4 52 32 52 Q60 52 60 28 Z" fill="#1a1a1a"/><path d="M6 28 Q6 48 32 48 Q58 48 58 28 Z" fill="#fff"/><rect x="2" y="24" width="60" height="6" rx="3" fill="#1a1a1a"/><path d="M18 47 Q32 52 46 47" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/></svg>`;
  const JAR_SVG  = `<svg width="46" height="58" viewBox="0 0 52 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="1" width="40" height="10" rx="3" fill="#1a1a1a"/><rect x="9" y="3.5" width="34" height="5" rx="1.5" fill="#fff"/><rect x="10" y="11" width="32" height="6" fill="none" stroke="#1a1a1a" stroke-width="3.5"/><path d="M10 17 L5 22 L4 50 Q4 62 26 62 Q48 62 48 50 L47 22 L42 17 Z" fill="#1a1a1a"/><path d="M13 17 L9 21 L8 50 Q8 58 26 58 Q44 58 44 50 L43 21 L39 17 Z" fill="#fff"/><path d="M14 54 Q26 57 38 54" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/></svg>`;

  function buildCard(recipe, portions) {
    const name  = recipe.name || '—';
    const cat   = recipe.category || 'Danie gorące';
    const sklad = recipe.ingredients || '';
    const alerg = Array.isArray(recipe.allergens)
      ? recipe.allergens
      : (recipe.allergens||'').split(/[,;]+/).map(s=>s.trim()).filter(Boolean);

    const kcal = fmtN(recipe.kcal || recipe.kalorie);
    const tl   = fmtN(recipe.fat || recipe.tluszcz);
    const nas  = fmtN(recipe.saturated_fat || recipe.tluszcz_nasycony);
    const ww   = fmtN(recipe.carbs || recipe.weglowodany);
    const cuk  = fmtN(recipe.sugars || recipe.cukry);
    const bial = fmtN(recipe.protein || recipe.bialko);
    const sol  = fmtN(recipe.salt || recipe.sol);

    const p1  = portions[0] || { label:'Porcja', size:'', price:'' };
    const p2  = portions[1] || null;

    const alergHtml = alerg.length
      ? alerg.map(a=>`<span class="mc-atag">${a}</span>`).join('')
      : '—';

    const jarTile = p2 ? `
    <div class="mc-tile">
      <div class="mc-tile-left">${JAR_SVG}<div class="mc-vol">${p2.size||'—'}</div></div>
      <div class="mc-tile-right">
        <div class="mc-avail">
          <div class="mc-avail-row dim"><div class="mc-dot-dim"></div>Na miejscu</div>
          <div class="mc-avail-row"><div class="mc-dot"></div>Na wynos</div>
        </div>
        <div class="mc-divider"></div>
        <div><div class="mc-price-lbl">${p2.label||'Duża'}</div>
        <div><span class="mc-price">${fmtPrice(p2.price)}</span><span class="mc-zl"> zł</span></div></div>
      </div>
    </div>`
    : `<div class="mc-tile" style="justify-content:center;align-items:center;font-size:11px;color:#ccc;font-style:italic;">brak drugiej opcji</div>`;

    return `<div class="menu-card">
  <div class="mc-toprow"><span class="mc-top-cat">${cat}</span><span class="mc-top-brand">Gruba Micha</span></div>
  <div class="mc-hero">
    <div class="mc-hero-cat">Zupa</div>
    <div class="mc-hero-rule"></div>
    <div class="mc-hero-title">${name}</div>
    <div class="mc-deco"><div class="mc-deco-line"></div><div class="mc-deco-dot"></div><div class="mc-deco-line"></div></div>
  </div>
  <div class="mc-info">
    <div class="mc-info-key">Skład</div><div class="mc-info-val">${sklad||'—'}</div>
    <div class="mc-info-key">Alergeny</div><div class="mc-info-val">${alergHtml}</div>
  </div>
  <div class="mc-prices">
    <div class="mc-tile">
      <div class="mc-tile-left">${BOWL_SVG}<div class="mc-vol">${p1.size||'—'}</div></div>
      <div class="mc-tile-right">
        <div class="mc-avail">
          <div class="mc-avail-row"><div class="mc-dot"></div>Na miejscu</div>
          <div class="mc-avail-row"><div class="mc-dot"></div>Na wynos</div>
        </div>
        <div class="mc-divider"></div>
        <div><div class="mc-price-lbl">${p1.label||'Porcja'}</div>
        <div><span class="mc-price">${fmtPrice(p1.price)}</span><span class="mc-zl"> zł</span></div></div>
      </div>
    </div>
    ${jarTile}
  </div>
  <div class="mc-kaucja">
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#000" stroke-width="1.5"/><line x1="10" y1="9" x2="10" y2="14" stroke="#000" stroke-width="1.8" stroke-linecap="round"/><circle cx="10" cy="6" r="1" fill="#000"/></svg>
    <div class="mc-kaucja-txt">Na wynos podajemy w słoiku zwrotnym. Kaucja: <b>mały 450 ml — 2 zł</b>, <b>duży 900 ml — 3 zł</b>. Zwrot kaucji przy oddaniu czystego słoika.</div>
  </div>
  <div class="mc-nutri">
    <div class="mc-nutri-head"><span class="mc-nutri-lbl">Wartości odżywcze</span><div class="mc-nutri-rule"></div><span class="mc-nutri-ref">na 100 ml</span></div>
    <div class="mc-nutri-row">
      <div class="mc-ncol"><div class="mc-nc-lbl">Energia</div><div class="mc-nc-val">${kcal||'—'}</div><div class="mc-nc-unit">kcal</div></div>
      <div class="mc-ncol"><div class="mc-nc-lbl">Tłuszcz</div><div class="mc-nc-val">${tl||'—'}</div><div class="mc-nc-unit">g</div></div>
      <div class="mc-ncol sub sub-first"><div class="mc-nc-lbl-sub">nasycone</div><div class="mc-nc-val">${nas||'—'}</div><div class="mc-nc-unit">g</div></div>
      <div class="mc-ncol"><div class="mc-nc-lbl">Węglow.</div><div class="mc-nc-val">${ww||'—'}</div><div class="mc-nc-unit">g</div></div>
      <div class="mc-ncol sub sub-first"><div class="mc-nc-lbl-sub">cukry</div><div class="mc-nc-val">${cuk||'—'}</div><div class="mc-nc-unit">g</div></div>
      <div class="mc-ncol"><div class="mc-nc-lbl">Białko</div><div class="mc-nc-val">${bial||'—'}</div><div class="mc-nc-unit">g</div></div>
      <div class="mc-ncol sub sub-first"><div class="mc-nc-lbl-sub">Sól</div><div class="mc-nc-val">${sol||'—'}</div><div class="mc-nc-unit">g</div></div>
    </div>
  </div>
  <div class="mc-footer"><span class="mc-footer-l">Gruba Micha</span><span class="mc-footer-r">grubamicha.pl</span></div>
</div>`;
  }

  function fmtN(v) {
    if(v===undefined||v===null||v==='') return '';
    const n = parseFloat(String(v).replace(',','.'));
    return isNaN(n)?'':n.toFixed(1).replace(/\.0$/,'');
  }
  function fmtPrice(v) {
    const n = parseFloat(String(v||'').replace(',','.'));
    return isNaN(n)?'—':n.toFixed(2).replace('.',',');
  }

  window.MenuGen = {
    openMenuModal, closeMenuModal, filterRecipes,
    toggleRecipe, removeSelected,
    openPortionModalFor, addPortionRow, deletePortionRow, savePortions, closePortionModal,
    generateAndPrint, printCurrentRecipe,
  };

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
