/**
 * Seva Operating Dashboard — app.js
 * Handles data persistence (localStorage), UI interactions,
 * progress ring, analytics charts (Chart.js), and animations.
 *
 * @author Seva Framework
 * @version 1.0.0
 */

'use strict';

class SevaApp {

  /* ─────────────────────────────────────────────
     INITIALISATION
  ───────────────────────────────────────────── */

  /**
   * Bootstrap the application: cache DOM refs, bind events,
   * load today's data, paint the progress ring, and animate cards.
   */
  init() {
    /** Chart.js instance references for cleanup before re-render */
    this.charts = { completion: null, section: null, scores: null, radar: null };

    /** Currently viewed date */
    this.currentDate = new Date();

    /** Current analytics range (days) */
    this.analyticsRange = 1;

    this.cacheDom();
    this.bindEvents();
    this.setDate(new Date());
    this.animateCards();
  }

  /** Cache frequently-used DOM elements */
  cacheDom() {
    // Views
    this.dom = {
      dashboardBtn: document.getElementById('dashboardBtn'),
      analyticsBtn: document.getElementById('analyticsBtn'),
      ganttBtn: document.getElementById('ganttBtn'),
      kanbanBtn: document.getElementById('kanbanBtn'),
      trackerBtn: document.getElementById('trackerBtn'),
      terminalBtn: document.getElementById('terminalBtn'),
      dashboardView: document.getElementById('dashboardView'),
      analyticsView: document.getElementById('analyticsView'),
      ganttView: document.getElementById('ganttView'),
      kanbanView: document.getElementById('kanbanView'),
      trackerView: document.getElementById('trackerView'),
      terminalView: document.getElementById('terminalView'),

      // Date nav
      prevDay: document.getElementById('prevDay'),
      nextDay: document.getElementById('nextDay'),
      todayBtn: document.getElementById('todayBtn'),
      currentDate: document.getElementById('currentDate'),

      // Progress
      progressRing: document.getElementById('progressRing'),
      progressText: document.getElementById('progressText'),
      progressSubtitle: document.getElementById('progressSubtitle'),

      // Non-negotiables
      nn1: document.getElementById('nn1'),
      nn2: document.getElementById('nn2'),
      nn3: document.getElementById('nn3'),

      // Sadhana
      chkJapa: document.getElementById('chkJapa'),
      japaMinutes: document.getElementById('japaMinutes'),
      chkMeditation: document.getElementById('chkMeditation'),
      chkReading: document.getElementById('chkReading'),
      intentText: document.getElementById('intentText'),
      scoreCalm: document.getElementById('scoreCalm'),
      scoreFocus: document.getElementById('scoreFocus'),
      scoreDevotion: document.getElementById('scoreDevotion'),
      scoreCalmVal: document.getElementById('scoreCalmVal'),
      scoreFocusVal: document.getElementById('scoreFocusVal'),
      scoreDevotionVal: document.getElementById('scoreDevotionVal'),

      // Body
      chkStrength: document.getElementById('chkStrength'),
      chkWalk: document.getElementById('chkWalk'),
      chkStretching: document.getElementById('chkStretching'),
      scoreEnergy: document.getElementById('scoreEnergy'),
      scoreEnergyVal: document.getElementById('scoreEnergyVal'),

      // Deep Work
      chkSeo: document.getElementById('chkSeo'),
      chkAffiliate: document.getElementById('chkAffiliate'),
      chkLeads: document.getElementById('chkLeads'),
      chkFunnel: document.getElementById('chkFunnel'),
      chkUpload: document.getElementById('chkUpload'),
      chkLandingPage: document.getElementById('chkLandingPage'),
      chkTechFixes: document.getElementById('chkTechFixes'),
      shippedText: document.getElementById('shippedText'),

      // Creative
      chkMusic: document.getElementById('chkMusic'),
      chkScript: document.getElementById('chkScript'),
      chkCreativeExplore: document.getElementById('chkCreativeExplore'),
      creativeOutput: document.getElementById('creativeOutput'),

      // Distribution
      chkPostReel: document.getElementById('chkPostReel'),
      chkPinterestYt: document.getElementById('chkPinterestYt'),
      chkBlogRepurpose: document.getElementById('chkBlogRepurpose'),
      chkCommunity: document.getElementById('chkCommunity'),

      // System
      chkPlanning: document.getElementById('chkPlanning'),
      chkAutomation: document.getElementById('chkAutomation'),
      chkWeeklyStructure: document.getElementById('chkWeeklyStructure'),

      // Shutdown
      movedForward: document.getElementById('movedForward'),
      whatBlocked: document.getElementById('whatBlocked'),
      tomorrowTop3: document.getElementById('tomorrowTop3'),

      // Anti-freeze
      antifreezeToggle: document.getElementById('antifreezeToggle'),
      antifreezeBody: document.getElementById('antifreezeBody'),
      antifreezeIcon: document.getElementById('antifreezeIcon'),

      // Analytics canvases
      completionChart: document.getElementById('completionChart'),
      sectionChart: document.getElementById('sectionChart'),
      scoresChart: document.getElementById('scoresChart'),
      radarChart: document.getElementById('radarChart'),

      // Stat cards
      statStreak: document.getElementById('statStreak'),
      statTotalTasks: document.getElementById('statTotalTasks'),
      statAvgCompletion: document.getElementById('statAvgCompletion'),
      statAvgDevotion: document.getElementById('statAvgDevotion'),
      rangeLabel: document.getElementById('rangeLabel'),
    };
  }

  /* ─────────────────────────────────────────────
     EVENT BINDING
  ───────────────────────────────────────────── */

  /** Wire up all event listeners */
  bindEvents() {
    // --- Date navigation ---
    this.dom.prevDay?.addEventListener('click', () => this.changeDate(-1));
    this.dom.nextDay?.addEventListener('click', () => this.changeDate(1));
    this.dom.todayBtn?.addEventListener('click', () => this.setDate(new Date()));

    // --- View toggle via delegation on document (bulletproof) ---
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.toggle-btn');
      if (!btn) return;
      const view = btn.getAttribute('data-view');
      if (view) this.switchView(view);
    });

    // --- Anti-freeze toggle ---
    this.dom.antifreezeToggle?.addEventListener('click', () => this.toggleAntifreeze());

    // --- Export / Import ---
    var exportBtn = document.getElementById('exportBtn');
    var importBtn = document.getElementById('importBtn');
    var importFile = document.getElementById('importFile');
    if (exportBtn) exportBtn.addEventListener('click', () => this.exportData());
    if (importBtn) importBtn.addEventListener('click', function() {
      if (importFile) importFile.click();
    });
    if (importFile) importFile.addEventListener('change', (e) => this.importData(e));

    // --- Range pills ---
    document.querySelectorAll('.range-pill').forEach((pill) => {
      pill.addEventListener('click', () => this.selectRange(pill));
    });

    // --- Delegated auto-save on dashboard view ---
    const dv = this.dom.dashboardView;
    if (dv) {
      // Checkbox clicks
      dv.addEventListener('change', (e) => {
        if (
          e.target.classList.contains('task-check') ||
          e.target.classList.contains('score-slider') ||
          e.target.classList.contains('seva-input') ||
          e.target.classList.contains('seva-textarea') ||
          e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.tagName === 'SELECT'
        ) {
          this.onFieldChange(e);
        }
      });

      // Slider real-time update
      dv.addEventListener('input', (e) => {
        if (e.target.classList.contains('score-slider')) {
          this.updateSliderDisplay(e.target);
          this.saveData();
          this.updateProgress();
        }
      });

      // Text field blur save
      dv.addEventListener('blur', (e) => {
        if (
          e.target.classList.contains('seva-input') ||
          e.target.classList.contains('seva-textarea') ||
          e.target.id === 'nn1' ||
          e.target.id === 'nn2' ||
          e.target.id === 'nn3'
        ) {
          this.saveData();
        }
      }, true); // capture phase so blur bubbles
    }
  }

  /**
   * Generic field-change handler: save, update progress.
   * @param {Event} e
   */
  onFieldChange(e) {
    if (e.target.classList.contains('score-slider')) {
      this.updateSliderDisplay(e.target);
    }
    this.saveData();
    this.updateProgress();
  }

  /* ─────────────────────────────────────────────
     DATE HELPERS
  ───────────────────────────────────────────── */

  /**
   * Format a Date as "May 30, 2026".
   * @param {Date} date
   * @returns {string}
   */
  formatDate(date) {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /**
   * Build the localStorage key for a given Date.
   * @param {Date} date
   * @returns {string} e.g. "seva-2026-05-30"
   */
  getDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `seva-${y}-${m}-${d}`;
  }

  /**
   * Return the ISO date portion "YYYY-MM-DD" of a Date.
   * @param {Date} date
   * @returns {string}
   */
  toISODate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Move the current date by `delta` days (±1).
   * @param {number} delta
   */
  changeDate(delta) {
    this.saveData();
    const next = new Date(this.currentDate);
    next.setDate(next.getDate() + delta);
    this.setDate(next);
  }

  /**
   * Jump to a specific date, load its data, and refresh the UI.
   * @param {Date} date
   */
  setDate(date) {
    // Normalise to midnight
    this.currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (this.dom.currentDate) {
      this.dom.currentDate.textContent = this.formatDate(this.currentDate);
    }
    this.loadData(this.getDateKey(this.currentDate));
    this.updateProgress();
  }

  /* ─────────────────────────────────────────────
     DATA PERSISTENCE
  ───────────────────────────────────────────── */

  /**
   * Create an empty entry for a given date string.
   * @param {string} dateStr — "YYYY-MM-DD"
   * @returns {object}
   */
  getEmptyEntry(dateStr) {
    return {
      date: dateStr,
      identity: 'I am serving Maa-Baba through structured action, not emotional reaction.',
      nonNegotiables: ['', '', ''],
      sadhana: {
        japa: false,
        japaMinutes: 0,
        meditation: false,
        reading: false,
        intent: '',
        calm: 5,
        focus: 5,
        devotion: 5,
      },
      body: { strength: false, walk: false, stretching: false, energy: 5 },
      deepWork: {
        seo: false,
        affiliate: false,
        leads: false,
        funnel: false,
        upload: false,
        landingPage: false,
        techFixes: false,
        shipped: '',
      },
      creative: { musicPractice: false, scriptReel: false, creativeExplore: false, output: '' },
      distribution: { postReel: false, pinterestYt: false, blogRepurpose: false, communityEngagement: false },
      system: { planning: false, automation: false, weeklyStructure: false },
      shutdown: { movedForward: '', blocked: '', tomorrowTop3: '' },
    };
  }

  /**
   * Collect all form values and persist to localStorage.
   */
  saveData() {
    const dateStr = this.toISODate(this.currentDate);
    const data = this.getEmptyEntry(dateStr);

    // Non-negotiables
    data.nonNegotiables = [
      this.dom.nn1?.value ?? '',
      this.dom.nn2?.value ?? '',
      this.dom.nn3?.value ?? '',
    ];

    // --- Collect checkboxes via data-field ---
    document.querySelectorAll('.task-check').forEach((el) => {
      const field = el.getAttribute('data-field');
      if (field) this.setNestedValue(data, field, el.checked);
    });

    // --- Collect sliders via data-field ---
    document.querySelectorAll('.score-slider').forEach((el) => {
      const field = el.getAttribute('data-field');
      if (field) this.setNestedValue(data, field, parseInt(el.value, 10));
    });

    // --- Collect text inputs via data-field ---
    document.querySelectorAll('.seva-input').forEach((el) => {
      const field = el.getAttribute('data-field');
      if (field) this.setNestedValue(data, field, el.value);
    });

    // --- Collect textareas via data-field ---
    document.querySelectorAll('.seva-textarea').forEach((el) => {
      const field = el.getAttribute('data-field');
      if (field) this.setNestedValue(data, field, el.value);
    });

    // Japa minutes (may also have data-field, but ensure it's captured)
    if (this.dom.japaMinutes) {
      data.sadhana.japaMinutes = parseInt(this.dom.japaMinutes.value, 10) || 0;
    }

    localStorage.setItem(this.getDateKey(this.currentDate), JSON.stringify(data));
  }

  /**
   * Load data from localStorage and populate form fields.
   * @param {string} dateKey
   */
  loadData(dateKey) {
    const raw = localStorage.getItem(dateKey);
    const data = raw ? JSON.parse(raw) : this.getEmptyEntry(this.toISODate(this.currentDate));

    // Non-negotiables
    if (this.dom.nn1) this.dom.nn1.value = data.nonNegotiables?.[0] ?? '';
    if (this.dom.nn2) this.dom.nn2.value = data.nonNegotiables?.[1] ?? '';
    if (this.dom.nn3) this.dom.nn3.value = data.nonNegotiables?.[2] ?? '';

    // Checkboxes
    document.querySelectorAll('.task-check').forEach((el) => {
      const field = el.getAttribute('data-field');
      if (field) el.checked = !!this.getNestedValue(data, field);
    });

    // Sliders
    document.querySelectorAll('.score-slider').forEach((el) => {
      const field = el.getAttribute('data-field');
      if (field) {
        const val = this.getNestedValue(data, field) ?? 5;
        el.value = val;
        this.updateSliderDisplay(el);
      }
    });

    // Text inputs
    document.querySelectorAll('.seva-input').forEach((el) => {
      const field = el.getAttribute('data-field');
      if (field) el.value = this.getNestedValue(data, field) ?? '';
    });

    // Textareas
    document.querySelectorAll('.seva-textarea').forEach((el) => {
      const field = el.getAttribute('data-field');
      if (field) el.value = this.getNestedValue(data, field) ?? '';
    });

    // Japa minutes
    if (this.dom.japaMinutes) {
      this.dom.japaMinutes.value = data.sadhana?.japaMinutes ?? 0;
    }
  }

  /* ─────────────────────────────────────────────
     NESTED OBJECT HELPERS
  ───────────────────────────────────────────── */

  /**
   * Set a value in a nested object by dot-path.
   * @param {object} obj
   * @param {string} path — e.g. "sadhana.meditation"
   * @param {*} value
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }

  /**
   * Read a value from a nested object by dot-path.
   * @param {object} obj
   * @param {string} path
   * @returns {*}
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  /* ─────────────────────────────────────────────
     PROGRESS RING
  ───────────────────────────────────────────── */

  /** Recalculate and repaint the progress ring + subtitle */
  updateProgress() {
    const checks = document.querySelectorAll('.task-check');
    const total = checks.length || 23; // fallback
    let checked = 0;
    checks.forEach((el) => { if (el.checked) checked++; });
    const pct = Math.round((checked / total) * 100);

    // Ring offset
    const offset = SevaApp.CIRCUMFERENCE - (pct / 100) * SevaApp.CIRCUMFERENCE;
    if (this.dom.progressRing) {
      this.dom.progressRing.style.strokeDasharray = `${SevaApp.CIRCUMFERENCE}`;
      this.dom.progressRing.style.strokeDashoffset = `${offset}`;

      // Color by percentage
      if (pct <= 25) {
        this.dom.progressRing.style.stroke = '#ef4444'; // red
      } else if (pct <= 50) {
        this.dom.progressRing.style.stroke = '#f59e0b'; // amber
      } else if (pct <= 75) {
        this.dom.progressRing.style.stroke = '#22c55e'; // green
      } else {
        this.dom.progressRing.style.stroke = '#10b981'; // emerald
      }
    }

    // Text
    if (this.dom.progressText) {
      this.dom.progressText.textContent = `${pct}%`;
    }

    // Subtitle
    if (this.dom.progressSubtitle) {
      let msg;
      if (pct === 0) msg = 'Start your day with Sadhana';
      else if (pct <= 25) msg = 'Getting started...';
      else if (pct <= 50) msg = 'Building momentum!';
      else if (pct <= 75) msg = 'Strong progress 💪';
      else if (pct < 100) msg = 'Almost there! 🔥';
      else msg = 'Perfect day! 🏆';
      this.dom.progressSubtitle.textContent = msg;
    }
  }

  /* ─────────────────────────────────────────────
     SCORE SLIDERS
  ───────────────────────────────────────────── */

  /**
   * Update the display span next to a slider and apply color class.
   * @param {HTMLInputElement} slider
   */
  updateSliderDisplay(slider) {
    // Find the adjacent .score-value span
    const span =
      slider.parentElement?.querySelector('.score-value') ||
      document.getElementById(slider.id + 'Val');

    if (span) {
      const val = parseInt(slider.value, 10);
      span.textContent = val;

      // Remove previous color classes
      span.classList.remove('low', 'mid', 'high');

      if (val <= 3) span.classList.add('low');
      else if (val <= 6) span.classList.add('mid');
      else span.classList.add('high');
    }
  }

  /* ─────────────────────────────────────────────
     VIEW TOGGLE
  ───────────────────────────────────────────── */

  /**
   * Switch between dashboard and analytics views.
   * @param {'dashboard'|'analytics'} view
   */
  switchView(view) {
    // Hide all views
    document.querySelectorAll('.dashboard-view,.analytics-view,.gantt-view,.kanban-view,.tracker-view,.terminal-view')
      .forEach(v => { v.classList.add('hidden'); v.style.display = 'none'; });

    // Deactivate all toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));

    // Activate the matching button
    const activeBtn = document.querySelector(`.toggle-btn[data-view="${view}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Map view name → element id and display type
    const viewMap = {
      dashboard: { id: 'dashboardView',  display: 'block' },
      analytics: { id: 'analyticsView',  display: 'block' },
      gantt:     { id: 'ganttView',       display: 'block' },
      kanban:    { id: 'kanbanView',      display: 'block' },
      tracker:   { id: 'trackerView',     display: 'block' },
      terminal:  { id: 'terminalView',    display: 'flex'  },
    };

    const target = viewMap[view] || viewMap['dashboard'];
    const el = document.getElementById(target.id);
    if (el) {
      el.classList.remove('hidden');
      el.style.display = target.display;
    }

    // Render content
    if (view === 'analytics') this.renderAnalytics();
    else if (view === 'gantt') this.renderGantt();
    else if (view === 'kanban') this.renderKanban();
    else if (view === 'tracker') {
      try { this.renderTracker(); } catch(err) { console.error('Tracker render error:', err); }
    }
    else if (view === 'terminal') {
      try { this.initTerminal(); } catch(err) { console.error('Terminal init error:', err); }
    }
  }

  /* ─────────────────────────────────────────────
     ANTI-FREEZE PANEL
  ───────────────────────────────────────────── */

  /** Toggle the anti-freeze collapsible panel */
  toggleAntifreeze() {
    const panel = document.getElementById('antifreezePanel');
    const icon = this.dom.antifreezeIcon;

    if (!panel) return;

    const isExpanded = panel.classList.contains('expanded');

    if (isExpanded) {
      panel.classList.remove('expanded');
      if (icon) icon.textContent = '▸';
    } else {
      panel.classList.add('expanded');
      if (icon) icon.textContent = '▾';
    }
  }

  /* ─────────────────────────────────────────────
     EXPORT / IMPORT DATA
  ───────────────────────────────────────────── */

  /** Export all Seva data as a JSON file download */
  exportData() {
    try {
      var data = {};
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.startsWith('seva')) {
          try {
            data[key] = JSON.parse(localStorage.getItem(key));
          } catch(e) {
            data[key] = localStorage.getItem(key);
          }
        }
      }

      var jsonStr = JSON.stringify(data, null, 2);
      var blob = new Blob([jsonStr], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var dateStr = new Date().toISOString().split('T')[0];

      // Try download link first
      var a = document.createElement('a');
      a.href = url;
      a.download = 'seva-backup-' + dateStr + '.json';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      // Fallback: open in new tab if download didn't trigger
      setTimeout(function() {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);

      alert('✅ Export started! Check your downloads.');
    } catch(e) {
      alert('❌ Export failed: ' + e.message);
    }
  }

  /** Import Seva data from a JSON file */
  importData(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        var count = 0;
        var keys = Object.keys(data);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          if (key.startsWith('seva')) {
            var value = data[key];
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
            count++;
          }
        }
        alert('✅ Imported ' + count + ' entries successfully! Page will reload.');
        window.location.reload();
      } catch(err) {
        alert('❌ Failed to import: Invalid file format.');
      }
    };
    reader.readAsText(file);

    // Reset file input so same file can be re-imported
    event.target.value = '';
  }

  /* ─────────────────────────────────────────────
     CARD ANIMATION
  ───────────────────────────────────────────── */

  /** Stagger fadeInUp on section cards */
  animateCards() {
    const cards = document.querySelectorAll('.section-card');
    cards.forEach((card, i) => {
      card.style.animationDelay = `${i * 100}ms`;
      card.classList.add('fade-in-up');
    });
  }

  /* ─────────────────────────────────────────────
     ANALYTICS — DATA AGGREGATION
  ───────────────────────────────────────────── */

  /**
   * Gather saved entries for the last N days.
   * @param {number} days
   * @returns {{ date: string, data: object|null }[]}
   */
  getDataForRange(days) {
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = this.getDateKey(d);
      const raw = localStorage.getItem(key);
      result.push({
        date: this.toISODate(d),
        data: raw ? JSON.parse(raw) : null,
      });
    }
    return result;
  }

  /**
   * Count how many boolean fields are true in a data entry.
   * @param {object} data — a single day's data object
   * @returns {number}
   */
  countChecked(data) {
    if (!data) return 0;
    return SevaApp.BOOLEAN_FIELDS.reduce((sum, path) => {
      return sum + (this.getNestedValue(data, path) ? 1 : 0);
    }, 0);
  }

  /**
   * Completion percentage for a single entry.
   * @param {object} data
   * @returns {number} 0-100
   */
  completionPct(data) {
    if (!data) return 0;
    return Math.round((this.countChecked(data) / SevaApp.BOOLEAN_FIELDS.length) * 100);
  }

  /**
   * Section completion % for a single entry.
   * @param {object} data
   * @param {string[]} fields
   * @returns {number} 0-100
   */
  sectionPct(data, fields) {
    if (!data || !fields.length) return 0;
    const checked = fields.reduce((s, f) => s + (this.getNestedValue(data, f) ? 1 : 0), 0);
    return Math.round((checked / fields.length) * 100);
  }

  /**
   * Calculate the current streak (consecutive days with >0% completion,
   * starting from today and going backwards).
   * @returns {number}
   */
  calculateStreak() {
    let streak = 0;
    const d = new Date();
    d.setHours(0, 0, 0, 0);

    while (true) {
      const key = this.getDateKey(d);
      const raw = localStorage.getItem(key);
      if (!raw) break;
      const data = JSON.parse(raw);
      if (this.countChecked(data) === 0) break;
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  /* ─────────────────────────────────────────────
     ANALYTICS — RENDERING
  ───────────────────────────────────────────── */

  /** Master render for all analytics: stats + charts */
  renderAnalytics() {
    // Save current dashboard data first
    this.saveData();

    const entries = this.getDataForRange(this.analyticsRange);
    this.renderStats(entries);
    this.renderTodaySummary();
    this.renderCompletionChart(entries);
    this.renderSectionChart(entries);
    this.renderScoresChart(entries);
    this.renderRadarChart(entries);
  }

  /**
   * Update stat cards.
   * @param {{ date: string, data: object|null }[]} entries
   */
  renderStats(entries) {
    const withData = entries.filter((e) => e.data !== null);

    // Streak
    if (this.dom.statStreak) {
      this.dom.statStreak.textContent = this.calculateStreak();
    }

    // Total tasks checked
    if (this.dom.statTotalTasks) {
      const total = withData.reduce((s, e) => s + this.countChecked(e.data), 0);
      this.dom.statTotalTasks.textContent = total;
    }

    // Average completion %
    if (this.dom.statAvgCompletion) {
      const avg = withData.length
        ? Math.round(withData.reduce((s, e) => s + this.completionPct(e.data), 0) / withData.length)
        : 0;
      this.dom.statAvgCompletion.textContent = `${avg}%`;
    }

    // Average devotion
    if (this.dom.statAvgDevotion) {
      const avg = withData.length
        ? (withData.reduce((s, e) => s + (e.data?.sadhana?.devotion ?? 0), 0) / withData.length).toFixed(1)
        : '0.0';
      this.dom.statAvgDevotion.textContent = avg;
    }

    // Range label
    if (this.dom.rangeLabel) {
      const labels = { 1: 'Today', 7: 'Last 7 days', 30: 'Last 30 days', 90: 'Last 90 days', 365: 'Last 365 days' };
      this.dom.rangeLabel.textContent = labels[this.analyticsRange] || `Last ${this.analyticsRange} days`;
    }
  }

  /* ── TODAY'S SUMMARY ── */

  /** Render a detailed breakdown of today's data */
  renderTodaySummary() {
    const container = document.getElementById('todaySummaryContent');
    const card = document.getElementById('todaySummaryCard');
    if (!container || !card) return;

    // Show/hide based on range
    if (this.analyticsRange !== 1) {
      card.style.display = 'none';
      return;
    }
    card.style.display = '';

    const key = this.getDateKey(new Date());
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : null;

    if (!data) {
      container.innerHTML = `<p style="color:#64748b;font-size:0.875rem;text-align:center;padding:1.5rem 0;">No data recorded today yet. Start filling your dashboard!</p>`;
      return;
    }

    const sectionColors = {
      sadhana: '#f59e0b',
      body: '#10b981',
      deepWork: '#3b82f6',
      creative: '#8b5cf6',
      distribution: '#ec4899',
      system: '#06b6d4',
    };

    let html = '';

    // Per-section progress bars
    SevaApp.SECTIONS.forEach((section) => {
      const pct = this.sectionPct(data, section.fields);
      const checked = section.fields.filter(f => this.getNestedValue(data, f)).length;
      const total = section.fields.length;
      const color = sectionColors[section.key] || '#f59e0b';

      html += `
        <div style="display:flex;flex-direction:column;gap:0.25rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:0.8125rem;font-weight:600;color:#f8fafc;">${section.label}</span>
            <span style="font-size:0.75rem;font-weight:600;color:${color};">${checked}/${total} · ${pct}%</span>
          </div>
          <div style="height:6px;background:rgba(148,163,184,0.12);border-radius:9999px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${color};border-radius:9999px;transition:width 0.6s cubic-bezier(0.4,0,0.2,1);"></div>
          </div>
        </div>`;
    });

    // Scores row
    const calm = data.sadhana?.calm ?? '-';
    const focus = data.sadhana?.focus ?? '-';
    const devotion = data.sadhana?.devotion ?? '-';
    const energy = data.body?.energy ?? '-';

    html += `
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-top:0.5rem;padding-top:0.75rem;border-top:1px solid rgba(148,163,184,0.08);">
        <div style="flex:1;min-width:60px;text-align:center;padding:0.5rem;background:rgba(96,165,250,0.08);border-radius:8px;">
          <div style="font-size:1.25rem;font-weight:800;font-family:var(--font-heading);color:#60a5fa;">${calm}</div>
          <div style="font-size:0.625rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">Calm</div>
        </div>
        <div style="flex:1;min-width:60px;text-align:center;padding:0.5rem;background:rgba(245,158,11,0.08);border-radius:8px;">
          <div style="font-size:1.25rem;font-weight:800;font-family:var(--font-heading);color:#f59e0b;">${focus}</div>
          <div style="font-size:0.625rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">Focus</div>
        </div>
        <div style="flex:1;min-width:60px;text-align:center;padding:0.5rem;background:rgba(167,139,250,0.08);border-radius:8px;">
          <div style="font-size:1.25rem;font-weight:800;font-family:var(--font-heading);color:#a78bfa;">${devotion}</div>
          <div style="font-size:0.625rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">Devotion</div>
        </div>
        <div style="flex:1;min-width:60px;text-align:center;padding:0.5rem;background:rgba(16,185,129,0.08);border-radius:8px;">
          <div style="font-size:1.25rem;font-weight:800;font-family:var(--font-heading);color:#10b981;">${energy}</div>
          <div style="font-size:0.625rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">Energy</div>
        </div>
      </div>`;

    // Shipped + Creative output
    const shipped = data.deepWork?.shipped;
    const creative = data.creative?.output;
    const japa = data.sadhana?.japaMinutes;

    if (shipped || creative || japa) {
      html += `<div style="margin-top:0.5rem;padding-top:0.75rem;border-top:1px solid rgba(148,163,184,0.08);display:flex;flex-direction:column;gap:0.5rem;">`;
      if (japa) {
        html += `<div style="font-size:0.8125rem;color:#94a3b8;">🕉 Japa: <span style="color:#f59e0b;font-weight:600;">${japa} min</span></div>`;
      }
      if (shipped) {
        html += `<div style="font-size:0.8125rem;color:#94a3b8;">🚀 Shipped: <span style="color:#f8fafc;font-weight:500;">${shipped}</span></div>`;
      }
      if (creative) {
        html += `<div style="font-size:0.8125rem;color:#94a3b8;">🎵 Creative: <span style="color:#f8fafc;font-weight:500;">${creative}</span></div>`;
      }
      html += `</div>`;
    }

    // Non-negotiables
    const nn = data.nonNegotiables?.filter(n => n.trim());
    if (nn && nn.length) {
      html += `<div style="margin-top:0.5rem;padding-top:0.75rem;border-top:1px solid rgba(148,163,184,0.08);">`;
      html += `<div style="font-size:0.6875rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.375rem;">Non-Negotiables</div>`;
      nn.forEach((n, i) => {
        const icons = ['🎯', '🙏', '💪'];
        html += `<div style="font-size:0.8125rem;color:#f8fafc;padding:0.125rem 0;">${icons[i] || '•'} ${n}</div>`;
      });
      html += `</div>`;
    }

    container.innerHTML = html;
  }

  /* ── CHART.JS GLOBAL DEFAULTS ── */

  /** Apply global dark-theme defaults to Chart.js */
  applyChartDefaults() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.color = '#e2e8f0';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.animation = { duration: 800 };
    Chart.defaults.scale = Chart.defaults.scale || {};
  }

  /** Destroy a chart instance if it exists. */
  destroyChart(name) {
    if (this.charts[name]) {
      this.charts[name].destroy();
      this.charts[name] = null;
    }
  }

  /* ── CHART 1: COMPLETION TREND ── */

  /**
   * @param {{ date: string, data: object|null }[]} entries
   */
  renderCompletionChart(entries) {
    if (!this.dom.completionChart || typeof Chart === 'undefined') return;
    this.applyChartDefaults();
    this.destroyChart('completion');

    const labels = entries.map((e) => {
      const d = new Date(e.date + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const values = entries.map((e) => (e.data ? this.completionPct(e.data) : null));

    const ctx = this.dom.completionChart.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0.02)');

    this.charts.completion = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Completion %',
            data: values,
            borderColor: '#f59e0b',
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#f59e0b',
            spanGaps: true,
          },
        ],
      },
      options: {
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { callback: (v) => `${v}%` },
          },
          x: { grid: { color: 'rgba(255,255,255,0.05)' } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => `${ctx.parsed.y}%` },
          },
        },
      },
    });
  }

  /* ── CHART 2: SECTION PERFORMANCE ── */

  /**
   * @param {{ date: string, data: object|null }[]} entries
   */
  renderSectionChart(entries) {
    if (!this.dom.sectionChart || typeof Chart === 'undefined') return;
    this.applyChartDefaults();
    this.destroyChart('section');

    const withData = entries.filter((e) => e.data !== null);
    const labels = SevaApp.SECTIONS.map((s) => s.label);
    const colors = SevaApp.SECTIONS.map((s) => s.color);

    const values = SevaApp.SECTIONS.map((section) => {
      if (!withData.length) return 0;
      const avg = withData.reduce((sum, e) => sum + this.sectionPct(e.data, section.fields), 0) / withData.length;
      return Math.round(avg);
    });

    const ctx = this.dom.sectionChart.getContext('2d');
    this.charts.section = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Avg Completion %',
            data: values,
            backgroundColor: colors.map((c) => c + 'cc'),
            borderColor: colors,
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { callback: (v) => `${v}%` },
          },
          x: { grid: { display: false } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => `${ctx.parsed.y}%` },
          },
        },
      },
    });
  }

  /* ── CHART 3: SCORE TRENDS ── */

  /**
   * @param {{ date: string, data: object|null }[]} entries
   */
  renderScoresChart(entries) {
    if (!this.dom.scoresChart || typeof Chart === 'undefined') return;
    this.applyChartDefaults();
    this.destroyChart('scores');

    const labels = entries.map((e) => {
      const d = new Date(e.date + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const scoreSeries = [
      { label: 'Calm', path: 'sadhana.calm', color: '#60a5fa' },
      { label: 'Focus', path: 'sadhana.focus', color: '#f59e0b' },
      { label: 'Devotion', path: 'sadhana.devotion', color: '#a78bfa' },
      { label: 'Energy', path: 'body.energy', color: '#10b981' },
    ];

    const datasets = scoreSeries.map((s) => ({
      label: s.label,
      data: entries.map((e) => (e.data ? (this.getNestedValue(e.data, s.path) ?? null) : null)),
      borderColor: s.color,
      backgroundColor: s.color + '22',
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: s.color,
      spanGaps: true,
      fill: false,
    }));

    const ctx = this.dom.scoresChart.getContext('2d');
    this.charts.scores = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        scales: {
          y: {
            min: 1,
            max: 10,
            grid: { color: 'rgba(255,255,255,0.1)' },
          },
          x: { grid: { color: 'rgba(255,255,255,0.05)' } },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { usePointStyle: true, padding: 16 },
          },
        },
      },
    });
  }

  /* ── CHART 4: BALANCE RADAR ── */

  /**
   * @param {{ date: string, data: object|null }[]} entries
   */
  renderRadarChart(entries) {
    if (!this.dom.radarChart || typeof Chart === 'undefined') return;
    this.applyChartDefaults();
    this.destroyChart('radar');

    const withData = entries.filter((e) => e.data !== null);
    const labels = SevaApp.SECTIONS.map((s) => s.label);

    const values = SevaApp.SECTIONS.map((section) => {
      if (!withData.length) return 0;
      return Math.round(
        withData.reduce((sum, e) => sum + this.sectionPct(e.data, section.fields), 0) / withData.length,
      );
    });

    const ctx = this.dom.radarChart.getContext('2d');
    this.charts.radar = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: 'Balance',
            data: values,
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            borderColor: '#f59e0b',
            borderWidth: 2,
            pointBackgroundColor: '#f59e0b',
            pointRadius: 4,
          },
        ],
      },
      options: {
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              backdropColor: 'transparent',
              color: '#94a3b8',
            },
            grid: { color: 'rgba(255,255,255,0.1)' },
            angleLines: { color: 'rgba(255,255,255,0.1)' },
            pointLabels: { color: '#e2e8f0', font: { size: 12 } },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  }

  /* ─────────────────────────────────────────────
     RANGE PILL SELECTION
  ───────────────────────────────────────────── */

  /**
   * Handle a range-pill click.
   * @param {HTMLElement} pill
   */
  selectRange(pill) {
    document.querySelectorAll('.range-pill').forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
    this.analyticsRange = parseInt(pill.getAttribute('data-range'), 10) || 7;
    this.renderAnalytics();
  }

  /* ─────────────────────────────────────────────
     GANTT CHART — PROJECT TASKS
  ───────────────────────────────────────────── */

  // Static constants are defined after the class (see bottom of file)

  /** Load all gantt tasks from localStorage */
  loadGanttTasks() {
    const raw = localStorage.getItem(SevaApp.GANTT_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  /** Save all gantt tasks to localStorage */
  saveGanttTasks(tasks) {
    localStorage.setItem(SevaApp.GANTT_KEY, JSON.stringify(tasks));
  }

  /** Generate a simple unique ID */
  generateId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }

  /** Bind gantt-specific events (called once from init or first render) */
  bindGanttEvents() {
    if (this._ganttBound) return;
    this._ganttBound = true;

    // Add task button
    document.getElementById('addTaskBtn')?.addEventListener('click', () => this.openTaskModal());

    // Modal close
    document.getElementById('modalClose')?.addEventListener('click', () => this.closeTaskModal());

    // Modal backdrop click
    document.getElementById('taskModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'taskModal') this.closeTaskModal();
    });

    // Form submit
    document.getElementById('taskForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTask();
    });

    // Delete button
    document.getElementById('deleteTaskBtn')?.addEventListener('click', () => this.deleteTask());
  }

  /** Open the task modal for adding or editing */
  openTaskModal(task = null) {
    const modal = document.getElementById('taskModal');
    const title = document.getElementById('modalTitle');
    const deleteBtn = document.getElementById('deleteTaskBtn');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    if (task) {
      title.textContent = 'Edit Task';
      document.getElementById('taskId').value = task.id;
      document.getElementById('taskName').value = task.name;
      document.getElementById('taskStart').value = task.startDate;
      document.getElementById('taskEnd').value = task.endDate;
      document.getElementById('taskCategory').value = task.category;
      document.getElementById('taskStatus').value = task.status;
      document.getElementById('taskNotes').value = task.notes || '';
      deleteBtn.classList.remove('hidden');
    } else {
      title.textContent = 'Add Task';
      document.getElementById('taskForm').reset();
      document.getElementById('taskId').value = '';
      // Default start to today
      const today = new Date();
      document.getElementById('taskStart').value = this.toISODate(today);
      deleteBtn.classList.add('hidden');
    }
  }

  /** Close the task modal */
  closeTaskModal() {
    const modal = document.getElementById('taskModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }

  /** Save a task (add or update) */
  saveTask() {
    const id = document.getElementById('taskId').value;
    const name = document.getElementById('taskName').value.trim();
    const startDate = document.getElementById('taskStart').value;
    const endDate = document.getElementById('taskEnd').value;
    const category = document.getElementById('taskCategory').value;
    const status = document.getElementById('taskStatus').value;
    const notes = document.getElementById('taskNotes').value.trim();

    if (!name || !startDate || !endDate) return;

    const tasks = this.loadGanttTasks();

    if (id) {
      // Update existing
      const idx = tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], name, startDate, endDate, category, status, notes };
      }
    } else {
      // Add new
      tasks.push({ id: this.generateId(), name, startDate, endDate, category, status, notes });
    }

    this.saveGanttTasks(tasks);
    this.closeTaskModal();
    this.renderGantt();
  }

  /** Delete a task */
  deleteTask() {
    const id = document.getElementById('taskId').value;
    if (!id) return;

    let tasks = this.loadGanttTasks();
    tasks = tasks.filter(t => t.id !== id);
    this.saveGanttTasks(tasks);
    this.closeTaskModal();
    this.renderGantt();
  }

  /** Main Gantt render */
  renderGantt() {
    this.bindGanttEvents();

    const container = document.getElementById('ganttChart');
    const emptyMsg = document.getElementById('ganttEmpty');
    if (!container) return;

    const tasks = this.loadGanttTasks();

    if (!tasks.length) {
      container.innerHTML = '';
      if (emptyMsg) emptyMsg.style.display = 'block';
      return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

    // Sort by start date
    tasks.sort((a, b) => a.startDate.localeCompare(b.startDate));

    // Find the overall date range
    const allStarts = tasks.map(t => new Date(t.startDate + 'T00:00:00'));
    const allEnds = tasks.map(t => new Date(t.endDate + 'T00:00:00'));
    let minDate = new Date(Math.min(...allStarts));
    let maxDate = new Date(Math.max(...allEnds));

    // Add some padding (3 days before, 3 days after)
    minDate.setDate(minDate.getDate() - 3);
    maxDate.setDate(maxDate.getDate() + 3);

    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build header with date columns
    let html = '';

    // Generate month/day headers
    const months = [];
    const days = [];
    let currDate = new Date(minDate);
    let prevMonth = '';
    let monthSpan = 0;

    for (let i = 0; i < totalDays; i++) {
      const monthLabel = currDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const dayNum = currDate.getDate();
      const isToday = currDate.getTime() === today.getTime();
      const isWeekend = currDate.getDay() === 0 || currDate.getDay() === 6;

      if (monthLabel !== prevMonth) {
        if (prevMonth) months.push({ label: prevMonth, span: monthSpan });
        prevMonth = monthLabel;
        monthSpan = 1;
      } else {
        monthSpan++;
      }

      days.push({ num: dayNum, isToday, isWeekend });
      currDate.setDate(currDate.getDate() + 1);
    }
    if (prevMonth) months.push({ label: prevMonth, span: monthSpan });

    const colW = 32; // pixels per day
    const labelW = 180; // task label width
    const chartW = totalDays * colW;

    // Month header row
    html += `<div style="display:flex;position:sticky;top:0;z-index:2;">`;
    html += `<div style="min-width:${labelW}px;padding:0.5rem 0.75rem;font-size:0.6875rem;font-weight:600;color:#64748b;background:#0f1432;border-bottom:1px solid rgba(148,163,184,0.08);"></div>`;
    html += `<div style="display:flex;">`;
    months.forEach(m => {
      html += `<div style="width:${m.span * colW}px;text-align:center;padding:0.375rem 0;font-size:0.6875rem;font-weight:600;color:#94a3b8;background:#0f1432;border-bottom:1px solid rgba(148,163,184,0.08);border-left:1px solid rgba(148,163,184,0.06);">${m.label}</div>`;
    });
    html += `</div></div>`;

    // Day header row
    html += `<div style="display:flex;position:sticky;top:28px;z-index:2;">`;
    html += `<div style="min-width:${labelW}px;padding:0.25rem 0.75rem;font-size:0.625rem;font-weight:500;color:#64748b;background:#0a0e27;border-bottom:1px solid rgba(148,163,184,0.1);"></div>`;
    html += `<div style="display:flex;">`;
    days.forEach(d => {
      const bg = d.isToday ? 'rgba(245,158,11,0.15)' : d.isWeekend ? 'rgba(148,163,184,0.04)' : '#0a0e27';
      const clr = d.isToday ? '#f59e0b' : d.isWeekend ? '#475569' : '#64748b';
      html += `<div style="width:${colW}px;text-align:center;padding:0.25rem 0;font-size:0.5625rem;font-weight:${d.isToday ? '700' : '500'};color:${clr};background:${bg};border-bottom:1px solid rgba(148,163,184,0.1);border-left:1px solid rgba(148,163,184,0.04);">${d.num}</div>`;
    });
    html += `</div></div>`;

    // Task rows
    tasks.forEach(task => {
      const start = new Date(task.startDate + 'T00:00:00');
      const end = new Date(task.endDate + 'T00:00:00');
      const startOffset = Math.max(0, Math.ceil((start - minDate) / (1000 * 60 * 60 * 24)));
      const duration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

      // Determine bar color
      let barColor;
      if (task.status === 'completed') {
        barColor = '#10b981';
      } else if (task.status === 'in-progress' && end < today) {
        barColor = '#f43f5e'; // overdue
      } else if (task.status === 'not-started' && end < today) {
        barColor = '#f43f5e'; // overdue
      } else if (task.status === 'in-progress') {
        barColor = SevaApp.CATEGORY_COLORS[task.category] || '#f59e0b';
      } else {
        barColor = '#475569'; // not started
      }

      const isOverdue = end < today && task.status !== 'completed';
      const catLabel = SevaApp.CATEGORY_LABELS[task.category] || '📌 Other';

      html += `<div style="display:flex;align-items:center;border-bottom:1px solid rgba(148,163,184,0.06);cursor:pointer;transition:background 0.15s;" class="gantt-row" data-task-id="${task.id}" onmouseover="this.style.background='rgba(148,163,184,0.04)'" onmouseout="this.style.background='transparent'">`;

      // Task label
      html += `<div style="min-width:${labelW}px;padding:0.5rem 0.75rem;display:flex;flex-direction:column;gap:0.125rem;">`;
      html += `<span style="font-size:0.8125rem;font-weight:500;color:${task.status === 'completed' ? '#64748b' : '#f8fafc'};${task.status === 'completed' ? 'text-decoration:line-through;' : ''}white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:${labelW - 24}px;">${task.name}</span>`;
      html += `<span style="font-size:0.625rem;color:#64748b;">${catLabel}${isOverdue ? ' · <span style="color:#f43f5e;font-weight:600;">OVERDUE</span>' : ''}</span>`;
      html += `</div>`;

      // Bar area
      html += `<div style="position:relative;width:${chartW}px;height:36px;">`;

      // Today line (in each row for alignment)
      const todayOffset = Math.ceil((today - minDate) / (1000 * 60 * 60 * 24));
      if (todayOffset >= 0 && todayOffset < totalDays) {
        html += `<div style="position:absolute;left:${todayOffset * colW + colW / 2}px;top:0;bottom:0;width:2px;background:rgba(245,158,11,0.3);z-index:1;"></div>`;
      }

      // The bar
      const barLeft = startOffset * colW;
      const barWidth = duration * colW - 2;
      html += `<div style="position:absolute;left:${barLeft}px;top:8px;width:${barWidth}px;height:20px;background:${barColor};border-radius:4px;opacity:${task.status === 'completed' ? '0.6' : '0.85'};box-shadow:0 1px 4px rgba(0,0,0,0.3);z-index:2;transition:opacity 0.2s;">`;
      if (barWidth > 40) {
        html += `<span style="position:absolute;inset:0;display:flex;align-items:center;padding:0 6px;font-size:0.5625rem;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${task.name}</span>`;
      }
      html += `</div>`;

      html += `</div>`; // /bar area
      html += `</div>`; // /row
    });

    container.innerHTML = html;

    // Bind click on rows to edit
    container.querySelectorAll('.gantt-row').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-task-id');
        const task = this.loadGanttTasks().find(t => t.id === id);
        if (task) this.openTaskModal(task);
      });
    });
  }

  /* ─────────────────────────────────────────────
     KANBAN BOARD
  ───────────────────────────────────────────── */

  /** Load kanban cards from localStorage */
  loadKanbanCards() {
    const raw = localStorage.getItem('seva-kanban-cards');
    return raw ? JSON.parse(raw) : [];
  }

  /** Save kanban cards to localStorage */
  saveKanbanCards(cards) {
    localStorage.setItem('seva-kanban-cards', JSON.stringify(cards));
  }

  /** Generate unique ID */
  generateKanbanId() {
    return 'card-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /** Bind kanban events */
  bindKanbanEvents() {
    // Add card button
    document.getElementById('addKanbanCardBtn')?.addEventListener('click', () => this.promptAddCard());

    // Enable drag and drop
    this.setupKanbanDragDrop();
  }

  /** Setup drag and drop for kanban */
  setupKanbanDragDrop() {
    const columns = document.querySelectorAll('.kanban-column-body');
    
    columns.forEach(column => {
      column.addEventListener('dragover', (e) => {
        e.preventDefault();
        column.style.background = 'rgba(245, 158, 11, 0.08)';
      });

      column.addEventListener('dragleave', (e) => {
        column.style.background = '';
      });

      column.addEventListener('drop', (e) => {
        e.preventDefault();
        column.style.background = '';
        
        const cardId = e.dataTransfer.getData('text/plain');
        const targetColumn = column.getAttribute('data-column');
        
        this.moveCard(cardId, targetColumn);
      });
    });
  }

  /** Move card to different column */
  moveCard(cardId, newColumn) {
    const cards = this.loadKanbanCards();
    const card = cards.find(c => c.id === cardId);
    
    if (card) {
      card.status = newColumn;
      this.saveKanbanCards(cards);
      this.renderKanban();
    }
  }

  /** Prompt to add a new card */
  promptAddCard() {
    const title = prompt('Enter card title:');
    if (!title || !title.trim()) return;

    const description = prompt('Enter card description (optional):') || '';
    
    const cards = this.loadKanbanCards();
    cards.push({
      id: this.generateKanbanId(),
      title: title.trim(),
      description: description.trim(),
      status: 'todo',
      createdAt: new Date().toISOString(),
      priority: 'medium'
    });

    this.saveKanbanCards(cards);
    this.renderKanban();
  }

  /** Edit a card */
  editCard(cardId) {
    const cards = this.loadKanbanCards();
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const newTitle = prompt('Edit card title:', card.title);
    if (newTitle === null) return;

    const newDesc = prompt('Edit card description:', card.description);
    if (newDesc === null) return;

    card.title = newTitle.trim() || card.title;
    card.description = newDesc !== null ? newDesc.trim() : card.description;

    this.saveKanbanCards(cards);
    this.renderKanban();
  }

  /** Delete a card */
  deleteCard(cardId) {
    if (!confirm('Delete this card?')) return;

    let cards = this.loadKanbanCards();
    cards = cards.filter(c => c.id !== cardId);
    
    this.saveKanbanCards(cards);
    this.renderKanban();
  }

  /** Render kanban board */
  renderKanban() {
    this.bindKanbanEvents();

    const cards = this.loadKanbanCards();
    const emptyMsg = document.getElementById('kanbanEmpty');
    const board = document.getElementById('kanbanBoard');

    if (!cards.length) {
      if (board) board.style.display = 'none';
      if (emptyMsg) emptyMsg.style.display = 'block';
      return;
    }

    if (board) board.style.display = 'grid';
    if (emptyMsg) emptyMsg.style.display = 'none';

    // Group cards by status
    const columns = {
      todo: cards.filter(c => c.status === 'todo'),
      inprogress: cards.filter(c => c.status === 'inprogress'),
      review: cards.filter(c => c.status === 'review'),
      done: cards.filter(c => c.status === 'done')
    };

    // Update column counts
    document.getElementById('todoCount').textContent = columns.todo.length;
    document.getElementById('inprogressCount').textContent = columns.inprogress.length;
    document.getElementById('reviewCount').textContent = columns.review.length;
    document.getElementById('doneCount').textContent = columns.done.length;

    // Render each column
    ['todo', 'inprogress', 'review', 'done'].forEach(status => {
      const columnEl = document.getElementById(status + 'Column');
      if (!columnEl) return;

      columnEl.innerHTML = columns[status].map(card => this.renderKanbanCard(card)).join('');

      // Add event listeners to cards
      columnEl.querySelectorAll('.kanban-card').forEach(cardEl => {
        const cardId = cardEl.getAttribute('data-card-id');

        // Drag events
        cardEl.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', cardId);
          cardEl.style.opacity = '0.5';
        });

        cardEl.addEventListener('dragend', (e) => {
          cardEl.style.opacity = '1';
        });

        // Edit on click
        cardEl.querySelector('.kanban-card-content')?.addEventListener('click', () => {
          this.editCard(cardId);
        });

        // Delete button
        cardEl.querySelector('.kanban-card-delete')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteCard(cardId);
        });
      });
    });
  }

  /** Render a single kanban card */
  renderKanbanCard(card) {
    const priorityColors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#f43f5e'
    };

    const priorityColor = priorityColors[card.priority] || '#94a3b8';

    return `
      <div class="kanban-card" data-card-id="${card.id}" draggable="true">
        <div class="kanban-card-header">
          <div class="kanban-card-priority" style="background:${priorityColor};"></div>
          <button class="kanban-card-delete" title="Delete card">×</button>
        </div>
        <div class="kanban-card-content">
          <h4 class="kanban-card-title">${this.escapeHtml(card.title)}</h4>
          ${card.description ? `<p class="kanban-card-description">${this.escapeHtml(card.description)}</p>` : ''}
        </div>
      </div>
    `;
  }

  /** Escape HTML to prevent XSS */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* ─────────────────────────────────────────────
     PROGRESS TRACKER
  ───────────────────────────────────────────── */

  /** Load tracker items from localStorage */
  loadTrackerItems() {
    const raw = localStorage.getItem('seva-tracker-items');
    return raw ? JSON.parse(raw) : [];
  }

  /** Save tracker items to localStorage */
  saveTrackerItems(items) {
    localStorage.setItem('seva-tracker-items', JSON.stringify(items));
  }

  /** Generate unique ID */
  generateTrackerId() {
    return 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /** Bind tracker events */
  bindTrackerEvents() {
    document.getElementById('addTrackerItemBtn')?.addEventListener('click', () => this.promptAddTrackerItem());
  }

  /** Prompt to add a new tracker item */
  promptAddTrackerItem() {
    const title = prompt('Enter item title:');
    if (!title || !title.trim()) return;

    const items = this.loadTrackerItems();
    items.push({
      id: this.generateTrackerId(),
      title: title.trim(),
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
      subItems: [],
      createdAt: new Date().toISOString(),
      expanded: true
    });

    this.saveTrackerItems(items);
    this.renderTracker();
  }

  /** Add sub-item to a parent item */
  addSubItem(parentId) {
    const title = prompt('Enter sub-item title:');
    if (!title || !title.trim()) return;

    const items = this.loadTrackerItems();
    const parent = this.findItemById(items, parentId);
    
    if (parent) {
      if (!parent.subItems) parent.subItems = [];
      parent.subItems.push({
        id: this.generateTrackerId(),
        title: title.trim(),
        progress: 0,
        completed: false,
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });

      // Recalculate parent progress
      this.updateParentProgress(parent);
      
      this.saveTrackerItems(items);
      this.renderTracker();
    }
  }

  /** Find item by ID (including nested sub-items) */
  findItemById(items, id) {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.subItems) {
        for (const sub of item.subItems) {
          if (sub.id === id) return sub;
        }
      }
    }
    return null;
  }

  /** Update parent progress based on sub-items */
  updateParentProgress(parent) {
    if (!parent.subItems || parent.subItems.length === 0) {
      return;
    }
    
    const completed = parent.subItems.filter(s => s.completed).length;
    parent.progress = Math.round((completed / parent.subItems.length) * 100);
  }

  /** Toggle sub-item completion */
  toggleSubItem(parentId, subId) {
    const items = this.loadTrackerItems();
    const parent = this.findItemById(items, parentId);
    
    if (parent && parent.subItems) {
      const subItem = parent.subItems.find(s => s.id === subId);
      if (subItem) {
        subItem.completed = !subItem.completed;
        this.updateParentProgress(parent);
        this.saveTrackerItems(items);
        this.renderTracker();
      }
    }
  }

  /** Edit item */
  editTrackerItem(itemId) {
    const items = this.loadTrackerItems();
    const item = this.findItemById(items, itemId);
    if (!item) return;

    const newTitle = prompt('Edit title:', item.title);
    if (newTitle === null) return;

    const newNotes = prompt('Edit notes:', item.notes || '');
    
    item.title = newTitle.trim() || item.title;
    item.notes = newNotes !== null ? newNotes.trim() : item.notes;

    this.saveTrackerItems(items);
    this.renderTracker();
  }

  /** Update progress manually */
  updateProgress(itemId, newProgress) {
    const items = this.loadTrackerItems();
    const item = this.findItemById(items, itemId);
    
    if (item) {
      item.progress = Math.max(0, Math.min(100, parseInt(newProgress) || 0));
      this.saveTrackerItems(items);
      this.renderTracker();
    }
  }

  /** Delete tracker item */
  deleteTrackerItem(itemId) {
    if (!confirm('Delete this item and all its sub-items?')) return;

    let items = this.loadTrackerItems();
    items = items.filter(i => i.id !== itemId);
    
    this.saveTrackerItems(items);
    this.renderTracker();
  }

  /** Delete sub-item */
  deleteSubItem(parentId, subId) {
    if (!confirm('Delete this sub-item?')) return;

    const items = this.loadTrackerItems();
    const parent = this.findItemById(items, parentId);
    
    if (parent && parent.subItems) {
      parent.subItems = parent.subItems.filter(s => s.id !== subId);
      this.updateParentProgress(parent);
      this.saveTrackerItems(items);
      this.renderTracker();
    }
  }

  /** Toggle item expansion */
  toggleExpanded(itemId) {
    const items = this.loadTrackerItems();
    const item = this.findItemById(items, itemId);
    
    if (item) {
      item.expanded = !item.expanded;
      this.saveTrackerItems(items);
      this.renderTracker();
    }
  }

  /** Render tracker view */
  renderTracker() {
    this.bindTrackerEvents();

    const items = this.loadTrackerItems();
    const container = document.getElementById('trackerItemsContainer');
    const emptyMsg = document.getElementById('trackerEmpty');

    if (!items.length) {
      if (container) container.style.display = 'none';
      if (emptyMsg) emptyMsg.style.display = 'block';
      return;
    }

    if (container) container.style.display = 'flex';
    if (emptyMsg) emptyMsg.style.display = 'none';

    if (!container) return;
    container.innerHTML = items.map(item => this.renderTrackerItem(item)).join('');

    // Bind events
    this.bindTrackerItemEvents();
  }

  /** Bind events to tracker items */
  bindTrackerItemEvents() {
    // Toggle expansion
    document.querySelectorAll('.tracker-item-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-item-id');
        this.toggleExpanded(itemId);
      });
    });

    // Edit item
    document.querySelectorAll('.tracker-item-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-item-id');
        this.editTrackerItem(itemId);
      });
    });

    // Delete item
    document.querySelectorAll('.tracker-item-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-item-id');
        this.deleteTrackerItem(itemId);
      });
    });

    // Add sub-item
    document.querySelectorAll('.tracker-add-sub').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-item-id');
        this.addSubItem(itemId);
      });
    });

    // Toggle sub-item
    document.querySelectorAll('.tracker-subitem-check').forEach(check => {
      check.addEventListener('change', () => {
        const parentId = check.getAttribute('data-parent-id');
        const subId = check.getAttribute('data-sub-id');
        this.toggleSubItem(parentId, subId);
      });
    });

    // Delete sub-item
    document.querySelectorAll('.tracker-subitem-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const parentId = btn.getAttribute('data-parent-id');
        const subId = btn.getAttribute('data-sub-id');
        this.deleteSubItem(parentId, subId);
      });
    });

    // Progress slider
    document.querySelectorAll('.tracker-progress-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const itemId = slider.getAttribute('data-item-id');
        const valueSpan = document.getElementById('progress-value-' + itemId);
        if (valueSpan) valueSpan.textContent = slider.value + '%';
      });

      slider.addEventListener('change', (e) => {
        const itemId = slider.getAttribute('data-item-id');
        this.updateProgress(itemId, slider.value);
      });
    });
  }

  /** Render a single tracker item */
  renderTrackerItem(item) {
    const progressColor = item.progress >= 75 ? '#10b981' : item.progress >= 50 ? '#f59e0b' : item.progress >= 25 ? '#f59e0b' : '#94a3b8';
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = item.expanded !== false;

    let html = `
      <div class="tracker-item" data-item-id="${item.id}">
        <div class="tracker-item-header">
          <div style="display:flex;align-items:center;gap:0.5rem;flex:1;">
            ${hasSubItems ? `
              <button class="tracker-item-toggle" data-item-id="${item.id}" style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border:none;background:transparent;color:var(--text-muted);cursor:pointer;transition:all 0.15s;border-radius:4px;">
                <span style="transition:transform 0.3s;display:inline-block;transform:rotate(${isExpanded ? '90deg' : '0deg'});">▸</span>
              </button>
            ` : '<div style="width:24px;"></div>'}
            
            <div style="flex:1;">
              <h3 class="tracker-item-title">${this.escapeHtml(item.title)}</h3>
              <div style="display:flex;align-items:center;gap:1rem;margin-top:0.25rem;flex-wrap:wrap;">
                <span style="font-size:0.75rem;color:var(--text-dim);">📅 ${item.startDate || 'No date'}</span>
                ${hasSubItems ? `<span style="font-size:0.75rem;color:var(--text-dim);">✓ ${item.subItems.filter(s => s.completed).length}/${item.subItems.length} complete</span>` : ''}
              </div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:0.5rem;">
            <button class="tracker-add-sub" data-item-id="${item.id}" title="Add sub-item" style="padding:0.25rem 0.75rem;border-radius:9999px;font-size:0.75rem;font-weight:600;background:rgba(245,158,11,0.15);color:var(--accent-saffron);border:none;cursor:pointer;transition:all 0.15s;">+ Sub</button>
            <button class="tracker-item-edit" data-item-id="${item.id}" title="Edit" style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:rgba(148,163,184,0.08);color:var(--text-muted);border:none;cursor:pointer;transition:all 0.15s;">✏️</button>
            <button class="tracker-item-delete" data-item-id="${item.id}" title="Delete" style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:rgba(244,63,94,0.08);color:var(--clr-danger);border:none;cursor:pointer;transition:all 0.15s;">🗑️</button>
          </div>
        </div>

        <div class="tracker-item-progress">
          <div style="display:flex;align-items:center;gap:1rem;">
            <input type="range" class="tracker-progress-slider" data-item-id="${item.id}" min="0" max="100" value="${item.progress || 0}" style="flex:1;height:6px;border-radius:9999px;background:rgba(148,163,184,0.12);outline:none;cursor:pointer;" />
            <span id="progress-value-${item.id}" style="font-family:var(--font-heading);font-weight:700;font-size:0.875rem;color:${progressColor};min-width:45px;text-align:right;">${item.progress || 0}%</span>
          </div>
          <div style="height:8px;background:rgba(148,163,184,0.12);border-radius:9999px;overflow:hidden;margin-top:0.5rem;">
            <div style="height:100%;width:${item.progress || 0}%;background:${progressColor};border-radius:9999px;transition:all 0.6s cubic-bezier(0.4,0,0.2,1);"></div>
          </div>
        </div>

        ${item.notes ? `<div class="tracker-item-notes">${this.escapeHtml(item.notes)}</div>` : ''}
    `;

    // Add sub-items if expanded
    if (hasSubItems && isExpanded) {
      html += `<div class="tracker-subitems">`;
      
      item.subItems.forEach(subItem => {
        html += `
          <div class="tracker-subitem" data-sub-id="${subItem.id}">
            <input type="checkbox" class="tracker-subitem-check" data-parent-id="${item.id}" data-sub-id="${subItem.id}" ${subItem.completed ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer;flex-shrink:0;" />
            
            <div style="flex:1;">
              <span style="font-size:0.875rem;color:var(--text-primary);${subItem.completed ? 'text-decoration:line-through;color:var(--text-dim);' : ''}">${this.escapeHtml(subItem.title)}</span>
              <div style="display:flex;align-items:center;gap:1rem;margin-top:0.25rem;">
                <span style="font-size:0.625rem;color:var(--text-dim);">📅 ${subItem.date || ''}</span>
                ${subItem.notes ? `<span style="font-size:0.625rem;color:var(--text-dim);">📝 ${this.escapeHtml(subItem.notes)}</span>` : ''}
              </div>
            </div>

            <button class="tracker-subitem-delete" data-parent-id="${item.id}" data-sub-id="${subItem.id}" title="Delete" style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:6px;background:transparent;color:var(--text-dim);font-size:1rem;border:none;cursor:pointer;transition:all 0.15s;opacity:0;">×</button>
          </div>
        `;
      });
      
      html += `</div>`;
    }

    html += `</div>`;

    return html;
  }

  /* ─────────────────────────────────────────────
     BLOOMBERG-STYLE TERMINAL
  ───────────────────────────────────────────── */

  initTerminal() {
    if (!this._terminalBound) {
      this._terminalBound = true;
      this._terminalWatchlist = this.loadTerminalWatchlist();
      this._terminalNotes     = this.loadTerminalNotes();
      this._terminalPanel     = 'watchlist';
      this.bindTerminalEvents();
      this.startTerminalClock();
    }
    this.renderTerminalPanel(this._terminalPanel);
    this.renderTerminalSidebar();
    this.renderTickerBar();
  }

  bindTerminalEvents() {
    document.querySelectorAll('.bbt-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.bbt-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this._terminalPanel = tab.getAttribute('data-panel');
        this.renderTerminalPanel(this._terminalPanel);
      });
    });
    document.getElementById('bbtAddBtn')?.addEventListener('click', () => this.terminalAddSymbol());
    document.getElementById('bbtAddSymbol')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.terminalAddSymbol();
    });
    document.getElementById('bbtRefreshBtn')?.addEventListener('click', () => this.terminalRefreshQuotes());
    document.getElementById('bbtNewsRefresh')?.addEventListener('click', () => this.renderNewsFeed());
    document.getElementById('bbtAddNoteBtn')?.addEventListener('click', () => this.terminalAddNote());
    document.getElementById('calcBtn')?.addEventListener('click', () => this.terminalCalcPnl());
  }

  startTerminalClock() {
    const tick = () => {
      const el = document.getElementById('bbtClock');
      if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
    };
    tick();
    setInterval(tick, 1000);
  }

  loadTerminalWatchlist() {
    const raw = localStorage.getItem('seva-terminal-watchlist');
    if (raw) return JSON.parse(raw);
    return [
      { symbol: 'AAPL', note: '' }, { symbol: 'TSLA', note: '' },
      { symbol: 'NVDA', note: '' }, { symbol: 'NIFTY', note: '' },
      { symbol: 'GOLD', note: '' },
    ];
  }
  saveTerminalWatchlist() {
    localStorage.setItem('seva-terminal-watchlist', JSON.stringify(this._terminalWatchlist));
  }

  loadTerminalNotes() {
    const raw = localStorage.getItem('seva-terminal-notes');
    return raw ? JSON.parse(raw) : [];
  }
  saveTerminalNotes() {
    localStorage.setItem('seva-terminal-notes', JSON.stringify(this._terminalNotes));
  }

  generateQuote(symbol) {
    const bases = {
      AAPL:185, TSLA:245, NVDA:890, MSFT:415, GOOGL:172, AMZN:195,
      META:510, NFLX:650, AMD:162, INTC:30, NIFTY:24800, SENSEX:81500,
      GOLD:2330, SILVER:27, BTC:68000, ETH:3800, SPY:535, QQQ:460,
    };
    const base   = bases[symbol.toUpperCase()] || (100 + Math.random() * 400);
    const chgPct = +(Math.random() * 6 - 3).toFixed(2);
    const price  = +(base * (1 + chgPct / 100)).toFixed(2);
    const chg    = +(price - base).toFixed(2);
    const high   = +(price * (1 + Math.random() * 0.015)).toFixed(2);
    const low    = +(price * (1 - Math.random() * 0.015)).toFixed(2);
    const vol    = Math.floor(Math.random() * 50_000_000 + 1_000_000);
    return { symbol: symbol.toUpperCase(), price, chg, chgPct, high, low, vol };
  }

  fmtNum(n) {
    return n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1e3 ? (n/1e3).toFixed(0)+'K' : n;
  }
  fmtPrice(n) {
    return n >= 10000 ? n.toLocaleString('en-IN') : (+n).toFixed(2);
  }

  renderWatchlistPanel() {
    const tbody = document.getElementById('bbtWatchlistBody');
    if (!tbody) return;
    if (!this._terminalWatchlist.length) {
      tbody.innerHTML = `<tr><td colspan="9" class="bbt-empty">No symbols. Add one above.</td></tr>`;
      return;
    }
    tbody.innerHTML = this._terminalWatchlist.map((item, idx) => {
      const q   = this.generateQuote(item.symbol);
      const up  = q.chg >= 0;
      const clr = up ? '#00e676' : '#ff5252';
      const arr = up ? '▲' : '▼';
      return `<tr class="bbt-row">
        <td class="bbt-symbol">${q.symbol}</td>
        <td class="bbt-price">${this.fmtPrice(q.price)}</td>
        <td style="color:${clr};font-weight:700;">${arr} ${Math.abs(q.chg)}</td>
        <td style="color:${clr};font-weight:700;">${arr} ${Math.abs(q.chgPct)}%</td>
        <td class="bbt-dim">${this.fmtPrice(q.high)}</td>
        <td class="bbt-dim">${this.fmtPrice(q.low)}</td>
        <td class="bbt-dim">${this.fmtNum(q.vol)}</td>
        <td><input class="bbt-input bbt-note-input" placeholder="Note..." value="${this.escapeHtml(item.note||'')}" data-idx="${idx}" style="width:120px;" /></td>
        <td><button class="bbt-remove-btn" data-idx="${idx}">✕</button></td>
      </tr>`;
    }).join('');
    tbody.querySelectorAll('.bbt-note-input').forEach(inp => {
      inp.addEventListener('blur', () => {
        this._terminalWatchlist[+inp.getAttribute('data-idx')].note = inp.value;
        this.saveTerminalWatchlist();
      });
    });
    tbody.querySelectorAll('.bbt-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._terminalWatchlist.splice(+btn.getAttribute('data-idx'), 1);
        this.saveTerminalWatchlist();
        this.renderWatchlistPanel();
        this.renderTickerBar();
      });
    });
    const lu = document.getElementById('bbtLastUpdate');
    if (lu) lu.textContent = 'Last update: ' + new Date().toLocaleTimeString();
    const st = document.getElementById('bbtStatus');
    if (st) st.textContent = 'QUOTES REFRESHED — ' + this._terminalWatchlist.length + ' symbols';
  }

  terminalAddSymbol() {
    const inp = document.getElementById('bbtAddSymbol');
    if (!inp) return;
    const sym = inp.value.trim().toUpperCase();
    if (!sym) return;
    if (this._terminalWatchlist.find(i => i.symbol === sym)) {
      this.terminalAlert(sym + ' already in watchlist', 'warn'); return;
    }
    this._terminalWatchlist.push({ symbol: sym, note: '' });
    this.saveTerminalWatchlist();
    inp.value = '';
    this.renderWatchlistPanel();
    this.renderTickerBar();
    this.terminalAlert(sym + ' added', 'info');
  }

  terminalRefreshQuotes() {
    this.renderWatchlistPanel();
    this.renderTickerBar();
    this.renderTerminalSidebar();
  }

  renderTickerBar() {
    const inner = document.getElementById('bbtTickerInner');
    if (!inner) return;
    const syms = [...this._terminalWatchlist.map(i => i.symbol),
      'SPY', 'QQQ', 'BTC', 'GOLD', 'NIFTY', 'ETH'];
    const html = syms.map(sym => {
      const q  = this.generateQuote(sym);
      const up = q.chg >= 0;
      const clr = up ? '#00e676' : '#ff5252';
      return `<span class="bbt-ticker-item">
        <span class="bbt-ticker-sym">${q.symbol}</span>
        <span class="bbt-ticker-price">${this.fmtPrice(q.price)}</span>
        <span style="color:${clr}">${up?'▲':'▼'}${Math.abs(q.chgPct)}%</span>
      </span>`;
    }).join('');
    inner.innerHTML = html + html;
  }

  renderNewsFeed() {
    const container = document.getElementById('bbtNewsFeed');
    if (!container) return;
    const headlines = [
      { tag:'MARKETS', time:'09:32', text:'Global equities rally on strong US jobs data; Nifty hits fresh highs.' },
      { tag:'TECH',    time:'09:45', text:'NVIDIA reports record data-center revenue; AI chip demand surges.' },
      { tag:'MACRO',   time:'10:01', text:'Fed minutes signal one more rate cut possible in 2026 if inflation cools.' },
      { tag:'CRYPTO',  time:'10:14', text:'Bitcoin holds above $68K; ETF inflows reach $500M in a single day.' },
      { tag:'INDIA',   time:'10:28', text:'RBI holds repo rate at 6.5%; Governor signals easing bias for Q3.' },
      { tag:'ENERGY',  time:'10:45', text:'Crude oil dips as OPEC+ signals output increase; WTI below $80.' },
      { tag:'EARNINGS',time:'11:00', text:'Apple beats Q2 estimates on Services growth; buyback expanded to $110B.' },
      { tag:'FOREX',   time:'11:15', text:'USD/INR stable near 83.40; Dollar index at 104 ahead of CPI release.' },
      { tag:'GOLD',    time:'11:30', text:'Gold retreats from record highs; strong dollar weighs on safe havens.' },
      { tag:'IPO',     time:'12:00', text:'Upcoming IPO pipeline robust; 3 major listings expected this quarter.' },
    ];
    container.innerHTML = headlines.map(h =>
      `<div class="bbt-news-item">
        <span class="bbt-news-tag">${h.tag}</span>
        <span class="bbt-news-time">${h.time}</span>
        <span class="bbt-news-text">${h.text}</span>
      </div>`).join('');
    const st = document.getElementById('bbtStatus');
    if (st) st.textContent = 'NEWS UPDATED — ' + new Date().toLocaleTimeString();
  }

  terminalAddNote() {
    const symbol = prompt('Symbol (optional):') || '';
    const text   = prompt('Note text:');
    if (!text || !text.trim()) return;
    this._terminalNotes.unshift({
      id: Date.now(), symbol: symbol.toUpperCase(),
      text: text.trim(), ts: new Date().toLocaleString()
    });
    this.saveTerminalNotes();
    this.renderNotesPanel();
  }

  renderNotesPanel() {
    const container = document.getElementById('bbtNotesContainer');
    if (!container) return;
    if (!this._terminalNotes.length) {
      container.innerHTML = `<div class="bbt-empty">No notes yet.</div>`; return;
    }
    container.innerHTML = this._terminalNotes.map(note =>
      `<div class="bbt-note-card">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem;">
          ${note.symbol ? `<span class="bbt-symbol" style="font-size:0.75rem;">${note.symbol}</span>` : ''}
          <span class="bbt-note-ts">${note.ts}</span>
          <button class="bbt-remove-btn" data-note-id="${note.id}" style="margin-left:auto;">✕</button>
        </div>
        <div class="bbt-note-text">${this.escapeHtml(note.text)}</div>
      </div>`).join('');
    container.querySelectorAll('.bbt-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = +btn.getAttribute('data-note-id');
        this._terminalNotes = this._terminalNotes.filter(n => n.id !== id);
        this.saveTerminalNotes();
        this.renderNotesPanel();
      });
    });
  }

  renderTerminalSidebar() {
    const indicesEl = document.getElementById('bbtIndices');
    if (indicesEl) {
      ['NIFTY','SENSEX','SPY','QQQ','BTC','GOLD'].forEach(sym => {
        const q  = this.generateQuote(sym);
        const up = q.chg >= 0;
        const clr = up ? '#00e676' : '#ff5252';
        const div = document.createElement('div');
        div.className = 'bbt-index-row';
        div.innerHTML = `<span class="bbt-index-name">${sym}</span>
          <span class="bbt-index-price">${this.fmtPrice(q.price)}</span>
          <span style="color:${clr};font-size:0.7rem;">${up?'▲':'▼'}${Math.abs(q.chgPct)}%</span>`;
        indicesEl.appendChild(div);
      });
    }
    const statsEl = document.getElementById('bbtPortfolioStats');
    if (statsEl) {
      const count   = this._terminalWatchlist.length;
      const gainers = this._terminalWatchlist.filter(i => this.generateQuote(i.symbol).chg >= 0).length;
      statsEl.innerHTML = `
        <div class="bbt-stat-row"><span>Symbols</span><span class="bbt-val">${count}</span></div>
        <div class="bbt-stat-row"><span>Gainers</span><span class="bbt-val" style="color:#00e676">${gainers}</span></div>
        <div class="bbt-stat-row"><span>Losers</span><span class="bbt-val" style="color:#ff5252">${count - gainers}</span></div>
        <div class="bbt-stat-row"><span>Notes</span><span class="bbt-val">${this._terminalNotes.length}</span></div>`;
    }
  }

  terminalCalcPnl() {
    const buy    = parseFloat(document.getElementById('calcBuy')?.value)  || 0;
    const sell   = parseFloat(document.getElementById('calcSell')?.value) || 0;
    const qty    = parseFloat(document.getElementById('calcQty')?.value)  || 0;
    const result = document.getElementById('calcResult');
    if (!result) return;
    if (!buy || !qty) { result.textContent = 'Enter valid values.'; return; }
    const gross = (sell - buy) * qty;
    const pct   = ((sell - buy) / buy * 100).toFixed(2);
    const up    = gross >= 0;
    result.innerHTML = `
      <div style="color:${up?'#00e676':'#ff5252'};font-size:0.9rem;font-weight:700;">
        ${up?'▲ PROFIT':'▼ LOSS'}: ₹${Math.abs(gross).toFixed(2)}
      </div>
      <div style="font-size:0.75rem;color:#aaa;margin-top:0.25rem;">
        ${pct}% · Qty ${qty} · Buy ${buy} → Sell ${sell}
      </div>`;
    this.terminalAlert('P&L: ' + (up?'+':'') + gross.toFixed(2), up ? 'info' : 'warn');
  }

  terminalAlert(msg, type = 'info') {
    const el = document.getElementById('bbtAlerts');
    if (!el) return;
    const div = document.createElement('div');
    div.className = 'bbt-alert bbt-alert-' + type;
    div.innerHTML = `<span>${new Date().toLocaleTimeString()}</span> ${this.escapeHtml(msg)}`;
    el.prepend(div);
    while (el.children.length > 6) el.removeChild(el.lastChild);
  }

  renderTerminalPanel(panel) {
    ['watchlist','news','notes'].forEach(p => {
      const id = 'panel' + p.charAt(0).toUpperCase() + p.slice(1);
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', p !== panel);
    });
    if (panel === 'watchlist') this.renderWatchlistPanel();
    if (panel === 'news')      this.renderNewsFeed();
    if (panel === 'notes')     this.renderNotesPanel();
  }

}

/** SVG progress ring circumference (2 × π × r, r = 52) */
SevaApp.CIRCUMFERENCE = 2 * Math.PI * 52;

/** Ordered list of all boolean (checkbox) field paths */
SevaApp.BOOLEAN_FIELDS = [
  'sadhana.japa',
  'sadhana.meditation',
  'sadhana.reading',
  'body.strength',
  'body.walk',
  'body.stretching',
  'deepWork.seo',
  'deepWork.affiliate',
  'deepWork.leads',
  'deepWork.funnel',
  'deepWork.upload',
  'deepWork.landingPage',
  'deepWork.techFixes',
  'creative.musicPractice',
  'creative.scriptReel',
  'creative.creativeExplore',
  'distribution.postReel',
  'distribution.pinterestYt',
  'distribution.blogRepurpose',
  'distribution.communityEngagement',
  'system.planning',
  'system.automation',
  'system.weeklyStructure',
];

/** Section definitions for analytics grouping */
SevaApp.SECTIONS = [
  { key: 'sadhana', label: 'Sadhana', color: '#f59e0b', fields: ['sadhana.japa', 'sadhana.meditation', 'sadhana.reading'] },
  { key: 'body', label: 'Body', color: '#10b981', fields: ['body.strength', 'body.walk', 'body.stretching'] },
  { key: 'deepWork', label: 'Deep Work', color: '#3b82f6', fields: ['deepWork.seo', 'deepWork.affiliate', 'deepWork.leads', 'deepWork.funnel', 'deepWork.upload', 'deepWork.landingPage', 'deepWork.techFixes'] },
  { key: 'creative', label: 'Creative', color: '#8b5cf6', fields: ['creative.musicPractice', 'creative.scriptReel', 'creative.creativeExplore'] },
  { key: 'distribution', label: 'Distribution', color: '#ec4899', fields: ['distribution.postReel', 'distribution.pinterestYt', 'distribution.blogRepurpose', 'distribution.communityEngagement'] },
  { key: 'system', label: 'System', color: '#06b6d4', fields: ['system.planning', 'system.automation', 'system.weeklyStructure'] },
];

/** Gantt chart constants */
SevaApp.GANTT_KEY = 'seva-gantt-tasks';

SevaApp.CATEGORY_COLORS = {
  deepwork: '#3b82f6',
  creative: '#8b5cf6',
  distribution: '#ec4899',
  system: '#06b6d4',
  sadhana: '#f59e0b',
  body: '#10b981',
  other: '#94a3b8',
};

SevaApp.CATEGORY_LABELS = {
  deepwork: '🧠 Deep Work',
  creative: '🎨 Creative',
  distribution: '📣 Distribution',
  system: '🧩 System',
  sadhana: '🕉 Sadhana',
  body: '💪 Body',
  other: '📌 Other',
};

/* ─────────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function() {
  var app = new SevaApp();
  app.init();

  // Expose globally for debugging in devtools
  window.sevaApp = app;
});
