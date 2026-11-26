/* ==========================================================================
   DIONTADO PRODUCTION — JS COMMUN (REDIRECTION ANCIENS LIENS, HEADER,
   MENU MOBILE, ANIMATIONS, LIGHTBOX & LECTEUR VIDÉO)
   ========================================================================== */
(function () {
  var cfg = window.DIONTADO_CONFIG || {};
  var data = window.DIONTADO_DATA || {};
  var BASE_PATH = cfg.BASE_PATH || '/diontado-production-portfolio';
  var MEDIA_BASE = cfg.MEDIA_BASE || (BASE_PATH + '/');
  var PHOTO_CATEGORIES = data.PHOTO_CATEGORIES || [];
  var VIDEO_ITEMS = data.VIDEO_ITEMS || [];
  var GALLERY_PHOTOS = data.GALLERY_PHOTOS || [];
  var TEMOIGNAGES = data.TEMOIGNAGES || [];

  /* ------------------------------------------------------------------------
     1. REDIRECTION DES ANCIENS LIENS EN HASH (#/tarifs, #/<slug>, etc.)
     ------------------------------------------------------------------------ */
  (function redirectLegacyHashLinks() {
    var rawHash = (window.location.hash || '').trim();
    if (!rawHash || rawHash.indexOf('#/') !== 0) {
      if (rawHash.toLowerCase() === '#tarifs') {
        window.location.replace(BASE_PATH + '/tarifs/');
      }
      return;
    }

    var routePart = rawHash.slice(2).replace(/^\/+|\/+$/g, '').toLowerCase();
    if (!routePart) return;

    if (routePart === 'tarifs') {
      window.location.replace(BASE_PATH + '/tarifs/');
      return;
    }
    if (routePart === 'realisations') {
      window.location.replace(BASE_PATH + '/realisations/');
      return;
    }
    if (routePart === 'videos') {
      window.location.replace(BASE_PATH + '/videos/');
      return;
    }
    if (routePart === 'a-propos' || routePart === 'apropos') {
      window.location.replace(BASE_PATH + '/a-propos/');
      return;
    }
    if (routePart === 'reservation') {
      window.location.replace(BASE_PATH + '/reservation/');
      return;
    }
    if (routePart === 'contact') {
      window.location.replace(BASE_PATH + '/#contact');
      return;
    }
    if (routePart === 'mentions-legales') {
      window.location.replace(BASE_PATH + '/mentions-legales/');
      return;
    }

    var slugMatch = routePart.match(/^(?:realisations\/)?([a-z0-9-]+)$/);
    if (slugMatch) {
      var candidate = slugMatch[1];
      var knownSlug = PHOTO_CATEGORIES.some(function (cat) {
        return cat.slug === candidate;
      });
      if (knownSlug) {
        window.location.replace(BASE_PATH + '/realisations/' + candidate + '/');
      }
    }
  })();

  function escapeHTML(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function assetUrl(fileName) {
    var encoded = String(fileName || '').split('/').map(encodeURIComponent).join('/');
    return MEDIA_BASE.replace(/\/+$/, '') + '/' + encoded;
  }

  window.DIONTADO_UTILS = {
    escapeHTML: escapeHTML,
    assetUrl: assetUrl
  };

  /* ------------------------------------------------------------------------
     2. GESTION DES IMAGES DE LOGO EN CAS D'ERREUR (SANS ONERROR INLINE)
     ------------------------------------------------------------------------ */
  document.querySelectorAll('.js-logo-hide').forEach(function (img) {
    function hideLogo() {
      img.classList.add('is-hidden');
      if (img.dataset.showFallback === '1' && img.nextElementSibling) {
        img.nextElementSibling.classList.remove('is-hidden');
      }
    }
    img.addEventListener('error', hideLogo);
    if (img.complete && img.naturalWidth === 0) {
      hideLogo();
    }
  });

  /* ------------------------------------------------------------------------
     3. LIEN D'ÉVITEMENT ACCESSIBLE SANS MODIFIER LE HASH
     ------------------------------------------------------------------------ */
  var skipToMainLink = document.getElementById('skipToMain');
  if (skipToMainLink) {
    skipToMainLink.addEventListener('click', function (e) {
      e.preventDefault();
      var mainEl = document.getElementById('mainContent');
      if (mainEl) {
        mainEl.scrollIntoView();
        mainEl.focus({ preventScroll: true });
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. EMAIL D'AFFICHAGE ANTI-SCRAPING SIMPLE
     ------------------------------------------------------------------------ */
  var contactEmail = (cfg.EMAIL_USER || 'diontadoevens.0') + '@' + (cfg.EMAIL_DOMAIN || 'gmail.com');
  document.querySelectorAll('.js-contact-email').forEach(function (el) {
    el.setAttribute('href', 'mailto:' + contactEmail);
    el.textContent = contactEmail;
  });

  /* ------------------------------------------------------------------------
     4b. TÉMOIGNAGES CLIENTS (AFFICHÉS UNIQUEMENT SI TEMOIGNAGES NON VIDE)
     ------------------------------------------------------------------------ */
  var testimonialsSection = document.getElementById('testimonialsSection');
  var testimonialsGrid = document.getElementById('testimonialsGrid');
  if (testimonialsSection && testimonialsGrid && Array.isArray(TEMOIGNAGES) && TEMOIGNAGES.length > 0) {
    testimonialsGrid.innerHTML = '';
    TEMOIGNAGES.forEach(function (item) {
      var card = document.createElement('article');
      card.className = 'testimonial-card';

      var quote = document.createElement('blockquote');
      quote.className = 'testimonial-quote';
      quote.textContent = '« ' + String(item.texte || '') + ' »';
      card.appendChild(quote);

      var meta = document.createElement('p');
      meta.className = 'testimonial-author';
      meta.textContent = String(item.auteur || '') + (item.prestation ? ' · ' + String(item.prestation) : '');
      card.appendChild(meta);

      testimonialsGrid.appendChild(card);
    });
    testimonialsSection.classList.remove('is-hidden');
  }

  /* ------------------------------------------------------------------------
     5. EFFET 3D PERSPECTIVE TILT LÉGER SUR LES CARTES
     ------------------------------------------------------------------------ */
  function bindTilt3D(el, maxTilt) {
    if (!el || el.dataset.tiltBound) return;
    el.dataset.tiltBound = '1';
    var sheen = el.querySelector('.tilt-sheen');
    var tiltAngle = Number(maxTilt || el.getAttribute('data-tilt') || 5);

    function canTilt() {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
      return window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    }

    el.addEventListener('mousemove', function (e) {
      if (!canTilt()) return;
      var rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var px = (e.clientX - rect.left) / rect.width;
      var py = (e.clientY - rect.top) / rect.height;
      var rx = (0.5 - py) * (tiltAngle * 2);
      var ry = (px - 0.5) * (tiltAngle * 2);
      el.style.transform =
        'perspective(1100px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) scale3d(1.015, 1.015, 1.015)';
      if (sheen) {
        sheen.style.opacity = '1';
        sheen.style.background =
          'radial-gradient(circle at ' + (px * 100).toFixed(1) + '% ' + (py * 100).toFixed(1) + '%, rgba(231, 202, 145, 0.16), transparent 58%)';
      }
    });

    el.addEventListener('mouseleave', function () {
      el.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      if (sheen) sheen.style.opacity = '0';
    });
  }

  document.querySelectorAll('.tilt-3d').forEach(function (node) {
    bindTilt3D(node);
  });

  /* ------------------------------------------------------------------------
     6. COUVERTURE STATIQUE (SANS ANIMATION) & HEADER SCROLL
     ------------------------------------------------------------------------ */
  var header = document.getElementById('siteHeader');
  var scrollProgressFill = document.getElementById('scrollProgressFill');
  var scrollRaf = 0;

  function updateHeaderScroll() {
    scrollRaf = 0;
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    }
    if (scrollProgressFill) {
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      scrollProgressFill.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    }
  }

  function scheduleHeaderScroll() {
    if (!scrollRaf) {
      scrollRaf = requestAnimationFrame(updateHeaderScroll);
    }
  }

  updateHeaderScroll();
  window.addEventListener('scroll', scheduleHeaderScroll, { passive: true });
  window.addEventListener('resize', scheduleHeaderScroll, { passive: true });

  /* ------------------------------------------------------------------------
     8. MENU MOBILE
     ------------------------------------------------------------------------ */
  var mobileBtn = document.getElementById('mobileMenuBtn');
  var mobileDrawer = document.getElementById('mobileDrawer');
  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', function () {
      var open = mobileDrawer.classList.toggle('is-open');
      mobileBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileDrawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileDrawer.classList.remove('is-open');
        mobileBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ------------------------------------------------------------------------
     9. ANIMATIONS D'APPARITION AU DÉFILEMENT
     ------------------------------------------------------------------------ */
  var reveals = document.querySelectorAll('.reveal');
  var revealObserver = null;
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
  }
  function observeReveals(nodes) {
    nodes.forEach(function (el) {
      if (revealObserver) {
        revealObserver.observe(el);
      } else {
        el.classList.add('is-visible');
      }
    });
  }
  if (reveals.length > 0) {
    observeReveals(Array.prototype.slice.call(reveals));
  }

  /* ------------------------------------------------------------------------
     10. LIGHTBOX PLEIN ÉCRAN (SUR GALERIES HTML STATIQUES)
     ------------------------------------------------------------------------ */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxTitle = document.getElementById('lightboxTitle');
  var lightboxCounter = document.getElementById('lightboxCounter');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var lightboxList = [];
  var lightboxIndex = 0;
  var lastFocusedBeforeLightbox = null;

  function updateLightbox() {
    var photo = lightboxList[lightboxIndex];
    if (!photo || !lightboxImg || !lightboxTitle || !lightboxCounter) return;
    lightboxImg.src = photo.src || assetUrl(photo.file);
    lightboxImg.alt = photo.alt || (photo.title + ' — DIONTADO PRODUCTION');
    lightboxTitle.textContent = photo.title + (photo.category ? ' (' + photo.category + ')' : '');
    lightboxCounter.textContent = (lightboxIndex + 1) + ' / ' + lightboxList.length;
  }

  function getLightboxFocusable() {
    if (!lightbox) return [];
    return Array.prototype.slice.call(
      lightbox.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) {
      return el.offsetParent !== null;
    });
  }

  function openLightbox(index, list, triggerEl) {
    if (!list || list.length === 0) return;
    lastFocusedBeforeLightbox = triggerEl || document.activeElement;
    lightboxList = list;
    lightboxIndex = index;
    updateLightbox();
    if (lightbox) {
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    }
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (lastFocusedBeforeLightbox && typeof lastFocusedBeforeLightbox.focus === 'function') {
        lastFocusedBeforeLightbox.focus();
      }
      lastFocusedBeforeLightbox = null;
    }
  }

  function bindLightboxTriggers(triggers) {
    var pagePhotos = triggers.map(function (btn) {
      var imgEl = btn.querySelector('img');
      return {
        src: imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src')) : '',
        file: btn.getAttribute('data-photo-file') || '',
        category: btn.getAttribute('data-photo-cat') || '',
        title: btn.getAttribute('data-photo-title') || 'Photographie',
        alt: imgEl ? (imgEl.getAttribute('alt') || '') : ''
      };
    });

    triggers.forEach(function (btn, idx) {
      if (btn.dataset.lbBound) return;
      btn.dataset.lbBound = '1';
      btn.addEventListener('click', function () {
        openLightbox(idx, pagePhotos, btn);
      });
    });

    return pagePhotos;
  }

  var staticGalleryTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox-index]'));
  if (staticGalleryTriggers.length > 0) {
    var pagePhotos = bindLightboxTriggers(staticGalleryTriggers);

    var heroLightboxBtn = document.getElementById('categoryHeroLightboxBtn');
    if (heroLightboxBtn) {
      heroLightboxBtn.addEventListener('click', function () {
        openLightbox(0, pagePhotos, heroLightboxBtn);
      });
    }
  } else if (GALLERY_PHOTOS.length > 0) {
    lightboxList = GALLERY_PHOTOS;
  }

  function stepLightbox(delta) {
    if (lightboxList.length === 0) return;
    lightboxIndex = (lightboxIndex + delta + lightboxList.length) % lightboxList.length;
    updateLightbox();
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', function () {
      stepLightbox(-1);
    });
  }
  if (lightboxNext) {
    lightboxNext.addEventListener('click', function () {
      stepLightbox(1);
    });
  }
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    var touchStartX = 0;
    var touchStartY = 0;
    var touchActive = false;
    lightbox.addEventListener('touchstart', function (e) {
      if (!e.touches || e.touches.length !== 1) {
        touchActive = false;
        return;
      }
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchActive = true;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      if (!touchActive || !e.changedTouches || e.changedTouches.length !== 1) return;
      touchActive = false;
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        stepLightbox(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      lightboxIndex = (lightboxIndex - 1 + lightboxList.length) % lightboxList.length;
      updateLightbox();
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      lightboxIndex = (lightboxIndex + 1) % lightboxList.length;
      updateLightbox();
      return;
    }
    if (e.key === 'Tab') {
      var focusables = getLightboxFocusable();
      if (focusables.length === 0) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ------------------------------------------------------------------------
     11. LECTEUR VIDÉO & FILTRAGE PAR CATÉGORIE (SUR HTML STATIQUE)
     ------------------------------------------------------------------------ */
  var videoStage = document.getElementById('videoStage');
  var videoStageBar = document.getElementById('videoStageBar');
  var videoStageCat = document.getElementById('videoStageCat');
  var videoStageTitle = document.getElementById('videoStageTitle');
  var videoStageDesc = document.getElementById('videoStageDesc');
  var videoFilterTabs = document.getElementById('videoFilterTabs');
  var videoCountEl = document.getElementById('videoCount');
  var videoGalleryGrid = document.getElementById('videoGalleryGrid');
  var videoEmptyState = document.getElementById('videoEmptyState');

  var activeVideoId = VIDEO_ITEMS[0] ? VIDEO_ITEMS[0].id : null;
  var isVideoPlaying = false;

  function findVideoById(vidId) {
    for (var i = 0; i < VIDEO_ITEMS.length; i++) {
      if (VIDEO_ITEMS[i].id === vidId) return VIDEO_ITEMS[i];
    }
    return null;
  }

  function resolvePosterUrl(vid) {
    if (vid.posterAsset) return assetUrl(vid.posterAsset);
    if (vid.posterUrl) return vid.posterUrl;
    if (vid.youtubeId) return 'https://i.ytimg.com/vi/' + encodeURIComponent(vid.youtubeId) + '/hqdefault.jpg';
    return assetUrl('cover.jpg');
  }

  function playVideoInStage(vid) {
    if (!videoStage || !vid) return;
    activeVideoId = vid.id;
    isVideoPlaying = true;

    if (videoStageBar) videoStageBar.classList.add('is-visible');
    if (videoStageCat) videoStageCat.textContent = vid.category;
    if (videoStageTitle) videoStageTitle.textContent = vid.title;
    if (videoStageDesc) videoStageDesc.textContent = vid.desc;

    if (vid.sourceType === 'mp4' && vid.videoSrc) {
      videoStage.innerHTML =
        '<video src="' + escapeHTML(vid.videoSrc) + '" poster="' + escapeHTML(resolvePosterUrl(vid)) + '" controls playsinline autoplay></video>';
    } else if (vid.youtubeId) {
      videoStage.innerHTML =
        '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(vid.youtubeId) + '?rel=0&autoplay=1&playsinline=1" ' +
        'title="' + escapeHTML(vid.title) + '" ' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
        'allowfullscreen></iframe>';
    }

    if (videoGalleryGrid) {
      videoGalleryGrid.querySelectorAll('.video-card').forEach(function (card) {
        card.classList.toggle('is-playing', isVideoPlaying && card.getAttribute('data-video-id') === activeVideoId);
      });
    }
  }

  var showreelPlayBtn = document.getElementById('showreelPlayBtn');
  if (showreelPlayBtn) {
    showreelPlayBtn.addEventListener('click', function () {
      var targetId = showreelPlayBtn.getAttribute('data-video-id') || (VIDEO_ITEMS[0] && VIDEO_ITEMS[0].id);
      var vid = findVideoById(targetId);
      if (vid) playVideoInStage(vid);
    });
  }

  if (videoGalleryGrid) {
    videoGalleryGrid.querySelectorAll('.video-card[data-video-id]').forEach(function (card) {
      card.addEventListener('click', function () {
        var vid = findVideoById(card.getAttribute('data-video-id'));
        if (!vid) return;
        playVideoInStage(vid);
        var stageShell = document.getElementById('videoStageShell');
        if (stageShell) stageShell.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  if (videoFilterTabs && videoGalleryGrid) {
    videoFilterTabs.querySelectorAll('.filter-btn[data-video-cat]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var chosenCat = btn.getAttribute('data-video-cat') || 'Toutes';
        videoFilterTabs.querySelectorAll('.filter-btn').forEach(function (other) {
          var sel = other === btn;
          other.classList.toggle('is-active', sel);
          other.setAttribute('aria-selected', sel ? 'true' : 'false');
        });

        var visibleCount = 0;
        videoGalleryGrid.querySelectorAll('.video-card[data-video-cat]').forEach(function (card) {
          var cardCat = card.getAttribute('data-video-cat');
          var show = chosenCat === 'Toutes' || cardCat === chosenCat;
          card.classList.toggle('is-hidden', !show);
          if (show) visibleCount++;
        });

        if (videoCountEl) {
          videoCountEl.textContent = visibleCount + (visibleCount > 1 ? ' films' : ' film');
        }
        if (videoEmptyState) {
          videoEmptyState.classList.toggle('is-hidden', visibleCount > 0);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     12. SÉLECTEUR INTERACTIF PORTFOLIO « MON TRAVAIL » & GALERIE MASONRY
     ------------------------------------------------------------------------ */
  var portfolioCatTabs = document.getElementById('portfolioCatTabs');
  var portfolioShowcaseImg = document.getElementById('portfolioShowcaseImg');
  var portfolioMasonryGrid = document.getElementById('portfolioMasonryGrid');
  var portfolioCategoryLink = document.getElementById('portfolioCategoryLink');

  if (portfolioCatTabs && PHOTO_CATEGORIES.length > 0) {
    var getPhotosForCategory = function (cat) {
      if (!cat) return [];
      var target = String(cat.folderMatch || '').toLowerCase();
      return GALLERY_PHOTOS.filter(function (p) {
        return String(p.category || '').toLowerCase() === target;
      });
    };

    var findCategoryBySlug = function (slug) {
      for (var i = 0; i < PHOTO_CATEGORIES.length; i++) {
        if (PHOTO_CATEGORIES[i].slug === slug) return PHOTO_CATEGORIES[i];
      }
      return null;
    };

    var activeCategories = PHOTO_CATEGORIES.filter(function (cat) {
      return getPhotosForCategory(cat).length > 0;
    });

    // Masquer toute catégorie sans photo et supprimer tout compteur "0" résiduel
    portfolioCatTabs.querySelectorAll('[data-cat-slug]').forEach(function (tab) {
      var slug = tab.getAttribute('data-cat-slug');
      if (slug === 'all') return;
      var cat = findCategoryBySlug(slug);
      var count = cat ? getPhotosForCategory(cat).length : 0;
      if (count === 0) {
        tab.remove();
      } else {
        var countSpan = tab.querySelector('.portfolio-tab-count');
        if (countSpan) countSpan.remove();
      }
    });

    var previewPortfolioCategory = function (slug) {
      if (slug === 'all') {
        if (portfolioShowcaseImg && activeCategories[0]) {
          portfolioShowcaseImg.setAttribute('src', assetUrl(activeCategories[0].coverFile || 'cover.jpg'));
          portfolioShowcaseImg.setAttribute('alt', 'Portfolio photographique — DIONTADO PRODUCTION');
        }
        return;
      }
      var cat = findCategoryBySlug(slug);
      if (!cat) return;

      if (portfolioShowcaseImg) {
        var coverName = cat.coverFile || 'cover.jpg';
        portfolioShowcaseImg.setAttribute('src', assetUrl(coverName));
        portfolioShowcaseImg.setAttribute('alt', cat.title + ' — DIONTADO PRODUCTION');
      }
    };

    var renderMasonryFilter = function (slug) {
      if (!portfolioMasonryGrid) return;
      var filtered = slug === 'all'
        ? GALLERY_PHOTOS.slice()
        : getPhotosForCategory(findCategoryBySlug(slug));

      if (portfolioCategoryLink) {
        if (slug === 'all') {
          portfolioCategoryLink.setAttribute('href', BASE_PATH + '/realisations/');
          portfolioCategoryLink.textContent = 'Voir toutes les collections →';
        } else {
          var selectedCat = findCategoryBySlug(slug);
          portfolioCategoryLink.setAttribute('href', BASE_PATH + '/realisations/' + encodeURIComponent(slug) + '/');
          portfolioCategoryLink.textContent = 'Ouvrir la page ' + (selectedCat ? selectedCat.title : slug) + ' →';
        }
      }

      portfolioCatTabs.querySelectorAll('[data-cat-slug]').forEach(function (tab) {
        var isMatch = tab.getAttribute('data-cat-slug') === slug;
        tab.classList.toggle('is-active', isMatch);
        tab.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
      });

      portfolioMasonryGrid.innerHTML = '';
      var createdButtons = [];
      filtered.forEach(function (photo, idx) {
        var itemWrap = document.createElement('div');
        itemWrap.className = 'gallery-item reveal';
        itemWrap.style.transitionDelay = ((idx % 3) * 65) + 'ms';

        var cardBtn = document.createElement('button');
        cardBtn.type = 'button';
        cardBtn.className = 'gallery-card';
        cardBtn.setAttribute('data-lightbox-index', String(idx));
        cardBtn.setAttribute('data-photo-file', photo.file);
        cardBtn.setAttribute('data-photo-cat', photo.category);
        cardBtn.setAttribute('data-photo-title', photo.title);
        cardBtn.setAttribute('aria-label', 'Agrandir ' + photo.title + ' (' + photo.category + ')');

        var imgEl = document.createElement('img');
        imgEl.src = assetUrl(photo.file);
        imgEl.alt = photo.alt || (photo.title + ' — DIONTADO PRODUCTION');
        imgEl.width = 900;
        imgEl.height = 1200;
        imgEl.loading = 'lazy';
        imgEl.decoding = 'async';

        var overlay = document.createElement('div');
        overlay.className = 'gallery-overlay';
        overlay.innerHTML =
          '<span class="kicker gallery-overlay-cat">' + escapeHTML(photo.category) + '</span>' +
          '<span class="gallery-overlay-title">' + escapeHTML(photo.title) + '</span>';

        cardBtn.appendChild(imgEl);
        cardBtn.appendChild(overlay);
        itemWrap.appendChild(cardBtn);
        portfolioMasonryGrid.appendChild(itemWrap);
        createdButtons.push(cardBtn);
      });

      bindLightboxTriggers(createdButtons);
      observeReveals(Array.prototype.slice.call(portfolioMasonryGrid.querySelectorAll('.reveal')));
    };

    portfolioCatTabs.querySelectorAll('[data-cat-slug]').forEach(function (tab) {
      var slug = tab.getAttribute('data-cat-slug');
      tab.addEventListener('mouseenter', function () {
        previewPortfolioCategory(slug);
      });
      tab.addEventListener('focus', function () {
        previewPortfolioCategory(slug);
      });
      if (portfolioMasonryGrid) {
        tab.addEventListener('click', function (e) {
          e.preventDefault();
          previewPortfolioCategory(slug);
          renderMasonryFilter(slug);
        });
      }
    });

    if (portfolioMasonryGrid) {
      renderMasonryFilter('all');
    }
  }

  /* Masquer les catégories à 0 photo dans les grilles "Explorer d'autres univers" */
  if (PHOTO_CATEGORIES.length > 0 && GALLERY_PHOTOS.length > 0) {
    document.querySelectorAll('.other-cats-grid .other-cat-btn[href]').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var match = href.match(/\/realisations\/([a-z0-9-]+)\/?$/i);
      if (!match) return;
      var slug = match[1].toLowerCase();
      var catObj = null;
      for (var i = 0; i < PHOTO_CATEGORIES.length; i++) {
        if (PHOTO_CATEGORIES[i].slug === slug) { catObj = PHOTO_CATEGORIES[i]; break; }
      }
      if (!catObj) return;
      var target = String(catObj.folderMatch || '').toLowerCase();
      var count = GALLERY_PHOTOS.filter(function (p) {
        return String(p.category || '').toLowerCase() === target;
      }).length;
      if (count === 0) link.remove();
    });
  }
})();
