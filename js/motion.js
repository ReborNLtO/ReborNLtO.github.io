(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || typeof gsap === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  function splitWords(el) {
    const text = el.textContent.trim();
    el.innerHTML = text
      .split(" ")
      .map((w) => `<span class="word">${w}</span>`)
      .join(" ");
    return el.querySelectorAll(".word");
  }

  function coverReveal() {
    const cover = document.querySelector(".hero-cover img");
    if (!cover) return;
    gsap.fromTo(
      cover,
      { scale: 1.15, opacity: 0.4 },
      { scale: 1, opacity: 1, duration: 2, ease: "power2.out" }
    );
  }

  function heroReveal() {
    const h1 = document.querySelector(".hero h1");
    if (!h1) return;
    const words = splitWords(h1);
    gsap.set(words, { opacity: 0, y: 18, filter: "blur(10px)" });
    gsap.to(words, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1,
      ease: "power3.out",
      stagger: 0.06,
      delay: 0.15,
    });

    const legacy = document.querySelector(".hero .legacy");
    if (legacy) {
      gsap.fromTo(
        legacy,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", delay: 0.7 }
      );
    }
  }

  function scrollReveals(root) {
    const scope = root || document;
    const blurred = scope.querySelectorAll('[data-reveal="blur"]');
    blurred.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 16, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        }
      );
    });

    const faded = scope.querySelectorAll('[data-reveal="fade"]');
    faded.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            once: true,
          },
        }
      );
    });
  }

  function loadSequence(root) {
    const scope = root || document;
    const header = scope.querySelector(".post-header");
    const hero = scope.querySelector(".post-hero");
    const body = scope.querySelector(".post-body");
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    if (header) {
      tl.fromTo(header, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, 0);
    }
    if (hero) {
      tl.fromTo(hero, { opacity: 0 }, { opacity: 1, duration: 0.9 }, 0.15);
      const img = hero.querySelector("[data-kenburns]");
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.12 },
          { scale: 1, duration: 2.2, ease: "power2.out", delay: 0.15 }
        );
      }
    }
    if (body) {
      tl.fromTo(body, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8 }, 0.35);
    }
  }

  coverReveal();
  heroReveal();

  document.addEventListener("content:ready", (e) => {
    const type = e.detail && e.detail.type;
    if (type === "timeline") {
      scrollReveals();
    } else if (type === "post") {
      loadSequence();
    }
    ScrollTrigger.refresh();
  });

  // static pages (sobre.html) with reveal markers already in the DOM
  document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("post-list") && !document.getElementById("post-container")) {
      scrollReveals();
    }
  });
})();
