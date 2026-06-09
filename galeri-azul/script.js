/* ============================================================
   Galeri Azul - small site interactions, no libraries
   ============================================================ */
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
    if (!header) return;
    if (window.scrollY > 24) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- hero image slow settle (parallax-ish scale) ---- */
  var heroImg = document.getElementById("heroImg");
  if (heroImg && !reduceMotion) {
    // let it paint at the scaled state, then settle
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        heroImg.classList.add("settled");
      });
    });
  }

  /* ---- scroll reveal, staggered ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showImmediate(el) { el.classList.add("is-in"); }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(showImmediate);
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // stagger items that share a parent
          var siblings = Array.prototype.slice.call(
            el.parentElement ? el.parentElement.children : []
          ).filter(function (c) { return c.classList.contains("reveal"); });
          var idx = siblings.indexOf(el);
          var delay = idx > 0 ? Math.min(idx * 80, 320) : 0;
          el.style.transitionDelay = delay + "ms";
          el.classList.add("is-in");
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    reveals.forEach(function (el) {
      // reveal anything already in view (above the fold) right away
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        showImmediate(el);
      } else {
        io.observe(el);
      }
    });
  }

  /* ---- window load sweep: nothing should be stuck hidden ---- */
  window.addEventListener("load", function () {
    reveals.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && !el.classList.contains("is-in")) {
        el.classList.add("is-in");
      }
    });
  });

  /* ---- inquiry form: demo only, never submits ---- */
  var form = document.getElementById("inquiryForm");
  var success = document.getElementById("formSuccess");

  function markValidity(field) {
    if (!field) return true;
    var ok = field.checkValidity();
    if (ok) {
      field.classList.remove("invalid");
    } else {
      field.classList.add("invalid");
    }
    return ok;
  }

  if (form) {
    var watched = ["name", "email", "message"];

    watched.forEach(function (id) {
      var f = document.getElementById(id);
      if (f) {
        f.addEventListener("input", function () {
          if (f.classList.contains("invalid")) { markValidity(f); }
        });
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var allOk = true;
      watched.forEach(function (id) {
        if (!markValidity(document.getElementById(id))) { allOk = false; }
      });

      if (!allOk) {
        var firstBad = form.querySelector(".invalid");
        if (firstBad) { firstBad.focus(); }
        if (success) { success.hidden = true; }
        return;
      }

      // success state, but nothing leaves the page
      if (success) {
        success.hidden = false;
      }
      form.reset();

      if (success && success.scrollIntoView) {
        success.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
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
