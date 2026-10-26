import type { Variants } from "framer-motion";

/**
 * Container animation for the dropdown menu panel.
 * Uses `staggerChildren` so each child item smoothly animates one by one ("paisa-isa").
 */
export const dropdownPanelVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -6,
    transition: {
      duration: 0.14,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 28,
      staggerChildren: 0.045, // paisa-isang bababa ang bawat list item
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -6,
    transition: {
      duration: 0.12,
      ease: "easeInOut",
    },
  },
};

/**
 * Item animation variants applied to each dropdown list item.
 */
export const dropdownItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -6,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 28,
    },
  },
};
