import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { setInitialStates, initScrollAnimations } from './animations';
gsap.registerPlugin(ScrollTrigger);

import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
// import Swiper and modules styles

function initLenis(){
    const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    prevent: (node) => {
        return node.closest('.modalContainer');
    }
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
}
const ScrollLock = ( function () {
    let scrollY      = 0;
    let lockCount    = 0; // reference count — safe for nested lock calls
    let lenisInstance = null;

    // ── Register Lenis ───────────────────────────────────────────────────────

    /**
     * Pass your Lenis instance once during init.
     * ScrollLock will stop/start it automatically.
     *
     * @param {object} lenis - Your Lenis instance.
     */
    function registerLenis( lenis ) {
        lenisInstance = lenis;
    }

    // ── Lock ─────────────────────────────────────────────────────────────────

    function lock() {
        lockCount++;

        if ( lockCount > 1 ) return; // already locked

        if ( lenisInstance ) {
            lenisInstance.stop();
        } else {
            scrollY                      = window.scrollY;
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top      = `-${ scrollY }px`;
            document.body.style.width    = '100%';
        }
    }

    // ── Unlock ───────────────────────────────────────────────────────────────

    function unlock() {
        if ( lockCount <= 0 ) return;

        lockCount--;

        if ( lockCount > 0 ) return; // something else still needs the lock

        if ( lenisInstance ) {
            lenisInstance.start();
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top      = '';
            document.body.style.width    = '';
            window.scrollTo( 0, scrollY );
        }
    }

    // ── Public API ────────────────────────────────────────────────────────────

    return { registerLenis, lock, unlock };

} )();


function hoverFollower() {
    const table = document.querySelector(".dwnld_table");
    if (!table) return;

    const bg = table.querySelector(".highlighter");
    const rows = table.querySelectorAll(".table_row");

    let activeRow = null;

    const syncPosition = (row, animate = false) => {
        const vars = {
            top: row.offsetTop,
            height: row.offsetHeight,
            overwrite: "auto"
        };
        animate
            ? gsap.to(bg, { ...vars, duration: 0.5, ease: "expo.out" })
            : gsap.set(bg, vars);
    };

    // Initial state
    gsap.set(bg, { top: 0, height: rows[0]?.offsetHeight || 0, opacity: 0 });

    rows.forEach((row) => {
        row.addEventListener("pointerenter", () => {
            activeRow = row;
            syncPosition(row, true);
            gsap.to(bg, { opacity: 1, duration: 0.5, ease: "expo.out", overwrite: "auto" });
        });
    });

    table.addEventListener("pointerleave", () => {
        activeRow = null;
        gsap.to(bg, { opacity: 0, duration: 0.1, overwrite: "auto", ease: 'none' });
    });

    ScrollTrigger.addEventListener("refresh", () => {
        if (activeRow) {
            syncPosition(activeRow);
        } else {
            gsap.set(bg, { height: rows[0]?.offsetHeight || 0 });
        }
    });
}

function aia_slider(){    

    const swiper = new Swiper('.aia_spec .swiper', {
        modules: [Navigation],
        slidesPerView: 'auto',
        spaceBetween: 20,
        navigation: {
            nextEl: '.swiper-next',
            prevEl: '.swiper-prev',
        },       
    });
}
setInitialStates();
document.addEventListener('DOMContentLoaded', ()=>{
    initLenis();    
    hoverFollower();
    aia_slider();
    initScrollAnimations();
});