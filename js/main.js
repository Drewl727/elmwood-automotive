/* ================================================================
   ELMWOOD AUTOMOTIVE — main.js
   Mobile nav, active links, scroll reveal
   ================================================================ */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Active nav link
     ------------------------------------------------------------------ */
  function setActiveLink() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      const match = href === page || (page === '' && href === 'index.html');
      if (match) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ------------------------------------------------------------------
     Mobile nav toggle
     ------------------------------------------------------------------ */
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links  = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('open', !open);
    });

    // Close on link click (mobile)
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest('.nav')) {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
      }
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveal (Intersection Observer)
     ------------------------------------------------------------------ */
  function initReveal() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  /* ------------------------------------------------------------------
     Contact form pre-fill from URL params
     ------------------------------------------------------------------ */
  function prefillContactForm() {
    if (!document.querySelector('.contact-form')) return;
    const p = new URLSearchParams(window.location.search);

    const map = {
      year:      '#field-year',
      make:      '#field-make',
      model:     '#field-model',
    };

    Object.entries(map).forEach(([key, sel]) => {
      const el = document.querySelector(sel);
      if (el && p.get(key)) el.value = p.get(key);
    });

    // Pre-fill description
    const desc = document.querySelector('#field-description');
    if (desc) {
      const parts = [];
      if (p.get('zones'))   parts.push('Damaged areas: ' + p.get('zones'));
      if (p.get('damage'))  parts.push('Damage type: '   + p.get('damage'));
      if (parts.length) desc.value = parts.join('\n');
    }

    // Pre-select insurance radio
    const ins = p.get('insurance');
    if (ins === 'yes') {
      const el = document.querySelector('#insurance-yes');
      if (el) el.checked = true;
    } else if (ins === 'no') {
      const el = document.querySelector('#insurance-no');
      if (el) el.checked = true;
    }

    // Pre-select service type
    const damage = p.get('damage') || '';
    const serviceMap = {
      'Paintless Dent Repair': 'dent',
      'Body & Paint Repair':   'collision',
      'Moderate Body Work':    'collision',
      'Major Collision Repair':'collision',
      'Minor Repair':          'collision',
    };
    const serviceVal = serviceMap[damage];
    if (serviceVal) {
      const sel = document.querySelector('#field-service');
      if (sel) sel.value = serviceVal;
    }
  }

  /* ------------------------------------------------------------------
     Init
     ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    setActiveLink();
    initMobileNav();
    initReveal();
    prefillContactForm();
  });
})();
