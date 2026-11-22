/* ==========================================================================
   DIONTADO PRODUCTION — LOGIQUE DE RÉSERVATION, CALCUL 70/30, CONTRAT
   OBLIGATOIRE, TRAÇABILITÉ & TRANSMISSION WHATSAPP
   ========================================================================== */
(function () {
  var cfg = window.DIONTADO_CONFIG || {};
  var data = window.DIONTADO_DATA || {};
  var utils = window.DIONTADO_UTILS || {};

  var contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  var CONTRACT_VERSION = 'CONTRAT-DP-2026.1';
  var BOOKING_STORAGE_KEY = 'diontado_booking_records_v1';
  var WHATSAPP_NUMBER = cfg.WHATSAPP_NUMBER || '221764812391';
  var WAVE_PAYMENT_URL = cfg.WAVE_PAYMENT_URL || 'https://pay.wave.com/m/M_sn_IFRIA2vMxg-6/c/sn/';
  var CONTACT_EMAIL = (cfg.EMAIL_USER || 'diontadoproduction') + '@' + (cfg.EMAIL_DOMAIN || 'gmail.com');
  var BOOKING_PRESTATIONS = data.BOOKING_PRESTATIONS || [];

  var escapeHTML = utils.escapeHTML || function (str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  function sanitizeInput(str, multiline) {
    var clean = String(str == null ? '' : str);
    if (multiline) {
      clean = clean.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '');
    } else {
      clean = clean.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ');
    }
    return clean.trim();
  }

  function formatTarifAmount(amount, currency) {
    var formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
    return formatted + '\u00A0' + (currency || 'FCFA');
  }

  function formatFrenchDateTime(iso) {
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'long',
        timeStyle: 'medium'
      }).format(new Date(iso));
    } catch (_err) {
      return iso;
    }
  }

  var serviceSelect = document.getElementById('contactService');
  var formulaSelect = document.getElementById('contactFormula');
  var nameInput = document.getElementById('contactName');
  var phoneInput = document.getElementById('contactPhone');
  var emailInput = document.getElementById('contactEmail');
  var dateInput = document.getElementById('contactDate');
  var timeInput = document.getElementById('contactTime');
  var locationInput = document.getElementById('contactLocation');
  var messageInput = document.getElementById('contactMessage');
  var locationLabel = document.getElementById('contactLocationLabel');

  var bookingCalcGrid = document.getElementById('bookingCalcGrid');
  var calcTotalLabelTitle = document.getElementById('calcTotalLabelTitle');
  var calcTotalDisplay = document.getElementById('calcTotalDisplay');
  var calcDepositCol = document.getElementById('calcDepositCol');
  var calcDepositDisplay = document.getElementById('calcDepositDisplay');
  var calcRemainingCol = document.getElementById('calcRemainingCol');
  var calcRemainingDisplay = document.getElementById('calcRemainingDisplay');
  var calcStudioCol = document.getElementById('calcStudioCol');

  var step3Heading = document.getElementById('step3Heading');
  var studioExceptionBox = document.getElementById('studioExceptionBox');
  var studioExceptionText = document.getElementById('studioExceptionText');
  var wavePaymentBox = document.getElementById('wavePaymentBox');
  var waveDepositTitle = document.getElementById('waveDepositTitle');
  var wavePayBtn = document.getElementById('wavePayBtn');
  var copyAmountBtn = document.getElementById('copyAmountBtn');
  var surDevisBox = document.getElementById('surDevisBox');

  // Éléments Contrat & Traçabilité
  var openContractBtn = document.getElementById('openContractBtn');
  var imagePubCheckbox = document.getElementById('imagePubCheckbox');
  var contractAcceptCheckbox = document.getElementById('contractAcceptCheckbox');
  var contractTraceDisplay = document.getElementById('contractTraceDisplay');
  var contractHintDisplay = document.getElementById('contractHintDisplay');
  var submitFormBtn = document.getElementById('submitFormBtn');
  var sendEmailBtn = document.getElementById('sendEmailBtn');
  var formFeedback = document.getElementById('formFeedback');

  var contractModal = document.getElementById('contractModal');
  var closeContractBtn = document.getElementById('closeContractBtn');
  var cancelContractBtn = document.getElementById('cancelContractBtn');
  var acceptContractBtn = document.getElementById('acceptContractBtn');
  var modalImagePubCheckbox = document.getElementById('modalImagePubCheckbox');
  var modalContractAcceptCheckbox = document.getElementById('modalContractAcceptCheckbox');

  var contractClientName = document.getElementById('contractClientName');
  var contractClientPhone = document.getElementById('contractClientPhone');
  var contractClientEmail = document.getElementById('contractClientEmail');
  var contractPrestation = document.getElementById('contractPrestation');
  var contractDateTime = document.getElementById('contractDateTime');
  var contractLocation = document.getElementById('contractLocation');
  var contractTotalPrice = document.getElementById('contractTotalPrice');
  var contractDepositRow = document.getElementById('contractDepositRow');
  var contractDepositPrice = document.getElementById('contractDepositPrice');
  var contractRemainingRow = document.getElementById('contractRemainingRow');
  var contractRemainingPrice = document.getElementById('contractRemainingPrice');
  var contractStudioPaymentRow = document.getElementById('contractStudioPaymentRow');

  var contractAcceptedAtIso = null;
  var lastFocusedBeforeModal = null;

  function getTodayDateString() {
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
  }

  if (dateInput) {
    dateInput.setAttribute('min', getTodayDateString());
  }

  function isValidPhone(phone) {
    if (!/^\+?[\d\s]+$/.test(phone)) return false;
    var digits = phone.replace(/\D/g, '');
    return digits.length >= 8 && digits.length <= 15;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  var VALIDATED_FIELDS = [nameInput, phoneInput, emailInput, dateInput, timeInput, locationInput, messageInput];
  function clearInvalidFields() {
    VALIDATED_FIELDS.forEach(function (el) {
      if (el) el.removeAttribute('aria-invalid');
    });
  }

  VALIDATED_FIELDS.forEach(function (el) {
    if (el) {
      el.addEventListener('input', function () {
        el.removeAttribute('aria-invalid');
      });
    }
  });

  // Aperçu local facultatif (aucun fichier envoyé automatiquement)
  var ALLOWED_PROOF_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  var MAX_PROOF_BYTES = 5 * 1024 * 1024;
  var paymentProofInput = document.getElementById('paymentProofInput');
  var proofDropzone = document.getElementById('proofDropzone');
  var proofPreviewRow = document.getElementById('proofPreviewRow');
  var proofThumbImg = document.getElementById('proofThumbImg');
  var proofFileName = document.getElementById('proofFileName');
  var removeProofBtn = document.getElementById('removeProofBtn');
  var selectedProofFile = null;
  var selectedProofUrl = null;

  function clearProofFile() {
    if (selectedProofUrl) {
      URL.revokeObjectURL(selectedProofUrl);
      selectedProofUrl = null;
    }
    selectedProofFile = null;
    if (paymentProofInput) {
      paymentProofInput.value = '';
      paymentProofInput.removeAttribute('aria-invalid');
    }
    if (proofThumbImg) proofThumbImg.removeAttribute('src');
    if (proofDropzone) proofDropzone.classList.remove('is-hidden');
    if (proofPreviewRow) proofPreviewRow.classList.add('is-hidden');
  }

  if (paymentProofInput) {
    paymentProofInput.addEventListener('change', function () {
      var file = paymentProofInput.files && paymentProofInput.files[0];
      if (!file) return;
      if (ALLOWED_PROOF_TYPES.indexOf(file.type) === -1) {
        paymentProofInput.value = '';
        showFeedbackError('Format non autorisé : veuillez choisir une image JPG, PNG ou WEBP uniquement.', [paymentProofInput]);
        return;
      }
      if (file.size > MAX_PROOF_BYTES) {
        paymentProofInput.value = '';
        showFeedbackError('Fichier trop volumineux : l’image ne doit pas dépasser 5 Mo.', [paymentProofInput]);
        return;
      }
      paymentProofInput.removeAttribute('aria-invalid');
      if (formFeedback && formFeedback.classList.contains('is-error')) {
        formFeedback.classList.remove('is-visible', 'is-error');
      }
      if (selectedProofUrl) URL.revokeObjectURL(selectedProofUrl);
      selectedProofFile = file;
      selectedProofUrl = URL.createObjectURL(file);
      if (proofThumbImg) proofThumbImg.src = selectedProofUrl;
      if (proofFileName) proofFileName.textContent = file.name;
      if (proofDropzone) proofDropzone.classList.add('is-hidden');
      if (proofPreviewRow) proofPreviewRow.classList.remove('is-hidden');
    });
  }

  if (removeProofBtn) {
    removeProofBtn.addEventListener('click', clearProofFile);
  }

  function getCurrentGroup() {
    var val = serviceSelect ? serviceSelect.value : BOOKING_PRESTATIONS[0].prestation;
    for (var i = 0; i < BOOKING_PRESTATIONS.length; i++) {
      if (BOOKING_PRESTATIONS[i].prestation === val) return BOOKING_PRESTATIONS[i];
    }
    return BOOKING_PRESTATIONS[0];
  }

  function getCurrentFormula() {
    var group = getCurrentGroup();
    var fid = formulaSelect ? formulaSelect.value : '';
    for (var i = 0; i < group.formulas.length; i++) {
      if (group.formulas[i].id === fid) return group.formulas[i];
    }
    return group.formulas[0];
  }

  function computePricing(formula) {
    var isStudio = Boolean(formula.isStudio);
    var hasFixedPrice = formula.priceAmount !== null && typeof formula.priceAmount === 'number';
    var totalAmount = hasFixedPrice ? formula.priceAmount : 0;

    if (isStudio) {
      var studioTotalLabel = hasFixedPrice
        ? formatTarifAmount(totalAmount, formula.currency)
        : 'Sur devis (au studio)';
      return {
        isStudio: true,
        requiresDeposit: false,
        depositAmountNumeric: 0,
        totalLabel: studioTotalLabel,
        depositLabel: '',
        remainingLabel: "Paiement intégral à l'arrivée au studio"
      };
    }

    if (hasFixedPrice) {
      var depositAmount = Math.round(totalAmount * 0.7);
      var remainingAmount = totalAmount - depositAmount;
      var totalLabel = formatTarifAmount(totalAmount, formula.currency);
      var depositLabel = formatTarifAmount(depositAmount, formula.currency);
      var remainingLabel = formatTarifAmount(remainingAmount, formula.currency);

      return {
        isStudio: false,
        requiresDeposit: true,
        depositAmountNumeric: depositAmount,
        totalLabel: totalLabel,
        depositLabel: depositLabel,
        remainingLabel: remainingLabel + ' (30 % — le jour de la prestation)'
      };
    }

    return {
      isStudio: false,
      requiresDeposit: false,
      depositAmountNumeric: 0,
      totalLabel: 'Sur devis',
      depositLabel: '70 % après validation du devis',
      remainingLabel: '30 % le jour de la prestation'
    };
  }

  function updateBookingCalculationUI() {
    var formula = getCurrentFormula();
    var pricing = computePricing(formula);

    if (calcTotalLabelTitle) {
      calcTotalLabelTitle.textContent = formula.photoCountLabel
        ? 'Prix total (' + formula.photoCountLabel + ')'
        : 'Prix total';
    }
    if (calcTotalDisplay) calcTotalDisplay.textContent = pricing.totalLabel;

    if (bookingCalcGrid) {
      bookingCalcGrid.classList.toggle('is-studio-grid', pricing.isStudio);
    }
    if (calcDepositCol) calcDepositCol.classList.toggle('is-hidden', pricing.isStudio);
    if (calcRemainingCol) calcRemainingCol.classList.toggle('is-hidden', pricing.isStudio);
    if (calcStudioCol) calcStudioCol.classList.toggle('is-hidden', !pricing.isStudio);

    if (!pricing.isStudio) {
      if (calcDepositDisplay) calcDepositDisplay.textContent = pricing.depositLabel;
      if (calcRemainingDisplay) calcRemainingDisplay.textContent = pricing.remainingLabel;
    }

    if (locationLabel) {
      locationLabel.textContent = pricing.isStudio ? 'Lieu (Studio)' : 'Lieu *';
    }
    if (locationInput) {
      locationInput.required = !pricing.isStudio;
      locationInput.placeholder = pricing.isStudio
        ? 'Studio Yeumbeul, Dakar'
        : 'Dakar, Saly, Saint-Louis...';
    }

    if (step3Heading) {
      step3Heading.textContent = pricing.isStudio
        ? 'Paiement au studio'
        : pricing.requiresDeposit
          ? 'Acompte Wave (70 %)'
          : 'Modalités de devis';
    }

    if (studioExceptionBox) {
      studioExceptionBox.classList.toggle('is-hidden', !pricing.isStudio);
      if (studioExceptionText && pricing.isStudio) {
        studioExceptionText.textContent =
          'Vous réglez ' + pricing.totalLabel + ' directement lors de votre séance au Studio Yeumbeul, Dakar.';
      }
    }

    if (wavePaymentBox) {
      wavePaymentBox.classList.toggle('is-hidden', !pricing.requiresDeposit);
    }
    if (waveDepositTitle && !pricing.isStudio) waveDepositTitle.textContent = pricing.depositLabel;
    if (wavePayBtn && !pricing.isStudio) wavePayBtn.textContent = 'Payer ' + pricing.depositLabel + ' sur Wave →';
    if (surDevisBox) {
      surDevisBox.classList.toggle('is-hidden', pricing.isStudio || pricing.requiresDeposit);
    }
  }

  function syncContractPreviewFields() {
    var group = getCurrentGroup();
    var formula = getCurrentFormula();
    var pricing = computePricing(formula);

    var nameVal = sanitizeInput(nameInput ? nameInput.value : '', false);
    var phoneVal = sanitizeInput(phoneInput ? phoneInput.value : '', false);
    var emailVal = sanitizeInput(emailInput ? emailInput.value : '', false);
    var dateVal = sanitizeInput(dateInput ? dateInput.value : '', false);
    var timeVal = sanitizeInput(timeInput ? timeInput.value : '', false);
    var locVal = sanitizeInput(locationInput ? locationInput.value : '', false) ||
      (pricing.isStudio ? 'Studio Yeumbeul, Dakar — Sénégal' : 'À préciser dans le formulaire');

    if (contractClientName) contractClientName.textContent = nameVal || 'À compléter dans le formulaire';
    if (contractClientPhone) contractClientPhone.textContent = phoneVal || 'À compléter dans le formulaire';
    if (contractClientEmail) contractClientEmail.textContent = emailVal || 'À compléter dans le formulaire';

    if (contractPrestation) {
      contractPrestation.textContent =
        group.prestation + ' — ' + formula.label + (formula.photoCountLabel ? ' (' + formula.photoCountLabel + ')' : '');
    }
    if (contractDateTime) {
      contractDateTime.textContent = (dateVal || 'Date à préciser') + ' à ' + (timeVal || 'heure à préciser');
    }
    if (contractLocation) contractLocation.textContent = locVal;
    if (contractTotalPrice) contractTotalPrice.textContent = pricing.totalLabel;

    if (contractDepositRow) contractDepositRow.classList.toggle('is-hidden', pricing.isStudio);
    if (contractRemainingRow) contractRemainingRow.classList.toggle('is-hidden', pricing.isStudio);
    if (contractStudioPaymentRow) contractStudioPaymentRow.classList.toggle('is-hidden', !pricing.isStudio);

    if (!pricing.isStudio) {
      if (contractDepositPrice) contractDepositPrice.textContent = pricing.depositLabel;
      if (contractRemainingPrice) contractRemainingPrice.textContent = pricing.remainingLabel;
    }
  }

  function setContractAccepted(checked) {
    contractAcceptedAtIso = checked ? new Date().toISOString() : null;
    if (contractAcceptCheckbox) contractAcceptCheckbox.checked = checked;
    if (modalContractAcceptCheckbox) modalContractAcceptCheckbox.checked = checked;

    if (submitFormBtn) {
      submitFormBtn.disabled = !checked;
      submitFormBtn.setAttribute('aria-disabled', checked ? 'false' : 'true');
    }
    if (sendEmailBtn) {
      sendEmailBtn.disabled = !checked;
      sendEmailBtn.setAttribute('aria-disabled', checked ? 'false' : 'true');
    }

    if (contractTraceDisplay && contractHintDisplay) {
      if (checked && contractAcceptedAtIso) {
        contractTraceDisplay.textContent =
          'Acceptation enregistrée · Version ' + CONTRACT_VERSION + ' · Le ' + formatFrenchDateTime(contractAcceptedAtIso);
        contractTraceDisplay.classList.remove('is-hidden');
        contractHintDisplay.classList.add('is-hidden');
      } else {
        contractTraceDisplay.textContent = '';
        contractTraceDisplay.classList.add('is-hidden');
        contractHintDisplay.classList.remove('is-hidden');
      }
    }

    if (formFeedback && formFeedback.classList.contains('is-error')) {
      formFeedback.classList.remove('is-visible', 'is-error');
    }
  }

  function openContractModal() {
    if (!contractModal) return;
    lastFocusedBeforeModal = document.activeElement;
    syncContractPreviewFields();
    if (modalImagePubCheckbox && imagePubCheckbox) {
      modalImagePubCheckbox.checked = imagePubCheckbox.checked;
    }
    if (modalContractAcceptCheckbox && contractAcceptCheckbox) {
      modalContractAcceptCheckbox.checked = contractAcceptCheckbox.checked;
    }
    contractModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (closeContractBtn) closeContractBtn.focus();
  }

  function closeContractModal() {
    if (!contractModal) return;
    contractModal.classList.remove('is-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
      lastFocusedBeforeModal.focus();
    }
    lastFocusedBeforeModal = null;
  }

  if (openContractBtn) openContractBtn.addEventListener('click', openContractModal);
  if (closeContractBtn) closeContractBtn.addEventListener('click', closeContractModal);
  if (cancelContractBtn) cancelContractBtn.addEventListener('click', closeContractModal);
  if (acceptContractBtn) {
    acceptContractBtn.addEventListener('click', function () {
      setContractAccepted(true);
      closeContractModal();
    });
  }
  if (contractModal) {
    contractModal.addEventListener('click', function (e) {
      if (e.target === contractModal) closeContractModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && contractModal && contractModal.classList.contains('is-open')) {
      e.preventDefault();
      closeContractModal();
    }
  });

  if (contractAcceptCheckbox) {
    contractAcceptCheckbox.addEventListener('change', function () {
      setContractAccepted(Boolean(contractAcceptCheckbox.checked));
    });
  }
  if (modalContractAcceptCheckbox) {
    modalContractAcceptCheckbox.addEventListener('change', function () {
      setContractAccepted(Boolean(modalContractAcceptCheckbox.checked));
    });
  }
  if (imagePubCheckbox && modalImagePubCheckbox) {
    imagePubCheckbox.addEventListener('change', function () {
      modalImagePubCheckbox.checked = imagePubCheckbox.checked;
    });
    modalImagePubCheckbox.addEventListener('change', function () {
      imagePubCheckbox.checked = modalImagePubCheckbox.checked;
    });
  }

  if (copyAmountBtn) {
    copyAmountBtn.addEventListener('click', function () {
      var pricing = computePricing(getCurrentFormula());
      if (!pricing.depositAmountNumeric || !navigator.clipboard || !navigator.clipboard.writeText) return;
      navigator.clipboard.writeText(String(pricing.depositAmountNumeric)).then(function () {
        copyAmountBtn.textContent = 'Copié ✓';
        window.setTimeout(function () {
          copyAmountBtn.textContent = 'Copier montant';
        }, 1800);
      }).catch(function () {});
    });
  }

  function populateFormulaOptions(prestationName, targetFormulaId) {
    if (!formulaSelect) return;
    var group = BOOKING_PRESTATIONS[0];
    for (var i = 0; i < BOOKING_PRESTATIONS.length; i++) {
      if (BOOKING_PRESTATIONS[i].prestation === prestationName) {
        group = BOOKING_PRESTATIONS[i];
        break;
      }
    }
    formulaSelect.innerHTML = '';
    group.formulas.forEach(function (f) {
      var opt = document.createElement('option');
      opt.value = f.id;
      var priceTxt = f.priceAmount !== null ? formatTarifAmount(f.priceAmount, f.currency) : 'Sur devis';
      opt.textContent = f.label + ' — ' + priceTxt;
      formulaSelect.appendChild(opt);
    });
    if (targetFormulaId) {
      formulaSelect.value = targetFormulaId;
    }
    updateBookingCalculationUI();
  }

  function setPrestationFromParams(prestationName, formulaId) {
    if (!serviceSelect) return;
    var matched = false;
    for (var i = 0; i < BOOKING_PRESTATIONS.length; i++) {
      if (BOOKING_PRESTATIONS[i].prestation === prestationName) {
        serviceSelect.value = prestationName;
        populateFormulaOptions(prestationName, formulaId);
        matched = true;
        break;
      }
    }
    if (!matched) {
      serviceSelect.value = BOOKING_PRESTATIONS[0].prestation;
      populateFormulaOptions(BOOKING_PRESTATIONS[0].prestation);
    }
  }

  if (serviceSelect && BOOKING_PRESTATIONS.length > 0) {
    BOOKING_PRESTATIONS.forEach(function (g) {
      var opt = document.createElement('option');
      opt.value = g.prestation;
      opt.textContent = g.prestation;
      serviceSelect.appendChild(opt);
    });

    var params = new URLSearchParams(window.location.search || '');
    var qPrestation = params.get('prestation');
    var qFormule = params.get('formule');
    if (qPrestation) {
      setPrestationFromParams(qPrestation, qFormule);
    } else {
      populateFormulaOptions(BOOKING_PRESTATIONS[0].prestation);
    }

    serviceSelect.addEventListener('change', function () {
      populateFormulaOptions(serviceSelect.value);
      if (formFeedback) formFeedback.classList.remove('is-visible', 'is-error');
    });
  }

  if (formulaSelect) {
    formulaSelect.addEventListener('change', function () {
      updateBookingCalculationUI();
      if (formFeedback) formFeedback.classList.remove('is-visible', 'is-error');
    });
  }

  function showFeedbackError(msg, invalidFields) {
    clearInvalidFields();
    if (invalidFields && invalidFields.length) {
      invalidFields.forEach(function (field) {
        if (field) field.setAttribute('aria-invalid', 'true');
      });
      if (invalidFields[0] && typeof invalidFields[0].focus === 'function') {
        invalidFields[0].focus();
      }
    }
    if (!formFeedback) return;
    formFeedback.setAttribute('role', 'alert');
    formFeedback.setAttribute('aria-live', 'assertive');
    formFeedback.className = 'form-feedback is-visible is-error';
    formFeedback.textContent = msg;
  }

  function persistLocalBookingRecord(payload) {
    var referenceId = 'DP-' + Date.now().toString(36).toUpperCase();
    try {
      var raw = localStorage.getItem(BOOKING_STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      var list = Array.isArray(parsed) ? parsed : [];
      list.unshift({
        referenceId: referenceId,
        createdAtIso: new Date().toISOString(),
        contractVersion: CONTRACT_VERSION,
        contractAccepted: true,
        contractAcceptedAtIso: payload.acceptedIso,
        imagePublicationAuthorized: payload.imagePubAuthorized,
        client: {
          name: payload.name,
          phone: payload.phone,
          email: payload.email
        },
        booking: {
          prestation: payload.service,
          formulaId: payload.formula.id,
          formulaLabel: payload.formula.label,
          eventDate: payload.eventDate,
          eventTime: payload.eventTime,
          location: payload.resolvedLocation,
          notes: payload.message,
          totalLabel: payload.pricing.totalLabel,
          paymentMode: payload.pricing.isStudio ? 'studio_full_on_arrival' : 'deposit_70_balance_30',
          depositLabel: payload.pricing.isStudio ? null : payload.pricing.depositLabel,
          remainingLabel: payload.pricing.isStudio ? null : payload.pricing.remainingLabel
        },
        summary: payload.summary
      });
      localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(list.slice(0, 20)));
    } catch (_err) {
      // Ignore storage quota errors
    }
    return referenceId;
  }

  function readFormValues() {
    clearInvalidFields();
    var name = sanitizeInput(nameInput ? nameInput.value : '', false);
    var phone = sanitizeInput(phoneInput ? phoneInput.value : '', false);
    var email = sanitizeInput(emailInput ? emailInput.value : '', false);
    var service = sanitizeInput(serviceSelect ? serviceSelect.value : '', false);
    var formula = getCurrentFormula();
    var pricing = computePricing(formula);
    var eventDate = dateInput ? sanitizeInput(dateInput.value, false) : '';
    var eventTime = timeInput ? sanitizeInput(timeInput.value, false) : '';
    var rawLocation = locationInput ? sanitizeInput(locationInput.value, false) : '';
    var resolvedLocation = rawLocation || (pricing.isStudio ? 'Studio Yeumbeul, Dakar — Sénégal' : '');
    var message = sanitizeInput(messageInput ? messageInput.value : '', true);

    var missing = [];
    if (!name) missing.push(nameInput);
    if (!phone) missing.push(phoneInput);
    if (!email) missing.push(emailInput);
    if (!eventDate) missing.push(dateInput);
    if (!eventTime) missing.push(timeInput);
    if (missing.length > 0) {
      showFeedbackError('Merci de remplir votre nom et prénom, votre numéro WhatsApp, votre email, la date et l’heure souhaitées.', missing);
      return null;
    }

    if (!isValidPhone(phone)) {
      showFeedbackError('Numéro WhatsApp invalide : saisissez 8 à 15 chiffres (chiffres, espaces et + autorisés, ex. +221 77 000 00 00).', [phoneInput]);
      return null;
    }

    if (!isValidEmail(email)) {
      showFeedbackError('Adresse email invalide : veuillez saisir un email valide (ex. nom@exemple.com).', [emailInput]);
      return null;
    }

    var todayStr = getTodayDateString();
    if (eventDate < todayStr) {
      showFeedbackError('La date souhaitée ne peut pas être antérieure à aujourd’hui. Veuillez choisir une date à venir.', [dateInput]);
      return null;
    }

    if (!pricing.isStudio && !resolvedLocation) {
      showFeedbackError('Merci d’indiquer le lieu de la prestation.', [locationInput]);
      return null;
    }

    if (!contractAcceptCheckbox || !contractAcceptCheckbox.checked || !contractAcceptedAtIso) {
      showFeedbackError('Veuillez lire et accepter les conditions du contrat de prestation de DIONTADO PRODUCTION avant de continuer.', [contractAcceptCheckbox]);
      return null;
    }

    var imagePubAuthorized = Boolean(imagePubCheckbox && imagePubCheckbox.checked);
    var acceptedDateLabel = formatFrenchDateTime(contractAcceptedAtIso);

    var lines = [
      'Bonjour DIONTADO PRODUCTION,',
      'Voici ma demande de réservation :',
      '',
      '• Nom et prénom : ' + name,
      '• Téléphone : ' + phone,
      '• Email : ' + email,
      '• Prestation choisie : ' + service,
      '• Formule choisie : ' + formula.label
    ];

    if (formula.photoCountLabel) {
      lines.push('• Nombre de photos : ' + formula.photoCountLabel);
    }

    lines.push(
      '• Date souhaitée : ' + eventDate,
      '• Heure souhaitée : ' + eventTime,
      '• Lieu : ' + resolvedLocation,
      '• Prix total convenu : ' + pricing.totalLabel
    );

    if (pricing.isStudio) {
      lines.push("• Modalité de paiement : Paiement intégral à l'arrivée au studio");
    } else {
      lines.push(
        '• Acompte (70 %) versé ou à verser : ' + pricing.depositLabel,
        '• Solde restant (30 %) : ' + pricing.remainingLabel
      );
      if (pricing.requiresDeposit) {
        lines.push('• Lien Wave officiel : ' + WAVE_PAYMENT_URL);
        lines.push('• Preuve de paiement : Aucun fichier envoyé automatiquement par le site — si vous avez réglé par Wave, merci de joindre manuellement votre capture dans cette discussion WhatsApp.');
      }
    }

    lines.push(
      '• Informations complémentaires : ' + (message || 'Aucune'),
      '',
      '• Contrat de prestation (' + CONTRACT_VERSION + ') : Lu et accepté par le client le ' + acceptedDateLabel,
      '• Autorisation de publication des images (facultatif) : ' + (imagePubAuthorized ? 'Accordée par le client' : 'Non accordée (choix non coché)'),
      '',
      'Demande en attente de vérification de la disponibilité et du paiement par DIONTADO PRODUCTION (ne vaut pas confirmation définitive).'
    );

    return {
      name: name,
      phone: phone,
      email: email,
      service: service,
      formula: formula,
      pricing: pricing,
      eventDate: eventDate,
      eventTime: eventTime,
      resolvedLocation: resolvedLocation,
      message: message,
      acceptedIso: contractAcceptedAtIso,
      acceptedDateLabel: acceptedDateLabel,
      imagePubAuthorized: imagePubAuthorized,
      summary: lines.join('\n')
    };
  }

  function triggerExternalWhatsApp(url) {
    var a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  setContractAccepted(Boolean(contractAcceptCheckbox && contractAcceptCheckbox.checked));

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var dataValues = readFormValues();
    if (!dataValues) return;

    var referenceId = persistLocalBookingRecord(dataValues);
    var waUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(dataValues.summary);
    triggerExternalWhatsApp(waUrl);

    if (formFeedback) {
      formFeedback.setAttribute('role', 'status');
      formFeedback.setAttribute('aria-live', 'polite');
      formFeedback.className = 'form-feedback is-visible';
      var hasProofPreview = Boolean(selectedProofFile && dataValues.pricing.requiresDeposit);

      var html =
        '<p class="feedback-kicker">Demande préparée (' + escapeHTML(referenceId) + ') · Contrat ' + CONTRACT_VERSION + '</p>' +
        '<p class="feedback-lead">Votre demande et l’acceptation du contrat (enregistrée le ' + escapeHTML(dataValues.acceptedDateLabel) + ') ont été préparées pour WhatsApp. La réservation ne sera définitive qu’après vérification de la disponibilité et du paiement par DIONTADO PRODUCTION.</p>';

      if (hasProofPreview) {
        html +=
          '<div class="feedback-proof-box">' +
            '<strong>Rappel :</strong> aucun fichier n’est envoyé automatiquement par le site. Pensez à joindre manuellement votre capture d’écran (<code>' + escapeHTML(selectedProofFile.name) + '</code>) dans la conversation WhatsApp.' +
          '</div>';
      }

      html += '<div class="feedback-actions">' +
        '<a href="' + escapeHTML(waUrl) + '" target="_blank" rel="noopener noreferrer" class="btn-whatsapp btn-feedback-wa">Ouvrir WhatsApp (+221 76 481 23 91)</a>' +
        '<button type="button" id="copySummaryBtn" class="btn-outline btn-feedback-action">Copier le récapitulatif</button></div>';

      formFeedback.innerHTML = html;

      var copyBtn = document.getElementById('copySummaryBtn');
      if (copyBtn && navigator.clipboard && navigator.clipboard.writeText) {
        copyBtn.addEventListener('click', function () {
          navigator.clipboard.writeText(dataValues.summary).then(function () {
            copyBtn.textContent = 'Récapitulatif copié ✓';
          }).catch(function () {});
        });
      }
    }
  });

  if (sendEmailBtn) {
    sendEmailBtn.addEventListener('click', function () {
      var dataValues = readFormValues();
      if (!dataValues) return;
      persistLocalBookingRecord(dataValues);
      var subject = encodeURIComponent('[DIONTADO PRODUCTION] Demande de réservation : ' + dataValues.service + ' (' + dataValues.formula.label + ') — ' + dataValues.name);
      var body = encodeURIComponent(dataValues.summary);
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
      if (formFeedback) {
        formFeedback.setAttribute('role', 'status');
        formFeedback.setAttribute('aria-live', 'polite');
        formFeedback.className = 'form-feedback is-visible';
        formFeedback.textContent = '';
        formFeedback.appendChild(document.createTextNode('Votre récapitulatif complet (avec version du contrat ' + CONTRACT_VERSION + ') a été préparé dans votre application email vers '));
        var emailStrong = document.createElement('strong');
        emailStrong.textContent = CONTACT_EMAIL;
        formFeedback.appendChild(emailStrong);
        formFeedback.appendChild(document.createTextNode('.'));
      }
    });
  }
})();
