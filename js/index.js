        // 4. نظام السلايدر (أزرار وسحب بالماوس)
const slider = document.getElementById('occasions-slider');
const slideLeftBtn = document.getElementById('slide-left');
const slideRightBtn = document.getElementById('slide-right');

if (slider && slideRightBtn && slideLeftBtn) {
    const scrollAmount = 324; // عرض الكارت + المسافة

    // التحكم بالأزرار (عشان الموقع RTL، الاتجاهات معكوسة برمجياً)
    slideRightBtn.addEventListener('click', () => {
        slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    slideLeftBtn.addEventListener('click', () => {
        slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // التحكم بالسحب (Drag to scroll) للكمبيوتر
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        // إيقاف الـ snap مؤقتاً أثناء السحب لسهولة الحركة
        slider.style.scrollSnapType = 'none'; 
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'grab';
        slider.style.scrollSnapType = 'x mandatory';
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'grab';
        slider.style.scrollSnapType = 'x mandatory';
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // سرعة السحب
        slider.scrollLeft = scrollLeft - walk;
    });
}
        // 1. التحكم في القائمة الجانبية للموبايل
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');

        // btn.addEventListener('click', () => {
        //     menu.classList.toggle('hidden');
        // });

        // 2. إضافة تأثير Blur للناف بار عند النزول
        window.addEventListener('scroll', () => {
            const nav = document.getElementById('navbar');
            if (window.scrollY > 20) {
                nav.classList.add('shadow-sm');
            } else {
                nav.classList.remove('shadow-sm');
            }
        });

        // 3. نظام الأسئلة الشائعة (FAQ Accordion)
        document.querySelectorAll('.faq-item').forEach(item => {
            item.addEventListener('click', () => {
                const answer = item.querySelector('.faq-answer');
                const icon = item.querySelector('.faq-icon');
                
                // لو هو مفتوح، اقفله
                if (!answer.classList.contains('hidden')) {
                    answer.classList.add('hidden');
                    icon.style.transform = 'rotate(0deg)';
                } else {
                    // اقفل كل الباقيين الأول
                    document.querySelectorAll('.faq-answer').forEach(ans => ans.classList.add('hidden'));
                    document.querySelectorAll('.faq-icon').forEach(ic => ic.style.transform = 'rotate(0deg)');
                    
                    // افتح اللي ضغطت عليه
                    answer.classList.remove('hidden');
                    icon.style.transform = 'rotate(180deg)';
                }
            });
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