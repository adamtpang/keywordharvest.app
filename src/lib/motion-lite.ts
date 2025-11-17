/**
 * Motion Lite - Minimal animation utilities for Chrome extensions
 * Keep animations lightweight and fast (<100ms render time)
 */

import { animate, spring, stagger } from "motion"

// Micro-interaction presets (use these sparingly!)
export const motionPresets = {
  // Button press feedback (50ms)
  press: {
    scale: 0.95,
    transition: { duration: 0.05, easing: [0.4, 0, 0.2, 1] }
  },

  // Success checkmark bounce (300ms)
  successBounce: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.3, easing: spring({ stiffness: 300 }) }
  },

  // Toggle switch slide (150ms)
  toggle: {
    x: [0, 20],
    transition: { duration: 0.15, easing: [0.4, 0, 0.2, 1] }
  },

  // Fade in for results (200ms)
  fadeIn: {
    opacity: [0, 1],
    transition: { duration: 0.2, easing: [0, 0, 0.2, 1] }
  },

  // Slide up for notifications (200ms)
  slideUp: {
    y: [10, 0],
    opacity: [0, 1],
    transition: { duration: 0.2, easing: [0, 0, 0.2, 1] }
  },
} as const

// Utility: Animate element on mount (use for success states)
export const animateOnMount = (
  element: HTMLElement,
  preset: keyof typeof motionPresets
) => {
  const config = motionPresets[preset]
  return animate(element, config as any)
}

// Utility: Stagger children (for list items, max 5 items)
export const staggerChildren = (
  parentSelector: string,
  childSelector: string,
  maxItems = 5
) => {
  const children = document.querySelectorAll(
    `${parentSelector} ${childSelector}`
  )
  
  // Limit stagger to prevent slow rendering
  const itemsToAnimate = Array.from(children).slice(0, maxItems)
  
  animate(
    itemsToAnimate as any,
    { opacity: [0, 1], y: [5, 0] },
    { duration: 0.15, delay: stagger(0.03) }
  )
}

// Utility: Quick hover scale (use on interactive elements)
export const hoverScale = (element: HTMLElement) => {
  element.addEventListener('mouseenter', () => {
    animate(element, { scale: 1.02 }, { duration: 0.1 })
  })
  
  element.addEventListener('mouseleave', () => {
    animate(element, { scale: 1 }, { duration: 0.1 })
  })
}

/**
 * React hook for motion animations (use sparingly!)
 * Only use for critical micro-interactions
 */
export const useMotion = () => {
  const animateElement = (
    ref: React.RefObject<HTMLElement>,
    preset: keyof typeof motionPresets
  ) => {
    if (!ref.current) return
    animateOnMount(ref.current, preset)
  }

  return { animateElement, presets: motionPresets }
}

// Performance tip: Batch animations if possible
export const batchAnimate = (
  elements: HTMLElement[],
  animation: Record<string, any>
) => {
  return animate(elements as any, animation, { duration: 0.15 })
}
