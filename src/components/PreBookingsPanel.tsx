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
  User, 
  TrendingUp, 
  X,
  Sparkles
} from 'lucide-react';
import { BidJob } from '../types';
import { playAcceptChime, playWarningBuzzer, playMessageChime } from '../utils/audio';

interface PreBookingsPanelProps {
  bidJobs: BidJob[];
  onBidAccept: (id: string) => void;
  onWithdrawBid: (id: string) => void;
  onAddCustomPreBooking: (job: BidJob) => void;
}

export default function PreBookingsPanel({ 
  bidJobs, 
  onBidAccept, 
  onWithdrawBid, 
  onAddCustomPreBooking 
}: PreBookingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'MY_SCHEDULED'>('AVAILABLE');
  const [customFormOpen, setCustomFormOpen] = useState(false);
  
  // States for custom simulation form
  const [pickupTime, setPickupTime] = useState('18:45');
  const [pickupName, setPickupName] = useState('YORK TRAIN STATION');
  const [destinationName, setDestinationName] = useState('YORK CLIFTON MOOR');
  const [fareAmount, setFareAmount] = useState('12.50');
  const [distance, setDistance] = useState('4.8');
  const [vehicleType, setVehicleType] = useState('Standard Saloon');

  const availableJobs = bidJobs.filter(j => j.status === 'PENDING');
  const myScheduledJobs = bidJobs.filter(j => j.status === 'ACCEPTED');

  const handleCreatePreBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: BidJob = {
      id: `bid-${Date.now().toString().slice(-4)}`,
      pickupTime,
      pickupName: pickupName.toUpperCase(),
      destinationName: destinationName.toUpperCase(),
      fareAmount: parseFloat(fareAmount) || 10.00,
      distance: parseFloat(distance) || 3.0,
      vehicleType,
      status: 'PENDING'
    };
    onAddCustomPreBooking(newJob);
    setCustomFormOpen(false);
    playMessageChime();
  };

  const handleBidClick = (id: string) => {
    onBidAccept(id);
    playAcceptChime();
  };

  const handleCancelClick = (id: string) => {
    if (confirm("Are you sure you want to withdraw from this scheduled booking?")) {
      onWithdrawBid(id);
      playWarningBuzzer();
    }
  };

  return (
    <div className="flex-1 bg-[#0c0f16] flex flex-col h-full overflow-hidden text-slate-200 font-mono">
      {/* Sub-view header */}
      <div className="p-4 bg-[#111622] border-b border-slate-800 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2.5">
          <Calendar className="h-5 w-5 text-orange-500 animate-pulse" />
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-wider">PRE-BOOKINGS SYSTEM</h2>
            <p className="text-[9px] text-slate-400">BID & SECURE ADVANCE WORK</p>
          </div>
        </div>
        <button
          onClick={() => setCustomFormOpen(true)}
          className="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-black text-[9px] font-black rounded-lg uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="h-3 w-3 stroke-[3]" />
          <span>SIMULATE OFFER</span>
        </button>
      </div>

      {/* Advanced Double Tabs */}
      <div className="flex bg-[#0b0e14] border-b border-slate-900 shrink-0">
        <button
          onClick={() => setActiveTab('AVAILABLE')}
          className={`flex-1 py-3 text-[10px] font-black tracking-widest uppercase transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === 'AVAILABLE' 
              ? 'text-orange-500 border-orange-500 bg-slate-950/40' 
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          <span>AVAILABLE OFFERS ({availableJobs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('MY_SCHEDULED')}
          className={`flex-1 py-3 text-[10px] font-black tracking-widest uppercase transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === 'MY_SCHEDULED' 
              ? 'text-orange-500 border-orange-500 bg-slate-950/40' 
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          <Check className="h-3.5 w-3.5" />
          <span>MY SCHEDULED WORK ({myScheduledJobs.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        
        {/* Custom offer simulation form */}
        {customFormOpen && (
          <div className="p-4 bg-[#141b2b] rounded-2xl border border-slate-800 shadow-xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1.5 uppercase">
                <Sparkles className="h-3.5 w-3.5" /> Create Simulated Advance Job
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
                <label className="block text-slate-500 uppercase font-black mb-1">Pickup Time</label>
                <input 
                  type="text" 
                  value={pickupTime} 
                  onChange={(e) => setPickupTime(e.target.value)}
                  placeholder="e.g. 18:45 or Tomorrow 08:30"
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-slate-200 font-mono text-[10px] focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase font-black mb-1">Vehicle Standard</label>
                <select 
                  value={vehicleType} 
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-slate-200 font-mono text-[10px] focus:border-orange-500 focus:outline-none"
                >
                  <option value="Standard Saloon">Standard Saloon</option>
                  <option value="Executive Estate">Executive Estate</option>
                  <option value="Wheelchair MPV">Wheelchair MPV</option>
                  <option value="8-Seater Minibus">8-Seater Minibus</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-slate-500 uppercase font-black mb-1">Pickup Location</label>
                <input 
                  type="text" 
                  value={pickupName} 
                  onChange={(e) => setPickupName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-slate-200 font-mono text-[10px] focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-500 uppercase font-black mb-1">Drop-off Destination</label>
                <input 
                  type="text" 
                  value={destinationName} 
                  onChange={(e) => setDestinationName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-slate-200 font-mono text-[10px] focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase font-black mb-1">Fare Amount (£)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={fareAmount} 
                  onChange={(e) => setFareAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-slate-200 font-mono text-[10px] focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase font-black mb-1">Distance (Miles)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={distance} 
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-slate-200 font-mono text-[10px] focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="col-span-2 py-2.5 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-[10px] rounded-lg tracking-wider mt-2"
              >
                INJECT OFFERS BOARD
              </button>
            </form>
          </div>
        )}

        {/* LIST RENDER */}
        {activeTab === 'AVAILABLE' ? (
          availableJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                <AlertCircle className="h-5 w-5 text-slate-600" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">NO PRE-BOOKINGS AVAILABLE AT PRESENT</p>
              <p className="text-[9px] text-slate-600 max-w-[260px] leading-normal mt-1">
                Advance bookings are dispatched dynamically based on driver coverage. Tap 'SIMULATE OFFER' to generate dummy runs.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableJobs.map((job) => (
                <div 
                  key={job.id}
                  className="bg-[#111622] rounded-2xl border border-slate-800 p-4 shadow-md hover:border-slate-700/80 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-orange-950/50 border border-orange-900 text-orange-500 px-2 py-1 rounded font-black text-[9px] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{job.pickupTime}</span>
                      </div>
                      <span className="text-slate-500 font-black text-[9px]">• advance</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 text-sm font-black tracking-wide font-mono">
                        £{job.fareAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Route Details */}
                  <div className="space-y-2 mb-3.5">
                    <div className="flex items-start gap-2 text-[10px]">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest block">PICKUP</span>
                        <p className="text-slate-200 font-bold leading-tight font-sans text-xs">{job.pickupName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-[10px]">
                      <MapPin className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest block">DESTINATION</span>
                        <p className="text-slate-200 font-bold leading-tight font-sans text-xs">{job.destinationName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Badges and Bidding controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-3 font-mono text-[9px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Car className="h-3 w-3 text-slate-500" />
                        <span>{job.vehicleType}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-bold">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <span>{job.distance} mi</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleBidClick(job.id)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[9px] rounded-lg tracking-widest uppercase transition-colors shadow-sm active:scale-95 cursor-pointer"
                    >
                      SECURE JOB
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* MY SCHEDULED PRE BOOKINGS TAB */
          myScheduledJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                <Calendar className="h-5 w-5 text-slate-600" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">NO SCHEDULED ADVANCE JOBS SECURED</p>
              <p className="text-[9px] text-slate-600 max-w-[260px] leading-normal mt-1">
                When you secure pre-bookings from the available board, they will be tracked here so you can prepare for them.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myScheduledJobs.map((job) => (
                <div 
                  key={job.id}
                  className="bg-[#111622] rounded-2xl border border-emerald-950 p-4 shadow-md hover:border-slate-700/80 transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Visual accent for secured/scheduled work */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>

                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-emerald-950/80 border border-emerald-900 text-emerald-400 px-2 py-1 rounded font-black text-[9px] flex items-center gap-1 uppercase">
                        <Check className="h-3 w-3" />
                        <span>SECURED: {job.pickupTime}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 text-sm font-black tracking-wide font-mono">
                        £{job.fareAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Route Details */}
                  <div className="space-y-2 mb-3.5">
                    <div className="flex items-start gap-2 text-[10px]">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest block">PICKUP</span>
                        <p className="text-slate-200 font-bold leading-tight font-sans text-xs">{job.pickupName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-[10px]">
                      <MapPin className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest block">DESTINATION</span>
                        <p className="text-slate-200 font-bold leading-tight font-sans text-xs">{job.destinationName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Badges and withdraw button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-3 font-mono text-[9px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Car className="h-3 w-3 text-slate-500" />
                        <span>{job.vehicleType}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-bold">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <span>{job.distance} mi</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleCancelClick(job.id)}
                      className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-900/50 font-black text-[9px] rounded-lg tracking-widest uppercase transition-colors cursor-pointer"
                    >
                      WITHDRAW
                    </button>
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
