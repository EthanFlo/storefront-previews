// What Next? boutique site interactions
(function () {
  "use strict";

  // Current year in footer
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  // Sticky header tighten on scroll
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 30) { header.classList.add("shrink"); }
    else { header.classList.remove("shrink"); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Scroll reveal. Honor reduced motion by showing everything.
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showAll() {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // small stagger for grouped items
          var delay = el.hasAttribute("data-revealed") ? 0 : (i % 6) * 70;
          setTimeout(function () { el.classList.add("is-in"); }, delay);
          el.setAttribute("data-revealed", "1");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) {
      // Reveal anything already in view (above the fold) right away
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        el.classList.add("is-in");
        el.setAttribute("data-revealed", "1");
      } else {
        io.observe(el);
      }
    });
  }

  // Safety sweep on full load: never leave above-the-fold hidden
  window.addEventListener("load", function () {
    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) { el.classList.add("is-in"); }
    });
  });

  // Demo inquiry form. Never submits anywhere.
  var form = document.getElementById("inquiryForm");
  var confirm = document.getElementById("formConfirm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameField = document.getElementById("name");
      var name = nameField && nameField.value ? nameField.value.trim() : "";
      var greeting = name ? "Thanks, " + name + "." : "Thanks for reaching out.";
      if (confirm) {
        confirm.hidden = false;
        confirm.textContent = greeting + " This is a demo form, so nothing was sent. To reach the shop right now, please call (920) 868-2993.";
        confirm.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }
      form.reset();
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
