(function () {
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
    fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        // only a confirmed success counts; anything else is a failure
        if (!res.ok || !res.j || res.j.success !== true) throw new Error('not delivered');
        form.reset();
        say('Thanks, we have your details and will be in touch soon.', true);
        if (window.fbq) window.fbq('track', 'Lead');
        if (window.gtag) { window.gtag('event', 'generate_lead'); if (window.BG_LEAD_SEND_TO) window.gtag('event', 'conversion', { send_to: window.BG_LEAD_SEND_TO }); }
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
