// Scroll-reveal with a gentle stagger inside each group.
const io = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' })
  : null;

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 6) * 70}ms`;
  if (io) io.observe(el); else el.classList.add('in');
});

// Nav: solid background after leaving the hero.
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 48);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Demo inquiry form — captures nothing, sends nothing.
document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const status = form.querySelector('.form-status');
    if (status) status.textContent = 'Thanks — this is a preview, so nothing was sent. On the live site this reaches the mall directly.';
    form.reset();
  });
});
