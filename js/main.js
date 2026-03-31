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

    // Safety fallback: reveal all animated elements after 1s in case observer fails (mobile)
    setTimeout(() => {
      animatedElements.forEach(el => {
        if (el.classList.contains('opacity-0')) {
          el.classList.add('opacity-100', 'translate-y-0');
          el.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, 1000);
  }
  // If IntersectionObserver not supported, elements remain fully visible (no opacity-0 added)

  // --- White Paper Download Form ---
  const downloadForm = document.getElementById('downloadForm');
  const formContainer = document.getElementById('formContainer');
  const successContainer = document.getElementById('successContainer');

  if (downloadForm && formContainer && successContainer) {
    downloadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const email = document.getElementById('email').value;
      const company = document.getElementById('company').value;
      const role = document.getElementById('role').value;

      // Send lead to both Instantly campaigns (Hunter + Gatherer)
      var leadPayload = {
        email: email,
        first_name: firstName,
        last_name: lastName,
        custom_variables: {
          company: company,
          role: role,
          form_type: 'white_paper_download',
          source: 'white-paper-psychology-alignment'
        }
      };
      var instantlyHeaders = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer NTA5MjllMTMtOWM5NC00NmU5LTkyYjgtMGE1MWMxNjIzYjM3OmZ0TU9sZVNjUHRQbQ=='
      };

      // Hunter campaign
      fetch('https://api.instantly.ai/api/v2/leads', {
        method: 'POST',
        headers: instantlyHeaders,
        body: JSON.stringify(Object.assign({}, leadPayload, {
          campaign_id: '8d14f42c-4ba4-436e-9e33-29cf8bb152a8'
        }))
      }).catch(function () {});

      // Gatherer campaign
      fetch('https://api.instantly.ai/api/v2/leads', {
        method: 'POST',
        headers: instantlyHeaders,
        body: JSON.stringify(Object.assign({}, leadPayload, {
          campaign_id: '78122468-f519-46f8-9edf-825679613fc0'
        }))
      }).catch(function () {});

      // Send lead via email using formsubmit.co (no signup required, sends to gary@archematch.com)
      fetch('https://formsubmit.co/ajax/gary@archematch.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: 'New White Paper Download Lead',
          name: formData.firstName + ' ' + formData.lastName,
          email: formData.email,
          company: formData.company,
          role: formData.role,
          downloaded_at: formData.downloadedAt,
          source: formData.source
        })
      }).catch(() => {}); // Silently fail — localStorage is the backup

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
