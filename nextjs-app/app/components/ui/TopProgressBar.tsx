"use client";

import React, { useEffect, useState } from "react";

export default function TopProgressBar() {
  const [progress, setProgress] = useState(5);
  const [opacity, setOpacity] = useState(1);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Smooth step-by-step incremental loading animation
    const timers = [
      setTimeout(() => setProgress(15), 50),
      setTimeout(() => setProgress(32), 120),
      setTimeout(() => setProgress(55), 240),
      setTimeout(() => setProgress(78), 400),
      setTimeout(() => setProgress(92), 600),
      setTimeout(() => setProgress(100), 800),
      setTimeout(() => setOpacity(0), 1050),
      setTimeout(() => setVisible(false), 1450),
    ];

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "2px",
        zIndex: 9999999,
        pointerEvents: "none",
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          opacity: opacity,
          background: "linear-gradient(90deg, #38bdf8 0%, #34d399 50%, #6366f1 100%)",
          transition: "width 220ms cubic-bezier(0.1, 0.7, 0.1, 1), opacity 350ms ease-out",
        }}
      />
    </div>
  );
}
