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
        console.log('S');
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
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
        img.onerror = function () {
            onLoad.call(this);
        };
        img.src = currentFrame(i);
        images.push(img);
    }
    const render = ()=>{
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        const img = images[videoFrames.frame];

        if(img && img.complete && img.naturalWidth > 0){
            console.log(img.naturalWidth, img.naturalHeight);
            const imageAspect = img.naturalWidth / img.naturalHeight;
            const canvasAspect = canvasWidth /canvasHeight;
            let drawWdith, drawHeight, drawX, drawY;

            if(imageAspect > canvasAspect){
                drawHeight = canvasHeight;
                drawWdith = drawHeight * imageAspect;
                drawX = (canvasWidth - drawWdith) / 2;
                drawY = 0;
            }
            else{
                drawWdith = canvasWidth;
                drawHeight = drawWdith / imageAspect;
                drawX = 0;
                drawY = (canvasHeight - drawHeight) / 2;                
            }

            context.drawImage(img, drawX, drawY, drawWdith, drawHeight);
        }
    }


    // Original Image Aspect Ratio
    // const render = () => {
    //     const canvasWidth = window.innerWidth;
    //     const canvasHeight = window.innerHeight;

    //     context.clearRect(0, 0, canvasWidth, canvasHeight);
    //     const img = images[videoFrames.frame];

    //     if (img && img.complete && img.naturalWidth > 0) {
    //         const imageAspect = img.naturalWidth / img.naturalHeight;
    //         const canvasAspect = canvasWidth / canvasHeight;
    //         let drawWidth, drawHeight, drawX, drawY;

    //         if (imageAspect > canvasAspect) {
    //         // image is wider than canvas -> fit to width, letterbox top/bottom
    //         drawWidth = canvasWidth;
    //         drawHeight = drawWidth / imageAspect;
    //         drawX = 0;
    //         drawY = (canvasHeight - drawHeight) / 2;
    //         } else {
    //         // image is taller than canvas -> fit to height, pillarbox left/right
    //         drawHeight = canvasHeight;
    //         drawWidth = drawHeight * imageAspect;
    //         drawX = (canvasWidth - drawWidth) / 2;
    //         drawY = 0;
    //         }

    //         context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    //     }
    // };
    
    const setupScrollTrigger = () => {
        const panelTitle = document.querySelector('.panelTitle');
        const contentBlock = document.querySelector('.cotent-block');
        const panelWrap = document.querySelector('.panelWrap');
        const panels = gsap.utils.toArray('.panel');
        const fadeOverlay = document.querySelector('.fadeOverlay');
        const pinnedSection = document.querySelector('.pinned__canvas');

        gsap.set(panelTitle, { opacity: 0, scale: 1.3, transformOrigin: 'center center' });
        gsap.set(fadeOverlay, { opacity: 0 });

        const sequenceEnd = 0.9;
        const scaleEnd = 0.98;

        const overlayTl = gsap.timeline({ paused: true })
            .to(fadeOverlay, { opacity: 1, duration: 0.6, ease: 'power1.out' });

        let overlayShown = false;

    const updateSequenceAndTitle = (progress) => {
        const seqProgress = Math.min(progress / sequenceEnd, 1);
        videoFrames.frame = Math.round(seqProgress * (frameCount - 1));
        render();

        if (progress >= sequenceEnd && !overlayShown) {
            overlayShown = true;
            overlayTl.play();
        } else if (progress < sequenceEnd && overlayShown) {
            overlayShown = false;
            overlayTl.reverse();
            gsap.set(panelTitle, { opacity: 0, scale: 1.3 });
        }

        if (progress > sequenceEnd) {
            const p = gsap.utils.clamp(0, 1, (progress - sequenceEnd) / (scaleEnd - sequenceEnd));
            gsap.set(panelTitle, { opacity: p, scale: 1.3 - 0.3 * p });
        }
    };

    gsap.matchMedia().add(
        { isMobile: "(max-width: 767px)", isDesktop: "(min-width: 768px)" },
        (context) => {
            if (context.conditions.isMobile) {
                gsap.set(panelWrap, { x: 0 });
                gsap.set(panels, { opacity: 0 }); // hidden until title reveal completes

                const sequencePortion = window.innerHeight * 2.5;
                const scrollDistance = () => panelWrap.scrollWidth - contentBlock.offsetWidth;
                const totalDistance = () => sequencePortion + scrollDistance() + window.innerHeight;
                const seqFraction = () => sequencePortion / totalDistance();

                let panelsRevealed = false;

                const st = ScrollTrigger.create({
                    trigger: ".landing_main",
                    start: "bottom top",
                    end: () => `+=${totalDistance()}`,
                    pin: pinnedSection,
                    scrub: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const progress = self.progress;
                        const fraction = seqFraction();

                        if (progress <= fraction) {
                            updateSequenceAndTitle(progress / fraction);
                            gsap.set(panelWrap, { x: 0 });

                            if (panelsRevealed) {
                                panelsRevealed = false;
                                gsap.to(panels, { opacity: 0, duration: 0.3, overwrite: 'auto' });
                            }
                        } else {
                            updateSequenceAndTitle(1);

                            if (!panelsRevealed) {
                                panelsRevealed = true;
                                gsap.to(panels, { opacity: 1, duration: 0.4, ease: 'power1.out', overwrite: 'auto' });
                            }

                            const hProgress = (progress - fraction) / (1 - fraction);
                            gsap.set(panelWrap, { x: -scrollDistance() * hProgress });
                        }
                    }
                });
                return () => st.kill();
            }

            // Desktop: sequence + title runs unpinned, panels fade in independently
            const sequenceST = ScrollTrigger.create({
                trigger: ".landing_main",
                start: "bottom top",
                end: `+=${window.innerHeight * 2.5}`,
                scrub: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => updateSequenceAndTitle(self.progress)
            });

            gsap.set(panels, { opacity: 0, scale: 0.95 });
            panels.forEach((panel) => {
                gsap.to(panel, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    ease: 'power1.out',
                    scrollTrigger: {
                        trigger: panel,
                        start: "top 60%",
                        toggleActions: "play none none reverse"
                    }
                });
            });

            return () => {
                sequenceST.kill();
                ScrollTrigger.getAll()
                    .filter(st => panels.includes(st.trigger))
                    .forEach(st => st.kill());
            };
        }
    );
};

    window.addEventListener("resize", () => {
        setCanvasSize();
        render();
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