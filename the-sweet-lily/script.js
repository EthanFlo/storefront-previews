(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  // Hero scale-in on load
  var hero = document.querySelector(".hero");
  function loadHero() { if (hero) { hero.classList.add("loaded"); } }
  if (document.readyState === "complete") { loadHero(); }
  else { window.addEventListener("load", loadHero); }

  // Reveal on scroll
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  function showAll() {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    // Reveal anything already in view immediately (above the fold visible on load)
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var sibs = Array.prototype.slice.call(
            (el.parentNode || document).querySelectorAll("[data-reveal]")
          );
          var idx = sibs.indexOf(el);
          var delay = idx > -1 ? Math.min(idx, 5) * 80 : 0;
          setTimeout(function () { el.classList.add("in"); }, delay);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { io.observe(el); });

    // Window load sweep: ensure above-the-fold content is shown
    window.addEventListener("load", function () {
      revealEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) { el.classList.add("in"); }
      });
    });
  }

  // Sticky header tighten on scroll
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) { return; }
    if (window.scrollY > 24) { header.classList.add("tight"); }
    else { header.classList.remove("tight"); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Subtle hero parallax
  if (hero && !reduceMotion) {
    var heroImg = document.getElementById("heroImg");
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) { return; }
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY;
        if (heroImg && y < window.innerHeight) {
          heroImg.style.transform = "scale(1) translateY(" + (y * 0.12) + "px)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  // Inquiry form: demo only, never submits
  var form = document.getElementById("inquiryForm");
  var confirm = document.getElementById("formConfirm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#name");
      var email = form.querySelector("#email");
      var message = form.querySelector("#message");
      var ok = true;
      [name, email, message].forEach(function (f) {
        if (f && !f.value.trim()) { ok = false; }
      });
      if (!ok) {
        if (confirm) {
          confirm.hidden = false;
          confirm.textContent = "Please add your name, email, and a short note so we can help.";
        }
        return;
      }
      if (confirm) {
        confirm.hidden = false;
        confirm.innerHTML = "Thanks, we got it. This is a demo form, so nothing was actually sent. " +
          "For a real answer, please call <a class=\"text-link\" href=\"tel:+18303831038\">(830) 383-1038</a>.";
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
