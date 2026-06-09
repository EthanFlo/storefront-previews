(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* year in footer */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* ---- scroll reveal, staggered, but never hide above-the-fold on load ---- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  function showNow(el) { el.classList.add("in"); }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(showNow);
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var sibs = el.parentElement ? el.parentElement.querySelectorAll("[data-reveal]") : [el];
          var idx = Array.prototype.indexOf.call(sibs, el);
          var delay = Math.min(idx, 6) * 80;
          setTimeout(function () { showNow(el); }, delay);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    /* reveal anything already in view immediately so the fold is never blank */
    function revealInView() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach(function (el) {
        if (el.classList.contains("in")) { return; }
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) {
          showNow(el);
        } else {
          io.observe(el);
        }
      });
    }

    revealInView();
    /* a load sweep so nothing gets stuck if fonts/images shift layout */
    window.addEventListener("load", function () {
      revealEls.forEach(function (el) {
        if (!el.classList.contains("in")) {
          var r = el.getBoundingClientRect();
          var vh = window.innerHeight || document.documentElement.clientHeight;
          if (r.top < vh) { showNow(el); }
        }
      });
    });
  }

  /* ---- sticky header tighten on scroll ---- */
  var header = document.getElementById("siteHeader");
  var lastTick = false;
  function onScroll() {
    if (lastTick) { return; }
    lastTick = true;
    window.requestAnimationFrame(function () {
      if (header) {
        if (window.scrollY > 24) { header.classList.add("tight"); }
        else { header.classList.remove("tight"); }
      }
      lastTick = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- subtle hero parallax ---- */
  var heroImg = document.getElementById("heroImg");
  if (heroImg && !reduceMotion) {
    var heroParallaxTick = false;
    window.addEventListener("scroll", function () {
      if (heroParallaxTick) { return; }
      heroParallaxTick = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight) {
          heroImg.style.transform = "scale(1.04) translateY(" + (y * 0.12) + "px)";
        }
        heroParallaxTick = false;
      });
    }, { passive: true });
  }

  /* ---- inquiry form: never submits anywhere ---- */
  var form = document.getElementById("inquiryForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (document.getElementById("name") || {}).value || "";
      name = name.trim();
      var contact = ((document.getElementById("contact") || {}).value || "").trim();
      var message = ((document.getElementById("message") || {}).value || "").trim();

      if (!name || !contact || !message) {
        if (note) {
          note.textContent = "Add your name, a way to reach you, and a quick note, then we're set.";
          note.classList.add("show");
        }
        return;
      }

      if (note) {
        var first = name.split(" ")[0];
        note.textContent = "Thanks, " + first + ". This is a demo form, so nothing sent yet, but we'll wire it to the shop's email before launch.";
        note.classList.add("show");
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
