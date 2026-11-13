import React, { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  Clock, 
  MapPin, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Car, 
  ShieldCheck, 
  Send,
  Loader2
} from 'lucide-react';
import { BidJob, Booking } from '../types';
import { playAcceptChime, playCashSettlementChime, playWarningBuzzer } from '../utils/audio';

interface CounterBidModalProps {
  job: BidJob | Booking;
  isOpen: boolean;
  onClose: () => void;
  onBidAccepted: (awardedJob: BidJob, agreedFare: number) => void;
}

export default function CounterBidModal({
  job,
  isOpen,
  onClose,
  onBidAccepted,
}: CounterBidModalProps) {
  const originalFare = 'fareAmount' in job ? job.fareAmount : 15.0;
  const pickupName = 'pickup' in job ? job.pickup.name : job.pickupName;
  const destinationName = 'destination' in job ? job.destination.name : job.destinationName;
  const passengerName = ('passengerName' in job && job.passengerName) ? job.passengerName : 'Sarah Jenkins';
  const pickupTime = ('pickupTime' in job && job.pickupTime) ? job.pickupTime : 'Today 18:30';
  const distance = job.distance || 4.2;

  const [counterAmount, setCounterAmount] = useState<number>(
    Math.round((originalFare * 1.25) * 10) / 10
  );
  const [selectedPerk, setSelectedPerk] = useState<string>('Mercedes Saloon • 5★ Driver');
  const [etaNote, setEtaNote] = useState<string>('Can arrive 10 mins early');
  
  // Status: IDLE -> SUBMITTING -> CUSTOMER_REVIEWING -> ACCEPTED -> REJECTED
  const [bidState, setBidState] = useState<'IDLE' | 'SUBMITTING' | 'CUSTOMER_REVIEWING' | 'ACCEPTED' | 'REJECTED'>('IDLE');
  const [reviewCountdown, setReviewCountdown] = useState<number>(4);

  useEffect(() => {
    if (isOpen) {
      setCounterAmount(Math.round((originalFare * 1.25) * 10) / 10);
      setBidState('IDLE');
      setReviewCountdown(4);
    }
  }, [isOpen, originalFare]);

  // Handle countdown during Customer Review
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (bidState === 'CUSTOMER_REVIEWING') {
      timer = setInterval(() => {
        setReviewCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Customer accepts the counter-offer!
            setBidState('ACCEPTED');
            playCashSettlementChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [bidState]);

  if (!isOpen) return null;

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (counterAmount <= originalFare) {
      alert("Your counter bid should be higher than the standard baseline fare.");
      return;
    }
    setBidState('SUBMITTING');
    playAcceptChime();

    setTimeout(() => {
      setBidState('CUSTOMER_REVIEWING');
      setReviewCountdown(4);
    }, 700);
  };

  const handleInstantAccept = () => {
    setBidState('ACCEPTED');
    playCashSettlementChime();
  };

  const handleClaimJob = (startImmediately: boolean) => {
    const awardedJob: BidJob = {
      id: `won-bid-${Date.now().toString().slice(-4)}`,
      passengerName,
      pickupTime,
      pickupName,
      destinationName,
      fareAmount: counterAmount,
      distance,
      vehicleType: selectedPerk,
      specialNotes: `${etaNote} (Counter-Bid Won)`,
      status: 'ACCEPTED',
    };
    onBidAccepted(awardedJob, counterAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#0f1422] border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col font-mono text-slate-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-[#141b2c] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                {bidState === 'ACCEPTED' ? 'AUCTION OFFER ACCEPTED!' : 'COUNTER-BID AUCTION'}
              </h3>
              <p className="text-[9px] text-slate-400">
                {bidState === 'ACCEPTED' ? 'CUSTOMER AGREED TO YOUR FARE' : 'NAME YOUR DESIRED FARE TO THE PASSENGER'}
              </p>
            </div>
          </div>
          {bidState !== 'CUSTOMER_REVIEWING' && (
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Trip Summary Card */}
          <div className="bg-[#121827] border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-bold flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-orange-400" /> {pickupTime}
              </span>
              <span className="font-bold font-sans text-slate-300">
                👤 {passengerName}
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-slate-400 text-[9px] uppercase">From:</span>
                <span className="font-bold text-white truncate font-sans">{pickupName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                <span className="text-slate-400 text-[9px] uppercase">To:</span>
                <span className="font-bold text-white truncate font-sans">{destinationName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
              <span className="text-slate-400">Standard Base Offer:</span>
              <span className="text-slate-400 font-bold line-through">£{originalFare.toFixed(2)}</span>
            </div>
          </div>

          {/* VIEW: ACCEPTED BY CUSTOMER! */}
          {bidState === 'ACCEPTED' ? (
            <div className="bg-emerald-950/40 border-2 border-emerald-500/60 rounded-2xl p-5 text-center space-y-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <CheckCircle className="h-7 w-7" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider">
                  🎉 {passengerName} ACCEPTED YOUR OFFER!
                </h4>
                <p className="text-[10px] text-slate-300 mt-1 font-sans">
                  The customer agreed to your counter-fare of{' '}
                  <span className="font-black text-emerald-400 text-xs">£{counterAmount.toFixed(2)}</span>. The job is awarded exclusively to you!
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => handleClaimJob(true)}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-[11px] rounded-xl tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform cursor-pointer"
                >
                  🚀 START & NAVIGATE ON MAP NOW
                </button>
                <button
                  onClick={() => handleClaimJob(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase text-[10px] rounded-xl tracking-wider transition-colors cursor-pointer"
                >
                  📅 SAVE IN MY SCHEDULED JOBS
                </button>
              </div>
            </div>
          ) : bidState === 'CUSTOMER_REVIEWING' || bidState === 'SUBMITTING' ? (
            /* VIEW: CUSTOMER REVIEWING SIMULATION */
            <div className="bg-[#141b2b] border border-orange-500/40 rounded-2xl p-5 text-center space-y-4 animate-fadeIn">
              <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  CUSTOMER REVIEWING YOUR OFFER...
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  {passengerName} is comparing your bid of{' '}
                  <span className="text-orange-400 font-bold">£{counterAmount.toFixed(2)}</span> against other drivers in the zone.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Response expected in:</span>
                <span className="text-orange-400 font-black text-sm">{reviewCountdown}s</span>
              </div>

              {/* Instant demo fast forward button */}
              <button
                type="button"
                onClick={handleInstantAccept}
                className="text-[9px] text-slate-500 hover:text-emerald-400 uppercase font-bold underline transition-colors cursor-pointer"
              >
                Fast-Forward: Simulate Instant Customer Acceptance
              </button>
            </div>
          ) : (
            /* VIEW: BID FORM */
            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-black">
                    Your Counter-Bid Amount (£)
                  </label>
                  <span className="text-[9px] text-emerald-400 font-bold">
                    +£{(counterAmount - originalFare).toFixed(2)} above base
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-black text-emerald-400">
                    £
                  </span>
                  <input
                    type="number"
                    step="0.50"
                    min={(originalFare + 0.5).toFixed(2)}
                    value={counterAmount}
                    onChange={(e) => setCounterAmount(parseFloat(e.target.value) || originalFare)}
                    className="w-full bg-[#121827] border border-slate-700/80 rounded-xl py-2.5 pl-8 pr-4 text-emerald-400 font-mono text-lg font-black focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Quick Add Chips */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[2, 4, 7, 10].map((add) => {
                    const price = originalFare + add;
                    return (
                      <button
                        key={add}
                        type="button"
                        onClick={() => setCounterAmount(price)}
                        className={`py-1.5 px-2 rounded-lg text-[9px] font-bold border transition-colors cursor-pointer ${
                          counterAmount === price
                            ? 'bg-orange-500 text-black border-orange-400 font-black'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        +£{add} (£{price.toFixed(0)})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pitch / Vehicle Perks */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-black block mb-1.5">
                  Vehicle Class / Perk Pitch
                </label>
                <select
                  value={selectedPerk}
                  onChange={(e) => setSelectedPerk(e.target.value)}
                  className="w-full bg-[#121827] border border-slate-700/80 rounded-xl p-2.5 text-slate-200 text-[10px] font-mono focus:outline-none focus:border-orange-500"
                >
                  <option value="Mercedes Saloon • 5★ Driver">Mercedes Saloon • 5★ Driver</option>
                  <option value="Executive Estate • Luggage Ready">Executive Estate • Luggage Ready</option>
                  <option value="Prius Hybrid • Eco Friendly">Prius Hybrid • Eco Friendly</option>
                  <option value="Wheelchair Accessible MPV">Wheelchair Accessible MPV</option>
                </select>
              </div>

              {/* ETA note */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-black block mb-1.5">
                  Driver Promise / Arrival Note
                </label>
                <input
                  type="text"
                  value={etaNote}
                  onChange={(e) => setEtaNote(e.target.value)}
                  placeholder="e.g. Can arrive 10 mins early"
                  className="w-full bg-[#121827] border border-slate-700/80 rounded-xl p-2.5 text-slate-200 text-[10px] font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Submit Counter Offer */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-black uppercase text-[11px] rounded-xl tracking-wider shadow-lg shadow-orange-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="h-3.5 w-3.5 stroke-[3]" />
                <span>SUBMIT BID OF £{counterAmount.toFixed(2)} TO CUSTOMER</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
