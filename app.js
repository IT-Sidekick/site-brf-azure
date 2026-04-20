gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const trigger = {
  trigger: document.body,
  start: 'top top',
  end: 'bottom bottom',
  scrub: 1.5
};

gsap.to('.layer-sky',         { y: '-15vh',  ease: 'none', scrollTrigger: trigger });
gsap.to('.layer-trees-back',  { y: '-60vh',  ease: 'none', scrollTrigger: trigger });
gsap.to('.layer-trees-front', { y: '-110vh', ease: 'none', scrollTrigger: trigger });

// Fence: set initial position immediately so only tips are visible from page load.
// gsap.set() applies synchronously — no waiting for a trigger.
gsap.set('.layer-fence', { y: '96.5vh' });

// Grow fence to full height as the contact section comes into view.
// end: 'bottom bottom' = when contact's bottom edge hits the viewport bottom — always reachable.
// 'bottom 80%' was never reached because the contact section (with 32vh padding) is too tall.
gsap.to('.layer-fence', {
  y: '65vh',
  ease: 'none',
  scrollTrigger: {
    trigger: '#contact',
    start: 'top 55%',
    end: 'bottom bottom',
    scrub: 1.5
  }
});

// Services and About drift up as they enter the viewport
['#services', '#about'].forEach(id => {
  gsap.fromTo(id,
    { y: 50 },
    {
      y: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: id,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2
      }
    }
  );
});

// Contact rests with form content above the fence (padding-bottom handles clearance)
gsap.fromTo('#contact',
  { y: 50 },
  {
    y: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '#contact',
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: 2
    }
  }
);
