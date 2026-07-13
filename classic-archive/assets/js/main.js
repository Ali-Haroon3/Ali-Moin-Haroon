/**
* Template Name: iPortfolio
* Updated: Nov 17 2023 with Bootstrap v5.3.2
* Template URL: https://bootstrapmade.com/iportfolio-bootstrap-portfolio-websites-template/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/
(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let nav = select('#topnav')
    let offset = nav ? nav.offsetHeight : 0
    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('body').classList.toggle('mobile-nav-active')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let body = select('body')
      if (body.classList.contains('mobile-nav-active')) {
        body.classList.remove('mobile-nav-active')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Hero type effect
   */
  const typed = select('.typed')
  if (typed) {
    let typed_strings = typed.getAttribute('data-typed-items')
    typed_strings = typed_strings.split(',')
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Skills animation
   */
  let skilsContent = select('.skills-content');
  if (skilsContent) {
    new Waypoint({
      element: skilsContent,
      offset: '80%',
      handler: function(direction) {
        let progress = select('.progress .progress-bar', true);
        progress.forEach((el) => {
          el.style.width = el.getAttribute('aria-valuenow') + '%'
        });
      }
    })
  }

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        portfolioIsotope.on('arrangeComplete', function() {
          AOS.refresh()
        });
      }, true);
    }

  });

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Portfolio details slider
   */
  new Swiper('.portfolio-details-slider', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Testimonials slider
   */
  new Swiper('.testimonials-slider', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 20
      },

      1200: {
        slidesPerView: 3,
        spaceBetween: 20
      }
    }
  });

  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
    AOS.init({
      duration: 650,
      easing: 'ease-out-cubic',
      once: true,
      mirror: false,
      offset: 60
    })
  });

  /**
   * Initiate Pure Counter 
   */
  new PureCounter();

  /**
   * Copy email helper
   */
  const copyEmailBtn = select('#copy-email-btn')
  if (copyEmailBtn) {
    on('click', '#copy-email-btn', async function() {
      const email = this.getAttribute('data-email')
      if (!email) return
      await navigator.clipboard.writeText(email)
      const originalText = this.textContent
      this.textContent = 'Copied!'
      setTimeout(() => {
        this.textContent = originalText
      }, 1500)
    })
  }

})()

/**
 * 3D depth layer — scroll reveals, pointer-tilt project cards, hero parallax.
 * Self-contained; gated by IntersectionObserver / fine-pointer / reduced-motion.
 */
;(function () {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Scroll reveals (rotateX rise). Hidden state is scoped to .js-reveal so
  // the page stays fully visible if JS or IntersectionObserver is unavailable.
  const revealEls = document.querySelectorAll('[data-reveal]')
  if (revealEls.length && 'IntersectionObserver' in window && !reduce) {
    document.documentElement.classList.add('js-reveal')
    revealEls.forEach((el, i) => el.style.setProperty('--reveal-delay', (i % 3) * 0.09 + 's'))
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' })
    revealEls.forEach((el) => io.observe(el))
  }

  // Pointer effects only on real mice, never under reduced motion.
  if (!fine || reduce) return

  // Pointer-tilt + cursor sheen on project cards
  const MAX = 7
  document.querySelectorAll('.portfolio-wrap[data-tilt]').forEach((card) => {
    let raf = null
    let rect = null
    const refresh = () => { rect = card.getBoundingClientRect() }
    card.addEventListener('pointerenter', refresh)
    card.addEventListener('pointermove', (e) => {
      if (!rect) refresh()
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = null
        const px = (e.clientX - rect.left) / rect.width
        const py = (e.clientY - rect.top) / rect.height
        card.style.setProperty('--ry', ((px - 0.5) * 2 * MAX).toFixed(2) + 'deg')
        card.style.setProperty('--rx', ((0.5 - py) * 2 * MAX).toFixed(2) + 'deg')
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%')
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%')
      })
    })
    card.addEventListener('pointerleave', () => {
      rect = null
      card.style.setProperty('--rx', '0deg')
      card.style.setProperty('--ry', '0deg')
    })
  })

  // Hero mouse parallax: name/text float against the photo
  const hero = document.getElementById('hero')
  if (hero) {
    let hraf = null
    hero.addEventListener('pointermove', (e) => {
      if (hraf) return
      hraf = requestAnimationFrame(() => {
        hraf = null
        const r = hero.getBoundingClientRect()
        hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
        hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
      })
    })
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--px', '0')
      hero.style.setProperty('--py', '0')
    })
  }
})()

/**
 * Top-nav glass-on-scroll state
 */
;(function () {
  const nav = document.getElementById('topnav')
  if (!nav) return
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})()
