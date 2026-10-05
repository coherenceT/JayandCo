/* =============================================================
   JAY & CO JEWELERS — main.js
   Sticky nav, mobile menu, scroll reveals, stat counters,
   active-section highlighting, form validation & feedback.
   No dependencies. Honors prefers-reduced-motion.
   ============================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------- reveal on scroll (declared early:
     the scroll handler below also sweeps past-due reveals as a safety net) */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var revealObserver = null;

  function show(el) {
    el.classList.add('is-visible');
    if (revealObserver) revealObserver.unobserve(el);
  }

  function sweepReveals() {
    if (!reveals.length) return;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    reveals = reveals.filter(function (el) {
      if (el.classList.contains('is-visible')) return false;
      if (el.getBoundingClientRect().top < vh * 0.92) {
        show(el);
        return false;
      }
      return true;
    });
  }

  /* ---------------------------------------------- sticky nav + progress */
  var nav = document.querySelector('.nav');
  var progress = document.querySelector('[data-scroll-progress]');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('is-scrolled', y > 24);

    if (progress) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? Math.min(1, y / max) : 0;
      progress.style.transform = 'scaleX(' + pct.toFixed(4) + ')';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(function () {
        onScroll();
        sweepReveals();
      });
    }
  }, { passive: true });
  onScroll();

  /* ---------------------------------------------- mobile menu */
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('mobile-menu');

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);

    if (open) {
      menu.hidden = false;
      // next frame so the transition runs
      window.requestAnimationFrame(function () { menu.classList.add('is-open'); });
    } else {
      menu.classList.remove('is-open');
      window.setTimeout(function () {
        if (toggle.getAttribute('aria-expanded') === 'false') menu.hidden = true;
      }, 350);
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

  // desktop resize should not leave the overlay stuck open
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 900 && toggle && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
    }
  });

  /* ---------------------------------------------- reveal on scroll */
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
    reveals = [];
  } else {
    // stagger siblings that reveal together
    var groups = new Map();
    reveals.forEach(function (el) {
      var parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, 0);
      var i = groups.get(parent);
      el.style.setProperty('--reveal-delay', Math.min(i * 0.09, 0.45) + 's');
      groups.set(parent, i + 1);
    });

    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) show(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    reveals.forEach(function (el) { revealObserver.observe(el); });
    sweepReveals();
    window.addEventListener('load', sweepReveals);
  }

  /* ---------------------------------------------- stat counters */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var comma = el.getAttribute('data-format') === 'comma';
    var duration = 1600;
    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      var value = Math.round(target * eased);
      el.textContent = (comma ? value.toLocaleString('en-US') : value) + suffix;
      if (p < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  if (counters.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      // leave the server-rendered values as they are
    } else {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { countObserver.observe(el); });
    }
  }

  /* ---------------------------------------------- active nav link */
  var sections = Array.prototype.slice.call(
    document.querySelectorAll('main section[id], #visit')
  );
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav__links a')
  );

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var linkFor = function (id) {
      return navLinks.filter(function (a) {
        return a.getAttribute('href') === '#' + id;
      })[0];
    };

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) { a.classList.remove('is-active'); });
        var active = linkFor(id) ||
          linkFor(id === 'visit' ? 'contact' : id) ||
          linkFor(id === 'stats' ? 'collections' : id);
        if (active) active.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------------------------------------------- forms */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var WA_NUMBER = '27826986800'; // Business WhatsApp: +27 82 698 6800

  function fieldOf(input) { return input.closest('.field'); }

  function setError(input, message) {
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
      setError(input, 'This field is required.');
      return false;
    }
    if (type === 'email' && value && !EMAIL_RE.test(value)) {
      setError(input, 'Please enter a valid email address.');
      return false;
    }
    if (input.id === 'message' && value && value.length < 10) {
      setError(input, 'A few more words, please — at least 10 characters.');
      return false;
    }
    setError(input, '');
    return true;
  }

  function handleSubmit(form) {
    var inputs = Array.prototype.slice.call(form.querySelectorAll('input, textarea'));
    var ok = true;
    inputs.forEach(function (input) { if (!validate(input)) ok = false; });
    if (!ok) {
      var firstBad = form.querySelector('.field.is-invalid input, .field.is-invalid textarea');
      if (firstBad) firstBad.focus();
      return;
    }

    // Enquiry → real delivery through WhatsApp with the message prefilled.
    // (No backend needed; opens inside the click gesture so popups are allowed.)
    if (form.getAttribute('data-form') === 'enquiry') {
      var val = function (id) {
        var el = form.querySelector('#' + id);
        return el ? el.value.trim() : '';
      };
      var message = [
        'Hi Jay & Co Jewellers,',
        '',
        'Name: ' + val('name'),
        'Email: ' + val('email'),
        '',
        'Message: ' + val('message')
      ].join('\n');
      var waUrl = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
      // NB: do not pass 'noopener' as a feature — window.open then returns null
      // even on success, which would wrongly trigger the navigation fallback.
      var opened = window.open(waUrl, '_blank');
      if (opened) {
        try { opened.opener = null; } catch (e) { /* cross-origin: already isolated */ }
      } else {
        window.location.href = waUrl;
      }
    }

    var button = form.querySelector('button[type="submit"]');
    var label = button ? button.querySelector('[data-btn-text]') : null;
    var original = label ? label.textContent : '';
    if (button) button.disabled = true;
    if (label) label.textContent = 'Opening WhatsApp…';

    // Subscribe forms are a demo here — wire to your mailing-list endpoint:
    //   fetch('/api/subscribe', { method: 'POST', body: new FormData(form) })
    window.setTimeout(function () {
      if (label) label.textContent = original;
      if (button) button.disabled = false;
      form.reset();
      inputs.forEach(function (input) { setError(input, ''); });

      var success = form.querySelector('.form__success');
      if (success) {
        success.hidden = false;
        window.setTimeout(function () { success.hidden = true; }, 7000);
      }
    }, 900);
  }

  Array.prototype.slice.call(document.querySelectorAll('form[data-form]')).forEach(function (form) {
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleSubmit(form);
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

  /* ---------------------------------------------- footer year */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
