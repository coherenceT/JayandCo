/* =============================================================
   JAY & CO JEWELERS — rebuilt shared JS
   Sticky header, reveal on scroll, mobile menu, stat counters,
   form validation + success states. No dependencies.
   ============================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------- header scroll state */
  var header = document.querySelector('.header');
  var ticking = false;

  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* -------------------------------------------------- reveal on scroll */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var revealObserver = null;

  function show(el) {
    el.classList.add('is-visible');
    if (revealObserver) revealObserver.unobserve(el);
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
    reveals = [];
  } else {
    var groups = new Map();
    reveals.forEach(function (el) {
      var parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, 0);
      var i = groups.get(parent);
      el.style.setProperty('--reveal-delay', Math.min(i * 0.08, 0.4) + 's');
      groups.set(parent, i + 1);
    });

    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) show(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

    reveals.forEach(function (el) { revealObserver.observe(el); });

    function sweep() {
      if (!reveals.length) return;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      reveals = reveals.filter(function (el) {
        if (el.classList.contains('is-visible')) return false;
        if (el.getBoundingClientRect().top < vh * 0.92) { show(el); return false; }
        return true;
      });
    }
    sweep();
    window.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('load', sweep);
  }

  /* -------------------------------------------------- mobile menu */
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('mobile-menu');

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);

    if (open) {
      menu.hidden = false;
      window.requestAnimationFrame(function () { menu.classList.add('is-open'); });
    } else {
      menu.classList.remove('is-open');
      window.setTimeout(function () {
        if (toggle.getAttribute('aria-expanded') === 'false') menu.hidden = true;
      }, 300);
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 900 && toggle && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
    }
  });

  /* -------------------------------------------------- homepage stat counters */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    function animate(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var comma = el.getAttribute('data-format') === 'comma';
      var duration = 1600;
      var start = null;
      function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        var value = Math.round(target * eased);
        el.textContent = (comma ? value.toLocaleString('en-US') : value) + suffix;
        if (p < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    }
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* -------------------------------------------------- forms: validation + success states */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function fieldOf(input) { return input ? input.closest('.field') : null; }

  function setFieldError(input, message) {
    var field = fieldOf(input);
    if (!field) return;
    var slot = field.querySelector('[data-error]');
    field.classList.toggle('is-invalid', Boolean(message));
    field.classList.toggle('is-valid', !message && Boolean(input.value.trim()));
    if (slot) slot.textContent = message || '';
  }

  function validate(input) {
    var value = (input.value || '').trim();
    var type = input.getAttribute('type');

    if (input.hasAttribute('required') && !value) {
      setFieldError(input, 'This field is required.');
      return false;
    }
    if (type === 'email' && value && !EMAIL_RE.test(value)) {
      setFieldError(input, 'Please enter a valid email address.');
      return false;
    }
    if (input.id === 'message' && value && value.length < 10) {
      setFieldError(input, 'A few more words, please — at least 10 characters.');
      return false;
    }
    setFieldError(input, '');
    return true;
  }

  function handleEnquiry(form) {
    var inputs = Array.prototype.slice.call(form.querySelectorAll('input, textarea'));
    var ok = true;
    inputs.forEach(function (input) { if (!validate(input)) ok = false; });
    if (!ok) {
      var firstBad = form.querySelector('.field.is-invalid input, .field.is-invalid textarea');
      if (firstBad) firstBad.focus();
      return;
    }

    var name = form.querySelector('#name').value.trim();
    var email = form.querySelector('#email').value.trim();
    var message = form.querySelector('#message').value.trim();

    /* Real business WhatsApp number, in full international format for wa.me.
       A form can override it with data-phone; non-digits are always stripped. */
    var defaultPhone = '27826986800';
    var phoneAttr = form.getAttribute('data-phone');
    if (phoneAttr) defaultPhone = String(phoneAttr).replace(/\D/g, '');

    var lines = [
      'Hi Jay & Co,',
      '',
      'Name: ' + name,
      'Email: ' + email,
      '',
      'Message: ' + message
    ];
    var text = lines.join('\n');
    var waUrl = 'https://wa.me/' + defaultPhone + '?text=' + encodeURIComponent(text);

    var opened = window.open(waUrl, '_blank');
    if (!opened || opened.closed || typeof opened.closed === 'undefined') {
      window.location.href = waUrl;
    }

    var button = form.querySelector('button[type="submit"]');
    var label = button ? button.querySelector('[data-btn-text]') : null;
    var original = label ? label.textContent : '';
    if (button) button.disabled = true;
    if (label) label.textContent = 'Opening conversation…';

    window.setTimeout(function () {
      if (label) label.textContent = original;
      if (button) button.disabled = false;
      form.reset();
      inputs.forEach(function (input) { setFieldError(input, ''); });

      var success = form.querySelector('.form__success');
      if (success) {
        success.hidden = false;
        window.setTimeout(function () { success.hidden = true; }, 7000);
      }
    }, 900);
  }

  function handleSubscribe(form) {
    var emailInput = form.querySelector('#subscriber-email, #newsletter-email, #footer-subscribe-email');
    if (!emailInput) emailInput = form.querySelector('input[type="email"]');
    var ok = emailInput && validate(emailInput);
    if (!ok) return;

    var button = form.querySelector('button[type="submit"]');
    var label = button ? button.querySelector('[data-btn-text]') : null;
    var original = label ? label.textContent : '';
    if (button) button.disabled = true;
    if (label) label.textContent = 'Subscribing…';

    window.setTimeout(function () {
      if (label) label.textContent = original;
      if (button) button.disabled = false;
      form.reset();
      if (emailInput) setFieldError(emailInput, '');

      var success = form.querySelector('.form__success');
      if (success) {
        success.hidden = false;
        window.setTimeout(function () { success.hidden = true; }, 7000);
      }
    }, 700);
  }

  Array.prototype.slice.call(document.querySelectorAll('form[data-form]')).forEach(function (form) {
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.getAttribute('data-form') === 'enquiry') handleEnquiry(form);
      else if (form.getAttribute('data-form') === 'subscribe') handleSubscribe(form);
    });

    Array.prototype.slice.call(form.querySelectorAll('input, textarea')).forEach(function (input) {
      input.addEventListener('blur', function () {
        if (input.value.trim() || fieldOf(input).classList.contains('is-invalid')) validate(input);
      });
      input.addEventListener('input', function () {
        var field = fieldOf(input);
        if (field && field.classList.contains('is-invalid')) validate(input);
      });
    });
  });

  /* -------------------------------------------------- piece viewer (gallery)
     Tiles are real links, so the page works without JS. With JS we open the
     piece in a viewer and let the visitor browse the rest of its collection. */
  var pieceLinks = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));

  if (pieceLinks.length) {
    var WA_NUMBER = '27826986800';              /* same number the enquiry form uses */
    var CONTACT_EMAIL = 'info@stylejewellers.co.za';

    var viewer = document.createElement('div');
    viewer.className = 'piece';
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');
    viewer.setAttribute('aria-labelledby', 'piece-title');
    viewer.hidden = true;
    viewer.innerHTML =
      '<button class="piece__close" type="button" aria-label="Close this piece">&times;</button>' +
      '<div class="piece__panel">' +
        '<div class="piece__stage">' +
          '<img class="piece__img" alt="">' +
          '<a class="btn piece__enquire" data-piece-enquire target="_blank" rel="noopener">Send us an Enquiry</a>' +
        '</div>' +
        '<div class="piece__body">' +
          '<p class="piece__collection"></p>' +
          '<h2 class="piece__title" id="piece-title"></h2>' +
          '<div class="piece__rule" aria-hidden="true"></div>' +
          '<p class="piece__text"></p>' +
          '<div class="piece__nav">' +
            '<button class="piece__arrow" type="button" data-piece-prev aria-label="Previous piece">&#8592;</button>' +
            '<span class="piece__counter" aria-live="polite"></span>' +
            '<button class="piece__arrow" type="button" data-piece-next aria-label="Next piece">&#8594;</button>' +
          '</div>' +
          '<p class="piece__email">or email <a data-piece-email></a></p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(viewer);

    var vImg = viewer.querySelector('.piece__img');
    var vCollection = viewer.querySelector('.piece__collection');
    var vTitle = viewer.querySelector('.piece__title');
    var vText = viewer.querySelector('.piece__text');
    var vCounter = viewer.querySelector('.piece__counter');
    var vEnquire = viewer.querySelector('[data-piece-enquire]');
    var vEmail = viewer.querySelector('[data-piece-email]');
    var vClose = viewer.querySelector('.piece__close');

    var group = [];        /* tiles of the collection being browsed */
    var groupIndex = 0;
    var groupName = '';
    var lastFocused = null;

    function renderPiece() {
      var link = group[groupIndex];
      if (!link) return;
      var thumb = link.querySelector('img');
      var ref = link.getAttribute('data-ref') || '';

      vImg.src = link.getAttribute('href');
      vImg.alt = thumb ? thumb.alt : '';
      vCollection.textContent = groupName;
      vTitle.textContent = ref;
      vText.textContent = link.getAttribute('data-description') || '';
      vCounter.textContent = (groupIndex + 1) + ' / ' + group.length;

      var message = 'Hi Jay & Co,\n\nI would like to enquire about ' + ref +
                    ' (' + groupName + ').\n\nPlease send me more details.\n';
      vEnquire.setAttribute('href', 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message));
      vEnquire.setAttribute('aria-label', 'Send us an enquiry about ' + ref + ' on WhatsApp');
      vEmail.setAttribute('href', 'mailto:' + CONTACT_EMAIL +
                          '?subject=' + encodeURIComponent('Enquiry: ' + ref));
      vEmail.textContent = CONTACT_EMAIL;
    }

    function openPiece(link) {
      var grid = link.closest('[data-collection]');
      group = grid
        ? Array.prototype.slice.call(grid.querySelectorAll('[data-lightbox]'))
        : [link];
      groupName = grid ? (grid.getAttribute('data-collection') || '') : '';
      groupIndex = Math.max(0, group.indexOf(link));
      lastFocused = link;
      renderPiece();
      viewer.hidden = false;
      document.body.classList.add('piece-open');
      vClose.focus();
    }

    function closePiece() {
      viewer.hidden = true;
      vImg.removeAttribute('src');
      document.body.classList.remove('piece-open');
      if (lastFocused) lastFocused.focus();
    }

    function stepPiece(delta) {
      if (!group.length) return;
      groupIndex = (groupIndex + delta + group.length) % group.length;
      renderPiece();
    }

    pieceLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        /* let Cmd/Ctrl/Shift-click and middle-click open the file as usual */
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        openPiece(link);
      });
    });

    viewer.querySelector('[data-piece-prev]').addEventListener('click', function () { stepPiece(-1); });
    viewer.querySelector('[data-piece-next]').addEventListener('click', function () { stepPiece(1); });
    vClose.addEventListener('click', closePiece);
    viewer.addEventListener('click', function (e) {
      if (e.target === viewer) closePiece();
    });

    document.addEventListener('keydown', function (e) {
      if (viewer.hidden) return;
      if (e.key === 'Escape') closePiece();
      else if (e.key === 'ArrowLeft') stepPiece(-1);
      else if (e.key === 'ArrowRight') stepPiece(1);
    });
  }

  /* -------------------------------------------------- footer year */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
