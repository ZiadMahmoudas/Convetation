// ── Update guest counter ──
document.getElementById('guest-remaining').textContent = Guest.remaining();

// ── Tab switch ──
function switchTab(t) {
  ['login','reg'].forEach(x => {
    document.getElementById('tab-' + x).classList.toggle('on', x === t);
    document.getElementById('panel-' + x).classList.toggle('on', x === t);
  });
}

// ── Password visibility ──
function togglePass(id, btn) {
  const inp = document.getElementById(id);
  const isText = inp.type === 'text';
  inp.type = isText ? 'password' : 'text';
  btn.querySelector('i').className = isText ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
}

// ── Password strength ──
function checkStrength(inp) {
  const v = inp.value;
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  const cls = score <= 1 ? 'weak' : score <= 2 ? 'med' : 'str';
  for (let i=1;i<=4;i++) {
    const bar = document.getElementById('bar'+i);
    bar.className = 'pw-bar ' + (i <= score ? cls : '');
  }
}

// ── Field validation helpers ──
function setErr(id, msg) {
  const inp = document.getElementById(id);
  const err = document.getElementById(id+'-err');
  if (msg) { inp.classList.add('err'); if(err){err.textContent=msg;err.classList.add('vis');} }
  else     { inp.classList.remove('err'); if(err){err.classList.remove('vis');} }
}
function clearErrs(...ids) { ids.forEach(id => setErr(id, '')); }

function toast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'vis ' + type;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.className = type, 2800);
}

function setLoading(btnId, loading, label='') {
  const btn = document.getElementById(btnId);
  btn.disabled = loading;
  btn.innerHTML = loading
    ? '<div class="spin"></div> جاري التحقق...'
    : label;
}

// ── LOGIN ──
async function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value;
  clearErrs('l-email','l-pass');
  let valid = true;
  if (!email || !/\S+@\S+\.\S+/.test(email)) { setErr('l-email','بريد إلكتروني غير صحيح'); valid=false; }
  if (!pass || pass.length < 6)               { setErr('l-pass','كلمة المرور قصيرة جداً'); valid=false; }
  if (!valid) return;

  setLoading('btn-login', true);
  try {
    await Auth.login({ email, password: pass });
    toast('مرحباً بك! جاري التوجيه...', 'ok');

    // Check admin role
    const me = await Auth.me();
    setTimeout(() => {
      window.location.href = me?.profile?.role === 'admin'
        ? '/admin/dashboard.html'
        : '/index.html';
    }, 800);
  } catch(e) {
    toast('خطأ: ' + (e.message === 'Invalid login credentials' ? 'بيانات خاطئة' : e.message), 'err');
  } finally {
    setLoading('btn-login', false, '<i class="fa-solid fa-right-to-bracket"></i> دخول');
  }
}

// ── REGISTER ──
async function doRegister() {
  const name  = document.getElementById('r-name').value.trim();
  const user  = document.getElementById('r-user').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const pass  = document.getElementById('r-pass').value;
  clearErrs('r-name','r-user','r-email','r-pass');
  let valid = true;
  if (!name)                                  { setErr('r-name','أدخل اسمك الكامل'); valid=false; }
  if (!user || user.length < 3)               { setErr('r-user','اسم المستخدم قصير'); valid=false; }
  if (!email || !/\S+@\S+\.\S+/.test(email)) { setErr('r-email','بريد إلكتروني غير صحيح'); valid=false; }
  if (!pass || pass.length < 8)               { setErr('r-pass','8 أحرف على الأقل'); valid=false; }
  if (!valid) return;

  setLoading('btn-reg', true);
  try {
    await Auth.register({ email, password: pass, username: user, fullName: name });
    toast('تم إنشاء حسابك! تفقد بريدك للتأكيد', 'ok');
    setTimeout(() => switchTab('login'), 2000);
  } catch(e) {
    const msg = e.message.includes('already registered') ? 'البريد مستخدم بالفعل' : e.message;
    toast('خطأ: ' + msg, 'err');
  } finally {
    setLoading('btn-reg', false, '<i class="fa-solid fa-user-plus"></i> إنشاء الحساب');
  }
}

// Enter key support
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const active = document.querySelector('.form-panel.on')?.id;
  if (active === 'panel-login') doLogin();
  else doRegister();
});

// Redirect if already logged in
(async () => {
  const session = await Auth.session();
  if (session) {
    const me = await Auth.me();
    window.location.href = me?.profile?.role === 'admin' ? '/admin/dashboard.html' : '/index.html';
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