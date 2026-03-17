      /* ── BG CANVAS ── */
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
        for (let i = 0; i < 80; i++)
          dots.push({
            x: Math.random() * 1400,
            y: Math.random() * 1000,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            r: Math.random() * 1.5 + 0.3,
            a: Math.random(),
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
            ctx.fillStyle = `rgba(74,116,164,${d.a * 0.35})`;
            ctx.fill();
          });
          requestAnimationFrame(frame);
        })();
      })();

      /* ── MOBILE NAV ── */
      document.getElementById("hamBtn").addEventListener("click", () => {
        document.getElementById("mob").classList.toggle("open");
      });

      /* ══════════════════════════════════════
         TEMPLATES — ديناميك من Supabase
      ══════════════════════════════════════ */
      const PER_PAGE = 8;
      let _allItems = [],
        _filtered = [],
        _curPage = 1;
      let _curCat = "all",
        _curSort = "default",
        _search = "";

      async function loadTemplates() {
        try {
          // 🌟 سحب السعر (price) والرابط (promo_link) من الداتابيز
          const [calRes, bgRes] = await Promise.all([
            sb
              .from("calligraphy")
              .select(
                "id,name,public_url,style,is_premium,price,promo_link,sort_order,created_at",
              )
              .eq("is_active", true)
              .order("sort_order", { ascending: true })
              .order("created_at", { ascending: false }),
            sb
              .from("backgrounds")
              .select(
                "id,name,public_url,category,is_premium,price,promo_link,sort_order,created_at",
              )
              .eq("is_active", true)
              .order("sort_order", { ascending: true })
              .order("created_at", { ascending: false }),
          ]);

          const calItems = (calRes.data || []).map((c) => ({
            id: "cal_" + c.id,
            rawId: c.id,
            name: c.name,
            img: c.public_url,
            isPremium: !!c.is_premium,
            price: c.price,
            promoLink: c.promo_link,
            type: "calligraphy",
            style: c.style,
            sortOrder: c.sort_order || 0,
            createdAt: c.created_at,
          }));
          const bgItems = (bgRes.data || []).map((b) => ({
            id: "bg_" + b.id,
            rawId: b.id,
            name: b.name,
            img: b.public_url,
            isPremium: !!b.is_premium,
            price: b.price,
            promoLink: b.promo_link,
            type: "background",
            cat: b.category,
            sortOrder: b.sort_order || 0,
            createdAt: b.created_at,
          }));

          _allItems = [...calItems, ...bgItems];
          await _markUnlockedItems(); // ← هنا

          _updateCounts();
          _applyAndRender();
        } catch (e) {
          console.error(e);
          document.getElementById("tplGrid").innerHTML = "";
          document.getElementById("emptyState").classList.add("vis");
        }
      }
      async function _markUnlockedItems() {
        try {
          const {
            data: { session },
          } = await sb.auth.getSession();
          if (!session) return;

          // جيب كل الكوبونات المستخدمة من اليوزر ده
          const { data: usedCoupons } = await sb
            .from("coupons")
            .select("image_type, used_by")
            .eq("used_by", session.user.id)
            .eq("is_used", true);

          if (!usedCoupons?.length) return;

          // مش عندنا item_id في الكوبونات، فنحتاج نحفظ في localStorage
          // لكن بما إن عندنا used_by = userId، نعلّم كل الـ premium items بتاعته
          // الأبسط: نجيب الـ IDs المخزنة في localStorage
          const unlocked = JSON.parse(
            localStorage.getItem("sallim_unlocked") || "[]",
          );

          _allItems = _allItems.map((item) => {
            if (item.isPremium && unlocked.includes(item.rawId)) {
              return { ...item, isUnlocked: true };
            }
            return item;
          });
        } catch (e) {
          console.warn(e);
        }
      }
      function _updateCounts() {
        document.getElementById("cnt-all").textContent = _allItems.length;
        document.getElementById("cnt-free").textContent = _allItems.filter(
          (t) => !t.isPremium,
        ).length;
        document.getElementById("cnt-premium").textContent = _allItems.filter(
          (t) => t.isPremium,
        ).length;
      }

      function _applyAndRender() {
        let list = [..._allItems];
        if (_curCat === "free") list = list.filter((t) => !t.isPremium);
        if (_curCat === "premium") list = list.filter((t) => t.isPremium);
        if (_search)
          list = list.filter((t) =>
            t.name.toLowerCase().includes(_search.toLowerCase()),
          );
        switch (_curSort) {
          case "name":
            list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
            break;
          case "free":
            list.sort((a, b) => Number(a.isPremium) - Number(b.isPremium));
            break;
          case "premium":
            list.sort((a, b) => Number(b.isPremium) - Number(a.isPremium));
            break;
          case "new":
            list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
          default:
            list.sort((a, b) => a.sortOrder - b.sortOrder);
            break;
        }
        _filtered = list;
        _curPage = Math.min(
          _curPage,
          Math.ceil(_filtered.length / PER_PAGE) || 1,
        );
        _renderPage();
      }

      function _renderPage() {
        const grid = document.getElementById("tplGrid"),
          empty = document.getElementById("emptyState");
        const pgNav = document.getElementById("pagination"),
          pgInfo = document.getElementById("pgInfo");
        const total = _filtered.length,
          totalPages = Math.ceil(total / PER_PAGE);
        const start = (_curPage - 1) * PER_PAGE,
          end = Math.min(start + PER_PAGE, total);
        const page = _filtered.slice(start, end);

        document.getElementById("totalCount").textContent = total;
        document.getElementById("rangeText").textContent = total
          ? `${start + 1}–${end}`
          : "0";

        if (!page.length) {
          grid.innerHTML = "";
          empty.classList.add("vis");
          pgNav.innerHTML = "";
          pgInfo.textContent = "";
          return;
        }
        empty.classList.remove("vis");

        grid.innerHTML = page
          .map((t, i) => {
            const isPrem = t.isPremium;
            const darkBg = t.style === "white" || t.darkBg;

            // 🌟 السعر بتنسيق أنيق
            const priceVal = t.price ? parseFloat(t.price) : 0;
            const priceText =
              priceVal > 0
                ? `<span class="price-txt">${priceVal} ر.س</span>`
                : "";

            // استبدله بـ:
            const isUnlocked = !!t.isUnlocked;

            const tagHtml = isUnlocked
              ? `<div class="tc-tag free" style="background:rgba(42,126,110,.95)">
       <i class="fa-solid fa-check-circle"></i> تم شراؤه
     </div>`
              : isPrem
                ? `<div class="tc-tag premium">
       <i class="fa-solid fa-crown"></i> حصري ${priceText}
     </div>`
                : `<div class="tc-tag free">
       <i class="fa-solid fa-gift"></i> مجاني
     </div>`;

            // وغيّر الـ overlayBtns:
            let overlayBtns = isUnlocked
              ? `<a href="#" class="tc-overlay-btn" 
       style="background:linear-gradient(135deg,#2a7e6e,#1a5c52)"
       onclick="event.preventDefault();event.stopPropagation();_openEditorWithItem(_allItems.find(x=>x.id==='${t.id}'))">
       <i class="fa-solid fa-lock-open"></i> افتح القالب
     </a>`
              : `<a href="#" class="tc-overlay-btn" 
       onclick="event.preventDefault();event.stopPropagation();_handleCardClick('${t.id}')">
       <i class="fa-solid fa-pen-nib"></i> ابدأ التصميم
     </a>`;

            if (!isUnlocked && isPrem && t.promoLink) {
              overlayBtns += `
    <a href="${t.promoLink}" target="_blank" 
       onclick="event.stopPropagation()" class="promo-btn">
      <i class="fa-solid fa-cart-shopping"></i> شراء الكوبون
    </a>`;
            }
            return `
            <div class="tc" style="animation-delay:${i * 0.07}s" onclick="_handleCardClick('${t.id}')">
              <div class="tc-img" style="${darkBg ? "background:#1a1a2e" : ""}">
                ${
                  t.img
                    ? `<img src="${t.img}" alt="${t.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
                    <div class="tc-placeholder" style="display:none"><i class="fa-solid fa-image"></i><span>صورة القالب</span></div>`
                    : `<div class="tc-placeholder"><i class="fa-solid fa-image"></i><span>صورة القالب</span></div>`
                }
                ${tagHtml}
                <div class="tc-overlay">
                  ${overlayBtns}
                </div>
              </div>
              <div class="tc-foot">
                <span class="tc-name">${t.name}</span>
                <a href="#" onclick="event.preventDefault(); event.stopPropagation(); _handleCardClick('${t.id}')" class="tc-action"><i class="fa-solid fa-arrow-left"></i></a>
              </div>
            </div>`;
          })
          .join("");

        _buildPagination(totalPages, pgNav);
        pgInfo.textContent =
          totalPages > 1 ? `صفحة ${_curPage} من ${totalPages}` : "";
      }

      function _buildPagination(total, nav) {
        if (total <= 1) {
          nav.innerHTML = "";
          return;
        }
        const nums = _pageNums(_curPage, total);
        let html = `<button class="pg-btn" onclick="goPage(${_curPage - 1})" ${_curPage === 1 ? "disabled" : ""}><i class="fa-solid fa-chevron-right fa-xs"></i></button>`;
        nums.forEach((p) => {
          if (p === "…") html += `<span class="pg-dots">…</span>`;
          else
            html += `<button class="pg-btn${p === _curPage ? " active" : ""}" onclick="goPage(${p})">${p}</button>`;
        });
        html += `<button class="pg-btn" onclick="goPage(${_curPage + 1})" ${_curPage === total ? "disabled" : ""}><i class="fa-solid fa-chevron-left fa-xs"></i></button>`;
        nav.innerHTML = html;
      }

      function _pageNums(cur, total) {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const p = [];
        if (cur <= 4) {
          for (let i = 1; i <= 5; i++) p.push(i);
          p.push("…");
          p.push(total);
        } else if (cur >= total - 3) {
          p.push(1);
          p.push("…");
          for (let i = total - 4; i <= total; i++) p.push(i);
        } else {
          p.push(1);
          p.push("…");
          for (let i = cur - 1; i <= cur + 1; i++) p.push(i);
          p.push("…");
          p.push(total);
        }
        return p;
      }

      function goPage(p) {
        _curPage = p;
        _renderPage();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      function setFilter(btn) {
        document
          .querySelectorAll(".ftab")
          .forEach((b) => b.classList.remove("on"));
        btn.classList.add("on");
        _curCat = btn.dataset.cat;
        _curPage = 1;
        _applyAndRender();
      }
      document
        .getElementById("searchInput")
        .addEventListener("input", function () {
          _search = this.value.trim();
          _curPage = 1;
          _applyAndRender();
        });
      document
        .getElementById("sortSelect")
        .addEventListener("change", function () {
          _curSort = this.value;
          _curPage = 1;
          _applyAndRender();
        });

      /* GLOW */
      const s = document.createElement("style");
      s.textContent =
        "@keyframes glow{0%,100%{box-shadow:0 0 0 4px rgba(74,116,164,.2)}50%{box-shadow:0 0 0 8px rgba(74,116,164,0)}}";
      document.head.appendChild(s);

      /* ── Card click handler ── */
      function _handleCardClick(id) {
        const t = _allItems.find((x) => x.id === id);
        if (!t) return;

        // 🌟 لو القالب حصري يفتح مودال الكوبون علطول
        if (t.isPremium) {
          openCouponModal(t);
        } else {
          // لو مجاني، ادخل المحرر
          _openEditorWithItem(t);
        }
      }

      function _openEditorWithItem(t) {
        sessionStorage.setItem(
          "unlocked_item",
          JSON.stringify({
            type: t.type,
            rawId: t.rawId,
            name: t.name,
            img: t.img,
            darkBg: t.darkBg,
            coupon: null,
          }),
        );
        const url = new URL("/editor.html", location.origin);
        url.searchParams.set("unlock_type", t.type);
        url.searchParams.set("unlock_id", t.rawId);
        location.href = url.toString();
      }

      loadTemplates();

      /* ── AUTH ── */
      (async () => {
        const {
          data: { session },
        } = await sb.auth.getSession();
        if (!session) return;
        const { data: profile } = await sb
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        const name = profile?.full_name || profile?.username || "حسابي";
        const isAdmin = profile?.role === "admin";
        document.getElementById("nav-auth-area").innerHTML = `
          <div style="position:relative" id="ubox">
            <button onclick="var m=document.getElementById('umenu');var c=document.getElementById('uchev');var open=m.style.display==='block';m.style.display=open?'none':'block';c.style.transform=open?'rotate(0)':'rotate(180deg)';"
              style="display:flex;align-items:center;gap:8px;padding:6px 12px 6px 8px;background:rgba(74,116,164,.08);border:1px solid rgba(74,116,164,.22);border-radius:22px;cursor:pointer;color:var(--dark-text-main);font-family:var(--font-main);font-size:13px;font-weight:700;transition:all .18s;"
              onmouseover="this.style.background='rgba(74,116,164,.15)'" onmouseout="this.style.background='rgba(74,116,164,.08)'">
              <span style="max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</span>
              <i id="uchev" class="fa-solid fa-chevron-down" style="font-size:10px;opacity:.5;transition:transform .2s"></i>
            </button>
            <div id="umenu" style="display:none;position:absolute;top:calc(100% + 10px);left:0;min-width:210px;background:var(--color-primary-dark);border:1px solid rgba(74,116,164,.18);border-radius:14px;padding:6px;box-shadow:0 16px 48px rgba(0,0,0,.5);z-index:9999;font-family:var(--font-main);">
              <div style="height:1px;background:rgba(74,116,164,.1);margin:0 6px 6px"></div>
              ${
                isAdmin
                  ? `<a href="./admin/dashboard.html" style="display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:8px;color:rgba(242,242,242,.65);font-size:13px;font-weight:700;text-decoration:none;transition:background .14s;"
                onmouseover="this.style.background='rgba(74,116,164,.07)';this.style.color='var(--dark-text-main)'" onmouseout="this.style.background='transparent';this.style.color='rgba(242,242,242,.65)'">
                <i class="fa-solid fa-gauge" style="width:16px;text-align:center;color:rgba(74,116,164,.5)"></i> لوحة الإدارة</a>`
                  : ""
              }
              <a href="../editor.html" style="display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:8px;color:rgba(242,242,242,.65);font-size:13px;font-weight:700;text-decoration:none;transition:background .14s;"
                onmouseover="this.style.background='rgba(74,116,164,.07)';this.style.color='var(--dark-text-main)'" onmouseout="this.style.background='transparent';this.style.color='rgba(242,242,242,.65)'">
                <i class="fa-solid fa-pen-nib" style="width:16px;text-align:center;color:rgba(74,116,164,.5)"></i> محرر البطاقات</a>
              <div style="height:1px;background:rgba(74,116,164,.1);margin:6px"></div>
              <button onclick="localStorage.removeItem('_sallim_guest');localStorage.removeItem('_sallim_fp');sb.auth.signOut().then(()=>window.location.href='/index.html');"
                style="display:flex;align-items:center;gap:9px;width:100%;padding:9px 12px;border-radius:8px;border:none;background:none;color:rgba(192,112,90,.7);font-family:var(--font-main);font-size:13px;font-weight:700;cursor:pointer;text-align:right;transition:background .14s;"
                onmouseover="this.style.background='rgba(192,112,90,.08)';this.style.color='#C0705A'" onmouseout="this.style.background='transparent';this.style.color='rgba(192,112,90,.7)'">
                <i class="fa-solid fa-right-from-bracket" style="width:16px;text-align:center;color:rgba(192,112,90,.5)"></i> تسجيل الخروج</button>
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
      })();

      /* ── SECURITY ── */
      (function () {
        "use strict";
        let _item = null;

        window.openCouponModal = function (item) {
          _item = item;
          document.getElementById("cmCodeInput").value = "";
          document.getElementById("cmCodeInput").className = "cm-input";
          document.getElementById("cmHintEl").textContent = "";
          document.getElementById("cmFormSection").style.display = "block";
          document.getElementById("cmSuccessSection").style.display = "none";
          document.getElementById("cmIcon").innerHTML =
            '<i class="fa-solid fa-lock"></i>';
          document.getElementById("cmIcon").style.cssText =
            "background:rgba(74,116,164,.1);color:var(--accent)";
          document.getElementById("cmTitle").textContent =
            item.name || "محتوى حصري";
          document.getElementById("cmSub").textContent =
            "أدخل كوبونك للوصول لهذا القالب";
          const prev = document.getElementById("cmImgPreview");
          if (item.img) {
            prev.src = item.img;
            prev.style.display = "block";
            prev.style.background = item.darkBg ? "#1a1a2e" : "";
          } else prev.style.display = "none";
          const buyS = document.getElementById("cmBuySection"),
            buyL = document.getElementById("cmBuyLink");
          if (item.promoLink) {
            buyS.style.display = "block";
            buyL.href = item.promoLink;
          } else buyS.style.display = "none";
          document.getElementById("couponOverlay").classList.add("open");
          setTimeout(() => document.getElementById("cmCodeInput").focus(), 320);
        };

        window.closeCouponModal = function (e) {
          if (e && e.target !== document.getElementById("couponOverlay"))
            return;
          document.getElementById("couponOverlay").classList.remove("open");
        };

        window.submitCoupon = async function () {
          const code = document.getElementById("cmCodeInput").value.trim();
          const hint = document.getElementById("cmHintEl");
          const inp = document.getElementById("cmCodeInput");

          if (code.length !== 9) {
            hint.textContent = "الكوبون مكوّن من 9 أرقام";
            hint.className = "cm-hint err";
            inp.className = "cm-input err";
            inp.focus();
            return;
          }

          const btn = document.getElementById("cmSubmitBtn"),
            spin = document.getElementById("cmSpin"),
            txt = document.getElementById("cmBtnTxt");
          btn.disabled = true;
          spin.style.display = "block";
          txt.textContent = "...";
          hint.textContent = "";

          try {
            // 1. جلب الكوبون والتأكد إنه سليم
            const { data: coupon, error } = await sb
              .from("coupons")
              .select("id,is_used,used_by")
              .eq("code", code)
              .single();
            if (error || !coupon) {
              hint.textContent = "الكوبون غير صحيح ❌";
              hint.className = "cm-hint err";
              inp.className = "cm-input err";
              return;
            }

            // 2. لو مستخدم قبل كده، نوقف العملية
            if (coupon.is_used) {
              hint.textContent =
                "هذا الكوبون مستخدم مسبقاً — كل كوبون لاستخدام واحد فقط ❌";
              hint.className = "cm-hint err";
              inp.className = "cm-input err";
              return;
            }

            // 3. نحرق الكوبون في الداتابيز "قبل" ما نفتح القالب
            const {
              data: { session },
            } = await sb.auth.getSession();
            const userId = session?.user?.id || null;

            const { error: updateErr } = await sb
              .from("coupons")
              .update({
                is_used: true,
                used_by: userId,
                used_at: new Date().toISOString(),
                image_type: _item.type,
              })
              .eq("id", coupon.id)
              .eq("is_used", false); // حماية إضافية عشان نضمن إنه متحدثش في نفس اللحظة من حد تاني

            // لو حصل أي خطأ في التحديث (زي قوانين RLS بتمنع)، نوقف وميفتحش القالب
            if (updateErr) throw updateErr;

            // تسجيل العملية (اختياري)
            if (userId)
              await sb
                .from("activity_log")
                .insert({
                  action: "coupon_used",
                  entity_type: _item.type,
                  details: {
                    coupon: code,
                    item_id: _item.rawId,
                    item_name: _item.name,
                  },
                })
                .catch(() => {});

            // 4. نجاح تام!
            inp.className = "cm-input ok";
            hint.textContent = "✓ كوبون صالح — جاري الفتح...";
            hint.className = "cm-hint ok";
            await _doUnlock(code);
          } catch (e) {
            hint.textContent =
              "فشل في تفعيل الكوبون، تأكد من صلاحياتك أو اتصالك";
            hint.className = "cm-hint err";
            inp.className = "cm-input err";
            console.error("Coupon error:", e);
          } finally {
            btn.disabled = false;
            spin.style.display = "none";
            txt.textContent = "تفعيل";
          }
        };
        window.closeCouponModal = function (e) {
          if (e && e.target !== document.getElementById("couponOverlay"))
            return;
          document.getElementById("couponOverlay").classList.remove("open");
        };

        window.submitCoupon = async function () {
          const code = document.getElementById("cmCodeInput").value.trim();
          const hint = document.getElementById("cmHintEl");
          const inp = document.getElementById("cmCodeInput");
          if (code.length !== 9) {
            hint.textContent = "الكوبون مكوّن من 9 أرقام";
            hint.className = "cm-hint err";
            inp.className = "cm-input err";
            inp.focus();
            return;
          }
          const btn = document.getElementById("cmSubmitBtn"),
            spin = document.getElementById("cmSpin"),
            txt = document.getElementById("cmBtnTxt");
          btn.disabled = true;
          spin.style.display = "block";
          txt.textContent = "...";
          hint.textContent = "";
          try {
            const { data: coupon, error } = await sb
              .from("coupons")
              .select("id,is_used,used_by")
              .eq("code", code)
              .single();
            if (error || !coupon) {
              hint.textContent = "الكوبون غير موجود ❌";
              hint.className = "cm-hint err";
              inp.className = "cm-input err";
              return;
            }
            if (coupon.is_used) {
              hint.textContent =
                "هذا الكوبون مستخدم مسبقاً — كل كوبون لاستخدام واحد فقط ❌";
              hint.className = "cm-hint err";
              inp.className = "cm-input err";
              return;
            }
            inp.className = "cm-input ok";
            hint.textContent = "✓ كوبون صالح — جاري الفتح...";
            hint.className = "cm-hint ok";
            await _doUnlock(coupon.id, true, code);
          } catch (e) {
            hint.textContent = "حدث خطأ، حاول مرة أخرى";
            hint.className = "cm-hint err";
            console.error(e);
          } finally {
            btn.disabled = false;
            spin.style.display = "none";
            txt.textContent = "تفعيل";
          }
        };

        async function _doUnlock(code) {
          try {
            /* ★ احفظ في localStorage عشان يبقى مفتوح في المحرر */
            const _unlocked = JSON.parse(
              localStorage.getItem("sallim_unlocked") || "[]",
            );
            if (_item.rawId && !_unlocked.includes(_item.rawId)) {
              _unlocked.push(_item.rawId);
              localStorage.setItem(
                "sallim_unlocked",
                JSON.stringify(_unlocked),
              );
            }
            sessionStorage.setItem(
              "unlocked_item",
              JSON.stringify({
                type: _item.type,
                rawId: _item.rawId,
                name: _item.name,
                img: _item.img,
                darkBg: _item.darkBg,
                coupon: code,
              }),
            );

            document.getElementById("cmFormSection").style.display = "none";
            document.getElementById("cmSuccessSection").style.display = "block";
            document.getElementById("cmIcon").innerHTML =
              '<i class="fa-solid fa-lock-open"></i>';
            document.getElementById("cmIcon").style.cssText =
              "background:rgba(42,126,110,.1);color:#2a7e6e";
            setTimeout(() => {
              const url = new URL("/editor.html", location.origin);
              url.searchParams.set("unlock_type", _item.type);
              url.searchParams.set("unlock_id", _item.rawId);
              location.href = url.toString();
            }, 1600);
          } catch (e) {
            document.getElementById("cmHintEl").textContent = "حدث خطأ داخلي";
            document.getElementById("cmHintEl").className = "cm-hint err";
            console.error(e);
          }
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