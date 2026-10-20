import React, { useState } from 'react';

interface KytLogoProps {
  className?: string;
}

/**
 * Uses the exact official modern White KYT Logo image file (/kyt-logo-white.png)
 */
export const KytBrandLogo: React.FC<KytLogoProps> = ({ className = 'h-7 sm:h-8 w-auto' }) => {
  return (
    <img
      src="/kyt-logo-white.png?v=5"
      alt="KYT Helmet"
      loading="eager"
      decoding="async"
      className={`select-none object-contain ${className}`}
    />
  );
};

interface ShopeeLogoProps {
  className?: string;
}

/**
 * Official Shopee Icon: #EE4D2D brand orange background, centered white shopping bag with handle hole and 'S' cutout
 */
export const ShopeeOfficialLogo: React.FC<ShopeeLogoProps> = ({ className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Shopee"
    >
      <rect width="400" height="400" rx="84" fill="#EE4D2D" />
      <path
        fill="#FFFFFF"
        transform="translate(69.33, 63.9)"
        d="m174.212 201.122c-1.496 12.868-9.297 23.287-21.379 28.438-6.77 2.854-15.811 4.418-23.063 3.953-11.157-.465-21.616-3.229-31.378-8.137-3.377-1.859-8.581-5.344-12.551-8.598-.979-.93-1.143-1.395-.433-2.357.312-.564 1.009-1.596 2.438-3.686 2.179-3.081 2.412-3.488 2.644-3.883.697-1 1.759-1.091 2.869-.301.152.155.152.155.236.23.148.162.148.162.546.465.411.315.709.465.782.643 10.461 8.189 22.638 12.838 34.931 13.303 17.063-.23 29.325-7.902 31.584-19.758 2.326-12.903-7.843-24.167-27.729-30.448-6.265-1.859-22.031-8.156-24.942-9.908-13.629-7.983-20.026-18.461-19.096-31.455 1.395-17.958 18.078-31.324 39.163-31.441 9.359 0 18.793 1.951 27.743 5.716 3.228 1.373 8.989 4.494 10.905 5.986 1.15.852 1.395 1.781.686 2.822-.236.635-.93 1.581-2.128 3.609v0c-1.747 2.664-1.812 2.775-2.129 3.361-.622.978-1.511 1.056-2.695.356-9.566-6.506-20.356-9.762-32.145-9.994-14.643.232-25.653 8.96-26.362 20.919-.146 10.743 7.877 18.569 25.252 24.462 35.339 11.385 48.819 24.686 46.251 45.703m-43.576-185.385c22.96 0 41.717 21.785 42.646 49.095h-85.237c.82-27.31 19.632-49.095 42.591-49.095m119.001 54.269c0-2.85-2.206-5.174-5.021-5.174h-.184-55.101c-1.394-36.032-27.168-64.832-58.695-64.832-31.546 0-57.253 28.8-58.628 64.832h-55.332c-2.775.063-4.977 2.336-4.977 5.174 0 .164 0 .236 0 .4h-.063l7.859 173.798c0 .47.092.944.092 1.509 0 .11.015.144.015.351v.266l.058.092c1.183 12.117 9.937 21.777 21.901 22.25v.092h175.509c.092 0 .146 0 .237 0 .136 0 .136 0 .236 0h .364v-.092c12.134-.295 22.069-10.133 23.016-22.383v0l .053-.225c0-.115 0-.24 0-.351 0-.354.092-.579.092-.947l8.569-174.524v0c0-.064 0-.163 0-.236"
      />
    </svg>
  );
};

interface HelmetArtworkProps {
  imageUrl?: string;
  preset: 'kx1-carbon' | 'tt-course-white' | 'nz-race-black';
  alt: string;
  className?: string;
}

export const HelmetVisual: React.FC<HelmetArtworkProps> = ({
  imageUrl,
  preset,
  alt,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  if (imageUrl && imageUrl.trim() !== '' && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`w-full h-full object-contain ${className}`}
      />
    );
  }

  const isWhiteVariant = preset === 'tt-course-white';
  const isTrackBlack = preset === 'nz-race-black';

  const shellPrimary = isWhiteVariant ? '#F5F5F7' : '#141416';
  const shellSecondary = isWhiteVariant ? '#E5E5EA' : '#0A0A0C';
  const shellStroke = isWhiteVariant ? '#D1D1D6' : '#2C2C30';

  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 800 500"
        className="w-full h-full max-h-[340px] sm:max-h-[400px] drop-shadow-[0_28px_56px_rgba(0,0,0,0.75)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={alt}
      >
        <defs>
          <radialGradient id={`glow-${preset}`} cx="50%" cy="48%" r="48%">
            <stop offset="0%" stopColor="#E10600" stopOpacity={isWhiteVariant ? '0.16' : '0.22'} />
            <stop offset="65%" stopColor="#E10600" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={`shell-${preset}`} x1="160" y1="60" x2="620" y2="440" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isWhiteVariant ? '#FFFFFF' : '#2A2A2E'} />
            <stop offset="45%" stopColor={shellPrimary} />
            <stop offset="100%" stopColor={shellSecondary} />
          </linearGradient>

          <linearGradient id={`visor-${preset}`} x1="380" y1="150" x2="640" y2="310" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#27272A" />
            <stop offset="35%" stopColor="#09090B" />
            <stop offset="75%" stopColor="#18181B" />
            <stop offset="100%" stopColor="#E10600" stopOpacity="0.35" />
          </linearGradient>

          <linearGradient id={`red-accent-${preset}`} x1="150" y1="130" x2="600" y2="380" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF1E1A" />
            <stop offset="100%" stopColor="#B80500" />
          </linearGradient>

          <pattern id={`carbon-${preset}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <rect width="5" height="5" fill="#18181B" fillOpacity="0.45" />
            <rect x="5" y="5" width="5" height="5" fill="#18181B" fillOpacity="0.45" />
          </pattern>
        </defs>

        <circle cx="400" cy="250" r="230" fill={`url(#glow-${preset})`} />
        <ellipse cx="405" cy="450" rx="220" ry="14" fill="#000000" fillOpacity="0.55" />
        <ellipse cx="405" cy="450" rx="130" ry="5" fill="#E10600" fillOpacity="0.22" />

        {/* Rear MotoGP Aero Spoiler Wing */}
        <path
          d="M142 205 L92 228 L112 298 L182 326 Z"
          fill="#111113"
          stroke="#E10600"
          strokeWidth="2"
        />
        <path
          d="M106 234 L158 218 L168 292 L118 288 Z"
          fill="#E10600"
          fillOpacity="0.88"
        />

        {/* Main Aerodynamic Full-Face Helmet Shell */}
        <path
          d="M158 295 C142 190, 218 76, 378 72 C516 68, 608 138, 636 228 C652 278, 646 344, 622 394 C598 426, 528 436, 442 432 L228 410 C178 396, 166 348, 158 295 Z"
          fill={`url(#shell-${preset})`}
          stroke={shellStroke}
          strokeWidth="2.5"
        />

        {!isWhiteVariant && (
          <path
            d="M158 295 C142 190, 218 76, 378 72 C516 68, 608 138, 636 228 C652 278, 646 344, 622 394 C598 426, 528 436, 442 432 L228 410 C178 396, 166 348, 158 295 Z"
            fill={`url(#carbon-${preset})`}
            opacity="0.55"
          />
        )}

        {/* Racing Graphic Stripe */}
        <path
          d="M174 245 C235 158, 348 114, 496 120 L460 162 C336 164, 245 205, 166 302 Z"
          fill={`url(#red-accent-${preset})`}
        />
        <path
          d="M198 358 C286 338, 412 335, 628 360 L616 388 C420 372, 290 375, 214 390 Z"
          fill={isTrackBlack ? '#FFFFFF' : '#E10600'}
          fillOpacity={isTrackBlack ? '0.85' : '0.95'}
        />

        {/* Top Crown Air Intake Vent */}
        <path
          d="M352 74 L448 82 L432 104 L344 94 Z"
          fill="#09090B"
          stroke={isWhiteVariant ? '#A1A1AA' : '#3F3F46'}
          strokeWidth="1.5"
        />
        <line x1="378" y1="84" x2="418" y2="88" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" />

        {/* Optical Class 1 Racing Visor Shield */}
        <path
          d="M412 154 C508 148, 598 178, 638 232 C646 266, 644 300, 628 326 C552 332, 464 318, 396 276 C378 240, 384 186, 412 154 Z"
          fill={`url(#visor-${preset})`}
          stroke="#3F3F46"
          strokeWidth="2"
        />

        <path
          d="M432 170 C508 166, 578 188, 616 228 C600 236, 518 208, 424 198 Z"
          fill="#FFFFFF"
          fillOpacity="0.18"
        />
        <circle cx="412" cy="232" r="14" fill="#18181B" stroke="#E10600" strokeWidth="2.5" />
        <circle cx="412" cy="232" r="4" fill="#E4E4E7" />
        <circle cx="452" cy="244" r="4.5" fill="#A1A1AA" />

        {/* Front Chin Aero Guard */}
        <path
          d="M548 344 L636 336 L622 392 L532 394 Z"
          fill="#121214"
          stroke="#27272A"
          strokeWidth="1.5"
        />
        <line x1="566" y1="358" x2="614" y2="354" stroke="#E10600" strokeWidth="2" />
        <line x1="562" y1="372" x2="610" y2="368" stroke="#52525B" strokeWidth="2" />

        {/* Base Neck Roll Trim */}
        <path
          d="M214 398 C312 418, 456 426, 612 398 L596 426 C446 448, 304 438, 226 416 Z"
          fill="#09090B"
          stroke="#27272A"
          strokeWidth="1.5"
        />

        {/* Official KYT Logo on Helmet Shell */}
        <image
          href="/kyt-logo-white.png?v=5"
          x="255"
          y="218"
          width="105"
          height="40"
        />
      </svg>
    </div>
  );
};

interface StoreArtworkProps {
  preset: 'flagship-dark' | 'gallery-white' | 'studio-red';
  storeName: string;
  district: string;
  province: string;
}

export const StoreShowroomVisual: React.FC<StoreArtworkProps> = ({
  preset,
  storeName,
  district,
  province,
}) => {
  const isDark = preset === 'flagship-dark';
  const isRedAccent = preset === 'studio-red';

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#F5F5F7] select-none">
      <svg
        viewBox="0 0 640 480"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={storeName}
      >
        <defs>
          <linearGradient id={`bg-${preset}`} x1="0" y1="0" x2="640" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? '#141416' : '#FAFAFC'} />
            <stop offset="100%" stopColor={isDark ? '#0A0A0C' : '#EAEAEE'} />
          </linearGradient>
          <linearGradient id={`floor-${preset}`} x1="320" y1="320" x2="320" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? '#1D1D20' : '#E4E4E9'} />
            <stop offset="100%" stopColor={isDark ? '#0E0E10' : '#D4D4DA'} />
          </linearGradient>
        </defs>

        <rect width="640" height="480" fill={`url(#bg-${preset})`} />

        <line x1="0" y1="330" x2="640" y2="330" stroke={isDark ? '#27272A' : '#D4D4D8'} strokeWidth="1.5" />
        <polygon points="0,330 640,330 640,480 0,480" fill={`url(#floor-${preset})`} />
        <line x1="110" y1="0" x2="110" y2="330" stroke={isDark ? '#1F1F23' : '#E4E4E7'} strokeWidth="1" />
        <line x1="530" y1="0" x2="530" y2="330" stroke={isDark ? '#1F1F23' : '#E4E4E7'} strokeWidth="1" />

        {/* Recessed Ceiling Light Panels */}
        <rect x="150" y="18" width="340" height="16" rx="2" fill="#FFFFFF" fillOpacity={isDark ? '0.9' : '1'} stroke={isDark ? '#3F3F46' : '#D4D4D8'} />
        <rect x="180" y="46" width="280" height="10" rx="2" fill="#FFFFFF" fillOpacity={isDark ? '0.55' : '0.85'} />

        {/* Wall Helmet Display Alcove Left */}
        <rect
          x="136"
          y="96"
          width="164"
          height="168"
          rx="6"
          fill={isDark ? '#18181B' : '#FFFFFF'}
          stroke={isDark ? '#2E2E32' : '#D4D4D8'}
          strokeWidth="1.5"
        />
        <rect x="136" y="96" width="164" height="4" fill="#E10600" />

        <line x1="152" y1="158" x2="284" y2="158" stroke={isDark ? '#3F3F46' : '#E4E4E7'} strokeWidth="2" />
        <line x1="152" y1="218" x2="284" y2="218" stroke={isDark ? '#3F3F46' : '#E4E4E7'} strokeWidth="2" />

        {[178, 220, 260].map((cx, idx) => (
          <g key={`h-top-${idx}`} transform={`translate(${cx - 14}, 126)`}>
            <path d="M2 24 C2 10, 12 4, 22 4 C28 4, 32 10, 32 18 L30 26 L4 26 Z" fill={idx === 1 ? '#E10600' : isDark ? '#F4F4F5' : '#18181B'} />
            <path d="M18 10 L31 14 L29 20 L18 18 Z" fill="#3F3F46" />
          </g>
        ))}
        {[178, 220, 260].map((cx, idx) => (
          <g key={`h-bot-${idx}`} transform={`translate(${cx - 14}, 186)`}>
            <path d="M2 24 C2 10, 12 4, 22 4 C28 4, 32 10, 32 18 L30 26 L4 26 Z" fill={idx === 0 ? '#18181B' : idx === 2 ? '#E10600' : '#71717A'} />
            <path d="M18 10 L31 14 L29 20 L18 18 Z" fill="#D4D4D8" />
          </g>
        ))}

        {/* Wall Brand Monolith Right with Official White KYT Logo */}
        <rect
          x="336"
          y="96"
          width="168"
          height="168"
          rx="6"
          fill="#0A0A0C"
          stroke={isRedAccent ? '#E10600' : isDark ? '#2E2E32' : '#18181B'}
          strokeWidth="1.5"
        />
        {isRedAccent && <rect x="336" y="96" width="168" height="4" fill="#E10600" />}

        <image
          href="/kyt-logo-white.png?v=5"
          x="362"
          y="124"
          width="116"
          height="44"
        />

        <text
          x="420"
          y="194"
          textAnchor="middle"
          fill="#A1A1AA"
          fontFamily="JetBrains Mono, monospace"
          fontSize="9.5"
          letterSpacing="1.5"
        >
          WORLD CLASS HELMETS
        </text>
        <line x1="372" y1="208" x2="468" y2="208" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="1" />
        <text
          x="420"
          y="228"
          textAnchor="middle"
          fill="#FFFFFF"
          fillOpacity="0.9"
          fontFamily="DM Sans, sans-serif"
          fontWeight="600"
          fontSize="10.5"
        >
          {district.toUpperCase()}
        </text>

        {/* Center Minimalist Display Table */}
        <polygon
          points="170,310 470,310 496,338 144,338"
          fill={isDark ? '#27272A' : '#FFFFFF'}
          stroke={isDark ? '#3F3F46' : '#18181B'}
          strokeWidth="2"
        />
        <rect x="144" y="338" width="352" height="12" fill="#0A0A0C" />
        <rect x="144" y="338" width="88" height="3" fill="#E10600" />
        <rect x="168" y="350" width="14" height="72" fill="#18181B" />
        <rect x="458" y="350" width="14" height="72" fill="#18181B" />

        {/* Featured Helmets on Center Table */}
        <g transform="translate(230, 276)">
          <rect x="-8" y="30" width="52" height="6" rx="1" fill="#E10600" />
          <path d="M2 28 C2 10, 14 2, 28 2 C38 2, 44 10, 44 22 L40 30 L4 30 Z" fill="#141416" />
          <path d="M26 10 L43 15 L41 23 L26 20 Z" fill="#E10600" />
        </g>
        <g transform="translate(356, 276)">
          <rect x="-8" y="30" width="52" height="6" rx="1" fill="#18181B" />
          <path d="M2 28 C2 10, 14 2, 28 2 C38 2, 44 10, 44 22 L40 30 L4 30 Z" fill="#F4F4F5" stroke="#18181B" strokeWidth="1.5" />
          <path d="M26 10 L43 15 L41 23 L26 20 Z" fill="#18181B" />
        </g>

        <ellipse cx="320" cy="426" rx="176" ry="10" fill="#000000" fillOpacity={isDark ? '0.45' : '0.12'} />
      </svg>

      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono tracking-wider text-white/95 pointer-events-none">
        <span className="truncate max-w-[68%] font-semibold">{storeName}</span>
        <span className="truncate">{province.toUpperCase()}</span>
      </div>
    </div>
  );
};
