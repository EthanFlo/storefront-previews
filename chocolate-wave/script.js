// Chocolate Wave. Small, dependency-free interactions.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Scroll-reveal with a gentle stagger inside each group ---- */
const io = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' })
  : null;

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 6) * 80}ms`;
  if (io && !reduceMotion) {
    io.observe(el);
  } else {
    el.classList.add('in');
  }
});

/* ---- Nav: solid background once you leave the hero ---- */
const nav = document.getElementById('nav');
const onScroll = () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 56);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---- Hero parallax: ease the photo as you scroll past it ---- */
const heroImg = document.querySelector('.hero-img');
if (heroImg && !reduceMotion) {
  let ticking = false;
  const parallax = () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroImg.style.transform = `scale(1.08) translateY(${y * 0.18}px)`;
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(parallax);
      ticking = true;
    }
  }, { passive: true });
}

/* ---- Demo inquiry form. Captures nothing, sends nothing ---- */
document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const status = form.querySelector('.form-status');
    if (status) {
      status.textContent = 'Thanks. This is a preview, so nothing was sent. On the live site this note would reach the shop directly.';
    }
    form.reset();
  });
});

/* Reveal safety net (added by Storefront Studio QA): guarantees no element stays
   invisible if the primary scroll-reveal misses on-load / above-the-fold content. */
(function () {
  function show(el){ el.style.opacity = '1'; el.style.transform = 'none'; }
  var els = document.querySelectorAll('.reveal,[data-reveal]');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach(show); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
  els.forEach(function (el) { io.observe(el); });
  function sweep(){ els.forEach(function (el){ try { if (getComputedStyle(el).opacity === '0') show(el); } catch(_){} }); }
  window.addEventListener('load', function(){ setTimeout(sweep, 500); });
  setTimeout(sweep, 1500);
})();
