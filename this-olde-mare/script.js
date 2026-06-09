(function () {
  "use strict";

  // Current year in footer
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  // Sticky header tightens on scroll
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) { return; }
    if (window.scrollY > 24) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Scroll reveal. Everything in view on load shows immediately.
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showNow(el) { el.classList.add("is-ready"); }

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(showNow);
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = Number(el.getAttribute("data-delay") || 0);
          window.setTimeout(function () { showNow(el); }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    // Stagger items within shared parents for a softer cascade
    var groups = {};
    reveals.forEach(function (el) {
      var parent = el.parentElement;
      var key = parent ? (parent.className || "g") : "g";
      groups[key] = groups[key] || 0;
    });

    reveals.forEach(function (el) {
      // Reveal anything already in the viewport right away (above the fold)
      var rect = el.getBoundingClientRect();
      var inView = rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom > 0;
      if (inView) {
        showNow(el);
      } else {
        observer.observe(el);
      }
    });

    // Stagger siblings that reveal together
    var parents = {};
    reveals.forEach(function (el) {
      var p = el.parentElement;
      if (!p) { return; }
      if (!parents[p.dataset.gid]) {
        p.dataset.gid = Math.random().toString(36).slice(2);
      }
    });
    Object.keys(parents);
    document.querySelectorAll(".offer-grid, .gallery-grid, .proof-grid, .faq-list, .visit-details").forEach(function (group) {
      var kids = group.querySelectorAll(".reveal");
      Array.prototype.forEach.call(kids, function (kid, i) {
        kid.style.transitionDelay = (i * 70) + "ms";
      });
    });
  }

  // Window load sweep so nothing gets stuck hidden
  window.addEventListener("load", function () {
    reveals.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var inView = rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom > 0;
      if (inView) { showNow(el); }
    });
  });

  // Inquiry form. Demo only, never submits.
  var form = document.getElementById("inquiryForm");
  var confirmBox = document.getElementById("formConfirm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#name");
      var contact = form.querySelector("#contact");

      if (name && !name.value.trim()) { name.focus(); return; }
      if (contact && !contact.value.trim()) { contact.focus(); return; }

      if (confirmBox) {
        var firstName = name && name.value.trim() ? name.value.trim().split(" ")[0] : "";
        confirmBox.textContent = (firstName ? "Thanks, " + firstName + ". " : "Thanks. ") +
          "I've got your note and I'll reach out as soon as I can. This is a demo, so nothing was actually sent.";
        confirmBox.hidden = false;
      }
      form.reset();
      if (confirmBox) { confirmBox.scrollIntoView({ behavior: "smooth", block: "center" }); }
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
