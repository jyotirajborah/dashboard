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
  /** Chart.js instance references for cleanup before re-render */
  charts = {
    completion: null,
    section: null,
    scores: null,
    radar: null,
  };

  /** Currently viewed date (Date object, local midnight) */
  currentDate = new Date();

  /** SVG progress ring circumference (2 × π × r, r = 52) */
  static CIRCUMFERENCE = 2 * Math.PI * 52;

  /** Ordered list of all boolean (checkbox) field paths */
  static BOOLEAN_FIELDS = [
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
  static SECTIONS = [
    { key: 'sadhana', label: 'Sadhana', color: '#f59e0b', fields: ['sadhana.japa', 'sadhana.meditation', 'sadhana.reading'] },
    { key: 'body', label: 'Body', color: '#10b981', fields: ['body.strength', 'body.walk', 'body.stretching'] },
    { key: 'deepWork', label: 'Deep Work', color: '#3b82f6', fields: ['deepWork.seo', 'deepWork.affiliate', 'deepWork.leads', 'deepWork.funnel', 'deepWork.upload', 'deepWork.landingPage', 'deepWork.techFixes'] },
    { key: 'creative', label: 'Creative', color: '#8b5cf6', fields: ['creative.musicPractice', 'creative.scriptReel', 'creative.creativeExplore'] },
    { key: 'distribution', label: 'Distribution', color: '#ec4899', fields: ['distribution.postReel', 'distribution.pinterestYt', 'distribution.blogRepurpose', 'distribution.communityEngagement'] },
    { key: 'system', label: 'System', color: '#06b6d4', fields: ['system.planning', 'system.automation', 'system.weeklyStructure'] },
  ];

  /** Current analytics range (days) */
  analyticsRange = 7;

  /* ─────────────────────────────────────────────
     INITIALISATION
  ───────────────────────────────────────────── */

  /**
   * Bootstrap the application: cache DOM refs, bind events,
   * load today's data, paint the progress ring, and animate cards.
   */
  init() {
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
      dashboardView: document.getElementById('dashboardView'),
      analyticsView: document.getElementById('analyticsView'),

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

    // --- View toggle ---
    this.dom.dashboardBtn?.addEventListener('click', () => this.switchView('dashboard'));
    this.dom.analyticsBtn?.addEventListener('click', () => this.switchView('analytics'));

    // --- Anti-freeze toggle ---
    this.dom.antifreezeToggle?.addEventListener('click', () => this.toggleAntifreeze());

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
    if (view === 'analytics') {
      this.dom.dashboardView?.classList.add('hidden');
      this.dom.analyticsView?.classList.remove('hidden');
      this.dom.dashboardBtn?.classList.remove('active');
      this.dom.analyticsBtn?.classList.add('active');
      this.renderAnalytics();
    } else {
      this.dom.analyticsView?.classList.add('hidden');
      this.dom.dashboardView?.classList.remove('hidden');
      this.dom.analyticsBtn?.classList.remove('active');
      this.dom.dashboardBtn?.classList.add('active');
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
      const labels = { 7: 'Last 7 days', 30: 'Last 30 days', 90: 'Last 90 days', 365: 'Last 365 days' };
      this.dom.rangeLabel.textContent = labels[this.analyticsRange] || `Last ${this.analyticsRange} days`;
    }
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
}

/* ─────────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  const app = new SevaApp();
  app.init();

  // Expose globally for debugging in devtools
  window.sevaApp = app;
});
