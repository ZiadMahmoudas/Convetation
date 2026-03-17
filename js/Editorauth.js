let currentUser = null;
let isGuestMode = false;

// ── Floating Promo Button (الزرار العائم الخارجي) ──
function _showFloatingPromo(promoUrl) {
  let btn = document.getElementById('promo-cta-btn');
  if (!promoUrl || promoUrl === 'undefined' || promoUrl === 'null' || promoUrl.trim() === '') {
    if (btn) btn.style.display = 'none';
    return;
  }
  if (!btn) {
    btn = document.createElement('a');
    btn.id = 'promo-cta-btn';
    btn.target = '_blank';
    btn.style.cssText = `
      position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 1000;
      background: linear-gradient(135deg, #D4A843, #ECC96A);
      color: #0D1117; font-family: 'Tajawal', sans-serif; font-weight: 800; font-size: 14px;
      padding: 10px 24px; border-radius: 50px; text-decoration: none;
      box-shadow: 0 8px 24px rgba(212,168,67,0.4); display: flex; align-items: center; gap: 8px;
    `;
    btn.innerHTML = `<i class="fa-solid fa-gift"></i> احصل على الكوبون لهذا التصميم`;
    document.body.appendChild(btn);
  }
  btn.href = promoUrl;
  btn.style.display = 'flex';
}

// ── Init ──────────────────────────────────
(async function init() {
  try {
    const session = await Auth.session();
    isGuestMode   = !session;
    if (session) {
      currentUser = await Auth.me();
      _showAuthBadge(currentUser);
    } else {
      _showGuestBanner();
    }
    await _loadCalligraphy();
    await _loadBackgrounds();
  } catch(e) {
    console.warn('Auth init failed:', e.message);
    isGuestMode = true;
    _showGuestBanner();
  }
})();

// ── Auth Badge ────────────────────────────
function _showAuthBadge(user) {
  const name    = user?.profile?.full_name || user?.profile?.username || 'مستخدم';
  const isAdmin = user?.profile?.role === 'admin';
  const el = document.createElement('div');
  el.id = 'auth-badge';
  el.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:500;
    display:flex;align-items:center;gap:10px;
    background:#111922;border:1px solid rgba(212,168,67,.2);
    border-top:2px solid #D4A843;border-radius:12px;
    padding:10px 16px;box-shadow:0 8px 32px rgba(0,0,0,.4);
    font-family:Tajawal,sans-serif;direction:rtl;
  `;
  el.innerHTML = `
    <div style="width:30px;height:30px;border-radius:50%;
      background:linear-gradient(135deg,#D4A843,#2A8A7E);
      display:flex;align-items:center;justify-content:center;
      font-weight:800;font-size:13px;color:#0D1117;flex-shrink:0">
      ${name.charAt(0).toUpperCase()}
    </div>
    <div>
      <div style="font-size:13px;font-weight:700;color:#F7F2E8">${name}</div>
      <div style="font-size:10px;color:${isAdmin?'#D4A843':'rgba(247,242,232,.4)'}">
        ${isAdmin ? '⭐ أدمن' : 'مستخدم مسجل'}
      </div>
    </div>
    ${isAdmin ? `<a href="./admin/dashboard.html"
      style="padding:5px 10px;background:rgba(212,168,67,.15);color:#D4A843;
        border-radius:7px;font-size:11px;font-weight:800;
        text-decoration:none;border:1px solid rgba(212,168,67,.25);white-space:nowrap">
      لوحة الإدارة
    </a>` : ''}
    <button onclick="Auth.logout()"
      style="background:none;border:none;cursor:pointer;
        color:rgba(247,242,232,.25);font-size:18px;padding:2px 0 2px 4px"
      onmouseover="this.style.color='#C0705A'"
      onmouseout="this.style.color='rgba(247,242,232,.25)'">
      <i class="fa-solid fa-right-from-bracket"></i>
    </button>
  `;
  document.body.appendChild(el);
}

// ── Guest Banner ──────────────────────────
function _showGuestBanner() {
  const used = Guest.usedCount(), rem = Guest.remaining();
  const el = document.createElement('div');
  el.id = 'guest-banner';
  el.style.cssText = `
    position:fixed;bottom:0;left:0;right:0;z-index:500;
    background:#111922;border-top:2px solid #D4A843;
    padding:10px 20px;display:flex;align-items:center;
    justify-content:space-between;gap:12px;
    font-family:Tajawal,sans-serif;direction:rtl;
    box-shadow:0 -4px 24px rgba(0,0,0,.4);
  `;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px">
      <div style="display:flex;gap:5px" id="guest-dots">${_dotsHTML(used)}</div>
      <span style="font-size:13px;color:rgba(247,242,232,.6);font-weight:600">
        وضع الضيف — <strong id="guest-remaining" style="color:#D4A843">${rem}</strong> اختيار متبقي
      </span>
    </div>
    <a href="/login.html"
      style="padding:7px 18px;border-radius:8px;font-size:13px;font-weight:700;
        background:#D4A843;color:#0D1117;text-decoration:none;white-space:nowrap">
      سجّل الدخول
    </a>
  `;
  document.body.appendChild(el);
}
function _dotsHTML(used) {
  return [1,2].map(i =>
    `<div style="width:10px;height:10px;border-radius:50%;
      background:${i<=used?'#C0705A':'rgba(212,168,67,.4)'};
      transition:background .3s"></div>`
  ).join('');
}
function _updateGuestBanner() {
  const d = document.getElementById('guest-dots');
  const r = document.getElementById('guest-remaining');
  if (d) d.innerHTML = _dotsHTML(Guest.usedCount());
  if (r) r.textContent = Guest.remaining();
}

// ── Guest Gate & Floating Link ────────────────────────────
const _origAddCallig = window.addCallig;
window.addCallig = async function(src, name, imageId, promoUrl) {
  if (isGuestMode) {
    const ok = await Guest.recordUse(imageId||src, 'calligraphy');
    if (!ok) { _showLimitModal(); return; }
    _updateGuestBanner();
  }
  _origAddCallig(src, name, imageId);
  _showFloatingPromo(promoUrl);
};
const _origSetBg = window.setBg;
window.setBg = async function(el, src, imageId, promoUrl) {
  if (isGuestMode) {
    const ok = await Guest.recordUse(imageId||src, 'background');
    if (!ok) { _showLimitModal(); return; }
    _updateGuestBanner();
  }
  _origSetBg(el, src, imageId);
  _showFloatingPromo(promoUrl);
};

// ── Limit Modal ───────────────────────────
function _showLimitModal() {
  let ov = document.getElementById('_guest-limit-modal');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = '_guest-limit-modal';
    ov.style.cssText = `
      position:fixed;inset:0;z-index:900;
      background:rgba(0,0,0,.8);backdrop-filter:blur(6px);
      display:flex;align-items:center;justify-content:center;
      padding:20px;font-family:Tajawal,sans-serif;direction:rtl;
    `;
    ov.innerHTML = `
      <div style="background:#111922;border:1px solid rgba(212,168,67,.25);
        border-top:3px solid #D4A843;border-radius:20px;
        width:100%;max-width:400px;padding:32px;text-align:center;position:relative;">
        <button onclick="document.getElementById('_guest-limit-modal').style.display='none'"
          style="position:absolute;top:14px;left:14px;background:none;border:none;
            color:rgba(247,242,232,.25);cursor:pointer;font-size:18px">✕</button>
        <div style="font-size:44px;margin-bottom:14px">🔐</div>
        <h2 style="font-family:Amiri,serif;font-size:22px;color:#ECC96A;margin-bottom:10px">
          انتهت الاختيارات المجانية
        </h2>
        <div style="display:flex;gap:10px">
          <a href="/login.html" style="flex:1;padding:12px;border-radius:10px;text-align:center;
            background:#D4A843;color:#0D1117;font-size:14px;font-weight:800;text-decoration:none">
            سجّل الدخول مجاناً
          </a>
          <a href="/login.html" style="flex:1;padding:12px;border-radius:10px;text-align:center;
            background:transparent;border:1px solid rgba(212,168,67,.22);
            color:rgba(247,242,232,.5);font-size:13px;font-weight:700;text-decoration:none">
            إنشاء حساب
          </a>
        </div>
      </div>`;
    document.body.appendChild(ov);
  }
  ov.style.display = 'flex';
}

// ══════════════════════════════════════════
//  LOAD CALLIGRAPHY — مع تاج كوبون ★
// ══════════════════════════════════════════
async function _loadCalligraphy() {
  try {
    const [categories, items] = await Promise.all([
      DB.getCategories(),
      DB.getCalligraphy()
    ]);
    if (!items.length) return;

    const byStyle = { black:[], white:[], '3d':[], colored:[] };
    items.forEach(c => {
      const s = c.style || 'black';
      if (byStyle[s]) byStyle[s].push(c);
    });

    let unlockedItems = JSON.parse(localStorage.getItem('sallim_unlocked') || '[]');

    ['black', '3d', 'white'].forEach(style => {
      const grid = document.getElementById('cg-' + style);
      if (!grid || !byStyle[style].length) return;
      const bgcls = style === 'black' ? 'lt' : 'dk';

      grid.innerHTML = byStyle[style].map(item => {
        const src      = item.public_url || item.storage_path;
        const safeSrc  = src.replace(/'/g, "\\'");
        const safeName = item.name.replace(/'/g, "\\'");
        const promoLink = item.promo_link ? item.promo_link.replace(/'/g, "\\'") : ''; 
        const isPremium = !!item.is_premium && !unlockedItems.includes(item.id);

        const clickFn = isPremium && !isGuestMode
          ? `_showCouponPopup('${item.id}', 'calligraphy', '${promoLink}', function(){ window.addCallig('${safeSrc}', '${safeName}', '${item.id}', '${promoLink}'); })`
          : `window.addCallig('${safeSrc}', '${safeName}', '${item.id}', '${promoLink}')`;

        return `
          <div class="citem ${bgcls}" onclick="${clickFn}"
            data-src="${src}" data-name="${item.name}" data-id="${item.id}"
            draggable="true" style="position:relative;cursor:pointer"
            ondragstart="_onCalDragStart(event,this)">
            <img src="${src}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'"/>
            ${isPremium ? `
              <div style="position:absolute;top:3px;right:3px;background:linear-gradient(135deg,#D4A843,#B8860B);color:#0D1117;font-size:7px;font-weight:900;padding:2px 5px;border-radius:3px;">
                ★ حصري
              </div>` : ''}
            <div class="clabel">${item.name}</div>
          </div>`;
      }).join('');

      const sm = document.getElementById('sm-' + style);
      if (sm) sm.classList.remove('vis');
    });

    _buildCategoryTabs(categories, items);
  } catch(e) { console.warn('Cal load failed:', e.message); }
}

// ══════════════════════════════════════════
//  LOAD BACKGROUNDS — مع تاج كوبون ★
// ══════════════════════════════════════════
async function _loadBackgrounds() {
  try {
    const bgs = await DB.getBackgrounds();
    if (!bgs.length) return;

const firstSrc = bgs[0].public_url || bgs[0].storage_path;
    // طالما إحنا عرفنا دالة applyBgImage في editor.js، نقدر نستخدمها هنا
    if (typeof applyBgImage === 'function') {
        const cv = document.getElementById('canvas');
        if (cv) applyBgImage(firstSrc, cv);
        
        ['ready-canvas','batch-canvas'].forEach(id => {
            const el = document.getElementById(id);
            if (el) applyBgImage(firstSrc, el);
        });
    }

    let unlockedItems = JSON.parse(localStorage.getItem('sallim_unlocked') || '[]');

    ['bggrid','ready-bg-grid','batch-bg-grid'].forEach(gridId => {
      const grid = document.getElementById(gridId);
      if (!grid) return;
      const type = gridId === 'bggrid' ? 'design' : gridId === 'ready-bg-grid' ? 'ready' : 'batch';

      grid.innerHTML = bgs.map((bg, idx) => {
        const src       = bg.public_url || bg.storage_path;
        const safeSrc   = src.replace(/'/g, "\\'");
        const promoLink = bg.promo_link ? bg.promo_link.replace(/'/g, "\\'") : ''; 
        const isPremium = !!bg.is_premium && !unlockedItems.includes(bg.id);
        const locked    = isPremium && isGuestMode;
        const thumbId = `bg-thumb-${bg.id}-${gridId}`;

        const clickFn = locked
          ? `_showLimitModal()`
          : isPremium && !isGuestMode
            ? `_showCouponPopup('${bg.id}','background','${promoLink}',function(){var t=document.getElementById('${thumbId}');window.setBg(t,'${safeSrc}','${bg.id}','${promoLink}')})`
            : type === 'design'
              ? `window.setBg(this,'${safeSrc}','${bg.id}','${promoLink}')`
              : `setAltBg(this,'${safeSrc}','${type === 'ready' ? 'ready' : 'batch'}','${promoLink}')`;

        return `
          <div id="${thumbId}" class="bgthumb${idx===0?' on':''}" onclick="${clickFn}" style="position:relative">
            <img src="${src}" loading="lazy" alt="${bg.name}" onerror="this.parentElement.style.display='none'"/>
            ${isPremium ? `
              <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.75));padding:10px 5px 4px;display:flex;justify-content:center;pointer-events:none;">
                <span style="background:linear-gradient(135deg,#D4A843,#B8860B);color:#0D1117;font-size:7px;font-weight:900;padding:2px 6px;border-radius:3px;display:flex;align-items:center;gap:2px;">★ كوبون</span>
              </div>` : ''}
          </div>`;
      }).join('');
      grid.dataset.filled = '1';
    });
  } catch(e) { console.warn('BG load failed:', e.message); }
}

// ══════════════════════════════════════════
//  CATEGORY TABS
// ══════════════════════════════════════════
function _buildCategoryTabs(categories, items) {
  const catTabsEl = document.querySelector('.cattabs');
  if (!catTabsEl || !categories.length) return;
  const counts = {};
  items.forEach(item => {
    if (item.category_id) counts[item.category_id] = (counts[item.category_id]||0) + 1;
  });
  const activeCats = categories.filter(c => counts[c.id]);
  if (!activeCats.length) return;
  catTabsEl.insertAdjacentHTML('beforeend',
    activeCats.map(c => `
      <button class="catbtn" data-cat-id="${c.id}"
        onclick="_filterByCategory('${c.id}',this)">
        ${c.icon||''} ${c.name}
        <small style="opacity:.5;font-size:9px">${counts[c.id]}</small>
      </button>`).join('')
  );
}

async function _filterByCategory(catId, btn) {
  document.querySelectorAll('.catbtn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  ['black','3d','white'].forEach(c => {
    const el = document.getElementById('cat-' + c);
    if (el) el.style.display = 'none';
  });
  let con = document.getElementById('_cat-custom');
  if (!con) {
    con = document.createElement('div'); con.id = '_cat-custom';
    const p = document.getElementById('panel-cal'); if (p) p.appendChild(con);
  }
  con.style.display = 'block';
  con.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;
    padding:20px;gap:8px;color:rgba(42,58,77,.4);font-size:12px">
    <div style="width:14px;height:14px;border:2px solid rgba(247,175,60,.2);
      border-top-color:#F7AF3C;border-radius:50%;animation:spin .6s linear infinite"></div>
    جاري التحميل...</div>`;
  try {
    const items = await DB.getCalligraphy(catId);
    if (!items.length) {
      con.innerHTML = `<div style="text-align:center;padding:20px;
        color:rgba(42,58,77,.3);font-size:12px">لا توجد مخطوطات</div>`;
      return;
    }
    con.innerHTML = `<div class="cgrid">` + items.map(item => {
      const src = item.public_url || item.storage_path;
      const safeSrc = src.replace(/'/g, "\\'");
      const promoLink = item.promo_link ? item.promo_link.replace(/'/g, "\\'") : '';
      const bgcls = item.style === 'black' ? 'lt' : 'dk';
      const isPremium = !!item.is_premium;
      const clickFn = isPremium && !isGuestMode
        ? `_showCouponPopup('${item.id}','calligraphy','${promoLink}',function(){window.addCallig('${safeSrc}','${item.name.replace(/'/g,"\\'")}')})`
        : `window.addCallig('${safeSrc}','${item.name.replace(/'/g,"\\'")}','${item.id}','${promoLink}')`;
      return `
        <div class="citem ${bgcls}" onclick="${clickFn}"
          draggable="true" data-src="${src}" data-name="${item.name}"
          style="position:relative" ondragstart="_onCalDragStart(event,this)">
          <img src="${src}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'"/>
          ${isPremium ? `<div style="position:absolute;top:3px;right:3px;
            background:linear-gradient(135deg,#D4A843,#B8860B);
            color:#0D1117;font-size:7px;font-weight:900;
            padding:2px 5px;border-radius:3px;pointer-events:none">★ كوبون</div>` : ''}
          <div class="clabel">${item.name}</div>
        </div>`;
    }).join('') + `</div>`;
  } catch(e) { con.innerHTML = ''; }
}
window._filterByCategory = _filterByCategory;

// ══════════════════════════════════════════
//  SWAP بين العناصر على الكانفاس
// ══════════════════════════════════════════
let _dragEl = null; 
function _onCalDragStart(e, itemEl) {
  const src  = itemEl.dataset.src;
  const name = itemEl.dataset.name;
  e.dataTransfer.setData('text/plain', JSON.stringify({ src, name, type: 'new-callig' }));
  e.dataTransfer.effectAllowed = 'copy';
}
(function patchDragOnCanvas() {
  const CV = document.getElementById('canvas');
  if (!CV) return;
  CV.addEventListener('dragover', e => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
  });
  CV.addEventListener('drop', e => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'new-callig') { window.addCallig(data.src, data.name); } 
      else if (data.type === 'swap-canvas') { _swapCanvasElements(data.id, e); }
    } catch(err) {}
  });
})();
function _swapCanvasElements(draggedId, dropEvent) {
  const CV = document.getElementById('canvas');
  const dragged = CV.querySelector(`.el[data-id="${draggedId}"]`);
  if (!dragged) return;
  const canvasRect = CV.getBoundingClientRect();
  const x = dropEvent.clientX - canvasRect.left;
  const y = dropEvent.clientY - canvasRect.top;
  let target = null;
  CV.querySelectorAll('.el').forEach(el => {
    if (el === dragged) return;
    const r = el.getBoundingClientRect();
    const ex = r.left - canvasRect.left, ey = r.top  - canvasRect.top;
    const ew = r.width, eh = r.height;
    if (x >= ex && x <= ex+ew && y >= ey && y <= ey+eh) target = el;
  });
  if (!target) {
    const sz = Math.round(dragged.offsetWidth / 2);
    dragged.style.left = Math.max(0, Math.min(x - sz, CV.offsetWidth  - dragged.offsetWidth))  + 'px';
    dragged.style.top  = Math.max(0, Math.min(y - sz, CV.offsetHeight - dragged.offsetHeight)) + 'px';
    return;
  }
  const dl = dragged.style.left, dt = dragged.style.top;
  const tl = target.style.left,  tt = target.style.top;
  dragged.style.left = tl; dragged.style.top = tt;
  target.style.left  = dl; target.style.top  = dt;
  [dragged, target].forEach(el => {
    el.style.transition = 'left .25s,top .25s';
    setTimeout(() => el.style.transition = '', 300);
  });
  notify('تم التبديل ✓');
}
const _origMakeWrap = window.makeWrap;
if (typeof _origMakeWrap === 'function') {
  window.makeWrap = function(x, y) {
    const w = _origMakeWrap(x, y);
    w.setAttribute('draggable', 'true');
    w.addEventListener('dragstart', e => {
      if (e.target.classList.contains('del-btn') || e.target.classList.contains('rhandle')) { e.preventDefault(); return; }
      _dragEl = w;
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'swap-canvas', id: w.dataset.id }));
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => w.style.opacity = '0.5', 0);
    });
    w.addEventListener('dragend', () => { w.style.opacity = ''; _dragEl = null; });
    w.addEventListener('dragover', e => {
      e.preventDefault(); e.stopPropagation();
      if (_dragEl && _dragEl !== w) w.style.outline = '2px dashed #D4A843';
    });
    w.addEventListener('dragleave', () => w.style.outline = '');
    w.addEventListener('drop', e => {
      e.preventDefault(); e.stopPropagation();
      w.style.outline = '';
      if (!_dragEl || _dragEl === w) return;
      const dl = _dragEl.style.left, dt = _dragEl.style.top;
      _dragEl.style.left = w.style.left; _dragEl.style.top = w.style.top;
      w.style.left = dl; w.style.top = dt;
      [_dragEl, w].forEach(el => {
        el.style.transition = 'left .22s,top .22s';
        setTimeout(() => el.style.transition = '', 280);
      });
      notify('تم التبديل ✓');
    });
    return w;
  };
}

// ══════════════════════════════════════════
//  COUPON POPUP  ★
// ══════════════════════════════════════════
(function injectStyles() {
  if (document.getElementById('_cp-kf')) return;
  const s = document.createElement('style'); s.id = '_cp-kf';
  s.textContent = `
    @keyframes _cpSpin  { to { transform:rotate(360deg) } }
    @keyframes _cpIn    { from { opacity:0;transform:scale(.9) } to { opacity:1;transform:scale(1) } }
    @keyframes _cpGlow  { 0%,100%{box-shadow:0 0 18px rgba(212,168,67,.2)} 50%{box-shadow:0 0 36px rgba(212,168,67,.45)} }
  `;
  document.head.appendChild(s);
})();

function _showCouponPopup(imageId, imageType, promoUrl, onSuccess) {
  // 🌟 حماية الكود: لو المتغير التالت دالة مش لينك، بنضبطها عشان نتجنب الـ Error
  if (typeof promoUrl === 'function') {
    onSuccess = promoUrl;
    promoUrl = '';
  }
  const safeLink = (typeof promoUrl === 'string' && promoUrl.trim() !== '') ? promoUrl.trim() : '';

  document.getElementById('_coupon-popup')?.remove();

  const ov = document.createElement('div');
  ov.id = '_coupon-popup';
  ov.style.cssText = `
    position:fixed;inset:0;z-index:950;
    background:rgba(0,0,0,.88);backdrop-filter:blur(10px);
    display:flex;align-items:center;justify-content:center;
    padding:20px;font-family:Tajawal,sans-serif;direction:rtl;
  `;

  // 🌟 زرار الحصول على المنتج (هيظهر بس لو ليها لينك متسجل)
  const linkHtml = safeLink 
    ? `<div style="margin-top:18px;">
         <a href="${safeLink}" target="_blank" style="
           display:inline-flex;align-items:center;gap:8px;
           color:var(--gold2);font-size:13px;font-weight:800;text-decoration:none;
           padding:10px 20px;border:1px solid rgba(212,168,67,.25);border-radius:20px;
           background:rgba(212,168,67,.08);transition:all .2s ease;
         " onmouseover="this.style.background='rgba(212,168,67,.18)';this.style.transform='translateY(-2px)'"
           onmouseout="this.style.background='rgba(212,168,67,.08)';this.style.transform='none'">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> اضغط هنا للحصول على التصميم
         </a>
       </div>`
    : ``;

  ov.innerHTML = `
    <div style="
      background:linear-gradient(160deg,#111922,#0D1117);
      border:1px solid rgba(212,168,67,.25);border-top:3px solid #D4A843;
      border-radius:22px;width:100%;max-width:370px;
      padding:34px 26px;text-align:center;position:relative;
      animation:_cpIn .22s ease-out;
    ">
      <button id="_cp-close" style="
        position:absolute;top:14px;left:14px;
        background:none;border:none;color:rgba(247,242,232,.18);
        cursor:pointer;font-size:20px;line-height:1;transition:color .15s
      " onmouseover="this.style.color='#C0705A'" onmouseout="this.style.color='rgba(247,242,232,.18)'">✕</button>

      <div style="
        width:62px;height:62px;margin:0 auto 18px;
        background:rgba(212,168,67,.08);
        border:1.5px solid rgba(212,168,67,.28);border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        animation:_cpGlow 2s ease-in-out infinite;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D4A843" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 17h18M5 17L3 7l4.5 4L12 4l4.5 7L21 7l-2 10H5z"/>
        </svg>
      </div>

      <h2 style="font-family:Amiri,serif;font-size:20px;color:#ECC96A;margin-bottom:8px">محتوى حصري</h2>
      <p style="color:rgba(247,242,232,.38);font-size:13px;line-height:1.7;margin-bottom:22px">
        ادخل كوبونك من 9 أرقام لفتح هذا المحتوى<br>
        <span style="font-size:11px;color:rgba(212,168,67,.3)">صالح لاستخدام واحد فقط</span>
      </p>

      <div style="margin-bottom:10px">
        <input id="_cp-input" type="text" inputmode="numeric" maxlength="9"
          placeholder="• • • • • • • • •" autocomplete="off"
          style="
            width:100%;padding:14px 16px;border-radius:12px;
            border:1.5px solid rgba(212,168,67,.2);
            background:rgba(255,255,255,.03);color:#F7F2E8;
            font-family:monospace;font-size:22px;font-weight:900;
            letter-spacing:6px;text-align:center;outline:none;
            transition:border-color .2s,box-shadow .2s;
          "
          oninput="this.value=this.value.replace(/\\D/g,'');_cpDots(this.value.length)"
          onfocus="this.style.borderColor='#D4A843';this.style.boxShadow='0 0 0 3px rgba(212,168,67,.12)'"
          onblur="this.style.borderColor='rgba(212,168,67,.2)';this.style.boxShadow='none'"
          onkeydown="if(event.key==='Enter')_verifyCoupon('${imageId}','${imageType}')"/>
        <div id="_cp-dots" style="display:flex;justify-content:center;gap:5px;margin-top:8px">
          ${Array.from({length:9},(_,i)=>`<div id="_cpd${i+1}" style="width:6px;height:6px;border-radius:50%;background:rgba(212,168,67,.15);transition:background .15s"></div>`).join('')}
        </div>
      </div>

      <div id="_cp-msg" style="min-height:18px;font-size:12px;font-weight:700;margin-bottom:14px"></div>

      <button id="_cp-btn" onclick="_verifyCoupon('${imageId}','${imageType}')" style="
        width:100%;padding:13px;border-radius:12px;border:none;
        background:linear-gradient(135deg,#D4A843,#B8860B);
        color:#0D1117;font-family:Tajawal,sans-serif;
        font-size:15px;font-weight:800;cursor:pointer;
        box-shadow:0 4px 16px rgba(212,168,67,.3);transition:all .16s;
      " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='none'">
        تحقق من الكوبون
      </button>

      ${linkHtml}

    </div>`;

  document.body.appendChild(ov);
  window._couponSuccess = onSuccess; // 🌟 تسجيل دالة النجاح

  document.getElementById('_cp-close').onclick = () => ov.remove();
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  setTimeout(() => document.getElementById('_cp-input')?.focus(), 120);
}
function _cpDots(len) {
  for (let i=1; i<=9; i++) {
    const d = document.getElementById('_cpd'+i);
    if (d) d.style.background = i<=len ? '#D4A843' : 'rgba(212,168,67,.15)';
  }
}

async function _verifyCoupon(imageId, imageType) {
  const inp  = document.getElementById('_cp-input');
  const btn  = document.getElementById('_cp-btn');
  const code = inp?.value?.trim();

  if (!code || code.length !== 9) { _cpMsg('أدخل 9 أرقام كاملة ⚠️','warn'); return; }

  btn.disabled = true;
  btn.innerHTML = `<span style="display:inline-block;width:15px;height:15px;
    border:2px solid rgba(0,0,0,.2);border-top-color:#0D1117;
    border-radius:50%;animation:_cpSpin .6s linear infinite;vertical-align:middle"></span>`;

  try {
    const { data, error } = await sb.from('coupons').select('id,is_used').eq('code', code).single();

    if (error || !data) { _cpFail(btn,'الكوبون غير صحيح ❌'); return; }
    if (data.is_used)   { _cpFail(btn,'هذا الكوبون مستخدم بالفعل ❌'); return; }

    const { error: upErr } = await sb.from('coupons').update({
        is_used:true, used_by:currentUser?.id||null,
        used_at:new Date().toISOString(),
        image_id:imageId||null, image_type:imageType||null
      }).eq('id',data.id).eq('is_used',false);

    if (upErr) throw upErr;

    _cpMsg('✓ كوبون صحيح! جاري الفتح...','ok');
    btn.style.background = 'linear-gradient(135deg,#2A8A7E,#1a6b61)';
    btn.style.color = '#fff';
    btn.innerHTML = '✓ تم التحقق';

    let unlockedItems = JSON.parse(localStorage.getItem('sallim_unlocked') || '[]');
    if (imageId && !unlockedItems.includes(imageId)) {
        unlockedItems.push(imageId);
        localStorage.setItem('sallim_unlocked', JSON.stringify(unlockedItems));
    }

    setTimeout(() => {
      document.getElementById('_coupon-popup')?.remove();
      
      // 🌟 تشغيل الصورة فوراً بالدالة الصح اللي كانت معلقة
      if (typeof window._couponSuccess === 'function') {
        window._couponSuccess();
        window._couponSuccess = null;
      }
      
      document.querySelectorAll(`[onclick*="${imageId}"]`).forEach(el => {
          const crown = el.querySelector('div[style*="linear-gradient"]');
          if(crown) crown.remove(); 
          
          const oldClick = el.getAttribute('onclick');
          if(oldClick && oldClick.includes('_showCouponPopup')) {
              const match = oldClick.match(/function\(\)\{(.*?)\}/);
              if(match) el.setAttribute('onclick', match[1]);
          }
      });

    }, 700);

  } catch(e) { 
    console.error("Coupon Error: ", e); 
    _cpFail(btn,'خطأ، حاول مجدداً ⚠️'); 
  }
}
function _cpFail(btn, text) {
  _cpMsg(text,'err');
  btn.disabled = false; btn.innerHTML = 'تحقق من الكوبون';
  const inp = document.getElementById('_cp-input');
  if (inp) { inp.style.borderColor='#C0705A'; setTimeout(()=>inp.style.borderColor='rgba(212,168,67,.2)',1400); }
}
function _cpMsg(text, type) {
  const m = document.getElementById('_cp-msg'); if (!m) return;
  m.textContent = text;
  m.style.color = type==='ok'?'#2A8A7E':type==='err'?'#C0705A':'#D4A843';
}

window._showCouponPopup = _showCouponPopup;
window._verifyCoupon    = _verifyCoupon;
window._showLimitModal  = _showLimitModal;

