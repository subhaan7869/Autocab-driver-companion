import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Check, 
  Plus, 
  AlertCircle, 
  Tag, 
  Car, 
  TrendingUp, 
  X,
  Sparkles,
  Gavel,
  ChevronRight,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import { BidJob } from '../types';
import { playAcceptChime, playWarningBuzzer, playMessageChime } from '../utils/audio';

interface PreBookingsPanelProps {
  bidJobs: BidJob[];
  onBidAccept: (id: string) => void;
  onOpenCounterBid: (job: BidJob) => void;
  onWithdrawBid: (id: string) => void;
  onStartScheduledJob?: (job: BidJob) => void;
  onAddCustomPreBooking: (job: BidJob) => void;
}

export default function PreBookingsPanel({ 
  bidJobs, 
  onBidAccept, 
  onOpenCounterBid,
  onWithdrawBid, 
  onStartScheduledJob,
  onAddCustomPreBooking 
}: PreBookingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'MY_SCHEDULED'>('AVAILABLE');
  const [customFormOpen, setCustomFormOpen] = useState(false);
  
  // Custom simulation inputs
  const [passengerName, setPassengerName] = useState('Dale');
  const [pickupTime, setPickupTime] = useState('Today 18:45');
  const [pickupName, setPickupName] = useState('YORK TRAIN STATION');
  const [destinationName, setDestinationName] = useState('YORK CLIFTON MOOR');
  const [fareAmount, setFareAmount] = useState('14.50');
  const [distance, setDistance] = useState('4.8');
  const [vehicleType, setVehicleType] = useState('Standard Saloon');

  const availableJobs = bidJobs.filter((j) => j.status === 'PENDING');
  const myScheduledJobs = bidJobs.filter((j) => j.status === 'ACCEPTED' || j.status === 'AUCTION_WON');

  const handleCreatePreBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: BidJob = {
      id: `bid-${Date.now().toString().slice(-4)}`,
      passengerName,
      pickupTime,
      pickupName: pickupName.toUpperCase(),
      destinationName: destinationName.toUpperCase(),
      fareAmount: parseFloat(fareAmount) || 12.00,
      distance: parseFloat(distance) || 3.5,
      vehicleType,
      status: 'PENDING',
    };
    onAddCustomPreBooking(newJob);
    setCustomFormOpen(false);
    playMessageChime();
  };

  const handleAcceptStandard = (id: string) => {
    onBidAccept(id);
    playAcceptChime();
  };

  const handleWithdraw = (id: string) => {
    if (confirm("Are you sure you want to withdraw from this scheduled booking?")) {
      onWithdrawBid(id);
      playWarningBuzzer();
    }
  };

  return (
    <div className="flex-1 bg-[#0a0e17] flex flex-col h-full overflow-hidden text-slate-200 font-mono">
      {/* Header */}
      <div className="px-4 py-3 bg-[#111726] border-b border-slate-800 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-wider">
              PRE-BOOKINGS & ADVANCE WORK
            </h2>
            <p className="text-[9px] text-slate-400">
              ACCEPT FIXED FARE OR DECLINE & COUNTER-BID IN AUCTION
            </p>
          </div>
        </div>

        <button
          onClick={() => setCustomFormOpen(true)}
          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-black text-[9px] font-black rounded-lg uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-orange-600/20"
        >
          <Plus className="h-3 w-3 stroke-[3]" />
          <span>SIMULATE PRE-BOOKING</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#0d121e] border-b border-slate-800 shrink-0 text-[10px] font-bold">
        <button
          onClick={() => setActiveTab('AVAILABLE')}
          className={`flex-1 py-3 tracking-wider uppercase border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'AVAILABLE' 
              ? 'text-orange-400 border-orange-500 bg-orange-500/5' 
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          <span>AVAILABLE PRE-BOOKINGS ({availableJobs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('MY_SCHEDULED')}
          className={`flex-1 py-3 tracking-wider uppercase border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'MY_SCHEDULED' 
              ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5' 
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          <Check className="h-3.5 w-3.5" />
          <span>MY SCHEDULED / WON JOBS ({myScheduledJobs.length})</span>
        </button>
      </div>

      {/* Main List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        
        {/* Simulate New Form */}
        {customFormOpen && (
          <div className="p-4 bg-[#141b2c] rounded-2xl border border-slate-700 shadow-xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1.5 uppercase">
                <Sparkles className="h-3.5 w-3.5" /> Create Simulated Advance Ride
              </span>
              <button 
                onClick={() => setCustomFormOpen(false)}
                className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePreBooking} className="grid grid-cols-2 gap-3 text-[10px]">
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Passenger Name</label>
                <input 
                  type="text" 
                  value={passengerName} 
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Pickup Time</label>
                <input 
                  type="text" 
                  value={pickupTime} 
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-400 uppercase font-bold mb-1">Pickup Location</label>
                <input 
                  type="text" 
                  value={pickupName} 
                  onChange={(e) => setPickupName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-400 uppercase font-bold mb-1">Drop-off Destination</label>
                <input 
                  type="text" 
                  value={destinationName} 
                  onChange={(e) => setDestinationName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Base Fare (£)</label>
                <input 
                  type="number" 
                  step="0.50"
                  value={fareAmount} 
                  onChange={(e) => setFareAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Distance (Miles)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={distance} 
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="col-span-2 py-2.5 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-[10px] rounded-xl tracking-wider mt-1 cursor-pointer"
              >
                BROADCAST PRE-BOOKING OFFER
              </button>
            </form>
          </div>
        )}

        {/* Tab 1: Available Pre-Bookings */}
        {activeTab === 'AVAILABLE' ? (
          availableJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                <AlertCircle className="h-5 w-5 text-slate-600" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">
                NO PRE-BOOKINGS AVAILABLE AT PRESENT
              </p>
              <p className="text-[9px] text-slate-600 max-w-[280px] leading-relaxed mt-1 font-sans">
                Advance bookings are dispatched dynamically based on driver coverage. Tap 'SIMULATE PRE-BOOKING' to generate dummy runs.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableJobs.map((job) => (
                <div 
                  key={job.id}
                  className="bg-[#111726] rounded-2xl border border-slate-800 p-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-orange-950/60 border border-orange-900 text-orange-400 px-2 py-1 rounded font-black text-[9px] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{job.pickupTime}</span>
                      </div>
                      <span className="text-slate-400 font-bold text-[9px]">
                        👤 {job.passengerName || 'Customer'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[8px] text-slate-500 uppercase block font-bold">BASE FARE</span>
                      <span className="text-emerald-400 text-sm font-black tracking-wide font-mono">
                        £{job.fareAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="space-y-2 mb-3.5 font-sans text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-slate-500 text-[8px] font-mono font-black uppercase tracking-widest block">PICKUP</span>
                        <p className="text-slate-200 font-extrabold leading-tight">{job.pickupName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-slate-500 text-[8px] font-mono font-black uppercase tracking-widest block">DESTINATION</span>
                        <p className="text-slate-200 font-extrabold leading-tight">{job.destinationName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-3 font-mono text-[9px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Car className="h-3 w-3 text-slate-500" />
                        <span>{job.vehicleType}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-bold text-slate-300">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <span>{job.distance} mi</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* CRITICAL: DECLINE & PLACE BID / COUNTER-OFFER BUTTON */}
                      <button
                        onClick={() => onOpenCounterBid(job)}
                        className="px-3 py-2 bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 border border-purple-800/80 font-black text-[9px] rounded-xl tracking-wider uppercase transition-colors flex items-center gap-1 cursor-pointer"
                        title="Decline base rate and enter counter-offer bid"
                      >
                        <Gavel className="h-3 w-3 text-purple-400" />
                        <span>DECLINE & BID</span>
                      </button>

                      {/* ACCEPT AT STANDARD RATE */}
                      <button
                        onClick={() => handleAcceptStandard(job.id)}
                        className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[9px] rounded-xl tracking-wider uppercase transition-colors shadow-sm active:scale-95 cursor-pointer"
                      >
                        ACCEPT £{job.fareAmount.toFixed(2)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Tab 2: My Scheduled / Won Work */
          myScheduledJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                <Calendar className="h-5 w-5 text-slate-600" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">
                NO SCHEDULED ADVANCE JOBS SECURED
              </p>
              <p className="text-[9px] text-slate-600 max-w-[280px] leading-relaxed mt-1 font-sans">
                When you accept pre-bookings or win counter-offer bids, they appear here ready for navigation.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myScheduledJobs.map((job) => (
                <div 
                  key={job.id}
                  className="bg-[#111726] rounded-2xl border border-emerald-950 p-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-emerald-950/80 border border-emerald-900 text-emerald-400 px-2 py-1 rounded font-black text-[9px] flex items-center gap-1 uppercase">
                        <Check className="h-3 w-3" />
                        <span>SECURED: {job.pickupTime}</span>
                      </div>
                      {job.specialNotes && (
                        <span className="text-[8px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-900">
                          AUCTION WON
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 text-sm font-black tracking-wide font-mono">
                        £{job.fareAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3.5 font-sans text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-slate-500 text-[8px] font-mono font-black uppercase tracking-widest block">PICKUP</span>
                        <p className="text-slate-200 font-extrabold leading-tight">{job.pickupName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-slate-500 text-[8px] font-mono font-black uppercase tracking-widest block">DESTINATION</span>
                        <p className="text-slate-200 font-extrabold leading-tight">{job.destinationName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-3 font-mono text-[9px] text-slate-400">
                      <span>{job.vehicleType}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">{job.distance} mi</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {onStartScheduledJob && (
                        <button
                          onClick={() => onStartScheduledJob(job)}
                          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[9px] rounded-xl tracking-wider uppercase transition-colors shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <Navigation className="h-3 w-3 stroke-[2.5]" />
                          <span>START ON MAP</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleWithdraw(job.id)}
                        className="px-2.5 py-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-900/50 font-black text-[9px] rounded-xl tracking-wider uppercase transition-colors cursor-pointer"
                      >
                        WITHDRAW
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </div>
  );
}
