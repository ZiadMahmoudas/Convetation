// ══════════════════════════
// DATA — نصوص جاهزة فقط (الصور من Supabase)
// ══════════════════════════
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

// ══════════════════════════
// STATE
// ══════════════════════════
let selEl = null, photoEl = null, logoEl = null;
let mainSz = 26, subSz = 16, eid = 0;
const CV = document.getElementById('canvas');

// ══════════════════════════
// INIT — يشتغل بعد تحميل الصفحة
// ══════════════════════════
(function init() {
  buildReady('all');
  // الـ grids فاضية — editor-auth.js هيملأها من Supabase
  addText("عيد مبارك", 38, "#FFD700", 90, 50);
  addText("كل عام وأنتم بخير", 20, "#ffffff", 70, 115);
  document.addEventListener('click', onGrpClick);
  document.getElementById('cdots-text')?.addEventListener('click', onTextDot);
  document.getElementById('cdots-photo')?.addEventListener('click', onPhotoDot);
})();

// ══════════════════════════
// MODE SWITCHER
// ══════════════════════════
function switchMode(mode) {
  ['ready','design','group'].forEach(m => {
    const btn = document.getElementById('btn-' + m);
    if (btn) btn.classList.toggle('active', m === mode);
    const v = document.getElementById('view-' + m);
    if (v) v.style.display = m === mode ? (m === 'design' ? 'flex' : 'block') : 'none';
  });
  const filterbar = document.getElementById('filterbar');
  if (filterbar) filterbar.style.display = mode === 'design' ? 'flex' : 'none';
  if (mode === 'design') {
    document.getElementById('app-shell').style.display = 'flex';
  } else {
    document.getElementById('app-shell').style.display = 'none';
  }
}

function buildReady(key) {
  const list = READY_TEXTS[key] || READY_TEXTS.all;
  document.getElementById('rlist').innerHTML = list.map(t =>
    `<div class="ritem" onclick="readyClick(this)">${t}</div>`).join('');
}
function readyClick(el) {
  addText(el.textContent, 22, '#FFD700', 30, 60);
  notify('تمت الإضافة ✓');
}

function switchTab(btn) {
  document.querySelectorAll('.stab').forEach(b => b.classList.remove('on'));
  document.querySelectorAll('.spanel').forEach(p => p.classList.remove('on'));
  btn.classList.add('on');
  const panel = document.getElementById('panel-' + btn.dataset.tab);
  if (panel) panel.classList.add('on');
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
  switch (prop) {
    case 'font':   if (txt) txt.style.fontFamily = `'${val}',sans-serif`; break;
    case 'weight': if (txt) txt.style.fontWeight = val; break;
    case 'align':  if (txt) txt.style.textAlign = val; break;
    case 'size':
      if (txt) txt.style.fontSize = val + 'px';
      else if (img) {
        img.style.width    = (val * 4) + 'px';
        img.style.maxWidth = 'none';
        img.style.height   = 'auto';
      }
      const vlSize = document.getElementById('vl-size');
      const slSize = document.getElementById('sl-size');
      if (vlSize) vlSize.textContent = val;
      if (slSize) slSize.value = val;
      break;
    case 'shadow':
      if (txt) txt.style.textShadow = val > 0
        ? `0 ${Math.ceil(val / 4)}px ${val}px rgba(0,0,0,.6)` : 'none';
      break;
    case 'color': if (txt) txt.style.color = val; break;
  }
}

// ══════════════════════════
// DRAG ENGINE & SELECTION
// ══════════════════════════
function makeWrap(x, y) {
  const w = document.createElement('div');
  w.className = 'el'; w.dataset.id = ++eid;
  w.style.left = x + 'px'; w.style.top = y + 'px';

  const delBtn = document.createElement('div');
  delBtn.className = 'del-btn'; delBtn.innerHTML = '✕';
  delBtn.addEventListener('mousedown', e => e.stopPropagation());
  delBtn.addEventListener('touchstart', e => e.stopPropagation(), {passive:false});
  delBtn.addEventListener('click', e => {
    e.stopPropagation(); w.remove();
    if (selEl === w) selEl = null;
    notify('تم الحذف ✓');
  });

  // زر نقل للركن
  const mvBtn = document.createElement('div');
  mvBtn.className = 'mv-btn'; mvBtn.innerHTML = '↗';
  mvBtn.title = 'نقل لركن فاضي';
  mvBtn.addEventListener('mousedown', e => e.stopPropagation());
  mvBtn.addEventListener('touchstart', e => e.stopPropagation(), {passive:false});
  mvBtn.addEventListener('click', e => {
    e.stopPropagation();
    const corners = [
      {left:8, top:8},
      {left: CV.offsetWidth  - w.offsetWidth  - 8, top: 8},
      {left: 8,                                     top: CV.offsetHeight - w.offsetHeight - 8},
      {left: CV.offsetWidth  - w.offsetWidth  - 8, top: CV.offsetHeight - w.offsetHeight - 8},
    ];
    const cx = parseFloat(w.style.left)||0, cy = parseFloat(w.style.top)||0;
    let best = corners[0], bestDist = 0;
    corners.forEach(p => {
      const d = Math.abs(p.left-cx) + Math.abs(p.top-cy);
      if (d > bestDist) { bestDist = d; best = p; }
    });
    w.style.transition = 'left .25s ease, top .25s ease';
    w.style.left = best.left + 'px';
    w.style.top  = best.top  + 'px';
    setTimeout(() => w.style.transition = '', 280);
    notify('تم النقل للركن ✓');
  });

  const rh = document.createElement('div'); rh.className = 'rhandle';
  w.appendChild(delBtn); w.appendChild(mvBtn); w.appendChild(rh);
  attachDrag(w, rh);
  CV.appendChild(w);
  return w;
}

function attachDrag(el, rhandle) {
  let isDrag = false, isResize = false, ox, oy, ol, ot, ow, startFontSize;
  function gp(e) { const t = e.touches ? e.touches[0] : e; return {x: t.clientX, y: t.clientY}; }

  el.addEventListener('mousedown', startD);
  el.addEventListener('touchstart', startD, {passive:false});

  function startD(e) {
    if (e.target === rhandle) { startR(e); return; }
    const txt = el.querySelector('.el-text');
    if (txt && txt.contentEditable === 'true') return;
    e.stopPropagation();
    select(el);
    const p = gp(e); ox = p.x; oy = p.y; ol = el.offsetLeft; ot = el.offsetTop;
    isDrag = true;
    on('mousemove', doD); on('touchmove', doD); on('mouseup', endD); on('touchend', endD);
  }
  function doD(e) {
    if (!isDrag) return;
    if (e.cancelable) e.preventDefault();
    const p = gp(e);
    el.style.left = Math.max(0, Math.min(ol + p.x - ox, CV.offsetWidth - el.offsetWidth)) + 'px';
    el.style.top  = Math.max(0, Math.min(ot + p.y - oy, CV.offsetHeight - el.offsetHeight)) + 'px';
  }
  function endD() { isDrag = false; off('mousemove', doD); off('touchmove', doD); off('mouseup', endD); off('touchend', endD); }

  function startR(e) {
    e.stopPropagation(); select(el);
    const p = gp(e); ox = p.x;
    const txt = el.querySelector('.el-text');
    if (txt) startFontSize = parseFloat(window.getComputedStyle(txt).fontSize) || 26;
    else ow = el.offsetWidth;
    isResize = true;
    on('mousemove', doR); on('touchmove', doR); on('mouseup', endR); on('touchend', endR);
  }
  function doR(e) {
    if (!isResize) return;
    if (e.cancelable) e.preventDefault();
    const p = gp(e); const dx = p.x - ox;
    const txt = el.querySelector('.el-text');
    if (txt) {
      const nSize = Math.max(10, startFontSize + dx * 0.4);
      txt.style.fontSize = nSize + 'px';
      const sl = document.getElementById('sl-size'), vl = document.getElementById('vl-size');
      if (sl) sl.value = Math.round(nSize);
      if (vl) vl.textContent = Math.round(nSize);
    } else {
      const img = el.querySelector('img');
      if (img) {
        const nw = Math.max(40, ow + dx);
        img.style.width    = nw + 'px';
        img.style.height   = 'auto';
        img.style.maxWidth = 'none';
        el.style.width     = nw + 'px';
      }
    }
  }
  function endR() { isResize = false; off('mousemove', doR); off('touchmove', doR); off('mouseup', endR); off('touchend', endR); }

  function on(ev, fn)  { document.addEventListener(ev, fn, {passive:false}); }
  function off(ev, fn) { document.removeEventListener(ev, fn); }
}

function select(el) {
  deselect(); selEl = el; el.classList.add('selected');
  const txt = el.querySelector('.el-text');
  if (txt) {
    const fs = parseInt(window.getComputedStyle(txt).fontSize) || 26;
    const slSize = document.getElementById('sl-size');
    if (slSize) slSize.value = fs;
    const vlSize = document.getElementById('vl-size');
    if (vlSize) vlSize.textContent = fs;

    let align = txt.style.textAlign || 'right';
    const taGrp = document.querySelector('[data-grp="ta"]');
    if (taGrp) {
      taGrp.querySelectorAll('.gbtn').forEach(b => b.classList.remove('on'));
      const aBtn = taGrp.querySelector(`[data-val="${align}"]`);
      if (aBtn) aBtn.classList.add('on');
    }

    let weight = txt.style.fontWeight || '700';
    if (weight === 'bold') weight = '700';
    if (weight === 'normal') weight = '400';
    const fwGrp = document.querySelector('[data-grp="fw"]');
    if (fwGrp) {
      fwGrp.querySelectorAll('.gbtn').forEach(b => b.classList.remove('on'));
      const wBtn = fwGrp.querySelector(`[data-val="${weight}"]`) || fwGrp.querySelector('[data-val="700"]');
      if (wBtn) wBtn.classList.add('on');
    }
  }
  const op = Math.round((parseFloat(el.style.opacity) || 1) * 100);
  const slOp = document.getElementById('sl-op');
  if (slOp) slOp.value = op;
  const vlOp = document.getElementById('vl-op');
  if (vlOp) vlOp.textContent = op + '%';
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
  d.style.fontSize   = size + 'px';
  d.style.color      = color;
  d.style.fontFamily = "'Tajawal',sans-serif";
  d.style.fontWeight = '700';
  d.style.textAlign  = 'right';
  d.textContent      = text;
  d.addEventListener('dblclick', function(e) {
    e.stopPropagation();
    this.contentEditable = 'true';
    this.style.cursor = 'text';
    this.focus();
    const range = document.createRange(); range.selectNodeContents(this);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
  });
  d.addEventListener('blur', function() {
    this.contentEditable = 'false';
    this.style.cursor = 'inherit';
    this.innerHTML = this.textContent;
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

// الدالة الرئيسية لإضافة مخطوطة — editor-auth.js بيستدعيها
function addCallig(src, name) {
  const sz = parseInt(document.getElementById('sl-csz')?.value) || 180;
  const x  = Math.max(0, CV.offsetWidth / 2 - sz / 2);
  const y  = Math.max(0, CV.offsetHeight / 2 - 70);
  const w  = makeWrap(x, y);
  const img = document.createElement('img');
  img.src       = src;
  img.alt       = name;
  img.className = 'el-img';
  img.style.cssText = `display:block;width:${sz}px;height:auto;max-width:none;background:transparent;`;
  img.onerror = () => { notify('"' + name + '" — الملف غير متاح'); w.remove(); };
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
// CALLIGRAPHY — tabs الأنواع
// (الـ grids بتتملأ من editor-auth.js)
// ══════════════════════════
function switchCat(btn) {
  document.querySelectorAll('.catbtn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  const cat = btn.dataset.cat;
  ['black', '3d', 'white'].forEach(c => {
    const el = document.getElementById('cat-' + c);
    if (el) el.style.display = c === cat ? 'block' : 'none';
  });
  // إخفاء الـ custom grid لو موجود
  const custom = document.getElementById('_cat-custom');
  if (custom) custom.style.display = 'none';
}

// ══════════════════════════
// BACKGROUND — setBg فقط
// (الـ grid بتتملأ من editor-auth.js)
// ══════════════════════════
function setBg(el, src) {
  if (!src) return;
  CV.style.setProperty('background-image', `url("${src}")`, 'important');
  CV.style.setProperty('background-size', 'cover', 'important');
  CV.style.setProperty('background-position', 'center', 'important');
  document.querySelectorAll('.bgthumb').forEach(t => t.classList.remove('on'));
  if (el) el.classList.add('on');
  notify('تم تغيير الخلفية ✓');
}

function uploadBg(e) {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => { CV.style.backgroundImage = `url('${ev.target.result}')`; notify('تم رفع الخلفية ✓'); };
  r.readAsDataURL(f);
}

// ══════════════════════════
// PHOTO & LOGO
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
    const ctrl = document.getElementById('pho-ctrl');
    if (ctrl) ctrl.style.display = 'flex';
    notify('تم إضافة صورتك ✓');
  };
  r.readAsDataURL(f);
}
function resizePhoto(v) {
  const vl = document.getElementById('vl-phsz');
  if (vl) vl.textContent = v;
  if (!photoEl) return;
  const img = photoEl.querySelector('img');
  if (img) { img.style.width = v + 'px'; img.style.height = v + 'px'; }
}
function setPhotoShape(val) {
  if (!photoEl) return;
  const img = photoEl.querySelector('img'); if (!img) return;
  img.style.borderRadius = val === 'circle' ? '50%' : val === 'rounded' ? '16px' : '4px';
}

function uploadLogo(e) {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    const prev = document.getElementById('lgp-preview');
    if (prev) prev.innerHTML = `<img src="${ev.target.result}" style="max-height:60px;max-width:100%;object-fit:contain">`;
    if (logoEl) { logoEl.remove(); logoEl = null; }
    const w = makeWrap(10, 10);
    const img = document.createElement('img');
    img.src = ev.target.result;
    img.style.cssText = 'display:block;width:100px;height:auto;max-width:none;';
    w.insertBefore(img, w.firstChild);
    logoEl = w; select(w);
    const ctrl = document.getElementById('lgp-ctrl');
    if (ctrl) ctrl.style.display = 'flex';
    notify('تم إضافة الشعار ✓');
  };
  r.readAsDataURL(f);
}
function resizeLogo(v) {
  if (!logoEl) return;
  const img = logoEl.querySelector('img');
  if (img) { img.style.width = v + 'px'; img.style.maxWidth = 'none'; }
}
function setLogoPos(val) {
  if (!logoEl) return;
  const cw = CV.offsetWidth, ch = CV.offsetHeight;
  const lw = logoEl.offsetWidth, lh = logoEl.offsetHeight, pad = 10;
  const P = {
    tr: {top: pad, left: cw - lw - pad},
    tl: {top: pad, left: pad},
    br: {top: ch - lh - pad, left: cw - lw - pad},
    bl: {top: ch - lh - pad, left: pad}
  };
  if (P[val]) { logoEl.style.top = P[val].top + 'px'; logoEl.style.left = P[val].left + 'px'; }
}

// ══════════════════════════
// ALT VIEWS — جاهز وجماعي
// (الـ bg grids بتتملأ من editor-auth.js)
// ══════════════════════════
function setAltBg(el, src, type) {
  const gridId   = type === 'ready' ? 'ready-bg-grid' : 'batch-bg-grid';
  const canvasId = type === 'ready' ? 'ready-canvas'  : 'batch-canvas';
  document.querySelectorAll('#' + gridId + ' .bgthumb').forEach(t => t.classList.remove('on'));
  if (el) el.classList.add('on');
  document.getElementById(canvasId).style.backgroundImage = `url('${src}')`;
}

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

  main.style.fontSize = msize + 'px'; main.style.top = mpos + '%';
  sub.style.fontSize  = ssize + 'px'; sub.style.top  = spos + '%';
  main.style.fontFamily = sub.style.fontFamily = font;
  main.style.color = sub.style.color = color;

  document.getElementById('vl-rms').textContent = msize;
  document.getElementById('vl-rmp').textContent = mpos + '%';
  document.getElementById('vl-rss').textContent = ssize;
  document.getElementById('vl-rsp').textContent = spos + '%';
}

async function dlReady() {
  notify('⏳ جاري التحميل...');
  try {
    const box = document.getElementById('ready-canvas');
    const c = await html2canvas(box, {scale: 3, useCORS: true, backgroundColor: null});
    const a = document.createElement('a');
    a.download = 'card-ready.png'; a.href = c.toDataURL('image/png'); a.click();
    notify('تم التحميل ✓');
  } catch (e) { notify('خطأ في التحميل'); }
}

async function shareReadyWA() {
  showNotif("⏳ جاري تجهيز الصورة للواتساب...");
  try {
    const canvas = await html2canvas(document.getElementById('ready-canvas'), {useCORS: true, scale: 2});
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const file = new File([blob], "card.png", {type: 'image/png'});
    if (navigator.canShare && navigator.canShare({files: [file]})) {
      await navigator.share({files: [file]});
      showNotif("تم فتح الواتساب بنجاح ✓");
    } else {
      saveAs(blob, "card.png");
      setTimeout(() => window.open("https://wa.me/?text=" + encodeURIComponent("صممت هذه البطاقة عبر مكتبة المعلمين ✨"), "_blank"), 500);
    }
  } catch (e) { showNotif("حدث خطأ أثناء التجهيز."); }
}

function updateBatch() {
  const names  = document.getElementById('b-names').value.split('\n').map(n => n.trim()).filter(n => n);
  document.getElementById('b-count').textContent = names.length + ' أسماء';
  const nameEl = document.getElementById('b-text-name');
  nameEl.textContent = names[0] || 'الاسم يظهر هنا';
  const size  = document.getElementById('b-size').value;
  const pos   = document.getElementById('b-pos').value;
  const font  = document.getElementById('b-font').value;
  const color = document.getElementById('b-color').value;
  nameEl.style.fontSize   = size + 'px';
  nameEl.style.top        = pos + '%';
  nameEl.style.fontFamily = font;
  nameEl.style.color      = color;
  document.getElementById('vl-bs').textContent = size;
  document.getElementById('vl-bp').textContent = pos + '%';
}

async function dlBatchZip() {
  const names = document.getElementById('b-names').value.split('\n').map(n => n.trim()).filter(n => n);
  if (!names.length) { notify('أدخل اسماً واحداً على الأقل!'); return; }

  const btn = document.getElementById('btn-batch');
  btn.innerHTML = '⏳ جاري الإنشاء... ' + names.length + ' بطاقة';
  btn.disabled = true;

  const zip    = new JSZip();
  const box    = document.getElementById('batch-canvas');
  const nameEl = document.getElementById('b-text-name');
  const origTxt = nameEl.textContent;
  const size   = document.getElementById('b-size').value;
  const pos    = document.getElementById('b-pos').value;
  const font   = document.getElementById('b-font').value;
  const color  = document.getElementById('b-color').value;

  for (let i = 0; i < names.length; i++) {
    nameEl.textContent      = names[i];
    nameEl.style.fontSize   = size + 'px';
    nameEl.style.top        = pos + '%';
    nameEl.style.fontFamily = font;
    nameEl.style.color      = color;
    btn.innerHTML = `⏳ ${i + 1} / ${names.length}`;
    await new Promise(r => setTimeout(r, 80));
    try {
      const c = await html2canvas(box, {scale: 2, useCORS: true, backgroundColor: null});
      const imgData = c.toDataURL('image/png').split(',')[1];
      zip.file(`${i + 1}_${names[i].replace(/[\\/:*?"<>|]/g, '_')}.png`, imgData, {base64: true});
    } catch (e) { console.error(e); }
  }

  zip.generateAsync({type: 'blob'}).then(content => {
    saveAs(content, 'cards_batch.zip');
    nameEl.textContent = origTxt;
    btn.innerHTML = '📦 إنشاء وتحميل ملف ZIP';
    btn.disabled = false;
    notify(`تم إنشاء ${names.length} بطاقة ✓`);
  });
}

// ══════════════════════════
// EXPORT
// ══════════════════════════
async function capture() {
  deselect();
  await new Promise(r => setTimeout(r, 150));
  return html2canvas(CV, {useCORS: true, scale: 3, allowTaint: true, backgroundColor: null});
}
async function dlPNG() {
  notify('⏳ جاري التحميل...');
  try {
    const c = await capture();
    const a = document.createElement('a');
    a.download = 'card.png'; a.href = c.toDataURL('image/png'); a.click();
    notify('تم التحميل ✓');
  } catch (e) { notify('خطأ في التحميل'); }
}
async function dlPDF() {
  notify('⏳ جاري إنشاء PDF...');
  try {
    const c = await capture();
    const {jsPDF} = window.jspdf;
    const pdf = new jsPDF({orientation: 'p', unit: 'px', format: [c.width, c.height]});
    pdf.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, c.width, c.height);
    pdf.save('card.pdf');
    notify('تم إنشاء PDF ✓');
  } catch (e) { notify('خطأ في إنشاء PDF'); }
}
async function copyImg() {
  try {
    const c = await capture();
    c.toBlob(async blob => {
      await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
      notify('تم النسخ 🎉');
    });
  } catch { notify('متصفحك لا يدعم النسخ المباشر'); }
}
async function shareNative() {
  const c = await capture();
  c.toBlob(async blob => {
    const file = new File([blob], 'card.png', {type: 'image/png'});
    if (navigator.share) { try { await navigator.share({title: 'بطاقة تهنئة', files: [file]}); } catch {} }
    else notify('المشاركة غير مدعومة في هذا المتصفح');
  });
}
async function shareWA() {
  showNotif("⏳ جاري تجهيز البطاقة للواتساب...");
  try {
    deselect();
    await new Promise(r => setTimeout(r, 150));
    const canvas = await html2canvas(CV, {useCORS: true, scale: 2, allowTaint: true, backgroundColor: null});
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const file = new File([blob], "card.png", {type: 'image/png'});
    if (navigator.canShare && navigator.canShare({files: [file]})) {
      await navigator.share({files: [file]});
      showNotif("تم فتح الواتساب بنجاح ✓");
    } else {
      saveAs(blob, "card.png");
      setTimeout(() => window.open("https://wa.me/?text=" + encodeURIComponent("صممت هذه البطاقة عبر مكتبة المعلمين ✨"), "_blank"), 500);
      showNotif("جاري التحميل...");
    }
  } catch (e) { showNotif("حدث خطأ أثناء التجهيز."); }
}

// ══════════════════════════
// NOTIFY
// ══════════════════════════
function notify(msg) {
  const n = document.getElementById('notif');
  if (!n) return;
  n.textContent = msg; n.classList.add('vis');
  clearTimeout(n._t); n._t = setTimeout(() => n.classList.remove('vis'), 2600);
}
function showNotif(msg) { notify(msg); }

