/* Etcetera Shoppe
   Sticky header, scroll reveal with on-load safety, gentle hero parallax. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* ---- Sticky header transition ---- */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---- Reveal on scroll, with reveal-on-load safety ---- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showAll() {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    // No animation path: everything is simply visible.
    showAll();
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) {
      // Reveal anything already in view on first paint right away,
      // so nothing above the fold sits hidden waiting for a scroll.
      var rect = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh * 0.92 && rect.bottom > 0) {
        el.classList.add("is-in");
      } else {
        observer.observe(el);
      }
    });

    // Hard fallback: once the page is fully loaded, reveal anything still
    // hidden in the viewport. A blank hero never ships.
    window.addEventListener("load", function () {
      revealEls.forEach(function (el) {
        if (el.classList.contains("is-in")) return;
        var rect = el.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top < vh && rect.bottom > 0) {
          el.classList.add("is-in");
        }
      });
    });
  }

  /* ---- Gentle hero parallax + settle ---- */
  var heroImg = document.querySelector(".hero-img");
  if (heroImg && !reduceMotion) {
    var ticking = false;
    function parallax() {
      var y = window.scrollY;
      if (y < 760) {
        // Scale eases from 1.08 toward 1.0 as you scroll, with a slight drift.
        var scale = 1.08 - Math.min(y / 760, 1) * 0.08;
        var shift = y * 0.18;
        heroImg.style.transform = "translateY(" + shift + "px) scale(" + scale + ")";
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(parallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---- Smooth anchor scroll with header offset ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({
        top: top,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });
  });
})();

/* Reveal safety net (Storefront Studio QA): guarantees nothing stays invisible on load. */
(function(){function show(el){el.style.opacity='1';el.style.transform='none';}var els=document.querySelectorAll('.reveal,[data-reveal]');if(!els.length)return;if(!('IntersectionObserver' in window)){els.forEach(show);return;}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -5% 0px'});els.forEach(function(el){io.observe(el);});function sweep(){els.forEach(function(el){try{if(getComputedStyle(el).opacity==='0')show(el);}catch(_){}});}window.addEventListener('load',function(){setTimeout(sweep,500);});setTimeout(sweep,1500);})();
