function _showCouponPopup(imageId, imageType, onSuccess) {
  // إزالة أي popup قديم
  const old = document.getElementById('_coupon-popup');
  if (old) old.remove();

  const ov = document.createElement('div');
  ov.id = '_coupon-popup';
  ov.style.cssText = `
    position:fixed;inset:0;z-index:950;
    background:rgba(0,0,0,.85);backdrop-filter:blur(8px);
    display:flex;align-items:center;justify-content:center;
    padding:20px;font-family:Tajawal,sans-serif;direction:rtl;
  `;

  ov.innerHTML = `
    <div style="
      background:#111922;
      border:1px solid rgba(212,168,67,.2);
      border-top:3px solid #D4A843;
      border-radius:20px;
      width:100%;max-width:380px;
      padding:32px;text-align:center;
      position:relative;
    ">
      <button id="_cp-close"
        style="position:absolute;top:14px;left:14px;background:none;border:none;
          color:rgba(247,242,232,.2);cursor:pointer;font-size:18px;
          transition:color .15s"
        onmouseover="this.style.color='#C0705A'"
        onmouseout="this.style.color='rgba(247,242,232,.2)'">✕</button>

      <div style="font-size:38px;margin-bottom:12px">🎟️</div>

      <h2 style="font-family:Amiri,serif;font-size:20px;color:#ECC96A;margin-bottom:8px">
        هذا المحتوى يتطلب كوبون
      </h2>
      <p style="color:rgba(247,242,232,.45);font-size:13px;line-height:1.7;margin-bottom:20px">
        أدخل كوبونك من 9 أرقام للوصول إلى هذا المحتوى.<br>
        <span style="color:rgba(247,242,232,.3);font-size:12px">الكوبون صالح لاستخدام واحد فقط</span>
      </p>

      <div style="display:flex;gap:8px;margin-bottom:12px">
        <input id="_cp-input" type="text" maxlength="9"
          placeholder="• • • • • • • • •"
          style="flex:1;padding:13px;border-radius:10px;
            border:1.5px solid rgba(212,168,67,.2);
            background:rgba(0,0,0,.3);color:#F7F2E8;
            font-family:monospace;font-size:20px;font-weight:900;
            letter-spacing:5px;text-align:center;outline:none;
            transition:border-color .15s"
          oninput="this.value=this.value.replace(/[^0-9]/g,'');
            if(this.value.length===9)document.getElementById('_cp-btn').focus()"
          onfocus="this.style.borderColor='#D4A843'"
          onblur="this.style.borderColor='rgba(212,168,67,.2)'"/>
        <button id="_cp-btn"
          style="padding:13px 18px;border-radius:10px;border:none;
            background:#D4A843;color:#0D1117;font-family:Tajawal,sans-serif;
            font-size:14px;font-weight:800;cursor:pointer;
            transition:all .15s;white-space:nowrap"
          onmouseover="this.style.background='#C88820'"
          onmouseout="this.style.background='#D4A843'"
          onclick="_verifyCoupon('${imageId}','${imageType}')">
          تحقق
        </button>
      </div>

      <div id="_cp-msg" style="min-height:20px;font-size:12px;font-weight:700"></div>
    </div>
  `;

  document.body.appendChild(ov);

  // حفظ الـ callback
  window._couponCallback = onSuccess;
  window._couponImageId   = imageId;
  window._couponImageType = imageType;

  // إغلاق بالـ X أو click خارج
  document.getElementById('_cp-close').onclick = () => ov.remove();
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });

  // focus على الـ input
  setTimeout(() => document.getElementById('_cp-input')?.focus(), 100);
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
    const { data, error } = await sb
      .from('coupons').select('id,is_used').eq('code', code).single();

    if (error || !data) { _cpFail(btn,'الكوبون غير صحيح ❌'); return; }
    if (data.is_used)   { _cpFail(btn,'هذا الكوبون مستخدم بالفعل ❌'); return; }

    const { error: upErr } = await sb
      .from('coupons').update({
        is_used:true, used_by:currentUser?.id||null,
        used_at:new Date().toISOString(),
        image_id:imageId||null, image_type:imageType||null
      }).eq('id',data.id).eq('is_used',false);

    if (upErr) throw upErr;

    _cpMsg('✓ كوبون صحيح! جاري الفتح...','ok');
    btn.style.background = 'linear-gradient(135deg,#2A8A7E,#1a6b61)';
    btn.style.color = '#fff';
    btn.innerHTML = '✓ تم التحقق';

    // 🌟 السحر هنا: نحفظ إن العنصر ده اتفتح عشان ميسألش عليه تاني للأبد
   let unlockedItems = JSON.parse(localStorage.getItem('sallim_unlocked') || '[]');
const isPremium = !!bg.is_premium && !unlockedItems.includes(bg.id);
    if (imageId && !unlockedItems.includes(imageId)) {
        unlockedItems.push(imageId);
        localStorage.setItem('sallim_unlocked', JSON.stringify(unlockedItems));
    }

    setTimeout(() => {
      document.getElementById('_coupon-popup')?.remove();
      
      // 🌟 التصليح هنا: استخدمنا _couponCallback الصح
      if (typeof window._couponCallback === 'function') {
        window._couponCallback();
        window._couponCallback = null;
      }
      
      // 🌟 دي حركة صياعة عشان تخفي التاج الذهبي من الصورة فوراً بدون ريفريش
      document.querySelectorAll(`[onclick*="${imageId}"]`).forEach(el => {
          const crown = el.querySelector('div[style*="linear-gradient"]');
          if(crown) crown.remove(); // شيل التاج
          
          // عدل زرار الضغط عشان لو داس عليها تاني تفتح علطول
          const oldClick = el.getAttribute('onclick');
          if(oldClick.includes('_showCouponPopup')) {
              const newClick = oldClick.match(/function\(\)\{(.*?)\}/)[1];
              el.setAttribute('onclick', newClick);
          }
      });

    }, 700);

  } catch(e) { 
    console.error("Coupon Error: ", e); 
    _cpFail(btn,'خطأ، حاول مجدداً ⚠️'); 
  }
}
function _showCouponMsg(text, type) {
  const msg = document.getElementById('_cp-msg');
  if (!msg) return;
  msg.textContent = text;
  msg.style.color = type === 'ok' ? '#2A8A7E' : '#C0705A';
}

// إتاحة globally
window._showCouponPopup = _showCouponPopup;
window._verifyCoupon    = _verifyCoupon;