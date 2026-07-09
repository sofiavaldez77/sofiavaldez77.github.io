(function () {
  var STORAGE_KEY = 'sv_portfolio_unlocked';
  var CORRECT_HASH = '8b67104301347e2f3f3f07ee7de0a39dce468ce789f94d2ae119171f62002aba';

  if (localStorage.getItem(STORAGE_KEY) === '1') {
    return; // already unlocked on this device
  }

  // Hide the page content immediately. This script tag lives in <head> and
  // blocks parsing, so this style is in place before the browser ever
  // renders anything in <body> — no flash of unprotected content.
  var hideStyle = document.createElement('style');
  hideStyle.id = 'sv-gate-hide-style';
  hideStyle.textContent = 'body > *:not(#sv-gate-overlay){display:none !important;}';
  document.head.appendChild(hideStyle);

  function unlock() {
    localStorage.setItem(STORAGE_KEY, '1');
    var hs = document.getElementById('sv-gate-hide-style');
    if (hs) hs.remove();
    var overlay = document.getElementById('sv-gate-overlay');
    if (overlay) overlay.remove();
  }

  function sha256Hex(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    });
  }

  function buildOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'sv-gate-overlay';
    overlay.innerHTML =
      '<div class="sv-gate-box">' +
        '<p class="sv-gate-title">This site is password protected</p>' +
        '<form id="sv-gate-form" autocomplete="off">' +
          '<input type="password" id="sv-gate-input" placeholder="Enter password" autocomplete="off">' +
          '<button type="submit">Enter</button>' +
        '</form>' +
        '<p id="sv-gate-error" class="sv-gate-error"></p>' +
      '</div>';

    var style = document.createElement('style');
    style.textContent =
      '#sv-gate-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#faf9f7;z-index:9999;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;}' +
      '.sv-gate-box{text-align:center;max-width:320px;padding:32px;}' +
      '.sv-gate-title{font-size:1rem;color:#1a1a1e;margin-bottom:20px;}' +
      '#sv-gate-form{display:flex;gap:8px;}' +
      '#sv-gate-input{flex:1;padding:10px 12px;border:1px solid #ccc;border-radius:6px;font-size:0.95rem;font-family:inherit;}' +
      '#sv-gate-form button{padding:10px 16px;border:none;border-radius:6px;background:#1a1a1e;color:#fff;cursor:pointer;font-size:0.95rem;font-family:inherit;}' +
      '#sv-gate-form button:hover{background:#333;}' +
      '.sv-gate-error{color:#b3261e;font-size:0.85rem;margin-top:12px;min-height:1em;}';
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    var input = document.getElementById('sv-gate-input');
    input.focus();

    document.getElementById('sv-gate-form').addEventListener('submit', function (e) {
      e.preventDefault();
      sha256Hex(input.value).then(function (hash) {
        if (hash === CORRECT_HASH) {
          unlock();
        } else {
          document.getElementById('sv-gate-error').textContent = 'Incorrect password.';
          input.value = '';
          input.focus();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildOverlay);
  } else {
    buildOverlay();
  }
})();
