const SCROLL_ANIMATION_TRIGGER_CLASSNAME = 'scroll-trigger';
const SCROLL_ANIMATION_OFFSCREEN_CLASSNAME = 'scroll-trigger--offscreen';
const SCROLL_ZOOM_IN_TRIGGER_CLASSNAME = 'animate--zoom-in';
const SCROLL_ANIMATION_CANCEL_CLASSNAME = 'scroll-trigger--cancel';

// Scroll in animation logic
function onIntersection(elements, observer) {
  elements.forEach((element, index) => {
    if (element.isIntersecting) {
      const elementTarget = element.target;
      if (elementTarget.classList.contains(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME)) {
        elementTarget.classList.remove(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
        if (elementTarget.hasAttribute('data-cascade'))
          elementTarget.setAttribute('style', `--animation-order: ${index};`);
      }
      observer.unobserve(elementTarget);
    } else {
      element.target.classList.add(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
      element.target.classList.remove(SCROLL_ANIMATION_CANCEL_CLASSNAME);
    }
  });
}

function initializeScrollAnimationTrigger(rootEl = document, isDesignModeEvent = false) {
  const animationTriggerElements = Array.from(rootEl.getElementsByClassName(SCROLL_ANIMATION_TRIGGER_CLASSNAME));
  if (animationTriggerElements.length === 0) return;

  if (isDesignModeEvent) {
    animationTriggerElements.forEach((element) => {
      element.classList.add('scroll-trigger--design-mode');
    });
    return;
  }

  const observer = new IntersectionObserver(onIntersection, {
    rootMargin: '0px 0px -50px 0px',
  });
  animationTriggerElements.forEach((element) => observer.observe(element));
}

// Zoom in animation logic
function initializeScrollZoomAnimationTrigger() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const animationTriggerElements = Array.from(document.getElementsByClassName(SCROLL_ZOOM_IN_TRIGGER_CLASSNAME));

  if (animationTriggerElements.length === 0) return;

  const scaleAmount = 0.8;

  animationTriggerElements.forEach((element) => {
    let elementIsVisible = false;
    const observer = new IntersectionObserver((elements) => {
      elements.forEach((entry) => {
        elementIsVisible = entry.isIntersecting;
      });
    });
    observer.observe(element);

    element.style.setProperty('--zoom-in-ratio', 1 + scaleAmount * percentageSeen(element));

    window.addEventListener(
      'scroll',
      throttle(() => {
        if (!elementIsVisible) return;

        element.style.setProperty('--zoom-in-ratio', 1 + scaleAmount * percentageSeen(element));
      }),
      { passive: true }
    );
  });
}

function percentageSeen(element) {
  let scrollY = window.scrollY;
  const elementTop = element.getBoundingClientRect().top + scrollY;
  const elementBottom = element.getBoundingClientRect().bottom + scrollY;
  let percentage = (scrollY - elementTop) / (elementBottom - elementTop) * 0.8;

  if (percentage <= 0 || NaN) {
    return 0;
  } else if (percentage >= 1) {
    return 1;
  } else {
    return percentage;
  }
}

// Trigger hover animation, by adding class `hovering`
function triggerHoverAnimationOnScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if(window.matchMedia("(hover: none)").matches || window.matchMedia("(pointer: coarse)").matches) {

  const animationTriggerElements = Array.from(document.getElementsByClassName('card-wrapper'));

  if (animationTriggerElements.length === 0) return;

    animationTriggerElements.forEach((element) => {
      let elementIsVisible = 0.0;
      let isHovering = false;
      const observer = new IntersectionObserver((elements) => {
        elements.forEach((entry) => {
          elementIsVisible = entry.isIntersecting;
        });
      });
      observer.observe(element);

      window.addEventListener(
        'scroll',
        throttle(() => {
          if (!elementIsVisible) return;
          
          let visibleAmount = 0.0;
          if (element.getBoundingClientRect().top < 0) {
            visibleAmount = (element.getBoundingClientRect().height + element.getBoundingClientRect().top) / element.getBoundingClientRect().height;
          } else {
            visibleAmount = 1 - ((element.getBoundingClientRect().bottom - window.innerHeight) / element.getBoundingClientRect().height);
          }
          
          if (visibleAmount <= 0.4 && isHovering) {
            element.classList.remove('hovering');
          } else if (visibleAmount >= 0.6) {
            element.classList.add('hovering');
            isHovering = true;
          }
        }),
        { passive: true }
      );
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initializeScrollAnimationTrigger();
  initializeScrollZoomAnimationTrigger();
  triggerHoverAnimationOnScroll();
});

if (Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => initializeScrollAnimationTrigger(event.target, true));
  document.addEventListener('shopify:section:reorder', () => initializeScrollAnimationTrigger(document, true));
}
