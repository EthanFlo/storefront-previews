/* Happy Place Gift Boutique. Small, dependency-free interactions.
   Everything degrades gracefully and respects reduced motion. */
(function () {
  "use strict";

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- current year in footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* ---- sticky header state on scroll ---- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 24) { nav.classList.add("scrolled"); }
    else { nav.classList.remove("scrolled"); }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- staggered scroll reveal ---- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // stagger items that share a parent
        var siblings = Array.prototype.slice.call(
          el.parentNode ? el.parentNode.querySelectorAll(":scope > .reveal") : []
        );
        var idx = siblings.indexOf(el);
        var delay = idx > 0 ? Math.min(idx * 80, 360) : 0;
        el.style.transitionDelay = delay + "ms";
        el.classList.add("in");
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- gentle hero parallax (skipped when reduced motion) ---- */
  var heroImg = document.querySelector(".hero-img");
  if (heroImg && !reduce) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < 700) {
          heroImg.style.transform = "scale(1.06) translateY(" + (y * 0.04) + "px)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- smooth in-page anchor scrolling with sticky-header offset ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = nav ? nav.offsetHeight + 10 : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
      if (history.replaceState) { history.replaceState(null, "", id); }
    });
  });

  /* ---- preview contact form: friendly confirmation, no real submit ---- */
  var form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        var original = btn.textContent;
        btn.textContent = "Thanks! We'll be in touch.";
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = original;
          btn.disabled = false;
          form.reset();
        }, 2600);
      }
    });
  }
})();

/* Reveal safety net (added by Storefront Studio QA): guarantees no element stays
   invisible if the primary scroll-reveal misses on-load / above-the-fold content. */
(function () {
  function show(el){ el.style.opacity = '1'; el.style.transform = 'none'; }
  var els = document.querySelectorAll('.reveal,[data-reveal]');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach(show); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
  els.forEach(function (el) { io.observe(el); });
  function sweep(){ els.forEach(function (el){ try { if (getComputedStyle(el).opacity === '0') show(el); } catch(_){} }); }
  window.addEventListener('load', function(){ setTimeout(sweep, 500); });
  setTimeout(sweep, 1500);
})();
