/**
 * BY SOLUTIONS — ENTERPRISE REDESIGN (main.js)
 * Modular Vanilla JavaScript Implementation - Final Premium Version
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* --------------------------------------------------------------------------
     1. YOUTUBE URL AUTOMATIC EMBED CONVERTER
     -------------------------------------------------------------------------- */
  const convertToEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;

    let videoId = '';
    if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('youtube.com/shorts/')[1].split('?')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('youtube.com/watch?v=')[1].split('&')[0];
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const videoIframes = document.querySelectorAll('.video-embed-container iframe');
  videoIframes.forEach(iframe => {
    const rawSrc = iframe.getAttribute('src');
    if (rawSrc) {
      iframe.setAttribute('src', convertToEmbedUrl(rawSrc));
    }
  });

  /* --------------------------------------------------------------------------
     2. STICKY NAVBAR & MOBILE DRAWER LOGIC (SINGLE SOURCE OF TRUTH)
     -------------------------------------------------------------------------- */
  const navbar = document.getElementById('main-navbar');
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sections = document.querySelectorAll('section[id]');

  /**
   * ROOT CAUSE DIAGNOSIS & PERMANENT FIX:
   * Bug 1 (Offset Calculation): Previously, `section.offsetTop` was used to calculate section boundaries.
   *   In layouts where parent elements or wrapper containers have positioning contexts (relative/absolute/sticky/transform),
   *   `offsetTop` returns offsets relative to the `offsetParent` rather than the absolute document top.
   *   This caused incorrect section bounds calculation, leading to mismatched active nav highlights (e.g. Partners active on Clients).
   *   Fix: We now calculate absolute document coordinates using `section.getBoundingClientRect().top + window.scrollY`
   *   which is 100% immune to offsetParent nesting issues.
   *
   * Bug 2 (Early Threshold Override): Hardcoded bottom edge checks (e.g. `scrollHeight - 50`) were prematurely forcing `#contact` as active.
   *   Fix: Viewport center calculation `viewportCenter = window.scrollY + (window.innerHeight / 2)` is evaluated strictly against
   *   absolute document section bounds (`top <= viewportCenter <= bottom`).
   *
   * Bug 3 (Console Logging): Added real-time console logging for every observed section (Section ID, Top, Bottom, Active Target).
   */
  const updateActiveNavigation = () => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const viewportCenter = scrollY + (viewportHeight / 2);

    // Toggle header shadow styling on scroll (visual refinement only, zero height shift)
    if (scrollY > 30) {
      navbar?.classList.add('shrunk');
    } else {
      navbar?.classList.remove('shrunk');
    }

    let activeTarget = null;

    // Evaluate absolute section bounds for every observed section on the page
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      const top = rect.top + scrollY;
      const bottom = top + rect.height;
      const navTarget = section.getAttribute('data-nav-target') || `#${section.id}`;
      const isInside = (viewportCenter >= top && viewportCenter <= bottom);

      // Console log every observed section for full debugging transparency
      console.log(`[Nav Debug] Section #${section.id} -> Target: ${navTarget} | Top: ${Math.round(top)}px, Bottom: ${Math.round(bottom)}px | ViewportCenter (${Math.round(viewportCenter)}px) Inside: ${isInside}`);

      if (isInside && !activeTarget) {
        activeTarget = navTarget;
      }
    }

    // Fallbacks for extreme top of page or absolute bottom edge
    if (!activeTarget) {
      if (scrollY < 100) {
        activeTarget = '#home';
      } else if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 20) {
        activeTarget = '#contact';
      }
    }

    console.log(`[Nav Active] Current Active Target: ${activeTarget}`);

    // Single source of truth: Update active class on all desktop and mobile nav items
    if (activeTarget) {
      navLinks.forEach(link => {
        if (link.getAttribute('href') === activeTarget) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  };

  // Run on scroll and initial load
  window.addEventListener('scroll', updateActiveNavigation, { passive: true });
  updateActiveNavigation();

  // Smooth Scroll Click Handler for Navigation Anchors
  const allNavAnchors = document.querySelectorAll('a[href^="#"]');
  allNavAnchors.forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        let targetPosition = 0;
        if (targetId !== '#home') {
          const navHeight = navbar ? navbar.offsetHeight : 74;
          const rect = targetElement.getBoundingClientRect();
          targetPosition = rect.top + window.scrollY - navHeight + 2;
        }

        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: 'smooth'
        });

        if (mobileDrawer?.classList.contains('open')) {
          mobileDrawer.classList.remove('open');
          mobileToggle?.setAttribute('aria-expanded', 'false');
          if (mobileToggle) mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
      }
    });
  });

  // Toggle mobile navigation drawer
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      } else {
        mobileDrawer.classList.add('open');
        mobileToggle.setAttribute('aria-expanded', 'true');
        mobileToggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      }
    });
  }

  /* --------------------------------------------------------------------------
     3. HERO CAROUSEL CONTROLLER
     -------------------------------------------------------------------------- */
  const heroSection = document.getElementById('hero-showcase');
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.indicator-dot');
  const prevBtn = document.getElementById('carousel-prev-btn');
  const nextBtn = document.getElementById('carousel-next-btn');

  let currentSlide = 0;
  let autoplayTimer = null;
  const AUTOPLAY_INTERVAL = 6000;

  const goToSlide = (index) => {
    if (!slides.length) return;
    slides[currentSlide].classList.remove('active');
    dots[currentSlide]?.classList.remove('active');

    currentSlide = (index + slides.length) % slides.length;

    slides[currentSlide].classList.add('active');
    dots[currentSlide]?.classList.add('active');
  };

  const nextSlide = () => goToSlide(currentSlide + 1);
  const prevSlide = () => goToSlide(currentSlide - 1);

  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, AUTOPLAY_INTERVAL);
  };

  const stopAutoplay = () => {
    if (autoplayTimer) clearInterval(autoplayTimer);
  };

  // Event Listeners for Carousel Controls
  nextBtn?.addEventListener('click', () => {
    nextSlide();
    startAutoplay();
  });

  prevBtn?.addEventListener('click', () => {
    prevSlide();
    startAutoplay();
  });

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      goToSlide(idx);
      startAutoplay();
    });
  });

  // Pause on hover
  heroSection?.addEventListener('mouseenter', stopAutoplay);
  heroSection?.addEventListener('mouseleave', startAutoplay);

  // Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    const isHeroInView = heroSection && (heroSection.getBoundingClientRect().top < window.innerHeight && heroSection.getBoundingClientRect().bottom > 0);
    if (isHeroInView) {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        startAutoplay();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        startAutoplay();
      }
    }
  });

  // Touch Swipe Gesture Support
  let touchStartX = 0;
  let touchEndX = 0;

  heroSection?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  heroSection?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  const handleSwipe = () => {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      nextSlide();
      startAutoplay();
    } else if (touchEndX > touchStartX + swipeThreshold) {
      prevSlide();
      startAutoplay();
    }
  };

  startAutoplay();

  /* --------------------------------------------------------------------------
     4. INTERSECTION OBSERVER FOR SCROLL REVEAL
     -------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.15
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is unsupported
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  /* --------------------------------------------------------------------------
     5. TRUST & IMPACT MULTI-COLOR ANIMATED COUNTERS
     -------------------------------------------------------------------------- */
  const counterElements = document.querySelectorAll('.metric-value[data-target]');

  const animateCounters = () => {
    counterElements.forEach(counter => {
      const rawTarget = counter.getAttribute('data-target');
      const target = parseFloat(rawTarget);
      const suffix = counter.getAttribute('data-suffix') || '';
      const isFloat = rawTarget.includes('.');
      const duration = 2000;
      const stepTime = 20;
      const steps = duration / stepTime;
      const increment = target / steps;

      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = (isFloat ? target.toFixed(1) : Math.round(target).toLocaleString()) + suffix;
          clearInterval(timer);
        } else {
          counter.textContent = (isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString()) + suffix;
        }
      }, stepTime);
    });
  };

  const trustSection = document.getElementById('trust-impact');
  if (trustSection && 'IntersectionObserver' in window) {
    let animated = false;
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    counterObserver.observe(trustSection);
  }

  /* --------------------------------------------------------------------------
     6. CONTACT FORM HANDLER
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById('redesign-contact-form');
  const formSuccessMsg = document.getElementById('form-success-alert');
  const formErrorMsg = document.getElementById('form-error-alert');
  const formErrorMessageText = document.getElementById('form-error-message');

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Ensure alerts are not visible simultaneously
    if (formSuccessMsg) formSuccessMsg.style.display = 'none';
    if (formErrorMsg) formErrorMsg.style.display = 'none';

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    }

    const payload = {
      fullName: document.getElementById('c-name')?.value?.trim() || '',
      companyName: document.getElementById('c-company')?.value?.trim() || '',
      email: document.getElementById('c-email')?.value?.trim() || '',
      service: document.getElementById('c-service')?.value || '',
      message: document.getElementById('c-message')?.value?.trim() || '',
      type: 'contact'
    };

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (response.status === 201 && data?.success) {
        contactForm.reset();

        if (formSuccessMsg) {
          formSuccessMsg.style.display = 'block';
          formSuccessMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

          setTimeout(() => {
            formSuccessMsg.style.display = 'none';
          }, 6000);
        }
      } else if (response.status === 400) {
        let errorText = 'Please check the form inputs and try again.';
        if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorText = data.errors.map(err => err.message).join(' ');
        } else if (data?.message) {
          errorText = data.message;
        }

        showErrorAlert(errorText);
      } else if (response.status === 429) {
        showErrorAlert('Too many submissions. Please wait a few minutes and try again.');
      } else {
        showErrorAlert("We couldn't submit your enquiry right now. Please try again later.");
      }
    } catch (networkError) {
      showErrorAlert("We couldn't submit your enquiry right now. Please try again later.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Consultation Inquiry';
      }
    }
  });

  function showErrorAlert(text) {
    if (formErrorMsg) {
      if (formErrorMessageText) {
        formErrorMessageText.textContent = text;
      }
      formErrorMsg.style.display = 'block';
      formErrorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /* --------------------------------------------------------------------------
     7. FOOTER COPYRIGHT YEAR
     -------------------------------------------------------------------------- */
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});
