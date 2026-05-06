import React from 'react';
import { clsx } from 'clsx';

interface CaresolisLogoProps {
  className?: string;
  withText?: boolean;
  colorClass?: string;
}

export const CaresolisLogo: React.FC<CaresolisLogoProps> = ({ className, withText = true, colorClass }) => {
  const fillClass = colorClass || "fill-slate-900 dark:fill-emerald-500";
  // Crop to the hummingbird if no text is requested
  const viewBox = withText ? "0 0 1200 400" : "90 60 240 240";
  
  return (
    <svg 
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg" 
      className={clsx("h-full w-auto", className)}
      aria-label="Caresolis Logo"
    >
      {/* Hummingbird Mark */}
      <g transform="translate(120,200) scale(1.2)">
        {/* Upper Wing */}
        <path d="M0 -40 L110 -110 L70 -30 Z" className={clsx("transition-colors duration-300", fillClass)}/>
        {/* Lower Wing */}
        <path d="M0 -40 L90 -75 L55 -10 Z" className={clsx("transition-colors duration-300", fillClass)}/>
        {/* Body */}
        <path d="M-10 -10 C 30 -50, 80 -40, 120 -10 C 80 5, 40 10, 0 20 C -10 5, -10 -5, -10 -10 Z" className={clsx("transition-colors duration-300", fillClass)}/>
        {/* Neck */}
        <path d="M40 -10 C 55 -40, 95 -40, 130 -25 L 120 -10 C 90 -20, 60 -15, 45 5 Z" className={clsx("transition-colors duration-300", fillClass)}/>
        {/* Beak */}
        <polygon points="130 -25 170 -30 130 -20" className={clsx("transition-colors duration-300", fillClass)}/>
        {/* Tail */}
        <path d="M-20 10 L20 70 L-5 55 Z" className={clsx("transition-colors duration-300", fillClass)}/>
        <path d="M-5 25 L35 80 L10 65 Z" className={clsx("transition-colors duration-300", fillClass)}/>
      </g>

      {/* Wordmark */}
      {withText && (
        <text 
            x="420" 
            y="230"
            fontFamily="Didot, 'Playfair Display', serif"
            fontSize="120"
            letterSpacing="1.5"
            className={clsx("font-serif transition-colors duration-300", colorClass ? colorClass : "fill-slate-900 dark:fill-slate-100")}
        >
            CareSolis
        </text>
      )}
    </svg>
  );
};
