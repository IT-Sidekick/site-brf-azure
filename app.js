(function () {
  var footer = document.getElementById('footer');
  var treesBack  = footer.querySelector('.layer-trees-back');
  var treesFront = footer.querySelector('.layer-trees-front');
  var fence      = footer.querySelector('.layer-fence');

  function getProgress() {
    var rect = footer.getBoundingClientRect();
    var wh = window.innerHeight;
    return Math.max(0, Math.min(1, (wh - rect.top) / wh));
  }

  function applyParallax() {
    var p = getProgress();
    treesBack.style.transform  = 'translateY(' + (p * -40) + 'px)';
    treesFront.style.transform = 'translateY(' + (p * -20) + 'px)';
    fence.style.transform      = 'translateY(' + ((1 - p) * 80) + 'px)';
  }

  window.addEventListener('scroll', applyParallax, { passive: true });
  applyParallax();
}());
