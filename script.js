import { createIcons, icons } from "lucide";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initAllAnimations } from "./animations.js";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  suppressProviderSelectionButton();
  // Set current year
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Initialize Lucide icons
  createIcons({ icons });

  // Авто-расчёт лет (data-auto-years="2017" → «9» с текущего года)
  document.querySelectorAll("[data-auto-years]").forEach((el) => {
    const startYear = parseInt(el.dataset.autoYears, 10);
    if (!isNaN(startYear)) {
      el.textContent = new Date().getFullYear() - startYear + "+";
    }
  });

  // Модалки курсов
  initCourseModals();

  // Модалка «О себе»
  initAboutModal();

  // Lightbox для отзывов
  initReviewLightbox();

  // Кнопка «Показать ещё / Скрыть» для отзывов
  initReviewsToggle();

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });

    // Close menu on link click
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
      });
    });
  }

  // Header scroll effect
  const header = document.getElementById("header");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // FAQ Accordion — управляется через animations.js (initEnhancedFaq)

  // Contact form handling
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

      // Simulate form submission
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = "<span>Отправка...</span>";
      submitBtn.disabled = true;

      setTimeout(() => {
        // Show success message
        contactForm.innerHTML = `
                    <div class="form-success">
                        <div class="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold mb-2">Grazie!</h3>
                        <p class="opacity-90">Мы свяжемся с вами в ближайшее время</p>
                    </div>
                `;
      }, 1500);
    });
  }

  // Phone mask
  const phoneInput = document.querySelector('input[name="phone"]');

  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");

      if (value.length > 0) {
        if (value[0] === "7" || value[0] === "8") {
          value = value.substring(1);
        }

        let formatted = "+7";

        if (value.length > 0) {
          formatted += " (" + value.substring(0, 3);
        }
        if (value.length > 3) {
          formatted += ") " + value.substring(3, 6);
        }
        if (value.length > 6) {
          formatted += "-" + value.substring(6, 8);
        }
        if (value.length > 8) {
          formatted += "-" + value.substring(8, 10);
        }

        e.target.value = formatted;
      }
    });
  }

  // GSAP Animations
  // Hero section animation
  // Отключаем CSS transition на stat-glass, чтобы не конфликтовал с GSAP
  const statGlassEls = document.querySelectorAll(".stat-glass");
  statGlassEls.forEach((el) => (el.style.transition = "none"));

  const heroTimeline = gsap.timeline();

  heroTimeline
    .from(".hero-title", {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
    })
    .from(
      ".hero-subtitle",
      {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      },
      "-=0.5",
    )
    .from(
      ".hero-actions",
      {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      },
      "-=0.3",
    )
    .from(
      ".stat-glass",
      {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        onComplete: () => {
          // Восстанавливаем CSS transition после завершения анимации
          statGlassEls.forEach((el) => {
            gsap.set(el, { clearProps: "transform,opacity" });
            el.style.transition = "";
          });
        },
      },
      "-=0.2",
    );

  // Анимация секции «О себе» — fromTo чтобы элементы не оставались скрытыми
  gsap.fromTo(
    ".about-image",
    { x: -80, opacity: 0 },
    {
      scrollTrigger: {
        trigger: "#about",
        start: "top 85%",
        once: true,
      },
      x: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
    },
  );

  gsap.fromTo(
    ".about-content > *",
    { y: 40, opacity: 0 },
    {
      scrollTrigger: {
        trigger: "#about",
        start: "top 85%",
        once: true,
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
    },
  );

  // Скрыть элементы до анимации И отключить CSS transitions,
  // чтобы не было конфликта с GSAP (двойная интерполяция)
  const batchTargets = document.querySelectorAll(
    ".advantage-card, .review-screenshot, .faq-item",
  );
  gsap.set(batchTargets, { opacity: 0, y: 30 });
  batchTargets.forEach((el) => (el.style.transition = "none"));

  // Восстановить CSS transitions после завершения GSAP-анимации
  const restoreAfterGsap = (els) => {
    els.forEach((el) => {
      gsap.set(el, { clearProps: "transform,opacity" });
      el.style.transition = "";
    });
  };

  // Advantages cards animation — batch
  ScrollTrigger.batch(".advantage-card", {
    start: "top 90%",
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          onComplete: () => restoreAfterGsap(batch),
        },
      );
    },
    once: true,
  });

  // Courses cards - CSS анимация вместо GSAP (см. styles.css)

  // Reviews animation — batch
  ScrollTrigger.batch(".review-screenshot", {
    start: "top 90%",
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          onComplete: () => restoreAfterGsap(batch),
        },
      );
    },
    once: true,
  });

  // FAQ animation — batch
  ScrollTrigger.batch(".faq-item", {
    start: "top 90%",
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          onComplete: () => restoreAfterGsap(batch),
        },
      );
    },
    once: true,
  });

  // Пересчёт позиций ScrollTrigger после полной загрузки страницы
  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });

  // Contact section animation
  const contactCards = document.querySelectorAll("#contact .contact-card");
  contactCards.forEach((el) => (el.style.transition = "none"));

  gsap.from("#contact > div > div:first-child > *", {
    scrollTrigger: {
      trigger: "#contact",
      start: "top 80%",
      once: true,
    },
    x: -50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out",
  });

  gsap.from("#contact .contact-card", {
    scrollTrigger: {
      trigger: "#contact",
      start: "top 80%",
      once: true,
    },
    x: 50,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
    onComplete: () => {
      contactCards.forEach((el) => {
        gsap.set(el, { clearProps: "transform,opacity" });
        el.style.transition = "";
      });
    },
  });

  // Parallax для mesh-gradient блобов
  gsap.to(".gradient-blob", {
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
    y: 80,
    ease: "none",
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));

      if (target) {
        const headerHeight = header.offsetHeight;
        const targetPosition = target.offsetTop - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Intersection Observer for fade-in animations (fallback)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  document
    .querySelectorAll(".fade-in, .slide-in-left, .slide-in-right")
    .forEach((el) => {
      observer.observe(el);
    });

  // Инициализация всех анимаций и интерактивных эффектов
  initAllAnimations();
});

function suppressProviderSelectionButton() {
  const removeButton = () => {
    const btn = document.querySelector("provider-selection-button");
    if (!btn) return false;
    btn.remove();
    return true;
  };

  if (removeButton()) {
    return;
  }

  const observer = new MutationObserver((mutations, obs) => {
    if (removeButton()) {
      obs.disconnect();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

// ==========================================
// Модальные окна курсов
// ==========================================
function initCourseModals() {
  const courseCards = document.querySelectorAll("[data-course-id]");
  const modals = document.querySelectorAll(".course-modal");

  if (!courseCards.length || !modals.length) return;

  // Пере-инициализация Lucide-иконок внутри модалок
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Открытие модалки по клику на карточку
  courseCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Не перехватываем клики по ссылкам внутри карточки
      if (e.target.closest("a")) return;

      const courseId = card.dataset.courseId;
      const modal = document.getElementById(`modal-${courseId}`);
      if (!modal) return;

      modal.classList.add("active");

      // Пере-инициализация иконок внутри модалки
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    });
  });

  // Закрытие модалки по клику на backdrop
  modals.forEach((modal) => {
    const backdrop = modal.querySelector(".course-modal__backdrop");
    const closeBtn = modal.querySelector(".course-modal__close");

    if (backdrop) {
      backdrop.addEventListener("click", () => {
        modal.classList.remove("active");
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
      });
    }
  });

  // Закрытие по клавише Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const activeModal = document.querySelector(".course-modal.active");
      if (activeModal) {
        activeModal.classList.remove("active");
      }
    }
  });
}

// ==========================================
// Модалка «О себе» — подробная информация
// ==========================================
function initAboutModal() {
  const btn = document.getElementById("about-more-btn");
  const modal = document.getElementById("modal-about");
  if (!btn || !modal) return;

  const backdrop = modal.querySelector(".course-modal__backdrop");
  const closeBtn = modal.querySelector(".course-modal__close");

  btn.addEventListener("click", () => {
    modal.classList.add("active");
  });

  const closeModal = () => {
    modal.classList.remove("active");
  };

  if (backdrop) backdrop.addEventListener("click", closeModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
}

// ==========================================
// Lightbox для скриншотов отзывов
// ==========================================
function initReviewLightbox() {
  const lightbox = document.getElementById("review-lightbox");
  if (!lightbox) return;

  const img = lightbox.querySelector(".review-lightbox__img");
  const bgImg = lightbox.querySelector(".review-lightbox__bg");
  const backdrop = lightbox.querySelector(".review-lightbox__backdrop");
  const closeBtn = lightbox.querySelector(".review-lightbox__close");
  const prevBtn = lightbox.querySelector(".review-lightbox__nav--prev");
  const nextBtn = lightbox.querySelector(".review-lightbox__nav--next");

  const screenshots = document.querySelectorAll(".review-screenshot");
  let currentIdx = 0;

  // Собираем src изображений из карточек
  const getSources = () => {
    return Array.from(screenshots)
      .map((fig) => {
        const imgEl = fig.querySelector("img");
        return imgEl ? imgEl.src : null;
      })
      .filter(Boolean);
  };

  const openLightbox = (idx) => {
    const sources = getSources();
    if (!sources.length) return;

    currentIdx = idx;
    img.src = sources[currentIdx];
    if (bgImg) bgImg.src = sources[currentIdx];
    lightbox.classList.add("active");
    updateNav(sources);
  };

  const closeLightbox = () => {
    lightbox.classList.remove("active");
  };

  const showPrev = () => {
    const sources = getSources();
    if (!sources.length) return;
    currentIdx = (currentIdx - 1 + sources.length) % sources.length;
    img.src = sources[currentIdx];
    if (bgImg) bgImg.src = sources[currentIdx];
    updateNav(sources);
  };

  const showNext = () => {
    const sources = getSources();
    if (!sources.length) return;
    currentIdx = (currentIdx + 1) % sources.length;
    img.src = sources[currentIdx];
    if (bgImg) bgImg.src = sources[currentIdx];
    updateNav(sources);
  };

  const updateNav = (sources) => {
    if (prevBtn) prevBtn.style.display = sources.length > 1 ? "" : "none";
    if (nextBtn) nextBtn.style.display = sources.length > 1 ? "" : "none";
  };

  // Клики на скриншоты
  screenshots.forEach((fig, idx) => {
    fig.addEventListener("click", () => {
      const imgEl = fig.querySelector("img");
      if (!imgEl) return;
      openLightbox(idx);
    });
  });

  // Закрытие
  if (backdrop) backdrop.addEventListener("click", closeLightbox);
  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

  // Навигация
  if (prevBtn) prevBtn.addEventListener("click", showPrev);
  if (nextBtn) nextBtn.addEventListener("click", showNext);

  // Клавиатура
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
  });
}

// ==========================================
// Кнопка «Показать ещё / Скрыть» для отзывов
// ==========================================
function initReviewsToggle() {
  const btn = document.getElementById("reviews-toggle");
  const grid = document.querySelector(".reviews-grid");
  if (!btn || !grid) return;

  const textEl = btn.querySelector(".reviews-toggle-btn__text");
  let expanded = false;

  btn.addEventListener("click", () => {
    expanded = !expanded;

    if (expanded) {
      // Раскрыть
      grid.classList.add("reviews-grid--expanded");
      btn.classList.add("reviews-toggle-btn--expanded");
      if (textEl) textEl.textContent = "Скрыть";

      // GSAP-анимация появления скрытых карточек
      const hiddenCards = grid.querySelectorAll(
        ".review-screenshot:nth-child(n+7)",
      );
      if (hiddenCards.length) {
        gsap.fromTo(
          hiddenCards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
          },
        );
      }

      // Обновить ScrollTrigger
      ScrollTrigger.refresh();
    } else {
      // Свернуть
      grid.classList.remove("reviews-grid--expanded");
      btn.classList.remove("reviews-toggle-btn--expanded");
      if (textEl) textEl.textContent = "Показать ещё";

      // Scroll к секции отзывов
      const section = document.getElementById("reviews");
      if (section) {
        const headerH = document.getElementById("header")?.offsetHeight || 0;
        window.scrollTo({
          top: section.offsetTop - headerH,
          behavior: "smooth",
        });
      }

      ScrollTrigger.refresh();
    }
  });
}
