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

gsap.fromTo('.layer-fence',
  { y: '100vh' },
  { y: '65vh', ease: 'none', scrollTrigger: trigger }
);

// Section parallax — each content section drifts up slightly as it scrolls through
['#services', '#about', '#contact'].forEach(id => {
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
