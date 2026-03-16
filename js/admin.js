// ══════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════
let allCategories=[], allCalligraphy=[], allBackgrounds=[], allUsers=[];
let calViewMode='table', currentCalStyle='';
let _allCoupons=[], _cpFilter='all', _pendingCodes=[];

const PAGE_LABELS = {
  overview:'نظرة عامة', categories:'التصنيفات', calligraphy:'المخطوطات',
  backgrounds:'الخلفيات', coupons:'الكوبونات', users:'المستخدمون', activity:'السجلات'
};
const PAGE_ACTIONS = {
  calligraphy:`<button class="btn-sm btn-primary" onclick="openCalModal()"><i class="fa-solid fa-upload"></i> رفع مخطوطة</button>`,
  backgrounds:`<button class="btn-sm btn-primary" onclick="openBgModal()"><i class="fa-solid fa-upload"></i> رفع خلفية</button>`,
  categories:`<button class="btn-sm btn-primary" onclick="openCatModal()"><i class="fa-solid fa-plus"></i> تصنيف جديد</button>`,
  coupons:`<button class="btn-sm btn-primary" onclick="openGenerateModal()"><i class="fa-solid fa-wand-magic-sparkles"></i> توليد كوبونات</button>`,
};

// ══ INIT ══
(async () => {
  const isAdmin = await Auth.requireAdmin();
  if (!isAdmin) return;
  const me = await Auth.me();
  if (me?.profile) {
    const n = me.profile.full_name || me.profile.username || 'أدمن';
    document.getElementById('admin-name').textContent = n;
    document.getElementById('admin-avatar').textContent = n.charAt(0).toUpperCase();
  }
  await loadOverview();
  await loadCategories();
})();

// ══ NAV ══
async function navTo(btn) {
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  const page = btn.dataset.page;
  document.querySelectorAll('.dash-page').forEach(p=>p.classList.remove('on'));
  document.getElementById('page-'+page).classList.add('on');
  document.getElementById('page-title').textContent = PAGE_LABELS[page]||'';
  document.getElementById('topbar-actions').innerHTML = PAGE_ACTIONS[page]||'';
  if (page==='calligraphy') await loadCalligraphy();
  if (page==='backgrounds')  await loadBackgrounds();
  if (page==='coupons')      await loadCoupons();
  if (page==='users')        await loadUsers();
  if (page==='activity')     await loadActivity();
}

// ══ OVERVIEW ══
async function loadOverview() {
  try {
    const stats = await DB.getStats();
    document.getElementById('s-users').textContent = stats.total_users||0;
    document.getElementById('s-cal').textContent   = stats.total_calligraphy||0;
    document.getElementById('s-bg').textContent    = stats.total_backgrounds||0;
    document.getElementById('s-cat').textContent   = stats.total_categories||0;
  } catch(e){}
  try {
    const { data: cs } = await sb.from('coupon_stats').select('*').single();
    if (cs) {
      document.getElementById('s-cp-av').textContent = cs.available||0;
      document.getElementById('s-cp-us').textContent = cs.used||0;
    }
  } catch(e){}
  try {
    const { data } = await sb.from('activity_log').select('*, profiles(username)').order('created_at',{ascending:false}).limit(8);
    const body = document.getElementById('recent-activity');
    if (!data?.length) { body.innerHTML=`<div class="empty-state"><i class="fa-solid fa-clock-rotate-left"></i><p>لا توجد أنشطة</p></div>`; return; }
    body.innerHTML=`<table class="dash-table"><thead><tr><th>الوقت</th><th>المستخدم</th><th>الإجراء</th></tr></thead><tbody>`+
      data.map(r=>`<tr><td style="font-size:11px;color:rgba(247,242,232,.4)">${new Date(r.created_at).toLocaleString('ar-SA')}</td><td>${r.profiles?.username||'—'}</td><td><span class="badge badge-gold">${r.action}</span></td></tr>`).join('')+
      '</tbody></table>';
  } catch(e){}
}

// ══ CATEGORIES ══
async function loadCategories() {
  try {
    allCategories = await DB.getAllCategories();
    renderCatsTable();
    populateCatSelects();
  } catch(e) { toast('خطأ في التصنيفات','err'); }
}
function renderCatsTable() {
  const body = document.getElementById('cats-body');
  if (!allCategories.length) { body.innerHTML=`<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-folder-open"></i><p>لا توجد تصنيفات</p></div></td></tr>`; return; }
  body.innerHTML = allCategories.map(cat=>`
    <tr>
      <td style="font-size:22px;text-align:center">${cat.icon||'📁'}</td>
      <td><div style="display:flex;align-items:center;gap:8px"><span class="cat-color" style="background:${cat.color||'#D4A843'}"></span><strong>${cat.name}</strong></div></td>
      <td><code style="color:var(--gold2);font-size:11px;background:rgba(212,168,67,.08);padding:2px 6px;border-radius:4px">${cat.name_en||'—'}</code></td>
      <td style="text-align:center">${cat.sort_order}</td>
      <td><label class="toggle-sw"><input type="checkbox" ${cat.is_active?'checked':''} onchange="toggleCatActive('${cat.id}',this.checked)"/><div class="toggle-track"></div><div class="toggle-thumb"></div></label></td>
      <td><div class="row-actions">
        <button class="ra-btn ra-edit" onclick='openCatModal(${JSON.stringify(cat).replace(/'/g,"&#39;")})'><i class="fa-solid fa-pen"></i></button>
        <button class="ra-btn ra-del" onclick="confirmDelete('حذف: ${cat.name}?',()=>deleteCategory('${cat.id}'))"><i class="fa-solid fa-trash"></i></button>
      </div></td>
    </tr>`).join('');
}
function populateCatSelects() {
  const opts=`<option value="">بدون تصنيف</option>`+allCategories.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  document.getElementById('cal-cat-sel').innerHTML=opts;
}
function openCatModal(cat=null) {
  document.getElementById('modal-cat-title').textContent=cat?'تعديل التصنيف':'تصنيف جديد';
  document.getElementById('cat-edit-id').value=cat?.id||'';
  document.getElementById('cat-name').value=cat?.name||'';
  document.getElementById('cat-name-en').value=cat?.name_en||'';
  document.getElementById('cat-icon').value=cat?.icon||'';
  document.getElementById('cat-order').value=cat?.sort_order||0;
  document.getElementById('cat-color').value=cat?.color||'#D4A843';
  openModal('modal-cat');
}
async function saveCategory() {
  const id=document.getElementById('cat-edit-id').value;
  const name=document.getElementById('cat-name').value.trim();
  if (!name) { toast('أدخل اسم التصنيف','err'); return; }
  try {
    await DB.saveCategory({id:id||undefined,name,name_en:document.getElementById('cat-name-en').value.trim(),icon:document.getElementById('cat-icon').value.trim(),sort_order:parseInt(document.getElementById('cat-order').value)||0,color:document.getElementById('cat-color').value,updated_at:new Date().toISOString()});
    closeModal('modal-cat'); await loadCategories(); toast(id?'تم التحديث ✓':'تم الإنشاء ✓','ok');
  } catch(e) { toast('خطأ: '+e.message,'err'); }
}
async function toggleCatActive(id,active) { await sb.from('categories').update({is_active:active}).eq('id',id).catch(()=>{}); }
async function deleteCategory(id) { await DB.deleteCategory(id); await loadCategories(); toast('تم الحذف ✓','ok'); }
function pickCatColor(el) { document.querySelectorAll('.color-swatch').forEach(s=>s.classList.remove('on')); el.classList.add('on'); document.getElementById('cat-color').value=el.dataset.c; }

// ══ CALLIGRAPHY ══
async function loadCalligraphy() {
  try { allCalligraphy=await DB.getAllCalligraphy(); renderCalTable(allCalligraphy); } catch(e) { toast('خطأ','err'); }
}
function renderCalTable(items) {
  const body=document.getElementById('cal-body');
  if (!items.length) { body.innerHTML=`<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-pen-nib"></i><p>لا توجد مخطوطات</p></div></td></tr>`; return; }
  body.innerHTML=items.map(c=>`
    <tr>
      <td><div style="width:52px;height:52px;border-radius:8px;border:1px solid var(--border);overflow:hidden;display:flex;align-items:center;justify-content:center;background:${c.style==='white'?'#1a1a2e':'var(--ivory2)'}">
        <img src="${c.public_url||c.storage_path}" style="max-width:48px;max-height:48px;object-fit:contain" onerror="this.style.display='none'"/>
      </div></td>
      <td><strong>${c.name}</strong></td>
      <td>${c.categories?`${c.categories.icon||''} ${c.categories.name}`:'—'}</td>
      <td><span class="badge ${c.style==='black'?'badge-gray':c.style==='white'?'badge-gold':c.style==='3d'?'badge-teal':'badge-rose'}">${{black:'سوداء',white:'بيضاء','3d':'ثلاثية',colored:'ملونة'}[c.style]||c.style}</span></td>
      <td>
        ${c.is_premium
          ? `<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(212,168,67,.12);color:var(--gold2);padding:3px 8px;border-radius:5px;font-size:10px;font-weight:800;border:1px solid rgba(212,168,67,.2)">
              <svg width="9" height="9" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2l2.4 5h5.1l-4.1 3.1 1.5 5.2L10 12.2l-4.9 3.1 1.5-5.2L2.5 7h5.1z"/></svg>
              كوبون
             </span>`
          : '<span style="color:rgba(247,242,232,.2);font-size:11px">—</span>'}
      </td>
      <td><label class="toggle-sw"><input type="checkbox" ${c.is_active?'checked':''} onchange="toggleCalActive('${c.id}',this.checked)"/><div class="toggle-track"></div><div class="toggle-thumb"></div></label></td>
      <td><div class="row-actions">
        <button class="ra-btn ra-del" onclick="confirmDelete('حذف: ${c.name}?',()=>deleteCalligraphy('${c.id}','${c.storage_path||''}'))"><i class="fa-solid fa-trash"></i></button>
      </div></td>
    </tr>`).join('');
}
function renderCalGrid(items) {
  document.getElementById('cal-grid-inner').innerHTML=items.map(c=>`
    <div class="img-card ${c.style==='white'?'dark-bg':''}">
      <img src="${c.public_url||c.storage_path}" alt="${c.name}"/>
      <div class="img-card-foot">
        <span>${c.name}</span>
        ${c.is_premium?`<span style="color:var(--gold2);font-size:10px">★</span>`:''}
        <button class="ra-btn ra-del" style="width:22px;height:22px" onclick="confirmDelete('حذف?',()=>deleteCalligraphy('${c.id}','${c.storage_path||''}'))"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`).join('');
}
function filterCalStyle(btn) {
  document.querySelectorAll('#cal-style-tabs .ptab').forEach(b=>b.classList.remove('on')); btn.classList.add('on');
  currentCalStyle=btn.dataset.style;
  const f=currentCalStyle?allCalligraphy.filter(c=>c.style===currentCalStyle):allCalligraphy;
  calViewMode==='table'?renderCalTable(f):renderCalGrid(f);
}
function filterCalSearch(q) { const f=allCalligraphy.filter(c=>c.name.includes(q)); calViewMode==='table'?renderCalTable(f):renderCalGrid(f); }
function switchCalView() {
  calViewMode=calViewMode==='table'?'grid':'table';
  document.getElementById('cal-view-table').style.display=calViewMode==='table'?'block':'none';
  document.getElementById('cal-view-grid').style.display=calViewMode==='grid'?'block':'none';
  document.getElementById('cal-view-btn').innerHTML=calViewMode==='table'?'<i class="fa-solid fa-table-cells"></i> عرض شبكي':'<i class="fa-solid fa-list"></i> عرض قائمة';
  const items=currentCalStyle?allCalligraphy.filter(c=>c.style===currentCalStyle):allCalligraphy;
  if (calViewMode==='grid') renderCalGrid(items);
}
function openCalModal() {
  ['cal-edit-id','cal-name-inp','cal-tags-inp'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('cal-order-inp').value='0';
  document.getElementById('cal-premium').checked=false;
  document.getElementById('cal-upload-preview').innerHTML='';
  document.getElementById('cal-files').value='';
  openModal('modal-cal');
}
async function saveCalligraphy() {
  const files=document.getElementById('cal-files').files;
  const name=document.getElementById('cal-name-inp').value.trim();
  const catId=document.getElementById('cal-cat-sel').value;
  const style=document.getElementById('cal-style-sel').value;
  const order=parseInt(document.getElementById('cal-order-inp').value)||0;
  const tags=document.getElementById('cal-tags-inp').value.split(',').map(t=>t.trim()).filter(t=>t);
  const isPremium=document.getElementById('cal-premium').checked;
  if (!files.length) { toast('اختر صورة','err'); return; }
  const btn=document.getElementById('btn-save-cal');
  btn.disabled=true; btn.innerHTML='<div class="spin"></div> جاري الرفع...';
  document.getElementById('cal-progress').classList.add('vis');
  try {
    const me=await Auth.me(); let saved=0;
    for (let i=0;i<files.length;i++) {
      const up=await Storage.upload('calligraphy',files[i],`cal_${Date.now()}_${i}`);
      const iname=files.length>1?(name||files[i].name.replace(/\.[^/.]+$/,''))+` (${i+1})`:(name||files[i].name);
      await DB.saveCalligraphy({name:iname,category_id:catId||null,style,storage_path:up.path,public_url:up.url,sort_order:order,tags,upload_by:me?.id,is_active:true,is_premium:isPremium});
      saved++;
      document.getElementById('cal-pfill').style.width=Math.round((saved/files.length)*100)+'%';
    }
    closeModal('modal-cal'); await loadCalligraphy(); await loadOverview();
    toast(`تم رفع ${saved} مخطوطة ✓`,'ok');
  } catch(e) { toast('خطأ: '+e.message,'err'); }
  finally { btn.disabled=false; btn.innerHTML='<i class="fa-solid fa-upload"></i> رفع وحفظ'; document.getElementById('cal-progress').classList.remove('vis'); document.getElementById('cal-pfill').style.width='0%'; }
}
async function toggleCalActive(id,active) { await sb.from('calligraphy').update({is_active:active}).eq('id',id).catch(()=>{}); }
async function deleteCalligraphy(id,path) {
  await DB.deleteCalligraphy(id);
  if (path) await Storage.delete('calligraphy',path).catch(()=>{});
  await loadCalligraphy(); await loadOverview(); toast('تم الحذف ✓','ok');
}

// ══ BACKGROUNDS ══
async function loadBackgrounds() {
  try { allBackgrounds=await DB.getAllBackgrounds(); renderBgGrid(allBackgrounds); } catch(e) { toast('خطأ','err'); }
}
function renderBgGrid(items) {
  const g=document.getElementById('bg-grid-inner');
  if (!items.length) { g.innerHTML=`<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-image"></i><p>لا توجد خلفيات</p></div>`; return; }
  g.innerHTML=items.map(bg=>`
    <div class="img-card">
      <img src="${bg.public_url||bg.storage_path}" alt="${bg.name}"/>
      <div class="img-card-foot">
        <span>${bg.name}</span>
        ${bg.is_premium?`<span style="color:var(--gold2);font-size:10px">★</span>`:''}
        <button class="ra-btn ra-del" style="width:22px;height:22px" onclick="confirmDelete('حذف ${bg.name}?',()=>deleteBackground('${bg.id}','${bg.storage_path||''}'))"><i class="fa-solid fa-trash"></i></button>
      </div>
      ${bg.is_premium?`<div style="position:absolute;top:6px;right:6px;background:linear-gradient(135deg,var(--gold),#B8860B);color:var(--ink);font-size:8px;font-weight:900;padding:2px 7px;border-radius:3px;display:flex;align-items:center;gap:3px"><svg width="7" height="7" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2l2.4 5h5.1l-4.1 3.1 1.5 5.2L10 12.2l-4.9 3.1 1.5-5.2L2.5 7h5.1z"/></svg>كوبون</div>`:''}
    </div>`).join('');
}
function openBgModal() {
  document.getElementById('bg-edit-id').value=''; document.getElementById('bg-name-inp').value='';
  document.getElementById('bg-files').value=''; document.getElementById('bg-upload-preview').innerHTML='';
  document.getElementById('bg-premium').checked=false;
  openModal('modal-bg');
}
async function saveBackground() {
  const files=document.getElementById('bg-files').files;
  const name=document.getElementById('bg-name-inp').value.trim();
  const cat=document.getElementById('bg-cat-sel').value;
  const prem=document.getElementById('bg-premium').checked;
  if (!files.length) { toast('اختر صورة','err'); return; }
  const btn=document.getElementById('btn-save-bg');
  btn.disabled=true; btn.innerHTML='<div class="spin"></div>';
  document.getElementById('bg-progress').classList.add('vis');
  try {
    const me=await Auth.me(); let saved=0;
    for (let i=0;i<files.length;i++) {
      const up=await Storage.upload('backgrounds',files[i],`bg_${Date.now()}_${i}`);
      const iname=files.length>1?(name||files[i].name.replace(/\.[^/.]+$/,'')):(name||files[i].name);
      await DB.saveBackground({name:iname,category:cat,storage_path:up.path,public_url:up.url,is_premium:prem,is_active:true,sort_order:0,upload_by:me?.id});
      saved++;
      document.getElementById('bg-pfill').style.width=Math.round((saved/files.length)*100)+'%';
    }
    closeModal('modal-bg'); await loadBackgrounds(); await loadOverview(); toast(`تم رفع ${saved} خلفية ✓`,'ok');
  } catch(e) { toast('خطأ: '+e.message,'err'); }
  finally { btn.disabled=false; btn.innerHTML='<i class="fa-solid fa-upload"></i> رفع وحفظ'; document.getElementById('bg-progress').classList.remove('vis'); document.getElementById('bg-pfill').style.width='0%'; }
}
async function deleteBackground(id,path) {
  await DB.deleteBackground(id);
  if (path) await Storage.delete('backgrounds',path).catch(()=>{});
  await loadBackgrounds(); await loadOverview(); toast('تم الحذف ✓','ok');
}

// ══ COUPONS ══════════════════════════════════════════
async function loadCoupons() {
  try {
    const { data: st } = await sb.from('coupon_stats').select('*').single();
    if (st) {
      document.getElementById('cp-available').textContent = st.available??0;
      document.getElementById('cp-used').textContent      = st.used??0;
      document.getElementById('cp-total').textContent     = st.total??0;
    }
    const { data, error } = await sb.from('coupons')
      .select('*').order('created_at',{ascending:false}).limit(500);
    if (error) throw error;
    _allCoupons = data||[];
    _renderCoupons();
  } catch(e) { toast('خطأ: '+e.message,'err'); }
}

function _renderCoupons(search='') {
  let list = _allCoupons;
  if (_cpFilter==='unused') list=list.filter(c=>!c.is_used);
  if (_cpFilter==='used')   list=list.filter(c=> c.is_used);
  if (search) list=list.filter(c=>c.code.includes(search));
  const body=document.getElementById('coupons-body');
  if (!list.length) {
    body.innerHTML=`<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-ticket"></i><p>لا توجد كوبونات</p></div></td></tr>`; return;
  }
  body.innerHTML=list.map(c=>`
    <tr>
      <td><span class="coupon-code">${c.code}</span></td>
      <td>
        ${c.is_used
          ? `<span class="badge badge-rose"><i class="fa-solid fa-check" style="font-size:9px"></i>مستخدم</span>`
          : `<span class="badge badge-teal"><i class="fa-solid fa-circle" style="font-size:6px"></i>متاح</span>`}
      </td>
      <td style="font-size:11px;color:rgba(247,242,232,.35)">${c.used_by?c.used_by.slice(0,10)+'...':'—'}</td>
      <td style="font-size:11px;color:rgba(247,242,232,.3)">
        ${c.image_type==='calligraphy'
          ? `<i class="fa-solid fa-pen-nib" style="color:var(--teal2);margin-left:4px"></i>مخطوطة`
          : c.image_type==='background'
            ? `<i class="fa-solid fa-image" style="color:var(--gold);margin-left:4px"></i>خلفية`
            : '—'}
      </td>
      <td style="font-size:11px;color:rgba(247,242,232,.3)">
        ${c.used_at?new Date(c.used_at).toLocaleDateString('ar-SA'):new Date(c.created_at).toLocaleDateString('ar-SA')}
      </td>
      <td style="font-size:11px;color:rgba(247,242,232,.3)">${c.note||'—'}</td>
      <td>
        <div class="row-actions">
          ${!c.is_used?`<button class="ra-btn" style="color:var(--teal2);background:rgba(42,138,126,.1)" title="نسخ" onclick="navigator.clipboard.writeText('${c.code}');toast('تم النسخ ✓','ok')"><i class="fa-solid fa-copy"></i></button>`:''}
          <button class="ra-btn ra-del" onclick="confirmDelete('حذف الكوبون ${c.code}؟',()=>_deleteCoupon('${c.id}'))"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function filterCoupons(btn,val) {
  document.querySelectorAll('.cp-pill').forEach(b=>b.classList.remove('on')); btn.classList.add('on');
  _cpFilter=val; _renderCoupons(document.getElementById('cp-search')?.value||'');
}
function searchCoupons(v) { _renderCoupons(v.trim()); }

function _makeCode() { let c=String(Math.floor(Math.random()*9)+1); for(let i=0;i<8;i++) c+=Math.floor(Math.random()*10); return c; }

function openGenerateModal() {
  _pendingCodes=[];
  document.getElementById('cp-count').value='10';
  document.getElementById('cp-note').value='';
  previewCouponCodes();
  openModal('modal-coupons');
}

function previewCouponCodes() {
  const n=Math.min(500,Math.max(1,parseInt(document.getElementById('cp-count').value)||10));
  const set=new Set(); let tries=0;
  while(set.size<n&&tries++<3000) set.add(_makeCode());
  _pendingCodes=[...set];
  document.getElementById('cp-preview-list').innerHTML=
    _pendingCodes.slice(0,20).map(c=>`<span class="coupon-code" style="font-size:12px;padding:3px 8px">${c}</span>`).join('')+
    (_pendingCodes.length>20?`<span style="font-size:11px;color:rgba(247,242,232,.25);align-self:center;padding:3px 6px">... و${n-20} آخرين</span>`:'');
}

async function doGenerateCoupons() {
  if (!_pendingCodes.length) { previewCouponCodes(); return; }
  const note=document.getElementById('cp-note').value.trim()||null;
  const btn=document.getElementById('btn-do-generate');
  btn.disabled=true; btn.innerHTML='<div class="spin"></div>';
  try {
    const me=await Auth.me();
    const { error }=await sb.from('coupons').insert(_pendingCodes.map(code=>({code,note,created_by:me?.id})));
    if (error) throw error;
    closeModal('modal-coupons'); await loadCoupons();
    toast(`تم توليد ${_pendingCodes.length} كوبون ✓`,'ok'); _pendingCodes=[];
  } catch(e) { toast(e.message.includes('duplicate')?'بعض الكودات مكررة، أعد المحاولة':e.message,'err'); }
  finally { btn.disabled=false; btn.innerHTML='<i class="fa-solid fa-check"></i> حفظ وتوليد'; }
}

async function _deleteCoupon(id) { await sb.from('coupons').delete().eq('id',id); await loadCoupons(); toast('تم الحذف ✓','ok'); }

function copyCoupons() {
  const av=_allCoupons.filter(c=>!c.is_used).map(c=>c.code);
  if (!av.length) { toast('لا توجد كوبونات متاحة','err'); return; }
  navigator.clipboard.writeText(av.join('\n')); toast(`تم نسخ ${av.length} كوبون ✓`,'ok');
}

function exportCoupons() {
  const h='code,is_used,used_by,image_type,created_at,note';
  const rows=_allCoupons.map(c=>[c.code,c.is_used,c.used_by||'',c.image_type||'',c.created_at,c.note||''].join(','));
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent([h,...rows].join('\n'));
  a.download='coupons.csv'; a.click();
}
// ════════════════════════════════════════════════════

// ══ USERS ══
async function loadUsers() {
  try { allUsers=await DB.getUsers(); renderUsers(allUsers); } catch(e) { toast('خطأ','err'); }
}
function renderUsers(users) {
  const body=document.getElementById('users-body');
  if (!users.length) { body.innerHTML=`<tr><td colspan="5"><div class="empty-state"><i class="fa-solid fa-users"></i><p>لا يوجد مستخدمون</p></div></td></tr>`; return; }
  body.innerHTML=users.map(u=>`
    <tr>
      <td><div style="display:flex;align-items:center;gap:10px">
        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--teal));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:var(--ink)">${(u.full_name||u.username||'?').charAt(0).toUpperCase()}</div>
        <div><div style="font-weight:700">${u.full_name||'—'}</div><div style="font-size:11px;color:rgba(247,242,232,.35)">@${u.username||'—'}</div></div>
      </div></td>
      <td style="color:rgba(247,242,232,.5);font-size:12px">${u.id.slice(0,8)}...</td>
      <td><span class="badge ${u.role==='admin'?'badge-rose':'badge-teal'}">${u.role==='admin'?'أدمن':'مستخدم'}</span></td>
      <td style="font-size:11px;color:rgba(247,242,232,.4)">${new Date(u.created_at).toLocaleDateString('ar-SA')}</td>
      <td><div class="row-actions">
        ${u.role!=='admin'?`<button class="ra-btn ra-edit" title="ترقية" onclick="promoteUser('${u.id}')"><i class="fa-solid fa-user-shield"></i></button>`:''}
      </div></td>
    </tr>`).join('');
}
function filterUsers(q) { renderUsers(allUsers.filter(u=>(u.full_name||'').includes(q)||(u.username||'').includes(q))); }
async function promoteUser(id) {
  if (!confirm('ترقية هذا المستخدم لأدمن؟')) return;
  await sb.from('profiles').update({role:'admin'}).eq('id',id);
  await loadUsers(); toast('تم الترقية ✓','ok');
}

// ══ ACTIVITY ══
async function loadActivity() {
  try {
    const { data }=await sb.from('activity_log').select('*, profiles(username)').order('created_at',{ascending:false}).limit(50);
    const body=document.getElementById('activity-body');
    if (!data?.length) { body.innerHTML=`<tr><td colspan="4"><div class="empty-state"><i class="fa-solid fa-clock-rotate-left"></i><p>لا توجد سجلات</p></div></td></tr>`; return; }
    body.innerHTML=data.map(r=>`
      <tr>
        <td style="font-size:11px;color:rgba(247,242,232,.4);white-space:nowrap">${new Date(r.created_at).toLocaleString('ar-SA')}</td>
        <td>${r.profiles?.username||'—'}</td>
        <td><span class="badge badge-gold">${r.action}</span></td>
        <td style="font-size:11px;color:rgba(247,242,232,.3)">${r.entity_type||''} ${r.details?JSON.stringify(r.details).slice(0,60):''}</td>
      </tr>`).join('');
  } catch(e){}
}

// ══ FILE PREVIEW ══
function previewFiles(input,type) {
  const prev=document.getElementById(type+'-upload-preview');
  prev.innerHTML=''; prev.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-top:12px';
  Array.from(input.files).forEach(f=>{
    const r=new FileReader();
    r.onload=e=>{
      const d=document.createElement('div');
      d.style.cssText='position:relative;width:70px;height:70px;border-radius:8px;overflow:hidden;border:1px solid var(--border)';
      d.innerHTML=`<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover"/>`;
      prev.appendChild(d);
    };
    r.readAsDataURL(f);
  });
}

// ══ MODALS ══
function openModal(id) { document.getElementById(id).classList.add('on'); }
function closeModal(id) { document.getElementById(id).classList.remove('on'); }
function confirmDelete(msg,fn) {
  document.getElementById('confirm-msg').textContent=msg;
  document.getElementById('btn-confirm-del').onclick=()=>{ closeModal('modal-confirm'); fn(); };
  openModal('modal-confirm');
}
document.querySelectorAll('.modal-overlay').forEach(o=>o.addEventListener('click',e=>{ if(e.target===o) o.classList.remove('on'); }));

// ══ TOAST ══
function toast(msg,type='') {
  const t=document.getElementById('dash-toast');
  t.textContent=msg; t.className='vis '+type;
  clearTimeout(t._t); t._t=setTimeout(()=>t.className=type,2800);
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