"use client";

import React from "react";

export default function SkipLink({ targetId = "main-content" }: { targetId?: string }) {
  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleSkip}
      style={{
        position: "fixed",
        top: "12px",
        left: "12px",
        zIndex: 99999,
        padding: "10px 20px",
        background: "linear-gradient(135deg, rgba(10, 132, 255, 0.95) 0%, rgba(94, 92, 230, 0.95) 100%)",
        color: "#ffffff",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, sans-serif",
        fontSize: "13px",
        fontWeight: 600,
        textDecoration: "none",
        borderRadius: "9999px",
        border: "1px solid rgba(100, 210, 255, 0.5)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.7), 0 0 20px rgba(10, 132, 255, 0.4)",
        transform: "translateY(-200%)",
        transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className="skip-link"
      onFocus={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.transform = "translateY(-200%)";
      }}
    >
      Skip to main content
    </a>
  );
}
