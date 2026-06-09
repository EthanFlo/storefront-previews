/* ===========================================================
   Cabin Creek Antiques  -  interactions
   No libraries. Honors reduced motion. Reveals on load.
   =========================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year in footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---------- Sticky header tighten on scroll ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 30) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revealNow(el) { el.classList.add("is-in"); }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    // Show everything straight away.
    revealEls.forEach(revealNow);
  } else {
    var io = new IntersectionObserver(function (entries) {
      // Light stagger for items entering together.
      var delay = 0;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          window.setTimeout(function () { revealNow(el); }, delay);
          delay += 90;
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) {
      // Anything already in view on load reveals immediately (above the fold safety).
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        revealNow(el);
      } else {
        io.observe(el);
      }
    });
  }

  /* ---------- Window load sweep: nothing is left hidden ---------- */
  window.addEventListener("load", function () {
    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) { revealNow(el); }
    });
  });

  /* ---------- Inquiry form: demo only, never submits ---------- */
  var form = document.getElementById("inquiryForm");
  var confirmEl = document.getElementById("formConfirm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nameField = document.getElementById("name");
      var emailField = document.getElementById("email");
      var msgField = document.getElementById("message");

      var name = nameField ? nameField.value.trim() : "";
      var email = emailField ? emailField.value.trim() : "";
      var msg = msgField ? msgField.value.trim() : "";

      if (!name || !email || !msg) {
        if (confirmEl) {
          confirmEl.hidden = false;
          confirmEl.textContent = "Please add your name, email, and a quick note so we can get back to you.";
        }
        return;
      }

      var first = name.split(" ")[0];
      if (confirmEl) {
        confirmEl.hidden = false;
        confirmEl.textContent = "Thanks, " + first + ". This is a demo form, so nothing was actually sent. For anything time sensitive, please call us at 406-570-3166 and we'll help you out.";
        confirmEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
      }
      form.reset();
    });
  }

  /* ---------- Smooth anchor scroll with sticky header offset ---------- */
  var headerOffset = 80;
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id === "#" || id === "#top") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });
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
