/* ==========================================================================
   DIONTADO PRODUCTION — LOGIQUE DE RÉSERVATION, CALCUL 70/30, WAVE & WHATSAPP
   ========================================================================== */
(function () {
  var cfg = window.DIONTADO_CONFIG || {};
  var data = window.DIONTADO_DATA || {};
  var utils = window.DIONTADO_UTILS || {};

  var contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

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

  var serviceSelect = document.getElementById('contactService');
  var formulaSelect = document.getElementById('contactFormula');
  var nameInput = document.getElementById('contactName');
  var phoneInput = document.getElementById('contactPhone');
  var dateInput = document.getElementById('contactDate');
  var timeInput = document.getElementById('contactTime');
  var locationInput = document.getElementById('contactLocation');
  var messageInput = document.getElementById('contactMessage');
  var locationLabel = document.getElementById('contactLocationLabel');
  var calcTotalLabelTitle = document.getElementById('calcTotalLabelTitle');
  var calcTotalDisplay = document.getElementById('calcTotalDisplay');
  var calcDepositDisplay = document.getElementById('calcDepositDisplay');
  var calcRemainingDisplay = document.getElementById('calcRemainingDisplay');
  var step3Heading = document.getElementById('step3Heading');
  var studioExceptionBox = document.getElementById('studioExceptionBox');
  var studioExceptionText = document.getElementById('studioExceptionText');
  var wavePaymentBox = document.getElementById('wavePaymentBox');
  var waveDepositTitle = document.getElementById('waveDepositTitle');
  var wavePayBtn = document.getElementById('wavePayBtn');
  var copyAmountBtn = document.getElementById('copyAmountBtn');
  var surDevisBox = document.getElementById('surDevisBox');
  var sendEmailBtn = document.getElementById('sendEmailBtn');
  var formFeedback = document.getElementById('formFeedback');

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

  var VALIDATED_FIELDS = [nameInput, phoneInput, dateInput, timeInput, locationInput, messageInput];
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

  /* Preuve de paiement (capture d'écran, max 5 Mo, JPG/PNG/WEBP uniquement) */
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
        showFeedbackError('Fichier trop volumineux : la capture de paiement ne doit pas dépasser 5 Mo.', [paymentProofInput]);
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
        depositLabel: '0\u00A0FCFA (Aucun acompte)',
        remainingLabel: hasFixedPrice
          ? studioTotalLabel + ' — à régler au studio'
          : "Paiement intégral à l'arrivée au studio"
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
        remainingLabel: remainingLabel + ' (le jour J)'
      };
    }

    return {
      isStudio: false,
      requiresDeposit: false,
      depositAmountNumeric: 0,
      totalLabel: 'Sur devis',
      depositLabel: '70 % après devis',
      remainingLabel: '30 % le jour J'
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
    if (calcDepositDisplay) calcDepositDisplay.textContent = pricing.depositLabel;
    if (calcRemainingDisplay) calcRemainingDisplay.textContent = pricing.remainingLabel;

    if (locationLabel) {
      locationLabel.textContent = pricing.isStudio ? 'Lieu (Studio)' : 'Lieu *';
    }
    if (locationInput) {
      locationInput.required = !pricing.isStudio;
      locationInput.placeholder = pricing.isStudio
        ? 'Studio DIONTADO (Yeumbeul)'
        : 'Dakar, Saly, Saint-Louis...';
    }

    if (step3Heading) {
      step3Heading.textContent = pricing.isStudio
        ? 'Paiement au studio & envoi'
        : pricing.requiresDeposit
          ? 'Acompte Wave & envoi WhatsApp'
          : 'Validation sur WhatsApp';
    }

    if (studioExceptionBox) {
      studioExceptionBox.classList.toggle('is-hidden', !pricing.isStudio);
      if (studioExceptionText && pricing.isStudio) {
        studioExceptionText.textContent =
          'Vous réglez l’intégralité (' + pricing.totalLabel + ') directement à votre arrivée au studio.';
      }
    }

    if (wavePaymentBox) {
      wavePaymentBox.classList.toggle('is-hidden', !pricing.requiresDeposit);
    }
    if (waveDepositTitle) waveDepositTitle.textContent = pricing.depositLabel;
    if (wavePayBtn) wavePayBtn.textContent = 'Payer ' + pricing.depositLabel + ' sur Wave →';
    if (surDevisBox) {
      surDevisBox.classList.toggle('is-hidden', pricing.isStudio || pricing.requiresDeposit);
    }
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

  function readFormValues() {
    clearInvalidFields();
    var name = sanitizeInput(nameInput ? nameInput.value : '', false);
    var phone = sanitizeInput(phoneInput ? phoneInput.value : '', false);
    var service = sanitizeInput(serviceSelect ? serviceSelect.value : '', false);
    var formula = getCurrentFormula();
    var pricing = computePricing(formula);
    var eventDate = dateInput ? sanitizeInput(dateInput.value, false) : '';
    var eventTime = timeInput ? sanitizeInput(timeInput.value, false) : '';
    var rawLocation = locationInput ? sanitizeInput(locationInput.value, false) : '';
    var resolvedLocation = rawLocation || (pricing.isStudio ? 'Studio DIONTADO — Yeumbeul, Dakar' : '');
    var message = sanitizeInput(messageInput ? messageInput.value : '', true);

    var missing = [];
    if (!name) missing.push(nameInput);
    if (!phone) missing.push(phoneInput);
    if (!eventDate) missing.push(dateInput);
    if (!eventTime) missing.push(timeInput);
    if (missing.length > 0) {
      showFeedbackError('Merci de remplir votre nom, votre numéro WhatsApp, la date et l’heure souhaitées.', missing);
      return null;
    }

    if (!isValidPhone(phone)) {
      showFeedbackError('Numéro WhatsApp invalide : saisissez 8 à 15 chiffres (chiffres, espaces et + autorisés, ex. +221 77 000 00 00).', [phoneInput]);
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

    var lines = [
      'Bonjour DIONTADO PRODUCTION,',
      'Voici ma demande de réservation :',
      '',
      '• Nom complet : ' + name,
      '• Téléphone : ' + phone,
      '• Prestation choisie : ' + service,
      '• Formule choisie : ' + formula.label
    ];

    if (formula.photoCountLabel) {
      lines.push('• Nombre de photos : ' + formula.photoCountLabel);
    }

    lines.push(
      '• Prix total : ' + pricing.totalLabel,
      '• Acompte demandé : ' + pricing.depositLabel,
      '• Montant restant : ' + pricing.remainingLabel,
      '• Date souhaitée : ' + eventDate,
      '• Heure souhaitée : ' + eventTime,
      '• Lieu de la prestation : ' + resolvedLocation,
      '• Informations complémentaires : ' + (message || 'Aucune')
    );

    if (pricing.isStudio) {
      lines.push('', "Réservation demandée — Paiement intégral à l'arrivée au studio.");
    } else if (pricing.requiresDeposit) {
      lines.push('', '• Lien de paiement Wave utilisé : ' + WAVE_PAYMENT_URL);
      if (selectedProofFile) {
        lines.push("• Preuve de paiement : Capture d'écran prête (" + sanitizeInput(selectedProofFile.name, false) + ') — envoyée dans cette conversation WhatsApp.');
      } else {
        lines.push('• Preuve de paiement : Capture à joindre ou à vérifier sur WhatsApp.');
      }
    }

    lines.push('', 'En attente de votre vérification et confirmation sur WhatsApp.');

    return {
      name: name,
      service: service,
      formula: formula,
      pricing: pricing,
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

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var dataValues = readFormValues();
    if (!dataValues) return;

    var waUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(dataValues.summary);
    triggerExternalWhatsApp(waUrl);

    if (formFeedback) {
      formFeedback.setAttribute('role', 'status');
      formFeedback.setAttribute('aria-live', 'polite');
      formFeedback.className = 'form-feedback is-visible';
      var hasProof = Boolean(selectedProofFile && dataValues.pricing.requiresDeposit);
      var canShare =
        hasProof &&
        typeof navigator.canShare === 'function' &&
        (function () {
          try { return navigator.canShare({ files: [selectedProofFile] }); } catch (_err) { return false; }
        })();

      var html =
        '<p class="feedback-kicker">Récapitulatif prêt — envoyez-le sur WhatsApp pour confirmer</p>' +
        '<p class="feedback-lead">Merci d\'avoir choisi DIONTADO PRODUCTION. Votre récapitulatif est prêt dans WhatsApp : appuyez sur Envoyer dans la conversation afin que notre équipe vérifie la disponibilité de la date, de l\'heure et confirme votre prestation.</p>';

      if (hasProof) {
        html +=
          '<div class="feedback-proof-box">' +
            '<strong>Action finale pour votre preuve de paiement :</strong> joignez votre capture d’écran (<code>' + escapeHTML(selectedProofFile.name) + '</code>) directement dans la conversation WhatsApp qui vient de s’ouvrir.' +
          '</div>';
      }

      html += '<div class="feedback-actions">' +
        '<a href="' + escapeHTML(waUrl) + '" target="_blank" rel="noopener noreferrer" class="btn-whatsapp btn-feedback-wa">Ouvrir WhatsApp (+221 76 481 23 91)</a>';

      if (canShare) {
        html += '<button type="button" id="shareProofBtn" class="btn-primary btn-feedback-action">Envoyer message + capture (Mobile)</button>';
      }

      html += '<button type="button" id="copySummaryBtn" class="btn-outline btn-feedback-action">Copier le récapitulatif</button></div>';

      formFeedback.innerHTML = html;

      var shareBtn = document.getElementById('shareProofBtn');
      if (shareBtn && selectedProofFile) {
        shareBtn.addEventListener('click', function () {
          navigator.share({
            title: 'Réservation DIONTADO PRODUCTION',
            text: dataValues.summary,
            files: [selectedProofFile]
          }).catch(function () {});
        });
      }

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
      var subject = encodeURIComponent('[DIONTADO PRODUCTION] Réservation : ' + dataValues.service + ' (' + dataValues.formula.label + ') — ' + dataValues.name);
      var body = encodeURIComponent(dataValues.summary);
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
      if (formFeedback) {
        formFeedback.setAttribute('role', 'status');
        formFeedback.setAttribute('aria-live', 'polite');
        formFeedback.className = 'form-feedback is-visible';
        formFeedback.textContent = '';
        formFeedback.appendChild(document.createTextNode('Votre récapitulatif complet a été préparé dans votre application email vers '));
        var emailStrong = document.createElement('strong');
        emailStrong.textContent = CONTACT_EMAIL;
        formFeedback.appendChild(emailStrong);
        formFeedback.appendChild(document.createTextNode('.'));
      }
    });
  }
})();
