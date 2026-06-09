(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // current year in footer
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  // ----- scroll reveal with stagger, in-view shown immediately on load -----
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showNow(el) { el.classList.add("in"); }

  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach(showNow);
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute("data-stagger") || "0", 10);
          setTimeout(function () { showNow(el); }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    // stagger items that share a parent
    var groups = {};
    reveals.forEach(function (el) {
      var key = el.parentNode;
      if (!groups.has) { /* no-op */ }
      var idx = groups[keyName(key)] || 0;
      el.setAttribute("data-stagger", String(Math.min(idx, 6) * 80));
      groups[keyName(key)] = idx + 1;
    });

    function keyName(node) {
      if (!node.__rk) { node.__rk = "k" + (keyName._n = (keyName._n || 0) + 1); }
      return node.__rk;
    }

    // reveal anything already in view right away (above the fold visible on load)
    function revealInView() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      reveals.forEach(function (el) {
        if (el.classList.contains("in")) { return; }
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.96) {
          showNow(el);
          observer.unobserve(el);
        } else {
          observer.observe(el);
        }
      });
    }

    revealInView();
    // window load sweep
    window.addEventListener("load", function () {
      revealInView();
      // final safety: nothing should stay hidden after a beat
      setTimeout(function () {
        reveals.forEach(function (el) {
          var r = el.getBoundingClientRect();
          var vh = window.innerHeight || document.documentElement.clientHeight;
          if (r.top < vh) { showNow(el); }
        });
      }, 600);
    });
  }

  // ----- sticky header tightens on scroll -----
  var header = document.getElementById("siteHeader");
  var mobileCall = document.querySelector(".mobile-call");

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) {
      if (y > 24) { header.classList.add("tight"); }
      else { header.classList.remove("tight"); }
    }
    if (mobileCall) {
      if (y > 360) { mobileCall.classList.add("show"); }
      else { mobileCall.classList.remove("show"); }
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ----- subtle hero parallax -----
  if (!prefersReduced) {
    var heroImg = document.querySelector(".hero-img");
    if (heroImg) {
      window.addEventListener("scroll", function () {
        var y = window.pageYOffset || 0;
        if (y < window.innerHeight) {
          heroImg.style.transform = "translateY(" + (y * 0.12) + "px)";
        }
      }, { passive: true });
    }
  }

  // ----- demo inquiry form: never submits -----
  var form = document.getElementById("inquiryForm");
  var confirm = document.getElementById("formConfirm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (document.getElementById("name") || {}).value || "";
      name = name.trim();
      if (confirm) {
        confirm.hidden = false;
        confirm.textContent = name
          ? "Thanks, " + name + ". This is a demo, so nothing was sent, but on the real site this would land in the shop's inbox. For now, please call (828) 295-9989."
          : "Thanks for the note. This is a demo, so nothing was sent. On the real site this would reach the shop. For now, please call (828) 295-9989.";
        confirm.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
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
