(function () {
  'use strict';
  var statusEl = document.getElementById('orderStatus');
  var downloadsEl = document.getElementById('orderDownloads');
  var summaryEl = document.getElementById('orderSummary');
  var apiBase = (window.BESTENOUF_STORE && window.BESTENOUF_STORE.apiBase || '').replace(/\/$/, '');
  var sessionId = new URLSearchParams(window.location.search).get('session_id');
  var provider = new URLSearchParams(window.location.search).get('provider') || 'stripe';
  var paypalOrderId = new URLSearchParams(window.location.search).get('token');
  var attempts = 0;
  var maxAttempts = 12;

  function money(cents) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents || 0) / 100);
  }

  async function loadOrder() {
    if (provider === 'paypal') {
      if (!paypalOrderId || !/^[A-Z0-9]{10,32}$/.test(paypalOrderId)) {
        showError('We could not identify this PayPal order. If you completed payment, contact bestenouf@consultant.com.');
        return;
      }
      return capturePayPalOrder();
    }
    if (!sessionId || !sessionId.startsWith('cs_')) {
      showError('We could not identify this checkout session. If you completed payment, contact bestenouf@consultant.com.');
      return;
    }
    if (!apiBase) {
      showError('The order service is not configured yet.');
      return;
    }

    attempts += 1;
    try {
      var response = await fetch(apiBase + '/order?session_id=' + encodeURIComponent(sessionId), { cache: 'no-store' });
      var data = await response.json().catch(function () { return {}; });
      if (response.ok && data.status === 'completed') {
        renderOrder(data);
        return;
      }

      if (attempts < maxAttempts) {
        statusEl.textContent = 'Payment received. Confirming your order…';
        window.setTimeout(loadOrder, 2000);
        return;
      }
      showError('Your payment may still be processing. Refresh this page in a moment, or contact bestenouf@consultant.com if the downloads do not appear.');
    } catch (_) {
      if (attempts < maxAttempts) {
        window.setTimeout(loadOrder, 2000);
      } else {
        showError('We could not load your order. Please refresh or contact bestenouf@consultant.com.');
      }
    }
  }

  async function capturePayPalOrder() {
    if (!apiBase) return showError('The order service is not configured yet.');
    try {
      var response = await fetch(apiBase + '/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID: paypalOrderId })
      });
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok || data.status !== 'completed') throw new Error(data.error || 'Payment is not complete.');
      renderOrder(data);
    } catch (error) {
      showError(error.message || 'We could not confirm your PayPal payment. Please contact bestenouf@consultant.com.');
    }
  }

  function renderOrder(data) {
    localStorage.removeItem('bestenoufBookCartV1');
    statusEl.textContent = 'Payment confirmed. Your downloads are ready.';
    statusEl.classList.add('is-confirmed');
    summaryEl.textContent = 'Order total: ' + money(data.amountTotal) + (data.email ? ' · Receipt: ' + data.email : '');
    downloadsEl.innerHTML = '';
    data.items.forEach(function (item) {
      var link = document.createElement('a');
      link.className = 'download-card';
      link.href = item.downloadUrl;
      link.rel = 'nofollow';
      link.innerHTML = '<span>' + escapeHtml(item.name) + '</span><strong>Download PDF</strong>';
      downloadsEl.appendChild(link);
    });
  }

  function showError(message) {
    statusEl.textContent = message;
    statusEl.classList.add('is-error');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char];
    });
  }

  loadOrder();
})();
