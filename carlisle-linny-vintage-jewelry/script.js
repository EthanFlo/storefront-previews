/* Carlisle & Linny Vintage Jewelry
   Small, dependency-free behavior. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- current year in footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* ---- sticky header tightens on scroll ---- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) { return; }
    if (window.scrollY > 24) {
      header.classList.add("shrink");
    } else {
      header.classList.remove("shrink");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- scroll reveal (staggered) ---- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showNow(el) { el.classList.add("is-in"); }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(showNow);
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // stagger among siblings already in view
          var delay = 0;
          var group = el.parentElement
            ? Array.prototype.slice.call(el.parentElement.querySelectorAll(":scope > .reveal"))
            : [];
          var idx = group.indexOf(el);
          if (idx > -1) { delay = Math.min(idx, 5) * 80; }
          setTimeout(function () { showNow(el); }, delay);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      // reveal anything already on screen immediately on load
      if (rect.top < window.innerHeight * 0.95) {
        showNow(el);
      } else {
        io.observe(el);
      }
    });
  }

  /* ---- window load sweep: nothing should be stuck hidden ---- */
  window.addEventListener("load", function () {
    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) { showNow(el); }
    });
  });

  /* ---- inquiry form: never actually submits ---- */
  var form = document.getElementById("inquiryForm");
  var confirmMsg = document.getElementById("formConfirm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (confirmMsg) {
        confirmMsg.hidden = false;
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent = "Note ready";
        btn.disabled = true;
      }
      if (confirmMsg && typeof confirmMsg.scrollIntoView === "function") {
        confirmMsg.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }
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
