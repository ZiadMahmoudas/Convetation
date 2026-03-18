/* ── BG CANVAS (light dots) ── */
(function () {
  const cv = document.getElementById("ornaCanvas");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  let W,
    H,
    dots = [];
  function resize() {
    W = cv.width = innerWidth;
    H = cv.height = innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);
  for (let i = 0; i < 55; i++)
    dots.push({
      x: Math.random() * 1400,
      y: Math.random() * 1000,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.8 + 0.3,
      a: Math.random() * 0.4 + 0.1,
    });
  (function frame() {
    ctx.clearRect(0, 0, W, H);
    dots.forEach((d) => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74,116,164,${d.a * 0.2})`;
      ctx.fill();
    });
    requestAnimationFrame(frame);
  })();
})();

/* ── MOBILE NAV ── */
document.getElementById("hamBtn")?.addEventListener("click", () => {
  document.getElementById("mob")?.classList.toggle("open");
});

/* ── SCROLL ANIMATIONS ── */
const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("vis");
        obs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 },
);
document.querySelectorAll(".ai").forEach((el) => obs.observe(el));

/* ── AUTH NAV ── */
(async function initAuth() {
  try {
    const {
      data: { session },
    } = await sb.auth.getSession();
    if (!session) return;
    const { data: profile } = await sb
      .from("profiles")
      .select("full_name,username,role")
      .eq("id", session.user.id)
      .single();
    const name = profile?.full_name || profile?.username || "حسابي";
    const isAdmin = profile?.role === "admin";
    const area = document.getElementById("nav-auth-area");
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
          ${
            isAdmin
              ? `
          <a href="../admin/dashboard.html" style="display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:8px;
            color:var(--text-sec);font-size:13px;font-weight:700;text-decoration:none;"
            onmouseover="this.style.background='rgba(74,116,164,.07)';this.style.color='var(--text)'"
            onmouseout="this.style.background='transparent';this.style.color='var(--text-sec)'">
            <i class="fa-solid fa-gauge" style="width:16px;text-align:center;color:#4a74a4"></i> لوحة الإدارة
          </a>`
              : ""
          }
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

    document.addEventListener("click", (e) => {
      const box = document.getElementById("ubox");
      const menu = document.getElementById("umenu");
      const chev = document.getElementById("uchev");
      if (box && !box.contains(e.target) && menu) {
        menu.style.display = "none";
        if (chev) chev.style.transform = "rotate(0)";
      }
    });
  } catch (e) {}
})();

(function () {
  "use strict";

  const VISIBLE = 3;
  const AUTOPLAY_MS = 5000;
  const GAP = 22; /* ← متغير ثابت داخل الـ IIFE */

  let _items = [];
  let _curIdx = 0;
  let _autoTimer = null;
  let _paused = false;

  const track = document.getElementById("tplTrack");
  const dotsWrap = document.getElementById("tplDots");
  const prevBtn = document.getElementById("tplPrev");
  const nextBtn = document.getElementById("tplNext");
  const progBar = document.getElementById("tplProgressBar");
  const wrap = document.getElementById("tplCarouselWrap");

  if (!track || !wrap) return;

  /* ── حساب خطوة الحركة = عرض كارد + gap ── */
  function getStep() {
    const c = track.querySelector(".tpl-c-card");
    if (!c) return 0;
    return c.getBoundingClientRect().width + GAP;
  }

  /* ── بناء كارد ── */
  function buildCard(t) {
    const isPrem = t.isPremium;
    const tagHtml = isPrem
      ? `<div class="tpl-c-tag premium"><i class="fa-solid fa-crown"></i> حصري</div>`
      : `<div class="tpl-c-tag free"><i class="fa-solid fa-gift"></i> مجاني</div>`;

    const div = document.createElement("div");
    div.className = "tpl-c-card";
    div.onclick = () => (window.location = "/editor.html");
    div.innerHTML = `
      <div class="tpl-c-img">
        ${
          t.img
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
    const pages = Math.max(1, _items.length - VISIBLE + 1);
    dotsWrap.innerHTML = "";
    for (let i = 0; i < pages; i++) {
      const d = document.createElement("div");
      d.className = "tpl-dot" + (i === _curIdx ? " on" : "");
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
    progBar.classList.remove("running");
    progBar.style.transition = "none";
    progBar.style.width = "0%";
    void progBar.offsetWidth;
    progBar.style.transition = `width ${AUTOPLAY_MS}ms linear`;
    progBar.classList.add("running");
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
  wrap.addEventListener("mouseenter", () => {
    _paused = true;
  });
  wrap.addEventListener("mouseleave", () => {
    _paused = false;
  });
  prevBtn.addEventListener("click", () => goTo(_curIdx - 1));
  nextBtn.addEventListener("click", () => goTo(_curIdx + 1));

  let _tx = 0;
  wrap.addEventListener(
    "touchstart",
    (e) => {
      _tx = e.touches[0].clientX;
    },
    { passive: true },
  );
  wrap.addEventListener("touchend", (e) => {
    const diff = _tx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? _curIdx + 1 : _curIdx - 1);
  });

  /* resize */
  window.addEventListener("resize", () =>
    requestAnimationFrame(() => goTo(_curIdx, false)),
  );

  /* ── جلب البيانات من Supabase ── */
  async function loadCarousel() {
    try {
      const [calRes, bgRes] = await Promise.all([
        sb
          .from("calligraphy")
          .select("id,name,public_url,is_premium,sort_order,created_at")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),
        sb
          .from("backgrounds")
          .select("id,name,public_url,is_premium,sort_order,created_at")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),
      ]);

      _items = [
        ...(calRes.data || []).map((c) => ({
          id: "cal_" + c.id,
          name: c.name,
          img: c.public_url,
          isPremium: !!c.is_premium,
        })),
        ...(bgRes.data || []).map((b) => ({
          id: "bg_" + b.id,
          name: b.name,
          img: b.public_url,
          isPremium: !!b.is_premium,
        })),
      ];

      if (!_items.length) {
        track.innerHTML =
          '<p style="color:var(--muted);padding:40px">لا توجد قوالب حالياً</p>';
        return;
      }

      track.innerHTML = "";
      _items.forEach((t) => track.appendChild(buildCard(t)));

      /* انتظر frame عشان الـ DOM يتحسب صح قبل حساب الـ step */
      requestAnimationFrame(() => {
        goTo(0, false);
        startAuto();
      });
    } catch (e) {
      console.error(e);
      track.innerHTML =
        '<p style="color:var(--muted);padding:40px">تعذّر تحميل القوالب</p>';
    }
  }

  if (typeof sb !== "undefined") {
    loadCarousel();
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      const wait = setInterval(() => {
        if (typeof sb !== "undefined") {
          clearInterval(wait);
          loadCarousel();
        }
      }, 80);
    });
  }
})();

(function () {
  "use strict";
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "F12" || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    if (
      e.ctrlKey &&
      e.shiftKey &&
      (e.key === "I" || e.key === "J" || e.key === "C")
    ) {
      e.preventDefault();
      return false;
    }

    if (e.ctrlKey && (e.key === "u" || e.keyCode === 85)) {
      e.preventDefault();
      return false;
    }
  });

  const devToolsCheck = function () {
    if (window.console && window.console.time) {
      (function () {
        (function () {
          debugger;
        }).apply(this, ["alwaysOn"]);
      })();
    }
  };

  setInterval(devToolsCheck, 1000);

  document.addEventListener("copy", function (e) {
    e.preventDefault();
  });
})();

/* ── Mobile nav ── */
document.getElementById("hamBtn").addEventListener("click", () => {
  document.getElementById("mob").classList.toggle("show");
});

/* ── Animate-in on scroll ── */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("vis");
    });
  },
  { threshold: 0.12 },
);
document.querySelectorAll(".ai").forEach((el) => observer.observe(el));

/* ── Canvas BG (light dots) ── */
(function () {
  const cv = document.getElementById("ornaCanvas");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  let W,
    H,
    dots = [];
  function resize() {
    W = cv.width = innerWidth;
    H = cv.height = innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  for (let i = 0; i < 55; i++) {
    dots.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.8 + 0.3,
      a: Math.random() * 0.4 + 0.1,
    });
  }

  (function frame() {
    ctx.clearRect(0, 0, W, H);
    dots.forEach((d) => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74, 116, 164, ${d.a})`;
      ctx.fill();
    });
    requestAnimationFrame(frame);
  })();
})();

/* ── Auth System ── */
(async function initAuth() {
  try {
    const {
      data: { session },
    } = await sb.auth.getSession();
    if (!session) return;
    const { data: profile } = await sb
      .from("profiles")
      .select("full_name,username,role")
      .eq("id", session.user.id)
      .single();
    const name = profile?.full_name || profile?.username || "مستخدم";
    const isAdmin = profile?.role === "admin";
    const area = document.getElementById("nav-auth-area");
    if (!area) return;

    area.innerHTML = `
      <div style="position:relative" id="ubox">
        <button onclick="var m=document.getElementById('umenu');var c=document.getElementById('uchev');var o=m.style.display==='block';m.style.display=o?'none':'block';c.style.transform=o?'rotate(0)':'rotate(180deg)';"
          style="display:flex;align-items:center;gap:8px;padding:6px 12px 6px 8px;background:rgba(74,116,164,.08);border:1.5px solid rgba(74,116,164,.2);border-radius:22px;cursor:pointer;color:var(--text);font-family:var(--font-main);font-size:13px;font-weight:700;"
          onmouseover="this.style.background='rgba(74,116,164,.14)'" onmouseout="this.style.background='rgba(74,116,164,.08)'">
          <span style="max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</span>
          <i id="uchev" class="fa-solid fa-chevron-down" style="font-size:10px;opacity:.5;transition:transform .2s"></i>
        </button>
        <div id="umenu" style="display:none;position:absolute;top:calc(100% + 10px);left:0;min-width:210px;background:#fff;border:1.5px solid rgba(74,116,164,.15);border-radius:14px;padding:6px;box-shadow:0 16px 48px rgba(34,49,71,.12);z-index:9999;font-family:var(--font-main);">
          <div style="height:1px;background:rgba(74,116,164,.1);margin:0 6px 6px"></div>
          ${
            isAdmin
              ? `<a href="./admin/dashboard.html" style="display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:8px;color:var(--text-sec);font-size:13px;font-weight:700;text-decoration:none;"
            onmouseover="this.style.background='rgba(74,116,164,.07)';this.style.color='var(--text)'" onmouseout="this.style.background='transparent';this.style.color='var(--text-sec)'">
            <i class="fa-solid fa-gauge" style="width:16px;text-align:center;color:#4a74a4"></i> لوحة الإدارة</a>`
              : ""
          }
          <a href="/editor.html" style="display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:8px;color:var(--text-sec);font-size:13px;font-weight:700;text-decoration:none;"
            onmouseover="this.style.background='rgba(74,116,164,.07)';this.style.color='var(--text)'" onmouseout="this.style.background='transparent';this.style.color='var(--text-sec)'">
            <i class="fa-solid fa-pen-nib" style="width:16px;text-align:center;color:#4a74a4"></i> محرر البطاقات</a>
          <div style="height:1px;background:rgba(74,116,164,.1);margin:6px"></div>
          <button onclick="localStorage.removeItem('_sallim_guest');localStorage.removeItem('_sallim_fp');sb.auth.signOut().then(()=>window.location.href='/index.html');"
            style="display:flex;align-items:center;gap:9px;width:100%;padding:9px 12px;border-radius:8px;border:none;background:none;color:#c0705a;font-family:var(--font-main);font-size:13px;font-weight:700;cursor:pointer;text-align:right;"
            onmouseover="this.style.background='rgba(192,112,90,.07)'" onmouseout="this.style.background='transparent'">
            <i class="fa-solid fa-right-from-bracket" style="width:16px;text-align:center;color:#c0705a"></i> تسجيل الخروج</button>
        </div>
      </div>`;

    document.addEventListener("click", (e) => {
      const box = document.getElementById("ubox"),
        menu = document.getElementById("umenu"),
        chev = document.getElementById("uchev");
      if (box && !box.contains(e.target) && menu) {
        menu.style.display = "none";
        if (chev) chev.style.transform = "rotate(0)";
      }
    });
  } catch (e) {
    console.warn(e);
  }
})();

/* ══════════════════════════════════════════
   FEATURED TEMPLATES — MARQUEE SYSTEM
══════════════════════════════════════════ */
let _featItems = [];

async function loadFeaturedTemplates() {
  const grid = document.getElementById("tpl-grid-dynamic");
  if (!grid) return;

  try {
    const { data: featRows } = await sb
      .from("featured_templates")
      .select("item_id,item_type,sort_order")
      .order("sort_order", { ascending: true });
    if (!featRows?.length) return;

    const calIds = featRows
      .filter((r) => r.item_type === "calligraphy")
      .map((r) => r.item_id);
    const bgIds = featRows
      .filter((r) => r.item_type === "background")
      .map((r) => r.item_id);

    // 🌟 سحب السعر واللينك من الداتابيز
    const [calRes, bgRes] = await Promise.all([
      calIds.length
        ? sb
            .from("calligraphy")
            .select("id,name,public_url,style,is_premium,price,promo_link")
            .in("id", calIds)
        : { data: [] },
      bgIds.length
        ? sb
            .from("backgrounds")
            .select("id,name,public_url,is_premium,price,promo_link")
            .in("id", bgIds)
        : { data: [] },
    ]);

    const calMap = Object.fromEntries(
      (calRes.data || []).map((c) => [c.id, { ...c, itemType: "calligraphy" }]),
    );
    const bgMap = Object.fromEntries(
      (bgRes.data || []).map((b) => [b.id, { ...b, itemType: "background" }]),
    );

    _featItems = featRows
      .map((r) => {
        const item =
          r.item_type === "calligraphy" ? calMap[r.item_id] : bgMap[r.item_id];
        return item || null;
      })
      .filter(Boolean);

    if (_featItems.length) _renderFeaturedGrid();
  } catch (e) {
    console.error("Featured load error:", e);
  }
}
function _renderFeaturedGrid() {
  const grid = document.getElementById("tpl-grid-dynamic");
  if (!grid || !_featItems.length) return;

  const itemsHtml = _featItems
    .map((item) => {
      const isPrem = item.is_premium;
      const darkBg = item.style === "white";
      const priceVal = item.price ? parseFloat(item.price) : 0;
      const priceText = priceVal > 0 ? ` | ${priceVal} ر.س` : "";

      let overlayBtns = `
      <a href="/Templates.html" class="tc-overlay-btn"
         style="background:#D4A843;color:#0D1117;padding:10px 20px;border-radius:8px;
                text-decoration:none;font-weight:800;font-family:'Tajawal',sans-serif;
                width:85%;text-align:center;">
        <i class="fa-solid fa-pen-nib"></i> ابدأ التصميم
      </a>`;

      if (isPrem && item.promo_link) {
        overlayBtns += `
      <a href="${item.promo_link}" target="_blank"
         style="background:transparent;border:1.5px solid #D4A843;color:#D4A843;
                padding:8px 20px;border-radius:8px;text-decoration:none;font-weight:700;
                font-family:'Tajawal',sans-serif;width:85%;text-align:center;
                font-size:12px;margin-top:5px;">
        <i class="fa-solid fa-cart-shopping"></i> شراء الكوبون
      </a>`;
      }

      return `
      <div class="swiper-slide" style="width:240px;">
        <div class="tc" style="border-radius:16px;background:var(--color-primary);
                               border:1px solid var(--border);">
          <div class="tc-img" style="position:relative;aspect-ratio:3/4;${darkBg ? "background:#1a1a2e" : ""}">
            ${
              item.public_url
                ? `<img src="${item.public_url}" alt="${item.name}" loading="lazy"
                      style="width:100%;height:100%;object-fit:cover;display:block;"
                      onerror="this.style.display='none'"/>`
                : `<div style="width:100%;height:100%;display:flex;align-items:center;
                             justify-content:center;color:rgba(232,224,208,.2)">
                   <i class="fa-solid fa-image" style="font-size:2.5rem"></i>
                 </div>`
            }
            ${
              isPrem
                ? `<div class="tc-tag" style="position:absolute;top:12px;right:12px;
                    background:linear-gradient(135deg,#D4A843,#B8860B);color:#0d1117;
                    padding:4px 10px;border-radius:20px;font-size:11px;font-weight:900;">
                   <i class="fa-solid fa-crown" style="font-size:.65rem"></i> حصري${priceText}
                 </div>`
                : `<div class="tc-tag free" style="position:absolute;top:12px;right:12px;
                    background:rgba(42,138,126,.9);color:#fff;padding:4px 10px;
                    border-radius:20px;font-size:11px;font-weight:800;">مجاني</div>`
            }
            <div class="tc-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.75);
                                           display:flex;flex-direction:column;align-items:center;
                                           justify-content:center;opacity:0;transition:opacity 0.3s;
                                           z-index:10;">
              ${overlayBtns}
            </div>
          </div>
          <div class="tc-foot" style="padding:14px;display:flex;justify-content:space-between;
                                      align-items:center;border-top:1px solid var(--border);
                                      background:var(--color-primary-dark);">
            <span class="tc-name" style="font-size:13px;font-weight:bold;color:var(--dark-text-sec);
                                         white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                                         max-width:80%;">${item.name}</span>
            <a href="/editor.html" class="tc-action" style="color:#D4A843;">
              <i class="fa-solid fa-arrow-left"></i>
            </a>
          </div>
        </div>
      </div>`;
    })
    .join("");

  grid.style.display = "block";
  grid.innerHTML = `
    <div class="swiper feat-swiper" style="padding:10px 0 20px;">
      <div class="swiper-wrapper">${itemsHtml}</div>
    </div>`;

  new Swiper(".feat-swiper", {
    slidesPerView: "auto",
    spaceBetween: 20,
    loop: true,
    loopedSlides: _featItems.length,
    centeredSlides: false,
    grabCursor: true,
    freeMode: {
      enabled: true,
      momentum: true,
    },
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    speed: 4000,
    pagination: false,
    navigation: false,
    scrollbar: false,
  });
}
// ── Run ──
loadFeaturedTemplates();
async function loadCategoriesHome() {
  const grid = document.getElementById("cats-grid-home");
  if (!grid) return;

  try {
    const { data: cats, error } = await sb
      .from("categories")
      .select("id,name,name_en,icon,color,sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !cats?.length) {
      grid.style.display = "none";
      return;
    }

    const { data: calCounts } = await sb
      .from("calligraphy")
      .select("category_id")
      .eq("is_active", true);

    const countMap = {};
    (calCounts || []).forEach((c) => {
      if (c.category_id)
        countMap[c.category_id] = (countMap[c.category_id] || 0) + 1;
    });

    grid.innerHTML = cats
      .map((cat, i) => {
        const color = cat.color || "#4a74a4";
        const bgColor = color + "20"; // 12% opacity
        const count = countMap[cat.id] || 0;
        const countTxt = count > 0 ? `${count} قالب` : "";

        return `
        <a class="cat-pill ai"
           style="transition-delay:${i * 0.06}s"
           href="/editor.html">
          <div class="cat-pill-icon" style="background:${bgColor}">
            ${cat.icon || "📁"}
          </div>
          <div class="cat-pill-name">${cat.name}</div>
          ${countTxt ? `<div class="cat-pill-count">${countTxt}</div>` : ""}
        </a>`;
      })
      .join("");

    grid.querySelectorAll(".ai").forEach((el) => observer.observe(el));
  } catch (e) {
    console.error("Categories home error:", e);
    grid.style.display = "none";
  }
}

/* ── Run ── */
loadCategoriesHome();
