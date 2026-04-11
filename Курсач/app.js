(function () {
  "use strict";

  var STORAGE_KEY = "kursovaya_form_v1";
  var LAZY_KEY = "kursovaya_lazy_loaded_v1";

  var bgVideo = document.getElementById("bgVideo");
  var cursorGlow = document.getElementById("cursor-glow");
  var pageLoader = document.getElementById("page-loader");
  var mainContent = document.getElementById("mainContent");
  var siteHeader = document.getElementById("siteHeader");
  var scrollHint = document.getElementById("scrollHint");
  var form = document.getElementById("mainForm");
  var formPercent = document.getElementById("formPercent");
  var formProgressBar = document.getElementById("formProgressBar");
  var btnClearStorage = document.getElementById("btnClearStorage");
  var btnRiotDemo = document.getElementById("btnRiotDemo");
  var btnGenerate = document.getElementById("btnGenerate");
  var genOutput = document.getElementById("genOutput");
  var modalBackdrop = document.getElementById("modalBackdrop");
  var modalInfo = document.getElementById("modalInfo");
  var modalHelp = document.getElementById("modalHelp");
  var modalForm = document.getElementById("modalForm");
  var modalLogin = document.getElementById("modalLogin");
  var lazyRoot = document.querySelector("[data-lazy-root]");
  var lazyPlaceholder = document.getElementById("lazyPlaceholder");
  var lazyContent = document.getElementById("lazyContent");

  function setCssVar(el, name, xPx, yPx) {
    if (!el) return;
    el.style.setProperty(name + "x", xPx + "px");
    el.style.setProperty(name + "y", yPx + "px");
  }

  document.addEventListener(
    "mousemove",
    function (e) {
      setCssVar(cursorGlow, "--m", e.clientX, e.clientY);
    },
    { passive: true }
  );

  var scrollTick = false;
  function onScroll() {
    if (!scrollTick) {
      window.requestAnimationFrame(function () {
        var y = window.scrollY || document.documentElement.scrollTop;
        if (siteHeader) {
          siteHeader.classList.toggle("is-scrolled", y > 24);
        }
        if (scrollHint) {
          scrollHint.textContent = "Прокрутка: " + Math.round(y) + " px";
          scrollHint.classList.add("is-visible");
        }
        scrollTick = false;
      });
      scrollTick = true;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  var scrollHintTimer;
  window.addEventListener(
    "scroll",
    function () {
      if (!scrollHint) return;
      clearTimeout(scrollHintTimer);
      scrollHintTimer = setTimeout(function () {
        scrollHint.classList.remove("is-visible");
      }, 800);
    },
    { passive: true }
  );

  function getPersistMap() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function savePersistMap(map) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch (_) {}
  }

  function loadFormFromStorage() {
    if (!form) return;
    var map = getPersistMap();
    form.querySelectorAll("[data-persist]").forEach(function (el) {
      var id = el.id;
      if (!id || map[id] === undefined) return;
      if (el.type === "checkbox") {
        el.checked = !!map[id];
      } else {
        el.value = map[id];
      }
    });
    updateFormProgress();
  }

  function persistField(el) {
    if (!el || !el.id) return;
    var map = getPersistMap();
    if (el.type === "checkbox") {
      map[el.id] = el.checked;
    } else {
      map[el.id] = el.value;
    }
    savePersistMap(map);
  }

  if (form) {
    form.querySelectorAll("[data-persist]").forEach(function (el) {
      el.addEventListener("input", function () {
        persistField(el);
        updateFormProgress();
      });
      el.addEventListener("change", function () {
        persistField(el);
        updateFormProgress();
      });
    });
  }

  function updateFormProgress() {
    if (!formPercent || !formProgressBar) return;
    var fields = [
      { id: "fieldName", type: "text" },
      { id: "fieldEmail", type: "text" },
      { id: "fieldMessage", type: "text" },
      { id: "fieldAgree", type: "check" },
    ];
    var done = 0;
    fields.forEach(function (f) {
      var el = document.getElementById(f.id);
      if (!el) return;
      if (f.type === "check") {
        if (el.checked) done++;
      } else {
        if (el.value && String(el.value).trim().length > 0) done++;
      }
    });
    var pct = Math.round((done / fields.length) * 100);
    formPercent.textContent = String(pct);
    formProgressBar.style.width = pct + "%";
  }

  if (btnClearStorage && form) {
    btnClearStorage.addEventListener("click", function () {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (_) {}
      form.reset();
      updateFormProgress();
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      ["fieldName", "fieldEmail", "fieldMessage", "fieldAgree"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) persistField(el);
      });
      updateFormProgress();
    });
  }

  var openModalEl = null;

  function openModal(dialog) {
    if (!dialog) return;
    if (openModalEl && openModalEl !== dialog) {
      openModalEl.close();
    }
    openModalEl = dialog;
    modalBackdrop.hidden = false;
    dialog.showModal();
  }

  function closeModal() {
    if (openModalEl) {
      openModalEl.close();
      openModalEl = null;
    }
    modalBackdrop.hidden = true;
  }

  document.querySelectorAll("[data-open-modal]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-open-modal");
      if (id === "info") openModal(modalInfo);
      else if (id === "help") openModal(modalHelp);
      else if (id === "form") openModal(modalForm);
      else if (id === "login") openModal(modalLogin);
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach(function (btn) {
    btn.addEventListener("click", closeModal);
  });

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", closeModal);
  }

  function wireModalCancel(dialog) {
    if (!dialog) return;
    dialog.addEventListener("cancel", function (e) {
      e.preventDefault();
      closeModal();
    });
  }

  wireModalCancel(modalInfo);
  wireModalCancel(modalHelp);
  wireModalCancel(modalForm);
  wireModalCancel(modalLogin);

  if (btnRiotDemo) {
    btnRiotDemo.addEventListener("click", function () {
      openModal(modalLogin);
    });
  }

  function syncVideoWithVisibility() {
    if (!bgVideo) return;
    if (document.hidden) {
      bgVideo.pause();
    } else {
      var p = bgVideo.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    }
  }

  document.addEventListener("visibilitychange", syncVideoWithVisibility);

  function finishLoader() {
    pageLoader.classList.add("is-done");
    pageLoader.setAttribute("aria-busy", "false");
    mainContent.hidden = false;
  }

  window.addEventListener("load", function () {
    setTimeout(finishLoader, 900);
  });

  function injectLazySection() {
    if (!lazyContent || !lazyPlaceholder) return;
    lazyPlaceholder.hidden = true;
    lazyContent.hidden = false;
    lazyContent.innerHTML =
      "<p>Блок подгружен через <code>IntersectionObserver</code> при появлении в зоне видимости.</p>" +
      "<p>Флаг в <code>sessionStorage</code> сохраняет состояние до закрытия браузера.</p>";
    try {
      sessionStorage.setItem(LAZY_KEY, "1");
    } catch (_) {}
  }

  if (lazyRoot && lazyContent) {
    try {
      if (sessionStorage.getItem(LAZY_KEY) === "1") {
        injectLazySection();
      }
    } catch (_) {}

    if (!lazyContent.innerHTML.trim()) {
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              injectLazySection();
              obs.disconnect();
            }
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
      );
      obs.observe(lazyRoot);
    }
  }

  var lazyImages = document.querySelectorAll("img.lazy-img[data-src]");
  var imgObs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var img = entry.target;
        var src = img.getAttribute("data-src");
        if (src) {
          img.src = src;
          img.removeAttribute("data-src");
        }
        imgObs.unobserve(img);
      });
    },
    { rootMargin: "80px", threshold: 0.01 }
  );
  lazyImages.forEach(function (img) {
    imgObs.observe(img);
  });

  var snippets = [
    "Случайный абзац: матчмейкинг и кастомные матчи доступны после регистрации.",
    "Генерация: данные формы хранятся в localStorage браузера.",
    "Видео на фоне ставится на паузу, когда вкладка неактивна.",
  ];

  function generateParagraph() {
    if (!genOutput) return;
    var i = Math.floor(Math.random() * snippets.length);
    var p = document.createElement("p");
    p.textContent = snippets[i] + " (" + new Date().toLocaleTimeString("ru-RU") + ")";
    genOutput.appendChild(p);
  }

  if (btnGenerate) {
    btnGenerate.addEventListener("click", generateParagraph);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
      return;
    }
    if (e.key === "F1") {
      e.preventDefault();
      openModal(modalHelp);
      return;
    }
    if (e.ctrlKey && !e.shiftKey && (e.key === "i" || e.key === "I" || e.code === "KeyI")) {
      e.preventDefault();
      openModal(modalInfo);
      return;
    }
    if (e.ctrlKey && e.shiftKey && (e.key === "f" || e.key === "F" || e.code === "KeyF")) {
      e.preventDefault();
      openModal(modalForm);
      return;
    }
    if (e.ctrlKey && !e.shiftKey && (e.key === "g" || e.key === "G" || e.code === "KeyG")) {
      e.preventDefault();
      generateParagraph();
      return;
    }
  });

  loadFormFromStorage();
  syncVideoWithVisibility();
})();
