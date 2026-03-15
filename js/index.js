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