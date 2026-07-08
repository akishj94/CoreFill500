// animations.js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

// ─────────────────────────────────────────────────────────────
// 0. HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────
function fixNestedInlineTags(container) {
  container.querySelectorAll('em, strong, span, i, b, a, u, mark').forEach((tag) => {
    gsap.set(tag, { display: 'inline' });
  });
}

// ─────────────────────────────────────────────────────────────
// 1. SET INITIAL STATES
// ─────────────────────────────────────────────────────────────

export function setInitialStates() {

  const fadeUp = document.querySelectorAll('.fade-up');
  if (fadeUp.length) gsap.set(fadeUp, { opacity: 0, y: 40 });

  const fadeIn = document.querySelectorAll('.fade-in');
  if (fadeIn.length) gsap.set(fadeIn, { opacity: 0 });

  const scaleDown = document.querySelectorAll('.scale-down');
  if (scaleDown.length) gsap.set(scaleDown, { transformOrigin: 'top center' });

  document.querySelectorAll('.fade-up-group').forEach((section) => {
    const items = section.querySelectorAll('.fade-up-item');
    if (items.length) gsap.set(items, { opacity: 0, y: 40 });
  });

  document.querySelectorAll('.fade-in-group').forEach((section) => {
    const items = section.querySelectorAll('.fade-in-item');
    if (items.length) gsap.set(items, { opacity: 0 });
  });
  document.querySelectorAll('video').forEach(video => {
    video.removeAttribute('controls');
  });
}

// ─────────────────────────────────────────────────────────────
// 2. SCROLL ANIMATIONS
// ─────────────────────────────────────────────────────────────

export function initScrollAnimations() {

  // ── Fade up (standalone) ───────────────────────────────
  ScrollTrigger.batch('.fade-up', {
    start: 'top 99%',
    once: true,
    onEnter: (els) => gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
    }),
  });

  // ── Fade in (standalone) ───────────────────────────────
  ScrollTrigger.batch('.fade-in', {
    start: 'top 99%',
    once: true,
    onEnter: (els) => gsap.to(els, {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.1,
    }),
  });

  // ── Fade up (staggered group) ──────────────────────────
  document.querySelectorAll('.fade-up-group').forEach((section) => {
    const items = section.querySelectorAll('.fade-up-item');
    if (!items.length) return;

    ScrollTrigger.batch(items, {
      start: 'top 99%',
      once: true,
      onEnter: (els) => gsap.to(els, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
      }),
    });
  });

  // ── Fade in (staggered group) ──────────────────────────
  document.querySelectorAll('.fade-in-group').forEach((section) => {
    const items = section.querySelectorAll('.fade-in-item');
    if (!items.length) return;

    ScrollTrigger.batch(items, {
      start: 'top 99%',
      once: true,
      onEnter: (els) => gsap.to(els, {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.12,
      }),
    });
  });

  // ── Mask up ────────────────────────────────────────────
  gsap.utils.toArray('.mask-up').forEach((el) => {
    SplitText.create(el, {
      type: 'lines,words',
      mask: 'lines',
      autoSplit: true,
      smartWrap: !el.classList.contains('no_smart_wrapper'),
      onSplit: (self) => {
        fixNestedInlineTags(el);
        gsap.set(self.words, { yPercent: 110 });

        return gsap.to(self.words, {
          yPercent: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.04,
          scrollTrigger: {
            trigger: el,
            start: 'top 99%',
            once: true,
          },
          onComplete: ()=>{
            self.revert();
          }
        });
      },
    });
  });

  // ── Fade text (char opacity) ───────────────────────────
  gsap.utils.toArray('.fade-text').forEach((el) => {
    SplitText.create(el, {
      type: 'chars',
      autoSplit: true,
      smartWrap: !el.classList.contains('no_smart_wrapper'),
      onSplit: (self) => {
        fixNestedInlineTags(el);
        gsap.set(self.chars, { opacity: 0.2 });

        return gsap.to(self.chars, {
          opacity: 1,
          stagger: 0.02,
          ease: 'none',
          duration: 0,
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
          },
           onComplete: ()=>{
            // self.revert();
          }
        });
       
      },      
    });
  });

  // ── Scale down (desktop only) ──────────────────────────
  const mm = gsap.matchMedia();

  document.querySelectorAll('.scale-down').forEach((el) => {
    const target = el.firstElementChild;

    mm.add('(min-width: 768px)', () => {
      gsap.to(target, {
        scale: 0.85,
        y: '60%',
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom+=50% top',
          scrub: true,
        },
      });
    });
  });
}