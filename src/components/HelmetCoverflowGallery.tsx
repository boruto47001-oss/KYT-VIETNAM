import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { HelmetShowcase, Language } from '../data/kytData';

interface HelmetCoverflowGalleryProps {
  helmets: HelmetShowcase[];
  activeHelmetId: string;
  onSelectHelmet: (id: string) => void;
  lang?: Language;
}

/**
 * Exact 3D Coverflow transform formula from Motion's `gallery-odd-lights-coverflow`
 * (turn = 50deg, spread = 0.34, depth = 0.5, centerSpacing = 0.85)
 */
function computeCoverflowTransform(
  relativeOffset: number,
  itemWidth: number,
  turn = 50,
  spread = 0.34,
  depth = 0.5,
  centerSpacing = 0.85
) {
  const u = Math.max(-1, Math.min(1, relativeOffset));
  const p = Math.abs(u);
  const x = 1 - p;
  const X = Math.max(0.6, centerSpacing);

  const translateX =
    Math.sign(u) * (X * p + ((Math.max(0, 1.05 - X) / 0.75) * x * (1 - x * x))) * itemWidth +
    (relativeOffset - u) * itemWidth * spread;

  const translateZ = -p * itemWidth * depth;
  const rotateY = -u * turn;

  return {
    x: Math.round(translateX * 100) / 100,
    z: Math.round(translateZ * 100) / 100,
    rotateY: Math.round(rotateY * 100) / 100,
  };
}

export const HelmetCoverflowGallery: React.FC<HelmetCoverflowGalleryProps> = ({
  helmets,
  activeHelmetId,
  onSelectHelmet,
  lang = 'VIE',
}) => {
  const isEn = lang === 'ENG';
  const activeHelmet = helmets.find((h) => h.id === activeHelmetId) || helmets[0];
  const slides = activeHelmet.slides;

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [cardWidth, setCardWidth] = useState<number>(280);

  // Measure responsive card width for accurate 3D Coverflow spacing
  const stageRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const updateSize = () => {
      const vw = window.innerWidth;
      if (vw < 480) {
        setCardWidth(200);
      } else if (vw < 768) {
        setCardWidth(240);
      } else {
        setCardWidth(300);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Reset to first slide when switching between TT-REVO, TTR-JET, TIGER JET
  const handleModelSwitch = (id: string) => {
    onSelectHelmet(id);
    setActiveIndex(0);
    setIsDetailOpen(false);
  };

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape' && isDetailOpen) setIsDetailOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePrev, handleNext, isDetailOpen]);

  // Pointer drag/swipe support for mobile & desktop
  const dragStartX = useRef<number | null>(null);
  const dragDeltaX = useRef<number>(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isDetailOpen) return;
    dragStartX.current = e.clientX;
    dragDeltaX.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    dragDeltaX.current = e.clientX - dragStartX.current;
  };

  const handlePointerUp = () => {
    if (dragStartX.current === null) return;
    const delta = dragDeltaX.current;
    dragStartX.current = null;
    dragDeltaX.current = 0;
    if (Math.abs(delta) > 40) {
      if (delta < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const currentSlide = slides[activeIndex] || slides[0];
  const cardHeight = Math.round(cardWidth * 1.18);

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl bg-[#0D0D0F] border border-white/10 overflow-hidden relative select-none shadow-2xl">
      {/* Subtle KYT Crimson Studio Spotlight Backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 44%, rgba(225, 6, 0, 0.24) 0%, rgba(184, 18, 27, 0.08) 42%, rgba(10, 10, 10, 0) 75%)',
        }}
        aria-hidden="true"
      />

      {/* TOP BAR: Model Switcher (TT-REVO · TTR-JET · TIGER JET) & Counter */}
      <div className="relative z-20 px-4 sm:px-7 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        {/* 3 Helmet Model Tabs */}
        <div
          role="tablist"
          aria-label="Chọn dòng nón KYT chủ lực"
          className="flex items-center gap-1.5 p-1 bg-black/70 border border-white/10 rounded-xl overflow-x-auto max-w-full"
        >
          {helmets.map((helmet) => {
            const isSelected = helmet.id === activeHelmet.id;
            return (
              <button
                key={helmet.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleModelSwitch(helmet.id)}
                className={`px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-bold tracking-wider uppercase rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#E10600] text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {helmet.shortName}
              </button>
            );
          })}
        </div>

        {/* Right Controls: 5-Thumb Strip + Prev/Next Buttons */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Odd Lights Style Mini Thumbnail Strip */}
          <div className="hidden sm:flex items-center gap-1.5" aria-label="Danh sách 5 hình">
            {slides.map((slide, idx) => {
              const isThumbActive = idx === activeIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => setActiveIndex(idx)}
                  title={`${slide.title} (${idx + 1}/${slides.length})`}
                  className={`w-9 h-9 rounded-md bg-[#E7E7E5] p-1 transition-all cursor-pointer overflow-hidden ${
                    isThumbActive
                      ? 'outline-1 outline-white outline-offset-[3px] opacity-100 scale-105'
                      : 'opacity-50 hover:opacity-85'
                  }`}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>

          {/* Prev / Next Step Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Hình trước"
              className="w-9 h-9 rounded-lg bg-white/[0.07] hover:bg-[#E10600] text-white border border-white/10 transition-colors flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono tabular-nums text-neutral-300 px-1.5">
              {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Xem hình tiếp theo"
              className="w-9 h-9 rounded-lg bg-white/[0.07] hover:bg-[#E10600] text-white border border-white/10 transition-colors flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN STAGE: 3D Coverflow OR Odd Lights Detail View */}
      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full h-[340px] sm:h-[440px] md:h-[480px] flex items-center justify-center overflow-hidden touch-pan-y"
        style={{ perspective: '1200px' }}
      >
        <AnimatePresence mode="wait">
          {!isDetailOpen ? (
            /* 3D COVERFLOW STAGE (Motion gallery-odd-lights-coverflow physics) */
            <motion.div
              key={`coverflow-${activeHelmet.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full flex items-center justify-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {slides.map((slide, index) => {
                const relativeOffset = index - activeIndex;
                const isCenter = index === activeIndex;
                const { x, z, rotateY } = computeCoverflowTransform(relativeOffset, cardWidth);
                const zIndex = 20 - Math.abs(relativeOffset);

                return (
                  <motion.div
                    key={slide.id}
                    data-gallery-item
                    onClick={() => {
                      if (isCenter) {
                        setIsDetailOpen(true);
                      } else {
                        setActiveIndex(index);
                      }
                    }}
                    animate={{
                      x,
                      z,
                      rotateY,
                      scale: isCenter ? 1 : 0.92,
                      opacity: Math.abs(relativeOffset) > 3 ? 0 : isCenter ? 1 : 0.82,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 340,
                      damping: 36,
                      mass: 0.9,
                    }}
                    style={{
                      width: cardWidth,
                      height: cardHeight,
                      zIndex,
                      transformStyle: 'preserve-3d',
                    }}
                    className={`absolute rounded-2xl bg-[#E7E7E5] text-[#0A0A0A] p-4 sm:p-6 flex flex-col justify-between cursor-pointer shadow-[0_28px_60px_rgba(0,0,0,0.65)] transition-shadow ${
                      isCenter
                        ? 'ring-2 ring-[#E10600] shadow-[0_32px_80px_rgba(225,6,0,0.28)]'
                        : 'hover:bg-[#F2F2F0]'
                    }`}
                  >
                    {/* Card Top Metadata (Odd Lights SKU + Expand Icon) */}
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-neutral-600">
                      <span>{slide.sku}</span>
                      {isCenter ? (
                        <span className="inline-flex items-center gap-1 text-[#E10600] font-semibold">
                          <Maximize2 className="w-3 h-3" />
                          <span className="hidden sm:inline">{isEn ? 'Details' : 'Chi tiết'}</span>
                        </span>
                      ) : (
                        <span>0{index + 1}</span>
                      )}
                    </div>

                    {/* Helmet Studio Image */}
                    <div className="my-auto w-full aspect-square flex items-center justify-center p-1 sm:p-2">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        draggable={false}
                        className="w-full h-full object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.22)] transition-transform duration-300"
                      />
                    </div>

                    {/* Card Bottom Label */}
                    <div className="pt-2 border-t border-black/10 flex items-center justify-between gap-2">
                      <p className="text-xs sm:text-sm font-bold tracking-tight text-[#0A0A0A] truncate">
                        {slide.title}
                      </p>
                      <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                        {index + 1}/{slides.length}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            /* ODD LIGHTS DETAIL VIEW (.detail + .strip + .spec) */
            <motion.div
              key={`detail-${activeHelmet.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.22 }}
              className="w-full h-full px-4 sm:px-8 py-4 sm:py-6 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-center overflow-y-auto"
            >
              {/* Left: .detail Large Studio Card */}
              <div className="md:col-span-5 flex items-center justify-center">
                <div className="w-full max-w-[260px] sm:max-w-[320px] aspect-[4/4.4] rounded-2xl bg-[#E7E7E5] p-5 sm:p-6 flex flex-col justify-between shadow-2xl">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-neutral-600">
                    <span>{currentSlide.sku}</span>
                    <span className="text-[#E10600] font-bold">{activeHelmet.shortName}</span>
                  </div>
                  <div className="my-auto w-full aspect-square flex items-center justify-center">
                    <img
                      src={currentSlide.imageUrl}
                      alt={currentSlide.title}
                      className="w-full h-full object-contain drop-shadow-[0_20px_28px_rgba(0,0,0,0.25)]"
                    />
                  </div>
                  <p className="text-xs font-mono uppercase tracking-wider text-neutral-600 text-center">
                    {currentSlide.title}
                  </p>
                </div>
              </div>

              {/* Right: .strip (Top) + .spec dl (Bottom) */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-5 text-left">
                {/* .strip Thumbnail Strip */}
                <div className="space-y-2">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                    {isEn
                      ? `SELECT PHOTO IN 5-IMAGE SET (${activeIndex + 1}/${slides.length})`
                      : `CHỌN HÌNH TRONG BỘ 5 ẢNH (${activeIndex + 1}/${slides.length})`}
                  </p>
                  <div className="flex items-center gap-2.5 overflow-x-auto py-1.5 px-1">
                    {slides.map((slide, idx) => {
                      const active = idx === activeIndex;
                      return (
                        <button
                          key={slide.id}
                          onClick={() => setActiveIndex(idx)}
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-[#E7E7E5] p-1.5 shrink-0 cursor-pointer transition-all ${
                            active
                              ? 'outline-1 outline-white outline-offset-[3px] scale-105'
                              : 'opacity-55 hover:opacity-90'
                          }`}
                        >
                          <img
                            src={slide.imageUrl}
                            alt={slide.title}
                            className="w-full h-full object-contain"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* .spec Header & Monospace DL Specification Table */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-[#E10600]">
                      {currentSlide.sku} · {isEn ? activeHelmet.seriesEn : activeHelmet.series}
                    </p>
                    <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-0.5">
                      {currentSlide.title}
                    </h3>
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 pt-3 border-t border-white/20 text-xs font-mono">
                    <div>
                      <dt className="text-neutral-400 uppercase">
                        {isEn ? 'CERTIFICATION' : 'CHỨNG NHẬN'}
                      </dt>
                      <dd className="text-white font-semibold mt-0.5">
                        {isEn ? activeHelmet.certificationEn : activeHelmet.certification}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-neutral-400 uppercase">
                        {isEn ? 'WEIGHT' : 'TRỌNG LƯỢNG'}
                      </dt>
                      <dd className="text-white font-semibold mt-0.5">{activeHelmet.weight}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-400 uppercase">
                        {isEn ? 'SHELL MATERIAL' : 'CẤU TRÚC VỎ'}
                      </dt>
                      <dd className="text-white font-semibold mt-0.5">
                        {isEn ? activeHelmet.shellMaterialEn : activeHelmet.shellMaterial}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-neutral-400 uppercase">
                        {isEn ? 'VISOR SYSTEM' : 'HỆ KÍNH'}
                      </dt>
                      <dd className="text-white font-semibold mt-0.5">
                        {isEn ? activeHelmet.visorSpecEn : activeHelmet.visorSpec}
                      </dd>
                    </div>
                  </dl>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDetailOpen(false)}
                      className="px-5 py-2 text-xs font-mono uppercase tracking-wider text-white border border-white/80 hover:bg-white hover:text-black rounded-full transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Close details' : 'Đóng chi tiết'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM MASTHEAD BAR (Odd Lights .masthead style + Mobile Thumbnail Strip) */}
      <div className="relative z-20 px-4 sm:px-7 py-4 sm:py-5 border-t border-white/[0.08] bg-black/40 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        {/* Left: Editorial Model Title */}
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-none">
            {activeHelmet.shortName}
          </h2>
          <span className="text-xs font-mono uppercase tracking-wider text-[#E10600]">
            {isEn ? activeHelmet.seriesEn : activeHelmet.series}
          </span>
        </div>

        {/* Mobile Thumbnail Strip (Visible on mobile for 1-tap switching across 5 photos) */}
        <div className="flex sm:hidden items-center justify-center gap-2 py-1">
          {slides.map((slide, idx) => {
            const isThumbActive = idx === activeIndex;
            return (
              <button
                key={slide.id}
                onClick={() => setActiveIndex(idx)}
                className={`w-11 h-11 rounded-lg bg-[#E7E7E5] p-1 transition-all cursor-pointer ${
                  isThumbActive
                    ? 'outline-1 outline-white outline-offset-[2px] opacity-100'
                    : 'opacity-50'
                }`}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-contain"
                />
              </button>
            );
          })}
        </div>

        {/* Right: Active Slide SKU & Next Prompt */}
        <div className="flex items-center justify-between sm:justify-end gap-4 text-right font-mono text-xs uppercase tracking-wider">
          <div>
            <span className="block text-neutral-400">{currentSlide.sku}</span>
            <span className="text-white font-semibold">{currentSlide.title}</span>
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="px-3.5 py-2 rounded-lg bg-[#E10600] hover:bg-[#B80500] text-white font-sans font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>{isEn ? 'Next' : 'Xem tiếp'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
