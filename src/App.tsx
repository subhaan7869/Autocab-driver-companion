import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Wifi, 
  Battery, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Navigation, 
  Calendar, 
  Flame, 
  Gavel, 
  TrendingUp, 
  CheckCircle, 
  Sparkles, 
  Car, 
  X, 
  Play, 
  User, 
  Bell, 
  Volume2, 
  ExternalLink,
  PhoneCall,
  CreditCard,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Components
import MapSimulator, { DEFAULT_MAP_LANDMARKS, resolveLocationCoords } from './components/MapSimulator';
import JobPanel from './components/JobPanel';
import PreBookingsPanel from './components/PreBookingsPanel';
import AuctionArenaPanel from './components/AuctionArenaPanel';
import CounterBidModal from './components/CounterBidModal';
import EarningsPanel from './components/EarningsPanel';

// Audio
import { 
  playOfferChime, 
  playAcceptChime, 
  playMessageChime, 
  playArrivedChime, 
  playMeterStartChime, 
  playCashSettlementChime, 
  playWarningBuzzer 
} from './utils/audio';

// Types
import { 
  Booking, 
  JobStatus, 
  DriverStatus, 
  BidJob, 
  AuctionJob, 
  EarningsRecord,
  DriverProfile 
} from './types';

// Initial Pre-Bookings
const INITIAL_PREBOOKINGS: BidJob[] = [
  {
    id: 'bid-101',
    passengerName: 'Dale Thomson',
    phone: '+44 7911 123456',
    pickupTime: '14:30',
    pickupName: 'YORK HOSPITAL',
    pickupCoords: { lat: 53.9682, lng: -1.0772 },
    destinationName: 'YORK CITY CENTRE',
    destCoords: { lat: 53.9579, lng: -1.0929 },
    fareAmount: 7.50,
    distance: 2.3,
    vehicleType: 'Standard Saloon',
    status: 'PENDING',
  },
  {
    id: 'bid-102',
    passengerName: 'Sarah Jenkins',
    phone: '+44 7700 900456',
    pickupTime: '15:15',
    pickupName: 'HARROGATE',
    pickupCoords: { lat: 53.9911, lng: -1.5398 },
    destinationName: 'YORK HOSPITAL',
    destCoords: { lat: 53.9682, lng: -1.0772 },
    fareAmount: 38.20,
    distance: 21.4,
    vehicleType: 'Executive Estate',
    status: 'PENDING',
  },
  {
    id: 'bid-103',
    passengerName: 'Michael Chang',
    phone: '+44 7890 123789',
    pickupTime: '16:00',
    pickupName: 'THIRSK',
    pickupCoords: { lat: 54.2307, lng: -1.3431 },
    destinationName: 'LEEDS T/STATION',
    destCoords: { lat: 53.7972, lng: -1.5458 },
    fareAmount: 52.00,
    distance: 38.6,
    vehicleType: 'Wheelchair MPV',
    status: 'PENDING',
  },
  {
    id: 'bid-104',
    passengerName: 'Dr. Laura Croft',
    phone: '+44 7412 554433',
    pickupTime: '18:15',
    pickupName: 'YORK CITY CENTRE',
    pickupCoords: { lat: 53.9579, lng: -1.0929 },
    destinationName: 'PICKERING',
    destCoords: { lat: 54.2442, lng: -0.7761 },
    fareAmount: 44.00,
    distance: 26.5,
    vehicleType: 'Executive Estate',
    status: 'PENDING',
  },
];

// Initial Live Auction Marketplace Requests
const INITIAL_AUCTIONS: AuctionJob[] = [
  {
    id: 'auc-201',
    customerName: 'Oliver Wright',
    phone: '+44 7700 900123',
    pickupTime: 'Immediate • 14:45',
    pickupName: 'YORK CITY CENTRE',
    pickupCoords: { lat: 53.9579, lng: -1.0929 },
    destinationName: 'LEEDS T/STATION',
    destCoords: { lat: 53.7972, lng: -1.5458 },
    baseFare: 36.00,
    maxBudget: 48.00,
    distance: 24.8,
    vehicleType: 'Saloon or MPV',
    isUrgent: true,
    specialNotes: 'Train connection to London Kings Cross. Need reliable driver.',
    status: 'OPEN',
    bidExpirySeconds: 60,
    competingBids: [
      {
        id: 'comp-1',
        driverName: 'Driver Marcus',
        amount: 40.00,
        etaMinutes: 12,
        rating: 4.88,
        vehicle: 'Skoda Superb',
        time: '2m ago',
      },
    ],
    createdAt: Date.now() - 30000,
  },
  {
    id: 'auc-202',
    customerName: 'Emma Watson',
    phone: '+44 7890 223344',
    pickupTime: '16:30',
    pickupName: 'YORK HOSPITAL',
    pickupCoords: { lat: 53.9682, lng: -1.0772 },
    destinationName: 'HARROGATE',
    destCoords: { lat: 53.9911, lng: -1.5398 },
    baseFare: 32.00,
    maxBudget: 42.00,
    distance: 21.4,
    vehicleType: 'Executive Saloon',
    isUrgent: false,
    specialNotes: 'Post-consultation transfer. Smooth ride appreciated.',
    status: 'OPEN',
    bidExpirySeconds: 120,
    competingBids: [
      {
        id: 'comp-2',
        driverName: 'Driver Tariq',
        amount: 35.00,
        etaMinutes: 15,
        rating: 4.92,
        vehicle: 'Mercedes C-Class',
        time: '5m ago',
      },
    ],
    createdAt: Date.now() - 60000,
  },
  {
    id: 'auc-203',
    customerName: 'James Miller',
    phone: '+44 7555 667788',
    pickupTime: '17:00',
    pickupName: 'HAXBY (YORK)',
    pickupCoords: { lat: 53.9984, lng: -1.0722 },
    destinationName: 'MALTON (YORK)',
    destCoords: { lat: 54.1357, lng: -0.7963 },
    baseFare: 28.00,
    maxBudget: 38.00,
    distance: 18.2,
    vehicleType: 'Any Vehicle',
    isUrgent: false,
    specialNotes: 'Regular commute. Prompt arrival.',
    status: 'OPEN',
    bidExpirySeconds: 180,
    competingBids: [],
    createdAt: Date.now() - 15000,
  },
];

const DEFAULT_PROFILE: DriverProfile = {
  id: '412',
  name: 'Hassen Nabeel',
  badgeNumber: 'PHV-99831',
  rating: 4.96,
  vehicleModel: 'Toyota Prius / Mercedes E-Class',
  vehicleReg: 'LC22 CAB',
  fleetName: 'Autocab Bidding & Pre-Booking',
  driverPin: '1234',
  documents: [
    { name: 'Private Hire Driver License', expiryDate: '12/12/2028', status: 'VALID' },
    { name: 'Comprehensive Cab Insurance', expiryDate: '24/09/2026', status: 'VALID' },
  ],
};

export default function App() {
  // Navigation View: MAP | AUCTIONS | PREBOOKINGS | SCHEDULED | EARNINGS
  const [activeTab, setActiveTab] = useState<'MAP' | 'AUCTIONS' | 'PREBOOKINGS' | 'SCHEDULED' | 'EARNINGS'>('MAP');

  // Driver & Job States
  const [driverOnline, setDriverOnline] = useState<boolean>(true);
  const [driverProfile] = useState<DriverProfile>(DEFAULT_PROFILE);
  const [jobStatus, setJobStatus] = useState<JobStatus>('NONE');
  const [currentJob, setCurrentJob] = useState<Booking | null>(null);
  const [runningFare, setRunningFare] = useState<number>(0);
  const [localTime, setLocalTime] = useState<string>('');

  // Lists
  const [bidJobs, setBidJobs] = useState<BidJob[]>(INITIAL_PREBOOKINGS);
  const [auctions, setAuctions] = useState<AuctionJob[]>(INITIAL_AUCTIONS);
  const [earnings, setEarnings] = useState<EarningsRecord[]>([
    {
      id: 'earn-1',
      date: 'Today 12:15',
      fareAmount: 24.50,
      fareType: 'CARD',
      pickup: 'YORK CITY CENTRE',
      destination: 'THIRSK',
      jobType: 'PREBOOKING',
    },
    {
      id: 'earn-2',
      date: 'Today 13:30',
      fareAmount: 32.00,
      fareType: 'CASH',
      pickup: 'HARROGATE',
      destination: 'LEEDS T/STATION',
      jobType: 'AUCTION',
    },
  ]);

  // Toast / Notification
  const [activeToast, setActiveToast] = useState<{ title: string; desc: string; type: 'success' | 'alert' | 'info' } | null>(null);

  // Counter-Bid Auction Modal State
  const [counterBidModalOpen, setCounterBidModalOpen] = useState<boolean>(false);
  const [counterBidTarget, setCounterBidTarget] = useState<BidJob | Booking | null>(null);

  // Time ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = useCallback((title: string, desc: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setActiveToast({ title, desc, type });
    if (type === 'success') playCashSettlementChime();
    else if (type === 'alert') playWarningBuzzer();
    else playMessageChime();

    setTimeout(() => {
      setActiveToast(null);
    }, 4500);
  }, []);

  // Total won jobs count
  const totalWonCount = bidJobs.filter((b) => b.status === 'ACCEPTED' || b.status === 'AUCTION_WON').length +
    auctions.filter((a) => a.status === 'ACCEPTED').length;

  const totalEarningsToday = earnings.reduce((acc, curr) => acc + curr.fareAmount, 0);

  // Trigger incoming simulated offer test
  const handleSimulateIncomingOffer = () => {
    const newOffer: Booking = {
      id: `offer-${Date.now().toString().slice(-4)}`,
      passengerName: 'Robert Vance',
      phone: '+44 7911 887766',
      pickup: { lat: 53.9682, lng: -1.0772, name: 'YORK HOSPITAL' },
      destination: { lat: 53.9579, lng: -1.0929, name: 'YORK CITY CENTRE' },
      fareType: 'CASH',
      fareAmount: 8.50,
      distance: 2.3,
      estimatedDuration: 8,
      specialNotes: 'Main hospital entrance reception.',
      timeRequested: 'Immediate',
      sourceType: 'DIRECT',
    };
    setCurrentJob(newOffer);
    setJobStatus('OFFERED');
    playOfferChime();
  };

  // ACCEPT direct offer
  const handleAcceptJob = () => {
    if (!currentJob) return;
    setJobStatus('ACCEPTED');
    setRunningFare(currentJob.fareAmount);
    setActiveTab('MAP');
    playAcceptChime();
    showToast('JOB ACCEPTED', `Route to ${currentJob.pickup.name} activated on GPS.`, 'success');
  };

  // REJECT direct offer
  const handleRejectJob = () => {
    setCurrentJob(null);
    setJobStatus('NONE');
    playWarningBuzzer();
    showToast('OFFER DECLINED', 'Job released back to dispatch network.', 'alert');
  };

  // DECLINE & BID ON DIRECT OFFER (Transforms into CounterBidModal!)
  const handleDeclineAndCounterBidDirect = () => {
    if (!currentJob) return;
    const jobForBidding = { ...currentJob };
    setCurrentJob(null);
    setJobStatus('NONE');
    setCounterBidTarget(jobForBidding);
    setCounterBidModalOpen(true);
  };

  // Open Counter Bid Modal from a Pre-Booking
  const handleOpenCounterBidFromPreBooking = (job: BidJob) => {
    setCounterBidTarget(job);
    setCounterBidModalOpen(true);
  };

  // SUCCESS: Customer accepted counter-bid! Driver gets the job!
  const handleCounterBidWon = (awardedJob: BidJob, agreedFare: number) => {
    // 1. Update list of pre-bookings
    setBidJobs((prev) => {
      const exists = prev.some((j) => j.id === awardedJob.id);
      if (exists) {
        return prev.map((j) => (j.id === awardedJob.id ? { ...awardedJob, fareAmount: agreedFare, status: 'ACCEPTED' } : j));
      }
      return [{ ...awardedJob, fareAmount: agreedFare, status: 'ACCEPTED' }, ...prev];
    });

    playCashSettlementChime();
    showToast(
      '🎉 BID ACCEPTED BY CUSTOMER!',
      `Customer accepted your offer of £${agreedFare.toFixed(2)}. Job awarded to you!`,
      'success'
    );

    // Prompt driver or switch to map navigation
    const pickupCoords = resolveLocationCoords(awardedJob.pickupName, awardedJob.pickupCoords);
    const destCoords = resolveLocationCoords(awardedJob.destinationName, awardedJob.destCoords);
    const convertedBooking: Booking = {
      id: awardedJob.id,
      passengerName: awardedJob.passengerName || 'Customer',
      phone: awardedJob.phone || '+44 7700 900000',
      pickup: {
        lat: pickupCoords.lat,
        lng: pickupCoords.lng,
        name: awardedJob.pickupName,
      },
      destination: {
        lat: destCoords.lat,
        lng: destCoords.lng,
        name: awardedJob.destinationName,
      },
      fareType: 'CASH',
      fareAmount: agreedFare,
      distance: awardedJob.distance,
      estimatedDuration: Math.round(awardedJob.distance * 3),
      specialNotes: awardedJob.specialNotes,
      sourceType: 'AUCTION',
    };

    setCurrentJob(convertedBooking);
    setJobStatus('ACCEPTED');
    setRunningFare(agreedFare);
    setActiveTab('MAP');
  };

  // Accept a pre-booking at standard price
  const handleAcceptStandardPreBooking = (id: string) => {
    setBidJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'ACCEPTED' } : j))
    );
    const target = bidJobs.find((j) => j.id === id);
    if (target) {
      showToast('PRE-BOOKING SECURED', `Scheduled for ${target.pickupTime}: £${target.fareAmount.toFixed(2)}`, 'success');
    }
  };

  // Withdraw from pre-booking
  const handleWithdrawPreBooking = (id: string) => {
    setBidJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'PENDING' } : j))
    );
    showToast('WITHDRAWN', 'Booking returned to available pool.', 'info');
  };

  // Start navigation for a scheduled job right on the map
  const handleStartScheduledJob = (job: BidJob) => {
    const pickupCoords = resolveLocationCoords(job.pickupName, job.pickupCoords);
    const destCoords = resolveLocationCoords(job.destinationName, job.destCoords);
    const booking: Booking = {
      id: job.id,
      passengerName: job.passengerName || 'Customer',
      phone: job.phone || '+44 7700 900000',
      pickup: {
        lat: pickupCoords.lat,
        lng: pickupCoords.lng,
        name: job.pickupName,
      },
      destination: {
        lat: destCoords.lat,
        lng: destCoords.lng,
        name: job.destinationName,
      },
      fareType: 'CASH',
      fareAmount: job.fareAmount,
      distance: job.distance,
      estimatedDuration: Math.round(job.distance * 3),
      specialNotes: job.specialNotes,
      sourceType: 'PREBOOKING',
    };
    setCurrentJob(booking);
    setJobStatus('ACCEPTED');
    setRunningFare(job.fareAmount);
    setActiveTab('MAP');
    playAcceptChime();
    showToast('NAVIGATION STARTED', `En route to pickup at ${job.pickupName}`, 'success');
  };

  // Place custom bid in the Live Auction Arena
  const handlePlaceAuctionBid = (auctionId: string, amount: number, note: string) => {
    setAuctions((prev) =>
      prev.map((a) =>
        a.id === auctionId
          ? {
              ...a,
              myBid: amount,
              myBidNote: note,
              status: 'BID_PLACED',
            }
          : a
      )
    );
    showToast('AUCTION BID SUBMITTED', `Offered £${amount.toFixed(2)} to customer. Awaiting decision.`, 'info');
  };

  // Simulate customer immediately accepting the auction bid!
  const handleSimulateCustomerAcceptAuction = (auctionId: string) => {
    const target = auctions.find((a) => a.id === auctionId);
    if (!target) return;

    const agreedPrice = target.myBid || target.baseFare;

    setAuctions((prev) =>
      prev.map((a) =>
        a.id === auctionId ? { ...a, status: 'ACCEPTED', myBid: agreedPrice } : a
      )
    );

    playCashSettlementChime();
    showToast(
      '🎉 AUCTION WON!',
      `${target.customerName} accepted your bid of £${agreedPrice.toFixed(2)}!`,
      'success'
    );
  };

  // Start driving a won auction job
  const handleClaimAuctionJob = (job: AuctionJob) => {
    const agreedPrice = job.myBid || job.baseFare;
    const booking: Booking = {
      id: job.id,
      passengerName: job.customerName,
      phone: job.phone,
      pickup: {
        lat: job.pickupCoords.lat,
        lng: job.pickupCoords.lng,
        name: job.pickupName,
      },
      destination: {
        lat: job.destCoords.lat,
        lng: job.destCoords.lng,
        name: job.destinationName,
      },
      fareType: 'CARD',
      fareAmount: agreedPrice,
      distance: job.distance,
      estimatedDuration: Math.round(job.distance * 3),
      specialNotes: job.specialNotes,
      sourceType: 'AUCTION',
    };

    setCurrentJob(booking);
    setJobStatus('ACCEPTED');
    setRunningFare(agreedPrice);
    setActiveTab('MAP');
    playAcceptChime();
  };

  // Add custom user-simulated auction
  const handleAddCustomAuction = (newAuction: AuctionJob) => {
    setAuctions((prev) => [newAuction, ...prev]);
    showToast('NEW AUCTION BROADCAST', `Request from ${newAuction.customerName} added to arena.`, 'info');
  };

  // Add custom user-simulated pre-booking
  const handleAddCustomPreBooking = (newJob: BidJob) => {
    setBidJobs((prev) => [newJob, ...prev]);
    showToast('PRE-BOOKING ADDED', `Advance ride for ${newJob.pickupTime} posted to board.`, 'info');
  };

  // Driving Lifecycle Handlers
  const handleArrivedAtPickup = () => {
    setJobStatus('ARRIVED');
    playArrivedChime();
    showToast('ARRIVED AT PICKUP', 'Waiting for passenger. Tap POB to begin journey.', 'info');
  };

  const handleStartPassengerOnBoard = () => {
    setJobStatus('POB');
    playMeterStartChime();
    showToast('PASSENGER ON BOARD', 'Meter engaged. Routing to destination.', 'success');
  };

  const handleDestinationReached = () => {
    setJobStatus('STC');
    playArrivedChime();
    showToast('ARRIVED AT DESTINATION', 'Journey finished. Please settle fare.', 'info');
  };

  const handleCompleteRide = (finalFare: number) => {
    if (currentJob) {
      const record: EarningsRecord = {
        id: `rec-${Date.now().toString().slice(-4)}`,
        date: `Today ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
        fareAmount: finalFare,
        fareType: currentJob.fareType,
        pickup: currentJob.pickup.name,
        destination: currentJob.destination.name,
        jobType: currentJob.sourceType === 'AUCTION' ? 'AUCTION' : 'PREBOOKING',
      };
      setEarnings((prev) => [record, ...prev]);
    }

    setCurrentJob(null);
    setJobStatus('NONE');
    setRunningFare(0);
    playCashSettlementChime();
    showToast('TRIP COMPLETED', `Collected £${finalFare.toFixed(2)}. Standby for next job.`, 'success');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070a11] text-slate-100 font-mono overflow-hidden select-none">
      
      {/* TOP SYSTEM & BRANDING HEADER */}
      <header className="h-14 bg-[#0d1320] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 shadow-lg z-30">
        
        {/* Left Brand & Driver Profile */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center text-black font-black text-xs shadow-md shadow-purple-600/20">
              <Gavel className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-black tracking-wider text-white uppercase font-sans">
                  CAB AUCTION & PRE-BOOKING
                </h1>
                <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.2 rounded border border-purple-800 font-bold">
                  PRO
                </span>
              </div>
              <p className="text-[9px] text-slate-400">
                {driverProfile.name} • {driverProfile.vehicleReg} • ★ {driverProfile.rating}
              </p>
            </div>
          </div>
        </div>

        {/* Center Quick Stats Badges */}
        <div className="hidden md:flex items-center gap-4 text-[10px]">
          <div className="bg-[#121929] px-3 py-1 rounded-xl border border-slate-800 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-slate-400">Live Auctions:</span>
            <span className="text-purple-400 font-black">{auctions.filter((a) => a.status === 'OPEN').length}</span>
          </div>

          <div className="bg-[#121929] px-3 py-1 rounded-xl border border-slate-800 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-slate-400">Pre-Bookings:</span>
            <span className="text-orange-400 font-black">{bidJobs.filter((b) => b.status === 'PENDING').length}</span>
          </div>

          <div className="bg-[#121929] px-3 py-1 rounded-xl border border-slate-800 flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-400">Secured Work:</span>
            <span className="text-emerald-400 font-black">{totalWonCount}</span>
          </div>
        </div>

        {/* Right Status Controls & Time */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDriverOnline(!driverOnline)}
            className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              driverOnline
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-sm shadow-emerald-500/20'
                : 'bg-red-950 text-red-400 border border-red-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${driverOnline ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
            <span>{driverOnline ? 'BIDDING ACTIVE' : 'OFFLINE'}</span>
          </button>

          <div className="text-right pl-2 border-l border-slate-800 hidden sm:block">
            <div className="text-xs font-bold text-slate-200">{localTime}</div>
            <div className="text-[8px] text-slate-500 uppercase tracking-widest font-black">GPS 3D LOCK</div>
          </div>
        </div>
      </header>

      {/* TOP TAB NAVIGATION STRIP */}
      <nav className="h-11 bg-[#0b0f19] border-b border-slate-800/80 px-2 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-1 h-full overflow-x-auto no-scrollbar">
          
          {/* TAB 1: MAP */}
          <button
            onClick={() => setActiveTab('MAP')}
            className={`h-full px-4 text-[10px] font-black uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'MAP'
                ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>MAP & NAVIGATION</span>
            {jobStatus !== 'NONE' && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            )}
          </button>

          {/* TAB 2: LIVE AUCTIONS */}
          <button
            onClick={() => setActiveTab('AUCTIONS')}
            className={`h-full px-4 text-[10px] font-black uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'AUCTIONS'
                ? 'text-purple-400 border-purple-500 bg-purple-500/5'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>AUCTION ARENA</span>
            <span className="bg-purple-900/80 text-purple-300 text-[8px] px-1.5 py-0.2 rounded-full font-bold">
              {auctions.filter((a) => a.status === 'OPEN').length}
            </span>
          </button>

          {/* TAB 3: PRE-BOOKINGS */}
          <button
            onClick={() => setActiveTab('PREBOOKINGS')}
            className={`h-full px-4 text-[10px] font-black uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'PREBOOKINGS'
                ? 'text-orange-400 border-orange-500 bg-orange-500/5'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>PRE-BOOKINGS</span>
            <span className="bg-orange-950 text-orange-400 text-[8px] px-1.5 py-0.2 rounded-full font-bold">
              {bidJobs.filter((b) => b.status === 'PENDING').length}
            </span>
          </button>

          {/* TAB 4: SCHEDULED / WON */}
          <button
            onClick={() => setActiveTab('SCHEDULED')}
            className={`h-full px-4 text-[10px] font-black uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'SCHEDULED'
                ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span>WON & SCHEDULED</span>
            <span className="bg-emerald-950 text-emerald-400 text-[8px] px-1.5 py-0.2 rounded-full font-bold">
              {totalWonCount}
            </span>
          </button>

          {/* TAB 5: EARNINGS */}
          <button
            onClick={() => setActiveTab('EARNINGS')}
            className={`h-full px-4 text-[10px] font-black uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'EARNINGS'
                ? 'text-slate-100 border-slate-400 bg-slate-800/30'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <span>EARNINGS (£{totalEarningsToday.toFixed(0)})</span>
          </button>
        </div>

        {/* Quick Simulation Trigger Button */}
        <div className="flex items-center gap-2 pr-2">
          {jobStatus === 'NONE' && (
            <button
              onClick={handleSimulateIncomingOffer}
              className="px-2.5 py-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-[9px] font-black uppercase rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              title="Test: Simulate an incoming instant job offer"
            >
              <Sparkles className="h-3 w-3" />
              <span>TEST INCOMING OFFER</span>
            </button>
          )}
        </div>
      </nav>

      {/* FLOATING POPUP TOASTS */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 16, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md max-w-md ${
              activeToast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/80 text-emerald-200'
                : activeToast.type === 'alert'
                ? 'bg-red-950/95 border-red-500/80 text-red-200'
                : 'bg-slate-900/95 border-slate-700 text-slate-200'
            }`}
          >
            <div className="p-1.5 rounded-full bg-white/10 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wider">{activeToast.title}</p>
              <p className="text-[10px] text-slate-300 font-sans mt-0.5">{activeToast.desc}</p>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        
        {/* VIEW 1: MAP & NAVIGATION */}
        <div className={`w-full h-full relative flex flex-col ${activeTab === 'MAP' ? 'flex' : 'hidden'}`}>
          <MapSimulator
            currentJob={currentJob}
            jobStatus={jobStatus}
            onArriveAtPickup={handleArrivedAtPickup}
            onDestinationReached={handleDestinationReached}
            preBookings={bidJobs}
            auctions={auctions}
            onSelectPreBooking={(job) => {
              setCounterBidTarget(job);
              setCounterBidModalOpen(true);
            }}
            onSelectAuction={() => {
              setActiveTab('AUCTIONS');
            }}
            driverOnline={driverOnline}
            isVisible={activeTab === 'MAP'}
          />

          {/* DRIVER RIDE CONTROLS OVERLAY (When Job is Active) */}
          {jobStatus !== 'NONE' && currentJob && (
            <div className="absolute top-16 left-3 right-20 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              
              {/* Left Digital Taximeter Strip */}
              <div className="bg-[#0b0f19]/95 border border-slate-800 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 pointer-events-auto">
                <div>
                  <span className="text-[8px] text-slate-400 uppercase font-black block">FARE TOTAL</span>
                  <span className="text-xl font-black text-red-500 font-mono tracking-wider">
                    £{runningFare.toFixed(2)}
                  </span>
                </div>
                <div className="h-7 w-px bg-slate-800" />
                <div>
                  <span className="text-[8px] text-slate-400 uppercase font-black block">TARIFF</span>
                  <span className="text-xs font-black text-amber-400">T1 STANDARD</span>
                </div>
              </div>

              {/* Right Step Actions: "Passenger on Board" or "Clear & Complete" */}
              <div className="pointer-events-auto">
                {jobStatus === 'ARRIVED' && (
                  <button
                    onClick={handleStartPassengerOnBoard}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <User className="h-4 w-4 stroke-[2.5]" />
                    <span>PASSENGER ON BOARD (POB)</span>
                  </button>
                )}

                {jobStatus === 'STC' && (
                  <button
                    onClick={() => handleCompleteRide(runningFare)}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black uppercase text-xs rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <DollarSign className="h-4 w-4 stroke-[3]" />
                    <span>SETTLE & CLEAR METER (£{runningFare.toFixed(2)})</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* VIEW 2: AUCTION ARENA */}
        {activeTab === 'AUCTIONS' && (
          <AuctionArenaPanel
            auctions={auctions}
            onPlaceBid={handlePlaceAuctionBid}
            onSimulateCustomerAccept={handleSimulateCustomerAcceptAuction}
            onClaimAuctionJob={handleClaimAuctionJob}
            onAddCustomAuction={handleAddCustomAuction}
          />
        )}

        {/* VIEW 3: PRE-BOOKINGS BOARD */}
        {activeTab === 'PREBOOKINGS' && (
          <PreBookingsPanel
            bidJobs={bidJobs}
            onBidAccept={handleAcceptStandardPreBooking}
            onOpenCounterBid={handleOpenCounterBidFromPreBooking}
            onWithdrawBid={handleWithdrawPreBooking}
            onStartScheduledJob={handleStartScheduledJob}
            onAddCustomPreBooking={handleAddCustomPreBooking}
          />
        )}

        {/* VIEW 4: WON & SCHEDULED JOBS */}
        {activeTab === 'SCHEDULED' && (
          <div className="flex-1 bg-[#0a0e17] p-4 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>MY SECURED & WON SCHEDULE</span>
                </h2>
                <p className="text-[9px] text-slate-400">
                  ALL PRE-BOOKINGS AND AUCTION RUNS AWARDED EXCLUSIVELY TO YOU
                </p>
              </div>
              <span className="text-emerald-400 font-bold text-xs font-mono">
                {totalWonCount} JOBS READY
              </span>
            </div>

            {totalWonCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                  <Calendar className="h-5 w-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase">NO WON JOBS IN SCHEDULE</p>
                <p className="text-[10px] text-slate-500 max-w-sm mt-1 font-sans">
                  Go to Pre-Bookings to accept jobs or place counter-bids, or visit the Auction Arena to win open bids!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Won Pre-Bookings */}
                {bidJobs
                  .filter((b) => b.status === 'ACCEPTED' || b.status === 'AUCTION_WON')
                  .map((job) => (
                    <div
                      key={job.id}
                      className="bg-[#111726] border border-emerald-950/80 rounded-2xl p-4 shadow-lg space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-black uppercase">
                          📅 PRE-BOOKING SECURED
                        </span>
                        <span className="text-emerald-400 font-black text-sm">
                          £{job.fareAmount.toFixed(2)}
                        </span>
                      </div>

                      <div className="space-y-1.5 font-sans text-xs">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-300 font-bold truncate">{job.pickupName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                          <span className="text-slate-300 font-bold truncate">{job.destinationName}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400 font-mono">
                          ⏰ {job.pickupTime} • {job.distance} mi
                        </span>
                        <button
                          onClick={() => handleStartScheduledJob(job)}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[9px] rounded-xl uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Navigation className="h-3 w-3 stroke-[2.5]" />
                          <span>START ON MAP</span>
                        </button>
                      </div>
                    </div>
                  ))}

                {/* Won Auctions */}
                {auctions
                  .filter((a) => a.status === 'ACCEPTED')
                  .map((auction) => (
                    <div
                      key={auction.id}
                      className="bg-[#111726] border border-purple-900/60 rounded-2xl p-4 shadow-lg space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                        <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-black uppercase">
                          ⚡ AUCTION BID WON
                        </span>
                        <span className="text-purple-400 font-black text-sm">
                          £{(auction.myBid || auction.baseFare).toFixed(2)}
                        </span>
                      </div>

                      <div className="space-y-1.5 font-sans text-xs">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-300 font-bold truncate">{auction.pickupName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                          <span className="text-slate-300 font-bold truncate">{auction.destinationName}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400 font-mono">
                          👤 {auction.customerName} • {auction.distance} mi
                        </span>
                        <button
                          onClick={() => handleClaimAuctionJob(auction)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-[9px] rounded-xl uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Car className="h-3 w-3 stroke-[2.5]" />
                          <span>START TRIP ON MAP</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: EARNINGS LOG */}
        {activeTab === 'EARNINGS' && (
          <EarningsPanel
            earnings={earnings}
          />
        )}

      </main>

      {/* FULL-SCREEN MODAL: INCOMING OFFER (Allows slide to accept OR decline & counter-bid) */}
      {jobStatus === 'OFFERED' && currentJob && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col">
          <JobPanel
            currentJob={currentJob}
            jobStatus={jobStatus}
            onAcceptJob={handleAcceptJob}
            onRejectJob={handleRejectJob}
            onCounterBid={handleDeclineAndCounterBidDirect}
            onClear={handleCompleteRide}
          />
        </div>
      )}

      {/* COUNTER-BID AUCTION MODAL (When driver declines a pre-booking or offer and names their price!) */}
      {counterBidTarget && (
        <CounterBidModal
          job={counterBidTarget}
          isOpen={counterBidModalOpen}
          onClose={() => {
            setCounterBidModalOpen(false);
            setCounterBidTarget(null);
          }}
          onBidAccepted={handleCounterBidWon}
        />
      )}

    </div>
  );
}
