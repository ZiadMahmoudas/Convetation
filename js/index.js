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
window.addEventListener('scroll', () => {
  document.getElementById('nav').style.background =
    window.scrollY > 30 ? 'rgba(13,17,23,.97)' : 'rgba(13,17,23,.85)';
});

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