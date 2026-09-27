// Progressive enhancements. The menu and native navigation also work without JavaScript.
(() => {
  'use strict';
  const nav = document.querySelector('.mobile-menu');
  if (nav) {
    nav.addEventListener('click', event => { if (event.target.closest('a')) nav.open = false; });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.open) { nav.open = false; nav.querySelector('summary').focus(); }
    });
    document.addEventListener('click', event => { if (!nav.contains(event.target)) nav.open = false; });
    matchMedia('(min-width: 1024px)').addEventListener('change', () => { nav.open = false; });
  }
  const header = document.querySelector('.site-header');
  if (header && 'ResizeObserver' in window) {
    new ResizeObserver(() => {
      document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
    }).observe(header);
  }
  const filters = document.querySelector('[data-menu-filters]');
  if (filters) {
    const select = category => {
      document.querySelectorAll('[data-menu-category]').forEach(card => { card.hidden = card.dataset.menuCategory !== category; });
      filters.querySelectorAll('button').forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.menuFilter === category)); });
    };
    filters.hidden = false;
    select('subs');
    filters.addEventListener('click', event => {
      const button = event.target.closest('[data-menu-filter]');
      if (button) select(button.dataset.menuFilter);
    });
  }

  const reviewList = document.getElementById('reviews-list');
  if (reviewList) {
    const endpoint = '/api/google-reviews';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    fetch(endpoint, { cache: 'no-store', credentials: 'omit', signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (!data?.available || !Number.isFinite(data.rating) || !Number.isSafeInteger(data.count) || !Array.isArray(data.reviews)) return;
        document.querySelectorAll('[data-google-rating]').forEach(node => { node.textContent = data.rating.toFixed(1); });
        document.querySelectorAll('[data-google-count]').forEach(node => { node.textContent = data.count.toLocaleString(); });
        document.querySelectorAll('[data-google-maps-link]').forEach(node => { node.href = data.mapsUrl; });
        document.querySelector('[data-reviews-hero-fallback]').hidden = true;
        document.querySelector('[data-reviews-hero-live]').hidden = false;
        document.getElementById('reviews-summary').hidden = false;
        document.getElementById('reviews-status').textContent = 'Reviews supplied by Google Maps, ordered by relevance. Select a review to see its original text and details on Google.';
        const template = document.getElementById('review-template');
        for (const review of data.reviews) {
          const card = template.content.cloneNode(true);
          const author = card.querySelector('[data-review-author]');
          author.textContent = review.author;
          author.href = review.authorUrl || review.url;
          const avatar = card.querySelector('[data-review-avatar]');
          if (review.avatar) { avatar.src = review.avatar; avatar.alt = `${review.author}'s profile photo`; avatar.hidden = false; }
          card.querySelector('[data-review-rating]').textContent = String(review.rating);
          card.querySelector('[data-review-date]').textContent = review.date;
          card.querySelector('[data-review-text]').textContent = review.text || 'This customer left a star rating without a written review.';
          card.querySelector('[data-review-source]').href = review.url;
          reviewList.append(card);
        }
        reviewList.hidden = data.reviews.length === 0;
        const credits = document.getElementById('reviews-attributions');
        for (const attribution of data.attributions || []) {
          const credit = document.createElement(attribution.url ? 'a' : 'span');
          credit.textContent = attribution.name;
          if (attribution.url) credit.href = attribution.url;
          credit.className = 'mr-4 underline';
          credits.append(credit);
        }
      }).catch(() => { /* Keep the direct Google link if the feed is unavailable. */ })
      .finally(() => clearTimeout(timeout));
  }

  // Only fixed event names and page categories leave the browser. No form values,
  // query strings, user identifiers, cookies, or storage are used for event tracking.
  const lastEvent = new Map();
  function track(action) {
    if (navigator.globalPrivacyControl || navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
    const now = Date.now();
    if (now - (lastEvent.get(action) || 0) < 1000) return;
    lastEvent.set(action, now);
    const path = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    const page = ['/', '/menu', '/careers'].includes(path) ? path : '/404';
    fetch('/events', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, page }), keepalive: true, credentials: 'omit',
    }).catch(() => {});
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    if (link.protocol === 'tel:') track('call_click');
    else if (link.hostname === 'direct.chownow.com') track('order_click');
    else if (link.hostname === 'www.google.com' && link.pathname.startsWith('/maps') && link.closest('#visit')) track('directions_click');
    else if (link.hash === '#contact') track('catering_click');
  });

  const catering = document.getElementById('catering-form');
  if (catering) {
    const button = catering.querySelector('button[type="submit"]');
    const success = document.getElementById('catering-success');
    const error = document.getElementById('catering-error');
    const email = catering.elements.namedItem('email');
    const phone = catering.elements.namedItem('phone');
    let sending = false;
    let sent = false;
    function validateContact() {
      email.setCustomValidity(''); phone.setCustomValidity('');
      const digits = phone.value.replace(/\D/g, '');
      const hasPhone = phone.value.trim().length > 0;
      email.required = !hasPhone;
      if (hasPhone && (digits.length < 7 || digits.length > 15)) phone.setCustomValidity('Please enter a phone number with 7 to 15 digits.');
    }
    email.addEventListener('input', validateContact);
    phone.addEventListener('input', validateContact);
    validateContact();
    catering.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending || sent) return;
      validateContact();
      if (!catering.reportValidity()) return;
      sending = true; error.hidden = true; button.disabled = true; button.textContent = 'Sending…';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const body = new FormData(catering);
        if (email.value.trim()) body.set('_replyto', email.value.trim());
        const endpoint = catering.action.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');
        const response = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body, signal: controller.signal });
        if (!response.ok) throw new Error('Request failed');
        const result = await response.json();
        if (result.success !== true && result.success !== 'true') throw new Error('Request rejected');
        sent = true; catering.reset(); validateContact(); button.textContent = 'Request Sent ✓';
        success.hidden = false;
        success.focus({ preventScroll: true });
        success.scrollIntoView({ block: 'center', behavior: 'instant' });
        track('catering_success');
      } catch {
        error.textContent = 'Sorry — something went wrong sending your request. Your details are still here. Please try again or call (912) 295-5184.';
        error.hidden = false; button.textContent = 'Send Request'; button.disabled = false;
      } finally { clearTimeout(timeout); sending = false; }
    });
    catering.querySelector('[data-new-request]').addEventListener('click', () => {
      sent = false; success.hidden = true; button.disabled = false; button.textContent = 'Send Request';
      catering.elements.namedItem('name').focus();
    });
  }

  const application = document.getElementById('careers-form');
  if (application) {
    application.elements.namedItem('_next').value = new URL('/careers?sent=1#application-success', location.origin).href;
    application.addEventListener('submit', () => {
      let reply = application.elements.namedItem('_replyto');
      if (!reply) { reply = document.createElement('input'); reply.type = 'hidden'; reply.name = '_replyto'; application.append(reply); }
      reply.value = application.elements.namedItem('email').value.trim();
      track('application_submit');
    });
    if (new URLSearchParams(location.search).get('sent') === '1') {
      application.hidden = true;
      const success = document.getElementById('application-success');
      success.hidden = false;
      history.replaceState(null, '', '/careers#application-success');
      // The provider return is not independent proof of inbox delivery.
      track('application_return');
      requestAnimationFrame(() => {
        success.focus({ preventScroll: true });
        success.scrollIntoView({ block: 'center', behavior: 'instant' });
      });
    }
  }
})();
