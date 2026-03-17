let _allCoupons = [], _cpFilter = 'all', _pendingCodes = [];

async function loadCoupons() {
  try {
    const { data: st } = await sb.from('coupon_stats').select('*').single();
    if (st) {
      document.getElementById('cp-available').textContent = st.available ?? 0;
      document.getElementById('cp-used').textContent      = st.used      ?? 0;
      document.getElementById('cp-total').textContent     = st.total     ?? 0;
    }
    const { data, error } = await sb.from('coupons')
      .select('*').order('created_at', { ascending: false }).limit(500);
    if (error) throw error;
    _allCoupons = data || [];
    _renderCoupons();
  } catch(e) { toast('خطأ: ' + e.message, 'err'); }
}

function _renderCoupons(search = '') {
  let list = _allCoupons;
  if (_cpFilter === 'unused') list = list.filter(c => !c.is_used);
  if (_cpFilter === 'used')   list = list.filter(c =>  c.is_used);
  if (search) list = list.filter(c => c.code.includes(search));

  const body = document.getElementById('coupons-body');
  if (!list.length) {
    body.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-ticket"></i><p>لا توجد كوبونات</p></div></td></tr>`;
    return;
  }
  body.innerHTML = list.map(c => `
    <tr>
      <td>
        <code style="
          font-family:monospace;font-size:16px;font-weight:900;
          letter-spacing:4px;color:var(--gold2);
          background:rgba(212,168,67,.07);
          padding:5px 12px;border-radius:7px;
          border:1px solid rgba(212,168,67,.12);
        ">${c.code}</code>
      </td>
      <td>
        <span class="badge ${c.is_used?'badge-rose':'badge-teal'}" style="font-size:11px">
          ${c.is_used
            ? '<i class="fa-solid fa-check" style="font-size:9px;margin-left:4px"></i>مستخدم'
            : '<i class="fa-solid fa-circle" style="font-size:6px;margin-left:4px"></i>متاح'}
        </span>
      </td>
      <td style="font-size:11px;color:rgba(247,242,232,.35)">${c.used_by?c.used_by.slice(0,10)+'...':'—'}</td>
      <td style="font-size:11px;color:rgba(247,242,232,.3)">
        ${c.image_type==='calligraphy'?'<i class="fa-solid fa-pen-nib" style="color:var(--teal2);margin-left:4px"></i>مخطوطة':
          c.image_type==='background'?'<i class="fa-solid fa-image" style="color:var(--gold);margin-left:4px"></i>خلفية':'—'}
      </td>
      <td style="font-size:11px;color:rgba(247,242,232,.3)">
        ${c.used_at
          ? new Date(c.used_at).toLocaleDateString('ar-SA')
          : new Date(c.created_at).toLocaleDateString('ar-SA')}
      </td>
      <td style="font-size:11px;color:rgba(247,242,232,.3)">${c.note||'—'}</td>
      <td>
        <div class="row-actions">
          ${!c.is_used ? `
            <button class="ra-btn" style="color:var(--teal2);background:rgba(42,138,126,.1)"
              title="نسخ الكوبون"
              onclick="navigator.clipboard.writeText('${c.code}');toast('تم النسخ ✓','ok')">
              <i class="fa-solid fa-copy"></i>
            </button>` : ''}
          <button class="ra-btn ra-del"
            onclick="confirmDelete('حذف الكوبون ${c.code}؟',()=>_deleteCoupon('${c.id}'))">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function filterCoupons(btn, val) {
  document.querySelectorAll('.cp-pill').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  _cpFilter = val;
  _renderCoupons(document.getElementById('cp-search')?.value || '');
}
function searchCoupons(v) { _renderCoupons(v.trim()); }

// ── Generate ──
function _makeCode() {
  let c = String(Math.floor(Math.random()*9)+1);
  for (let i=0;i<8;i++) c += Math.floor(Math.random()*10);
  return c;
}

function openGenerateModal() {
  _pendingCodes = [];
  document.getElementById('cp-count').value = '10';
  document.getElementById('cp-note').value  = '';
  previewCouponCodes();
  openModal('modal-coupons');
}

function previewCouponCodes() {
  const n = Math.min(500, Math.max(1, parseInt(document.getElementById('cp-count').value)||10));
  const set = new Set();
  let tries = 0;
  while (set.size < n && tries++ < 3000) set.add(_makeCode());
  _pendingCodes = [...set];

  document.getElementById('cp-preview-list').innerHTML =
    _pendingCodes.slice(0,18).map(c =>
      `<span style="font-family:monospace;font-size:12px;font-weight:800;letter-spacing:2px;
        color:var(--gold2);background:rgba(212,168,67,.07);
        padding:3px 8px;border-radius:5px;border:1px solid rgba(212,168,67,.12)">${c}</span>`
    ).join('') + (_pendingCodes.length>18
      ? `<span style="font-size:11px;color:rgba(247,242,232,.25);align-self:center">...و${n-18} آخرين</span>` : '');
}

async function doGenerateCoupons() {
  if (!_pendingCodes.length) { previewCouponCodes(); return; }
  const note = document.getElementById('cp-note').value.trim() || null;
  const btn  = document.getElementById('btn-do-generate');
  btn.disabled = true; btn.innerHTML = '<div class="spin"></div>';
  try {
    const me = await Auth.me();
    const { error } = await sb.from('coupons').insert(
      _pendingCodes.map(code => ({ code, note, created_by: me?.id }))
    );
    if (error) throw error;
    closeModal('modal-coupons');
    await loadCoupons();
    toast(`تم توليد ${_pendingCodes.length} كوبون ✓`, 'ok');
    _pendingCodes = [];
  } catch(e) {
    toast(e.message.includes('duplicate')
      ? 'بعض الكودات مكررة، أعد المحاولة' : e.message, 'err');
  } finally {
    btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-check"></i> حفظ وتوليد';
  }
}

async function _deleteCoupon(id) {
  await sb.from('coupons').delete().eq('id', id);
  await loadCoupons(); toast('تم الحذف ✓', 'ok');
}

function copyCoupons() {
  const av = _allCoupons.filter(c=>!c.is_used).map(c=>c.code);
  if (!av.length) { toast('لا توجد كوبونات متاحة', 'err'); return; }
  navigator.clipboard.writeText(av.join('\n'));
  toast(`تم نسخ ${av.length} كوبون ✓`, 'ok');
}

function exportCoupons() {
  const h = 'code,is_used,used_by,image_type,created_at,note';
  const rows = _allCoupons.map(c =>
    [c.code,c.is_used,c.used_by||'',c.image_type||'',c.created_at,c.note||''].join(','));
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent([h,...rows].join('\n'));
  a.download = 'coupons.csv'; a.click();
}
