/* ── BG CANVAS (light dots) ── */
(function(){
  const cv = document.getElementById('ornaCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, dots = [];
  function resize(){ W = cv.width = innerWidth; H = cv.height = innerHeight; }
  resize(); window.addEventListener('resize', resize);
  for (let i = 0; i < 55; i++) dots.push({
    x: Math.random() * 1400, y: Math.random() * 1000,
    vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18,
    r: Math.random() * 1.8 + .3, a: Math.random() * .4 + .1
  });
  (function frame(){
    ctx.clearRect(0, 0, W, H);
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74,116,164,${d.a * .2})`; ctx.fill();
    });
    requestAnimationFrame(frame);
  })();
})();

/* ── MOBILE NAV ── */
document.getElementById('hamBtn')?.addEventListener('click', () => {
  document.getElementById('mob')?.classList.toggle('open');
});

/* ── SCROLL ANIMATIONS ── */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.ai').forEach(el => obs.observe(el));

/* ── AUTH NAV ── */
(async function initAuth(){
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return;
    const { data: profile } = await sb.from('profiles').select('full_name,username,role').eq('id', session.user.id).single();
    const name    = profile?.full_name || profile?.username || 'حسابي';
    const isAdmin = profile?.role === 'admin';
    const area    = document.getElementById('nav-auth-area');
    if (!area) return;

    area.innerHTML = `
      <div style="position:relative" id="ubox">
        <button onclick="
          var m=document.getElementById('umenu');
          var c=document.getElementById('uchev');
          var o=m.style.display==='block';
          m.style.display=o?'none':'block';
          c.style.transform=o?'rotate(0)':'rotate(180deg)';"
          style="display:flex;align-items:center;gap:8px;padding:6px 12px 6px 8px;
            background:rgba(74,116,164,.08);border:1.5px solid rgba(74,116,164,.2);
            border-radius:22px;cursor:pointer;color:var(--text);
            font-family:var(--font-main);font-size:13px;font-weight:700;"
          onmouseover="this.style.background='rgba(74,116,164,.14)'"
          onmouseout="this.style.background='rgba(74,116,164,.08)'">
          <span style="max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</span>
          <i id="uchev" class="fa-solid fa-chevron-down" style="font-size:10px;opacity:.5;transition:transform .2s"></i>
        </button>
        <div id="umenu" style="display:none;position:absolute;top:calc(100% + 10px);left:0;
          min-width:210px;background:#fff;border:1.5px solid rgba(74,116,164,.15);
          border-radius:14px;padding:6px;box-shadow:0 16px 48px rgba(34,49,71,.12);
          z-index:9999;font-family:var(--font-main);">
          <div style="height:1px;background:rgba(74,116,164,.1);margin:0 6px 6px"></div>
          ${isAdmin ? `
          <a href="../admin/dashboard.html" style="display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:8px;
            color:var(--text-sec);font-size:13px;font-weight:700;text-decoration:none;"
            onmouseover="this.style.background='rgba(74,116,164,.07)';this.style.color='var(--text)'"
            onmouseout="this.style.background='transparent';this.style.color='var(--text-sec)'">
            <i class="fa-solid fa-gauge" style="width:16px;text-align:center;color:#4a74a4"></i> لوحة الإدارة
          </a>` : ''}
          <a href="../editor.html" style="display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:8px;
            color:var(--text-sec);font-size:13px;font-weight:700;text-decoration:none;"
            onmouseover="this.style.background='rgba(74,116,164,.07)';this.style.color='var(--text)'"
            onmouseout="this.style.background='transparent';this.style.color='var(--text-sec)'">
            <i class="fa-solid fa-pen-nib" style="width:16px;text-align:center;color:#4a74a4"></i> محرر البطاقات
          </a>
          <div style="height:1px;background:rgba(74,116,164,.1);margin:6px"></div>
          <button onclick="localStorage.removeItem('_sallim_guest');localStorage.removeItem('_sallim_fp');sb.auth.signOut().then(()=>window.location.href='/index.html');"
            style="display:flex;align-items:center;gap:9px;width:100%;padding:9px 12px;border-radius:8px;
            border:none;background:none;color:#c0705a;font-family:var(--font-main);
            font-size:13px;font-weight:700;cursor:pointer;text-align:right;"
            onmouseover="this.style.background='rgba(192,112,90,.07)'"
            onmouseout="this.style.background='transparent'">
            <i class="fa-solid fa-right-from-bracket" style="width:16px;text-align:center;color:#c0705a"></i> تسجيل الخروج
          </button>
        </div>
      </div>`;

    document.addEventListener('click', e => {
      const box  = document.getElementById('ubox');
      const menu = document.getElementById('umenu');
      const chev = document.getElementById('uchev');
      if (box && !box.contains(e.target) && menu) {
        menu.style.display = 'none';
        if (chev) chev.style.transform = 'rotate(0)';
      }
    });
  } catch(e) {}
})();

/* ══════════════════════════════════════════
   CAROUSEL ENGINE
   الكود الصح — GAP و step معرّفين صح
══════════════════════════════════════════ */
(function(){
  'use strict';

  const VISIBLE     = 3;
  const AUTOPLAY_MS = 5000;
  const GAP         = 22;   /* ← متغير ثابت داخل الـ IIFE */

  let _items   = [];
  let _curIdx  = 0;
  let _autoTimer = null;
  let _paused  = false;

  const track    = document.getElementById('tplTrack');
  const dotsWrap = document.getElementById('tplDots');
  const prevBtn  = document.getElementById('tplPrev');
  const nextBtn  = document.getElementById('tplNext');
  const progBar  = document.getElementById('tplProgressBar');
  const wrap     = document.getElementById('tplCarouselWrap');

  if (!track || !wrap) return;

  /* ── حساب خطوة الحركة = عرض كارد + gap ── */
  function getStep() {
    const c = track.querySelector('.tpl-c-card');
    if (!c) return 0;
    return c.getBoundingClientRect().width + GAP;
  }

  /* ── بناء كارد ── */
  function buildCard(t) {
    const isPrem  = t.isPremium;
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
             </div>`}
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
    const pages = Math.max(1, _items.length - VISIBLE + 1);
    dotsWrap.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('div');
      d.className = 'tpl-dot' + (i === _curIdx ? ' on' : '');
      d.onclick = () => goTo(i);
      dotsWrap.appendChild(d);
    }
  }

  /* ── تحريك الـ track — بعرض كارد كامل بالظبط ── */
  function goTo(idx, resetProgress = true) {
    const max = Math.max(0, _items.length - VISIBLE);
    _curIdx = Math.max(0, Math.min(idx, max));

    const step = getStep(); /* ← const محلي صح */
    track.style.transform = `translateX(${_curIdx * step}px)`;

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
    void progBar.offsetWidth;
    progBar.style.transition = `width ${AUTOPLAY_MS}ms linear`;
    progBar.classList.add('running');
  }

  /* ── autoplay ── */
  function startAuto() {
    clearInterval(_autoTimer);
    _autoTimer = setInterval(() => {
      if (_paused) return;
      const max = Math.max(0, _items.length - VISIBLE);
      goTo(_curIdx < max ? _curIdx + 1 : 0);
    }, AUTOPLAY_MS);
    resetProg();
  }

  /* ── events ── */
  wrap.addEventListener('mouseenter', () => { _paused = true; });
  wrap.addEventListener('mouseleave', () => { _paused = false; });
  prevBtn.addEventListener('click', () => goTo(_curIdx - 1));
  nextBtn.addEventListener('click', () => goTo(_curIdx + 1));

  let _tx = 0;
  wrap.addEventListener('touchstart', e => { _tx = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener('touchend',   e => {
    const diff = _tx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? _curIdx + 1 : _curIdx - 1);
  });

  /* resize */
  window.addEventListener('resize', () => requestAnimationFrame(() => goTo(_curIdx, false)));

  /* ── جلب البيانات من Supabase ── */
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
        ...(calRes.data || []).map(c => ({ id:'cal_'+c.id, name:c.name, img:c.public_url, isPremium:!!c.is_premium })),
        ...(bgRes.data  || []).map(b => ({ id:'bg_'+b.id,  name:b.name, img:b.public_url, isPremium:!!b.is_premium })),
      ];

      if (!_items.length) {
        track.innerHTML = '<p style="color:var(--muted);padding:40px">لا توجد قوالب حالياً</p>';
        return;
      }

      track.innerHTML = '';
      _items.forEach(t => track.appendChild(buildCard(t)));

      /* انتظر frame عشان الـ DOM يتحسب صح قبل حساب الـ step */
      requestAnimationFrame(() => {
        goTo(0, false);
        startAuto();
      });

    } catch (e) {
      console.error(e);
      track.innerHTML = '<p style="color:var(--muted);padding:40px">تعذّر تحميل القوالب</p>';
    }
  }

  if (typeof sb !== 'undefined') {
    loadCarousel();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      const wait = setInterval(() => {
        if (typeof sb !== 'undefined') { clearInterval(wait); loadCarousel(); }
      }, 80);
    });
  }

})();

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