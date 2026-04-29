/* ================================================================
   ELMWOOD AUTOMOTIVE — damage-tool.js
   5-step interactive damage assessment tool
   ================================================================ */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Data
     ------------------------------------------------------------------ */
  const ZONES = {
    'front-bumper':    'Front Bumper',
    'hood':            'Hood',
    'roof':            'Roof',
    'driver-front':    'Driver Side Front',
    'driver-rear':     'Driver Side Rear',
    'passenger-front': 'Passenger Side Front',
    'passenger-rear':  'Passenger Side Rear',
    'rear-bumper':     'Rear Bumper',
  };

  const DAMAGE_RESULTS = {
    'scratch': {
      tier:  'Minor Repair',
      range: '$150 – $500',
      time:  '1 – 2 days',
      note:  null,
    },
    'dent-no-paint': {
      tier:  'Paintless Dent Repair',
      range: '$100 – $400',
      time:  'Often same-day',
      note:  null,
    },
    'dent-paint': {
      tier:  'Body & Paint Repair',
      range: '$400 – $1,500',
      time:  '3 – 5 days',
      note:  null,
    },
    'bent': {
      tier:  'Moderate Body Work',
      range: '$800 – $3,000',
      time:  'Depends on extent',
      note:  null,
    },
    'structural': {
      tier:  'Major Collision Repair',
      range: 'In-person quote required',
      time:  'Please call or bring it in',
      note:  'We need to inspect your vehicle before we can give an estimate.',
    },
  };

  /* ------------------------------------------------------------------
     State
     ------------------------------------------------------------------ */
  const state = {
    step:       1,
    zones:      [],
    damageType: null,
    insurance:  null,
    year:       '',
    make:       '',
    model:      '',
  };

  /* ------------------------------------------------------------------
     DOM refs (set in init)
     ------------------------------------------------------------------ */
  let tool       = null;
  let stepEls    = [];
  let progressEl = null;

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  function goTo(step) {
    state.step = step;
    render();
  }

  function getVehicleLabel() {
    const parts = [state.year, state.make, state.model].filter(Boolean);
    return parts.length ? parts.join(' ') : null;
  }

  /* ------------------------------------------------------------------
     Render
     ------------------------------------------------------------------ */
  function render() {
    // Steps
    stepEls.forEach((el, i) => {
      el.classList.toggle('active', i + 1 === state.step);
    });

    // Progress dots
    if (progressEl) {
      progressEl.querySelectorAll('.tool-progress-step').forEach((dot, i) => {
        dot.classList.toggle('active', i < state.step);
      });
    }

    // Show result panel if step 5
    const resultPanel = tool.querySelector('.tool-result');
    if (resultPanel) {
      resultPanel.classList.toggle('active', state.step === 5);
    }

    // Render zone tags
    const tagsEl = tool.querySelector('.zone-tags');
    if (tagsEl) {
      tagsEl.innerHTML = state.zones.length
        ? state.zones.map(z => `<span class="zone-tag">${ZONES[z]}</span>`).join('')
        : '<span style="font-size:0.78rem;color:var(--c-text-muted)">Click zones to select</span>';
    }

    // Render result when on step 5
    if (state.step === 5) renderResult();
  }

  function renderResult() {
    const result = DAMAGE_RESULTS[state.damageType];
    if (!result) return;

    const resultPanel = tool.querySelector('.tool-result');
    if (!resultPanel) return;

    const tierEl     = resultPanel.querySelector('.result-tier-title');
    const rangeEl    = resultPanel.querySelector('[data-result="range"]');
    const timeEl     = resultPanel.querySelector('[data-result="time"]');
    const noteEl     = resultPanel.querySelector('.result-note');
    const actionsEl  = resultPanel.querySelector('.result-actions');

    if (tierEl)  tierEl.textContent  = result.tier;
    if (rangeEl) rangeEl.textContent = result.range;
    if (timeEl)  timeEl.textContent  = result.time;

    if (noteEl) {
      noteEl.textContent = result.note || '';
      noteEl.style.display = result.note ? '' : 'none';
    }

    // Build CTA href for contact form
    if (actionsEl) {
      const params = new URLSearchParams();
      if (state.year)       params.set('year', state.year);
      if (state.make)       params.set('make', state.make);
      if (state.model)      params.set('model', state.model);
      if (state.damageType) params.set('damage', result.tier);
      if (state.zones.length) params.set('zones', state.zones.map(z => ZONES[z]).join(', '));
      if (state.insurance)  params.set('insurance', state.insurance);

      const submitBtn = actionsEl.querySelector('[data-action="submit"]');
      if (submitBtn) submitBtn.href = 'contact.html?' + params.toString();

      // Vehicle summary
      const vehicleEl = resultPanel.querySelector('[data-result="vehicle"]');
      const vehicle = getVehicleLabel();
      if (vehicleEl) {
        vehicleEl.textContent = vehicle || '—';
      }

      // Zones summary
      const zonesEl = resultPanel.querySelector('[data-result="zones"]');
      if (zonesEl) {
        zonesEl.textContent = state.zones.length
          ? state.zones.map(z => ZONES[z]).join(', ')
          : '—';
      }
    }
  }

  /* ------------------------------------------------------------------
     Step 1: Car diagram
     ------------------------------------------------------------------ */
  function initDiagram() {
    const diagram = tool.querySelector('.car-diagram');
    if (!diagram) return;

    diagram.querySelectorAll('.zone').forEach(zone => {
      zone.setAttribute('role', 'checkbox');
      zone.setAttribute('tabindex', '0');

      const zoneId = zone.dataset.zone;
      zone.setAttribute('aria-label', ZONES[zoneId] || zoneId);
      zone.setAttribute('aria-checked', 'false');

      function toggleZone() {
        const idx = state.zones.indexOf(zoneId);
        if (idx === -1) {
          state.zones.push(zoneId);
          zone.classList.add('selected');
          zone.setAttribute('aria-checked', 'true');
        } else {
          state.zones.splice(idx, 1);
          zone.classList.remove('selected');
          zone.setAttribute('aria-checked', 'false');
        }
        render();
      }

      zone.addEventListener('click', toggleZone);
      zone.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleZone(); }
      });
    });
  }

  /* ------------------------------------------------------------------
     Step 2–3: Radio options
     ------------------------------------------------------------------ */
  function initRadioOptions() {
    tool.querySelectorAll('.tool-option').forEach(option => {
      option.addEventListener('click', () => {
        const group = option.dataset.group;
        // Deselect siblings
        tool.querySelectorAll(`.tool-option[data-group="${group}"]`).forEach(o => {
          o.classList.remove('selected');
          o.setAttribute('aria-checked', 'false');
        });
        option.classList.add('selected');
        option.setAttribute('aria-checked', 'true');

        // Save to state
        const val = option.dataset.value;
        if (group === 'damage')    state.damageType = val;
        if (group === 'insurance') state.insurance  = val;
      });

      option.setAttribute('role', 'radio');
      option.setAttribute('tabindex', '0');
      option.setAttribute('aria-checked', 'false');

      option.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); option.click(); }
      });
    });
  }

  /* ------------------------------------------------------------------
     Navigation buttons
     ------------------------------------------------------------------ */
  function initNav() {
    tool.querySelectorAll('[data-action="next"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const currentStep = state.step;
        // Validation
        if (currentStep === 2 && !state.damageType) {
          showValidationError(btn, 'Please select a damage type.');
          return;
        }
        if (currentStep === 3 && !state.insurance) {
          showValidationError(btn, 'Please select an option.');
          return;
        }
        goTo(currentStep + 1);
      });
    });

    tool.querySelectorAll('[data-action="back"]').forEach(btn => {
      btn.addEventListener('click', () => goTo(state.step - 1));
    });

    tool.querySelectorAll('[data-action="skip"]').forEach(btn => {
      btn.addEventListener('click', () => goTo(state.step + 1));
    });

    // Vehicle inputs auto-save
    const yearEl  = tool.querySelector('#tool-year');
    const makeEl  = tool.querySelector('#tool-make');
    const modelEl = tool.querySelector('#tool-model');
    if (yearEl)  yearEl.addEventListener('input',  () => { state.year  = yearEl.value.trim(); });
    if (makeEl)  makeEl.addEventListener('input',  () => { state.make  = makeEl.value.trim(); });
    if (modelEl) modelEl.addEventListener('input', () => { state.model = modelEl.value.trim(); });

    // Restart
    const restartBtn = tool.querySelector('[data-action="restart"]');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        // Reset state
        state.step = 1;
        state.zones = [];
        state.damageType = null;
        state.insurance = null;
        state.year = '';
        state.make = '';
        state.model = '';

        // Reset diagram zones
        tool.querySelectorAll('.zone').forEach(z => {
          z.classList.remove('selected');
          z.setAttribute('aria-checked', 'false');
        });

        // Reset radio options
        tool.querySelectorAll('.tool-option').forEach(o => {
          o.classList.remove('selected');
          o.setAttribute('aria-checked', 'false');
        });

        // Reset inputs
        if (yearEl)  yearEl.value  = '';
        if (makeEl)  makeEl.value  = '';
        if (modelEl) modelEl.value = '';

        render();
      });
    }
  }

  function showValidationError(btn, msg) {
    let err = btn.parentElement.querySelector('.tool-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'tool-error';
      err.style.cssText = 'font-size:0.8rem;color:var(--c-accent);margin-top:0.5rem;';
      err.setAttribute('role', 'alert');
      btn.parentElement.appendChild(err);
    }
    err.textContent = msg;
    setTimeout(() => { if (err.parentElement) err.remove(); }, 3000);
  }

  /* ------------------------------------------------------------------
     Init
     ------------------------------------------------------------------ */
  function init() {
    tool = document.querySelector('.damage-tool');
    if (!tool) return;

    stepEls    = Array.from(tool.querySelectorAll('.tool-step'));
    progressEl = tool.querySelector('.tool-progress');

    initDiagram();
    initRadioOptions();
    initNav();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
