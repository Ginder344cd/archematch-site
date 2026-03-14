/**
 * ArcheMatch Inc. — Shared JS
 * Mobile navigation, scroll animations, white paper form handler
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Mobile Navigation Toggle ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Scroll-based Fade-in Animations ---
  const animatedElements = document.querySelectorAll('[data-animate]');

  if ('IntersectionObserver' in window) {
    const observerOptions = { threshold: 0.05, rootMargin: '0px 0px 50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => {
      el.classList.add('transition-all', 'duration-1000', 'opacity-0', 'translate-y-10');
      observer.observe(el);
    });

    // Safety fallback: reveal all animated elements after 3s in case observer fails
    setTimeout(() => {
      animatedElements.forEach(el => {
        if (el.classList.contains('opacity-0')) {
          el.classList.add('opacity-100', 'translate-y-0');
          el.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, 3000);
  }
  // If IntersectionObserver not supported, elements remain fully visible (no opacity-0 added)

  // --- White Paper Download Form ---
  const downloadForm = document.getElementById('downloadForm');
  const formContainer = document.getElementById('formContainer');
  const successContainer = document.getElementById('successContainer');

  if (downloadForm && formContainer && successContainer) {
    downloadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company').value,
        role: document.getElementById('role').value,
        downloadedAt: new Date().toISOString(),
        source: 'white-paper-psychology-alignment'
      };

      const leads = JSON.parse(localStorage.getItem('whitePaperLeads') || '[]');
      leads.push(formData);
      localStorage.setItem('whitePaperLeads', JSON.stringify(leads));

      formContainer.classList.add('hidden');
      successContainer.classList.remove('hidden');
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
