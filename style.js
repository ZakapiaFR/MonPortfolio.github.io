/* Portfolio — Erwan PAULOIN */
(() => {
    'use strict';
    document.documentElement.classList.add('js');

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];

    /* ---------- Année du footer ---------- */
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();

    /* ---------- Menu mobile ---------- */
    const burger = $('.burger');
    const menu = $('.menu');
    const closeMenu = () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
    burger.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
    });
    $$('a', menu).forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    /* ---------- Apparition au scroll ---------- */
    const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
            if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(el => io.observe(el));

    /* ---------- Lien actif dans le menu ---------- */
    const links = $$('.menu a');
    const spy = new IntersectionObserver((entries) => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(s => spy.observe(s));

    /* ---------- Scroll : barre de progression, nav, parallaxe ---------- */
    const nav = $('#nav');
    const progress = $('.progress');
    const heroBg = $('.hero-bg');
    let ticking = false;
    const onScroll = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
        nav.classList.toggle('scrolled', y > 24);
        if (!reduce && heroBg && y < window.innerHeight * 1.2) heroBg.style.setProperty('--py', (y * 0.25) + 'px');
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    /* ---------- Halo qui suit la souris ---------- */
    const glow = $('.glow');
    if (glow && !reduce && window.matchMedia('(pointer: fine)').matches) {
        window.addEventListener('pointermove', e => {
            glow.style.setProperty('--mx', e.clientX + 'px');
            glow.style.setProperty('--my', e.clientY + 'px');
        }, { passive: true });
    }

    /* ---------- Inclinaison 3D des cartes ---------- */
    if (!reduce && window.matchMedia('(pointer: fine)').matches) {
        $$('.tilt').forEach(el => {
            el.addEventListener('pointermove', e => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                el.style.transition = 'transform .08s linear, border-color .3s, box-shadow .3s';
                el.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`;
            });
            el.addEventListener('pointerleave', () => {
                el.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1), border-color .3s, box-shadow .3s';
                el.style.transform = '';
            });
        });
    }

    /* ---------- Effet machine à écrire ---------- */
    const typed = $('#typed');
    if (typed) {
        const words = ['Java & Python', 'développement web', 'bases de données', 'résolution de problèmes'];
        if (reduce) {
            typed.textContent = words[0];
        } else {
            let w = 0, c = 0, del = false;
            const tick = () => {
                const word = words[w];
                typed.textContent = word.slice(0, c);
                if (!del && c < word.length) { c++; setTimeout(tick, 70); }
                else if (!del) { del = true; setTimeout(tick, 1600); }
                else if (c > 0) { c--; setTimeout(tick, 35); }
                else { del = false; w = (w + 1) % words.length; setTimeout(tick, 350); }
            };
            tick();
        }
    }

    /* ---------- Pétales de sakura (canvas) ---------- */
    const canvas = $('#sakura');
    if (canvas && !reduce) {
        const ctx = canvas.getContext('2d');
        let W, H, dpr;
        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth; H = window.innerHeight;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener('resize', resize);

        const COUNT = W < 720 ? 18 : 38;
        const rand = (a, b) => a + Math.random() * (b - a);
        const make = (initial) => ({
            x: rand(0, W),
            y: initial ? rand(-H, H) : rand(-80, -10),
            s: rand(7, 15),            // taille
            vy: rand(0.5, 1.4),        // vitesse de chute
            vx: rand(-0.3, 0.5),       // dérive
            r: rand(0, Math.PI * 2),   // rotation
            vr: rand(-0.02, 0.02),
            sw: rand(0, Math.PI * 2),  // phase d'oscillation
            sa: rand(0.4, 1.2),        // amplitude d'oscillation
            o: rand(0.35, 0.85),
            hue: Math.random() < 0.7 ? 350 : 340
        });
        const petals = Array.from({ length: COUNT }, () => make(true));

        const draw = (p) => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.r);
            ctx.globalAlpha = p.o;
            const g = ctx.createRadialGradient(0, 0, 1, 0, 0, p.s);
            g.addColorStop(0, `hsla(${p.hue}, 100%, 88%, 1)`);
            g.addColorStop(1, `hsla(${p.hue}, 90%, 68%, .9)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            // forme de pétale avec petite encoche
            ctx.moveTo(0, -p.s);
            ctx.bezierCurveTo(p.s * 0.9, -p.s * 0.8, p.s * 0.8, p.s * 0.6, 0, p.s);
            ctx.bezierCurveTo(-p.s * 0.8, p.s * 0.6, -p.s * 0.9, -p.s * 0.8, 0, -p.s);
            ctx.fill();
            ctx.restore();
        };

        let running = true;
        document.addEventListener('visibilitychange', () => {
            running = !document.hidden;
            if (running) requestAnimationFrame(loop);
        });

        function loop() {
            if (!running) return;
            ctx.clearRect(0, 0, W, H);
            for (let i = 0; i < petals.length; i++) {
                const p = petals[i];
                p.sw += 0.02;
                p.x += p.vx + Math.sin(p.sw) * p.sa;
                p.y += p.vy;
                p.r += p.vr;
                if (p.y > H + 30 || p.x > W + 40 || p.x < -40) petals[i] = make(false);
                else draw(p);
            }
            requestAnimationFrame(loop);
        }
        loop();
    }
})();
