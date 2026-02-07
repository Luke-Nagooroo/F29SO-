export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

export const staggerChildren = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const hoverLift = {
  whileHover: { y: -2, scale: 1.01 },
  transition: { type: "spring", stiffness: 260, damping: 22 },
};
