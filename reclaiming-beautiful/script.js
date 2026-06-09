/* ============================================================
   Reclaiming Beautiful, interactions
   Plain JS, no libraries. Honors reduced motion.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- current year in footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---------- sticky header tightens on scroll ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 24) { header.classList.add("shrink"); }
    else { header.classList.remove("shrink"); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- scroll reveal (staggered, in-view) ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showNow(el) { el.classList.add("is-in"); }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    // No motion or no observer: just show everything.
    revealEls.forEach(showNow);
  } else {
    // Reveal anything already in view on load so nothing waits hidden above the fold.
    var vh = window.innerHeight || document.documentElement.clientHeight;
    revealEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92) { showNow(el); }
    });

    var io = new IntersectionObserver(function (entries, obs) {
      var batch = [];
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { batch.push(entry.target); obs.unobserve(entry.target); }
      });
      // Stagger within whatever group enters together.
      batch.forEach(function (el, i) {
        setTimeout(function () { showNow(el); }, Math.min(i * 80, 320));
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) {
      if (!el.classList.contains("is-in")) { io.observe(el); }
    });
  }

  /* ---------- window load sweep: nothing left hidden ---------- */
  window.addEventListener("load", function () {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    revealEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh) { el.classList.add("is-in"); }
    });
  });

  /* ---------- subtle hero parallax (skipped if reduced motion) ---------- */
  var heroImg = document.getElementById("heroImg");
  if (heroImg && !reduceMotion) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight) {
          heroImg.style.transform = "scale(1.04) translateY(" + (y * 0.12) + "px)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- demo inquiry form: never submits ---------- */
  var form = document.getElementById("inquiryForm");
  var confirmEl = document.getElementById("formConfirm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = (form.querySelector("#name") || {}).value || "";
      name = name.trim();

      // Light validation so the demo feels real, without sending anything.
      if (!name || !(form.querySelector("#email") || {}).value.trim() || !(form.querySelector("#message") || {}).value.trim()) {
        if (confirmEl) {
          confirmEl.hidden = false;
          confirmEl.textContent = "Please add your name, email, and a short message, then try again.";
          confirmEl.style.borderColor = "#a8743f";
          confirmEl.style.color = "#8c5e30";
          confirmEl.style.background = "rgba(168,116,63,0.08)";
        }
        return;
      }

      var firstName = name.split(" ")[0];
      if (confirmEl) {
        confirmEl.hidden = false;
        confirmEl.style.borderColor = "";
        confirmEl.style.color = "";
        confirmEl.style.background = "";
        confirmEl.textContent = "Thanks, " + firstName +
          ". This is a demo form, so nothing was actually sent. To reach us today, please call 651-342-0553 and we'll be glad to help.";
        confirmEl.setAttribute("role", "status");
      }

      form.reset();
      if (confirmEl && confirmEl.scrollIntoView) {
        confirmEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
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
