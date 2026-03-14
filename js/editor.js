// ══════════════════════════
// DATA
// ══════════════════════════
const CAL_NAMED = {
  black: [
    "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", 
    "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18", "E19", "E20", 
    "E21", "E22", "E23", "E24", "E25", "E26", "E27", "E28", "E29", "E30", 
    "E31", "E32", "E33", "E34", "E35", "E36", "E37", "E38", "E39", "E40",
    "E41", "E42", "E43", "E44", "E45", "E46", "E47", "E48", "E49", "E50",
    "E51", "E52", "E53", "E54", "E55", "E56", "E57", "E58", "E59", "E60",
    "E61", "E62", "E63", "E64", "E65", "E66", "E67", "E68", "E69", "E70",
    "E71", "E72", "E73", "E74", "E75", "E76", "E77", "E78", "E79", "E80",
    "E81", "E82", "E83", "E84", "E85", "E86", "E87", "E88", "E89", "E90",
    "E91", "E92", "E93", "E94", "E95", "E96", "E97", "E98", "E99", "E100",
    "E101", "E102", "E103", "E104", "E105", "E106", "E107", "E108", "E109", "E110"
  ],
  '3d': [
    "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", 
    "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18", "E19", "E20", 
    "E21", "E22", "E23", "E24", "E25", "E26", "E27", "E28", "E29", "E30", 
    "E31", "E32", "E33", "E34", "E35", "E36", "E37", "E38", "E39", "E40",
    "E41", "E42", "E43", "E44", "E45", "E46", "E47", "E48", "E49", "E50",
    "E51", "E52", "E53", "E54", "E55", "E56", "E57", "E58", "E59", "E60",
    "E61", "E62", "E63", "E64", "E65", "E66", "E67", "E68", "E69", "E70",
    "E71", "E72", "E73", "E74", "E75", "E76", "E77", "E78", "E79", "E80",
    "E81", "E82", "E83", "E84", "E85", "E86", "E87", "E88", "E89", "E90",
    "E91", "E92", "E93", "E94", "E95", "E96", "E97", "E98", "E99", "E100",
    "E101", "E102", "E103", "E104", "E105", "E106", "E107", "E108", "E109", "E110"
  ],
  white: [
    "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", 
    "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18", "E19", "E20", 
    "E21", "E22", "E23", "E24", "E25", "E26", "E27", "E28", "E29", "E30", 
    "E31", "E32", "E33", "E34", "E35", "E36", "E37", "E38", "E39", "E40",
    "E41", "E42", "E43", "E44", "E45", "E46", "E47", "E48", "E49", "E50",
    "E51", "E52", "E53", "E54", "E55", "E56", "E57", "E58", "E59", "E60",
    "E61", "E62", "E63", "E64", "E65", "E66", "E67", "E68", "E69", "E70",
    "E71", "E72", "E73", "E74", "E75", "E76", "E77", "E78", "E79", "E80",
    "E81", "E82", "E83", "E84", "E85", "E86", "E87", "E88", "E89", "E90",
    "E91", "E92", "E93", "E94", "E95", "E96", "E97", "E98", "E99", "E100",
    "E101", "E102", "E103", "E104", "E105", "E106", "E107", "E108", "E109", "E110"
  ]
};

const CAL_LIMIT = 30;
const calShown = { black: CAL_LIMIT, '3d': CAL_LIMIT, white: CAL_LIMIT };
const CAL = {
  black: [...CAL_NAMED.black, ...Array.from({length:200},(_,i)=>`Asset ${i+1}`)],
  '3d':  [...CAL_NAMED['3d'], ...Array.from({length:50}, (_,i)=>`Asset ${i+1}`)],
  white: [...CAL_NAMED.white, ...Array.from({length:80}, (_,i)=>`Asset ${i+1}`)]
};
const CAL_COUNT = {
  black: 37, 
  '3d': 37, 
  white: 37
};
const READY_TEXTS = {
  all: ["كل عام وأنتم بخير 💛","عيد مبارك وكل عام وأنتم بأفضل حال",
    "تقبل الله منا ومنكم","عساكم من عواده","أعادها الله عليكم وأنتم بخير",
    "مع أجمل التهاني والتمنيات","أسعد الله أيامكم وبارك فيكم"],
  'eid-fitr': ["عيد فطر مبارك 🌙","تقبل الله صيامكم وقيامكم","أسعد الله عيدكم",
    "فطر سعيد وكل عام وأنتم بألف خير","عيدكم مبارك وعساكم من عواده"],
  'eid-adha': ["عيد أضحى مبارك 🐑","تقبل الله ضحاياكم","حجّ مبرور وسعي مشكور وذنب مغفور",
    "أعادها الله عليكم بالخير والبركة"],
  ramadan: ["رمضان كريم 🌙","مبارك عليكم الشهر","صوماً مقبولاً وإفطاراً هنيئاً",
    "تقبل الله صيامكم وقيامكم","أهلاً رمضان"],
  congrats: ["مبروك! 🎉","ألف مبروك وألف تهنئة","بالرفاء والبنين","تهانينا الحارة"],
  'new-year': ["سنة جديدة سعيدة 🎊","عام مليء بالسعادة والنجاح","عام جديد بداية جديدة"],
  national: ["اليوم الوطني المجيد 🇸🇦","يحيا الوطن وتحيا أمجاده","نفخر بانتمائنا لهذا الوطن الغالي"]
};

const BG_ITEMS = [
  { src:"images/3.png" },
  { src:"images/5.png" },
  { src:"images/6.png" },
  { src:"images/7.png" },
  { src:"images/8.png" },
  { src:"images/9.png" },
  { src:"images/10.png" },
  { src:"images/11.png" },
  { src:"images/13.png" },
  { src:"images/14.png" },
  { src:"images/15.png" },
  { src:"images/16.png" },
  { src:"images/14.png" },
  { src:"images/Artboard12.png" },
  { src:"images/1.png" },
  { src:"images/2.png" },
  { src:"images/21.png" },
  { src:"images/20.png" },
  { src:"images/19.png" },
];

// ══════════════════════════
// STATE
// ══════════════════════════
let selEl = null, photoEl = null, logoEl = null;
let mainSz = 26, subSz = 16, eid = 0;
const CV = document.getElementById('canvas');

// ══════════════════════════
// BOOT
// ══════════════════════════
(function init() {
  buildBgGrid();
  buildCalGrid('black');
  buildCalGrid('3d');
  buildCalGrid('white');
  buildReady('all');

  addText("عيد مبارك", 38, "#FFD700", 90, 50);
  addText("كل عام وأنتم بخير", 20, "#ffffff", 70, 115);

  document.addEventListener('mousedown', e => {
    if (!e.target.closest('.el') && !e.target.closest('#sidebar')) deselect();
  });
  document.addEventListener('touchstart', e => {
    if (!e.target.closest('.el') && !e.target.closest('#sidebar')) deselect();
  }, { passive:true });

  document.addEventListener('click', onGrpClick);
  document.getElementById('cdots-text').addEventListener('click', onTextDot);
  document.getElementById('cdots-photo').addEventListener('click', onPhotoDot);
})();

// ══════════════════════════
// MODE SWITCHER
// ══════════════════════════
function switchMode(mode) {
  ['ready','design','group'].forEach(m => {
    // 1. حماية لزرار تبديل المود
    const btn = document.getElementById('btn-' + m);
    if (btn) btn.classList.toggle('active', m === mode);
    
    // 2. حماية لعرض القسم (view)
    const v = document.getElementById('view-' + m);
    if (v) v.style.display = m === mode ? (m === 'design' ? 'flex' : 'block') : 'none';
  });

  // 3. حماية لشريط الفلاتر (filterbar) - وده اللي كان عامل المشكلة الأكبر
  const filterbar = document.getElementById('filterbar');
  if (filterbar) {
    filterbar.style.display = mode === 'design' ? 'flex' : 'none';
  }

  if (mode !== 'design') {
    fillAltBgs();
  }
}

// ══════════════════════════
// FILTER
// ══════════════════════════
function setFilter(btn) {
  document.querySelectorAll('.fpill').forEach(p => p.classList.remove('on'));
  btn.classList.add('on');
  buildReady(btn.dataset.filter);
}
function buildReady(key) {
  const list = READY_TEXTS[key] || READY_TEXTS.all;
  document.getElementById('rlist').innerHTML = list.map(t =>
    `<div class="ritem" onclick="readyClick(this)">${t}</div>`).join('');
}
function readyClick(el) {
  addText(el.textContent, 22, '#FFD700', 30, 60);
  notify('تمت الإضافة ✓');
  openTab('fmt');
}

// ══════════════════════════
// TABS
// ══════════════════════════
function switchTab(btn) {
  document.querySelectorAll('.stab').forEach(b => b.classList.remove('on'));
  document.querySelectorAll('.spanel').forEach(p => p.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('panel-' + btn.dataset.tab).classList.add('on');
}
function openTab(id) {
  document.querySelectorAll('.stab').forEach(b => b.classList.toggle('on', b.dataset.tab === id));
  document.querySelectorAll('.spanel').forEach(p => p.classList.toggle('on', p.id === 'panel-' + id));
}

// ══════════════════════════
// GROUP BUTTONS
// ══════════════════════════
function onGrpClick(e) {
  const btn = e.target.closest('.gbtn');
  if (!btn) return;
  const grp = btn.closest('[data-grp]');
  if (!grp) return;
  grp.querySelectorAll('.gbtn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  const val = btn.dataset.val, g = grp.dataset.grp;
  if (g === 'fw') A('weight', val);
  else if (g === 'ta') A('align', val);
  else if (g === 'phshape') setPhotoShape(val);
  else if (g === 'lgpos') setLogoPos(val);
}

// ══════════════════════════
// COLOR DOTS
// ══════════════════════════
function onTextDot(e) {
  const dot = e.target.closest('.cdot');
  if (!dot) return;
  document.querySelectorAll('#cdots-text .cdot').forEach(d => d.classList.remove('on'));
  dot.classList.add('on');
  A('color', dot.dataset.color);
}
function onPhotoDot(e) {
  const dot = e.target.closest('.cdot');
  if (!dot || !photoEl) return;
  document.querySelectorAll('#cdots-photo .cdot').forEach(d => d.classList.remove('on'));
  dot.classList.add('on');
  const img = photoEl.querySelector('img');
  if (img) img.style.borderColor = dot.dataset.color;
}

// ══════════════════════════
// APPLY FORMAT
// ══════════════════════════
function A(prop, val) {
  if (prop === 'opacity') {
    if (selEl) selEl.style.opacity = val / 100;
    document.getElementById('vl-op').textContent = val + '%';
    return;
  }
  if (!selEl) { notify('اختر عنصراً أولاً'); return; }
  const txt = selEl.querySelector('.el-text');
  const img = selEl.querySelector('img');
  switch(prop) {
    case 'font':   if (txt) txt.style.fontFamily = `'${val}',sans-serif`; break;
    case 'weight': if (txt) txt.style.fontWeight = val; break;
    case 'align':  if (txt) txt.style.textAlign = val; break;
    case 'size':
      if (txt) txt.style.fontSize = val + 'px';
      else if (img) { img.style.width = (val*4)+'px'; img.style.maxWidth = (val*4)+'px'; }
      document.getElementById('vl-size').textContent = val;
      document.getElementById('sl-size').value = val;
      break;
    case 'shadow':
      if (txt) txt.style.textShadow = val > 0 ? `0 ${Math.ceil(val/4)}px ${val}px rgba(0,0,0,.6)` : 'none';
      break;
    case 'color':  if (txt) txt.style.color = val; break;
  }
}

// ══════════════════════════
// DRAG ENGINE
// ══════════════════════════
function makeWrap(x, y) {
  const w = document.createElement('div');
  w.className = 'el'; w.dataset.id = ++eid;
  w.style.left = x + 'px'; w.style.top = y + 'px';
  const rh = document.createElement('div'); rh.className = 'rhandle';
  w.appendChild(rh);
  attachDrag(w, rh);
  CV.appendChild(w);
  return w;
}

function attachDrag(el, rhandle) {
  let isDrag=false, isResize=false, ox, oy, ol, ot, ow, startFontSize;
  function gp(e) { const t=e.touches?e.touches[0]:e; return {x:t.clientX,y:t.clientY}; }

  el.addEventListener('mousedown', startD);
  el.addEventListener('touchstart', startD, {passive:false});

  function startD(e) {
    if (e.target === rhandle) { startR(e); return; }
    const txt = el.querySelector('.el-text');
    if (txt && txt.contentEditable === 'true') return;
    e.stopPropagation();
    select(el);
    const p = gp(e); ox=p.x; oy=p.y; ol=el.offsetLeft; ot=el.offsetTop;
    isDrag = true;
    on('mousemove',doD); on('touchmove',doD); on('mouseup',endD); on('touchend',endD);
  }
  function doD(e) {
    if (!isDrag) return;
    if (e.cancelable) e.preventDefault();
    const p = gp(e);
    el.style.left = Math.max(0, Math.min(ol+p.x-ox, CV.offsetWidth-el.offsetWidth)) + 'px';
    el.style.top  = Math.max(0, Math.min(ot+p.y-oy, CV.offsetHeight-el.offsetHeight)) + 'px';
  }
  function endD() { isDrag=false; off('mousemove',doD); off('touchmove',doD); off('mouseup',endD); off('touchend',endD); }

  function startR(e) {
    e.stopPropagation(); select(el);
    const p = gp(e); ox=p.x;
    const txt = el.querySelector('.el-text');
    if (txt) startFontSize = parseFloat(window.getComputedStyle(txt).fontSize) || 26;
    else ow = el.offsetWidth;
    isResize = true;
    on('mousemove',doR); on('touchmove',doR); on('mouseup',endR); on('touchend',endR);
  }
  function doR(e) {
    if (!isResize) return;
    if (e.cancelable) e.preventDefault();
    const p = gp(e); const dx = p.x - ox;
    const txt = el.querySelector('.el-text');
    if (txt) {
      const nSize = Math.max(10, startFontSize + dx * 0.4);
      txt.style.fontSize = nSize + 'px';
      document.getElementById('sl-size').value = Math.round(nSize);
      document.getElementById('vl-size').textContent = Math.round(nSize);
    } else {
      const img = el.querySelector('img');
      if (img) { const nw=Math.max(40,ow+dx); el.style.width=nw+'px'; img.style.width=nw+'px'; img.style.maxWidth=nw+'px'; }
    }
  }
  function endR() { isResize=false; off('mousemove',doR); off('touchmove',doR); off('mouseup',endR); off('touchend',endR); }

  function on(ev,fn)  { document.addEventListener(ev,fn,{passive:false}); }
  function off(ev,fn) { document.removeEventListener(ev,fn); }
}

function select(el) {
  deselect(); selEl = el; el.classList.add('selected');
  const txt = el.querySelector('.el-text');
  if (txt) {
    const fs = parseInt(window.getComputedStyle(txt).fontSize) || 26;
    document.getElementById('sl-size').value = fs;
    document.getElementById('vl-size').textContent = fs;
  }
  const op = Math.round((parseFloat(el.style.opacity)||1)*100);
  document.getElementById('sl-op').value = op;
  document.getElementById('vl-op').textContent = op + '%';
}
function deselect() {
  document.querySelectorAll('.el').forEach(e => {
    e.classList.remove('selected');
    const t = e.querySelector('.el-text');
    if (t) { t.contentEditable = 'false'; t.style.cursor = 'inherit'; }
  });
  selEl = null;
}

// ══════════════════════════
// ADD ELEMENTS
// ══════════════════════════
function addText(text, size, color, x, y) {
  const w = makeWrap(x, y);
  const d = document.createElement('div');
  d.className = 'el-text';
  d.style.fontSize = size + 'px';
  d.style.color = color;
  d.style.fontFamily = "'Tajawal',sans-serif";
  d.style.fontWeight = '700';
  d.style.textAlign = 'right';
  d.textContent = text;
  d.addEventListener('dblclick', function(e) {
    e.stopPropagation();
    this.contentEditable = 'true';
    this.style.cursor = 'text';
    this.focus();
    const range = document.createRange(); range.selectNodeContents(this);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
  });
  d.addEventListener('blur', function() {
    this.contentEditable = 'false'; this.style.cursor = 'inherit';
  });
  w.insertBefore(d, w.firstChild);
  select(w); return w;
}

function addMain() {
  const v = document.getElementById('main-txt').value.trim();
  if (!v) { notify('اكتب نصاً أولاً!'); return; }
  addText(v, mainSz, '#FFD700', 30, 40); notify('تمت إضافة النص ✓');
}
function addSub() {
  const v = document.getElementById('sub-txt').value.trim();
  if (!v) { notify('اكتب نصاً أولاً!'); return; }
  addText(v, subSz, '#ffffff', 30, 100); notify('تمت إضافة النص ✓');
}
function addQuick() {
  const v = document.getElementById('fmt-quick').value.trim();
  if (!v) { notify('اكتب نصاً!'); return; }
  addText(v, 22, '#fff', 30, 60);
  document.getElementById('fmt-quick').value = '';
  notify('تمت الإضافة ✓');
}

function addCallig(src, name) {
  const sz = parseInt(document.getElementById('sl-csz').value) || 180;
  const x  = Math.max(0, CV.offsetWidth/2 - sz/2);
  const y  = Math.max(0, CV.offsetHeight/2 - 70);
  const w  = makeWrap(x, y);
  const img = document.createElement('img');
  img.src = src; img.alt = name; img.className = 'el-img';
  img.style.width = sz+'px'; img.style.maxWidth = sz+'px'; img.style.height = 'auto';
  img.onerror = () => { notify('"'+name+'" — الملف غير متاح'); w.remove(); };
  w.insertBefore(img, w.firstChild);
  select(w); notify('تمت إضافة المخطوطة ✓');
}

function delSelected() {
  if (!selEl) { notify('اختر عنصراً أولاً'); return; }
  selEl.remove(); selEl = null; notify('تم الحذف ✓');
}
function clearAll() {
  if (!confirm('مسح كل العناصر من البطاقة؟')) return;
  document.querySelectorAll('.el').forEach(e => e.remove()); selEl = null;
}

// ══════════════════════════
// CALLIGRAPHY
// ══════════════════════════
function buildCalGrid(cat) {
  // التسميات العربية للأقسام لو محتاجها في مكان تاني
  const folders = { black: 'مخطوطات سوداء', '3d': 'مخطوطات ثلاثية الأبعاد', white: 'مخطوطات بيضاء' };
  const bgcls = cat === 'black' ? 'lt' : 'dk';
  
  const items = CAL[cat];
  const lim = calShown[cat];
  const grid = document.getElementById('cg-' + cat);

  grid.innerHTML = items.slice(0, lim).map(name => {
    // المسار الجديد بناءً على الترقيم E1.png, E2.png...
    const src = `./images/${name}.png`;

    return `
    <div class="citem ${bgcls}" onclick="addCallig('${src.replace(/'/g, "\\'")}','${name}')">
      <img src="${src}" alt="${name}" loading="lazy" onerror="this.style.display='none'">
      <div class="clabel">${name}</div>
    </div>`;
  }).join('');

  const btn = document.getElementById('sm-' + cat);
  if (items.length > lim) {
    btn.classList.add('vis');
    btn.textContent = `▼ عرض المزيد (${items.length - lim} متبقية)`;
  } else {
    btn.classList.remove('vis');
  }
}
function moreCallig(cat) { calShown[cat] += 30; buildCalGrid(cat); }
function switchCat(btn) {
  document.querySelectorAll('.catbtn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  const cat = btn.dataset.cat;
  ['black','3d','white'].forEach(c =>
    document.getElementById('cat-'+c).style.display = c===cat ? 'block' : 'none');
}

// ══════════════════════════
// BACKGROUND
// ══════════════════════════
function buildBgGrid() {
  document.getElementById('bggrid').innerHTML = BG_ITEMS.map((bg,i) =>
    `<div class="bgthumb" onclick="setBg(this,'${bg.src}')">
      <img src="${bg.src}" loading="lazy" alt="خلفية ${i+1}" onerror="this.parentElement.style.display='none'">
    </div>`).join('');
}
function setBg(el, src) {
  CV.style.backgroundImage = `url('${src}')`;
  document.querySelectorAll('#bggrid .bgthumb').forEach(t => t.classList.remove('on'));
  el.classList.add('on'); notify('تم تغيير الخلفية ✓');
}
function uploadBg(e) {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => { CV.style.backgroundImage = `url('${ev.target.result}')`; notify('تم رفع الخلفية ✓'); };
  r.readAsDataURL(f);
}

// ══════════════════════════
// PHOTO
// ══════════════════════════
function uploadPhoto(e) {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    if (photoEl) { photoEl.remove(); photoEl = null; }
    const w = makeWrap(160, 150);
    const img = document.createElement('img');
    img.src = ev.target.result;
    img.style.cssText = 'width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid #fff;box-shadow:0 4px 16px rgba(0,0,0,.3);';
    w.insertBefore(img, w.firstChild);
    photoEl = w; select(w);
    document.getElementById('pho-ctrl').style.display = 'flex';
    notify('تم إضافة صورتك ✓');
  };
  r.readAsDataURL(f);
}
function resizePhoto(v) {
  document.getElementById('vl-phsz').textContent = v;
  if (!photoEl) return;
  const img = photoEl.querySelector('img');
  if (img) { img.style.width = v+'px'; img.style.height = v+'px'; }
}
function setPhotoShape(val) {
  if (!photoEl) return;
  const img = photoEl.querySelector('img'); if (!img) return;
  img.style.borderRadius = val==='circle' ? '50%' : val==='rounded' ? '16px' : '4px';
}

// ══════════════════════════
// LOGO
// ══════════════════════════
function uploadLogo(e) {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    document.getElementById('lgp-preview').innerHTML =
      `<img src="${ev.target.result}" style="max-height:60px;max-width:100%;object-fit:contain">`;
    if (logoEl) { logoEl.remove(); logoEl = null; }
    const w = makeWrap(10, 10);
    const img = document.createElement('img');
    img.src = ev.target.result;
    img.style.cssText = 'display:block;width:100px;height:auto;max-width:100px;';
    w.insertBefore(img, w.firstChild);
    logoEl = w; select(w);
    document.getElementById('lgp-ctrl').style.display = 'flex';
    notify('تم إضافة الشعار ✓');
  };
  r.readAsDataURL(f);
}
function resizeLogo(v) {
  if (!logoEl) return;
  const img = logoEl.querySelector('img');
  if (img) { img.style.width = v+'px'; img.style.maxWidth = v+'px'; }
}
function setLogoPos(val) {
  if (!logoEl) return;
  const cw=CV.offsetWidth, ch=CV.offsetHeight, lw=logoEl.offsetWidth, lh=logoEl.offsetHeight, pad=10;
  const P = { tr:{top:pad,left:cw-lw-pad}, tl:{top:pad,left:pad}, br:{top:ch-lh-pad,left:cw-lw-pad}, bl:{top:ch-lh-pad,left:pad} };
  if (P[val]) { logoEl.style.top=P[val].top+'px'; logoEl.style.left=P[val].left+'px'; }
}

// ══════════════════════════
// EXPORT (Design Mode)
// ══════════════════════════
async function capture() {
  deselect();
  await new Promise(r => setTimeout(r, 150));
  return html2canvas(CV, { useCORS:true, scale:3, allowTaint:true, backgroundColor:null });
}
async function dlPNG() {
  notify('⏳ جاري التحميل...');
  try {
    const c = await capture();
    const a = document.createElement('a');
    a.download = 'sallim-card.png'; a.href = c.toDataURL('image/png'); a.click();
    notify('تم التحميل ✓');
  } catch(e) { notify('خطأ في التحميل'); }
}
async function dlPDF() {
  notify('⏳ جاري إنشاء PDF...');
  try {
    const c = await capture();
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation:'p', unit:'px', format:[c.width, c.height] });
    pdf.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, c.width, c.height);
    pdf.save('sallim-card.pdf');
    notify('تم إنشاء PDF ✓');
  } catch(e) { notify('خطأ في إنشاء PDF'); }
}
async function copyImg() {
  try {
    const c = await capture();
    c.toBlob(async blob => {
      await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
      notify('تم النسخ 🎉');
    });
  } catch { notify('متصفحك لا يدعم النسخ المباشر'); }
}
async function shareNative() {
  const c = await capture();
  c.toBlob(async blob => {
    const file = new File([blob],'sallim.png',{type:'image/png'});
    if (navigator.share) { try { await navigator.share({title:'بطاقة تهنئة',files:[file]}); } catch {} }
    else notify('المشاركة غير مدعومة في هذا المتصفح');
  });
}
async function shareWA() {
  window.open(`https://wa.me/?text=${encodeURIComponent('كل عام وأنتم بخير 🌙✨')}`, '_blank');
  await dlPNG();
}

// ══════════════════════════
// ALT BACKGROUNDS (Ready/Group)
// ══════════════════════════
let readyBgSrc = BG_ITEMS[0].src;
let batchBgSrc = BG_ITEMS[0].src;

function fillAltBgs() {
  const html = (gridId, type) => BG_ITEMS.map((bg,i) =>
    `<div class="bgthumb" data-type="${type}" onclick="setAltBg(this,'${bg.src}','${type}')">
      <img src="${bg.src}" loading="lazy">
    </div>`).join('');

  if (!document.getElementById('ready-bg-grid').dataset.filled) {
    document.getElementById('ready-bg-grid').innerHTML = html('ready-bg-grid','ready');
    document.getElementById('ready-bg-grid').dataset.filled = '1';
  }
  if (!document.getElementById('batch-bg-grid').dataset.filled) {
    document.getElementById('batch-bg-grid').innerHTML = html('batch-bg-grid','batch');
    document.getElementById('batch-bg-grid').dataset.filled = '1';
  }
}
function setAltBg(el, src, type) {
  const gridId = type === 'ready' ? 'ready-bg-grid' : 'batch-bg-grid';
  const canvasId = type === 'ready' ? 'ready-canvas' : 'batch-canvas';
  document.querySelectorAll('#'+gridId+' .bgthumb').forEach(t => t.classList.remove('on'));
  el.classList.add('on');
  document.getElementById(canvasId).style.backgroundImage = `url('${src}')`;
  if (type === 'ready') readyBgSrc = src;
  else batchBgSrc = src;
}

// ══════════════════════════
// READY MODE
// ══════════════════════════
function updateReady() {
  const main  = document.getElementById('r-text-main');
  const sub   = document.getElementById('r-text-sub');
  const msize = document.getElementById('r-msize').value;
  const mpos  = document.getElementById('r-mpos').value;
  const ssize = document.getElementById('r-ssize').value;
  const spos  = document.getElementById('r-spos').value;
  const font  = document.getElementById('r-font').value;
  const color = document.getElementById('r-color').value;

  main.textContent = document.getElementById('r-main').value || ' ';
  sub.textContent  = document.getElementById('r-sub').value  || ' ';

  main.style.fontSize  = msize+'px'; main.style.top = mpos+'%';
  sub.style.fontSize   = ssize+'px'; sub.style.top  = spos+'%';
  main.style.fontFamily = sub.style.fontFamily = font;
  main.style.color = sub.style.color = color;

  document.getElementById('vl-rms').textContent = msize;
  document.getElementById('vl-rmp').textContent = mpos+'%';
  document.getElementById('vl-rss').textContent = ssize;
  document.getElementById('vl-rsp').textContent = spos+'%';
}

async function dlReady() {
  notify('⏳ جاري التحميل...');
  try {
    const box = document.getElementById('ready-canvas');
    const c = await html2canvas(box, { scale:3, useCORS:true, backgroundColor:null });
    const a = document.createElement('a');
    a.download = 'Sallim-Ready.png'; a.href = c.toDataURL('image/png'); a.click();
    notify('تم التحميل ✓');
  } catch(e) { notify('خطأ في التحميل'); }
}
async function shareReadyWA() {
  window.open(`https://wa.me/?text=${encodeURIComponent(document.getElementById('r-main').value + ' — كل عام وأنتم بخير 🌙')}`, '_blank');
  await dlReady();
}

// ══════════════════════════
// BATCH MODE (جماعي)
// ══════════════════════════
function updateBatch() {
  const names = document.getElementById('b-names').value.split('\n').map(n=>n.trim()).filter(n=>n);
  document.getElementById('b-count').textContent = names.length + ' أسماء';

  const nameEl = document.getElementById('b-text-name');
  nameEl.textContent = names[0] || 'الاسم يظهر هنا';

  const size  = document.getElementById('b-size').value;
  const pos   = document.getElementById('b-pos').value;
  const font  = document.getElementById('b-font').value;
  const color = document.getElementById('b-color').value;

  nameEl.style.fontSize   = size+'px';
  nameEl.style.top        = pos+'%';
  nameEl.style.fontFamily = font;
  nameEl.style.color      = color;

  document.getElementById('vl-bs').textContent = size;
  document.getElementById('vl-bp').textContent = pos+'%';
}

async function dlBatchZip() {
  const names = document.getElementById('b-names').value.split('\n').map(n=>n.trim()).filter(n=>n);
  if (!names.length) { notify('أدخل اسماً واحداً على الأقل!'); return; }

  const btn = document.getElementById('btn-batch');
  btn.innerHTML = '⏳ جاري الإنشاء... ' + names.length + ' بطاقة';
  btn.disabled = true;

  const zip     = new JSZip();
  const box     = document.getElementById('batch-canvas');
  const nameEl  = document.getElementById('b-text-name');
  const origTxt = nameEl.textContent;
  const size    = document.getElementById('b-size').value;
  const pos     = document.getElementById('b-pos').value;
  const font    = document.getElementById('b-font').value;
  const color   = document.getElementById('b-color').value;

  for (let i = 0; i < names.length; i++) {
    nameEl.textContent        = names[i];
    nameEl.style.fontSize     = size+'px';
    nameEl.style.top          = pos+'%';
    nameEl.style.fontFamily   = font;
    nameEl.style.color        = color;
    btn.innerHTML = `⏳ ${i+1} / ${names.length}`;
    await new Promise(r => setTimeout(r, 80));
    try {
      const c = await html2canvas(box, { scale:2, useCORS:true, backgroundColor:null });
      const imgData = c.toDataURL('image/png').split(',')[1];
      const safeName = names[i].replace(/[\\/:*?"<>|]/g,'_');
      zip.file(`${i+1}_${safeName}.png`, imgData, {base64:true});
    } catch(e) { console.error(e); }
  }

  zip.generateAsync({type:'blob'}).then(content => {
    saveAs(content, 'Sallim_Batch.zip');
    nameEl.textContent = origTxt;
    btn.innerHTML = '📦 إنشاء وتحميل ملف ZIP';
    btn.disabled = false;
    notify(`تم إنشاء ${names.length} بطاقة ✓`);
  });
}

// ══════════════════════════
// NOTIFY
// ══════════════════════════
function notify(msg) {
  const n = document.getElementById('notif');
  n.textContent = msg; n.classList.add('vis');
  clearTimeout(n._t); n._t = setTimeout(() => n.classList.remove('vis'), 2600);
}


(function() {
    'use strict';
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }

        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
            e.preventDefault();
            return false;
        }

   if (e.ctrlKey && (e.key === 'u' || e.keyCode === 85)) {
        e.preventDefault();
        return false;
    }
    });

    const devToolsCheck = function() {
        if (window.console && window.console.time) {
                (function() {
                    (function() {
                        debugger;
                    }).apply(this, ['alwaysOn']);
                })();
         
        }
    };
    

    setInterval(devToolsCheck, 1000);


    document.addEventListener('copy', function(e) {
        e.preventDefault();
    });

})();

// ══════════════════════════
// DRAG ENGINE (تحديث زر الحذف)
// ══════════════════════════
function makeWrap(x, y) {
  const w = document.createElement('div');
  w.className = 'el'; w.dataset.id = ++eid;
  w.style.left = x + 'px'; w.style.top = y + 'px';
  
  // 1. إنشاء زر الحذف (X)
  const delBtn = document.createElement('div');
  delBtn.className = 'del-btn';
  delBtn.innerHTML = '✕';
  
  // منع تداخل النقر/السحب مع العنصر نفسه
  delBtn.addEventListener('mousedown', e => e.stopPropagation());
  delBtn.addEventListener('touchstart', e => e.stopPropagation(), {passive:false});
  
  // حدث الحذف عند النقر على (X)
  delBtn.addEventListener('click', e => {
    e.stopPropagation(); // عشان المتصفح ميعملش select تاني
    w.remove(); // حذف العنصر من الشاشة
    if (selEl === w) selEl = null; // تفريغ التحديد
    notify('تم الحذف ✓');
  });

  // 2. مقبض التكبير والتصغير (الموجود عندك أصلاً)
  const rh = document.createElement('div'); rh.className = 'rhandle';
  
  w.appendChild(delBtn); // إضافة الزر للعنصر
  w.appendChild(rh);
  
  attachDrag(w, rh);
  CV.appendChild(w);
  return w;
}