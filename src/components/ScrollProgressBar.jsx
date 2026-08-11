import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #1995ad 0%, #ffb703 50%, #00f0ff 100%)',
        transformOrigin: '0%',
        scaleX,
        zIndex: 9999,
        boxShadow: '0 0 10px rgba(25, 149, 173, 0.8), 0 0 5px rgba(255, 183, 3, 0.8)'
      }}
    />
  );
}
