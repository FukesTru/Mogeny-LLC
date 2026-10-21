// Mogeny LLC site script: mobile menu, desktop dropdowns, Contact us scrolling, built-in chat panel,
// the built-in contact form (opens the visitor's email app addressed to the firm) and scroll motion.
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
      closeChat();
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

  // Contact us: bring the whole form into the middle of the screen, below the header and above the phone buttons
  function headerHeight() {
    var h = document.querySelector('.site-header');
    return h ? h.getBoundingClientRect().height : 0;
  }
  function barHeight() {
    var bar = document.querySelector('.mobile-bar');
    return bar && getComputedStyle(bar).display !== 'none' ? bar.getBoundingClientRect().height : 0;
  }
  function goToForm() {
    var form = document.getElementById('contact-form');
    if (!form) { window.location.href = '/contact/#contact'; return; }
    setMenu(false);
    closeChat();
    var top = headerHeight();
    var room = window.innerHeight - top - barHeight();
    var rect = form.getBoundingClientRect();
    var y = window.scrollY + rect.top - top;
    if (rect.height < room) y -= (room - rect.height) / 2;
    window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? 'auto' : 'smooth' });
    var first = form.querySelector('input, select, textarea');
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
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

  // Built-in chat panel
  var panel = document.getElementById('chat-panel');
  var chatButtons = document.querySelectorAll('[data-chat-open]');
  function openChat() {
    if (!panel) return;
    setMenu(false);
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    chatButtons.forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    var c = panel.querySelector('.chat-close');
    if (c) c.focus({ preventScroll: true });
  }
  function closeChat() {
    if (!panel || !panel.classList.contains('open')) return;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    chatButtons.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
  }
  chatButtons.forEach(function (b) {
    b.addEventListener('click', function () { panel && panel.classList.contains('open') ? closeChat() : openChat(); });
  });
  if (panel) panel.querySelector('.chat-close').addEventListener('click', closeChat);

  // Built-in contact form: checks the fields, then opens the visitor's email app with the message to the firm
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var f = form.elements;
      var to = form.getAttribute('data-to');
      var lines = [
        'Name. ' + f.name.value,
        'Phone. ' + (f.phone.value || 'not given'),
        'Email. ' + f.email.value,
        '',
        f.message.value,
        '',
        'Sent from the contact form on ' + location.href
      ];
      var href = 'mailto:' + to + '?subject=' + encodeURIComponent('Website enquiry from ' + f.name.value) +
        '&body=' + encodeURIComponent(lines.join('\n'));
      var status = form.querySelector('.form-status');
      if (status) status.classList.add('show');
      window.location.href = href;
    });
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
