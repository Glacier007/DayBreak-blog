
/* ==========================================
   DAYBREAK — INTERACTION & ANIMATION ENGINE
   ========================================== */

const root = document.documentElement;
const body = document.body;

/* ------------------------------------------
   1. GLOBAL ANIMATION STYLES
------------------------------------------ */

const animationStyles = document.createElement('style');

animationStyles.textContent = `
  html {
    scroll-behavior: smooth;
  }

  body {
    animation: pageEntrance 0.8s ease both;
  }

  @keyframes pageEntrance {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Smooth theme transitions */
  body,
  body * {
    transition:
      background-color 0.45s ease,
      color 0.35s ease,
      border-color 0.4s ease,
      box-shadow 0.4s ease;
  }

  /* Button interactions */
  button,
  .rail a {
    transition:
      transform 0.25s cubic-bezier(.2,.8,.2,1),
      opacity 0.25s ease,
      background-color 0.3s ease,
      color 0.3s ease,
      box-shadow 0.3s ease;
  }

  button:active {
    transform: scale(0.96);
  }

  button:hover {
    filter: brightness(1.08);
  }

  /* Scroll reveal */
  .js-reveal {
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 0.75s ease,
      transform 0.75s cubic-bezier(.2,.65,.3,1);
  }

  .js-reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* Staggered content */
  .js-reveal.visible {
    transition-delay: var(--reveal-delay, 0ms);
  }

  /* Active navigation */
  .rail a.on {
    transform: translateX(3px);
  }

  /* Copy feedback animation */
  #copy {
    transition: transform 0.25s ease, opacity 0.25s ease;
  }

  #copy.copy-success {
    transform: scale(1.05);
  }

  /* Theme button feedback */
  #theme {
    transition: transform 0.35s cubic-bezier(.2,.8,.2,1);
  }

  #theme.theme-switching {
    transform: rotate(12deg) scale(0.94);
  }

  /* Notes toggle feedback */
  #notes-btn {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }

    .js-reveal {
      opacity: 1;
      transform: none;
    }
  }
`;

document.head.appendChild(animationStyles);


/* ------------------------------------------
   2. THEME SWITCHER
------------------------------------------ */

const themeBtn = document.getElementById('theme');

if (themeBtn) {
  themeBtn.addEventListener('click', () => {

    const dawn = root.dataset.theme !== 'dawn';

    themeBtn.classList.add('theme-switching');

    root.dataset.theme = dawn ? 'dawn' : 'night';

    themeBtn.setAttribute('aria-checked', String(dawn));

    setTimeout(() => {
      themeBtn.classList.remove('theme-switching');
    }, 350);

  });
}


/* ------------------------------------------
   3. DRAFT NOTES TOGGLE
------------------------------------------ */

const notesBtn = document.getElementById('notes-btn');

if (notesBtn) {
  notesBtn.addEventListener('click', () => {

    const hidden = body.classList.toggle('no-notes');

    // Original label preserved
    notesBtn.textContent = 'Draft notes: ' + (hidden ? 'off' : 'on');

    notesBtn.setAttribute('aria-pressed', String(!hidden));

    notesBtn.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(0.96)' },
        { transform: 'scale(1)' }
      ],
      {
        duration: 250,
        easing: 'ease-out'
      }
    );

  });
}


/* ------------------------------------------
   4. COPY COMMAND BUTTON
------------------------------------------ */

const copyBtn = document.getElementById('copy');

if (copyBtn) {

  let copyTimeout;

  copyBtn.addEventListener('click', async () => {

    const command = document.getElementById('cmd');

    if (!command) return;

    clearTimeout(copyTimeout);

    try {

      await navigator.clipboard.writeText(command.innerText);

      // Original label preserved
      copyBtn.textContent = 'Copied';

      copyBtn.classList.add('copy-success');

    } catch {

      // Original label preserved
      copyBtn.textContent = 'Copy failed';

      copyBtn.classList.remove('copy-success');

    }

    copyTimeout = setTimeout(() => {

      // Original label preserved
      copyBtn.textContent = 'Copy';

      copyBtn.classList.remove('copy-success');

    }, 1500);

  });

}


/* ------------------------------------------
   5. SCROLL REVEAL ANIMATIONS
------------------------------------------ */

const sections = document.querySelectorAll('article section[id]');

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (!prefersReducedMotion && 'IntersectionObserver' in window) {

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add('visible');

          observer.unobserve(entry.target);

        }

      });

    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  sections.forEach(section => {

    section.classList.add('js-reveal');

    revealObserver.observe(section);

  });

} else {

  sections.forEach(section => {
    section.classList.add('visible');
  });

}


/* ------------------------------------------
   6. SIDE NAVIGATION HIGHLIGHTING
------------------------------------------ */

const links = [...document.querySelectorAll('.rail a')];

if ('IntersectionObserver' in window) {

  const navigationObserver = new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        links.forEach(link => {

          link.classList.toggle(
            'on',
            link.hash === '#' + entry.target.id
          );

        });

      });

    },
    {
      rootMargin: '-20% 0px -70% 0px'
    }
  );

  sections.forEach(section => {
    navigationObserver.observe(section);
  });

}


/* ------------------------------------------
   7. SMOOTH NAVIGATION
------------------------------------------ */

links.forEach(link => {

  link.addEventListener('click', event => {

    const target = document.querySelector(link.hash);

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });

    history.replaceState(null, '', link.hash);

  });

});


/* ------------------------------------------
   8. INITIAL STATE
------------------------------------------ */

if (themeBtn) {
  themeBtn.setAttribute(
    'aria-checked',
    String(root.dataset.theme === 'dawn')
  );
}

if (notesBtn) {
  notesBtn.setAttribute(
    'aria-pressed',
    String(!body.classList.contains('no-notes'))
  );
}

console.log('Daybreak interactions initialized successfully.');

