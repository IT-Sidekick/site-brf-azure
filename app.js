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
gsap.to('.layer-trees-mid',   { y: '-85vh',  ease: 'none', scrollTrigger: trigger });
gsap.to('.layer-trees-front', { y: '-110vh', ease: 'none', scrollTrigger: trigger });

// fromTo stores both ends in one tween so scrub reversal always rewinds correctly.
// immediateRender:true (default for fromTo) applies y:96.5vh synchronously at script load.
gsap.fromTo('.layer-fence',
  { y: '96.5vh' },
  {
    y: '65vh',
    ease: 'none',
    scrollTrigger: {
      trigger: '#contact',
      start: 'top 80%',
      end: 'bottom bottom',
      scrub: 1.5,
      invalidateOnRefresh: true
    }
  }
);

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
