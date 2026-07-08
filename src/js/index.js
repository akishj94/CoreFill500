import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { setInitialStates, initScrollAnimations } from './animations';
gsap.registerPlugin(ScrollTrigger);

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