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

    ScrollLock.registerLenis(lenis);
    return lenis;
}
const ScrollLock = ( function () {
    let scrollY      = 0;
    let lockCount    = 0; // reference count — safe for nested lock calls
    let lenisInstance = null;

    function registerLenis( lenis ) {
        lenisInstance = lenis;
    }

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


function videoFrames() {
    const frames = document.querySelector('canvas');
    const context = frames.getContext('2d');

    const setCanvasSize = () => {
        const pixelRatio = window.devicePixelRatio || 1;
        frames.width = window.innerWidth * pixelRatio;
        frames.height = window.innerHeight * pixelRatio;
        frames.style.width = window.innerWidth + "px";
        frames.style.height = window.innerHeight + "px";
        context.scale(pixelRatio, pixelRatio);
    };
    setCanvasSize();

    const frameCount = 122;
    const currentFrame = (index) =>
        `assets/sequence/frame_${(index + 1).toString().padStart(4, "0")}.jpeg`;

    let images = [];
    let videoFrames = { frame: 0 };
    let imagesToLoad = frameCount;

    const onLoad = () => {
        imagesToLoad--;
        if (!imagesToLoad) {
            render();
            setupScrollTrigger();
        }
    };

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.onload = onLoad;
        img.onerror = onLoad;
        img.src = currentFrame(i);
        images.push(img);
    }

    const render = () => {
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        const img = images[videoFrames.frame];

        if (img && img.complete && img.naturalWidth > 0) {
            const imageAspect = img.naturalWidth / img.naturalHeight;
            const canvasAspect = canvasWidth / canvasHeight;
            let drawWdith, drawHeight, drawX, drawY;

            if (imageAspect > canvasAspect) {
                drawHeight = canvasHeight;
                drawWdith = drawHeight * imageAspect;
                drawX = (canvasWidth - drawWdith) / 2;
                drawY = 0;
            } else {
                drawWdith = canvasWidth;
                drawHeight = drawWdith / imageAspect;
                drawX = 0;
                drawY = (canvasHeight - drawHeight) / 2;
            }

            context.drawImage(img, drawX, drawY, drawWdith, drawHeight);
        }
    };

    const setupScrollTrigger = () => {
        const contentBlock = document.querySelector('.cotent-block');
        const fadeOverlay = document.querySelector('.fadeOverlay');
        const panelWrap = document.querySelector('.panelWrap');
        const panels = gsap.utils.toArray('.panelWrap .panel');

        let isDesktopViewport = false;
        const mm = gsap.matchMedia();
        mm.add('(min-width: 768px)', () => {
            isDesktopViewport = true;
            return () => { isDesktopViewport = false; };
        });

        gsap.set(contentBlock, { opacity: 0, scale: 1.3, transformOrigin: 'center center' });
        gsap.set(fadeOverlay, { opacity: 0 });

        const seqDistance = window.innerHeight * 1.8;      // image sequence — increase/decrease to taste
        const revealDistance = window.innerHeight * 0.6;   // overlay fade + content scale
        const introDistance = seqDistance + revealDistance;

        // Mobile only: extra pinned distance reserved for the horizontal panel
        // scrub. Desktop doesn't reserve any of this — panels there are normal
        // scrolling flow under a sticky title, so the pin just releases after intro.
        const panelDistance = isDesktopViewport ? 0 : window.innerHeight * (panels.length - 1) * 1.1;
        const totalDistance = introDistance + panelDistance;

        const overlayTl = gsap.timeline({ paused: true })
            .to(fadeOverlay, { opacity: 1, duration: 0.6, ease: 'power1.out' });

        let overlayShown = false;

        ScrollTrigger.create({
            trigger: ".landing_main",
            start: "bottom top",
            end: `+=${totalDistance}`,
            pin: ".pinned__canvas",
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                const distance = self.progress * totalDistance;

                // Phase A — image sequence scrub
                const seqProgress = Math.min(distance / seqDistance, 1);
                videoFrames.frame = Math.round(seqProgress * (frameCount - 1));
                render();

                // Phase B1 — fade overlay, gated on sequence completion, reversible
                if (distance >= seqDistance && !overlayShown) {
                    overlayShown = true;
                    overlayTl.play();
                } else if (distance < seqDistance && overlayShown) {
                    overlayShown = false;
                    overlayTl.reverse();
                    gsap.set(contentBlock, { opacity: 0, scale: 1.3 });
                }

                // Phase B2 — content scale, scrub-based
                if (distance > seqDistance) {
                    const scaleProgress = gsap.utils.clamp(0, 1, (distance - seqDistance) / revealDistance);
                    gsap.set(contentBlock, { opacity: scaleProgress, scale: 1.3 - 0.3 * scaleProgress });
                }

                // Phase C — mobile only: vertical scroll drives horizontal panel
                // position directly, continuous (not stepped). Section stays
                // pinned the whole time since this consumes real scroll distance.
                if (!isDesktopViewport && panelDistance > 0 && distance > introDistance) {
                    const panelProgress = gsap.utils.clamp(0, 1, (distance - introDistance) / panelDistance);
                    gsap.set(panelWrap, { xPercent: -panelProgress * 100 * (panels.length - 1) });
                }
            }
        });
    }
    window.addEventListener("resize", () => {
        setCanvasSize();
        render();
        ScrollTrigger.refresh();
    });
}

setInitialStates();
document.addEventListener('DOMContentLoaded', ()=>{
    initLenis();
    hoverFollower();
    aia_slider();
    initScrollAnimations();
    videoFrames();
    window.addEventListener('load', () => ScrollTrigger.refresh());
});