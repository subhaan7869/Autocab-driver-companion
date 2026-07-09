import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface SliderButtonProps {
  text: string;
  onSwipeSuccess: () => void;
  color?: 'orange' | 'green' | 'red';
}

export default function SliderButton({ text, onSwipeSuccess, color = 'orange' }: SliderButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const dragX = useMotionValue(0);
  const [dragRange, setDragRange] = useState(200);

  useEffect(() => {
    const updateRange = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setDragRange(Math.max(100, width - 56));
      }
    };
    updateRange();
    
    // Add small delay to ensure rendering completes
    const timer = setTimeout(updateRange, 100);

    window.addEventListener('resize', updateRange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRange);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = dragX.on("change", (latest) => {
      if (latest >= dragRange * 0.88 && !isSuccess) {
        setIsSuccess(true);
        onSwipeSuccess();
        setTimeout(() => {
          dragX.set(0);
          setIsSuccess(false);
        }, 600);
      }
    });
    return () => unsubscribe();
  }, [dragRange, isSuccess, onSwipeSuccess, dragX]);

  const getColors = () => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-emerald-950/40 border-emerald-500/20',
          track: 'bg-emerald-500',
          handle: 'bg-emerald-500 text-black',
        };
      case 'red':
        return {
          bg: 'bg-red-950/40 border-red-500/20',
          track: 'bg-red-600',
          handle: 'bg-red-600 text-white',
        };
      case 'orange':
      default:
        return {
          bg: 'bg-orange-950/40 border-orange-500/20',
          track: 'bg-orange-500',
          handle: 'bg-orange-500 text-black',
        };
    }
  };

  const styling = getColors();
  const widthTransform = useTransform(dragX, [0, dragRange], [24, dragRange + 24]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-12 rounded-full flex items-center p-1 border select-none overflow-hidden ${styling.bg}`}
    >
      {/* Visual background text */}
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 pointer-events-none z-0">
        {text}
      </div>

      {/* Dynamic progress highlight bar */}
      <motion.div 
        className={`absolute left-0 top-0 bottom-0 rounded-l-full pointer-events-none z-10 opacity-20 ${styling.track}`}
        style={{ width: widthTransform }}
      />

      {/* Draggable knob */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: dragRange }}
        dragElastic={0.05}
        dragMomentum={false}
        style={{ x: dragX }}
        className={`w-10 h-10 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-20 shadow-md ${styling.handle}`}
      >
        <ChevronRight className="h-5 w-5 stroke-[3]" />
      </motion.div>
    </div>
  );
}
