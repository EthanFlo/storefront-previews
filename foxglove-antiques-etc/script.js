/* Foxglove Antiques & Etc., interactions */
(function () {
  "use strict";

  // Flag that JS is on (used as a fallback safety in CSS).
  document.documentElement.classList.remove("no-js");

  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* ---- Current year in footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---- Hero image scale-in on load ---- */
  var hero = document.getElementById("hero");
  function startHero() { if (hero) { hero.classList.add("in-view"); } }
  if (reduceMotion) { startHero(); }
  else { requestAnimationFrame(function () { requestAnimationFrame(startHero); }); }

  /* ---- Scroll reveal (visible immediately on load, then animates in view) ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showAll() {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    // Reveal anything already on screen right away so the fold is never blank.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = el.getAttribute("data-stagger");
          if (delay) { el.style.transitionDelay = delay + "ms"; }
          el.classList.add("is-in");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    reveals.forEach(function (el, i) {
      // Stagger items that share a parent for a gentle cascade.
      var sibs = el.parentElement ? el.parentElement.children.length : 1;
      if (sibs > 1) { el.setAttribute("data-stagger", (i % 6) * 70); }
      io.observe(el);
    });

    // Immediate pass: reveal everything currently in the viewport on first paint.
    function revealInView() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      reveals.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.96 && r.bottom > 0) {
          el.classList.add("is-in");
          io.unobserve(el);
        }
      });
    }
    revealInView();

    // Window load sweep: catch anything missed (late layout, fonts, images).
    window.addEventListener("load", revealInView);
  }

  /* ---- Sticky header tighten on scroll ---- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) { return; }
    if (window.pageYOffset > 24) { header.classList.add("tight"); }
    else { header.classList.remove("tight"); }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Demo inquiry form (never submits) ---- */
  var form = document.getElementById("inquiryForm");
  var confirm = document.getElementById("formConfirm");
  if (form && confirm) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameField = document.getElementById("name");
      var first = nameField && nameField.value.trim()
        ? nameField.value.trim().split(" ")[0]
        : "";
      confirm.hidden = false;
      confirm.textContent = first
        ? "Thanks, " + first + ". This is a demo form, so nothing was sent yet. For anything time sensitive, please call the shop at (276) 628-8598 and we'll help you out."
        : "Thanks for reaching out. This is a demo form, so nothing was sent yet. For anything time sensitive, please call the shop at (276) 628-8598 and we'll help you out.";
      form.reset();
      confirm.setAttribute("tabindex", "-1");
      confirm.focus({ preventScroll: false });
    });
  }
})();

/* ---- reveal safety net (appended by the pipeline) -------------------------
   Guarantees no scroll-reveal element is ever stuck invisible: it observes the
   common reveal selectors, reveals anything in view immediately, sweeps on load,
   and force-reveals everything after 1.5s as a last resort. Honors no class
   convention in particular, so it works regardless of how the page was authored. */
(function () {
  var SEL = '.reveal,[data-reveal],.fade-in,.fade-up,.fade,.scroll-reveal,.reveal-on-scroll,.animate,.will-reveal,.appear';
  function show(el) {
    el.classList.add('is-visible', 'visible', 'revealed', 'in-view', 'show', 'active', 'loaded');
    el.removeAttribute('data-reveal');
    if (el.style) { el.style.opacity = '1'; el.style.transform = 'none'; el.style.visibility = 'visible'; }
  }
  function inView(el) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh * 1.15 && r.bottom > -50;
  }
  function sweep(force) {
    var els = document.querySelectorAll(SEL);
    for (var i = 0; i < els.length; i++) { if (force || inView(els[i])) show(els[i]); }
  }
  try {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      document.querySelectorAll(SEL).forEach(function (el) { io.observe(el); });
    }
  } catch (e) {}
  document.addEventListener('DOMContentLoaded', function () { sweep(false); });
  window.addEventListener('load', function () { sweep(false); setTimeout(function () { sweep(true); }, 1500); });
  sweep(false);
})();
