const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initFeatherIcons() {
  const featherTargets = document.querySelectorAll('[data-feather]');
  if (!featherTargets.length) return;

  const replaceIcons = function() {
    if (window.feather && typeof window.feather.replace === 'function') {
      window.feather.replace();
    }
  };

  if (window.feather) {
    replaceIcons();
    return;
  }

  let hasLoadedFeather = false;
  const loadFeatherScript = function() {
    if (hasLoadedFeather) return;
    hasLoadedFeather = true;

    const mainScript = document.querySelector('script[src$="main.min.js"], script[src$="main.js"]');
    const script = document.createElement('script');
    script.src = mainScript && mainScript.src
      ? new URL('feather.min.js', mainScript.src).toString()
      : 'assets/js/feather.min.js';
    script.defer = true;
    script.onload = replaceIcons;
    document.head.appendChild(script);
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadFeatherScript, { timeout: 1200 });
  } else {
    setTimeout(loadFeatherScript, 800);
  }

  ['touchstart', 'pointerdown', 'keydown', 'mousemove'].forEach(function(eventName) {
    window.addEventListener(eventName, loadFeatherScript, { once: true, passive: true });
  });
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  initFeatherIcons();

  // ============================================
  // NAVEGACION MOVIL
  // ============================================
  const navToggle = document.querySelector('.nav-toggle');
  const navClose = document.querySelector('.nav-close');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  const updateMenuAccessibility = function(isOpen) {
    if (!navMenu) return;
    const isMobile = window.innerWidth < 768;
    const shouldHide = isMobile ? !isOpen : false;
    navMenu.setAttribute('aria-hidden', shouldHide ? 'true' : 'false');

    if ('inert' in navMenu) {
      navMenu.inert = shouldHide;
    } else if (shouldHide) {
      navMenu.setAttribute('inert', '');
    } else {
      navMenu.removeAttribute('inert');
    }

    const focusables = navMenu.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    focusables.forEach(function(el) {
      if (shouldHide) {
        if (el.hasAttribute('tabindex')) {
          el.dataset.prevTabindex = el.getAttribute('tabindex');
        }
        el.setAttribute('tabindex', '-1');
      } else {
        if (el.dataset.prevTabindex !== undefined) {
          el.setAttribute('tabindex', el.dataset.prevTabindex);
          delete el.dataset.prevTabindex;
        } else {
          el.removeAttribute('tabindex');
        }
      }
    });
  };

  const setMenuState = function(isOpen) {
    if (!navMenu) return;
    navMenu.classList.toggle('active', isOpen);
    document.documentElement.style.overflow = isOpen ? 'hidden' : '';
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
    updateMenuAccessibility(isOpen);
  };

  if (navToggle) {
    navToggle.addEventListener('click', function() {
      setMenuState(true);
    });
  }

  if (navClose) {
    navClose.addEventListener('click', function() {
      setMenuState(false);
    });
  }

  navLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      if (window.innerWidth < 768) {
        setMenuState(false);
      }
    });
  });

  document.addEventListener('click', function(event) {
    if (!navMenu || !navMenu.classList.contains('active')) return;
    const isClickInsideNav = navMenu.contains(event.target);
    const isClickOnToggle = navToggle && navToggle.contains(event.target);

    if (!isClickInsideNav && !isClickOnToggle) {
      setMenuState(false);
    }
  });

  // ============================================
  // MARCAR ENLACE ACTIVO EN NAVEGACIÓN
  // ============================================
  const currentLocation = window.location.pathname;
  navLinks.forEach(function(link) {
    if (link.getAttribute('href') === currentLocation ||
        (currentLocation === '/' && link.getAttribute('href') === 'index.html') ||
        (currentLocation.includes(link.getAttribute('href')) && link.getAttribute('href') !== 'index.html')) {
      link.classList.add('active');
    }
  });

  if (navMenu) {
    updateMenuAccessibility(navMenu.classList.contains('active'));
    window.addEventListener('resize', function() {
      updateMenuAccessibility(navMenu.classList.contains('active'));
    });
  }

  // ============================================
  // VALIDACIÓN DE FORMULARIOS
  // ============================================
  const forms = document.querySelectorAll('form');

  forms.forEach(function(form) {
    form.addEventListener('submit', function(e) {
      let isValid = true;
      const requiredFields = form.querySelectorAll('[required]');

      requiredFields.forEach(function(field) {
        if (!field.value.trim()) {
          isValid = false;
          field.style.borderColor = 'var(--color-error)';

          // Mostrar mensaje de error si no existe
          let errorMsg = field.parentElement.querySelector('.error-message');
          if (!errorMsg) {
            errorMsg = document.createElement('span');
            errorMsg.className = 'error-message';
            errorMsg.style.color = 'var(--color-error)';
            errorMsg.style.fontSize = 'var(--font-size-small)';
            errorMsg.style.marginTop = 'var(--spacing-xs)';
            errorMsg.style.display = 'block';
            errorMsg.textContent = 'Este campo es obligatorio';
            field.parentElement.appendChild(errorMsg);
          }
        } else {
          field.style.borderColor = '';
          const errorMsg = field.parentElement.querySelector('.error-message');
          if (errorMsg) {
            errorMsg.remove();
          }
        }
      });

      // Validar email
      const emailFields = form.querySelectorAll('input[type="email"]');
      emailFields.forEach(function(field) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (field.value && !emailRegex.test(field.value)) {
          isValid = false;
          field.style.borderColor = 'var(--color-error)';

          let errorMsg = field.parentElement.querySelector('.error-message');
          if (!errorMsg) {
            errorMsg = document.createElement('span');
            errorMsg.className = 'error-message';
            errorMsg.style.color = 'var(--color-error)';
            errorMsg.style.fontSize = 'var(--font-size-small)';
            errorMsg.style.marginTop = 'var(--spacing-xs)';
            errorMsg.style.display = 'block';
            errorMsg.textContent = 'Por favor ingrese un email válido';
            field.parentElement.appendChild(errorMsg);
          }
        }
      });

      // Validar teléfono
      const telFields = form.querySelectorAll('input[type="tel"]');
      telFields.forEach(function(field) {
        const telRegex = /^[\d\s\-\+\(\)]{10,}$/;
        if (field.value && !telRegex.test(field.value)) {
          isValid = false;
          field.style.borderColor = 'var(--color-error)';

          let errorMsg = field.parentElement.querySelector('.error-message');
          if (!errorMsg) {
            errorMsg = document.createElement('span');
            errorMsg.className = 'error-message';
            errorMsg.style.color = 'var(--color-error)';
            errorMsg.style.fontSize = 'var(--font-size-small)';
            errorMsg.style.marginTop = 'var(--spacing-xs)';
            errorMsg.style.display = 'block';
            errorMsg.textContent = 'Por favor ingrese un teléfono válido (mínimo 10 dígitos)';
            field.parentElement.appendChild(errorMsg);
          }
        }
      });

      if (!isValid) {
        e.preventDefault();
        // Scroll al primer campo con error
        const firstError = form.querySelector('[style*="border-color"]');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Envío AJAX para Formspree (evita redirección)
      if (form.action && form.action.includes('formspree.io')) {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        })
        .then(function(response) {
          if (response.ok) {
            const isNewsletter = form.classList.contains('newsletter-form');
            if (isNewsletter) {
              showNotification('Gracias por suscribirte.', 'success', 5000);
              form.innerHTML = '<div style="text-align:center; padding: var(--spacing-xl) 0;"><h3 style="color: var(--color-primary); margin-bottom: var(--spacing-md);">¡Gracias por suscribirte!</h3><p>Te enviaremos novedades y tips directamente a tu correo.</p></div>';
            } else {
              showNotification('Solicitud enviada. Te responderemos en menos de 24 horas.', 'success', 5000);
              form.innerHTML = '<div style="text-align:center; padding: var(--spacing-xl) 0;"><h3 style="color: var(--color-primary); margin-bottom: var(--spacing-md);">¡Mensaje enviado!</h3><p>Gracias por tu interés. Te responderemos en menos de 24 horas.</p></div>';
            }
          } else {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            alert('Hubo un error al enviar el formulario. Por favor intenta de nuevo o contáctanos por WhatsApp.');
          }
        })
        .catch(function() {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          alert('Error de conexión. Por favor intenta de nuevo o contáctanos por WhatsApp.');
        });
      }
    });

    // Limpiar errores al escribir
    const formFields = form.querySelectorAll('input, textarea, select');
    formFields.forEach(function(field) {
      field.addEventListener('input', function() {
        this.style.borderColor = '';
        const errorMsg = this.parentElement.querySelector('.error-message');
        if (errorMsg) {
          errorMsg.remove();
        }
      });
    });
  });

  // ============================================
  // SCROLL SUAVE PARA ANCLAS
  // ============================================
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ============================================
  // LAZY LOADING DE IMÁGENES
  // ============================================
  const images = document.querySelectorAll('img[data-src]');

  const imageObserver = new IntersectionObserver(function(entries, observer) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(function(img) {
    imageObserver.observe(img);
  });

  // ============================================
  // LAZY LOADING DE FONDOS (BACKGROUND IMAGES)
  // ============================================
  const backgroundElements = document.querySelectorAll('[data-bg]');
  const setBackgroundImage = function(element) {
    const bgUrl = element.getAttribute('data-bg');
    if (!bgUrl) return;

    const baseBackground = element.style.backgroundImage;
    if (baseBackground && baseBackground !== 'none') {
      element.style.backgroundImage = `${baseBackground}, url('${bgUrl}')`;
    } else {
      element.style.backgroundImage = `url('${bgUrl}')`;
    }
    element.removeAttribute('data-bg');
  };

  if (backgroundElements.length) {
    if (!('IntersectionObserver' in window)) {
      backgroundElements.forEach(function(element) {
        setBackgroundImage(element);
      });
    } else {
      const backgroundObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            setBackgroundImage(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '200px 0px'
      });

      backgroundElements.forEach(function(element) {
        backgroundObserver.observe(element);
      });
    }
  }

  // ============================================
  // ANIMACIÓN AL HACER SCROLL (FADE IN)
  // ============================================
  const animateOnScroll = document.querySelectorAll('.animate-on-scroll');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    animateOnScroll.forEach(function(element) {
      element.classList.add('visible');
    });
  } else {
    const scrollObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animateOnScroll.forEach(function(element) {
      scrollObserver.observe(element);
    });
  }

  // ============================================
  // BOTÓN VOLVER ARRIBA
  // ============================================
  const backToTopButton = document.querySelector('.back-to-top');
  const header = document.querySelector('.header');

  const updateScrollUi = function(scrollY) {
    if (backToTopButton) {
      const shouldShowBackToTop = scrollY > 300;
      if ((backToTopButton.dataset.visible || 'false') !== String(shouldShowBackToTop)) {
        backToTopButton.dataset.visible = shouldShowBackToTop ? 'true' : 'false';
        backToTopButton.style.display = shouldShowBackToTop ? 'flex' : 'none';
      }
    }

    if (header) {
      const shouldElevateHeader = scrollY > 100;
      if ((header.dataset.elevated || 'false') !== String(shouldElevateHeader)) {
        header.dataset.elevated = shouldElevateHeader ? 'true' : 'false';
        header.style.boxShadow = shouldElevateHeader ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'var(--box-shadow)';
      }
    }
  };

  let scrollTicking = false;
  const handleScroll = function() {
    if (scrollTicking) return;
    scrollTicking = true;

    requestAnimationFrame(function() {
      updateScrollUi(window.pageYOffset || window.scrollY || 0);
      scrollTicking = false;
    });
  };

  if (backToTopButton) {
    backToTopButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  if (backToTopButton || header) {
    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollUi(window.pageYOffset || window.scrollY || 0);
  }

  // ============================================
  // WHATSAPP: MENSAJE PRE-RELLENADO
  // ============================================
  if (!document.querySelector('.floating-whatsapp')) {
    const floatingWhatsapp = document.createElement('a');
    floatingWhatsapp.className = 'floating-whatsapp btn-whatsapp';
    floatingWhatsapp.href = 'https://wa.me/5215510881676';
    floatingWhatsapp.target = '_blank';
    floatingWhatsapp.rel = 'noopener';
    floatingWhatsapp.setAttribute('aria-label', 'Contactar por WhatsApp');
    floatingWhatsapp.dataset.message = 'Hola, me interesa una cotización para productos termoformados.';
    floatingWhatsapp.innerHTML = `
      <span class="floating-whatsapp-icon" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 3C9.37 3 4 8.24 4 14.7c0 2.22.67 4.29 1.82 6.02L4 29l8.46-1.7c1 .33 2.1.5 3.54.5 6.63 0 12-5.24 12-11.7C28 8.24 22.63 3 16 3Zm0 21.1c-1.02 0-2.02-.2-2.94-.56l-.21-.08-4.98 1 1-4.77-.14-.22A9.05 9.05 0 0 1 7.02 14.7c0-5 4.1-9.07 8.98-9.07 4.96 0 8.98 4.06 8.98 9.07 0 5-4.02 9.4-8.98 9.4Z" fill="currentColor"/>
          <path d="M12.52 11.2c-.18-.4-.37-.41-.53-.41h-.46c-.16 0-.42.06-.65.3-.23.24-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.6.12.17 1.75 2.76 4.33 3.75 2.12.82 2.56.66 3.03.62.46-.05 1.49-.6 1.7-1.2.22-.58.22-1.08.15-1.2-.07-.1-.25-.16-.53-.3-.28-.12-1.67-.82-1.93-.92-.26-.1-.45-.12-.63.13-.19.25-.73.92-.9 1.1-.16.18-.33.2-.6.08-.28-.13-1.18-.44-2.25-1.4-.82-.73-1.38-1.65-1.54-1.92-.16-.28-.02-.44.12-.58.12-.12.28-.32.43-.47.14-.16.18-.26.28-.45.1-.18.05-.34-.02-.47-.06-.13-.57-1.43-.77-1.87Z" fill="#ffffff"/>
        </svg>
      </span>
      <span class="floating-whatsapp-text">WhatsApp</span>
    `;
    document.body.appendChild(floatingWhatsapp);
  }

  const whatsappButtons = document.querySelectorAll('.btn-whatsapp');
  const whatsappPhone = '5215510881676';
  const defaultWhatsappMessage = 'Hola, me interesa conocer más sobre sus productos termoformados';

  whatsappButtons.forEach(function(button) {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const message = button.getAttribute('data-message') || defaultWhatsappMessage;
      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener');
    });
  });

  // ============================================
  // CONTADOR ANIMADO (ESTADÍSTICAS)
  // ============================================
  const counters = document.querySelectorAll('.stat-number');
  const formatCounterValue = function(value, counter) {
    const suffix = counter.dataset.suffix || '';
    if (value >= 1000000) {
      return Math.floor(value / 1000000) + 'M' + suffix;
    }
    return value + suffix;
  };

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    counters.forEach(function(counter) {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      if (!isNaN(target)) {
        counter.textContent = formatCounterValue(target, counter);
      }
    });
  } else {
    const counterObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute('data-target'), 10);
          if (isNaN(target)) {
            counterObserver.unobserve(counter);
            return;
          }
          const duration = 2000;
          const increment = target / (duration / 16);
          let current = 0;

          const updateCounter = function() {
            current += increment;
            if (current < target) {
              counter.textContent = formatCounterValue(Math.floor(current), counter);
              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = formatCounterValue(target, counter);
            }
          };

          updateCounter();
          counterObserver.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function(counter) {
      counterObserver.observe(counter);
    });
  }

});

// ============================================
// FUNCIONES GLOBALES
// ============================================

// Función para abrir WhatsApp con mensaje personalizado
function openWhatsApp(message) {
  const phone = '5215510881676';
  const encodedMessage = encodeURIComponent(message || 'Hola, me interesa conocer más sobre sus productos termoformados');
  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}

// Función para mostrar notificación
function showNotification(message, type = 'success', duration = 5000) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background-color: ${type === 'success' ? 'var(--color-success)' : 'var(--color-error)'};
    color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-hover);
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(function() {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(function() {
      notification.remove();
    }, 300);
  }, duration);
}

// Animaciones CSS para notificaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;

document.head.appendChild(style);
