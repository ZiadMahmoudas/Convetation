/* ── Ornament Canvas (Islamic geometric) ── */
const canvas = document.getElementById('ornaCanvas');
const ctx = canvas.getContext('2d');
let W, H;
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function drawStar(cx, cy, r, points, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = .5;
  const outer = r, inner = r * .42;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const rad = i % 2 === 0 ? outer : inner;
    const x = cx + rad * Math.cos(angle);
    const y = cy + rad * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawOrnaments() {
  ctx.clearRect(0, 0, W, H);
  const spacing = 140;
  for (let x = spacing / 2; x < W; x += spacing) {
    for (let y = spacing / 2; y < H; y += spacing) {
      drawStar(x, y, 22, 8, '#D4A843', .18);
      drawStar(x, y, 10, 6, '#D4A843', .1);
    }
  }
}

drawOrnaments();
window.addEventListener('resize', drawOrnaments);

/* ── Nav hamburger ── */
document.getElementById('hamBtn').addEventListener('click', () => {
  document.getElementById('mob').classList.toggle('show');
});
document.querySelectorAll('#mob a').forEach(a => a.addEventListener('click', () => {
  document.getElementById('mob').classList.remove('show');
}));

/* ── Scroll reveal ── */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: .08 });
document.querySelectorAll('.ai').forEach(el => io.observe(el));

/* ── Trigger hero items (already in view) ── */
document.querySelectorAll('#hero .ai').forEach(el => {
  setTimeout(() => el.classList.add('vis'), 80);
});

/* ── Navbar scroll effect ── */
// window.addEventListener('scroll', () => {
//   document.getElementById('nav').style.background =
//     window.scrollY > 30 ? 'rgba(13,17,23,.97)' : 'rgba(13,17,23,.85)';
// });


(async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return;

  const { data: profile } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
  const name    = profile?.full_name || profile?.username || 'حسابي';
  const isAdmin = profile?.role === 'admin';
  const letter  = name.charAt(0).toUpperCase();

  document.getElementById('nav-auth-area').innerHTML = `
    <div style="position:relative" id="ubox">

      <button onclick="
        var m=document.getElementById('umenu');
        var c=document.getElementById('uchev');
        var open=m.style.display==='block';
        m.style.display=open?'none':'block';
        c.style.transform=open?'rotate(0)':'rotate(180deg)';
      " style="
        display:flex;align-items:center;gap:8px;
        padding:6px 12px 6px 8px;
        background:rgba(212,168,67,.08);
        border:1px solid rgba(212,168,67,.22);
        border-radius:22px;cursor:pointer;
        color:#F7F2E8;font-family:Tajawal,sans-serif;
        font-size:13px;font-weight:700;transition:all .18s;
      "
      onmouseover="this.style.background='rgba(212,168,67,.15)'"
      onmouseout="this.style.background='rgba(212,168,67,.08)'">

        <span style="max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</span>
        <i id="uchev" class="fa-solid fa-chevron-down" style="font-size:10px;opacity:.5;transition:transform .2s"></i>
      </button>

      <div id="umenu" style="
        display:none;position:absolute;top:calc(100% + 10px);left:0;
        min-width:210px;
        background:#111922;
        border:1px solid rgba(212,168,67,.18);
        border-radius:14px;padding:6px;
        box-shadow:0 16px 48px rgba(0,0,0,.5);
        z-index:9999;font-family:Tajawal,sans-serif;
      ">
        <!-- Profile strip -->

        <div style="height:1px;background:rgba(212,168,67,.1);margin:0 6px 6px"></div>

        ${isAdmin ? `
        <a href="../admin/dashboard.html" style="
          display:flex;align-items:center;gap:9px;
          padding:9px 12px;border-radius:8px;
          color:rgba(247,242,232,.65);font-size:13px;font-weight:700;
          text-decoration:none;transition:background .14s;
        "
        onmouseover="this.style.background='rgba(212,168,67,.07)';this.style.color='#F7F2E8'"
        onmouseout="this.style.background='transparent';this.style.color='rgba(247,242,232,.65)'">
          <i class="fa-solid fa-gauge" style="width:16px;text-align:center;color:rgba(212,168,67,.5)"></i>
          لوحة الإدارة
        </a>` : ''}

        <a href="../editor.html" style="
          display:flex;align-items:center;gap:9px;
          padding:9px 12px;border-radius:8px;
          color:rgba(247,242,232,.65);font-size:13px;font-weight:700;
          text-decoration:none;transition:background .14s;
        "
        onmouseover="this.style.background='rgba(212,168,67,.07)';this.style.color='#F7F2E8'"
        onmouseout="this.style.background='transparent';this.style.color='rgba(247,242,232,.65)'">
          <i class="fa-solid fa-pen-nib" style="width:16px;text-align:center;color:rgba(212,168,67,.5)"></i>
          محرر البطاقات
        </a>

        <div style="height:1px;background:rgba(212,168,67,.1);margin:6px"></div>

        <button onclick="
          localStorage.removeItem('_sallim_guest');
          localStorage.removeItem('_sallim_fp');
          sb.auth.signOut().then(()=> window.location.href='/index.html');
        " style="
          display:flex;align-items:center;gap:9px;width:100%;
          padding:9px 12px;border-radius:8px;border:none;background:none;
          color:rgba(192,112,90,.7);font-family:Tajawal,sans-serif;
          font-size:13px;font-weight:700;cursor:pointer;text-align:right;
          transition:background .14s;
        "
        onmouseover="this.style.background='rgba(192,112,90,.08)';this.style.color='#C0705A'"
        onmouseout="this.style.background='transparent';this.style.color='rgba(192,112,90,.7)'">
          <i class="fa-solid fa-right-from-bracket" style="width:16px;text-align:center;color:rgba(192,112,90,.5)"></i>
          تسجيل الخروج
        </button>
      </div>
    </div>
  `;

  // إغلاق القائمة لما يضغط برا
  document.addEventListener('click', e => {
    const box = document.getElementById('ubox');
    const menu = document.getElementById('umenu');
    const chev = document.getElementById('uchev');
    if (box && !box.contains(e.target) && menu) {
      menu.style.display = 'none';
      if (chev) chev.style.transform = 'rotate(0)';
    }
  });
})();

// ══════════════════════════════════════════
//  index.js — الصفحة الرئيسية
//  يجيب القوالب المميزة من Supabase ويعرضها
// ══════════════════════════════════════════

/* ── BG CANVAS ── */
(function(){
  const cv = document.getElementById('ornaCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, dots = [];
  function resize(){ W = cv.width = innerWidth; H = cv.height = innerHeight; }
  resize(); window.addEventListener('resize', resize);
  for (let i = 0; i < 70; i++) dots.push({
    x: Math.random() * 1400, y: Math.random() * 1000,
    vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .2,
    r: Math.random() * 1.4 + .4, a: Math.random()
  });
  (function frame(){
    ctx.clearRect(0, 0, W, H);
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,168,67,${d.a * .35})`; ctx.fill();
    });
    requestAnimationFrame(frame);
  })();
})();

/* ── MOBILE NAV ── */
document.getElementById('hamBtn')?.addEventListener('click', () => {
  document.getElementById('mob')?.classList.toggle('open');
});

/* ── SCROLL ANIMATIONS ── */
const aiEls = document.querySelectorAll('.ai');
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
}, { threshold: 0.1 });
aiEls.forEach(el => obs.observe(el));

/* ── AUTH NAV ── */
(async function initAuth(){
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return;
    const { data: profile } = await sb.from('profiles').select('full_name,username,role').eq('id', session.user.id).single();
    const name = profile?.full_name || profile?.username || 'مستخدم';
    const isAdmin = profile?.role === 'admin';
    const area = document.getElementById('nav-auth-area');
    if (!area) return;
    area.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <div style="
          width:32px;height:32px;border-radius:50%;
          background:linear-gradient(135deg,#D4A843,#2A8A7E);
          display:flex;align-items:center;justify-content:center;
          font-weight:800;font-size:13px;color:#0D1117;
        ">${name.charAt(0).toUpperCase()}</div>
        <span style="font-size:13px;font-weight:700;color:rgba(232,224,208,.8)">${name}</span>
        ${isAdmin ? `<a href="/admin/dashboard.html" style="
          padding:5px 10px;background:rgba(212,168,67,.12);
          color:#D4A843;border-radius:20px;font-size:11px;
          font-weight:800;text-decoration:none;
          border:1px solid rgba(212,168,67,.22);
        ">لوحة الإدارة</a>` : ''}
        <button onclick="sb.auth.signOut().then(()=>location.reload())" style="
          background:none;border:none;color:rgba(232,224,208,.25);
          cursor:pointer;font-size:16px;padding:0 4px;transition:color .15s;
        " onmouseover="this.style.color='#c0705a'" onmouseout="this.style.color='rgba(232,224,208,.25)'">
          <i class='fa-solid fa-right-from-bracket'></i>
        </button>
      </div>`;
  } catch(e) {}
})();

/* ══════════════════════════════════════════
   FEATURED TEMPLATES — من Supabase
   ≤3 بدون paginate، >3 مع paginate
══════════════════════════════════════════ */
const FEAT_PER_PAGE = 3;
let _featItems = [];
let _featPage  = 1;

async function loadFeaturedTemplates() {
  const grid = document.getElementById('tpl-grid-dynamic');
  if (!grid) return;

  // loading skeletons
  grid.innerHTML = [1,2,3].map(() => `
    <div style="border-radius:16px;overflow:hidden;background:#1a2333;border:1px solid rgba(212,168,67,.1)">
      <div style="aspect-ratio:3/4;background:linear-gradient(90deg,#131920 25%,#1a2333 50%,#131920 75%);background-size:200% 100%;animation:shimmer 1.5s infinite"></div>
      <div style="padding:14px 16px;display:flex;gap:10px">
        <div style="flex:1;height:12px;border-radius:6px;background:linear-gradient(90deg,#131920 25%,#1a2333 50%,#131920 75%);background-size:200% 100%;animation:shimmer 1.5s infinite"></div>
        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(90deg,#131920 25%,#1a2333 50%,#131920 75%);background-size:200% 100%;animation:shimmer 1.5s infinite"></div>
      </div>
    </div>`).join('');

  try {
    // 1. جيب الـ featured
    const { data: featRows } = await sb
      .from('featured_templates')
      .select('item_id,item_type,sort_order')
      .order('sort_order', { ascending: true });

    if (!featRows?.length) {
      // مفيش featured — ارجع للـ static fallback
      _renderStaticFallback(grid);
      return;
    }

    // 2. جيب بيانات كل item
    const calIds = featRows.filter(r => r.item_type === 'calligraphy').map(r => r.item_id);
    const bgIds  = featRows.filter(r => r.item_type === 'background').map(r => r.item_id);

    const [calRes, bgRes] = await Promise.all([
      calIds.length ? sb.from('calligraphy').select('id,name,public_url,style,is_premium').in('id', calIds) : { data: [] },
      bgIds.length  ? sb.from('backgrounds').select('id,name,public_url,is_premium').in('id', bgIds)        : { data: [] }
    ]);

    const calMap = Object.fromEntries((calRes.data||[]).map(c => [c.id, {...c, itemType:'calligraphy'}]));
    const bgMap  = Object.fromEntries((bgRes.data||[]).map(b => [b.id, {...b, itemType:'background'}]));

    _featItems = featRows.map(r => {
      const item = r.item_type === 'calligraphy' ? calMap[r.item_id] : bgMap[r.item_id];
      return item || null;
    }).filter(Boolean);

    if (!_featItems.length) { _renderStaticFallback(grid); return; }

    // 3. عرض + pagination لو أكتر من 3
    _renderFeaturedGrid();

  } catch(e) {
    console.error('Featured load error:', e);
    _renderStaticFallback(grid);
  }
}

function _renderFeaturedGrid() {
  const grid  = document.getElementById('tpl-grid-dynamic');
  const pgWrap = document.getElementById('tpl-pagination');
  if (!grid) return;

  const total = _featItems.length;
  const totalPages = Math.ceil(total / FEAT_PER_PAGE);
  const start = (_featPage - 1) * FEAT_PER_PAGE;
  const page  = _featItems.slice(start, start + FEAT_PER_PAGE);

  // render cards
  grid.innerHTML = page.map((item, i) => {
    const isPrem = item.is_premium;
    const darkBg = item.style === 'white';
    return `
      <div class="tc ai" style="animation-delay:${i * .1}s;opacity:0;animation:fadeUp .5s ${i * .1}s forwards">
        <div class="tc-img" style="${darkBg ? 'background:#1a1a2e' : ''}">
          ${item.public_url
            ? `<img src="${item.public_url}" alt="${item.name}" loading="lazy"
                onerror="this.style.display='none'"/>`
            : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:rgba(232,224,208,.2)"><i class='fa-solid fa-image' style='font-size:2.5rem'></i></div>`}
          ${isPrem
            ? `<div class="tc-tag" style="background:linear-gradient(135deg,rgba(212,168,67,.92),rgba(180,130,20,.92));color:#0d1117">
                 <i class="fa-solid fa-crown" style="font-size:.65rem"></i> حصري
               </div>`
            : `<div class="tc-tag free">مجاني</div>`}
          <div class="tc-overlay">
            <a href="/editor.html" class="tc-overlay-btn">
              <i class="fa-solid fa-pen-nib"></i> ابدأ التصميم
            </a>
          </div>
        </div>
        <div class="tc-foot">
          <span class="tc-name">${item.name}</span>
          <a href="/editor.html" class="tc-action"><i class="fa-solid fa-pen-nib"></i></a>
        </div>
      </div>`;
  }).join('');

  // pagination — تظهر بس لو أكتر من 3
  if (!pgWrap) return;
  if (totalPages <= 1) { pgWrap.innerHTML = ''; return; }

  const dots = (arr) => arr.map(p =>
    p === '…'
      ? `<span style="color:rgba(232,224,208,.3);padding:0 4px">…</span>`
      : `<button onclick="_featGoPage(${p})" style="
          min-width:36px;height:36px;border-radius:8px;border:1px solid ${p === _featPage ? 'var(--gold)' : 'rgba(212,168,67,.18)'};
          background:${p === _featPage ? 'var(--gold)' : 'transparent'};
          color:${p === _featPage ? '#0d1117' : 'rgba(232,224,208,.6)'};
          font-family:'Cairo',sans-serif;font-size:.88rem;font-weight:700;
          cursor:pointer;transition:all .18s;padding:0 10px;
        ">${p}</button>`
  ).join('');

  const pages = [];
  if (totalPages <= 7) { for(let i=1;i<=totalPages;i++) pages.push(i); }
  else {
    pages.push(1);
    if (_featPage > 3) pages.push('…');
    for(let i=Math.max(2,_featPage-1);i<=Math.min(totalPages-1,_featPage+1);i++) pages.push(i);
    if (_featPage < totalPages-2) pages.push('…');
    pages.push(totalPages);
  }

  pgWrap.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:32px;flex-wrap:wrap">
      <button onclick="_featGoPage(${_featPage-1})" ${_featPage===1?'disabled':''} style="
        min-width:36px;height:36px;border-radius:8px;border:1px solid rgba(212,168,67,.18);
        background:transparent;color:rgba(232,224,208,.5);cursor:pointer;
        opacity:${_featPage===1?'.3':'1'};transition:all .18s;
      "><i class='fa-solid fa-chevron-right fa-xs'></i></button>
      ${dots(pages)}
      <button onclick="_featGoPage(${_featPage+1})" ${_featPage===totalPages?'disabled':''} style="
        min-width:36px;height:36px;border-radius:8px;border:1px solid rgba(212,168,67,.18);
        background:transparent;color:rgba(232,224,208,.5);cursor:pointer;
        opacity:${_featPage===totalPages?'.3':'1'};transition:all .18s;
      "><i class='fa-solid fa-chevron-left fa-xs'></i></button>
    </div>
    <p style="text-align:center;color:rgba(232,224,208,.3);font-size:.78rem;margin-top:10px">
      صفحة ${_featPage} من ${totalPages}
    </p>`;
}

function _featGoPage(p) {
  const total = _featItems.length;
  const totalPages = Math.ceil(total / FEAT_PER_PAGE);
  if (p < 1 || p > totalPages) return;
  _featPage = p;
  _renderFeaturedGrid();
  document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window._featGoPage = _featGoPage;

// Fallback لو مفيش featured في DB
function _renderStaticFallback(grid) {
  grid.innerHTML = `
    <div class="tc ai">
      <div class="tc-img">
        <img src="images/1.png" alt="تصميم ديواني" onerror="this.style.display='none'"/>
        <div class="tc-tag free">مجاني</div>
        <div class="tc-overlay"><a href="/editor.html" class="tc-overlay-btn">ابدأ التصميم</a></div>
      </div>
      <div class="tc-foot"><span class="tc-name">الخط الديواني الملكي</span><a href="/editor.html" class="tc-action"><i class="fa-solid fa-pen-nib"></i></a></div>
    </div>
    <div class="tc ai" style="transition-delay:.1s">
      <div class="tc-img">
        <img src="images/2.png" alt="بطاقة عيد" onerror="this.style.display='none'"/>
        <div class="tc-tag free">مجاني</div>
        <div class="tc-overlay"><a href="/editor.html" class="tc-overlay-btn">ابدأ التصميم</a></div>
      </div>
      <div class="tc-foot"><span class="tc-name">بطاقة العيد العصرية</span><a href="/editor.html" class="tc-action"><i class="fa-solid fa-pen-nib"></i></a></div>
    </div>
    <div class="tc ai" style="transition-delay:.2s">
      <div class="tc-img">
        <img src="images/11.png" alt="بطاقة زفاف" onerror="this.style.display='none'"/>
        <div class="tc-tag free">مجاني</div>
        <div class="tc-overlay"><a href="/editor.html" class="tc-overlay-btn">ابدأ التصميم</a></div>
      </div>
      <div class="tc-foot"><span class="tc-name">بطاقة الزفاف الفاخرة</span><a href="/editor.html" class="tc-action"><i class="fa-solid fa-pen-nib"></i></a></div>
    </div>`;
}

// shimmer keyframe
const _s = document.createElement('style');
_s.textContent = `
  @keyframes shimmer{to{background-position:-200% 0}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
`;
document.head.appendChild(_s);

// ── RUN ──
loadFeaturedTemplates();

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


(function() {
  'use strict';

  /* ── حالة الكاروسيل ── */
  const VISIBLE      = 3;   // كاردات ظاهرة
  const AUTOPLAY_MS  = 5000;
  let _items         = [];  // كل البيانات من Supabase
  let _curIdx        = 0;   // index أول كارد ظاهر
  let _autoTimer     = null;
  let _progTimer     = null;
  let _paused        = false;

  const track    = document.getElementById('tplTrack');
  const dotsWrap = document.getElementById('tplDots');
  const prevBtn  = document.getElementById('tplPrev');
  const nextBtn  = document.getElementById('tplNext');
  const progBar  = document.getElementById('tplProgressBar');
  const wrap     = document.getElementById('tplCarouselWrap');

  /* ── بناء كارد ── */
  function buildCard(t) {
    const isPrem = t.isPremium;
    const tagHtml = isPrem
      ? `<div class="tpl-c-tag premium"><i class="fa-solid fa-crown"></i> حصري</div>`
      : `<div class="tpl-c-tag free"><i class="fa-solid fa-gift"></i> مجاني</div>`;

    const div = document.createElement('div');
    div.className = 'tpl-c-card';
    div.onclick = () => window.location = '/editor.html';
    div.innerHTML = `
      <div class="tpl-c-img">
        ${t.img
          ? `<img src="${t.img}" alt="${t.name}" loading="lazy"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
             <div class="tpl-c-placeholder" style="display:none">
               <i class="fa-solid fa-image"></i><span>صورة القالب</span>
             </div>`
          : `<div class="tpl-c-placeholder">
               <i class="fa-solid fa-image"></i><span>صورة القالب</span>
             </div>`
        }
        ${tagHtml}
        <div class="tpl-c-overlay">
          <a href="/editor.html" class="tpl-c-ov-btn" onclick="event.stopPropagation()">
            <i class="fa-solid fa-pen-nib"></i> ابدأ التصميم
          </a>
        </div>
      </div>
      <div class="tpl-c-foot">
        <span class="tpl-c-name">${t.name}</span>
        <a href="/editor.html" class="tpl-c-btn" onclick="event.stopPropagation()">
          <i class="fa-solid fa-arrow-left"></i>
        </a>
      </div>`;
    return div;
  }

  /* ── رسم الـ dots ── */
  function renderDots() {
    const pages = _items.length - VISIBLE + 1;
    dotsWrap.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('div');
      d.className = 'tpl-dot' + (i === _curIdx ? ' on' : '');
      d.onclick = () => goTo(i);
      dotsWrap.appendChild(d);
    }
  }

  /* ── تحريك الـ track ── */
  function goTo(idx, resetProgress = true) {
    const max = Math.max(0, _items.length - VISIBLE);
    _curIdx = Math.max(0, Math.min(idx, max));

    /* عرض كارد واحد = 100% ÷ VISIBLE */
    const cardW = track.parentElement.offsetWidth / VISIBLE;
    /* RTL: نحرك للأمام (positive) */
    track.style.transform = `translateX(${_curIdx * (cardW + 22)}px)`;

    renderDots();
    prevBtn.disabled = _curIdx === 0;
    nextBtn.disabled = _curIdx >= max;

    if (resetProgress) resetProg();
  }

  /* ── شريط التقدم ── */
  function resetProg() {
    progBar.classList.remove('running');
    progBar.style.transition = 'none';
    progBar.style.width = '0%';
    /* force reflow */
    void progBar.offsetWidth;
    progBar.style.transition = `width ${AUTOPLAY_MS}ms linear`;
    progBar.classList.add('running');
  }

  /* ── autoplay ── */
  function startAuto() {
    stopAuto();
    _autoTimer = setInterval(() => {
      if (_paused) return;
      const max = Math.max(0, _items.length - VISIBLE);
      goTo(_curIdx < max ? _curIdx + 1 : 0);
    }, AUTOPLAY_MS);
    resetProg();
  }

  function stopAuto() {
    clearInterval(_autoTimer);
    progBar.classList.remove('running');
  }

  /* pause on hover */
  wrap.addEventListener('mouseenter', () => { _paused = true; progBar.style.animationPlayState = 'paused'; });
  wrap.addEventListener('mouseleave', () => { _paused = false; progBar.style.animationPlayState = 'running'; });

  /* أزرار */
  prevBtn.addEventListener('click', () => goTo(_curIdx - 1));
  nextBtn.addEventListener('click', () => goTo(_curIdx + 1));

  /* swipe على الموبايل */
  let _tx = 0;
  wrap.addEventListener('touchstart', e => { _tx = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener('touchend',   e => {
    const diff = _tx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? _curIdx + 1 : _curIdx - 1);
  });

  /* ── جلب البيانات ── */
  async function loadCarousel() {
    try {
      const [calRes, bgRes] = await Promise.all([
        sb.from('calligraphy')
          .select('id,name,public_url,is_premium,sort_order,created_at')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('created_at',  { ascending: false }),
        sb.from('backgrounds')
          .select('id,name,public_url,is_premium,sort_order,created_at')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('created_at',  { ascending: false }),
      ]);

      _items = [
        ...(calRes.data || []).map(c => ({ id: 'cal_'+c.id, name: c.name, img: c.public_url, isPremium: !!c.is_premium, type: 'calligraphy' })),
        ...(bgRes.data  || []).map(b => ({ id: 'bg_'+b.id,  name: b.name, img: b.public_url, isPremium: !!b.is_premium, type: 'background'  })),
      ];

      if (!_items.length) { track.innerHTML = '<p style="color:var(--muted);padding:40px">لا توجد قوالب حالياً</p>'; return; }

      /* بناء الكاردات */
      track.innerHTML = '';
      _items.forEach(t => track.appendChild(buildCard(t)));

      goTo(0, false);
      startAuto();
    } catch (e) {
      console.error(e);
      track.innerHTML = '<p style="color:var(--muted);padding:40px">تعذّر تحميل القوالب</p>';
    }
  }

  /* ابدأ بعد تحميل Supabase */
  if (typeof sb !== 'undefined') {
    loadCarousel();
  } else {
    /* انتظر حتى يتحمل supabase-config.js */
    document.addEventListener('DOMContentLoaded', () => {
      const wait = setInterval(() => {
        if (typeof sb !== 'undefined') { clearInterval(wait); loadCarousel(); }
      }, 80);
    });
  }

  /* resize: إعادة حساب الـ transform */
  window.addEventListener('resize', () => goTo(_curIdx, false));
})();
