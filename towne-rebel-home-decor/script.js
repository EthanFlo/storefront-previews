/* Towne Rebel | small, dependency-free interactions */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Year in footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---- Sticky header tighten on scroll ---- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add("shrink");
    } else {
      header.classList.remove("shrink");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Scroll reveal (staggered) ---- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showNow(el) { el.classList.add("is-in"); }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    // Everything visible, no motion needed
    revealEls.forEach(showNow);
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      var batchDelay = 0;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // stagger items revealed together
          setTimeout(function () { showNow(el); }, batchDelay);
          batchDelay += 90;
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) {
      // Reveal anything already in view on load right away
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        showNow(el);
      } else {
        observer.observe(el);
      }
    });
  }

  /* ---- Load sweep: make sure nothing stays hidden ---- */
  window.addEventListener("load", function () {
    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) { showNow(el); }
    });
  });

  /* ---- Demo inquiry form (never submits) ---- */
  var form = document.getElementById("inquiryForm");
  var confirmEl = document.getElementById("formConfirm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.querySelector("#name");
      var contact = form.querySelector("#contact");
      var message = form.querySelector("#message");

      if (!name.value.trim() || !contact.value.trim() || !message.value.trim()) {
        if (confirmEl) {
          confirmEl.hidden = false;
          confirmEl.textContent = "Please fill in your name, a way to reach you, and a short note.";
          confirmEl.style.background = "rgba(154, 75, 52, 0.1)";
          confirmEl.style.borderColor = "#9a4b34";
          confirmEl.style.color = "#9a4b34";
        }
        return;
      }

      var firstName = name.value.trim().split(" ")[0];
      if (confirmEl) {
        confirmEl.hidden = false;
        confirmEl.style.background = "";
        confirmEl.style.borderColor = "";
        confirmEl.style.color = "";
        confirmEl.textContent = "Thanks, " + firstName + ". This is a demo, so nothing was sent yet, but on the real site we'd have your note. For now, give us a call at (815) 776-9495.";
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
