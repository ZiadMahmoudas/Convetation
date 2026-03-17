let currentUser = null;
let isGuestMode = false;

// ── Floating Promo Button ──
function _showFloatingPromo(promoUrl) {
  let btn = document.getElementById("promo-cta-btn");
  if (
    !promoUrl ||
    promoUrl === "undefined" ||
    promoUrl === "null" ||
    promoUrl.trim() === ""
  ) {
    if (btn) btn.style.display = "none";
    return;
  }
  if (!btn) {
    btn = document.createElement("a");
    btn.id = "promo-cta-btn";
    btn.target = "_blank";
    btn.style.cssText = `
      position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:1000;
      background:linear-gradient(135deg,#D4A843,#ECC96A);
      color:#0D1117;font-family:'Tajawal',sans-serif;font-weight:800;font-size:14px;
      padding:10px 24px;border-radius:50px;text-decoration:none;
      box-shadow:0 8px 24px rgba(212,168,67,0.4);display:flex;align-items:center;gap:8px;
    `;
    btn.innerHTML = `<i class="fa-solid fa-gift"></i> احصل على الكوبون لهذا التصميم`;
    document.body.appendChild(btn);
  }
  btn.href = promoUrl;
  btn.style.display = "flex";
}

// ── Init ──
(async function init() {
  try {
    const session = await Auth.session();
    isGuestMode = !session;
    if (session) {
      currentUser = await Auth.me();
      _showAuthBadge(currentUser);
    } else {
      _showGuestBanner();
    }
    await _loadCalligraphy();
    await _loadBackgrounds();
  } catch (e) {
    console.warn("Auth init failed:", e.message);
    isGuestMode = true;
    _showGuestBanner();
    await _loadCalligraphy();
    await _loadBackgrounds();
  }
})();

// ── Auth Badge ──
function _showAuthBadge(user) {
  const name = user?.profile?.full_name || user?.profile?.username || "مستخدم";
  const isAdmin = user?.profile?.role === "admin";
  const el = document.createElement("div");
  el.id = "auth-badge";
  el.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:500;
    display:flex;align-items:center;gap:10px;
    background:#fff;border:1px solid rgba(74,116,164,.2);
    border-top:2px solid #4a74a4;border-radius:12px;
    padding:10px 16px;box-shadow:0 8px 32px rgba(34,49,71,.12);
    font-family:Tajawal,sans-serif;direction:rtl;
  `;
  el.innerHTML = `
    <div style="width:30px;height:30px;border-radius:50%;
      background:linear-gradient(135deg,#4a74a4,#2a7e6e);
      display:flex;align-items:center;justify-content:center;
      font-weight:800;font-size:13px;color:#fff;flex-shrink:0">
      ${name.charAt(0).toUpperCase()}
    </div>
    <div>
      <div style="font-size:13px;font-weight:700;color:#1a2637">${name}</div>
      <div style="font-size:10px;color:${isAdmin ? "#4a74a4" : "rgba(34,49,71,.4)"}">
        ${isAdmin ? "⭐ أدمن" : "مستخدم مسجل"}
      </div>
    </div>
    ${
      isAdmin
        ? `<a href="../admin/dashboard.html"
      style="padding:5px 10px;background:rgba(74,116,164,.1);color:#4a74a4;
        border-radius:7px;font-size:11px;font-weight:800;
        text-decoration:none;border:1px solid rgba(74,116,164,.25);white-space:nowrap">
      لوحة الإدارة
    </a>`
        : ""
    }
    <button onclick="Auth.logout()"
      style="background:none;border:none;cursor:pointer;
        color:rgba(34,49,71,.25);font-size:18px;padding:2px 0 2px 4px"
      onmouseover="this.style.color='#C0705A'"
      onmouseout="this.style.color='rgba(34,49,71,.25)'">
      <i class="fa-solid fa-right-from-bracket"></i>
    </button>
  `;
  document.body.appendChild(el);
}

// ── Guest Banner ──
function _showGuestBanner() {
  const used = Guest.usedCount(),
    rem = Guest.remaining();
  const el = document.createElement("div");
  el.id = "guest-banner";
  el.style.cssText = `
    position:fixed;bottom:0;left:0;right:0;z-index:500;
    background:#fff;border-top:2px solid #4a74a4;
    padding:10px 20px;display:flex;align-items:center;
    justify-content:space-between;gap:12px;
    font-family:Tajawal,sans-serif;direction:rtl;
    box-shadow:0 -4px 24px rgba(34,49,71,.1);
  `;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px">
      <div style="display:flex;gap:5px" id="guest-dots">${_dotsHTML(used)}</div>
      <span style="font-size:13px;color:rgba(34,49,71,.6);font-weight:600">
        وضع الضيف — <strong id="guest-remaining" style="color:#4a74a4">${rem}</strong> اختيار متبقي
      </span>
    </div>
    <a href="/login.html"
      style="padding:7px 18px;border-radius:8px;font-size:13px;font-weight:700;
        background:#4a74a4;color:#fff;text-decoration:none;white-space:nowrap">
      سجّل الدخول
    </a>
  `;
  document.body.appendChild(el);
}
function _dotsHTML(used) {
  return [1, 2]
    .map(
      (i) =>
        `<div style="width:10px;height:10px;border-radius:50%;
      background:${i <= used ? "#C0705A" : "rgba(74,116,164,.35)"};
      transition:background .3s"></div>`,
    )
    .join("");
}
function _updateGuestBanner() {
  const d = document.getElementById("guest-dots");
  const r = document.getElementById("guest-remaining");
  if (d) d.innerHTML = _dotsHTML(Guest.usedCount());
  if (r) r.textContent = Guest.remaining();
}

// ── Guest Gate ──
const _origAddCallig = window.addCallig;
window.addCallig = async function (src, name, imageId, promoUrl) {
  if (isGuestMode) {
    const ok = await Guest.recordUse(imageId || src, "calligraphy");
    if (!ok) {
      _showLimitModal();
      return;
    }
    _updateGuestBanner();
  }
  if (typeof _origAddCallig === "function") _origAddCallig(src, name, imageId);
  _showFloatingPromo(promoUrl);
};
const _origSetBg = window.setBg;
window.setBg = async function (el, src, imageId, promoUrl) {
  if (isGuestMode) {
    const ok = await Guest.recordUse(imageId || src, "background");
    if (!ok) {
      _showLimitModal();
      return;
    }
    _updateGuestBanner();
  }
  if (typeof _origSetBg === "function") _origSetBg(el, src, imageId);
  _showFloatingPromo(promoUrl);
};

// ── Limit Modal ──
function _showLimitModal() {
  let ov = document.getElementById("_guest-limit-modal");
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "_guest-limit-modal";
    ov.style.cssText = `
      position:fixed;inset:0;z-index:900;
      background:rgba(0,0,0,.6);backdrop-filter:blur(6px);
      display:flex;align-items:center;justify-content:center;
      padding:20px;font-family:Tajawal,sans-serif;direction:rtl;
    `;
    ov.innerHTML = `
      <div style="background:#fff;border:1px solid rgba(74,116,164,.2);
        border-top:3px solid #4a74a4;border-radius:20px;
        width:100%;max-width:400px;padding:32px;text-align:center;position:relative;">
        <button onclick="document.getElementById('_guest-limit-modal').style.display='none'"
          style="position:absolute;top:14px;left:14px;background:none;border:none;
            color:rgba(34,49,71,.25);cursor:pointer;font-size:18px">✕</button>
        <div style="font-size:44px;margin-bottom:14px">🔐</div>
        <h2 style="font-size:22px;color:#223147;margin-bottom:10px">انتهت الاختيارات المجانية</h2>
        <p style="color:rgba(34,49,71,.5);font-size:14px;line-height:1.7;margin-bottom:22px">
          استخدمت اختياراتك الـ 2 كضيف.<br>سجّل دخولك مجاناً للوصول الكامل!
        </p>
        <a href="/login.html" style="display:block;padding:12px;border-radius:10px;text-align:center;
          background:#4a74a4;color:#fff;font-size:14px;font-weight:800;text-decoration:none">
          سجّل الدخول مجاناً
        </a>
      </div>`;
    document.body.appendChild(ov);
  }
  ov.style.display = "flex";
}

/* ══════════════════════════════════════════════════════
   LOAD CALLIGRAPHY
   ★ الكل يظهر دايماً
   ★ is_premium + مش مفتوح → قفل + popup كوبون عند الضغط
   ★ is_premium + مفتوح (في sallim_unlocked) → يشتغل على طول
   ★ مجاني → يشتغل على طول
══════════════════════════════════════════════════════ */
async function _loadCalligraphy() {
  try {
    const [categories, items] = await Promise.all([
      DB.getCategories(),
      DB.getCalligraphy() /* كل المخطوطات بدون فلتر */,
    ]);
    if (!items.length) return;

    _renderCalligGrids(items);
    _buildCategoryTabs(categories, items);
  } catch (e) {
    console.warn("Cal load failed:", e.message);
  }
}

function _renderCalligGrids(items) {
  const unlocked = JSON.parse(localStorage.getItem("sallim_unlocked") || "[]");

  const byStyle = { black: [], white: [], "3d": [], colored: [] };
  items.forEach((c) => {
    const s = c.style || "black";
    if (byStyle[s]) byStyle[s].push(c);
  });

  ["black", "3d", "white"].forEach((style) => {
    const grid = document.getElementById("cg-" + style);
    if (!grid || !byStyle[style].length) return;
    const bgcls = style === "black" ? "lt" : "dk";

    grid.innerHTML = byStyle[style]
      .map((item) => _buildCalligItem(item, bgcls, unlocked))
      .join("");

    const sm = document.getElementById("sm-" + style);
    if (sm) sm.classList.remove("vis");
  });
}

function _buildCalligItem(item, bgcls, unlocked) {
  const src = item.public_url || item.storage_path;
  const safeSrc = src.replace(/'/g, "\\'");
  const safeName = (item.name || "").replace(/'/g, "\\'");
  const promoLink = (item.promo_link || "").replace(/'/g, "\\'");

  /* ★ القرار: مقفول لو is_premium ومش في القائمة */
  const isLocked = !!item.is_premium && !unlocked.includes(item.id);

  if (isLocked) {
    /* مقفول → popup كوبون */
    const clickFn =
      `_showCouponPopup('${item.id}','calligraphy','${promoLink}',` +
      `function(){window.addCallig('${safeSrc}','${safeName}','${item.id}','${promoLink}')})`;

    return `
      <div class="citem ${bgcls}" onclick="${clickFn}"
        data-src="${src}" data-name="${item.name}" data-id="${item.id}"
        data-locked="1" style="position:relative;cursor:pointer">
        <img src="${src}" alt="${item.name}" loading="lazy"
          style="filter:brightness(.45);pointer-events:none"
          onerror="this.style.display='none'"/>
        <div class="clabel">${item.name}</div>
        <!-- طبقة القفل -->
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
          justify-content:center;gap:4px;z-index:2;pointer-events:none">
          <i class="fa-solid fa-lock" style="color:#D4A843;font-size:16px;drop-shadow(0 0 4px rgba(0,0,0,.6))"></i>
        </div>
        <!-- بادج الكوبون -->
        <div style="position:absolute;top:4px;left:4px;z-index:3;
          background:linear-gradient(135deg,#D4A843,#c49830);color:#0d1117;
          font-size:8px;font-weight:900;padding:2px 5px;border-radius:3px;
          display:flex;align-items:center;gap:2px">
          <svg width="7" height="7" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2l2.4 5h5.1l-4.1 3.1 1.5 5.2L10 12.2l-4.9 3.1 1.5-5.2L2.5 7h5.1z"/>
          </svg> كوبون
        </div>
      </div>`;
  } else {
    /* مفتوح أو مجاني → يشتغل على طول */
    const clickFn = `window.addCallig('${safeSrc}','${safeName}','${item.id}','${promoLink}')`;
    return `
      <div class="citem ${bgcls}" onclick="${clickFn}"
        data-src="${src}" data-name="${item.name}" data-id="${item.id}"
        draggable="true" style="position:relative;cursor:pointer"
        ondragstart="_onCalDragStart(event,this)">
        <img src="${src}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'"/>
        <div class="clabel">${item.name}</div>
      </div>`;
  }
}

/* ══════════════════════════════════════════════════════
   LOAD BACKGROUNDS
   ★ نفس المنطق تماماً
══════════════════════════════════════════════════════ */
async function _loadBackgrounds() {
  try {
    const bgs = await DB.getBackgrounds(); /* كل الخلفيات */
    if (!bgs.length) return;

    _renderBgGrids(bgs);
  } catch (e) {
    console.warn("BG load failed:", e.message);
  }
}

function _renderBgGrids(bgs) {
  const unlocked = JSON.parse(localStorage.getItem("sallim_unlocked") || "[]");

  /* أول خلفية مفتوحة كـ default للكانفاس */
  const firstFree = bgs.find(
    (bg) => !bg.is_premium || unlocked.includes(bg.id),
  );
  if (firstFree) {
    const firstSrc = firstFree.public_url || firstFree.storage_path;
    setTimeout(() => {
      const cv = document.getElementById("canvas");
      if (
        cv &&
        (!cv.style.backgroundImage ||
          cv.style.backgroundImage === "none" ||
          cv.style.backgroundImage === "")
      ) {
        if (typeof applyBgImage === "function") applyBgImage(firstSrc, cv);
        else
          cv.style.setProperty(
            "background-image",
            `url('${firstSrc}')`,
            "important",
          );
      }
      ["ready-canvas", "batch-canvas"].forEach((id) => {
        const el = document.getElementById(id);
        if (
          el &&
          (!el.style.backgroundImage || el.style.backgroundImage === "none")
        ) {
          if (typeof applyBgImage === "function") applyBgImage(firstSrc, el);
          else
            el.style.setProperty(
              "background-image",
              `url('${firstSrc}')`,
              "important",
            );
        }
      });
    }, 600);
  }

  ["bggrid", "ready-bg-grid", "batch-bg-grid"].forEach((gridId) => {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    const viewType =
      gridId === "bggrid"
        ? "design"
        : gridId === "ready-bg-grid"
          ? "ready"
          : "batch";

    grid.innerHTML = bgs
      .map((bg, idx) => {
        const src = bg.public_url || bg.storage_path;
        const safeSrc = src.replace(/'/g, "\\'");
        const promoLink = (bg.promo_link || "").replace(/'/g, "\\'");
        const thumbId = `bg-thumb-${bg.id}-${gridId}`;
        const isLocked = !!bg.is_premium && !unlocked.includes(bg.id);

        if (isLocked) {
          /* مقفول — onClick يفتح popup الكوبون */
          let successFn;
          if (viewType === "design") {
            successFn = `function(){window.setBg(document.getElementById('${thumbId}'),'${safeSrc}','${bg.id}','${promoLink}')}`;
          } else {
            const altType = viewType === "ready" ? "ready" : "batch";
            successFn = `function(){setAltBg(document.getElementById('${thumbId}'),'${safeSrc}','${altType}','${promoLink}')}`;
          }
          const clickFn = `_showCouponPopup('${bg.id}','background','${promoLink}',${successFn})`;

          return `
          <div id="${thumbId}" class="bgthumb" onclick="${clickFn}"
            style="position:relative;cursor:pointer">
            <img src="${src}" loading="lazy" alt="${bg.name}"
              style="filter:brightness(.45)"
              onerror="this.parentElement.style.display='none'"/>
            <!-- قفل -->
            <div style="position:absolute;inset:0;display:flex;align-items:center;
              justify-content:center;z-index:2;pointer-events:none">
              <i class="fa-solid fa-lock" style="color:#D4A843;font-size:14px"></i>
            </div>
            <!-- بادج -->
            <div style="position:absolute;top:3px;right:3px;z-index:3;
              background:linear-gradient(135deg,#D4A843,#c49830);color:#0d1117;
              font-size:7px;font-weight:900;padding:2px 4px;border-radius:3px">★</div>
          </div>`;
        } else {
          /* مفتوح أو مجاني */
          let clickFn;
          if (viewType === "design") {
            clickFn = `window.setBg(this,'${safeSrc}','${bg.id}','${promoLink}')`;
          } else {
            const altType = viewType === "ready" ? "ready" : "batch";
            clickFn = `setAltBg(this,'${safeSrc}','${altType}','${promoLink}')`;
          }
          return `
          <div id="${thumbId}" class="bgthumb${idx === 0 ? " on" : ""}"
            onclick="${clickFn}" style="position:relative">
            <img src="${src}" loading="lazy" alt="${bg.name}"
              onerror="this.parentElement.style.display='none'"/>
          </div>`;
        }
      })
      .join("");
  });
}

/* ══ إعادة رسم الـ grids بعد فتح كوبون ══ */
async function _refreshAfterUnlock() {
  try {
    const [items, bgs] = await Promise.all([
      DB.getCalligraphy(),
      DB.getBackgrounds(),
    ]);
    _renderCalligGrids(items);
    _renderBgGrids(bgs);
  } catch (e) {}
}

// ── Category Tabs ──
function _buildCategoryTabs(categories, items) {
  const catTabsEl = document.querySelector(".cattabs");
  if (!catTabsEl || !categories.length) return;
  const counts = {};
  items.forEach((item) => {
    if (item.category_id)
      counts[item.category_id] = (counts[item.category_id] || 0) + 1;
  });
  const activeCats = categories.filter((c) => counts[c.id]);
  if (!activeCats.length) return;
  catTabsEl.insertAdjacentHTML(
    "beforeend",
    activeCats
      .map(
        (c) => `
      <button class="catbtn" data-cat-id="${c.id}"
        onclick="_filterByCategory('${c.id}',this)">
        ${c.icon || ""} ${c.name}
        <small style="opacity:.5;font-size:9px">${counts[c.id]}</small>
      </button>`,
      )
      .join(""),
  );
}

async function _filterByCategory(catId, btn) {
  document.querySelectorAll(".catbtn").forEach((b) => b.classList.remove("on"));
  btn.classList.add("on");
  ["black", "3d", "white"].forEach((c) => {
    const el = document.getElementById("cat-" + c);
    if (el) el.style.display = "none";
  });
  let con = document.getElementById("_cat-custom");
  if (!con) {
    con = document.createElement("div");
    con.id = "_cat-custom";
    const p = document.getElementById("panel-cal");
    if (p) p.appendChild(con);
  }
  con.style.display = "block";
  con.innerHTML = `<div style="text-align:center;padding:20px;color:rgba(34,49,71,.4);font-size:12px">
    جاري التحميل...</div>`;
  try {
    const items = await DB.getCalligraphy(catId);
    const unlocked = JSON.parse(
      localStorage.getItem("sallim_unlocked") || "[]",
    );
    if (!items.length) {
      con.innerHTML = `<div style="text-align:center;padding:20px;color:rgba(34,49,71,.3);font-size:12px">لا توجد مخطوطات</div>`;
      return;
    }
    con.innerHTML =
      `<div class="cgrid">` +
      items
        .map((item) => {
          const bgcls = item.style === "black" ? "lt" : "dk";
          return _buildCalligItem(item, bgcls, unlocked);
        })
        .join("") +
      `</div>`;
  } catch (e) {
    con.innerHTML = "";
  }
}
window._filterByCategory = _filterByCategory;

// ── Drag ──
let _dragEl = null;
function _onCalDragStart(e, itemEl) {
  e.dataTransfer.setData(
    "text/plain",
    JSON.stringify({
      src: itemEl.dataset.src,
      name: itemEl.dataset.name,
      type: "new-callig",
    }),
  );
  e.dataTransfer.effectAllowed = "copy";
}
(function patchDragOnCanvas() {
  const CV = document.getElementById("canvas");
  if (!CV) return;
  CV.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  });
  CV.addEventListener("drop", (e) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data.type === "new-callig") window.addCallig(data.src, data.name);
    } catch (err) {}
  });
})();

window._showLimitModal = _showLimitModal;

/* ══════════════════════════════════════════════════════
   COUPON POPUP
   ★ بعد النجاح: يضيف الـ id في sallim_unlocked
             + يشغّل الصورة فوراً
             + يعيد رسم الـ grids (تشيل القفل)
══════════════════════════════════════════════════════ */
(function injectStyles() {
  if (document.getElementById("_cp-kf")) return;
  const s = document.createElement("style");
  s.id = "_cp-kf";
  s.textContent = `
    @keyframes _cpSpin { to { transform:rotate(360deg) } }
    @keyframes _cpIn   { from { opacity:0;transform:scale(.9) } to { opacity:1;transform:scale(1) } }
    @keyframes _cpGlow { 0%,100%{box-shadow:0 0 18px rgba(212,168,67,.2)} 50%{box-shadow:0 0 36px rgba(212,168,67,.45)} }
  `;
  document.head.appendChild(s);
})();

function _showCouponPopup(imageId, imageType, promoUrl, onSuccess) {
  if (typeof promoUrl === "function") {
    onSuccess = promoUrl;
    promoUrl = "";
  }
  const safeLink =
    typeof promoUrl === "string" && promoUrl.trim() ? promoUrl.trim() : "";

  document.getElementById("_coupon-popup")?.remove();

  const linkHtml = safeLink
    ? `<div style="margin-top:16px">
         <a href="${safeLink}" target="_blank" style="
           display:inline-flex;align-items:center;gap:8px;
           color:#D4A843;font-size:13px;font-weight:800;text-decoration:none;
           padding:10px 20px;border:1px solid rgba(212,168,67,.25);border-radius:20px;
           background:rgba(212,168,67,.08)">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> احصل على الكوبون من هنا
         </a>
       </div>`
    : "";

  const ov = document.createElement("div");
  ov.id = "_coupon-popup";
  ov.style.cssText = `
    position:fixed;inset:0;z-index:950;
    background:rgba(0,11,33,.75);backdrop-filter:blur(10px);
    display:flex;align-items:center;justify-content:center;
    padding:20px;font-family:Tajawal,sans-serif;direction:rtl;
  `;
  ov.innerHTML = `
    <div style="
      background:#fff;border:1px solid rgba(74,116,164,.2);
      border-top:3px solid #4a74a4;border-radius:22px;
      width:100%;max-width:370px;padding:34px 26px;text-align:center;position:relative;
      animation:_cpIn .22s ease-out;">
      <button id="_cp-close" style="
        position:absolute;top:14px;left:14px;background:none;border:none;
        color:rgba(34,49,71,.18);cursor:pointer;font-size:20px;line-height:1">✕</button>
      <div style="
        width:62px;height:62px;margin:0 auto 18px;
        background:rgba(212,168,67,.08);border:1.5px solid rgba(212,168,67,.3);
        border-radius:50%;display:flex;align-items:center;justify-content:center;
        animation:_cpGlow 2s ease-in-out infinite;">
        <i class="fa-solid fa-lock" style="color:#D4A843;font-size:22px"></i>
      </div>
      <h2 style="font-size:20px;font-weight:900;color:#223147;margin-bottom:8px">محتوى حصري</h2>
      <p style="color:rgba(34,49,71,.45);font-size:13px;line-height:1.7;margin-bottom:22px">
        ادخل كوبونك من 9 أرقام لفتح هذا المحتوى<br>
        <span style="font-size:11px;color:rgba(74,116,164,.4)">صالح لاستخدام واحد فقط</span>
      </p>
      <div style="margin-bottom:10px">
        <input id="_cp-input" type="text" inputmode="numeric" maxlength="9"
          placeholder="• • • • • • • • •" autocomplete="off"
          style="width:100%;padding:14px 16px;border-radius:12px;
            border:2px solid rgba(74,116,164,.2);background:rgba(74,116,164,.03);
            color:#1a2637;font-family:monospace;font-size:22px;font-weight:900;
            letter-spacing:6px;text-align:center;outline:none;
            transition:border-color .2s,box-shadow .2s;"
          oninput="this.value=this.value.replace(/\\D/g,'');_cpDots(this.value.length)"
          onfocus="this.style.borderColor='#4a74a4';this.style.boxShadow='0 0 0 3px rgba(74,116,164,.12)'"
          onblur="this.style.borderColor='rgba(74,116,164,.2)';this.style.boxShadow='none'"
          onkeydown="if(event.key==='Enter')_verifyCoupon('${imageId}','${imageType}')"/>
        <div id="_cp-dots" style="display:flex;justify-content:center;gap:5px;margin-top:8px">
          ${Array.from({ length: 9 }, (_, i) => `<div id="_cpd${i + 1}" style="width:6px;height:6px;border-radius:50%;background:rgba(74,116,164,.15);transition:background .15s"></div>`).join("")}
        </div>
      </div>
      <div id="_cp-msg" style="min-height:18px;font-size:12px;font-weight:700;margin-bottom:14px"></div>
      <button id="_cp-btn" onclick="_verifyCoupon('${imageId}','${imageType}')" style="
        width:100%;padding:13px;border-radius:12px;border:none;
        background:#4a74a4;color:#fff;font-family:Tajawal,sans-serif;
        font-size:15px;font-weight:800;cursor:pointer;
        box-shadow:0 4px 16px rgba(74,116,164,.3);transition:all .16s;"
        onmouseover="this.style.transform='translateY(-1px)'"
        onmouseout="this.style.transform='none'">
        تحقق من الكوبون
      </button>
      ${linkHtml}
    </div>`;

  document.body.appendChild(ov);

  /* احفظ الـ callback */
  window._couponSuccess = onSuccess;
  window._couponImageId = imageId;

  document.getElementById("_cp-close").onclick = () => ov.remove();
  ov.addEventListener("click", (e) => {
    if (e.target === ov) ov.remove();
  });
  setTimeout(() => document.getElementById("_cp-input")?.focus(), 120);
}

function _cpDots(len) {
  for (let i = 1; i <= 9; i++) {
    const d = document.getElementById("_cpd" + i);
    if (d) d.style.background = i <= len ? "#4a74a4" : "rgba(74,116,164,.15)";
  }
}

async function _verifyCoupon(imageId, imageType) {
  const inp = document.getElementById("_cp-input");
  const btn = document.getElementById("_cp-btn");
  const code = inp?.value?.trim();

  if (!code || code.length !== 9) {
    _cpMsg("أدخل 9 أرقام كاملة ⚠️", "warn");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span style="display:inline-block;width:15px;height:15px;
    border:2px solid rgba(255,255,255,.3);border-top-color:#fff;
    border-radius:50%;animation:_cpSpin .6s linear infinite;vertical-align:middle"></span>`;

  try {
    const { data, error } = await sb
      .from("coupons")
      .select("id,is_used,used_by")
      .eq("code", code)
      .single();

    if (error || !data) {
      _cpFail(btn, "الكوبون غير صحيح ❌");
      return;
    }

    /* لو مستخدم — تحقق لو نفس اليوزر */
    if (data.is_used) {
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (session && data.used_by === session.user.id) {
        /* نفس الشخص — اسمح له تاني */
        _cpMsg("✓ كوبون مستخدم من قبلك — جاري الفتح...", "ok");
        await _doUnlockSuccess(imageId, false, data.id, code);
      } else {
        _cpFail(btn, "هذا الكوبون مستخدم مسبقاً ❌");
      }
      return;
    }

    /* كوبون جديد → علّمه مستخدم */
    const {
      data: { session },
    } = await sb.auth.getSession();
    const { error: upErr } = await sb
      .from("coupons")
      .update({
        is_used: true,
        used_by: session?.user?.id || null,
        used_at: new Date().toISOString(),
        image_id: imageId || null,
        image_type: imageType || null,
      })
      .eq("id", data.id)
      .eq("is_used", false);

    if (upErr) throw upErr;

    _cpMsg("✓ كوبون صحيح! جاري الفتح...", "ok");
    btn.style.background = "linear-gradient(135deg,#2a7e6e,#1f6b5e)";
    btn.style.color = "#fff";
    btn.innerHTML = "✓ تم التحقق";

    await _doUnlockSuccess(imageId, true, data.id, code);
  } catch (e) {
    console.error("Coupon Error:", e);
    _cpFail(btn, "خطأ، حاول مجدداً ⚠️");
  }
}

async function _doUnlockSuccess(imageId, isNew, couponDbId, code) {
  /* 1. أضف الـ ID في localStorage عشان يتفتح في كل مكان */
  const unlocked = JSON.parse(localStorage.getItem("sallim_unlocked") || "[]");
  if (imageId && !unlocked.includes(imageId)) {
    unlocked.push(imageId);
    localStorage.setItem("sallim_unlocked", JSON.stringify(unlocked));
  }

  /* 2. انتظر قليلاً ثم شغّل */
  await new Promise((r) => setTimeout(r, 700));

  /* 3. أغلق الـ popup */
  document.getElementById("_coupon-popup")?.remove();

  /* 4. شغّل الصورة فوراً (الـ callback) */
  if (typeof window._couponSuccess === "function") {
    window._couponSuccess();
    window._couponSuccess = null;
  }

  /* 5. ★ أعد رسم كل الـ grids — بيشيل القفل تلقائياً */
  await _refreshAfterUnlock();
}

function _cpFail(btn, text) {
  _cpMsg(text, "err");
  btn.disabled = false;
  btn.innerHTML = "تحقق من الكوبون";
  const inp = document.getElementById("_cp-input");
  if (inp) {
    inp.style.borderColor = "#C0705A";
    setTimeout(() => (inp.style.borderColor = "rgba(74,116,164,.2)"), 1400);
  }
}
function _cpMsg(text, type) {
  const m = document.getElementById("_cp-msg");
  if (!m) return;
  m.textContent = text;
  m.style.color =
    type === "ok" ? "#2a7e6e" : type === "err" ? "#C0705A" : "#4a74a4";
}

window._showCouponPopup = _showCouponPopup;
window._verifyCoupon = _verifyCoupon;
