/* ============================================================
   WARRIOR VIP WALLET — Theme switcher + button interactions
   ============================================================ */

(function () {
    "use strict";

    const STORAGE_KEY = "wallet-theme";
    const VALID_THEMES = ["gold", "blue", "red", "pink"];
    const body = document.body;

    /* Restore saved theme on load */
    function restoreTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && VALID_THEMES.includes(saved)) {
            body.setAttribute("data-theme", saved);
        }
    }

    /* Apply a theme and persist */
    function applyTheme(theme) {
        if (!VALID_THEMES.includes(theme)) return;
        body.setAttribute("data-theme", theme);
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {
            /* localStorage may be unavailable (private mode, etc.) — fail silently */
        }
    }

    /* Theme switcher wiring */
    function initThemeSwitcher() {
        const swatches = document.querySelectorAll("[data-set-theme]");
        swatches.forEach(function (btn) {
            btn.addEventListener("click", function () {
                const theme = btn.getAttribute("data-set-theme");
                applyTheme(theme);
            });
        });
    }

    /* Refresh button spin animation */
    function initRefreshButton() {
        const refreshBtn = document.querySelector(".action-btn.refresh");
        if (!refreshBtn) return;

        refreshBtn.addEventListener("click", function () {
            const icon = refreshBtn.querySelector(".action-icon");
            if (!icon) return;
            icon.classList.remove("spinning");
            void icon.offsetWidth; /* force reflow so animation restarts */
            icon.classList.add("spinning");
            setTimeout(function () {
                icon.classList.remove("spinning");
            }, 600);
        });
    }

    /* Deposit / Withdraw button feedback (no real wallet logic) */
    function initActionButtons() {
        const buttons = document.querySelectorAll(".action-btn.deposit, .action-btn.withdraw");
        buttons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                btn.style.transform = "scale(0.97)";
                setTimeout(function () {
                    btn.style.transform = "";
                }, 120);
            });
        });
    }

    /* Progress pill fill + count-up animation */
    function initProgressPill() {
        const pill = document.querySelector(".progress-pill");
        if (!pill) return;

        const current = parseFloat(pill.getAttribute("data-current")) || 0;
        const target = parseFloat(pill.getAttribute("data-target")) || 1;
        const percent = Math.max(0, Math.min(100, (current / target) * 100));

        const fill = pill.querySelector(".progress-fill");
        const numEl = pill.querySelector(".rm-current-num");

        /* Trigger fill width animation on next frame */
        requestAnimationFrame(function () {
            if (fill) fill.style.width = percent + "%";
        });

        /* Count-up number animation */
        if (!numEl) return;
        const duration = 1600;
        const startTime = performance.now();
        const formatter = function (n) {
            return Number.isInteger(current)
                ? Math.round(n).toString()
                : n.toFixed(2);
        };

        function tick(now) {
            const elapsed = now - startTime;
            const t = Math.min(1, elapsed / duration);
            /* easeOutCubic for a smooth deceleration */
            const eased = 1 - Math.pow(1 - t, 3);
            numEl.textContent = formatter(current * eased);
            if (t < 1) requestAnimationFrame(tick);
            else numEl.textContent = formatter(current);
        }
        requestAnimationFrame(tick);
    }

    /* Boot */
    function init() {
        restoreTheme();
        initThemeSwitcher();
        initRefreshButton();
        initActionButtons();
        initProgressPill();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
