(function () {
  'use strict';

  var catalog = window.BESTENOUF_CATALOG || {};
  var secureStorefront = window.location.protocol === 'https:' && /^(www\.)?bestenouf\.com$/i.test(window.location.hostname);
  var checkoutEnabled = secureStorefront && !!(window.BESTENOUF_STORE && window.BESTENOUF_STORE.checkoutEnabled);
  var paypalEnabled = secureStorefront && !!(window.BESTENOUF_STORE && window.BESTENOUF_STORE.paypalEnabled);
  var assetRoot = document.body.dataset.assetRoot || '';

  var storageKey = 'bestenoufBookCartV1';
  var cart = loadCart();
  var drawer = document.getElementById('bookCart');
  var overlay = document.getElementById('bookCartOverlay');
  var itemsEl = document.getElementById('bookCartItems');
  var emptyEl = document.getElementById('bookCartEmpty');
  var totalEl = document.getElementById('bookCartTotal');
  var countEls = document.querySelectorAll('[data-cart-count]');
  var checkoutBtn = document.getElementById('bookCartCheckout');
  var paypalBtn = null;
  var closeBtn = document.getElementById('bookCartClose');
  var openBtns = document.querySelectorAll('[data-cart-open]');
  var statusEl = document.getElementById('bookCartStatus');
  var cartReturnFocus = null;
  var originalEightIds = ['hired', 'tax-clarity', 'the-debt-free-paycheck', 'first-1000-online', 'calm-under-pressure', 'focus-that-finishes', 'the-steady-body', 'the-discipline-code'];

  if (checkoutBtn) {
    checkoutBtn.textContent = checkoutEnabled ? 'Pay securely by card' : 'Secure checkout activates with HTTPS';
    if (paypalEnabled) {
      paypalBtn = document.createElement('button');
      paypalBtn.type = 'button';
      paypalBtn.id = 'bookCartPayPal';
      paypalBtn.className = 'btn book-cart__checkout book-cart__paypal';
      paypalBtn.textContent = 'Pay securely with PayPal';
      checkoutBtn.insertAdjacentElement('afterend', paypalBtn);
    }
  }

  if (drawer) {
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('inert', '');
  }

  function loadCart() {
    try {
      var parsed = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (id) { return !!catalog[id]; }).filter(function (id, i, arr) { return arr.indexOf(id) === i; });
    } catch (_) {
      return [];
    }
  }

  function saveCart() {
    try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch (_) {}
  }

  function money(cents) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  }

  function updateBookButtons() {
    document.querySelectorAll('.book-buy').forEach(function (btn) {
      var id = btn.dataset.book;
      var added = cart.indexOf(id) !== -1;
      btn.classList.toggle('is-added', added);
      btn.setAttribute('aria-pressed', String(added));
      btn.textContent = added ? 'Added to Cart ✓' : 'Add to Cart';
    });
  }

  function render() {
    saveCart();
    countEls.forEach(function (el) { el.textContent = String(cart.length); });
    updateBookButtons();
    if (!itemsEl) return;

    itemsEl.innerHTML = '';
    emptyEl.hidden = cart.length !== 0;
    checkoutBtn.disabled = !checkoutEnabled || cart.length === 0;
    checkoutBtn.setAttribute('aria-disabled', String(!checkoutEnabled || cart.length === 0));
    if (paypalBtn) {
      paypalBtn.disabled = !paypalEnabled || cart.length === 0;
      paypalBtn.setAttribute('aria-disabled', String(!paypalEnabled || cart.length === 0));
    }

    var total = 0;
    cart.forEach(function (id) {
      var book = catalog[id];
      total += book.price;
      var row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = '<img src="' + assetRoot + book.image + '" alt="" class="cart-item__img">' +
        '<div class="cart-item__body"><strong class="cart-item__title">' + escapeHtml(book.name) + '</strong>' +
        '<span class="cart-item__price">' + money(book.price) + '</span></div>' +
        '<button type="button" class="cart-item__remove" data-remove-book="' + id + '" aria-label="Remove ' + escapeHtml(book.name) + ' from cart">Remove</button>';
      itemsEl.appendChild(row);
    });
    totalEl.textContent = money(total);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char];
    });
  }

  function openCart() {
    if (!drawer || !overlay) return;
    cartReturnFocus = document.activeElement;
    drawer.removeAttribute('inert');
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-open');
    if (closeBtn) closeBtn.focus();
  }

  function closeCart() {
    if (!drawer || !overlay) return;
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('inert', '');
    document.body.classList.remove('cart-open');
    if (cartReturnFocus && document.contains(cartReturnFocus)) cartReturnFocus.focus();
  }

  function trapCartFocus(event) {
    if (event.key !== 'Tab' || !drawer || !drawer.classList.contains('is-open')) return;
    var focusable = Array.prototype.slice.call(drawer.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'));
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  document.querySelectorAll('.book-buy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = this.dataset.book;
      if (!catalog[id]) return;
      if (id === 'original-eight-bundle') {
        cart = cart.filter(function (bookId) { return originalEightIds.indexOf(bookId) === -1; });
      } else if (originalEightIds.indexOf(id) !== -1) {
        cart = cart.filter(function (bookId) { return bookId !== 'original-eight-bundle'; });
      }
      if (cart.indexOf(id) === -1) cart.push(id);
      render();
      openCart();
    });
  });

  if (itemsEl) {
    itemsEl.addEventListener('click', function (event) {
      var button = event.target.closest('[data-remove-book]');
      if (!button) return;
      var id = button.dataset.removeBook;
      cart = cart.filter(function (bookId) { return bookId !== id; });
      render();
    });
  }

  openBtns.forEach(function (button) { button.addEventListener('click', openCart); });
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && drawer && drawer.classList.contains('is-open')) closeCart(); trapCartFocus(event); });

  async function beginCheckout(button, endpoint, enabled) {
      if (!enabled || !cart.length || button.disabled) return;
      var apiBase = (window.BESTENOUF_STORE && window.BESTENOUF_STORE.apiBase || '').replace(/\/$/, '');
      if (!apiBase) {
        setStatus('Checkout API is not configured.', true);
        return;
      }

      var original = button.textContent;
      checkoutBtn.disabled = true;
      if (paypalBtn) paypalBtn.disabled = true;
      button.textContent = 'Opening secure checkout…';
      setStatus('', false);

      try {
        var response = await fetch(apiBase + endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart.map(function (id) { return { id: id, quantity: 1 }; }) })
        });
        var data = await response.json().catch(function () { return {}; });
        if (!response.ok || !data.url) throw new Error(data.error || 'Unable to start checkout');
        window.location.assign(data.url);
      } catch (error) {
        checkoutBtn.disabled = !checkoutEnabled || !cart.length;
        if (paypalBtn) paypalBtn.disabled = !paypalEnabled || !cart.length;
        button.textContent = original;
        setStatus(error.message || 'Unable to start checkout. Please try again.', true);
      }
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () { beginCheckout(checkoutBtn, '/checkout', checkoutEnabled); });
  }
  if (paypalBtn) paypalBtn.addEventListener('click', function () { beginCheckout(paypalBtn, '/paypal/create-order', paypalEnabled); });

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle('is-error', !!isError);
  }

  render();
})();
