/* Designed & Developed by Kaushik AI Labs — https://www.kaushikailabs.com */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Year */
  $('#year').textContent = new Date().getFullYear();

  /* Header + back-to-top */
  var header = $('#header'), toTop = $('#toTop');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 30);
    toTop.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = $('#burger'), nav = $('#nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* Scroll reveal */
  var revealEls = $$('.reveal, .score-card');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* Active nav link */
  var links = $$('.nav a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (l) { l.classList.remove('active'); });
          map[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* Count-up stats */
  $$('[data-count]').forEach(function (el) {
    var target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10);
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = (0).toFixed(dec);
    var co = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      co.disconnect();
      var start = performance.now(), dur = 1600;
      (function tick(now) {
        var p = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * e).toFixed(dec);
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    }, { threshold: 0.6 });
    co.observe(el);
  });

  /* Hero parallax (desktop pointer only) */
  var art = $('#heroArt');
  if (art && !reduce && window.matchMedia('(hover: hover) and (min-width: 901px)').matches) {
    var hero = $('.hero');
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      $('.arch', art).style.transform = 'translate(' + (x * -14) + 'px,' + (y * -14) + 'px)';
      $('.arch-outline', art).style.transform = 'translate(' + (x * 12) + 'px,' + (y * 12) + 'px)';
    });
  }

  /* Theme showcase */
  var showcase = $('#showcase');
  if (showcase) {
    var tabs = $$('.theme-btn', showcase), slides = $$('.slide', showcase), section = $('#themes');
    var idx = 0, DUR = 5500, timer = null, playing = !reduce;
    document.documentElement.style.setProperty('--dur', DUR + 'ms');
    section.style.setProperty('--dur', DUR + 'ms');

    function show(i, user) {
      idx = (i + slides.length) % slides.length;
      tabs.forEach(function (t, n) { t.setAttribute('aria-selected', String(n === idx)); t.tabIndex = n === idx ? 0 : -1; });
      slides.forEach(function (s, n) { s.classList.toggle('on', n === idx); });
      if (user) restart();
    }
    function restart() {
      clearTimeout(timer);
      // restart the CSS progress animation
      var active = tabs[idx]; active.style.animation = 'none'; void active.offsetWidth; active.style.animation = '';
      if (playing) timer = setTimeout(function () { show(idx + 1); restart(); }, DUR);
    }
    function setPlaying(p) {
      playing = p;
      section.classList.toggle('paused', !p);
      var t = $('#toggle');
      t.setAttribute('aria-label', p ? 'Pause slideshow' : 'Play slideshow');
      t.firstElementChild.firstElementChild.setAttribute('href', p ? '#i-pause' : '#i-play');
      restart();
    }
    tabs.forEach(function (t, n) {
      t.addEventListener('click', function () { show(n, true); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1, true); tabs[idx].focus(); }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1, true); tabs[idx].focus(); }
      });
    });
    $('#next').addEventListener('click', function () { show(idx + 1, true); });
    $('#prev').addEventListener('click', function () { show(idx - 1, true); });
    $('#toggle').addEventListener('click', function () { setPlaying(!playing); });

    // Only run while visible
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { if (playing) restart(); } else { clearTimeout(timer); }
      }, { threshold: 0.25 }).observe(showcase);
    }
    if (reduce) section.classList.add('paused');
    show(0);

    // Swipe on touch
    var sx = null, stage = $('#stage');
    stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1), true);
      sx = null;
    });
  }

  /* Booking form → WhatsApp */
  var form = $('#bookForm');
  if (form) {
    var dateEl = $('#f-date');
    var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    dateEl.min = today.toISOString().slice(0, 10);

    function setErr(input, bad) {
      var f = input.closest('.field');
      f.classList.toggle('err', bad);
      f.querySelector('.msg').hidden = !bad;
      input.setAttribute('aria-invalid', String(bad));
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim(), phone = form.phone.value.replace(/[^\d+]/g, '');
      var okName = name.length > 1, okPhone = phone.replace(/\D/g, '').length >= 10;
      setErr(form.name, !okName); setErr(form.phone, !okPhone);
      if (!okName) { form.name.focus(); return; }
      if (!okPhone) { form.phone.focus(); return; }

      var d = form.date.value ? new Date(form.date.value + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Flexible';
      var lines = [
        'Hi Hyderabad Kids Studio! I would like to book a kids photoshoot.',
        '',
        'Name: ' + name,
        'Phone: ' + form.phone.value.trim(),
        "Child's age: " + form.age.value,
        'Preferred date: ' + d,
        'Theme: ' + form.theme.value
      ];
      if (form.msg.value.trim()) lines.push('Note: ' + form.msg.value.trim());
      window.burstConfetti();
      window.open('https://wa.me/917995433705?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
    ['name', 'phone'].forEach(function (n) {
      form[n].addEventListener('input', function () { if (form[n].closest('.field').classList.contains('err')) setErr(form[n], false); });
    });
  }
  /* Scroll progress bar */
  var bar = $('#progress');
  function prog() {
    var max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
  }
  window.addEventListener('scroll', prog, { passive: true }); prog();

  /* Floating balloons in the hero */
  var bl = $('#balloons');
  if (bl && !reduce) {
    var cols = ['#f4b9c0', '#cfe2ea', '#e8d3ab', '#d9c6ee', '#bfdcc8'];
    for (var b = 0; b < 8; b++) {
      var el = document.createElement('span');
      el.className = 'balloon';
      el.style.cssText = 'left:' + (6 + b * 12 + Math.random() * 6) + '%;--s:' + (34 + Math.random() * 30) + 'px;--c:' + cols[b % cols.length] +
        ';--t:' + (16 + Math.random() * 12) + 's;--dl:' + (-Math.random() * 20) + 's;--x:' + (Math.random() * 60 - 30) + 'px';
      bl.appendChild(el);
    }
  }

  /* Lightbox */
  var lb = $('#lb'), items = $$('.bt'), cur = 0, lastFocus = null;
  function lbShow(i) {
    cur = (i + items.length) % items.length;
    var it = items[cur];
    $('#lbImg').src = it.dataset.lb;
    $('#lbImg').alt = it.querySelector('img').alt;
    $('#lbCap').textContent = it.dataset.cap;
  }
  function lbOpen(i) { lastFocus = document.activeElement; lbShow(i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbX').focus(); }
  function lbClose() { lb.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  items.forEach(function (it, i) { it.addEventListener('click', function () { lbOpen(i); }); });
  $('#lbX').addEventListener('click', lbClose);
  $('#lbPrev').addEventListener('click', function () { lbShow(cur - 1); });
  $('#lbNext').addEventListener('click', function () { lbShow(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });

  /* Instagram video modal (loaded only on click) */
  var vm = $('#vm'), frame = $('#vmFrame'), vmLast = null;
  function vmClose() { vm.hidden = true; frame.src = 'about:blank'; document.body.style.overflow = ''; if (vmLast) vmLast.focus(); }
  $$('.reel').forEach(function (r) {
    r.addEventListener('click', function () { vmLast = r; frame.src = r.dataset.embed; vm.hidden = false; document.body.style.overflow = 'hidden'; $('#vmX').focus(); });
  });
  $('#vmX').addEventListener('click', vmClose);
  vm.addEventListener('click', function (e) { if (e.target === vm) vmClose(); });

  document.addEventListener('keydown', function (e) {
    if (!lb.hidden) {
      if (e.key === 'Escape') lbClose();
      if (e.key === 'ArrowRight') lbShow(cur + 1);
      if (e.key === 'ArrowLeft') lbShow(cur - 1);
    }
    if (!vm.hidden && e.key === 'Escape') vmClose();
  });

  /* Confetti burst */
  var cv = $('#confetti'), ctx = cv.getContext('2d');
  window.burstConfetti = function () {
    if (reduce) return;
    cv.width = innerWidth; cv.height = innerHeight;
    var colors = ['#d98c93', '#c49a5a', '#cfe2ea', '#f4d9d1', '#a5525c', '#e8d3ab'];
    var parts = [];
    for (var n = 0; n < 140; n++) {
      parts.push({ x: innerWidth / 2, y: innerHeight * 0.65, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 16 - 6, s: 6 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: colors[n % colors.length], life: 0 });
    }
    (function frameLoop() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      var alive = 0;
      parts.forEach(function (p) {
        p.life++; p.vy += 0.38; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        if (p.y < cv.height + 20 && p.life < 160) {
          alive++; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
          ctx.globalAlpha = Math.max(0, 1 - p.life / 160); ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
        }
      });
      if (alive) requestAnimationFrame(frameLoop); else ctx.clearRect(0, 0, cv.width, cv.height);
    })();
  };
})();
