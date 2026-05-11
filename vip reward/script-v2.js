(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initBonusActions();
    initTierTiles();
    initNav();
    initHeaderButtons();
    initScrollReveal();
    initCountUp();
  });

  function initCountUp() {
    const targets = document.querySelectorAll('.bonus-amt');
    const items = [];

    targets.forEach(function (el) {
      const fullText = el.textContent.trim();
      const decimals = (fullText.split('.')[1] || '').length;
      const value = parseFloat(fullText.replace(/,/g, ''));
      if (isNaN(value)) return;

      el.textContent = formatNumber(0, decimals);
      items.push({ el: el, value: value, decimals: decimals, done: false });
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
      const duration = 1400;
      const startTime = performance.now();
      const easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

      function tick(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const current = item.value * easeOut(t);
        item.el.textContent = formatNumber(current, item.decimals);
        if (t < 1) requestAnimationFrame(tick);
        else item.el.textContent = formatNumber(item.value, item.decimals);
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
      '.hero, .section-banner, .progress-panel, .tiers, .benefit, .terms'
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

  function initTheme() {
    const root = document.documentElement;
    const btn = document.getElementById('themeToggle');
    const stored = (function () { try { return localStorage.getItem('vipTheme'); } catch (e) { return null; } })();
    if (stored === 'light') root.setAttribute('data-theme', 'light');

    if (!btn) return;
    btn.addEventListener('click', function () {
      const isLight = root.getAttribute('data-theme') === 'light';
      if (isLight) {
        root.removeAttribute('data-theme');
        try { localStorage.setItem('vipTheme', 'dark'); } catch (e) { }
        console.log('[VIP Reward v2] Theme: dark');
      } else {
        root.setAttribute('data-theme', 'light');
        try { localStorage.setItem('vipTheme', 'light'); } catch (e) { }
        console.log('[VIP Reward v2] Theme: light');
      }
    });
  }

  function initBonusActions() {
    const buttons = document.querySelectorAll('.bonus-action');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled || btn.classList.contains('claimed') || btn.classList.contains('ghost')) return;

        const bonusType = btn.getAttribute('data-bonus') || 'bonus';
        const block = btn.closest('.bonus');
        const amountEl = block ? block.querySelector('.bonus-amt') : null;
        const amount = amountEl ? amountEl.textContent.trim() : '';

        if (btn.classList.contains('primary')) {
          btn.classList.remove('primary');
          btn.classList.add('claimed');
          btn.textContent = 'CLAIMED';
          btn.disabled = true;
          console.log('[VIP Reward v2] Claimed', bonusType, 'RM' + amount);
        } else if (btn.classList.contains('outline')) {
          console.log('[VIP Reward v2] View details for', bonusType, 'RM' + amount);
        }
      });
    });
  }

  function initTierTiles() {
    const tiles = document.querySelectorAll('.tier');
    tiles.forEach(function (tile) {
      tile.addEventListener('click', function () {
        const name = tile.querySelector('.name');
        const deposit = tile.querySelector('.deposit');
        if (name) {
          console.log(
            '[VIP Reward v2] Tier selected:',
            name.textContent.trim(),
            deposit ? '(' + deposit.textContent.trim() + ')' : ''
          );
        }
      });
    });
  }

  function initNav() {
    const links = document.querySelectorAll('.nav a');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        links.forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
        const label = link.textContent.trim();
        console.log('[VIP Reward v2] Nav:', label);
      });
    });
  }

  function initHeaderButtons() {
    const login = document.querySelector('.btn-outline');
    const register = document.querySelector('.btn-primary');
    if (login) login.addEventListener('click', function () { console.log('[VIP Reward v2] Login clicked'); });
    if (register) register.addEventListener('click', function () { console.log('[VIP Reward v2] Register clicked'); });
  }
})();
