/* The Antique Store & More, small, dependency-free interactions */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Current year in footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* ---- Sticky header tightens on scroll ---- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 28) { header.classList.add("tight"); }
    else { header.classList.remove("tight"); }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Scroll reveal (fade + 14px rise, staggered) ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showAllNow() {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  if (prefersReduced || !("IntersectionObserver" in window)) {
    // No motion preference, or no observer support: just show everything.
    showAllNow();
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // Stagger items that share a parent for a gentle cascade.
          var siblings = el.parentNode
            ? Array.prototype.slice.call(el.parentNode.children).filter(function (c) {
                return c.classList && c.classList.contains("reveal");
              })
            : [el];
          var idx = siblings.indexOf(el);
          var delay = idx > 0 ? Math.min(idx * 80, 320) : 0;
          setTimeout(function () { el.classList.add("is-in"); }, delay);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    reveals.forEach(function (el) {
      // Anything already in view on load reveals immediately (above the fold safety).
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh * 0.92) {
        el.classList.add("is-in");
      } else {
        io.observe(el);
      }
    });

    // Window load sweep: anything still hidden but on screen gets revealed.
    window.addEventListener("load", function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      reveals.forEach(function (el) {
        if (!el.classList.contains("is-in")) {
          var r = el.getBoundingClientRect();
          if (r.top < vh) { el.classList.add("is-in"); }
        }
      });
    });
  }

  /* ---- Subtle hero parallax (skipped when reduced motion) ---- */
  var heroImg = document.getElementById("heroImg");
  if (heroImg && !prefersReduced) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < 900) {
          heroImg.style.transform = "translateY(" + (y * 0.12) + "px) scale(1.04)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- Inquiry form: demo only, never submits ---- */
  var form = document.getElementById("inquiryForm");
  var confirm = document.getElementById("formConfirm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.querySelector("#name") || {}).value || "";
      name = name.trim();
      var first = name.split(" ")[0];
      if (confirm) {
        confirm.hidden = false;
        confirm.textContent = first
          ? "Thanks, " + first + ". This is a demo, so nothing was sent yet. Once we go live this'll land in the shop's inbox. For now, give us a call at (615) 905-8722."
          : "Thanks for reaching out. This is a demo, so nothing was sent yet. Once we go live this'll land in the shop's inbox. For now, give us a call at (615) 905-8722.";
      }
      form.reset();
      if (confirm && confirm.scrollIntoView) {
        confirm.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
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
