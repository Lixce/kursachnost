(function () {
  "use strict";
  var imgs = document.querySelectorAll("img.lazy-img[data-src]");
  if (!("IntersectionObserver" in window)) {
    imgs.forEach(function (img) {
      var src = img.getAttribute("data-src");
      if (src) {
        img.src = src;
        img.removeAttribute("data-src");
      }
    });
    return;
  }
  var obs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var src = el.getAttribute("data-src");
        if (src) {
          el.src = src;
          el.removeAttribute("data-src");
        }
        obs.unobserve(el);
      });
    },
    { rootMargin: "60px", threshold: 0.01 }
  );
  imgs.forEach(function (img) {
    obs.observe(img);
  });
})();
