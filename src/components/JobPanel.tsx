import React, { useEffect, useState, useRef } from 'react';
import { Clock, ShieldAlert, CreditCard, Landmark, DollarSign, Users, Check, X, Copy, MapPin } from 'lucide-react';
import { Booking, JobStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { playOfferChime, playCashSettlementChime } from '../utils/audio';

interface JobPanelProps {
  currentJob: Booking | null;
  jobStatus: JobStatus;
  onAcceptJob: () => void;
  onRejectJob: () => void;
  onClear: (finalFare: number) => void;
}

export default function JobPanel({
  currentJob,
  jobStatus,
  onAcceptJob,
  onRejectJob,
  onClear,
}: JobPanelProps) {
  const [countdown, setCountdown] = useState(15);
  const [gratuity, setGratuity] = useState(0);
  const [paymentType, setPaymentType] = useState<'CASH' | 'CARD' | 'ACCOUNT'>('CASH');
  const [copiedId, setCopiedId] = useState(false);
  
  // Slide track for acceptance
  const [acceptSlide, setAcceptSlide] = useState(0);
  const [completeSlide, setCompleteSlide] = useState(0);

  // Sync payment type with booking
  useEffect(() => {
    if (currentJob) {
      setPaymentType(currentJob.fareType);
    }
  }, [currentJob]);

  // Job countdown timer
  useEffect(() => {
    if (jobStatus !== 'OFFERED') return;

    setCountdown(15);
    playOfferChime();
    const beepInterval = setInterval(playOfferChime, 1500);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onRejectJob();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(beepInterval);
    };
  }, [jobStatus, currentJob]);

  const handleCopyId = () => {
    navigator.clipboard.writeText('3698634');
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Calculate final totals
  const baseFare = currentJob?.fareAmount || 0;
  const finalFare = baseFare + gratuity;

  // Slide to accept handler
  const handleAcceptDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setAcceptSlide(val);
    if (val >= 90) {
      setAcceptSlide(100);
      onAcceptJob();
      // Reset slide for next offer
      setTimeout(() => setAcceptSlide(0), 1000);
    }
  };

  // Slide to complete handler
  const handleCompleteDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setCompleteSlide(val);
    if (val >= 90) {
      setCompleteSlide(100);
      onClear(finalFare);
      playCashSettlementChime();
      setTimeout(() => setCompleteSlide(0), 1000);
    }
  };

  if (jobStatus === 'OFFERED' && currentJob) {
    return (
      <div className="flex flex-col h-full bg-[#0c1017] text-white font-mono select-none" id="autocab-job-offer-screen">
        
        {/* Massive flashing RED header banner matching professional design */}
        <div className="bg-[#11151e] border-b border-slate-900 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            <span className="font-sans font-black tracking-wider text-xs text-red-500 uppercase">OFFER EN ROUTE</span>
          </div>
          <div className="bg-[#ff3b30]/15 border border-[#ff3b30]/30 text-red-500 px-3 py-1 rounded-md text-xs font-black flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-red-500 animate-pulse" />
            <span>EXPIRES IN {countdown}s</span>
          </div>
        </div>

        {/* Content Details Block */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6 text-center">
            
            {/* Title: JOB OFFER */}
            <div>
              <h1 className="text-3xl font-black text-red-600 tracking-wider uppercase font-sans">JOB OFFER</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">York Private Hire Logistics Channel</p>
            </div>

            {/* Circular Passenger Badge and count */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-slate-800/40 border-2 border-slate-700/60 flex flex-col items-center justify-center text-slate-200">
                <Users className="h-7 w-7 text-slate-300" />
                <span className="text-xs font-black mt-1">3 PAX</span>
              </div>
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-[#0c1017]">
                3
              </span>
            </div>

            {/* Address Card with Marker A matching video */}
            <div className="bg-[#131924] border border-slate-800 rounded-2xl p-4 text-left max-w-lg mx-auto">
              <div className="flex gap-3.5 items-start">
                <div className="w-7 h-7 bg-emerald-600 text-white font-sans font-black rounded-full flex items-center justify-center text-sm shrink-0">
                  A
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest">PICKUP ADDRESS</span>
                  <p className="text-xs font-sans font-extrabold text-slate-100 mt-1 leading-relaxed">
                    {currentJob.pickup.name}, Wigginton Road, Clifton, York, YO31 8HE, HOS
                  </p>
                </div>
              </div>

              {/* Passenger & Fare details inside card */}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase">PASSENGER NAME</span>
                  <span className="text-xs font-sans font-black text-slate-200 mt-1 block uppercase">{currentJob.passengerName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase">PICKUP ZONE</span>
                  <span className="text-xs font-sans font-black text-[#fbc02d] mt-1 block uppercase">YORK HOSPITAL</span>
                </div>
              </div>
            </div>

            {/* Grid of details: Distance & Payment method */}
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              <div className="p-3 bg-[#131924]/60 border border-slate-800/80 rounded-xl text-left">
                <span className="text-[9px] text-slate-500 font-bold block uppercase">DISTANCE</span>
                <span className="text-xs font-black text-slate-300 block mt-1">{currentJob.distance.toFixed(1)} miles</span>
              </div>
              <div className="p-3 bg-[#131924]/60 border border-slate-800/80 rounded-xl text-left">
                <span className="text-[9px] text-slate-500 font-bold block uppercase">PAYMENT TYPE</span>
                <span className="text-xs font-black text-slate-300 flex items-center gap-1.5 mt-1">
                  {currentJob.fareType === 'CASH' && <DollarSign className="h-4 w-4 text-emerald-500 shrink-0" />}
                  {currentJob.fareType === 'CARD' && <CreditCard className="h-4 w-4 text-blue-500 shrink-0" />}
                  {currentJob.fareType === 'ACCOUNT' && <Landmark className="h-4 w-4 text-purple-500 shrink-0" />}
                  {currentJob.fareType}
                </span>
              </div>
            </div>

          </div>

          {/* Accept / Reject actions at bottom */}
          <div className="max-w-lg w-full mx-auto pt-6 border-t border-slate-900 flex flex-col gap-4">
            
            {/* Sliding accept track with Reject tap button on right */}
            <div className="flex gap-3 items-center">
              {/* Reject Circle Button on left */}
              <button
                onClick={onRejectJob}
                className="w-12 h-12 bg-red-600/15 border border-red-500/30 text-red-500 hover:bg-red-600 hover:text-white rounded-full flex items-center justify-center shrink-0 transition-all duration-150 active:scale-90 cursor-pointer"
                title="Tap to Reject"
              >
                <X className="h-5 w-5 stroke-[3]" />
              </button>

              {/* Sliding Track */}
              <div className="flex-1 relative h-12 bg-[#1c2333] border border-slate-800 rounded-full flex items-center px-1 overflow-hidden">
                
                {/* Background Guide Text */}
                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-500 font-black tracking-widest uppercase pointer-events-none z-0">
                  SLIDE RIGHT TO ACCEPT
                </span>

                {/* Progress bar underlay */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-emerald-500/15 rounded-l-full z-10 pointer-events-none"
                  style={{ width: `${acceptSlide}%` }}
                />

                {/* Hidden slider input */}
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={acceptSlide}
                  onChange={handleAcceptDrag}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing z-30"
                />

                {/* Physical slider thumb */}
                <div 
                  className="w-10 h-10 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center z-20 shadow-md transition-all duration-75"
                  style={{ transform: `translateX(${acceptSlide * 0.01 * (acceptSlide >= 100 ? 0 : 200)}px)` }}
                >
                  <Check className="h-5 w-5 stroke-[4.5]" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ACTIVE RIDE OVERLAYS HANDLED BY MAP
  if (jobStatus === 'STC' || jobStatus === 'POB' || jobStatus === 'ACCEPTED' || jobStatus === 'ARRIVED') {
    return null;
  }

  // FARE COMPLETION RECEIPT SCREEN (01:18)
  return (
    <div className="flex flex-col h-full bg-[#f4f5f8] text-slate-800 font-mono select-none" id="autocab-fare-receipt-screen">
      
      {/* Top Header */}
      <div className="bg-[#111622] text-white px-5 py-3.5 border-b border-slate-900 shrink-0 flex items-center justify-between">
        <span className="font-mono text-xs font-bold tracking-widest uppercase">FARE COMPLETION</span>
        <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
          METER PAUSED
        </span>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-5 text-center">
          
          {/* Large Digital Taximeter Fare Display */}
          <div className="bg-[#0b0e14] border-2 border-slate-900 rounded-3xl p-5 shadow-inner inline-block w-full max-w-sm">
            <h3 className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">TOTAL FARE CHARGE</h3>
            <p className="text-4xl font-black text-[#ff3333] mt-2 font-mono tracking-tight glow-text drop-shadow-[0_0_8px_rgba(255,51,51,0.25)]">
              £{finalFare.toFixed(2)}
            </p>
            <p className="text-[8px] text-slate-500 font-bold mt-1.5 uppercase">
              Base £{baseFare.toFixed(2)} • Gratuity £{gratuity.toFixed(2)}
            </p>
          </div>

          {/* Gratuity / Tip Selector Block */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 max-w-sm mx-auto">
            <span className="text-[9px] text-slate-400 font-black block uppercase tracking-widest text-left mb-2.5">
              ADD DRIVER GRATUITY
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 5, 10].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setGratuity(prev => prev + amt)}
                  className="py-2.5 bg-slate-50 hover:bg-orange-50 hover:border-orange-500/40 border border-slate-200/80 text-xs font-bold text-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  +£{amt}
                </button>
              ))}
            </div>
            {gratuity > 0 && (
              <button
                onClick={() => setGratuity(0)}
                className="w-full mt-2.5 py-1.5 text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 rounded-lg border border-red-100 transition-colors"
              >
                Reset Tip
              </button>
            )}
          </div>

          {/* Ride statistics card with Copyable booking ID */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 divide-y divide-slate-100 text-xs text-left max-w-sm mx-auto">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400 font-bold">PASSENGER NAME</span>
              <span className="text-slate-800 font-black uppercase">{currentJob?.passengerName || 'DALE'}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400 font-bold">PAYMENT TYPE</span>
              <button 
                onClick={() => setPaymentType(prev => prev === 'CASH' ? 'CARD' : 'CASH')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
              >
                {paymentType} (change)
              </button>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400 font-bold">ROUTE DISTANCE</span>
              <span className="text-slate-800 font-black">{currentJob?.distance ? `${currentJob.distance.toFixed(1)} mi` : '0.0 mi'}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400 font-bold">BOOKING ID</span>
              <button 
                onClick={handleCopyId}
                className="text-slate-600 hover:text-slate-800 font-black flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-[10px] cursor-pointer"
              >
                <Copy className="h-3 w-3" />
                <span>{copiedId ? 'Copied!' : '3698634'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Complete tactile slider button matching video */}
        <div className="max-w-sm w-full mx-auto mt-6 pt-4 border-t border-slate-200/60">
          
          {/* Horizontal Drag track for completion */}
          <div className="relative h-14 bg-red-950/10 border border-red-500/20 rounded-full flex items-center px-1 overflow-hidden">
            
            {/* Background text */}
            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-red-700 font-black tracking-widest uppercase pointer-events-none z-0">
              SLIDE RIGHT TO COMPLETE
            </span>

            {/* Progress track */}
            <div 
              className="absolute left-0 top-0 bottom-0 bg-red-600/15 rounded-l-full z-10 pointer-events-none"
              style={{ width: `${completeSlide}%` }}
            />

            {/* Hidden Input range */}
            <input 
              type="range"
              min="0"
              max="100"
              value={completeSlide}
              onChange={handleCompleteDrag}
              className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing z-30"
            />

            {/* Slider thumb */}
            <div 
              className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center z-20 shadow-md transition-all duration-75"
              style={{ transform: `translateX(${completeSlide * 0.01 * (completeSlide >= 100 ? 0 : 310)}px)` }}
            >
              <Check className="h-5 w-5 stroke-[3.5]" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

