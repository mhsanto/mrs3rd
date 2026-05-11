(function () {
    const fab = document.getElementById('fab');
    const trigger = document.getElementById('fabTrigger');
    const closeBtn = document.getElementById('fabClose');
    const panel = fab.querySelector('.fab-panel');
    const items = fab.querySelectorAll('.fab-item');

    function isOpen() {
        return fab.dataset.open === 'true';
    }

    function openMenu() {
        if (isOpen()) return;
        fab.dataset.open = 'true';
        trigger.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
    }

    function closeMenu() {
        if (!isOpen()) return;
        fab.dataset.open = 'false';
        trigger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
    }

    // ===== Open paths =====
    // Hover trigger -> open. Once open, hover never closes — only explicit actions do.
    trigger.addEventListener('mouseenter', openMenu);

    // Tap / click trigger -> TOGGLE. Clicking the Rewards pill again closes it.
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isOpen()) closeMenu();
        else openMenu();
    });

    // ===== Close paths =====
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMenu();
    });

    // Click anywhere outside the floating button closes the menu.
    document.addEventListener('click', (e) => {
        if (!isOpen()) return;
        if (!fab.contains(e.target)) closeMenu();
    });

    // Escape closes and returns focus to the trigger.
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) {
            closeMenu();
            trigger.focus();
        }
    });

    // ===== Variant switcher =====
    const variantBtns = document.querySelectorAll('[data-set-variant]');
    variantBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const variant = btn.dataset.setVariant;
            fab.dataset.variant = variant;
            variantBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
            closeMenu();
        });
    });

    // ===== Item selection =====
    items.forEach((item) => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.dataset.action;
            const label = item.querySelector('.fab-label')?.textContent.trim();
            console.log('[fab] selected:', action, '—', label);

            // Notify the host page — wire up your routing/handling here.
            fab.dispatchEvent(new CustomEvent('fab:select', {
                detail: { action, label },
                bubbles: true
            }));
        });

        // Keyboard activation
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
    });
})();
