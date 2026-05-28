"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

export interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
}

export const FadeIn = ({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.4,
}: FadeInProps) => {
  const directions = {
    up: { y: 15 },
    down: { y: -15 },
    left: { x: 15 },
    right: { x: -15 },
    none: {},
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directions[direction],
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98], // 모던??가??감속 베�???곡선
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};


