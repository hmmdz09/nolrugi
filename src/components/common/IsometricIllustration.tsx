import React from 'react';
import { motion } from 'framer-motion';

interface IsometricProps {
  variant?: 'hero' | 'small' | 'cube' | 'pillar';
  className?: string;
}

export const IsometricIllustration: React.FC<IsometricProps> = ({
  variant = 'hero',
  className = '',
}) => {
  if (variant === 'small' || variant === 'cube') {
    return (
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className={`relative w-12 h-12 flex items-center justify-center shrink-0 ${className}`}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Base shadow */}
          <ellipse cx="50" cy="85" rx="35" ry="12" fill="rgba(91, 88, 235, 0.15)" />
          
          {/* Bottom Violet Block */}
          <path d="M 50 45 L 80 60 L 50 75 L 20 60 Z" fill="#7c79f2" />
          <path d="M 20 60 L 50 75 L 50 90 L 20 75 Z" fill="#5b58eb" />
          <path d="M 80 60 L 50 75 L 50 90 L 80 75 Z" fill="#4643c7" />

          {/* Stepped Pink Block */}
          <path d="M 50 25 L 70 35 L 50 45 L 30 35 Z" fill="#f472b6" />
          <path d="M 30 35 L 50 45 L 50 55 L 30 45 Z" fill="#ec4899" />
          <path d="M 70 35 L 50 45 L 50 55 L 70 45 Z" fill="#db2777" />

          {/* Top Cyan Cylinder / Cube */}
          <path d="M 50 12 L 62 18 L 50 24 L 38 18 Z" fill="#67e8f9" />
          <path d="M 38 18 L 50 24 L 50 30 L 38 24 Z" fill="#22d3ee" />
          <path d="M 62 18 L 50 24 L 50 30 L 62 24 Z" fill="#06b6d4" />
        </svg>
      </motion.div>
    );
  }

  if (variant === 'pillar') {
    return (
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        className={`relative w-14 h-14 flex items-center justify-center shrink-0 ${className}`}
      >
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          {/* Shadow */}
          <ellipse cx="60" cy="100" rx="40" ry="14" fill="rgba(0, 0, 0, 0.1)" />

          {/* Stepped Blocks Stack */}
          {/* Block 1 (Base Violet) */}
          <path d="M 60 65 L 95 80 L 60 95 L 25 80 Z" fill="#8b5cf6" />
          <path d="M 25 80 L 60 95 L 60 108 L 25 93 Z" fill="#6d28d9" />
          <path d="M 95 80 L 60 95 L 60 108 L 95 93 Z" fill="#5b21b6" />

          {/* Block 2 (Middle Pink) */}
          <path d="M 60 42 L 85 54 L 60 66 L 35 54 Z" fill="#f472b6" />
          <path d="M 35 54 L 60 66 L 60 76 L 35 64 Z" fill="#db2777" />
          <path d="M 85 54 L 60 66 L 60 76 L 85 64 Z" fill="#be185d" />

          {/* Block 3 (Top Cyan Cylinder) */}
          <path d="M 60 22 L 78 31 L 60 40 L 42 31 Z" fill="#38bdf8" />
          <path d="M 42 31 L 60 40 L 60 49 L 42 40 Z" fill="#0284c7" />
          <path d="M 78 31 L 60 40 L 60 49 L 78 40 Z" fill="#0369a1" />

          {/* Floating Yellow Orb */}
          <circle cx="85" cy="22" r="6" fill="#fbbf24" />
        </svg>
      </motion.div>
    );
  }

  // Hero Variant (Exact 3D composition as seen in Skillalley reference image!)
  return (
    <div className={`relative w-64 sm:w-80 h-52 sm:h-60 flex items-center justify-center ${className}`}>
      {/* Floating sphere 1 (Top right) */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="absolute top-2 right-8 w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 via-orange-300 to-amber-200 shadow-lg shadow-amber-400/30 z-20 flex items-center justify-center"
      >
        <div className="w-3 h-3 rounded-full bg-white/60 -mt-2 -ml-2" />
      </motion.div>

      {/* Floating tiny cube 2 */}
      <motion.div
        animate={{ y: [0, 6, 0], rotate: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
        className="absolute top-6 right-24 w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 shadow-md z-20"
      />

      {/* Floating cyan diamond */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-16 right-4 w-4 h-4 rounded-sm bg-cyan-400 shadow-md rotate-45 z-20"
      />

      {/* Main Isometric Stepped Architecture */}
      <motion.svg
        viewBox="0 0 320 260"
        className="w-full h-full drop-shadow-xl z-10"
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
      >
        {/* Soft Ground Shadow */}
        <ellipse cx="160" cy="220" rx="110" ry="32" fill="rgba(91, 88, 235, 0.12)" />

        {/* --- BASE LEVEL 1: Big Violet / Indigo Platform --- */}
        {/* Top Face */}
        <path d="M 160 120 L 250 165 L 160 210 L 70 165 Z" fill="#8481ff" />
        {/* Left Face */}
        <path d="M 70 165 L 160 210 L 160 228 L 70 183 Z" fill="#5b58eb" />
        {/* Right Face */}
        <path d="M 250 165 L 160 210 L 160 228 L 250 183 Z" fill="#4744cc" />

        {/* --- STEP LEVEL 2 (Back Right): Pink Rectangular Block --- */}
        {/* Top Face */}
        <path d="M 180 85 L 245 118 L 205 138 L 140 105 Z" fill="#f9a8d4" />
        {/* Left Face */}
        <path d="M 140 105 L 205 138 L 205 160 L 140 127 Z" fill="#f472b6" />
        {/* Right Face */}
        <path d="M 245 118 L 205 138 L 205 160 L 245 140 Z" fill="#db2777" />
        {/* Hot pink cylinder button on top of pink block */}
        <ellipse cx="192" cy="108" rx="16" ry="8" fill="#ec4899" />
        <ellipse cx="192" cy="106" rx="16" ry="8" fill="#f472b6" />

        {/* --- STEP LEVEL 3 (Front Left): Cyan Stepped Block --- */}
        {/* Top Face */}
        <path d="M 115 142 L 155 162 L 115 182 L 75 162 Z" fill="#67e8f9" />
        {/* Left Face */}
        <path d="M 75 162 L 115 182 L 115 198 L 75 178 Z" fill="#22d3ee" />
        {/* Right Face */}
        <path d="M 155 162 L 115 182 L 115 198 L 155 178 Z" fill="#06b6d4" />

        {/* --- STEP LEVEL 4 (Center Front): White/Lilac Round Tier --- */}
        {/* Cylindrical Base */}
        <path d="M 125 155 C 125 145 155 145 155 155 L 155 162 C 155 172 125 172 125 162 Z" fill="#c7d2fe" />
        <ellipse cx="140" cy="155" rx="15" ry="8" fill="#e0e7ff" />
        <ellipse cx="140" cy="153" rx="14" ry="7" fill="#ffffff" />

        {/* --- STEP LEVEL 5 (Center Right Front): Small White Pedestal --- */}
        <path d="M 180 168 C 180 160 205 160 205 168 L 205 174 C 205 182 180 182 180 174 Z" fill="#e2e8f0" />
        <ellipse cx="192.5" cy="168" rx="12.5" ry="6.5" fill="#f8fafc" />
        <ellipse cx="192.5" cy="166" rx="12" ry="6" fill="#ffffff" />
        {/* Cyan pin on pedestal */}
        <circle cx="192.5" cy="164" r="3" fill="#06b6d4" />

        {/* Little decorative floating yellow mini prism */}
        <path d="M 225 145 L 232 148 L 225 152 L 218 148 Z" fill="#fef08a" />
        <path d="M 218 148 L 225 152 L 225 157 L 218 153 Z" fill="#facc15" />
        <path d="M 232 148 L 225 152 L 225 157 L 232 153 Z" fill="#eab308" />
      </motion.svg>
    </div>
  );
};

