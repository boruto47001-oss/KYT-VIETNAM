import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { Ruler, Check, Minus, Plus, Info, ShieldCheck } from 'lucide-react';
import {
  HELMET_SIZE_GUIDES,
  HelmetSizeModel,
  HelmetSizeRow,
  Language,
} from '../data/kytData';
import { trackKytEvent } from '../lib/tracking';

interface HelmetSizeSectionProps {
  lang: Language;
}

const MIN_RULER_CM = 54;
const MAX_RULER_CM = 64;
const RULER_TICKS = [54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64];

// All 0.5 cm steps from 54.0 to 64.0 for the whole-number rolling drum
const ALL_CM_STEPS: number[] = Array.from(
  { length: (MAX_RULER_CM - MIN_RULER_CM) * 2 + 1 },
  (_, i) => MIN_RULER_CM + i * 0.5
);

const ROLL_ITEM_HEIGHT = 48; // Exact 48px row height so whole-number roll never misaligns

export const HelmetSizeSection: React.FC<HelmetSizeSectionProps> = ({ lang }) => {
  const isEn = lang === 'ENG';

  const [selectedModelId, setSelectedModelId] = useState<string>(HELMET_SIZE_GUIDES[0].id);
  const [headCm, setHeadCm] = useState<number>(57);
  const [focusedSizeLabel, setFocusedSizeLabel] = useState<string | null>(null);

  const rulerTrackRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartYRef = useRef<number | null>(null);
  const dragStartCmRef = useRef<number>(57);

  const activeModel: HelmetSizeModel = useMemo(
    () => HELMET_SIZE_GUIDES.find((m) => m.id === selectedModelId) || HELMET_SIZE_GUIDES[0],
    [selectedModelId]
  );

  const modelMinCm = activeModel.sizes[0].minCm;
  const modelMaxCm = activeModel.sizes[activeModel.sizes.length - 1].maxCm;
  const isOutOfBounds = headCm < modelMinCm || headCm > modelMaxCm;

  // 1. Exact range matches (e.g. headCm falls inside [row.minCm, row.maxCm])
  const exactMatchingSizes: HelmetSizeRow[] = useMemo(() => {
    return activeModel.sizes.filter((row) => headCm >= row.minCm && headCm <= row.maxCm);
  }, [activeModel, headCm]);

  // 2. Half-centimeter bridge matches (fixes 55.5, 56.5, 57.5 on NF-R, D-CITY, COUGAR, etc.)
  const bridgeMatchingSizes: HelmetSizeRow[] = useMemo(() => {
    if (exactMatchingSizes.length > 0 || isOutOfBounds) return [];
    return activeModel.sizes.filter(
      (row) => Math.abs(headCm - row.maxCm) <= 0.5 || Math.abs(row.minCm - headCm) <= 0.5
    );
  }, [activeModel, headCm, exactMatchingSizes, isOutOfBounds]);

  // Combined matched sizes for 1:1 synchronization
  const matchingSizes: HelmetSizeRow[] = useMemo(() => {
    return exactMatchingSizes.length > 0 ? exactMatchingSizes : bridgeMatchingSizes;
  }, [exactMatchingSizes, bridgeMatchingSizes]);

  const isHalfStepBetweenDiscreteSizes =
    exactMatchingSizes.length === 0 && bridgeMatchingSizes.length > 0;

  // Find closest size if headCm is outside the model's min/max range
  const closestSize: HelmetSizeRow = useMemo(() => {
    if (matchingSizes.length > 0) {
      if (focusedSizeLabel) {
        const focused = matchingSizes.find((r) => r.size === focusedSizeLabel);
        if (focused) return focused;
      }
      return matchingSizes[matchingSizes.length - 1];
    }
    const minRow = activeModel.sizes[0];
    const maxRow = activeModel.sizes[activeModel.sizes.length - 1];
    if (headCm < minRow.minCm) return minRow;
    return maxRow;
  }, [activeModel, headCm, matchingSizes, focusedSizeLabel]);

  const handleSelectModel = (model: HelmetSizeModel) => {
    setSelectedModelId(model.id);
    setFocusedSizeLabel(null);
    const min = model.sizes[0].minCm;
    const max = model.sizes[model.sizes.length - 1].maxCm;
    if (headCm < min || headCm > max) {
      setHeadCm(model.sizes[0].minCm);
    }
    trackKytEvent({
      eventType: 'size_guide_interact',
      targetId: model.id,
      targetLabel: `Size Guide: ${model.name}`,
      category: 'Helmet Size Selector',
      lang,
    });
  };

  const updateCmValue = (nextCm: number, clearFocus = true) => {
    const clamped = Math.max(MIN_RULER_CM, Math.min(MAX_RULER_CM, Math.round(nextCm * 2) / 2));
    setHeadCm(clamped);
    if (clearFocus) {
      setFocusedSizeLabel(null);
    }
  };

  // Click a row in the size table -> 1:1 roll whole number to that size's measurement
  const handleSelectSizeRow = (row: HelmetSizeRow) => {
    setFocusedSizeLabel(row.size);
    const mid = Math.round(((row.minCm + row.maxCm) / 2) * 2) / 2;
    setHeadCm(mid);
    trackKytEvent({
      eventType: 'size_guide_interact',
      targetId: `${activeModel.id}_${row.size}`,
      targetLabel: `${activeModel.name} - Size ${row.size} (${row.label})`,
      category: 'Size Table Click',
      lang,
    });
  };

  // Convert pointer X position on the custom tape measure track to cm
  const updateFromPointerClientX = (clientX: number) => {
    if (!rulerTrackRef.current) return;
    const rect = rulerTrackRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawCm = MIN_RULER_CM + ratio * (MAX_RULER_CM - MIN_RULER_CM);
    updateCmValue(rawCm, true);
  };

  const handleRulerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPointerClientX(e.clientX);
  };

  const handleRulerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    updateFromPointerClientX(e.clientX);
  };

  const handleRulerPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if not captured
    }
  };

  // Allow vertical drag or mouse wheel on the Whole-Number Roll Box
  const handleDrumWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      updateCmValue(headCm - 0.5, true);
    } else if (e.deltaY < 0) {
      updateCmValue(headCm + 0.5, true);
    }
  };

  const handleDrumPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartYRef.current = e.clientY;
    dragStartCmRef.current = headCm;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDrumPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null) return;
    const deltaY = dragStartYRef.current - e.clientY;
    const steps = Math.round(deltaY / 18) * 0.5;
    updateCmValue(dragStartCmRef.current + steps, true);
  };

  const handleDrumPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null) return;
    dragStartYRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const needlePercent = ((headCm - MIN_RULER_CM) / (MAX_RULER_CM - MIN_RULER_CM)) * 100;
  const formattedCm = Number.isInteger(headCm) ? String(headCm) : headCm.toFixed(1);
  const activeStepIndex = Math.max(
    0,
    ALL_CM_STEPS.findIndex((v) => Math.abs(v - headCm) < 0.05)
  );

  return (
    <section
      id="size-guide"
      className="py-14 sm:py-22 bg-[#0A0A0A] text-white border-t border-white/[0.08] overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400">
              <span className="text-[#E10600] font-bold">03</span>
              <span aria-hidden="true">·</span>
              <span>KYT OFFICIAL HELMET SIZING SYSTEM</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {isEn ? 'Helmet Size Conversion Chart' : 'Bảng quy đổi size nón'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed">
            {isEn
              ? 'Select your KYT helmet line and drag the ruler or roll the number to match your head circumference.'
              : 'Chọn dòng nón KYT bên dưới và kéo thước đo để đối chiếu trực tiếp với bảng quy đổi size chính hãng.'}
          </p>
        </motion.div>

        {/* STEP 1: CHỌN DÒNG NÓN KYT (11 MODELS) */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl bg-[#111115] border border-white/10 p-4 sm:p-6 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-[#E10600] text-white text-xs font-mono font-bold flex items-center justify-center">
                1
              </span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                {isEn
                  ? 'Select KYT Helmet Line (11 Models)'
                  : 'Chọn dòng nón KYT cần tra size (11 dòng nón)'}
              </span>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {isEn ? 'Active line:' : 'Đang chọn:'}{' '}
              <strong className="text-white">{activeModel.name}</strong> ·{' '}
              <span className="text-[#FF1E1A]">
                {isEn ? activeModel.categoryEn : activeModel.category}
              </span>
            </span>
          </div>

          <div
            role="tablist"
            aria-label={isEn ? 'Select KYT Helmet Model' : 'Chọn dòng nón KYT'}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5"
          >
            {HELMET_SIZE_GUIDES.map((model, idx) => {
              const isSelected = model.id === activeModel.id;
              const minCm = model.sizes[0].minCm;
              const maxCm = model.sizes[model.sizes.length - 1].maxCm;

              return (
                <button
                  key={model.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectModel(model)}
                  className={`group px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-[#E10600] text-white border-[#E10600] shadow-lg shadow-[#E10600]/25'
                      : 'bg-[#17171D] hover:bg-[#1E1E26] text-neutral-200 border-white/[0.08] hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] font-mono font-semibold ${
                        isSelected ? 'text-white/85' : 'text-neutral-500'
                      }`}
                    >
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[10px] font-mono tabular-nums ${
                        isSelected ? 'text-white/90' : 'text-neutral-400'
                      }`}
                    >
                      {minCm}–{maxCm}cm
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold tracking-tight truncate">
                    {model.name}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* STEP 2 & 3: WHOLE-NUMBER ROLL RULER + 1:1 SIZE CONVERSION TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT COLUMN (7 COLS): WHOLE-NUMBER ROLL DISPLAY + DRAGGABLE RULER */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 rounded-2xl bg-[#111115] border border-white/10 p-5 sm:p-7 flex flex-col justify-between space-y-6"
          >
            {/* Top Header + Whole-Number Roll Counter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#E10600] text-white text-xs font-mono font-bold flex items-center justify-center">
                    2
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    {isEn ? 'Head Circumference Roller' : 'Thước kéo & Cuộn số đo vòng đầu'}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  {isEn
                    ? `Head Circumference · ${activeModel.name}`
                    : `Số đo vòng đầu · ${activeModel.name}`}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {isEn
                    ? 'Measure 2 cm above your eyebrows around the widest part of your head.'
                    : 'Đặt dây đo vòng qua trán (cách chân mày khoảng 2 cm) tại phần rộng nhất của đầu.'}
                </p>
              </div>

              {/* WHOLE-NUMBER ROLL DISPLAY (Roll nguyên cả con số mượt mà, không tách rời ký tự) */}
              <div className="flex items-center justify-between sm:justify-center gap-2.5 bg-[#09090C] border border-white/15 rounded-2xl p-2.5 shrink-0 shadow-lg">
                <button
                  type="button"
                  onClick={() => updateCmValue(headCm - 0.5, true)}
                  disabled={headCm <= MIN_RULER_CM}
                  aria-label={isEn ? 'Decrease 0.5 cm' : 'Giảm 0.5 cm'}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/[0.06] hover:bg-[#E10600] disabled:opacity-30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <Minus className="w-4 h-4" />
                </button>

                {/* Single Unified Whole-Number Drum Window (48px exact row height) */}
                <div
                  onWheel={handleDrumWheel}
                  onPointerDown={handleDrumPointerDown}
                  onPointerMove={handleDrumPointerMove}
                  onPointerUp={handleDrumPointerUp}
                  title={
                    isEn
                      ? 'Scroll or drag up/down to roll the measurement'
                      : 'Lăn chuột hoặc kéo lên/xuống để cuộn cả số đo'
                  }
                  className="px-2 flex flex-col items-center cursor-ns-resize touch-none select-none"
                >
                  <div
                    className="relative w-[124px] overflow-hidden rounded-xl bg-[#14141A] border border-white/10 shadow-inner"
                    style={{ height: `${ROLL_ITEM_HEIGHT}px` }}
                  >
                    {/* Subtle Top & Bottom Drum Depth Gradients */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-2.5 bg-gradient-to-b from-black/75 to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2.5 bg-gradient-to-t from-black/75 to-transparent z-10" />

                    {/* Whole Number Vertical Strip */}
                    <div
                      className="w-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                      style={{
                        transform: `translate3d(0, -${activeStepIndex * ROLL_ITEM_HEIGHT}px, 0)`,
                      }}
                    >
                      {ALL_CM_STEPS.map((stepVal) => {
                        const displayNum = Number.isInteger(stepVal)
                          ? String(stepVal)
                          : stepVal.toFixed(1);
                        return (
                          <div
                            key={stepVal}
                            style={{ height: `${ROLL_ITEM_HEIGHT}px` }}
                            className="w-full flex items-center justify-center gap-1 font-mono tabular-nums"
                          >
                            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
                              {displayNum}
                            </span>
                            <span className="text-xs font-semibold text-neutral-400 leading-none mt-1">
                              cm
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mt-1">
                    {isEn ? 'Head Size (cm)' : 'Chu vi vòng đầu'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => updateCmValue(headCm + 0.5, true)}
                  disabled={headCm >= MAX_RULER_CM}
                  aria-label={isEn ? 'Increase 0.5 cm' : 'Tăng 0.5 cm'}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/[0.06] hover:bg-[#E10600] disabled:opacity-30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Tailor Tape Ruler Track */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>
                  {isEn
                    ? 'Drag anywhere on the ruler or slider below'
                    : 'Kéo trực tiếp trên mặt thước hoặc thanh trượt bên dưới'}
                </span>
                <span className="text-neutral-300">
                  {isEn
                    ? `${activeModel.name} range: ${modelMinCm}–${modelMaxCm} cm`
                    : `Dải size ${activeModel.name}: ${modelMinCm}–${modelMaxCm} cm`}
                </span>
              </div>

              <div
                ref={rulerTrackRef}
                onPointerDown={handleRulerPointerDown}
                onPointerMove={handleRulerPointerMove}
                onPointerUp={handleRulerPointerUp}
                className="relative h-28 rounded-2xl bg-[#09090C] border border-white/15 px-5 sm:px-7 flex flex-col justify-end pb-3.5 select-none cursor-ew-resize overflow-hidden touch-none shadow-inner"
              >
                {/* Highlighted Valid Range Zone on the Ruler */}
                <div
                  className="absolute top-0 bottom-0 bg-[#E10600]/[0.12] border-x border-[#E10600]/40 pointer-events-none transition-all duration-150"
                  style={{
                    left: `${((modelMinCm - MIN_RULER_CM) / (MAX_RULER_CM - MIN_RULER_CM)) * 100}%`,
                    width: `${((modelMaxCm - modelMinCm) / (MAX_RULER_CM - MIN_RULER_CM)) * 100}%`,
                  }}
                />

                {/* Active Needle Indicator Line & Floating Tag */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#E10600] z-20 pointer-events-none transition-all duration-150"
                  style={{ left: `${needlePercent}%` }}
                >
                  <div className="-translate-x-1/2 mt-2.5 px-2.5 py-1 rounded-md bg-[#E10600] text-white text-xs font-mono font-extrabold whitespace-nowrap shadow-lg">
                    {formattedCm} cm
                  </div>
                </div>

                {/* Ruler Graduations (54 cm -> 64 cm with 0.5 cm sub-ticks) */}
                <div className="relative z-10 w-full flex items-end justify-between">
                  {RULER_TICKS.map((cmTick, idx) => {
                    const isCurrentInt = Math.abs(headCm - cmTick) < 0.1;
                    const isWithinModel = cmTick >= modelMinCm && cmTick <= modelMaxCm;
                    const halfTick = cmTick + 0.5;
                    const isCurrentHalf = Math.abs(headCm - halfTick) < 0.1;

                    return (
                      <React.Fragment key={cmTick}>
                        <div className="flex flex-col items-center gap-1.5">
                          <div
                            className={`w-0.5 rounded-full transition-all ${
                              isCurrentInt
                                ? 'h-8 bg-[#E10600]'
                                : isWithinModel
                                  ? 'h-5 bg-white/80'
                                  : 'h-3 bg-white/20'
                            }`}
                          />
                          <span
                            className={`text-xs font-mono tabular-nums transition-colors ${
                              isCurrentInt
                                ? 'text-[#FF1E1A] font-extrabold'
                                : isWithinModel
                                  ? 'text-white font-semibold'
                                  : 'text-neutral-600'
                            }`}
                          >
                            {cmTick}
                          </span>
                        </div>

                        {idx < RULER_TICKS.length - 1 && (
                          <div className="flex flex-col items-center pb-5">
                            <div
                              className={`w-0.5 rounded-full transition-all ${
                                isCurrentHalf
                                  ? 'h-6 bg-[#E10600]'
                                  : halfTick >= modelMinCm && halfTick <= modelMaxCm
                                    ? 'h-2.5 bg-white/40'
                                    : 'h-1.5 bg-white/15'
                              }`}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Accessible Range Slider */}
              <div className="px-1">
                <label htmlFor="helmet-cm-slider" className="sr-only">
                  {isEn
                    ? 'Drag to adjust head circumference in cm'
                    : 'Kéo để chỉnh số đo vòng đầu (cm)'}
                </label>
                <input
                  id="helmet-cm-slider"
                  type="range"
                  min={MIN_RULER_CM}
                  max={MAX_RULER_CM}
                  step={0.5}
                  value={headCm}
                  onChange={(e) => updateCmValue(parseFloat(e.target.value), true)}
                  className="w-full h-2 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#E10600]"
                />
              </div>
            </div>

            {/* Live Recommendation Box */}
            <div className="rounded-2xl bg-[#0A0A0A] border border-white/15 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
                    <Ruler className="w-3.5 h-3.5 text-[#E10600]" />
                    <span>
                      {isEn ? 'Recommended Size Result' : 'Kết quả quy đổi size đề xuất'}
                    </span>
                  </div>

                  {!isOutOfBounds && matchingSizes.length > 0 ? (
                    <div className="space-y-1.5">
                      <p className="text-sm sm:text-base text-neutral-200 leading-snug">
                        {isEn ? 'Head circumference ' : 'Số đo vòng đầu '}
                        <strong className="font-mono text-white">{formattedCm} cm</strong>
                        {isEn
                          ? ` on KYT ${activeModel.name} matches:`
                          : ` với dòng ${activeModel.name} phù hợp:`}
                      </p>

                      {matchingSizes.length > 1 && (
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          {isHalfStepBetweenDiscreteSizes
                            ? isEn
                              ? `${formattedCm} cm sits right between Size ${matchingSizes[0].size} (${matchingSizes[0].label}) and Size ${matchingSizes[matchingSizes.length - 1].size} (${matchingSizes[matchingSizes.length - 1].label}). Pick ${matchingSizes[0].size} for a snug cheek fit or ${matchingSizes[matchingSizes.length - 1].size} for extra comfort.`
                              : `Số đo ${formattedCm} cm nằm giữa Size ${matchingSizes[0].size} (${matchingSizes[0].label}) và Size ${matchingSizes[matchingSizes.length - 1].size} (${matchingSizes[matchingSizes.length - 1].label}). Bạn có thể chọn Size ${matchingSizes[0].size} nếu thích đội ôm sát hoặc Size ${matchingSizes[matchingSizes.length - 1].size} nếu thích thoải mái.`
                            : isEn
                              ? `${formattedCm} cm overlaps Size ${matchingSizes.map((s) => s.size).join(' & ')}. Choose ${matchingSizes[0].size} for a snug fit or ${matchingSizes[matchingSizes.length - 1].size} for a relaxed fit.`
                              : `Số đo ${formattedCm} cm giao nhau giữa Size ${matchingSizes.map((s) => s.size).join(' và ')}. Chọn Size ${matchingSizes[0].size} nếu thích ôm sát hoặc Size ${matchingSizes[matchingSizes.length - 1].size} nếu thích thoải mái.`}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-amber-300 leading-relaxed">
                      {headCm < modelMinCm
                        ? isEn
                          ? `${formattedCm} cm is below ${activeModel.name}'s standard range (${modelMinCm}–${modelMaxCm} cm). Closest size is Size ${closestSize.size} (${closestSize.label}).`
                          : `Số đo ${formattedCm} cm nhỏ hơn dải đo chuẩn của ${activeModel.name} (${modelMinCm}–${modelMaxCm} cm). Size gần nhất là Size ${closestSize.size} (${closestSize.label}).`
                        : isEn
                          ? `${formattedCm} cm is above ${activeModel.name}'s standard range (${modelMinCm}–${modelMaxCm} cm). Closest size is Size ${closestSize.size} (${closestSize.label}).`
                          : `Số đo ${formattedCm} cm lớn hơn dải đo chuẩn của ${activeModel.name} (${modelMinCm}–${modelMaxCm} cm). Size gần nhất là Size ${closestSize.size} (${closestSize.label}).`}
                    </p>
                  )}
                </div>

                {/* Matched Size Badges */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {!isOutOfBounds && matchingSizes.length > 0 ? (
                    matchingSizes.map((m, index) => {
                      const fitHint =
                        matchingSizes.length > 1
                          ? index === 0
                            ? isEn
                              ? 'SNUG FIT'
                              : 'ÔM SÁT'
                            : isEn
                              ? 'COMFORT'
                              : 'THOẢI MÁI'
                          : 'SIZE';

                      return (
                        <div
                          key={m.size}
                          className="px-4 py-2.5 rounded-xl bg-[#E10600] text-white text-center min-w-[84px] shadow-lg shadow-[#E10600]/25"
                        >
                          <div className="text-[10px] font-mono uppercase tracking-wider text-white/85 font-semibold">
                            {fitHint}
                          </div>
                          <div className="text-xl sm:text-2xl font-extrabold font-mono tracking-tight">
                            {m.size}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-center min-w-[84px]">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                        {isEn ? 'CLOSEST' : 'GẦN NHẤT'}
                      </div>
                      <div className="text-xl font-extrabold font-mono">{closestSize.size}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN (5 COLS): CLEAN 1:1 SIZE CONVERSION TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 rounded-2xl bg-[#111115] border border-white/10 p-5 sm:p-7 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-1.5 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#E10600] text-white text-xs font-mono font-bold flex items-center justify-center">
                    3
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    {isEn ? 'Interactive Size Chart' : 'Bảng size chi tiết theo dòng nón'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">
                  {isEn ? 'Click size to roll number' : 'Chạm vào size để cuộn số'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                {isEn
                  ? `KYT ${activeModel.name} Size Chart`
                  : `Bảng quy đổi size ${activeModel.name}`}
              </h3>
            </div>

            {/* Table Column Headers */}
            <div className="grid grid-cols-12 px-3.5 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              <div className="col-span-4">{isEn ? 'Helmet Size' : 'Size nón'}</div>
              <div className="col-span-4">{isEn ? 'Head (cm)' : 'Chu vi đầu'}</div>
              <div className="col-span-4 text-right">{isEn ? 'Fit Status' : 'Trạng thái'}</div>
            </div>

            {/* Interactive Size Rows */}
            <div className="space-y-2.5 flex-1 flex flex-col justify-center">
              {activeModel.sizes.map((row) => {
                const matchIndex = matchingSizes.findIndex((m) => m.size === row.size);
                const isMatched = !isOutOfBounds && matchIndex !== -1;
                const isPrimaryFocused =
                  isMatched && (!focusedSizeLabel || focusedSizeLabel === row.size);

                let statusBadgeText = isEn ? 'Matched' : 'Chuẩn size';
                if (isMatched && matchingSizes.length > 1) {
                  statusBadgeText =
                    matchIndex === 0
                      ? isEn
                        ? 'Snug Fit'
                        : 'Đội ôm sát'
                      : isEn
                        ? 'Comfort Fit'
                        : 'Đội thoải mái';
                }

                return (
                  <button
                    key={row.size}
                    type="button"
                    onClick={() => handleSelectSizeRow(row)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer grid grid-cols-12 items-center gap-2 ${
                      isMatched
                        ? isPrimaryFocused
                          ? 'bg-[#E10600] text-white border-[#E10600] shadow-lg shadow-[#E10600]/20'
                          : 'bg-[#E10600]/20 text-white border-[#E10600]/60'
                        : 'bg-[#0A0A0A] hover:bg-white/[0.04] text-neutral-300 border-white/10 hover:border-white/25'
                    }`}
                  >
                    {/* Col 1: Size Badge + Label */}
                    <div className="col-span-4 flex items-center gap-2.5">
                      <span
                        className={`w-10 h-10 rounded-lg font-mono font-extrabold text-sm flex items-center justify-center shrink-0 ${
                          isMatched
                            ? isPrimaryFocused
                              ? 'bg-black/25 text-white'
                              : 'bg-[#E10600] text-white'
                            : 'bg-white/[0.06] text-white'
                        }`}
                      >
                        {row.size}
                      </span>
                      <span className="text-sm font-bold tracking-tight">Size {row.size}</span>
                    </div>

                    {/* Col 2: CM Range */}
                    <div className="col-span-4">
                      <span
                        className={`text-xs sm:text-sm font-mono font-bold tabular-nums ${
                          isMatched ? 'text-white' : 'text-neutral-300'
                        }`}
                      >
                        {row.label}
                      </span>
                    </div>

                    {/* Col 3: Match Status */}
                    <div className="col-span-4 flex items-center justify-end">
                      {isMatched ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/25 text-[11px] font-mono font-bold uppercase tracking-wider text-white">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>{statusBadgeText}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-neutral-500">
                          {isEn ? 'Select' : 'Chọn xem'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Special Fitting Note for TT-REVO or General Fitting Advice */}
            {activeModel.noteVie ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{isEn ? activeModel.noteEng : activeModel.noteVie}</span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-neutral-400 leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                <span>
                  {isEn
                    ? 'Pro tip: If your measurement falls on a .5 cm mark between two sizes, choose the smaller size for high-speed stability or the larger size for daily commuting comfort.'
                    : 'Lưu ý: Nếu số đo lẻ .5 cm nằm giữa 2 size, hãy chọn size nhỏ hơn nếu bạn hay đi tốc độ cao cần độ ôm khít, hoặc chọn size lớn hơn nếu đi phố hàng ngày cần sự thoải mái.'}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
