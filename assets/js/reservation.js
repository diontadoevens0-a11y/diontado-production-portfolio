/* ==========================================================================
   DIONTADO PRODUCTION — MODULE RÉSERVATION & CALENDRIER ACCESSIBLE
   Sans paiement en ligne. Confirmation par réponse WhatsApp.
   ========================================================================== */
(function () {
  var cfg = window.DIONTADO_CONFIG || {};
  var data = window.DIONTADO_DATA || {};
  var BASE_PATH = cfg.BASE_PATH || '/diontado-production-portfolio';
  var WHATSAPP_NUMBER = cfg.WHATSAPP_NUMBER || '221764812391';
  var EMAIL_USER = cfg.EMAIL_USER || 'diontadoevens.0';
  var EMAIL_DOMAIN = cfg.EMAIL_DOMAIN || 'gmail.com';
  var PRESTATIONS = data.BOOKING_PRESTATIONS || [];

  var form = document.getElementById('bookingForm');
  if (!form) return;

  var serviceSelect = document.getElementById('contactService');
  var formulaSelect = document.getElementById('contactFormula');
  var priceSummaryRow = document.getElementById('priceSummaryRow');
  var studioPriceBox = document.getElementById('studioPriceBox');
  var surDevisBox = document.getElementById('surDevisBox');
  var totalPriceVal = document.getElementById('totalPriceVal');

  var dateHiddenInput = document.getElementById('contactDate');
  var timeInput = document.getElementById('contactTime');
  var locationInput = document.getElementById('contactLocation');
  var locationGroup = document.getElementById('contactLocationGroup');
  var peopleInput = document.getElementById('contactPeople');
  var nameInput = document.getElementById('contactName');
  var phoneInput = document.getElementById('contactPhone');
  var emailInput = document.getElementById('contactEmail');
  var detailsInput = document.getElementById('contactDetails');
  var acceptConditions = document.getElementById('acceptConditions');

  var summaryTextEl = document.getElementById('bookingSummaryText');
  var summaryRefEl = document.getElementById('bookingSummaryRef');
  var submitBtn = document.getElementById('bookingSubmitBtn');
  var emailAltBtn = document.getElementById('bookingEmailBtn');
  var feedbackBox = document.getElementById('bookingFeedback');

  /* Éléments du calendrier accessible */
  var calendarWrap = document.getElementById('calendarFieldWrap');
  var calendarWidget = document.getElementById('availabilityCalendar');
  var calendarMonthTitle = document.getElementById('calendarMonthTitle');
  var calendarPrevBtn = document.getElementById('calendarPrevMonth');
  var calendarNextBtn = document.getElementById('calendarNextMonth');
  var calendarGridBody = document.getElementById('calendarGridBody');
  var calendarSelectedBadge = document.getElementById('calendarSelectedBadge');
  var calendarSrStatus = document.getElementById('calendarSrStatus');
  var calendarFallbackWrap = document.getElementById('calendarFallbackWrap');
  var calendarFallbackInput = document.getElementById('contactDateFallback');

  var MONTHS_FR = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  var DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  var currentRefCode = generateReferenceCode();
  var disponibilites = {
    mis_a_jour: '',
    dates_indisponibles: [],
    jours_fermes_hebdo: []
  };
  var isFallbackMode = false;

  var today = getTodayLocal();
  var minMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
  var maxDate = addMonthsClamped(today, 12);
  var maxMonthDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth();
  var selectedIso = '';
  var focusedIso = toIsoDate(today);

  /* ------------------------------------------------------------------------
     UTILITAIRES
     ------------------------------------------------------------------------ */
  function escapeHTML(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatFcfa(amount) {
    if (amount == null || isNaN(amount)) return 'Sur devis';
    var digits = Math.round(Number(amount)).toString();
    var grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
    return grouped + '\u00A0FCFA';
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function getTodayLocal() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function addMonthsClamped(baseDate, monthsToAdd) {
    var targetYear = baseDate.getFullYear();
    var targetMonth = baseDate.getMonth() + monthsToAdd;
    var d = new Date(targetYear, targetMonth, 1);
    var daysInTarget = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    var day = Math.min(baseDate.getDate(), daysInTarget);
    return new Date(d.getFullYear(), d.getMonth(), day);
  }

  function toIsoDate(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function parseIsoDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
    if (!m) return null;
    var y = Number(m[1]);
    var mo = Number(m[2]) - 1;
    var d = Number(m[3]);
    var dt = new Date(y, mo, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
    return dt;
  }

  function formatFrenchDate(iso) {
    var dt = parseIsoDate(iso);
    if (!dt) return '';
    return DAYS_FR[dt.getDay()] + ' ' + dt.getDate() + ' ' + MONTHS_FR[dt.getMonth()] + ' ' + dt.getFullYear();
  }

  function generateReferenceCode() {
    var now = new Date();
    var yy = String(now.getFullYear()).slice(-2);
    var mm = pad2(now.getMonth() + 1);
    var dd = pad2(now.getDate());
    var charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    var suffix = '';
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      var arr = new Uint32Array(4);
      window.crypto.getRandomValues(arr);
      for (var i = 0; i < 4; i++) {
        suffix += charset.charAt(arr[i] % charset.length);
      }
    } else {
      for (var j = 0; j < 4; j++) {
        suffix += charset.charAt(Math.floor(Math.random() * charset.length));
      }
    }
    return 'DP-' + yy + mm + dd + '-' + suffix;
  }

  function announceSr(text) {
    if (!calendarSrStatus) return;
    calendarSrStatus.textContent = '';
    window.setTimeout(function () {
      calendarSrStatus.textContent = text;
    }, 20);
  }

  /* ------------------------------------------------------------------------
     1. GESTION DES PRESTATIONS, FORMULES & PRIX TOTAL
     ------------------------------------------------------------------------ */
  function findPrestation(value) {
    for (var i = 0; i < PRESTATIONS.length; i++) {
      if (PRESTATIONS[i].value === value) return PRESTATIONS[i];
    }
    return PRESTATIONS[0] || null;
  }

  function findFormula(prestation, formulaId) {
    if (!prestation || !prestation.formulas) return null;
    for (var i = 0; i < prestation.formulas.length; i++) {
      if (prestation.formulas[i].id === formulaId) return prestation.formulas[i];
    }
    return prestation.formulas[0] || null;
  }

  function populateServices() {
    if (!serviceSelect || PRESTATIONS.length === 0) return;
    serviceSelect.innerHTML = '';
    PRESTATIONS.forEach(function (item) {
      var opt = document.createElement('option');
      opt.value = item.value;
      opt.textContent = item.label;
      serviceSelect.appendChild(opt);
    });
  }

  function populateFormulas(prestation, preferredFormulaId) {
    if (!formulaSelect || !prestation) return;
    formulaSelect.innerHTML = '';
    prestation.formulas.forEach(function (f) {
      var opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.label + ' — ' + formatFcfa(f.price);
      formulaSelect.appendChild(opt);
    });
    if (preferredFormulaId) {
      var exists = prestation.formulas.some(function (f) { return f.id === preferredFormulaId; });
      if (exists) formulaSelect.value = preferredFormulaId;
    }
  }

  function updatePriceDisplay() {
    var prestation = findPrestation(serviceSelect ? serviceSelect.value : '');
    var formula = findFormula(prestation, formulaSelect ? formulaSelect.value : '');
    var isStudio = Boolean((prestation && prestation.isStudio) || (formula && formula.isStudio));
    var hasFixedPrice = Boolean(formula && typeof formula.price === 'number');

    if (totalPriceVal) {
      totalPriceVal.textContent = hasFixedPrice ? formatFcfa(formula.price) : 'Sur devis';
    }
    if (priceSummaryRow) {
      priceSummaryRow.classList.remove('is-hidden');
    }
    if (studioPriceBox) {
      studioPriceBox.classList.toggle('is-hidden', !isStudio);
    }
    if (surDevisBox) {
      surDevisBox.classList.toggle('is-hidden', hasFixedPrice);
    }
    if (locationGroup) {
      locationGroup.classList.toggle('is-hidden', isStudio);
      if (isStudio && locationInput && !locationInput.value.trim()) {
        locationInput.value = 'Studio Yeumbeul, Dakar';
      }
    }

    updateSummaryCard();
  }

  function applyQueryParams() {
    var params = new URLSearchParams(window.location.search || '');
    var qPrestation = params.get('prestation');
    var qFormule = params.get('formule');

    populateServices();

    var selectedPrest = PRESTATIONS[0] || null;
    if (qPrestation && serviceSelect) {
      var normalized = qPrestation.trim().toLowerCase();
      for (var i = 0; i < PRESTATIONS.length; i++) {
        if (PRESTATIONS[i].value.toLowerCase() === normalized || PRESTATIONS[i].label.toLowerCase().indexOf(normalized) !== -1) {
          selectedPrest = PRESTATIONS[i];
          serviceSelect.value = PRESTATIONS[i].value;
          break;
        }
      }
    }

    populateFormulas(selectedPrest, qFormule || null);
    updatePriceDisplay();
  }

  if (serviceSelect) {
    serviceSelect.addEventListener('change', function () {
      var prest = findPrestation(serviceSelect.value);
      populateFormulas(prest, null);
      updatePriceDisplay();
    });
  }

  if (formulaSelect) {
    formulaSelect.addEventListener('change', updatePriceDisplay);
  }

  /* ------------------------------------------------------------------------
     2. CALENDRIER MENSUEL DES DISPONIBILITÉS (ACCESSIBLE WCAG 2.1 AA)
     ------------------------------------------------------------------------ */
  function getDateStatus(dt) {
    var iso = toIsoDate(dt);
    if (dt.getTime() < today.getTime()) {
      return 'past';
    }
    if (dt.getTime() > maxDate.getTime()) {
      return 'unavailable';
    }
    if (disponibilites.dates_indisponibles.indexOf(iso) !== -1) {
      return 'unavailable';
    }
    if (disponibilites.jours_fermes_hebdo.indexOf(dt.getDay()) !== -1) {
      return 'unavailable';
    }
    return 'free';
  }

  function canNavigateMonth(year, month) {
    var candidate = new Date(year, month, 1);
    return candidate.getTime() >= minMonthDate.getTime() && candidate.getTime() <= maxMonthDate.getTime();
  }

  function renderCalendar() {
    if (!calendarGridBody || !calendarMonthTitle) return;

    calendarMonthTitle.textContent = MONTHS_FR[viewMonth] + ' ' + viewYear;

    if (calendarPrevBtn) {
      var prevMonthDate = new Date(viewYear, viewMonth - 1, 1);
      calendarPrevBtn.disabled = prevMonthDate.getTime() < minMonthDate.getTime();
    }
    if (calendarNextBtn) {
      var nextMonthDate = new Date(viewYear, viewMonth + 1, 1);
      calendarNextBtn.disabled = nextMonthDate.getTime() > maxMonthDate.getTime();
    }

    calendarGridBody.innerHTML = '';

    var firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    var startOffset = (firstDayOfMonth.getDay() + 6) % 7; // Lundi = 0

    var focusedDt = parseIsoDate(focusedIso);
    if (!focusedDt || focusedDt.getFullYear() !== viewYear || focusedDt.getMonth() !== viewMonth) {
      var selDt = parseIsoDate(selectedIso);
      if (selDt && selDt.getFullYear() === viewYear && selDt.getMonth() === viewMonth) {
        focusedIso = selectedIso;
      } else if (viewYear === today.getFullYear() && viewMonth === today.getMonth()) {
        focusedIso = toIsoDate(today);
      } else {
        focusedIso = toIsoDate(firstDayOfMonth);
      }
    }

    var totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    var rowEl = null;

    for (var cellIndex = 0; cellIndex < totalCells; cellIndex++) {
      if (cellIndex % 7 === 0) {
        rowEl = document.createElement('div');
        rowEl.className = 'calendar-week-row';
        rowEl.setAttribute('role', 'row');
        calendarGridBody.appendChild(rowEl);
      }

      var cellEl = document.createElement('div');
      cellEl.className = 'calendar-cell';
      cellEl.setAttribute('role', 'gridcell');

      var dayNum = cellIndex - startOffset + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        var spacer = document.createElement('span');
        spacer.className = 'calendar-spacer';
        spacer.setAttribute('aria-hidden', 'true');
        cellEl.appendChild(spacer);
        rowEl.appendChild(cellEl);
        continue;
      }

      var dt = new Date(viewYear, viewMonth, dayNum);
      var iso = toIsoDate(dt);
      var status = getDateStatus(dt);
      var isSelected = iso === selectedIso && status === 'free';
      var isToday = iso === toIsoDate(today);
      var isFocusable = iso === focusedIso;

      cellEl.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      if (status !== 'free') {
        cellEl.setAttribute('aria-disabled', 'true');
      }

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'calendar-day';
      btn.setAttribute('data-date', iso);
      btn.setAttribute('data-status', status);
      btn.setAttribute('tabindex', isFocusable ? '0' : '-1');
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

      var readableDate = formatFrenchDate(iso);
      if (status === 'past') {
        btn.classList.add('is-past');
        btn.setAttribute('aria-disabled', 'true');
        btn.setAttribute('aria-label', readableDate + ' — Date passée, non sélectionnable');
      } else if (status === 'unavailable') {
        btn.classList.add('is-unavailable');
        btn.setAttribute('aria-disabled', 'true');
        btn.setAttribute('aria-label', readableDate + ' — Date indisponible');
      } else {
        btn.setAttribute('aria-label', readableDate + (isSelected ? ' — Sélectionnée' : ' — Disponible'));
      }

      if (isToday) btn.classList.add('is-today');
      if (isSelected) btn.classList.add('is-selected');

      var labelSpan = document.createElement('span');
      labelSpan.textContent = String(dayNum);
      btn.appendChild(labelSpan);

      cellEl.appendChild(btn);
      rowEl.appendChild(cellEl);
    }

    if (calendarSelectedBadge) {
      calendarSelectedBadge.textContent = selectedIso
        ? 'Date retenue : ' + formatFrenchDate(selectedIso)
        : 'Aucune date sélectionnée';
    }
  }

  function selectDate(iso) {
    var dt = parseIsoDate(iso);
    if (!dt) return false;
    var status = getDateStatus(dt);
    if (status === 'unavailable') {
      announceSr('Date indisponible');
      return false;
    }
    if (status === 'past') {
      announceSr('Date passée, non sélectionnable');
      return false;
    }

    selectedIso = iso;
    focusedIso = iso;
    if (dateHiddenInput) dateHiddenInput.value = iso;
    if (calendarWidget) calendarWidget.removeAttribute('aria-invalid');
    clearFeedbackError();
    renderCalendar();
    announceSr('Date sélectionnée : ' + formatFrenchDate(iso));
    updateSummaryCard();
    return true;
  }

  function moveCalendarFocus(targetDate) {
    var clampedMin = today;
    var clampedMax = maxDate;
    var next = targetDate;

    if (next.getTime() < new Date(minMonthDate.getFullYear(), minMonthDate.getMonth(), 1).getTime()) {
      next = new Date(minMonthDate.getFullYear(), minMonthDate.getMonth(), 1);
    }
    var lastAllowedMonthEnd = new Date(maxMonthDate.getFullYear(), maxMonthDate.getMonth() + 1, 0);
    if (next.getTime() > lastAllowedMonthEnd.getTime()) {
      next = clampedMax;
    }

    viewYear = next.getFullYear();
    viewMonth = next.getMonth();
    focusedIso = toIsoDate(next);
    renderCalendar();

    if (calendarGridBody) {
      var targetBtn = calendarGridBody.querySelector('button[data-date="' + focusedIso + '"]');
      if (targetBtn) {
        targetBtn.focus();
        var st = targetBtn.getAttribute('data-status');
        if (st === 'unavailable') {
          announceSr(formatFrenchDate(focusedIso) + ' : Date indisponible');
        }
      }
    }
    void clampedMin;
  }

  if (calendarGridBody) {
    calendarGridBody.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-date]');
      if (!btn) return;
      var iso = btn.getAttribute('data-date');
      focusedIso = iso;
      selectDate(iso);
    });

    calendarGridBody.addEventListener('keydown', function (e) {
      var btn = e.target.closest('button[data-date]');
      if (!btn) return;
      var currentDt = parseIsoDate(btn.getAttribute('data-date'));
      if (!currentDt) return;

      var handled = true;
      var nextDt = null;

      if (e.key === 'ArrowLeft') {
        nextDt = new Date(currentDt.getFullYear(), currentDt.getMonth(), currentDt.getDate() - 1);
      } else if (e.key === 'ArrowRight') {
        nextDt = new Date(currentDt.getFullYear(), currentDt.getMonth(), currentDt.getDate() + 1);
      } else if (e.key === 'ArrowUp') {
        nextDt = new Date(currentDt.getFullYear(), currentDt.getMonth(), currentDt.getDate() - 7);
      } else if (e.key === 'ArrowDown') {
        nextDt = new Date(currentDt.getFullYear(), currentDt.getMonth(), currentDt.getDate() + 7);
      } else if (e.key === 'Home') {
        var offsetMon = (currentDt.getDay() + 6) % 7;
        nextDt = new Date(currentDt.getFullYear(), currentDt.getMonth(), currentDt.getDate() - offsetMon);
      } else if (e.key === 'End') {
        var offsetSun = 6 - ((currentDt.getDay() + 6) % 7);
        nextDt = new Date(currentDt.getFullYear(), currentDt.getMonth(), currentDt.getDate() + offsetSun);
      } else if (e.key === 'PageUp') {
        nextDt = addMonthsClamped(currentDt, -1);
      } else if (e.key === 'PageDown') {
        nextDt = addMonthsClamped(currentDt, 1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        selectDate(btn.getAttribute('data-date'));
        e.preventDefault();
        return;
      } else if (e.key === 'Escape') {
        selectedIso = '';
        if (dateHiddenInput) dateHiddenInput.value = '';
        renderCalendar();
        updateSummaryCard();
        announceSr('Sélection de date effacée');
        e.preventDefault();
        return;
      } else {
        handled = false;
      }

      if (handled && nextDt) {
        e.preventDefault();
        moveCalendarFocus(nextDt);
      }
    });
  }

  if (calendarPrevBtn) {
    calendarPrevBtn.addEventListener('click', function () {
      var target = new Date(viewYear, viewMonth - 1, 1);
      if (canNavigateMonth(target.getFullYear(), target.getMonth())) {
        viewYear = target.getFullYear();
        viewMonth = target.getMonth();
        renderCalendar();
      }
    });
  }

  if (calendarNextBtn) {
    calendarNextBtn.addEventListener('click', function () {
      var target = new Date(viewYear, viewMonth + 1, 1);
      if (canNavigateMonth(target.getFullYear(), target.getMonth())) {
        viewYear = target.getFullYear();
        viewMonth = target.getMonth();
        renderCalendar();
      }
    });
  }

  function enableFallbackCalendar() {
    isFallbackMode = true;
    if (calendarWidget) calendarWidget.classList.add('is-hidden');
    if (calendarFallbackWrap) calendarFallbackWrap.classList.remove('is-hidden');
    if (calendarFallbackInput) {
      calendarFallbackInput.setAttribute('min', toIsoDate(today));
      calendarFallbackInput.setAttribute('max', toIsoDate(maxDate));
      if (selectedIso) calendarFallbackInput.value = selectedIso;
      calendarFallbackInput.addEventListener('change', function () {
        if (dateHiddenInput) dateHiddenInput.value = calendarFallbackInput.value || '';
        selectedIso = calendarFallbackInput.value || '';
        updateSummaryCard();
      });
    }
  }

  function loadDisponibilites(onDone) {
    var jsonUrl = BASE_PATH.replace(/\/+$/, '') + '/assets/data/disponibilites.json';
    if (typeof window.fetch !== 'function') {
      enableFallbackCalendar();
      if (onDone) onDone(false);
      return;
    }

    fetch(jsonUrl, { credentials: 'same-origin', cache: 'no-store' })
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
      })
      .then(function (json) {
        if (!json || !Array.isArray(json.dates_indisponibles) || !Array.isArray(json.jours_fermes_hebdo)) {
          throw new Error('Format JSON invalide');
        }
        disponibilites = {
          mis_a_jour: String(json.mis_a_jour || ''),
          dates_indisponibles: json.dates_indisponibles.map(String),
          jours_fermes_hebdo: json.jours_fermes_hebdo.map(Number)
        };
        if (calendarWrap) calendarWrap.classList.remove('is-hidden');
        if (calendarFallbackWrap) calendarFallbackWrap.classList.add('is-hidden');
        renderCalendar();
        if (onDone) onDone(true);
      })
      .catch(function () {
        enableFallbackCalendar();
        if (onDone) onDone(false);
      });
  }

  /* ------------------------------------------------------------------------
     3. RÉCAPITULATIF EN DIRECT & VALIDATION
     ------------------------------------------------------------------------ */
  function collectBookingData() {
    var prestation = findPrestation(serviceSelect ? serviceSelect.value : '');
    var formula = findFormula(prestation, formulaSelect ? formulaSelect.value : '');
    var rawDate = (dateHiddenInput ? dateHiddenInput.value : '') || (isFallbackMode && calendarFallbackInput ? calendarFallbackInput.value : '');
    var isStudio = Boolean((prestation && prestation.isStudio) || (formula && formula.isStudio));
    var locationVal = locationInput ? locationInput.value.trim() : '';
    if (isStudio && !locationVal) {
      locationVal = 'Studio Yeumbeul, Dakar';
    }

    return {
      reference: currentRefCode,
      prestationLabel: prestation ? prestation.value : '',
      formulaLabel: formula ? formula.label : '',
      priceText: formula && typeof formula.price === 'number' ? formatFcfa(formula.price) : 'Sur devis',
      dateIso: rawDate.trim(),
      dateReadable: rawDate ? formatFrenchDate(rawDate.trim()) : '',
      time: timeInput ? timeInput.value : '',
      location: locationVal,
      people: peopleInput ? peopleInput.value.trim() : '',
      name: nameInput ? nameInput.value.trim() : '',
      phone: phoneInput ? phoneInput.value.trim() : '',
      email: emailInput ? emailInput.value.trim() : '',
      details: detailsInput ? detailsInput.value.trim() : '',
      acceptedConditions: Boolean(acceptConditions && acceptConditions.checked)
    };
  }

  function updateSummaryCard() {
    var d = collectBookingData();
    if (summaryRefEl) {
      summaryRefEl.textContent = d.reference;
    }
    if (!summaryTextEl) return;

    var parts = [
      d.prestationLabel || 'Prestation à choisir',
      d.formulaLabel ? d.formulaLabel + ' (' + d.priceText + ')' : d.priceText,
      d.dateReadable ? 'le ' + d.dateReadable : 'date à sélectionner'
    ];
    if (d.time) parts.push('créneau ' + d.time);
    summaryTextEl.textContent = parts.join(' · ');
  }

  [timeInput, locationInput, peopleInput, nameInput, phoneInput, emailInput, detailsInput].forEach(function (el) {
    if (!el) return;
    el.addEventListener('input', function () {
      el.removeAttribute('aria-invalid');
      updateSummaryCard();
    });
    el.addEventListener('change', function () {
      el.removeAttribute('aria-invalid');
      updateSummaryCard();
    });
  });

  if (acceptConditions) {
    acceptConditions.addEventListener('change', function () {
      acceptConditions.removeAttribute('aria-invalid');
      clearFeedbackError();
    });
  }

  function clearFeedbackError() {
    if (!feedbackBox) return;
    if (feedbackBox.classList.contains('is-error')) {
      feedbackBox.classList.remove('is-visible', 'is-error');
      feedbackBox.innerHTML = '';
    }
  }

  function showError(message, focusTarget) {
    if (feedbackBox) {
      feedbackBox.className = 'form-feedback is-visible is-error';
      feedbackBox.setAttribute('role', 'alert');
      feedbackBox.innerHTML =
        '<p class="feedback-kicker">Vérification requise</p>' +
        '<p class="feedback-lead">' + escapeHTML(message) + '</p>';
      feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (focusTarget && typeof focusTarget.focus === 'function') {
      focusTarget.focus();
    }
  }

  function buildBookingMessage(d) {
    var lines = [
      'Référence : ' + d.reference,
      'Bonjour DIONTADO PRODUCTION, je souhaite réserver une prestation.',
      '',
      '— Prestation : ' + d.prestationLabel,
      '— Formule : ' + d.formulaLabel,
      '— Tarif estimé : ' + d.priceText,
      '— Date souhaitée : ' + (d.dateReadable || d.dateIso) + ' (' + d.dateIso + ')',
      '— Créneau : ' + (d.time || 'À préciser'),
      '— Lieu : ' + (d.location || 'À préciser')
    ];
    if (d.people) lines.push('— Nombre de personnes : ' + d.people);
    lines.push('— Nom : ' + d.name);
    lines.push('— Téléphone / WhatsApp : ' + d.phone);
    if (d.email) lines.push('— E-mail : ' + d.email);
    if (d.details) lines.push('— Précisions : ' + d.details);
    lines.push('');
    lines.push('Conditions de réservation lues et acceptées.');
    return lines.join('\n');
  }

  function validateBookingForm(callback) {
    // Effacer les états invalides précédents
    [nameInput, phoneInput, timeInput, acceptConditions, calendarWidget, calendarFallbackInput].forEach(function (el) {
      if (el) el.removeAttribute('aria-invalid');
    });

    var d = collectBookingData();

    if (!d.name || d.name.length < 2) {
      if (nameInput) nameInput.setAttribute('aria-invalid', 'true');
      showError('Veuillez indiquer votre nom complet.', nameInput);
      return;
    }

    var phoneDigits = d.phone.replace(/\D/g, '');
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      if (phoneInput) phoneInput.setAttribute('aria-invalid', 'true');
      showError('Veuillez saisir un numéro de téléphone ou WhatsApp valide (8 à 15 chiffres).', phoneInput);
      return;
    }

    if (!d.dateIso) {
      if (isFallbackMode && calendarFallbackInput) {
        calendarFallbackInput.setAttribute('aria-invalid', 'true');
        showError('Veuillez sélectionner une date souhaitée.', calendarFallbackInput);
      } else if (calendarWidget) {
        calendarWidget.setAttribute('aria-invalid', 'true');
        var firstFocusBtn = calendarGridBody ? calendarGridBody.querySelector('button[tabindex="0"]') : null;
        showError('Veuillez sélectionner une date disponible dans le calendrier.', firstFocusBtn || calendarWidget);
      }
      return;
    }

    var chosenDt = parseIsoDate(d.dateIso);
    if (!chosenDt) {
      showError('La date sélectionnée n’est pas valide.', isFallbackMode ? calendarFallbackInput : calendarWidget);
      return;
    }

    if (!d.acceptedConditions) {
      if (acceptConditions) acceptConditions.setAttribute('aria-invalid', 'true');
      showError('Veuillez cocher la case « J’ai lu les conditions de réservation » avant d’envoyer votre demande.', acceptConditions);
      return;
    }

    // Re-vérifier le JSON des disponibilités avant l'envoi (si non fallback)
    if (isFallbackMode) {
      if (chosenDt.getTime() < today.getTime() || chosenDt.getTime() > maxDate.getTime()) {
        if (calendarFallbackInput) calendarFallbackInput.setAttribute('aria-invalid', 'true');
        showError('Veuillez choisir une date comprise entre aujourd’hui et les 12 prochains mois.', calendarFallbackInput);
        return;
      }
      callback(d);
      return;
    }

    loadDisponibilites(function () {
      if (isFallbackMode) {
        callback(d);
        return;
      }
      var freshStatus = getDateStatus(chosenDt);
      if (freshStatus === 'past') {
        selectedIso = '';
        if (dateHiddenInput) dateHiddenInput.value = '';
        if (calendarWidget) calendarWidget.setAttribute('aria-invalid', 'true');
        renderCalendar();
        showError('La date choisie est désormais passée. Merci de sélectionner une autre date.', calendarWidget);
        return;
      }
      if (freshStatus === 'unavailable') {
        selectedIso = '';
        if (dateHiddenInput) dateHiddenInput.value = '';
        if (calendarWidget) calendarWidget.setAttribute('aria-invalid', 'true');
        renderCalendar();
        announceSr('Date indisponible');
        showError('Cette date vient de passer en indisponible. Merci de choisir une autre date libre dans le calendrier.', calendarWidget);
        return;
      }
      callback(d);
    });
  }

  function renderConfirmationBox(d, channel) {
    if (!feedbackBox) return;
    var message = buildBookingMessage(d);
    var waHref = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
    var subject = 'Demande de réservation ' + d.reference + ' — ' + d.prestationLabel;
    var mailtoHref = 'mailto:' + EMAIL_USER + '@' + EMAIL_DOMAIN + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(message);

    feedbackBox.className = 'form-feedback is-visible';
    feedbackBox.setAttribute('role', 'status');
    feedbackBox.innerHTML =
      '<p class="feedback-kicker">Récapitulatif prêt · Référence ' + escapeHTML(d.reference) + '</p>' +
      '<p class="feedback-lead">Votre demande pour <strong>' + escapeHTML(d.formulaLabel) + '</strong> (' + escapeHTML(d.priceText) + ') le <strong>' + escapeHTML(d.dateReadable) + '</strong> est prête.</p>' +
      '<div class="feedback-proof-box"><strong>Important :</strong> Votre réservation est confirmée seulement après réponse de DIONTADO PRODUCTION sur WhatsApp.</div>' +
      '<div class="feedback-actions">' +
      '<a href="' + escapeHTML(waHref) + '" target="_blank" rel="noopener noreferrer" class="btn-whatsapp btn-feedback-wa">Ouvrir WhatsApp avec le récapitulatif</a>' +
      '<a href="' + escapeHTML(mailtoHref) + '" class="btn-outline btn-feedback-action">Envoyer par e-mail</a>' +
      '<button type="button" class="btn-outline btn-feedback-action" id="copyBookingMsgBtn">Copier le récapitulatif</button>' +
      '</div>';

    var copyBtn = document.getElementById('copyBookingMsgBtn');
    if (copyBtn && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(message).then(function () {
          copyBtn.textContent = 'Récapitulatif copié';
        }).catch(function () {
          copyBtn.textContent = 'Copie manuelle requise';
        });
      });
    }

    feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if (channel === 'whatsapp') {
      var win = window.open(waHref, '_blank', 'noopener,noreferrer');
      if (!win) {
        window.location.href = waHref;
      }
    } else if (channel === 'email') {
      window.location.href = mailtoHref;
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitBtn) submitBtn.disabled = true;
    validateBookingForm(function (d) {
      if (submitBtn) submitBtn.disabled = false;
      renderConfirmationBox(d, 'whatsapp');
    });
    if (submitBtn) {
      window.setTimeout(function () { submitBtn.disabled = false; }, 400);
    }
  });

  if (emailAltBtn) {
    emailAltBtn.addEventListener('click', function () {
      validateBookingForm(function (d) {
        renderConfirmationBox(d, 'email');
      });
    });
  }

  /* Initialisation */
  applyQueryParams();
  renderCalendar();
  loadDisponibilites();
})();
