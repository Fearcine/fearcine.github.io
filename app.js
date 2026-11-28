(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  let toastTimer = null;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  document.documentElement.classList.add('js');
  const popupOverlay = $('#popupOverlay');
  const popupDismiss = $('#popupDismiss');
  const pageContent = $('#pageContent');
  popupOverlay.classList.add('is-open');

  function dismissPopup() {
    popupOverlay.classList.remove('is-open');
    pageContent.classList.add('is-visible');
    setTimeout(triggerCharIntro, 300);
  }

  popupDismiss.addEventListener('click', dismissPopup);
  popupOverlay.addEventListener('click', (e) => { if (e.target === popupOverlay) dismissPopup(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && popupOverlay.classList.contains('is-open')) dismissPopup(); });

  const nav = $('#siteNav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 12);
  }, { passive: true });

  let typeTimer = null;
  let charReady = false;

  function triggerCharIntro() {
    const img = $('#charImg');
    const bubble = $('#charBubble');
    img.classList.add('is-visible');

    setTimeout(() => {
      bubble.classList.add('is-visible');
      typeText("Welcome Teabags! have a loook around here !", $('#charText'));
      charReady = true;
    }, 600);
  }

  function typeText(text, el) {
    clearTimeout(typeTimer);
    el.innerHTML = '';
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';

    function type() {
      if (i < text.length) {
        el.textContent = text.slice(0, i + 1);
        el.appendChild(cursor);
        i++;
        typeTimer = setTimeout(type, 36 + Math.random() * 24);
      }
    }
    type();
  }

  function popText(text, el) {
    clearTimeout(typeTimer);
    const bubble = el.closest('.char-bubble');
    el.classList.add('is-fading');

    typeTimer = setTimeout(() => {
      el.textContent = text;
      el.classList.remove('is-fading');
      if (bubble) {
        bubble.classList.remove('is-pop');
        void bubble.offsetWidth;
        bubble.classList.add('is-pop');
      }
    }, 140);
  }

  (function initCharShake() {
    const charWrap = $('#charImg');
    const charText = $('#charText');
    const secretDrop = $('#secretDrop');

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let lastClientX = 0;
    let lastClientY = 0;
    let prevDx = 0;
    let prevDy = 0;
    let shakeEnergy = 0;
    let decayRaf = null;

    let stage = 0;
    let lastStageAt = 0;

    function clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    }

    function setCharOffset(x, y, r) {
      charWrap.style.setProperty('--char-x', `${x.toFixed(1)}px`);
      charWrap.style.setProperty('--char-y', `${y.toFixed(1)}px`);
      charWrap.style.setProperty('--char-r', `${r.toFixed(2)}deg`);
    }

    function resetCharOffset() {
      charWrap.classList.remove('is-interacting', 'is-dragging');
      setCharOffset(0, 0, 0);
    }

    function startDecay() {
      if (decayRaf) return;
      function tick() {
        shakeEnergy = Math.max(0, shakeEnergy * 0.9 - 0.8);
        if (shakeEnergy > 0.5) {
          decayRaf = requestAnimationFrame(tick);
        } else {
          shakeEnergy = 0;
          decayRaf = null;
        }
      }
      decayRaf = requestAnimationFrame(tick);
    }

    function triggerEasterEgg() {
      const now = performance.now();

      if (stage === 0 && shakeEnergy >= 45) {
        stage = 1;
        lastStageAt = now;
        shakeEnergy = 0;
        popText('tf you doing.', charText);
      } else if (stage === 1 && now - lastStageAt > 1200 && shakeEnergy >= 68) {
        stage = 2;
        lastStageAt = now;
        shakeEnergy = 0;
        secretDrop.classList.add('is-dropped');
        popText('ohh shit.. dont look!', charText);

        setTimeout(() => {
          secretDrop.classList.remove('is-dropped');
          popText("you didn't see anything... ", charText);
          stage = 3;
          lastStageAt = performance.now();
          shakeEnergy = 0;
        }, 4500);
      } else if (stage === 3 && now - lastStageAt > 1600 && shakeEnergy >= 50) {
        stage = 4;
        lastStageAt = now;
        shakeEnergy = 0;
        popText('dont even dare.', charText);
      } else if (stage === 4 && now - lastStageAt > 1600 && shakeEnergy >= 55) {
        stage = 5;
        lastStageAt = now;
        shakeEnergy = 0;
        popText('thats enough!. do u wanna buy from store or not.', charText);
      }
    }

    charWrap.addEventListener('dragstart', (e) => e.preventDefault());

    charWrap.addEventListener('pointerdown', (e) => {
      if (!charReady) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      prevDx = 0;
      prevDy = 0;
      charWrap.classList.add('is-dragging');
      charWrap.setPointerCapture(e.pointerId);
    });

    charWrap.addEventListener('pointermove', (e) => {
      if (!charReady || !isDragging) return;

      const dx = e.clientX - lastClientX;
      const dy = e.clientY - lastClientY;
      lastClientX = e.clientX;
      lastClientY = e.clientY;

      const dist = Math.hypot(dx, dy);
      if (dist > 2) {
        const reversedX = (dx > 2 && prevDx < -2) || (dx < -2 && prevDx > 2);
        const reversedY = (dy > 2 && prevDy < -2) || (dy < -2 && prevDy > 2);
        const bonus = (reversedX || reversedY) ? 16 : 0;
        shakeEnergy = Math.min(180, shakeEnergy + dist * 0.45 + bonus);
        prevDx = dx;
        prevDy = dy;
        startDecay();
        triggerEasterEgg();
      }

      const ox = clamp((e.clientX - dragStartX) * 0.65, -50, 50);
      const oy = clamp((e.clientY - dragStartY) * 0.45, -28, 28);
      const rot = clamp(ox * 0.07, -4, 4);
      setCharOffset(ox, oy, rot);
    });

    function endDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      if (charWrap.hasPointerCapture(e.pointerId)) {
        charWrap.releasePointerCapture(e.pointerId);
      }
      resetCharOffset();
    }

    charWrap.addEventListener('pointerup', endDrag);
    charWrap.addEventListener('pointercancel', endDrag);
  })();

  (function initChilies() {
    const chiliLayer = $('#chiliLayer');
    const charWrap = $('#charImg');
    const charText = $('#charText');

    const CHILI_COUNT = 10;
    const happyLines = [
      'Mhmmm~ So Gooood.',
      'Keep it comming~',
      'I love spicey food my dude.',
      'mmmhfg~~ imagine this with vegan mala.',
      'I can eat this daily',
      'i am spicy bitch.'
    ];
    let happyIdx = 0;

    const eatAudio = new Audio('eat.mp3');
    eatAudio.preload = 'auto';
    eatAudio.volume = 0.4;
    eatAudio.load();
    let eatStopTimer = null;

    let eatCtx = null;
    let eatBuffer = null;
    let eatSource = null;

    function preloadEatBuffer() {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx || eatBuffer) return;
      if (!eatCtx) eatCtx = new AudioCtx();
      fetch('eat.mp3')
        .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject()))
        .then((buf) => eatCtx.decodeAudioData(buf))
        .then((decoded) => {
          eatBuffer = decoded;
        })
        .catch(() => { });
    }

    function unlockEatAudio() {
      if (eatCtx && eatCtx.state === 'suspended') {
        eatCtx.resume().catch(() => { });
      }
      if (!eatBuffer) preloadEatBuffer();
    }

    preloadEatBuffer();
    document.addEventListener('pointerdown', unlockEatAudio, { once: true, passive: true });

    function playEatSound() {
      try {
        if (eatCtx && eatBuffer) {
          if (eatCtx.state === 'suspended') {
            eatCtx.resume().catch(() => { });
          }
          if (eatSource) {
            try { eatSource.stop(); } catch (_) { }
          }
          const src = eatCtx.createBufferSource();
          const gain = eatCtx.createGain();
          gain.gain.value = 0.4;
          src.buffer = eatBuffer;
          src.connect(gain);
          gain.connect(eatCtx.destination);
          const dur = eatBuffer.duration;
          const offset = dur > 1 ? Math.random() * (dur - 1) : 0;
          src.start(0, offset, Math.min(1, dur));
          eatSource = src;
          return;
        }

        clearTimeout(eatStopTimer);
        eatAudio.pause();
        eatAudio.volume = 0.4;
        if (Number.isFinite(eatAudio.duration) && eatAudio.duration > 1) {
          const maxStart = Math.max(0, eatAudio.duration - 1);
          eatAudio.currentTime = Math.random() * maxStart;
        } else {
          eatAudio.currentTime = 0;
        }
        eatAudio.play().catch(() => { });
        eatStopTimer = setTimeout(() => {
          eatAudio.pause();
        }, 1000);
      } catch (_) {
      }
    }

    function spawnEatParticles() {
      const rect = charWrap.getBoundingClientRect();
      const mouthX = rect.left + rect.width * 0.48;
      const mouthY = rect.top + rect.height * 0.17;
      const palette = ['#E63946', '#D14040', '#FF5C5C', '#B8232E', '#6B8E23'];

      function spawnBurst(count) {
        for (let i = 0; i < count; i++) {
          const p = document.createElement('div');
          p.className = 'eat-particle';
          const size = 6 + Math.floor(Math.random() * 5);
          p.style.width = `${size}px`;
          p.style.height = `${size}px`;
          p.style.background = palette[Math.random() < 0.85 ? Math.floor(Math.random() * 4) : 4];
          document.body.appendChild(p);

          let x = mouthX + (Math.random() - 0.5) * 14;
          let y = mouthY + (Math.random() - 0.5) * 8;
          let vx = (Math.random() - 0.5) * 3.8;
          let vy = -1.8 - Math.random() * 2.2;
          let rot = Math.random() * 360;
          const vrot = (Math.random() - 0.5) * 12;
          let life = 0;
          const maxLife = 36 + Math.floor(Math.random() * 14);

          function step() {
            life++;
            vy += 0.36;
            x += vx;
            y += vy;
            rot += vrot;
            const alpha = Math.max(0, 1 - Math.max(0, life - maxLife * 0.55) / (maxLife * 0.45));
            p.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(0)}deg)`;
            p.style.opacity = alpha.toFixed(2);

            if (life < maxLife) {
              requestAnimationFrame(step);
            } else {
              p.remove();
            }
          }

          p.style.left = '0px';
          p.style.top = '0px';
          requestAnimationFrame(step);
        }
      }

      spawnBurst(7);
      setTimeout(() => spawnBurst(6), 100);
      setTimeout(() => spawnBurst(6), 200);
    }

    function isNearMouth(clientX, clientY) {
      if (!charReady) return false;
      const rect = charWrap.getBoundingClientRect();
      const mouthX = rect.left + rect.width * 0.48;
      const mouthY = rect.top + rect.height * 0.17;
      const radius = Math.max(58, rect.width * 0.25);
      return Math.hypot(clientX - mouthX, clientY - mouthY) <= radius;
    }

    function getLayoutOffset(el) {
      let x = 0;
      let y = 0;
      let cur = el;
      while (cur) {
        x += cur.offsetLeft;
        y += cur.offsetTop;
        cur = cur.offsetParent;
      }
      return { left: x, top: y, width: el.offsetWidth, height: el.offsetHeight };
    }

    function getObstacles(excludeEl, chiliPad = 8) {
      const layerPos = getLayoutOffset(chiliLayer);
      const rects = [];
      const selectors = '.shop-card, .wheel-card, .apology-letter, .about-card, .char-img-wrap, .char-bubble, .sec-head h2, .site-footer';
      $$(selectors).forEach((el) => {
        const pos = getLayoutOffset(el);
        if (pos.width === 0 || pos.height === 0) return;
        const pad = (el.matches('.char-img-wrap, .char-bubble')) ? 24 : 14;
        rects.push({
          left: pos.left - layerPos.left - pad,
          top: pos.top - layerPos.top - pad,
          right: pos.left - layerPos.left + pos.width + pad,
          bottom: pos.top - layerPos.top + pos.height + pad
        });
      });
      chiliLayer.querySelectorAll('.chili-item').forEach((other) => {
        if (other === excludeEl || other.classList.contains('is-eaten')) return;
        const left = parseFloat(other.style.left);
        const top = parseFloat(other.style.top);
        const w = other.offsetWidth || 56;
        const h = other.offsetHeight || w;
        if (Number.isNaN(left) || Number.isNaN(top)) return;
        rects.push({
          left: left - chiliPad,
          top: top - chiliPad,
          right: left + w + chiliPad,
          bottom: top + h + chiliPad
        });
      });
      return rects;
    }

    function overlapsAny(x, y, w, h, obstacles, layerW, layerH) {
      if (x < 10 || y < 14 || x + w > layerW - 10 || y + h > layerH - 14) return true;
      for (let i = 0; i < obstacles.length; i++) {
        const o = obstacles[i];
        if (x < o.right && x + w > o.left && y < o.bottom && y + h > o.top) {
          return true;
        }
      }
      return false;
    }

    function repelFromObstacles(startX, startY, w, h, obstacles, layerW, layerH) {
      let x = Math.max(10, Math.min(layerW - w - 10, startX));
      let y = Math.max(14, Math.min(layerH - h - 14, startY));
      const pushMargin = 8;

      for (let iter = 0; iter < 14; iter++) {
        let moved = false;
        for (let i = 0; i < obstacles.length; i++) {
          const o = obstacles[i];
          if (x < o.right && x + w > o.left && y < o.bottom && y + h > o.top) {
            const overlapLeft = (x + w) - o.left;
            const overlapRight = o.right - x;
            const overlapTop = (y + h) - o.top;
            const overlapBottom = o.bottom - y;
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            if (minOverlap === overlapLeft) {
              x -= overlapLeft + pushMargin;
            } else if (minOverlap === overlapRight) {
              x += overlapRight + pushMargin;
            } else if (minOverlap === overlapTop) {
              y -= overlapTop + pushMargin;
            } else {
              y += overlapBottom + pushMargin;
            }

            x = Math.max(10, Math.min(layerW - w - 10, x));
            y = Math.max(14, Math.min(layerH - h - 14, y));
            moved = true;
          }
        }
        if (!moved) break;
      }

      return !overlapsAny(x, y, w, h, obstacles, layerW, layerH) ? { x, y } : null;
    }

    function findNearestWhitespace(startX, startY, w, h, excludeEl, chiliPad = 8) {
      const layerW = chiliLayer.clientWidth || window.innerWidth;
      const layerH = chiliLayer.clientHeight || document.documentElement.scrollHeight;
      const obstacles = getObstacles(excludeEl, chiliPad);

      const clampedX = Math.max(10, Math.min(layerW - w - 10, startX));
      const clampedY = Math.max(14, Math.min(layerH - h - 14, startY));

      const repelled = repelFromObstacles(clampedX, clampedY, w, h, obstacles, layerW, layerH);
      if (repelled) {
        return repelled;
      }

      const step = 18;
      const angles = 16;
      for (let r = step; r <= 460; r += step) {
        for (let a = 0; a < angles; a++) {
          const theta = (a / angles) * Math.PI * 2;
          const cx = clampedX + Math.cos(theta) * r;
          const cy = clampedY + Math.sin(theta) * r;
          if (!overlapsAny(cx, cy, w, h, obstacles, layerW, layerH)) {
            return { x: cx, y: cy };
          }
        }
      }

      return { x: clampedX, y: clampedY };
    }

    function createChili(idx, bandIndex) {
      const size = 42 + Math.floor(Math.random() * 29);
      const rot = Math.round((Math.random() - 0.5) * 76);

      const layerW = chiliLayer.clientWidth || window.innerWidth;
      const layerH = chiliLayer.clientHeight || document.documentElement.scrollHeight;
      const obstacles = getObstacles(null, 65);

      const minY = 24;
      const usableH = Math.max(200, layerH - size - minY - 24);
      const bandH = usableH / CHILI_COUNT;
      const bandTop = minY + bandIndex * bandH;

      let chosen = null;
      for (let attempt = 0; attempt < 35; attempt++) {
        const rx = 12 + Math.random() * Math.max(20, layerW - size - 24);
        const ry = bandTop + Math.random() * Math.max(10, bandH - size * 0.4);
        const repelled = repelFromObstacles(rx, ry, size, size, obstacles, layerW, layerH);
        if (repelled) {
          chosen = repelled;
          break;
        }
      }
      if (!chosen) {
        const rx = 12 + Math.random() * Math.max(20, layerW - size - 24);
        const ry = bandTop + Math.random() * Math.max(10, bandH);
        chosen = findNearestWhitespace(rx, ry, size, size, null, 45);
      }

      const item = document.createElement('div');
      item.className = 'chili-item';
      item.style.left = `${chosen.x.toFixed(1)}px`;
      item.style.top = `${chosen.y.toFixed(1)}px`;
      item.style.width = `${size}px`;
      item.style.setProperty('--chili-rot', `${rot}deg`);
      item.style.setProperty('--float-y', `${-8 - (idx % 3) * 4}px`);
      item.style.setProperty('--float-dur', `${3.5 + (idx % 4) * 0.6}s`);
      item.style.setProperty('--float-delay', `${-(idx * 0.45)}s`);

      const img = document.createElement('img');
      img.src = 'chili.png';
      img.alt = '';
      img.loading = 'lazy';
      img.draggable = false;
      item.appendChild(img);
      chiliLayer.appendChild(item);

      let held = false;
      let halfW = size / 2;
      let halfH = size / 2;

      item.addEventListener('dragstart', (e) => e.preventDefault());

      item.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        e.preventDefault();
        held = true;

        const rect = item.getBoundingClientRect();
        halfW = rect.width / 2;
        halfH = rect.height / 2;

        item.classList.remove('is-returning');
        item.classList.add('is-held');
        item.style.left = `${e.clientX - halfW}px`;
        item.style.top = `${e.clientY - halfH}px`;
        item.setPointerCapture(e.pointerId);
      });

      item.addEventListener('pointermove', (e) => {
        if (!held) return;
        item.style.left = `${e.clientX - halfW}px`;
        item.style.top = `${e.clientY - halfH}px`;

        const near = isNearMouth(e.clientX, e.clientY);
        item.classList.toggle('is-near-mouth', near);
        charWrap.classList.toggle('is-hungry', near);
      });

      function releaseChili(e) {
        if (!held) return;
        held = false;
        if (item.hasPointerCapture(e.pointerId)) {
          item.releasePointerCapture(e.pointerId);
        }
        charWrap.classList.remove('is-hungry');
        item.classList.remove('is-near-mouth');

        if (isNearMouth(e.clientX, e.clientY)) {
          item.classList.remove('is-held');
          item.classList.add('is-eaten');
          playEatSound();
          spawnEatParticles();

          charWrap.classList.remove('is-happy');
          void charWrap.offsetWidth;
          charWrap.classList.add('is-happy');
          setTimeout(() => charWrap.classList.remove('is-happy'), 500);

          popText(happyLines[happyIdx % happyLines.length], charText);
          happyIdx++;

          setTimeout(() => item.remove(), 240);
        } else {
          const layerRect = chiliLayer.getBoundingClientRect();
          const dropX = e.clientX - halfW - layerRect.left;
          const dropY = e.clientY - halfH - layerRect.top;
          const dest = findNearestWhitespace(dropX, dropY, halfW * 2, halfH * 2, item);

          item.classList.remove('is-held');
          item.classList.add('is-returning');
          item.style.left = `${layerRect.left + dest.x}px`;
          item.style.top = `${layerRect.top + dest.y}px`;
          item.style.transform = `rotate(${rot}deg)`;

          setTimeout(() => {
            item.classList.remove('is-returning');
            item.style.left = `${dest.x.toFixed(1)}px`;
            item.style.top = `${dest.y.toFixed(1)}px`;
            item.style.transform = '';
          }, 370);
        }
      }

      item.addEventListener('pointerup', releaseChili);
      item.addEventListener('pointercancel', releaseChili);
    }

    const bands = Array.from({ length: CHILI_COUNT }, (_, i) => i);
    for (let i = bands.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = bands[i];
      bands[i] = bands[j];
      bands[j] = tmp;
    }
    for (let i = 0; i < CHILI_COUNT; i++) {
      createChili(i, bands[i]);
    }
  })();

  const revealEls = $$('[data-reveal]');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach((el) => revealObs.observe(el));

  const cartJokes = {
    bmw: 'Added to cart.',
    kettle: 'Added to cart.',
    mala: 'Added to cart. You are brave!'
  };

  $$('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      toast(cartJokes[btn.dataset.add] || 'Added to cart.');
    });
  });

  const clips = window.KETTLE_CLIPS || [];
  const wheelCanvas = $('#wheelCanvas');
  const ctx = wheelCanvas.getContext('2d');
  const spinBtn = $('#spinBtn');
  const noRepeatSwitch = $('#noRepeatSwitch');
  const wheelSub = $('#wheelSub');
  const clipOverlay = $('#clipOverlay');
  const clipClose = $('#clipClose');
  const clipTitle = $('#clipTitle');
  const clipFrameWrap = $('#clipFrameWrap');
  const clipIframe = $('#clipIframe');
  const clipTwitchLink = $('#clipTwitchLink');
  const clipSpinAgain = $('#clipSpinAgain');

  const SEGMENTS = clips.length;
  const ARC = SEGMENTS > 0 ? (2 * Math.PI) / SEGMENTS : 0;
  const TWO_PI = 2 * Math.PI;
  const seenIndices = new Set();
  let noRepeatMode = false;
  let currentAngle = 0;
  let isSpinning = false;

  noRepeatSwitch.addEventListener('change', () => {
    if (isSpinning) {
      noRepeatSwitch.checked = noRepeatMode;
      return;
    }
    noRepeatMode = noRepeatSwitch.checked;

    if (!noRepeatMode) {
      seenIndices.clear();
      wheelCanvas.classList.remove('spinning');
      spinBtn.disabled = false;
      spinBtn.textContent = 'SPIN WHEEL';
      wheelSub.textContent = 'click the wheel or smash the button';
      clipSpinAgain.style.display = '';
    }

    buildWheelCache();
    drawWheel(currentAngle);
  });

  const COLORS = [
    '#FF8FAB', '#FFE45E', '#A8F0D1', '#B8D0FF', '#E2CFFF',
    '#FFD6E3', '#FF8FAB', '#FFE45E', '#A8F0D1', '#B8D0FF',
    '#E2CFFF', '#FFD6E3', '#FF8FAB', '#FFE45E', '#A8F0D1'
  ];

  const offscreen = document.createElement('canvas');
  offscreen.width = wheelCanvas.width;
  offscreen.height = wheelCanvas.height;

  function buildWheelCache() {
    const octx = offscreen.getContext('2d');
    const size = offscreen.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = cx - 8;

    octx.clearRect(0, 0, size, size);
    octx.save();
    octx.translate(cx, cy);

    for (let i = 0; i < SEGMENTS; i++) {
      const startAngle = i * ARC - Math.PI / 2;
      const endAngle = startAngle + ARC;

      octx.beginPath();
      octx.moveTo(0, 0);
      octx.arc(0, 0, r, startAngle, endAngle);
      octx.closePath();
      octx.fillStyle = (noRepeatMode && seenIndices.has(i)) ? '#E5DED3' : COLORS[i % COLORS.length];
      octx.fill();
      octx.lineWidth = 2.5;
      octx.strokeStyle = '#141414';
      octx.stroke();

      octx.save();
      octx.rotate(startAngle + ARC / 2);
      octx.textAlign = 'right';
      octx.fillStyle = (noRepeatMode && seenIndices.has(i)) ? '#7A7385' : '#141414';

      const title = clips[i].title;
      const fontSize = title.length > 22 ? 17 : title.length > 14 ? 20 : 23;
      octx.font = `700 ${fontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
      octx.fillText(title, r - 26, 7, r - 80);
      octx.restore();
    }

    octx.beginPath();
    octx.arc(0, 0, 30, 0, TWO_PI);
    octx.fillStyle = '#FFFDF7';
    octx.fill();
    octx.lineWidth = 3.5;
    octx.strokeStyle = '#141414';
    octx.stroke();

    octx.beginPath();
    octx.arc(0, 0, 10, 0, TWO_PI);
    octx.fillStyle = '#FF8FAB';
    octx.fill();
    octx.lineWidth = 2.5;
    octx.strokeStyle = '#141414';
    octx.stroke();

    octx.restore();
  }

  function drawWheel(rotation) {
    const size = wheelCanvas.width;
    const cx = size / 2;
    const cy = size / 2;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.drawImage(offscreen, -cx, -cy);
    ctx.restore();
  }

  if (SEGMENTS > 0) {
    buildWheelCache();
    drawWheel(0);
  }

  let audioCtx = null;
  let spinBuffer = null;
  let spinSource = null;
  let spinGain = null;
  let wheelMuted = false;
  const WHEEL_VOLUME = 0.25;
  const wheelMuteBtn = $('#wheelMuteBtn');
  const spinAudio = new Audio('spin.mp3');
  spinAudio.preload = 'auto';
  spinAudio.volume = WHEEL_VOLUME;
  spinAudio.load();

  function syncWheelMute() {
    if (spinGain) {
      spinGain.gain.value = wheelMuted ? 0 : WHEEL_VOLUME;
    }
    spinAudio.muted = wheelMuted;
    spinAudio.volume = WHEEL_VOLUME;
    if (wheelMuteBtn) {
      wheelMuteBtn.classList.toggle('is-muted', wheelMuted);
      wheelMuteBtn.setAttribute('aria-pressed', String(wheelMuted));
      const label = wheelMuted ? 'Unmute wheel sound' : 'Mute wheel sound';
      wheelMuteBtn.setAttribute('aria-label', label);
      wheelMuteBtn.setAttribute('title', label);
    }
  }

  if (wheelMuteBtn) {
    wheelMuteBtn.addEventListener('click', () => {
      wheelMuted = !wheelMuted;
      syncWheelMute();
    });
  }

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => { });
    }
    return audioCtx;
  }

  function preloadSpinBuffer() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx || spinBuffer) return;
    const ac = getAudioCtx();
    fetch('spin.mp3')
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject()))
      .then((buf) => ac.decodeAudioData(buf))
      .then((decoded) => {
        spinBuffer = decoded;
      })
      .catch(() => { });
  }

  preloadSpinBuffer();
  document.addEventListener('pointerdown', () => {
    getAudioCtx();
    if (!spinBuffer) preloadSpinBuffer();
  }, { once: true, passive: true });

  function getSpinDurationMs() {
    let soundMs = 5500;
    if (spinBuffer && Number.isFinite(spinBuffer.duration) && spinBuffer.duration > 0) {
      soundMs = spinBuffer.duration * 1000;
    } else if (Number.isFinite(spinAudio.duration) && spinAudio.duration > 0) {
      soundMs = spinAudio.duration * 1000;
    }
    return Math.max(2500, soundMs - 900);
  }

  function playSpinSound(onEnd) {
    try {
      if (spinBuffer) {
        const ac = getAudioCtx();
        if (spinSource) {
          try { spinSource.stop(); } catch (_) { }
        }
        const src = ac.createBufferSource();
        const gain = ac.createGain();
        gain.gain.value = wheelMuted ? 0 : WHEEL_VOLUME;
        src.buffer = spinBuffer;
        src.connect(gain);
        gain.connect(ac.destination);
        spinGain = gain;
        src.onended = () => {
          if (spinSource === src) {
            spinSource = null;
            spinGain = null;
          }
          onEnd();
        };
        src.start(0);
        spinSource = src;
        return;
      }

      spinAudio.pause();
      spinAudio.currentTime = 0;
      spinAudio.onended = () => onEnd();
      const p = spinAudio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => onEnd());
      }
    } catch (_) {
      onEnd();
    }
  }

  function spin() {
    if (isSpinning || SEGMENTS === 0) return;

    let winIdx;
    if (noRepeatMode) {
      const remaining = [];
      for (let i = 0; i < SEGMENTS; i++) {
        if (!seenIndices.has(i)) remaining.push(i);
      }
      if (remaining.length === 0) {
        toast(`All ${SEGMENTS} clips watched this session!`);
        return;
      }
      winIdx = remaining[Math.floor(Math.random() * remaining.length)];
    } else {
      winIdx = Math.floor(Math.random() * SEGMENTS);
    }

    getAudioCtx();
    isSpinning = true;
    wheelCanvas.classList.add('spinning');
    spinBtn.disabled = true;
    spinBtn.textContent = 'SPINNING...';

    const extraSpins = 6 + Math.floor(Math.random() * 4);
    const targetAngle = -(winIdx * ARC + ARC / 2);
    const jitter = (Math.random() - 0.5) * ARC * 0.55;
    const delta = (((targetAngle + jitter - currentAngle) % TWO_PI) + TWO_PI) % TWO_PI;
    const totalRotation = extraSpins * TWO_PI + delta;

    const duration = getSpinDurationMs();
    const startTime = performance.now();
    const startAngle = currentAngle;

    let animDone = false;
    let soundDone = false;
    let clipOpened = false;

    function finishSpin() {
      if (clipOpened || !animDone || !soundDone) return;
      clipOpened = true;
      isSpinning = false;

      if (noRepeatMode) {
        seenIndices.add(winIdx);
        buildWheelCache();
        drawWheel(currentAngle);
      }

      if (noRepeatMode && seenIndices.size >= SEGMENTS) {
        spinBtn.disabled = true;
        spinBtn.textContent = `ALL ${SEGMENTS} WATCHED`;
        wheelSub.textContent = 'all clips watched! Now you can larp this vtuber too!!';
        clipSpinAgain.style.display = 'none';
      } else {
        wheelCanvas.classList.remove('spinning');
        spinBtn.disabled = false;
        spinBtn.textContent = 'SPIN WHEEL';
      }

      showClip(clips[winIdx]);
    }

    playSpinSound(() => {
      soundDone = true;
      finishSpin();
    });

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 4);
      const angle = startAngle + totalRotation * eased;

      drawWheel(angle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        currentAngle = ((angle % TWO_PI) + TWO_PI) % TWO_PI;
        animDone = true;
        finishSpin();
      }
    }

    requestAnimationFrame(animate);
  }

  spinBtn.addEventListener('click', spin);
  wheelCanvas.addEventListener('click', spin);

  let lastFocusedEl = null;

  function showClip(clip) {
    lastFocusedEl = document.activeElement;
    clipTitle.textContent = clip.title;
    const clipUrl = `https://www.twitch.tv/kettletoro/clip/${clip.slug}`;
    clipTwitchLink.href = clipUrl;

    const existingFallback = clipFrameWrap.querySelector('.clip-file-fallback');
    if (existingFallback) existingFallback.remove();

    if (location.protocol === 'file:') {
      clipIframe.style.display = 'none';
      clipIframe.src = '';
      const fallback = document.createElement('div');
      fallback.className = 'clip-file-fallback';
      fallback.innerHTML = `
        <strong>Twitch clips cannot embed over file://</strong>
        <p>Twitch blocks iframe embeds on local file URLs. Contact Fear or dm him on discord</p>
        <a href="${clipUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-yellow">Watch Clip on Twitch &nearr;</a>
      `;
      clipFrameWrap.appendChild(fallback);
    } else {
      clipIframe.style.display = 'block';
      const parent = encodeURIComponent(location.hostname || 'kettletoro.shop');
      clipIframe.src = `https://clips.twitch.tv/embed?clip=${encodeURIComponent(clip.slug)}&parent=${parent}&autoplay=true`;
    }

    clipOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    clipClose.focus();
  }

  function closeClip() {
    clipOverlay.classList.remove('is-open');
    clipIframe.src = '';
    document.body.style.overflow = '';
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  clipClose.addEventListener('click', closeClip);
  clipSpinAgain.addEventListener('click', () => {
    closeClip();
    setTimeout(spin, 180);
  });
  clipOverlay.addEventListener('click', (e) => { if (e.target === clipOverlay) closeClip(); });
  document.addEventListener('keydown', (e) => {
    if (!clipOverlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      closeClip();
      return;
    }
    if (e.key === 'Tab') {
      const focusables = Array.from(clipOverlay.querySelectorAll('button, a[href], iframe'))
        .filter((el) => el.offsetParent !== null && !el.disabled);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

})();
