(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initRoyalBadge();
    initClaimButtons();
    initLadderInteractions();
    initMemberTiles();
    initHeaderButtons();
    initScrollReveal();
    initCountUp();
    initTypingEffect();
  });

  function initRoyalBadge() {
    const tierConfig = {
      BRONZE:   { color: '#d98a4c', glow: 'rgba(217, 138, 76, .55)',  level: 1 },
      SILVER:   { color: '#c9cfd9', glow: 'rgba(201, 207, 217, .55)', level: 2 },
      GOLD:     { color: '#ffd76a', glow: 'rgba(255, 215, 106, .65)', level: 3 },
      PLATINUM: { color: '#e6ecf2', glow: 'rgba(230, 236, 242, .55)', level: 4 },
      DIAMOND:  { color: '#9cdcff', glow: 'rgba(156, 220, 255, .65)', level: 5 },
      EMERALD:  { color: '#8ce6a5', glow: 'rgba(140, 230, 165, .65)', level: 6 },
      RUBY:     { color: '#ff9a8a', glow: 'rgba(255, 154, 138, .65)', level: 7 },
      SAPPHIRE: { color: '#9ab0ff', glow: 'rgba(154, 176, 255, .65)', level: 8 },
      AMETHYST: { color: '#e0aaff', glow: 'rgba(224, 170, 255, .7)',  level: 9 }
    };

    function applyActiveTier() {
      const activeStep = document.querySelector('.ladder-step.ladder-active');
      const tierEl = document.querySelector('.royal-tier');
      const imgEl = document.querySelector('.royal-rank-img');
      const circleEl = document.querySelector('.royal-circle');
      if (!activeStep || !tierEl) return;
      const nameEl = activeStep.querySelector('.ladder-name');
      if (!nameEl) return;
      const tierName = nameEl.textContent.trim().toUpperCase();
      tierEl.textContent = tierName;
      const cfg = tierConfig[tierName];
      if (cfg) {
        tierEl.style.setProperty('--tier-current', cfg.color);
        tierEl.style.setProperty('--tier-glow', cfg.glow);
        if (circleEl) circleEl.style.setProperty('--tier-glow', cfg.glow);
        if (imgEl) {
          const newSrc = 'assets/ranks/vip-level-' + cfg.level + '.png';
          if (imgEl.getAttribute('src') !== newSrc) {
            imgEl.classList.add('rank-swap');
            imgEl.setAttribute('src', newSrc);
            setTimeout(function () { imgEl.classList.remove('rank-swap'); }, 500);
          }
        }
      }
    }

    applyActiveTier();

    // Re-sync if the active tier changes (e.g., clicking another ladder step)
    document.querySelectorAll('.ladder-step').forEach(function (step) {
      step.addEventListener('click', function () {
        document.querySelectorAll('.ladder-step').forEach(function (s) {
          s.classList.remove('ladder-active');
        });
        step.classList.add('ladder-active');
        applyActiveTier();
      });
    });
  }

  function initTypingEffect() {
    const sequence = [
      { sel: '.vip-title .vip',    speed: 240, pauseAfter: 420 },
      { sel: '.vip-title .reward', speed: 150, pauseAfter: 320 },
      { sel: '.vip-title .system', speed: 130, pauseAfter: 0   }
    ];

    const items = [];
    sequence.forEach(function (s) {
      const el = document.querySelector(s.sel);
      if (!el) return;
      const text = el.textContent;
      el.innerHTML = '';
      const chars = [];
      for (let i = 0; i < text.length; i++) {
        const ch = text.charAt(i);
        const span = document.createElement('span');
        span.className = 'typing-char';
        span.textContent = ch === ' ' ? ' ' : ch;
        el.appendChild(span);
        chars.push(span);
      }
      const caret = document.createElement('span');
      caret.className = 'typing-caret';
      caret.setAttribute('aria-hidden', 'true');
      caret.style.display = 'none';
      el.appendChild(caret);
      items.push({ el: el, chars: chars, caret: caret, speed: s.speed, pauseAfter: s.pauseAfter });
    });

    let elapsed = 400;
    items.forEach(function (item, idx) {
      setTimeout(function () { item.caret.style.display = 'inline-block'; }, elapsed - 50);

      item.chars.forEach(function (span, i) {
        setTimeout(function () { span.classList.add('visible'); }, elapsed + i * item.speed);
      });

      const finishAt = elapsed + item.chars.length * item.speed;
      setTimeout(function () {
        if (idx < items.length - 1) {
          item.caret.style.display = 'none';
        }
      }, finishAt);

      elapsed = finishAt + item.pauseAfter;
    });

    setTimeout(function () {
      const last = items[items.length - 1];
      if (last) last.caret.style.display = 'none';
      const underline = document.querySelector('.vip-title .underline');
      if (underline) underline.classList.add('typing-done');
    }, elapsed + 200);
  }

  function initCountUp() {
    const targets = document.querySelectorAll('.bonus-amount, .upgrade-amount');
    const items = [];

    targets.forEach(function (el) {
      const rmSpan = el.querySelector('.rm');
      const rmHTML = rmSpan ? rmSpan.outerHTML : '';
      const fullText = el.textContent.trim();
      const numberText = rmSpan ? fullText.replace(rmSpan.textContent, '').trim() : fullText;
      const decimals = (numberText.split('.')[1] || '').length;
      const value = parseFloat(numberText.replace(/,/g, ''));
      if (isNaN(value)) return;

      el.innerHTML = rmHTML + formatNumber(0, decimals);
      items.push({ el: el, value: value, decimals: decimals, rmHTML: rmHTML, done: false });
    });

    function formatNumber(n, decimals) {
      return n.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    }

    function animate(item) {
      if (item.done) return;
      item.done = true;
      const duration = 2600;
      const startTime = performance.now();
      const easeOut = function (t) { return 1 - Math.pow(1 - t, 5); };

      function tick(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const current = item.value * easeOut(t);
        item.el.innerHTML = item.rmHTML + formatNumber(current, item.decimals);
        if (t < 1) requestAnimationFrame(tick);
        else item.el.innerHTML = item.rmHTML + formatNumber(item.value, item.decimals);
      }
      requestAnimationFrame(tick);
    }

    const panel = document.querySelector('.progress-panel');
    if (!panel) { items.forEach(animate); return; }

    function isPanelVisible() {
      const r = panel.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top < vh - 40 && r.bottom > 0;
    }

    if (isPanelVisible()) {
      items.forEach(animate);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      function onScroll() {
        if (isPanelVisible()) {
          items.forEach(animate);
          window.removeEventListener('scroll', onScroll);
        }
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          items.forEach(animate);
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(panel);
  }

  function initScrollReveal() {
    const targets = document.querySelectorAll(
      '.section-head, .progress-panel, .ladder, .members, .benefits, .tnc'
    );
    targets.forEach(function (el) { el.classList.add('reveal'); });

    function revealIfVisible(el) {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh - 40 && r.bottom > 0) {
        el.classList.add('in-view');
        return true;
      }
      return false;
    }

    // Immediate check for elements already in viewport on load
    requestAnimationFrame(function () {
      targets.forEach(revealIfVisible);
    });

    if (!('IntersectionObserver' in window)) {
      function onScroll() {
        let allIn = true;
        targets.forEach(function (el) {
          if (!el.classList.contains('in-view')) {
            if (!revealIfVisible(el)) allIn = false;
          }
        });
        if (allIn) window.removeEventListener('scroll', onScroll);
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) {
      if (!el.classList.contains('in-view')) observer.observe(el);
    });
  }

  function initClaimButtons() {
    const buttons = document.querySelectorAll('.claim-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.classList.contains('disabled') || btn.classList.contains('claimed')) return;

        const bonusType = btn.getAttribute('data-bonus') || 'bonus';
        const block = btn.closest('.bonus-block');
        const amountEl = block ? block.querySelector('.bonus-amount') : null;
        const amount = amountEl ? amountEl.innerText.trim() : '';

        btn.classList.remove('active');
        btn.classList.add('claimed');
        btn.textContent = 'CLAIMED';
        btn.disabled = true;

        console.log('[VIP Reward] Claimed', bonusType, amount);
      });
    });
  }

  function initLadderInteractions() {
    const steps = document.querySelectorAll('.ladder-step');
    steps.forEach(function (step) {
      step.addEventListener('click', function () {
        const name = step.querySelector('.ladder-name');
        if (name) console.log('[VIP Reward] Tier selected:', name.textContent.trim());
      });
    });
  }

  function initMemberTiles() {
    const tiles = document.querySelectorAll('.mem');
    tiles.forEach(function (tile) {
      tile.addEventListener('click', function () {
        const name = tile.querySelector('.mem-name');
        if (name) {
          const label = name.innerText.replace(/\s+/g, ' ').trim();
          console.log('[VIP Reward] Member tier:', label);
        }
      });
    });
  }

  function initHeaderButtons() {
    const login = document.querySelector('.btn-outline');
    const register = document.querySelector('.btn-primary');
    if (login) login.addEventListener('click', function () { console.log('[VIP Reward] Login clicked'); });
    if (register) register.addEventListener('click', function () { console.log('[VIP Reward] Register clicked'); });
  }
})();
