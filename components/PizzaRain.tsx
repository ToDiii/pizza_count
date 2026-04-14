"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface PizzaRainProps {
  active: boolean;
  onComplete: () => void;
}

export function PizzaRain({ active, onComplete }: PizzaRainProps) {
  const [pizzas, setPizzas] = useState<
    { id: number; x: number; delay: number; size: number; rotation: number }[]
  >([]);

  useEffect(() => {
    if (active) {
      const items = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        size: 28 + Math.random() * 28,
        rotation: Math.random() * 360,
      }));
      setPizzas(items);

      const timer = setTimeout(() => {
        onComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Big center message */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <div className="text-center">
              <div className="text-8xl mb-2">🍕</div>
              <div className="text-white text-3xl font-bold drop-shadow-lg">
                +1 Pizza!
              </div>
            </div>
          </motion.div>

          {/* Raining pizzas */}
          {pizzas.map((pizza) => (
            <motion.div
              key={pizza.id}
              className="absolute top-0 select-none"
              style={{
                left: `${pizza.x}%`,
                fontSize: `${pizza.size}px`,
              }}
              initial={{ y: -80, opacity: 1, rotate: 0 }}
              animate={{
                y: "110vh",
                opacity: [1, 1, 0.8, 0],
                rotate: pizza.rotation,
              }}
              transition={{
                duration: 2,
                delay: pizza.delay,
                ease: "easeIn",
              }}
            >
              🍕
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
