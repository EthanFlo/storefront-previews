/* The West End Hair Studio — light, intentional motion */
(function () {
  "use strict";

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- sticky header state on scroll ---- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- staggered scroll reveal ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // stagger siblings within the same parent
        var parent = el.parentElement;
        var sibs = parent ? Array.prototype.slice.call(parent.children).filter(function (c) {
          return c.classList && c.classList.contains("reveal");
        }) : [el];
        var idx = sibs.indexOf(el);
        el.style.transitionDelay = (Math.max(0, idx) * 0.08) + "s";
        el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- gentle hero parallax (scale settle handled in CSS via load) ---- */
  var heroImg = document.querySelector(".hero-img");
  if (heroImg && !reduce) {
    // settle the initial scale once painted
    requestAnimationFrame(function () {
      heroImg.style.transform = "scale(1.0)";
    });
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < 760) {
          heroImg.style.transform = "scale(1.0) translateY(" + (y * 0.04).toFixed(1) + "px)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- demo form: friendly local response, no real submission ---- */
  var form = document.querySelector(".visit-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      var name = (form.querySelector('input[name="name"]') || {}).value || "";
      var first = name.trim().split(/\s+/)[0];
      if (status) {
        status.textContent = first
          ? ("Thanks " + first + ". This is a preview form. Call (603) 373-8947 and we'll get you booked.")
          : "Thanks. This is a preview form. Call (603) 373-8947 and we'll get you booked.";
      }
      form.reset();
    });
  }

  /* ---- close other FAQ items when one opens (accordion feel) ---- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq details"));
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });
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
