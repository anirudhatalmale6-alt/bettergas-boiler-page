(function () {
  // 26 Nov: client gets calls/enquiries but can't tell which ad they came from. Remember how the
  // visitor FIRST arrived (ad click ids / utm / referrer) for this browser tab, and send it with the
  // enquiry as "came_from" so it shows in the Tradify enquiry text.
  var cameFrom = (function () {
    var KEY = 'bg_came_from';
    try { var saved = sessionStorage.getItem(KEY); if (saved) return saved; } catch (e) {}
    var q = new URLSearchParams(location.search), src = (q.get('utm_source') || '').toLowerCase();
    var med = (q.get('utm_medium') || '').toLowerCase(), ref = document.referrer || '', host = '';
    try { host = ref ? new URL(ref).hostname : ''; } catch (e) {}
    var v;
    if (q.get('gclid') || q.get('gbraid') || q.get('wbraid') || (src === 'google' && med === 'cpc')) v = 'Google Ad';
    else if (q.get('ttclid') || src === 'tiktok') v = 'TikTok ad';
    else if (q.get('fbclid') || src === 'facebook' || src === 'instagram') v = 'Facebook / Instagram';
    else if (src === 'google' && med === 'business_profile') v = 'Google Business Profile (Book button)';
    else if (src) v = src + (med ? ' / ' + med : '');
    else if (/(^|\.)google\./.test(host)) v = 'Google search (free listing)';
    else if (host && host !== location.hostname) v = 'Link on ' + host;
    else v = 'Direct (typed link, WhatsApp, text, flyer or email)';
    try { sessionStorage.setItem(KEY, v); } catch (e) {}
    return v;
  })();

  // big review box: rotate, arrows, dots; pause on hover/focus/touch
  var box = document.querySelector('.rv-box');
  if (box) {
    var slides = box.querySelectorAll('.rv-slide'), dots = box.querySelectorAll('.rv-dot');
    var cur = 0, timer = null, paused = false;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var show = function (n) {
      cur = (n + slides.length) % slides.length;
      slides.forEach(function (sl, i) { sl.hidden = i !== cur; });
      dots.forEach(function (d, i) { d.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
    };
    var start = function () {
      if (reduce) return;
      clearInterval(timer);
      timer = setInterval(function () { if (!paused && !document.hidden) show(cur + 1); }, 6000);
    };
    box.querySelectorAll('.rv-arrow').forEach(function (b) {
      b.addEventListener('click', function () { show(cur + Number(b.getAttribute('data-dir'))); start(); });
    });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); start(); }); });
    ['mouseenter', 'focusin', 'touchstart'].forEach(function (ev) { box.addEventListener(ev, function () { paused = true; }, { passive: true }); });
    ['mouseleave', 'focusout'].forEach(function (ev) { box.addEventListener(ev, function () { paused = false; }); });
    // phones have no mouseleave: resume a few seconds after the finger lifts
    box.addEventListener('touchend', function () { setTimeout(function () { paused = false; }, 5000); }, { passive: true });
    show(0); start();
  }

  // install photos: a smooth, continuous roll to the right (15 Nov: "make the
  // images smooth roll, not flicking"). The photos are repeated once so the
  // strip can loop forever without a jump back to the start. Touch, hover,
  // wheel or the arrows pause it so people can look; it carries on after.
  var gal = document.querySelector('.gallery');
  if (gal) {
    var btns = document.querySelectorAll('.gal-btn');
    var originals = Array.prototype.slice.call(gal.children);
    var reduceG = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var step = function () { var li = gal.querySelector('li'); return li ? li.getBoundingClientRect().width + 16 : 300; };
    if (!reduceG && originals.length) {
      originals.forEach(function (li) {
        var c = li.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        c.querySelectorAll('img').forEach(function (im) { im.alt = ''; im.loading = 'eager'; });
        gal.appendChild(c);
      });
      gal.style.scrollSnapType = 'none';
      gal.style.scrollBehavior = 'auto';
      var loopW = function () { return gal.children[originals.length].offsetLeft - gal.children[0].offsetLeft; };
      var pos = 0, last = 0, hold = 0, SPEED = 32;            // pixels per second
      var holdOn = function () { hold = performance.now() + 5000; };
      ['mouseenter', 'touchstart', 'focusin', 'wheel'].forEach(function (ev) { gal.addEventListener(ev, holdOn, { passive: true }); });
      gal.addEventListener('mouseleave', function () { hold = performance.now() + 800; });
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          holdOn();
          gal.scrollBy({ left: step() * Number(b.getAttribute('data-dir')), behavior: 'smooth' });
        });
      });
      var tick = function (t) {
        var dt = last ? Math.min(t - last, 64) : 0; last = t;
        var r = gal.getBoundingClientRect();
        var onScreen = r.bottom > 0 && r.top < window.innerHeight;
        if (t < hold || document.hidden || !onScreen) {
          pos = gal.scrollLeft;                                  // follow any manual swipe
        } else {
          pos += SPEED * dt / 1000;
          var w = loopW();
          if (w > 0 && pos >= w) pos -= w;                       // seamless wrap
          gal.scrollLeft = pos;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } else {
      // reduced motion: plain swipe strip, arrows step one photo
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          gal.scrollBy({ left: step() * Number(b.getAttribute('data-dir')), behavior: 'smooth' });
        });
      });
    }
  }

  // big review box: rotate, arrows, dots; pause on hover/focus/touch
  var box = document.querySelector('.rv-box');
  if (box) {
    var slides = box.querySelectorAll('.rv-slide'), dots = box.querySelectorAll('.rv-dot');
    var cur = 0, timer = null, paused = false;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var show = function (n) {
      cur = (n + slides.length) % slides.length;
      slides.forEach(function (sl, i) { sl.hidden = i !== cur; });
      dots.forEach(function (d, i) { d.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
    };
    var start = function () {
      if (reduce) return;
      clearInterval(timer);
      timer = setInterval(function () { if (!paused && !document.hidden) show(cur + 1); }, 6000);
    };
    box.querySelectorAll('.rv-arrow').forEach(function (b) {
      b.addEventListener('click', function () { show(cur + Number(b.getAttribute('data-dir'))); start(); });
    });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); start(); }); });
    ['mouseenter', 'focusin', 'touchstart'].forEach(function (ev) { box.addEventListener(ev, function () { paused = true; }, { passive: true }); });
    ['mouseleave', 'focusout'].forEach(function (ev) { box.addEventListener(ev, function () { paused = false; }); });
    // phones have no mouseleave: resume a few seconds after the finger lifts
    box.addEventListener('touchend', function () { setTimeout(function () { paused = false; }, 5000); }, { passive: true });
    show(0); start();
  }

  // install photos: arrows scroll one photo at a time, and switch off at the ends
  var gal = document.querySelector('.gallery');
  if (gal) {
    var btns = document.querySelectorAll('.gal-btn');
    var step = function () { var li = gal.querySelector('li'); return li ? li.getBoundingClientRect().width + 16 : 300; };
    var sync = function () {
      var max = gal.scrollWidth - gal.clientWidth - 2;
      btns.forEach(function (b) {
        b.disabled = b.getAttribute('data-dir') === '-1' ? gal.scrollLeft <= 2 : gal.scrollLeft >= max;
      });
    };
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        gal.scrollBy({ left: step() * Number(b.getAttribute('data-dir')), behavior: 'smooth' });
      });
    });
    gal.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
    // 15 Nov: "put on auto cycle scroll" - move one photo to the right every
    // 3.5 s, go back to the start at the end, and stop while someone is
    // touching / hovering / using the arrows (resume a few seconds later).
    var reduceG = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hold = 0;
    var holdOn = function () { hold = Date.now() + 6000; };
    ['mouseenter', 'touchstart', 'focusin', 'wheel'].forEach(function (ev) { gal.addEventListener(ev, holdOn, { passive: true }); });
    btns.forEach(function (b) { b.addEventListener('click', holdOn); });
    if (!reduceG) setInterval(function () {
      if (Date.now() < hold || document.hidden) return;
      var r = gal.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;   // only when on screen
      var max = gal.scrollWidth - gal.clientWidth - 2;
      if (gal.scrollLeft >= max) gal.scrollTo({ left: 0, behavior: 'smooth' });
      else gal.scrollBy({ left: step(), behavior: 'smooth' });
    }, 3500);
  }

  // WhatsApp taps are counted as "Contact", never as a lead
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.fbq) window.fbq('track', 'Contact');
      if (window.gtag) window.gtag('event', 'contact', { method: 'whatsapp' });
      if (window.ttq) window.ttq.track('Contact');
    });
  });

  // card buttons pre-select the matching job type in the form
  document.querySelectorAll('[data-job]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = document.querySelector('input[name=job][value="' + a.getAttribute('data-job') + '"]');
      if (r) r.checked = true;
    });
  });

  var form = document.getElementById('qf');
  if (!form) return;
  var msg = document.getElementById('msg');
  function say(text, ok) {
    msg.textContent = text;
    msg.className = 'msg show ' + (ok ? 'ok' : 'err');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var missing = [];
    if (!form.querySelector('input[name=job]:checked')) missing.push('what you need');
    ['name', 'phone', 'postcode'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el.value.trim()) missing.push(el.previousElementSibling.textContent.replace(' *', '').toLowerCase());
    });
    if (missing.length) {
      say('Please add ' + missing.join(', ') + '.', false);
      return;
    }
    // no inbox connected yet: say so, never pretend it went
    var endpoint = form.getAttribute('data-endpoint');
    if (!endpoint) {
      say('Preview only: this form is not connected yet, so nothing was sent. Please call 0800 059 9951.', false);
      return;
    }
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    var data = new FormData(form);
    // 23 Nov: Tradify names each enquiry after the sender, so send the customer's name
    // (it showed every enquiry as "Better Gas website").
    var who = (data.get('name') || '').toString().trim();
    if (who) data.set('from_name', who + ' (website)');
    data.set('came_from', cameFrom);
    fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: data })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        // only a confirmed success counts; anything else is a failure
        if (!res.ok || !res.j || res.j.success !== true) throw new Error('not delivered');
        var tk = form.getAttribute('data-copy-key');
        if (tk) {
          data.set('access_key', tk);
          fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: data }).catch(function () {});
        }
        form.reset();
        say('Thanks, we have your details and will be in touch soon.', true);
        if (window.fbq) window.fbq('track', 'Lead');
        if (window.ttq) window.ttq.track('SubmitForm');
        if (window.gtag) { window.gtag('event', 'generate_lead'); if (window.BG_LEAD_SEND_TO) window.gtag('event', 'conversion', { send_to: window.BG_LEAD_SEND_TO, value: 1.0, currency: 'GBP' }); }
      })
      .catch(function () {
        say('Sorry, that did not go through. Please call us free on 0800 059 9951.', false);
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = 'Send my enquiry';
      });
  });
})();
