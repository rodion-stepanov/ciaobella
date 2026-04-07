/**
 * animations.js — Привет, Белла!
 * Модуль с 15 интерактивными эффектами и анимациями.
 * Подключается из script.js после инициализации основных компонентов.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. SVG-линии, рисующиеся при скролле
//    Декоративные волнистые разделители между секциями
// ==========================================
export function initSvgDrawLines() {
  const svgDividers = document.querySelectorAll(".svg-divider path");
  if (!svgDividers.length) return;

  svgDividers.forEach((path) => {
    const length = path.getTotalLength();

    // Начальное состояние — путь скрыт
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    gsap.to(path, {
      strokeDashoffset: 0,
      scrollTrigger: {
        trigger: path.closest(".svg-divider"),
        start: "top 90%",
        end: "top 30%",
        scrub: 1,
        invalidateOnRefresh: true,
      },
      ease: "none",
    });
  });
}

// ==========================================
// 2. Reveal-анимации заголовков секций
//    Clip-mask reveal снизу + подчёркивание
// ==========================================
export function initRevealHeadings() {
  const headings = document.querySelectorAll(
    ".section-heading, #advantages h2, #faq h2, #contact h2",
  );
  if (!headings.length) return;

  // Рекурсивная обёртка текстовых узлов в reveal-span'ы
  function wrapTextNodes(node) {
    const children = Array.from(node.childNodes);
    children.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent;
        if (!text.trim()) return;
        const words = text.split(/(\s+)/);
        const fragment = document.createDocumentFragment();
        words.forEach((word) => {
          if (word.trim() === "") {
            fragment.appendChild(document.createTextNode(word));
            return;
          }
          const outer = document.createElement("span");
          outer.className = "reveal-word";
          const inner = document.createElement("span");
          inner.style.display = "inline-block";
          inner.style.transform = "translateY(100%)";
          inner.textContent = word;
          outer.appendChild(inner);
          fragment.appendChild(outer);
        });
        child.replaceWith(fragment);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        wrapTextNodes(child);
      }
    });
  }

  headings.forEach((heading) => {
    wrapTextNodes(heading);

    const innerSpans = heading.querySelectorAll(".reveal-word > span");

    gsap.to(innerSpans, {
      y: 0,
      duration: 0.7,
      stagger: 0.05,
      ease: "power3.out",
      scrollTrigger: {
        trigger: heading,
        start: "top 85%",
        once: true,
      },
    });
  });
}

// ==========================================
// 4. Магнитные кнопки (Magnetic Buttons)
//    CTA кнопки притягиваются к курсору
// ==========================================
export function initMagneticButtons() {
  const buttons = document.querySelectorAll(
    ".btn-primary, .btn-secondary, .floating-contact-btn, .magnetic-btn",
  );
  if (!buttons.length) return;

  // Только для десктопа
  if (window.matchMedia("(hover: hover)").matches === false) return;

  buttons.forEach((btn) => {
    const xTo = gsap.quickTo(btn, "x", {
      duration: 0.4,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(btn, "y", {
      duration: 0.4,
      ease: "power3.out",
    });

    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      xTo(x * 0.3);
      yTo(y * 0.3);
    });

    btn.addEventListener("mouseleave", () => {
      xTo(0);
      yTo(0);
    });
  });
}

// ==========================================
// 6. Stagger-появление карточек курсов
//    Каскадное появление pricing-card
// ==========================================
export function initCourseStagger() {
  const courseCards = document.querySelectorAll(".pricing-card");
  if (!courseCards.length) return;

  gsap.set(courseCards, { opacity: 0, y: 50 });
  courseCards.forEach((el) => (el.style.transition = "none"));

  ScrollTrigger.batch(courseCards, {
    start: "top 90%",
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        { y: 50, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          onComplete: () => {
            batch.forEach((el) => {
              gsap.set(el, { clearProps: "transform,opacity" });
              el.style.transition = "";
            });
          },
        },
      );
    },
    once: true,
  });
}

// ==========================================
// 7. Улучшенные счётчики (slot-machine)
//    Поддерживает три типа:
//    - data-slot-type="level": A0 → C2 (буква+цифра)
//    - data-start-year="YYYY": автовычисление лет
//    - обычный: прокрутка цифр
// ==========================================

// Хранилище данных для анимации
let slotDigitData = [];

// Вспомогательная: создаёт колонку с прокруткой символов
function createSlotColumn(items, wrapper, targetIndex) {
  const col = document.createElement("span");
  col.className = "slot-digit-col";
  col.style.cssText = "display:inline-block;line-height:1.2em;";

  let html = "";
  items.forEach((item) => {
    html += `<span style="display:block;height:1.2em;line-height:1.2em">${item}</span>`;
  });
  col.innerHTML = html;
  col.style.transform = "translateY(0)";
  wrapper.appendChild(col);

  return { col, steps: targetIndex };
}

// Подготовка DOM
export function prepareSlotCounters() {
  slotDigitData = [];
  const stats = document.querySelectorAll(".stat-glass__value");
  if (!stats.length) return;

  stats.forEach((stat) => {
    const slotType = stat.dataset.slotType;
    const startYear = stat.dataset.startYear;

    const wrapper = document.createElement("span");
    wrapper.className = "slot-counter-wrap";
    wrapper.style.cssText =
      "display:inline-flex;overflow:hidden;height:1.2em;vertical-align:bottom;";

    // Тип 1: Уровень языка (A0 → C2)
    if (slotType === "level") {
      const letters = ["A", "B", "C"];
      const digits = [0, 1, 2];

      // Колонка букв: A → B → C
      const letterData = createSlotColumn(letters, wrapper, 2);
      // Колонка цифр: 0 → 1 → 2
      const digitData = createSlotColumn(digits, wrapper, 2);

      stat.textContent = "";
      stat.appendChild(wrapper);

      slotDigitData.push(letterData, digitData);
      return;
    }

    // Автовычисление лет по году основания
    let originalText = stat.textContent.trim();
    if (startYear) {
      const years = new Date().getFullYear() - parseInt(startYear, 10);
      const suffix = originalText.replace(/^\d+/, "");
      originalText = years + suffix;
      stat.textContent = originalText;
    }

    // Тип 2/3: Обычные числовые счётчики
    const match = originalText.match(/^(\d+)/);
    if (!match) return;

    const targetNum = parseInt(match[1], 10);
    const suffix = originalText.replace(/^\d+/, "");

    const digitChars = String(targetNum).split("");
    digitChars.forEach((d) => {
      const target = parseInt(d, 10);
      const items = [];
      for (let i = 0; i <= target; i++) items.push(i);
      const data = createSlotColumn(items, wrapper, target);
      slotDigitData.push(data);
    });

    const suffixSpan = document.createElement("span");
    suffixSpan.textContent = suffix;
    stat.textContent = "";
    stat.appendChild(wrapper);
    stat.appendChild(suffixSpan);
  });

  // Запуск анимации цифр с задержкой,
  // чтобы stat-glass успел появиться через hero timeline (~2с)
  gsap.delayedCall(2.5, animateSlotCounters);
}

// Запуск анимации
export function animateSlotCounters() {
  slotDigitData.forEach(({ col, steps }, idx) => {
    gsap.to(col, {
      y: -steps * 1.2 + "em",
      duration: 1.2 + idx * 0.12,
      ease: "power2.out",
      delay: idx * 0.08,
    });
  });
}

// ==========================================
// 8. Glow-эффект при наведении
//    Свечение, следующее за курсором
// ==========================================
export function initGlowEffect() {
  const elements = document.querySelectorAll(
    ".advantage-card, .pricing-card, .glow-card",
  );
  if (!elements.length) return;

  // Только для десктопа
  if (window.matchMedia("(hover: hover)").matches === false) return;

  elements.forEach((el) => {
    // Добавляем overlay для свечения
    const glow = document.createElement("div");
    glow.className = "glow-overlay";
    el.style.position = "relative";
    el.style.overflow = "hidden";
    el.appendChild(glow);

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.setProperty("--glow-x", x + "px");
      glow.style.setProperty("--glow-y", y + "px");
      glow.style.opacity = "1";
    });

    el.addEventListener("mouseleave", () => {
      glow.style.opacity = "0";
    });
  });
}

// ==========================================
// 9. Scroll-progress индикатор
//    Тонкая полоска прогресса вверху страницы
// ==========================================
export function initScrollProgress() {
  // Создаём элемент прогресса
  const progress = document.createElement("div");
  progress.className = "scroll-progress-bar";
  document.body.appendChild(progress);

  gsap.to(progress, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.3,
    },
  });
}

// ==========================================
// 10. Улучшенный FAQ аккордеон (GSAP)
//     Плавное раскрытие с GSAP height:auto
// ==========================================
export function initEnhancedFaq() {
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const toggle = item.querySelector(".faq-toggle");
    const content = item.querySelector(".faq-content");
    const icon = item.querySelector(".faq-icon");
    if (!toggle || !content) return;

    // Сбрасываем CSS-анимацию, чтобы GSAP управлял полностью
    content.style.maxHeight = "none";
    content.style.transition = "none";
    content.style.overflow = "hidden";
    content.style.display = "block";
    content.style.visibility = "visible";
    content.classList.remove("hidden");

    // Начальное состояние — контент скрыт через height: 0
    // Padding НЕ анимируем — overflow: hidden скрывает его при height: 0
    if (!item.classList.contains("active")) {
      gsap.set(content, { height: 0, opacity: 0 });
    } else {
      gsap.set(content, { height: "auto", opacity: 1 });
    }

    // Переопределяем toggle, чтобы убрать старые обработчики
    toggle.replaceWith(toggle.cloneNode(true));
    const newToggle = item.querySelector(".faq-toggle");

    newToggle.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      if (isActive) {
        // Закрытие
        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.35,
          ease: "power2.inOut",
        });
        if (icon) {
          gsap.to(icon, {
            rotation: 0,
            duration: 0.3,
            ease: "power2.inOut",
          });
        }
        item.classList.remove("active");
      } else {
        // Открытие
        gsap.fromTo(
          content,
          { height: 0, opacity: 0 },
          {
            height: "auto",
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            // После анимации сбрасываем inline height,
            // чтобы элемент сам занимал нужную высоту
            onComplete: () => {
              gsap.set(content, { clearProps: "height" });
            },
          },
        );
        if (icon) {
          gsap.to(icon, {
            rotation: 180,
            duration: 0.3,
            ease: "power2.inOut",
          });
        }
        item.classList.add("active");
      }
    });
  });
}

// ==========================================
// 15. Floating Particles
//     Полупрозрачные частицы на фоне hero
// ==========================================
export function initFloatingParticles() {
  const hero = document.getElementById("hero");
  if (!hero) return;

  const canvas = document.createElement("canvas");
  canvas.className = "particles-canvas";
  hero.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let particles = [];
  let animId;

  const resize = () => {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  };

  const createParticles = () => {
    particles = [];
    const count = Math.min(
      40,
      Math.floor((canvas.width * canvas.height) / 25000),
    );
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.3 - 0.1,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Получаем цвет из CSS темы
    const style = getComputedStyle(document.documentElement);
    const color =
      style.getPropertyValue("--color-terracotta").trim() || "#C47A6A";

    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = color
        .replace(")", `, ${p.opacity})`)
        .replace("rgb", "rgba");

      // Фоллбек для HEX цветов
      if (!ctx.fillStyle.includes("rgba")) {
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = color;
      }

      ctx.fill();
      ctx.globalAlpha = 1;

      p.x += p.dx;
      p.y += p.dy;

      // Wrap around
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;
    });

    animId = requestAnimationFrame(draw);
  };

  resize();
  createParticles();
  draw();

  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });

  // Остановка анимации при невидимости
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!animId) draw();
      } else {
        cancelAnimationFrame(animId);
        animId = null;
      }
    },
    { threshold: 0.1 },
  );
  observer.observe(hero);
}

// ==========================================
// 16. Интерактивная маска на hero-icon
//     SVG-иконка реагирует на движение мыши
// ==========================================
export function initInteractiveMask() {
  const heroIcon = document.querySelector(".hero-icon");
  if (!heroIcon) return;

  const hero = document.querySelector("#hero");
  if (!hero) return;

  // Заметный эффект: rotation ±15°, сдвиг ±30px, подъём
  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    // Нормализуем координаты от -1 до 1
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    gsap.to(heroIcon, {
      rotateZ: x * 15,
      rotateX: -y * 10,
      x: x * 30,
      y: y * 20 - 5,
      scale: 1.05,
      duration: 0.6,
      ease: "power2.out",
    });
  });

  hero.addEventListener("mouseleave", () => {
    gsap.to(heroIcon, {
      rotateZ: 0,
      rotateX: 0,
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: "elastic.out(1, 0.5)",
    });
  });
}

// ==========================================
// 17. Параллакс секций
//     Элементы двигаются с разной скоростью
// ==========================================
export function initParallaxLayers() {
  // Параллакс фото «О себе» — сдвиг вверх при скролле
  const aboutImage = document.querySelector(".about-image");
  if (aboutImage) {
    gsap.to(aboutImage, {
      scrollTrigger: {
        trigger: "#about",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
      },
      y: -80,
      ease: "none",
    });
  }

  // Параллакс бейджей about-секции (разная скорость)
  const badges = document.querySelectorAll(
    "#about [class*='absolute'][class*='lg:block']",
  );
  badges.forEach((badge, i) => {
    gsap.to(badge, {
      scrollTrigger: {
        trigger: "#about",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
      y: i % 2 === 0 ? -60 : -100,
      ease: "none",
    });
  });

  // Параллакс иконок в advantage-card
  const advIcons = document.querySelectorAll(".advantage-card .w-16");
  advIcons.forEach((icon) => {
    gsap.to(icon, {
      scrollTrigger: {
        trigger: icon,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
      y: -30,
      rotate: 5,
      ease: "none",
    });
  });

  // Параллакс hero stat-glass — разноскоростной сдвиг
  const statCards = document.querySelectorAll(".stat-glass");
  statCards.forEach((card, i) => {
    gsap.to(card, {
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
      y: -(40 + i * 20),
      ease: "none",
    });
  });

  // Параллакс courses — декоративный градиент
  const coursesGradient = document.querySelector("#courses .bg-gradient-to-r");
  if (coursesGradient) {
    gsap.to(coursesGradient, {
      scrollTrigger: {
        trigger: "#courses",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
      y: -50,
      ease: "none",
    });
  }

  // Параллакс courses — иконки категорий
  const categoryIcons = document.querySelectorAll(".course-category__icon");
  categoryIcons.forEach((icon) => {
    gsap.to(icon, {
      scrollTrigger: {
        trigger: icon,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
      },
      y: -20,
      rotate: -5,
      ease: "none",
    });
  });

  // Параллакс reviews — фоновые блюр-шары
  const reviewBlurs = document.querySelectorAll("#reviews .blur-3xl");
  reviewBlurs.forEach((blur, i) => {
    gsap.to(blur, {
      scrollTrigger: {
        trigger: "#reviews",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
      y: i % 2 === 0 ? -70 : 60,
      ease: "none",
    });
  });

  // Параллакс contact — декоративные mesh-блюры
  const contactBlurs = document.querySelectorAll("#contact .blur-3xl");
  contactBlurs.forEach((blur, i) => {
    gsap.to(blur, {
      scrollTrigger: {
        trigger: "#contact",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
      y: i === 0 ? -60 : i === 1 ? 50 : -40,
      ease: "none",
    });
  });

  // Параллакс contact — иконки контактных карточек
  const contactIcons = document.querySelectorAll(".contact-card__icon");
  contactIcons.forEach((icon) => {
    gsap.to(icon, {
      scrollTrigger: {
        trigger: icon,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
      },
      y: -15,
      ease: "none",
    });
  });

  // Параллакс FAQ — иконки вопросов
  const faqIcons = document.querySelectorAll(".faq-icon");
  faqIcons.forEach((icon) => {
    gsap.to(icon, {
      scrollTrigger: {
        trigger: icon.closest(".faq-item"),
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
      y: -10,
      ease: "none",
    });
  });
}

// ==========================================
// Экспорт функции инициализации всех эффектов
// ==========================================
export function initAllAnimations() {
  initSvgDrawLines();
  initRevealHeadings();
  initMagneticButtons();
  initCourseStagger();
  prepareSlotCounters();
  initGlowEffect();
  initScrollProgress();
  initEnhancedFaq();
  initFloatingParticles();
  initInteractiveMask();
  initParallaxLayers();
}
