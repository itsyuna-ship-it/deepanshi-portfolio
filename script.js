const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const editorialMenu = document.querySelector(".editorial-menu");
const menuClose = document.querySelector(".menu-close");
const progressBar = document.querySelector("#scroll-progress-bar");
const year = document.querySelector("#year");
const backToTop = document.querySelector(".back-to-top");
const toast = document.querySelector(".toast");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (year) {
  year.textContent = new Date().getFullYear();
}

const setMenuState = (isOpen) => {
  if (!menuButton || !editorialMenu) return;
  menuButton.setAttribute("aria-expanded", String(isOpen));
  editorialMenu.setAttribute("aria-hidden", String(!isOpen));
  editorialMenu.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  if (isOpen) menuClose?.focus();
};

if (menuButton && editorialMenu) {
  const focusableMenuItems = Array.from(
    editorialMenu.querySelectorAll('a[href], button:not([disabled])'),
  );

  menuButton.addEventListener("click", () => setMenuState(true));
  menuClose?.addEventListener("click", () => {
    setMenuState(false);
    menuButton.focus();
  });

  editorialMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && editorialMenu.classList.contains("is-open")) {
      setMenuState(false);
      menuButton.focus();
    }

    if (event.key === "Tab" && editorialMenu.classList.contains("is-open")) {
      const firstItem = focusableMenuItems[0];
      const lastItem = focusableMenuItems[focusableMenuItems.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem?.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem?.focus();
      }
    }
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = targetId === "#top"
      ? document.querySelector("#top")
      : document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });

    target.classList.remove("section-spotlight");
    window.requestAnimationFrame(() => target.classList.add("section-spotlight"));
    window.setTimeout(() => target.classList.remove("section-spotlight"), 950);
  });
});

document.querySelectorAll(".project-card__toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".project-card");
    const details = button.nextElementSibling;
    const isOpen = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!isOpen));
    card?.classList.toggle("is-open", !isOpen);

    if (details) {
      details.hidden = isOpen;
    }
  });
});

document.querySelectorAll(".highlight").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".highlight[open]").forEach((otherItem) => {
      if (otherItem !== item) otherItem.removeAttribute("open");
    });
  });
});

let toastTimer;
const showToast = (message) => {
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3200);
};

document.querySelectorAll("[data-toast]").forEach((button) => {
  button.addEventListener("click", () => {
    showToast(button.dataset.toast);
  });
});

let scrollFrame;
const updateProgress = () => {
  if (!progressBar) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${Math.min(progress, 100)}%`;
  backToTop?.classList.toggle("is-visible", window.scrollY > 700);
};

window.addEventListener("scroll", () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    updateProgress();
    scrollFrame = null;
  });
}, { passive: true });
updateProgress();

backToTop?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: reducedMotion ? "auto" : "smooth",
  });
});

const revealItems = document.querySelectorAll(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries, revealObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  revealItems.forEach((item) => observer.observe(item));
}

const sectionLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
const observedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) return;

      sectionLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${visibleEntry.target.id}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },
    {
      rootMargin: "-25% 0px -55% 0px",
      threshold: [0, 0.2, 0.5],
    },
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

const poster = document.querySelector(".hero__poster");

if (poster && !reducedMotion && window.matchMedia("(pointer: fine)").matches) {
  poster.addEventListener("pointermove", (event) => {
    const bounds = poster.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    poster.style.transform = `rotate(1.5deg) perspective(900px) rotateY(${x * 4}deg) rotateX(${y * -4}deg)`;
  });

  poster.addEventListener("pointerleave", () => {
    poster.style.transform = "rotate(1.5deg)";
  });
}
