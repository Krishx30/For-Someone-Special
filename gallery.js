document.addEventListener('DOMContentLoaded', () => {

    // ── Midnight theme ──────────────────────────────────────────────────────
    if (new Date().getHours() < 5) document.body.classList.add('midnight-theme');

    // ── Audio ────────────────────────────────────────────────────────────────
    const audio       = document.getElementById('bg-music');
    const vinylDisc   = document.getElementById('vinyl-icon');
    const vinylToggle = document.getElementById('vinyl-toggle');
    const vinylLabel  = document.getElementById('vinyl-label');

    let isPlaying = false;
    audio.volume  = 0;

    function setVinylState(playing) {
        isPlaying = playing;
        vinylDisc.classList.toggle('spinning', playing);
        vinylLabel.textContent = playing ? '♫ playing' : '▶ play';
        vinylLabel.classList.toggle('playing', playing);
        localStorage.setItem('musicPlaying', playing ? 'true' : 'false');
    }

    // Resume seamlessly from index.html
    if (localStorage.getItem('musicPlaying') === 'true') {
        const saved = parseFloat(localStorage.getItem('audioTime') || '0');
        if (saved) audio.currentTime = saved;
        audio.volume = 0.5;
        audio.play()
            .then(() => setVinylState(true))
            .catch(() => setVinylState(false));
    }

    vinylToggle.addEventListener('click', () => {
        if (isPlaying) {
            fadeOut(); setVinylState(false);
        } else {
            audio.play().then(() => { fadeIn(); setVinylState(true); });
        }
    });

    audio.addEventListener('timeupdate', () => {
        if (isPlaying) localStorage.setItem('audioTime', audio.currentTime);
    });

    function fadeIn() {
        let v = 0; audio.volume = 0;
        const t = setInterval(() => {
            v = Math.min(v + 0.05, 0.5); audio.volume = v;
            if (v >= 0.5) clearInterval(t);
        }, 100);
    }
    function fadeOut() {
        let v = audio.volume;
        const t = setInterval(() => {
            v = Math.max(v - 0.05, 0); audio.volume = v;
            if (v <= 0) { audio.pause(); clearInterval(t); }
        }, 100);
    }

    // ── Back link (preserve music state) ─────────────────────────────────────
    const backLink = document.getElementById('back-link');
    if (backLink) {
        backLink.addEventListener('click', e => {
            e.preventDefault();
            document.body.classList.add('page-exit');
            setTimeout(() => { window.location.href = backLink.href; }, 400);
        });
    }

    // ── Polaroid cards — set --rot BEFORE adding .visible ────────────────────
    const cards = Array.from(document.querySelectorAll('.polaroid-card'));

    cards.forEach((card, i) => {
        const rot = parseFloat(card.dataset.rot || '0');
        card.style.setProperty('--rot', rot + 'deg');
        setTimeout(() => card.classList.add('visible'), 80 + i * 110);
    });

    // ── Lightbox ──────────────────────────────────────────────────────────────
    const overlay      = document.getElementById('lightbox-overlay');
    const lbImg        = document.getElementById('lightbox-img');
    const lbCaption    = document.getElementById('lightbox-caption');
    const lbClose      = document.getElementById('lightbox-close');
    const lbBackdrop   = document.getElementById('lightbox-backdrop');
    const lbPrev       = document.getElementById('lightbox-prev');
    const lbNext       = document.getElementById('lightbox-next');
    const dotsWrap     = document.getElementById('lightbox-dots');

    const imgEls   = cards.map(c => c.querySelector('.polaroid-img'));
    const captions = cards.map(c => (c.querySelector('.polaroid-caption') || {}).textContent || '');
    let current    = 0;

    lbImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

    // Build dots
    cards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'lightbox-dot';
        dot.setAttribute('aria-label', 'Photo ' + (i + 1));
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
    });

    function syncDots() {
        dotsWrap.querySelectorAll('.lightbox-dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
        });
    }

    function goTo(idx) {
        current = ((idx % cards.length) + cards.length) % cards.length;
        lbImg.style.opacity = '0';
        lbImg.style.transform = 'scale(0.96)';
        setTimeout(() => {
            lbImg.src = imgEls[current].src;
            lbCaption.textContent = captions[current];
            lbImg.style.opacity = '1';
            lbImg.style.transform = 'scale(1)';
        }, 200);
        syncDots();
    }

    function openLightbox(idx) {
        current = idx;
        lbImg.src = imgEls[idx].src;
        lbCaption.textContent = captions[idx];
        syncDots();
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    cards.forEach((card, i) => card.addEventListener('click', () => openLightbox(i)));
    lbClose.addEventListener('click', closeLightbox);
    lbBackdrop.addEventListener('click', closeLightbox);
    lbNext.addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); });
    lbPrev.addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); });

    window.addEventListener('keydown', e => {
        if (!overlay.classList.contains('active')) return;
        if (e.key === 'ArrowRight') goTo(current + 1);
        else if (e.key === 'ArrowLeft') goTo(current - 1);
        else if (e.key === 'Escape') closeLightbox();
    });

    // Swipe support
    let swipeX = 0;
    overlay.addEventListener('touchstart', e => { swipeX = e.changedTouches[0].screenX; }, { passive: true });
    overlay.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].screenX - swipeX;
        if (dx < -50) goTo(current + 1);
        else if (dx > 50) goTo(current - 1);
    });

    // ── Easter egg ────────────────────────────────────────────────────────────
    const secretBtn  = document.getElementById('secret-trigger');
    const eeOverlay  = document.getElementById('easter-egg-overlay');
    const eeBackdrop = document.getElementById('ee-backdrop');
    const eeClose    = document.getElementById('secret-close');
    const eeVideo    = document.getElementById('secret-video');
    const heartSvg   = secretBtn ? secretBtn.querySelector('.pixel-heart-sm') : null;

    let taps = 0, tapTimer;

    if (secretBtn) {
        secretBtn.addEventListener('click', () => {
            taps++;
            if (heartSvg) {
                heartSvg.classList.remove('pulse');
                void heartSvg.offsetWidth;
                heartSvg.classList.add('pulse');
            }
            clearTimeout(tapTimer);
            if (taps >= 5) {
                taps = 0;
                if (isPlaying) { fadeOut(); setVinylState(false); }
                eeOverlay.classList.add('active');
                eeOverlay.setAttribute('aria-hidden', 'false');
                eeVideo.play().catch(() => {});
            } else {
                tapTimer = setTimeout(() => { taps = 0; }, 1000);
            }
        });
    }

    function closeEE() {
        eeOverlay.classList.remove('active');
        eeOverlay.setAttribute('aria-hidden', 'true');
        eeVideo.pause();
        eeVideo.currentTime = 0;
    }

    if (eeClose)    eeClose.addEventListener('click', closeEE);
    if (eeBackdrop) eeBackdrop.addEventListener('click', closeEE);

    // ── Background petal canvas ───────────────────────────────────────────────
    const canvas = document.getElementById('falling-petals');
    const ctx    = canvas.getContext('2d');
    let W, H;
    const petals = [];
    let mx = -1000, my = -1000;

    window.addEventListener('mousemove',  e => { mx = e.clientX; my = e.clientY; });
    window.addEventListener('touchmove',  e => { if (e.touches.length) { mx = e.touches[0].clientX; my = e.touches[0].clientY; } }, { passive: true });
    window.addEventListener('mouseout',   () => { mx = -1000; my = -1000; });

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();

    const TYPES = ['dot', 'sparkle', 'heart'];

    class Petal {
        constructor(init) {
            this.type = TYPES[Math.random() < 0.55 ? 0 : Math.random() < 0.5 ? 1 : 2];
            this.reset();
            if (init) this.y = Math.random() * H;
        }
        reset() {
            this.x  = Math.random() * W;
            this.y  = -20;
            this.sz = Math.random() * 3 + 1.5;
            this.vy = Math.random() * 0.65 + 0.35;
            this.vx = Math.random() * 0.35 - 0.175;
            this.a  = Math.random() * Math.PI * 2;
            this.da = (Math.random() - 0.5) * 0.035;
            const alpha = Math.random() * 0.2 + 0.06;
            const rgb   = Math.random() < 0.65 ? '255,42,95' : Math.random() < 0.5 ? '195,155,211' : '255,182,193';
            this.color  = `rgba(${rgb},${alpha})`;
        }
        update() {
            this.y += this.vy;
            this.x += this.vx + Math.sin(this.y * 0.007) * 0.3;
            this.a += this.da;
            const dx = mx - this.x, dy = my - this.y;
            const d  = Math.hypot(dx, dy);
            if (d < 110 && d > 0) {
                const f = (110 - d) / 110;
                this.x -= (dx / d) * f * 3;
                this.y -= (dy / d) * f * 3;
            }
            if (this.y > H + 30) this.reset();
        }
        draw() {
            ctx.save();
            ctx.fillStyle = ctx.strokeStyle = this.color;
            if (this.type === 'dot') {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.sz, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 'sparkle') {
                ctx.translate(this.x, this.y);
                ctx.rotate(this.a);
                ctx.lineWidth = 1;
                for (let k = 0; k < 4; k++) {
                    ctx.beginPath();
                    ctx.moveTo(0, -this.sz * 1.4);
                    ctx.lineTo(0,  this.sz * 1.4);
                    ctx.stroke();
                    ctx.rotate(Math.PI / 4);
                }
            } else {
                ctx.translate(this.x, this.y);
                const u = this.sz * 0.48;
                ctx.fillRect(-u*2, -u*2,  u*2, u);
                ctx.fillRect( u,   -u*2,  u*2, u);
                ctx.fillRect(-u*3, -u,    u*6, u*2);
                ctx.fillRect(-u*2,  u,    u*5, u);
                ctx.fillRect(-u,    u*2,  u*3, u);
                ctx.fillRect( 0,    u*3,  u,   u);
            }
            ctx.restore();
        }
    }

    for (let i = 0; i < 65; i++) petals.push(new Petal(true));

    (function loop() {
        ctx.clearRect(0, 0, W, H);
        petals.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(loop);
    })();
});