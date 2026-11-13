import React, { useState } from 'react';
import { 
  Flame, 
  Clock, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Send, 
  CheckCircle, 
  Users, 
  AlertCircle, 
  Plus, 
  Sparkles, 
  Car, 
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { AuctionJob, AuctionBid, Booking } from '../types';
import { playAcceptChime, playCashSettlementChime, playMessageChime } from '../utils/audio';

interface AuctionArenaPanelProps {
  auctions: AuctionJob[];
  onPlaceBid: (auctionId: string, amount: number, note: string) => void;
  onSimulateCustomerAccept: (auctionId: string) => void;
  onClaimAuctionJob: (job: AuctionJob) => void;
  onAddCustomAuction: (newAuction: AuctionJob) => void;
}

export default function AuctionArenaPanel({
  auctions,
  onPlaceBid,
  onSimulateCustomerAccept,
  onClaimAuctionJob,
  onAddCustomAuction,
}: AuctionArenaPanelProps) {
  const [biddingAuctionId, setBiddingAuctionId] = useState<string | null>(null);
  const [customBidAmount, setCustomBidAmount] = useState<string>('');
  const [customBidNote, setCustomBidNote] = useState<string>('Mercedes Saloon • Arrive in 10 mins');
  const [filterTab, setFilterTab] = useState<'OPEN' | 'MY_BIDS' | 'WON'>('OPEN');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New simulated auction form
  const [newCustName, setNewCustName] = useState('Oliver Wright');
  const [newPickup, setNewPickup] = useState('YORK TRAIN STATION');
  const [newDest, setNewDest] = useState('LEEDS BRADFORD AIRPORT');
  const [newBaseFare, setNewBaseFare] = useState('42.00');
  const [newMaxBudget, setNewMaxBudget] = useState('55.00');
  const [newDistance, setNewDistance] = useState('28.5');
  const [newTime, setNewTime] = useState('Immediate • 15:45');

  const openAuctions = auctions.filter((a) => a.status === 'OPEN' || a.status === 'BID_PLACED' || a.status === 'CUSTOMER_REVIEWING');
  const myBidAuctions = auctions.filter((a) => a.status === 'BID_PLACED' || a.status === 'CUSTOMER_REVIEWING');
  const wonAuctions = auctions.filter((a) => a.status === 'ACCEPTED');

  const displayedAuctions =
    filterTab === 'OPEN'
      ? auctions.filter((a) => a.status !== 'ACCEPTED')
      : filterTab === 'MY_BIDS'
      ? myBidAuctions
      : wonAuctions;

  const handleOpenBid = (auction: AuctionJob) => {
    setBiddingAuctionId(auction.id);
    const suggested = auction.myBid || Math.round((auction.baseFare * 1.15) * 10) / 10;
    setCustomBidAmount(suggested.toFixed(2));
  };

  const handleSubmitBid = (auctionId: string) => {
    const amount = parseFloat(customBidAmount);
    if (!amount || isNaN(amount)) {
      alert('Please enter a valid bid amount.');
      return;
    }
    onPlaceBid(auctionId, amount, customBidNote);
    setBiddingAuctionId(null);
    playAcceptChime();
  };

  const handleCreateNewAuction = (e: React.FormEvent) => {
    e.preventDefault();
    const created: AuctionJob = {
      id: `auc-${Date.now().toString().slice(-4)}`,
      customerName: newCustName,
      phone: '+44 7700 900123',
      pickupTime: newTime,
      pickupName: newPickup.toUpperCase(),
      pickupCoords: { lat: 53.9579, lng: -1.0929 },
      destinationName: newDest.toUpperCase(),
      destCoords: { lat: 53.8659, lng: -1.6606 },
      baseFare: parseFloat(newBaseFare) || 30.0,
      maxBudget: parseFloat(newMaxBudget) || 45.0,
      distance: parseFloat(newDistance) || 15.0,
      vehicleType: 'Executive / Any Class',
      isUrgent: true,
      specialNotes: 'Flight departure. Luggage assistance needed.',
      status: 'OPEN',
      bidExpirySeconds: 45,
      competingBids: [
        {
          id: 'comp-1',
          driverName: 'Driver Marcus (Skoda)',
          amount: (parseFloat(newBaseFare) || 30) + 4,
          etaMinutes: 12,
          rating: 4.88,
          vehicle: 'Skoda Superb',
          time: '1 min ago',
        },
      ],
      createdAt: Date.now(),
    };
    onAddCustomAuction(created);
    setShowCreateModal(false);
    playMessageChime();
  };

  return (
    <div className="flex-1 bg-[#0a0e17] flex flex-col h-full overflow-hidden text-slate-200 font-mono">
      {/* Header */}
      <div className="px-4 py-3 bg-[#111726] border-b border-slate-800 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>LIVE AUCTION ARENA</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h2>
            <p className="text-[9px] text-slate-400">REAL-TIME CUSTOMER BIDDING MARKETPLACE</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[9px] font-black rounded-lg uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-purple-600/20"
        >
          <Plus className="h-3 w-3 stroke-[3]" />
          <span>SIMULATE REQUEST</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#0d121e] border-b border-slate-800 shrink-0 text-[10px] font-bold">
        <button
          onClick={() => setFilterTab('OPEN')}
          className={`flex-1 py-3 tracking-wider uppercase border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            filterTab === 'OPEN'
              ? 'text-purple-400 border-purple-500 bg-purple-500/5'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>ALL AUCTIONS ({openAuctions.length})</span>
        </button>
        <button
          onClick={() => setFilterTab('MY_BIDS')}
          className={`flex-1 py-3 tracking-wider uppercase border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            filterTab === 'MY_BIDS'
              ? 'text-purple-400 border-purple-500 bg-purple-500/5'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>MY ACTIVE BIDS ({myBidAuctions.length})</span>
        </button>
        <button
          onClick={() => setFilterTab('WON')}
          className={`flex-1 py-3 tracking-wider uppercase border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            filterTab === 'WON'
              ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          <CheckCircle className="h-3.5 w-3.5" />
          <span>WON AUCTIONS ({wonAuctions.length})</span>
        </button>
      </div>

      {/* Auction List Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        
        {displayedAuctions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
              <AlertCircle className="h-5 w-5 text-slate-600" />
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">
              NO AUCTION REQUESTS IN THIS CATEGORY
            </p>
            <p className="text-[9px] text-slate-600 max-w-[280px] leading-relaxed mt-1 font-sans">
              Tap 'SIMULATE REQUEST' to generate customer trip requests looking for bids.
            </p>
          </div>
        ) : (
          displayedAuctions.map((job) => {
            const isBiddingThis = biddingAuctionId === job.id;
            const hasMyBid = !!job.myBid;
            const isWon = job.status === 'ACCEPTED';

            return (
              <div
                key={job.id}
                className={`bg-[#111726] rounded-2xl border p-4 shadow-lg transition-all relative overflow-hidden flex flex-col justify-between ${
                  isWon
                    ? 'border-emerald-500/80 bg-emerald-950/20'
                    : hasMyBid
                    ? 'border-purple-500/60'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Visual Top Glow */}
                {isWon && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                )}

                {/* Card Top Details */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1 ${
                        isWon
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : job.isUrgent
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-purple-950 text-purple-400 border border-purple-800'
                      }`}
                    >
                      {isWon ? <Check className="h-3 w-3" /> : <Flame className="h-3 w-3" />}
                      <span>{isWon ? 'AUCTION WON' : job.isUrgent ? 'URGENT BID' : 'OPEN AUCTION'}</span>
                    </span>

                    <span className="text-[9px] text-slate-400 font-bold">
                      ⏰ {job.pickupTime}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[8px] text-slate-500 uppercase block font-bold">
                      {hasMyBid ? 'YOUR BID' : 'STARTING OFFER'}
                    </span>
                    <span
                      className={`text-base font-black ${
                        isWon
                          ? 'text-emerald-400'
                          : hasMyBid
                          ? 'text-purple-400'
                          : 'text-slate-100'
                      }`}
                    >
                      £{(hasMyBid ? job.myBid! : job.baseFare).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Route Information */}
                <div className="space-y-2 mb-3 font-sans text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[8px] font-mono font-bold text-slate-500 uppercase block">
                        PICKUP POINT
                      </span>
                      <p className="text-slate-200 font-extrabold leading-snug">{job.pickupName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[8px] font-mono font-bold text-slate-500 uppercase block">
                        DESTINATION
                      </span>
                      <p className="text-slate-200 font-extrabold leading-snug">{job.destinationName}</p>
                    </div>
                  </div>
                </div>

                {/* Customer & Competing Driver Bids Strip */}
                <div className="bg-[#0c111c] border border-slate-800/80 rounded-xl p-2.5 mb-3 text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold flex items-center gap-1.5">
                      <span>👤 {job.customerName}</span>
                      <span className="text-slate-600">•</span>
                      <span>Budget: up to £{job.maxBudget.toFixed(2)}</span>
                    </span>
                    <span className="text-emerald-400 font-bold">{job.distance} mi</span>
                  </div>

                  {job.competingBids && job.competingBids.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px]">
                      <span className="text-slate-500">Other Driver Bids:</span>
                      <div className="flex items-center gap-2 text-slate-300">
                        {job.competingBids.map((b) => (
                          <span key={b.id} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {b.driverName.split(' ')[0]}: £{b.amount.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasMyBid && !isWon && (
                    <div className="pt-1 border-t border-purple-900/50 flex items-center justify-between text-[9px] text-purple-300">
                      <span>Your Pitch: {job.myBidNote || 'Standard'}</span>
                      <span className="font-bold text-amber-400 animate-pulse">Awaiting Customer Decision</span>
                    </div>
                  )}
                </div>

                {/* Inline Bidding Form (When driver clicked "Place Bid") */}
                {isBiddingThis && (
                  <div className="p-3 bg-[#131b2e] border border-purple-500/50 rounded-xl mb-3 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-purple-400 uppercase">
                        Enter Custom Bid Amount
                      </span>
                      <button
                        onClick={() => setBiddingAuctionId(null)}
                        className="text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-400 font-bold text-xs">
                          £
                        </span>
                        <input
                          type="number"
                          step="0.50"
                          value={customBidAmount}
                          onChange={(e) => setCustomBidAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-6 pr-2 text-purple-400 font-mono text-xs font-black focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <button
                        onClick={() => handleSubmitBid(job.id)}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase rounded-lg cursor-pointer"
                      >
                        SUBMIT BID
                      </button>
                    </div>

                    {/* Quick increment chips */}
                    <div className="flex gap-1.5">
                      {[1, 3, 5, 8].map((add) => (
                        <button
                          key={add}
                          onClick={() => setCustomBidAmount((job.baseFare + add).toFixed(2))}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[9px] rounded border border-slate-800 cursor-pointer"
                        >
                          +£{add}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {isWon ? (
                    <button
                      onClick={() => onClaimAuctionJob(job)}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] rounded-xl tracking-wider uppercase transition-colors shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Car className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>START TRIP & NAVIGATE ON MAP NOW</span>
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        {hasMyBid && (
                          <button
                            onClick={() => onSimulateCustomerAccept(job.id)}
                            className="px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800 rounded-lg text-[9px] font-black uppercase cursor-pointer"
                            title="Simulate customer immediately accepting your bid"
                          >
                            🤝 TEST: ACCEPT MY BID
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenBid(job)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-[9px] rounded-xl tracking-wider uppercase transition-colors shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
                      >
                        {hasMyBid ? 'UPDATE BID' : 'PLACE AUCTION BID'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}

      </div>

      {/* Modal to simulate new customer auction request */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-black text-purple-400 flex items-center gap-1.5 uppercase">
                <Sparkles className="h-4 w-4" /> Simulate Customer Auction Request
              </span>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewAuction} className="grid grid-cols-2 gap-3 text-[10px]">
              <div className="col-span-2">
                <label className="block text-slate-400 uppercase font-bold mb-1">Customer Name</label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-400 uppercase font-bold mb-1">Pickup Location</label>
                <input
                  type="text"
                  value={newPickup}
                  onChange={(e) => setNewPickup(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-400 uppercase font-bold mb-1">Destination</label>
                <input
                  type="text"
                  value={newDest}
                  onChange={(e) => setNewDest(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Starting Base (£)</label>
                <input
                  type="number"
                  step="0.50"
                  value={newBaseFare}
                  onChange={(e) => setNewBaseFare(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Customer Max Budget (£)</label>
                <input
                  type="number"
                  step="0.50"
                  value={newMaxBudget}
                  onChange={(e) => setNewMaxBudget(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white"
                  required
                />
              </div>

              <div className="col-span-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-[10px] rounded-xl tracking-wider cursor-pointer mt-1"
                >
                  BROADCAST TO LIVE AUCTION ARENA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
