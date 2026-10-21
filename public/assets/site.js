// Mogeny LLC site script: mobile menu, desktop dropdowns, loading the CRM form and chat widget when needed,
// Contact us scrolling and scroll motion.
(function () {
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      setMenu(false);
      document.querySelectorAll('.nav .has-sub.open').forEach(function (li) { setSub(li, false); });
    }
  });

  // Desktop dropdowns: hover and focus open them in CSS, the button toggles them for touch and keyboard
  function setSub(li, open) {
    li.classList.toggle('open', open);
    var b = li.querySelector('.nav-button');
    if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  document.querySelectorAll('.nav .has-sub').forEach(function (li) {
    var b = li.querySelector('.nav-button');
    b.addEventListener('click', function () {
      var open = !li.classList.contains('open');
      document.querySelectorAll('.nav .has-sub.open').forEach(function (o) { if (o !== li) setSub(o, false); });
      setSub(li, open);
    });
    li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) setSub(li, false); });
  });
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.nav .has-sub.open').forEach(function (li) { if (!li.contains(e.target)) setSub(li, false); });
  });

  // The CRM form and chat widget wait, exactly as given, inside <template> tags. Putting them on the page only
  // when needed keeps their heavy scripts out of the first load.
  function stamp(id) {
    var tpl = document.getElementById(id);
    if (!tpl || tpl.getAttribute('data-done')) return;
    tpl.setAttribute('data-done', '1');
    tpl.parentNode.insertBefore(tpl.content.cloneNode(true), tpl);
  }
  // The chat widget loads on the visitor's first scroll, tap, key press or mouse movement. The form loads once
  // the visitor is within a screen or so of it and has interacted (or after 3.5 seconds there without
  // interacting, as on the contact page), or the moment a Contact us button is pressed.
  var interacted = false;
  var formNear = false;
  var interactionEvents = ['scroll', 'pointerdown', 'pointermove', 'touchstart', 'keydown', 'wheel'];
  function onInteract() {
    interactionEvents.forEach(function (ev) { window.removeEventListener(ev, onInteract, { passive: true }); });
    interacted = true;
    stamp('chat-widget-code');
    if (formNear) stamp('form-embed-code');
  }
  interactionEvents.forEach(function (ev) { window.addEventListener(ev, onInteract, { passive: true }); });
  var formBox = document.getElementById('contact-form');
  if (formBox) {
    if ('IntersectionObserver' in window) {
      var formIo = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        formIo.disconnect();
        formNear = true;
        if (interacted) stamp('form-embed-code');
        else setTimeout(function () { stamp('form-embed-code'); }, 3500);
      }, { rootMargin: '800px 0px' });
      formIo.observe(formBox);
    } else {
      stamp('form-embed-code');
    }
  }

  // Contact us: bring the whole form into the middle of the screen, below the header and above the phone buttons
  function headerHeight() {
    var h = document.querySelector('.site-header');
    return h ? h.getBoundingClientRect().height : 0;
  }
  function barHeight() {
    var bar = document.querySelector('.mobile-blur');
    return bar && getComputedStyle(bar).display !== 'none' ? bar.getBoundingClientRect().height : 0;
  }
  function goToForm() {
    var form = document.getElementById('contact-form');
    if (!form) { window.location.href = '/contact/#contact'; return; }
    stamp('form-embed-code');
    setMenu(false);
    var top = headerHeight();
    var room = window.innerHeight - top - barHeight();
    var rect = form.getBoundingClientRect();
    var y = window.scrollY + rect.top - top;
    if (rect.height < room) y -= (room - rect.height) / 2;
    window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', '#contact');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#contact"], a[href="/contact/#contact"]');
    if (!a) return;
    if (a.getAttribute('href') === '/contact/#contact' && !document.getElementById('contact-form')) return;
    e.preventDefault();
    goToForm();
  });
  if (location.hash === '#contact') {
    window.addEventListener('load', function () { setTimeout(goToForm, 50); });
  }

  // Scroll motion: sections settle into place as they come into view
  var items = document.querySelectorAll('[data-reveal]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
