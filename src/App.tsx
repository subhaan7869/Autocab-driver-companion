import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Wifi, 
  Battery, 
  MapPin, 
  ShieldCheck, 
  MessageCircle, 
  LogOut, 
  Grid, 
  PhoneCall, 
  TrendingUp, 
  Layers, 
  Smartphone, 
  Tv, 
  Send, 
  UserCheck, 
  User, 
  Car, 
  HelpCircle,
  Play,
  RotateCcw,
  Menu,
  X,
  CreditCard,
  FileText,
  DollarSign,
  Briefcase,
  ExternalLink,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Sub-components
import MapDisplay from './components/MapDisplay';
import QueuePanel from './components/QueuePanel';
import JobPanel from './components/JobPanel';
import MessagePanel from './components/MessagePanel';
import ProfilePanel from './components/ProfilePanel';
import EarningsPanel from './components/EarningsPanel';
import SliderButton from './components/SliderButton';

// Types
import { 
  DriverStatus, 
  JobStatus, 
  Booking, 
  Zone, 
  BidJob, 
  Message, 
  EarningsRecord, 
  DriverProfile 
} from './types';

// York landmarks coordinates mapping
import { MAP_LANDMARKS } from './components/MapDisplay';

// INITIAL YORK ZONES
const INITIAL_ZONES: Zone[] = [
  { id: '38', name: 'YORK HOSPITAL', carsInZone: 15, activeBookings: 0, driverPosition: 1 },
  { id: '39', name: 'YORK CITY CENTRE', carsInZone: 22, activeBookings: 0 },
  { id: '50', name: 'LEEDS T/STATION', carsInZone: 18, activeBookings: 0 },
  { id: '16', name: 'THIRSK', carsInZone: 4, activeBookings: 0 },
  { id: '17', name: 'KIRBY MOORSIDE', carsInZone: 2, activeBookings: 0 },
  { id: '24', name: 'PICKERING', carsInZone: 5, activeBookings: 0 },
  { id: '25', name: 'TERRINGTON (YORK)', carsInZone: 1, activeBookings: 0 },
  { id: '28', name: 'BOROUGHBRIDGE', carsInZone: 3, activeBookings: 0 },
  { id: '26', name: 'HARROGATE', carsInZone: 9, activeBookings: 1 },
  { id: '18', name: 'EASINGWOLD (YORK)', carsInZone: 3, activeBookings: 0 },
  { id: '29', name: 'MALTON (YORK)', carsInZone: 6, activeBookings: 0 },
  { id: '30', name: 'SHERIFF HUTTON (YORK)', carsInZone: 2, activeBookings: 0 },
  { id: '31', name: 'LINTON ON OUSE (YORK)', carsInZone: 1, activeBookings: 0 },
  { id: '32', name: 'GREEN HAMMERTON (YORK)', carsInZone: 2, activeBookings: 0 },
  { id: '33', name: 'SCARBOROUGH', carsInZone: 7, activeBookings: 0 },
  { id: '34', name: 'HAXBY (YORK)', carsInZone: 4, activeBookings: 0 },
  { id: '0', name: 'NATIONAL NORTH', carsInZone: 1, activeBookings: 0 },
];

const INITIAL_BIDS: BidJob[] = [
  {
    id: 'bid-101',
    pickupTime: '14:30',
    pickupName: 'YORK HOSPITAL',
    destinationName: 'YORK CITY CENTRE',
    fareAmount: 7.50,
    distance: 2.3,
    vehicleType: 'Standard Saloon',
    status: 'PENDING'
  },
  {
    id: 'bid-102',
    pickupTime: '15:15',
    pickupName: 'HARROGATE',
    destinationName: 'YORK HOSPITAL',
    fareAmount: 38.20,
    distance: 21.4,
    vehicleType: 'Executive Estate',
    status: 'PENDING'
  },
  {
    id: 'bid-103',
    pickupTime: '16:00',
    pickupName: 'THIRSK',
    destinationName: 'LEEDS T/STATION',
    fareAmount: 52.00,
    distance: 38.6,
    vehicleType: 'Wheelchair MPV',
    status: 'PENDING'
  }
];

const DEFAULT_PROFILE: DriverProfile = {
  id: '412',
  name: 'Hassen Nabeel',
  badgeNumber: 'PHV-99831',
  rating: 4.96,
  vehicleModel: 'Toyota Prius (Silver)',
  vehicleReg: 'LC22 CAB',
  fleetName: 'Autocab York & District',
  driverPin: '1234',
  documents: [
    { name: 'Private Hire Driver License (Badge)', expiryDate: '12/12/2028', status: 'VALID' },
    { name: 'Comprehensive Cab Insurance', expiryDate: '24/09/2026', status: 'VALID' },
    { name: 'Hackney Carriage Vehicle Permit', expiryDate: '15/02/2027', status: 'VALID' },
    { name: 'MOT Certificate of Compliance', expiryDate: '01/11/2026', status: 'VALID' }
  ]
};

// Queue of bookings to simulate York-based scenarios
const PRESET_BOOKINGS: Omit<Booking, 'id'>[] = [
  {
    passengerName: 'dale',
    phone: '+44 7911 123456',
    pickup: { lat: 53.9682, lng: -1.0772, name: 'YORK HOSPITAL' },
    destination: { lat: 53.9579, lng: -1.0929, name: 'YORK CITY CENTRE' },
    fareType: 'CASH',
    fareAmount: 5.00,
    distance: 2.1,
    estimatedDuration: 8,
    specialNotes: 'Cash booking. Passenger is at Main Entrance reception.'
  },
  {
    passengerName: 'John Doe',
    phone: '+44 7822 654321',
    pickup: { lat: 53.7972, lng: -1.5458, name: 'LEEDS T/STATION' },
    destination: { lat: 53.9575, lng: -1.0667, name: 'ARGOS' },
    fareType: 'CASH',
    fareAmount: 45.26,
    distance: 24.2,
    estimatedDuration: 35,
    specialNotes: 'Account booking. Customer has heavy baggage.'
  },
  {
    passengerName: 'Sarah Jenkins',
    phone: '+44 7566 987654',
    pickup: { lat: 54.2307, lng: -1.3431, name: 'THIRSK' },
    destination: { lat: 53.9579, lng: -1.0929, name: 'YORK CITY CENTRE' },
    fareType: 'CARD',
    fareAmount: 32.50,
    distance: 23.1,
    estimatedDuration: 28,
    specialNotes: 'In-app Card pre-paid. Ulez compliant hybrid car.'
  }
];

export default function App() {
  // Device Login State
  const [loggedIn, setLoggedIn] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // App Layout State (Mimics Hamburger menu drawer rather than bottom tabs)
  const [activeSubView, setActiveSubView] = useState<'HOME' | 'SHEETS' | 'DOCS' | 'MESSENGER' | 'SETTINGS'>('HOME');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [driverOnline, setDriverOnline] = useState(true); // default to online to show zone listings
  const [driverStatus, setDriverStatus] = useState<DriverStatus>('AVAILABLE');
  
  // Job & Ride State
  const [currentJob, setCurrentJob] = useState<Booking | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus>('NONE');
  const [currentZone, setCurrentZone] = useState<string | null>('YORK HOSPITAL');
  const [runningFare, setRunningFare] = useState<number>(0.00);

  // Video-mimic interactions & custom modal states
  const [destinationSearchOpen, setDestinationSearchOpen] = useState(false);
  const [modifiedToast, setModifiedToast] = useState<{ message: string; sub: string } | null>(null);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [activePhoneCall, setActivePhoneCall] = useState<string | null>(null);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(true);

  // Dynamic Lists State
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [bidJobs, setBidJobs] = useState<BidJob[]>(INITIAL_BIDS);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'DISPATCH',
      text: 'Ensure shift badge is visible to York licensing authorities. Airport queue flow slow.',
      timestamp: '07:05',
      isRead: true,
    }
  ]);
  const [earnings, setEarnings] = useState<EarningsRecord[]>([]);
  const [bookingIndex, setBookingIndex] = useState(0);

  // Real-time "Jobs on Offer" modal (triggered when plotting online or via dispatch desk)
  const [jobsOnOfferOpen, setJobsOnOfferOpen] = useState(false);

  // Time ticks
  const [localTime, setLocalTime] = useState('');

  // Audio Context for sound warnings
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sync Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fluctuating queue counts for realism
  useEffect(() => {
    const fluctuationInterval = setInterval(() => {
      setZones((prevZones) =>
        prevZones.map((zone) => {
          if (zone.name === currentZone) return zone;
          const change = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          const cars = Math.max(1, zone.carsInZone + change);
          return { ...zone, carsInZone: cars };
        })
      );
    }, 10000);

    return () => clearInterval(fluctuationInterval);
  }, [currentZone]);

  // Taximeter fare simulation when passenger is on board
  useEffect(() => {
    if (jobStatus === 'POB' || jobStatus === 'STC') {
      if (!currentJob) return;
      const targetFare = currentJob.fareAmount;
      const fareInterval = setInterval(() => {
        setRunningFare((prev) => {
          if (prev >= targetFare) {
            clearInterval(fareInterval);
            return targetFare;
          }
          // Increment smoothly
          return Math.min(targetFare, Number((prev + 0.35).toFixed(2)));
        });
      }, 1000);

      return () => clearInterval(fareInterval);
    }
  }, [jobStatus, currentJob]);

  // Login handler
  const handlePinSubmit = () => {
    if (pinInput === DEFAULT_PROFILE.driverPin) {
      setLoggedIn(true);
      setDriverOnline(true);
      setDriverStatus('AVAILABLE');
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
      // play error buzz sound
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } catch (e) {}
    }
  };

  const playAcceptChime = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start(ctx.currentTime + 0.15);
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  // Simulate incoming dispatch booking trigger
  const triggerSimulatedBooking = (indexOverride?: number) => {
    if (jobStatus !== 'NONE') return;

    const idx = indexOverride !== undefined ? indexOverride : bookingIndex;
    const template = PRESET_BOOKINGS[idx % PRESET_BOOKINGS.length];
    
    const newBooking: Booking = {
      ...template,
      id: `booking-${Date.now().toString().slice(-4)}`,
      offeredAt: Date.now()
    };

    setCurrentJob(newBooking);
    setJobStatus('OFFERED');
    setActiveSubView('HOME'); // auto jump back home to show job offer screen
    
    // Cycle booking index for next simulation
    if (indexOverride === undefined) {
      setBookingIndex((prev) => prev + 1);
    }
  };

  // Simulate dispatcher texting driver
  const triggerDispatcherMessage = (customText?: string) => {
    const text = customText || 'Premier Dispatch: Accident reported on A19, expect severe delays inbound to city center.';
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'DISPATCH',
        text,
        timestamp: time,
        isRead: false
      }
    ]);

    // audio notification
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
  };

  // Toggle Driver Online / Offline Status
  const handleToggleOnline = () => {
    if (jobStatus !== 'NONE') return; // Cannot toggle offline during active job

    const newOnline = !driverOnline;
    setDriverOnline(newOnline);

    if (newOnline) {
      setDriverStatus('AVAILABLE');
      setCurrentZone('YORK HOSPITAL');
      // Instantly open the "Jobs on Offer" modal (as shown at 00:24)
      setTimeout(() => {
        setJobsOnOfferOpen(true);
      }, 800);
    } else {
      setDriverStatus('OFFLINE');
      setCurrentZone(null);
      setJobsOnOfferOpen(false);
    }
  };

  // Accept Booking Action
  const handleAcceptJob = () => {
    setJobStatus('ACCEPTED');
    setDriverStatus('BUSY');
    setRunningFare(0.00);
    playAcceptChime();
  };

  // Reject Booking Action
  const handleRejectJob = () => {
    setCurrentJob(null);
    setJobStatus('NONE');
    setDriverStatus('AVAILABLE');
  };

  // Arrive at Pickup Scene Action
  const handleArrived = () => {
    setJobStatus('ARRIVED');
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-arrive-${Date.now()}`,
        sender: 'DISPATCH',
        text: `Automated: SMS alert sent to passenger. CAB 412 is on-scene.`,
        timestamp: time,
        isRead: true
      }
    ]);
  };

  // Passenger On Board Action
  const handlePob = () => {
    setJobStatus('POB');
    setRunningFare(4.50); // initial start base fare
  };

  // Soon to Clear Action
  const handleStc = () => {
    setJobStatus('STC');
    setTimeout(() => {
      triggerDispatcherMessage("Dispatch York: STC registered. Standby for next allocation once current run clears.");
    }, 4000);
  };

  // Clear Meter / Pay & Complete Action
  const handleClear = (finalFare: number) => {
    if (!currentJob) return;

    // Record the completed earnings
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const newRecord: EarningsRecord = {
      id: `earn-${Date.now()}`,
      date: time,
      fareAmount: finalFare,
      fareType: currentJob.fareType,
      pickup: currentJob.pickup.name,
      destination: currentJob.destination.name
    };

    setEarnings((prev) => [...prev, newRecord]);
    
    // Clear active job states
    setCurrentJob(null);
    setJobStatus('NONE');
    setDriverStatus('AVAILABLE');
    setRunningFare(0.00);
    
    // Play completion sound chime
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch(e) {}
  };

  // Plot into a new zone manually
  const handleSelectZone = (zoneName: string) => {
    if (!driverOnline) return;
    if (driverStatus === 'BUSY') return;

    setCurrentZone(zoneName);
    
    setZones((prevZones) =>
      prevZones.map((zone) => {
        if (zone.name === zoneName) {
          return {
            ...zone,
            carsInZone: zone.carsInZone + 1,
            driverPosition: zone.carsInZone + 1
          };
        } else if (zone.driverPosition !== undefined) {
          return {
            ...zone,
            carsInZone: Math.max(0, zone.carsInZone - 1),
            driverPosition: undefined
          };
        }
        return zone;
      })
    );

    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `plot-${Date.now()}`,
        sender: 'DISPATCH',
        text: `Zone registered: plotted in [${zoneName}].`,
        timestamp: time,
        isRead: true
      }
    ]);
  };

  const handleBidOnJob = (jobId: string) => {
    setBidJobs((prevBids) =>
      prevBids.map((bid) => {
        if (bid.id === jobId) {
          const outcome = Math.random() > 0.2 ? 'ACCEPTED' : 'REJECTED';
          
          if (outcome === 'ACCEPTED') {
            setTimeout(() => {
              triggerDispatcherMessage(`Contract Won: Advanced scheduled booking assigned.`);
              const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
              setEarnings((prev) => [
                ...prev,
                {
                  id: `bid-earn-${Date.now()}`,
                  date: `${bid.pickupTime} (Sch)`,
                  fareAmount: bid.fareAmount,
                  fareType: 'ACCOUNT',
                  pickup: bid.pickupName,
                  destination: bid.destinationName
                }
              ]);
            }, 2000);
          }
          return { ...bid, status: outcome };
        }
        return bid;
      })
    );
  };

  const handleSendMessage = (text: string) => {
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const driverMsg: Message = {
      id: `msg-driver-${Date.now()}`,
      sender: 'DRIVER',
      text,
      timestamp: time,
      isRead: true
    };

    setMessages((prev) => [...prev, driverMsg]);

    setTimeout(() => {
      let replyText = 'Premier Dispatch: Copy that CAB 412. Logged.';
      
      if (text.includes('Voice Call')) {
        replyText = 'Dispatch York: Voice call request queued. Operator will establish radio contact.';
      } else if (text.includes('traffic')) {
        replyText = 'Dispatch York: Understood. Logged traffic delay. Advising passenger.';
      } else if (text.includes('No show')) {
        replyText = 'Dispatch York: Approved. Plotting out of scene. Wait fee credited.';
        setEarnings((prev) => [
          ...prev,
          {
            id: `wait-credit-${Date.now()}`,
            date: time,
            fareAmount: 5.00,
            fareType: 'CASH',
            pickup: currentJob?.pickup.name || 'York Hospital',
            destination: 'No-Show Booking Credit'
          }
        ]);
        setCurrentJob(null);
        setJobStatus('NONE');
        setDriverStatus('AVAILABLE');
      } else if (text.includes('breakdown') || text.includes('tyre')) {
        replyText = 'Dispatch York: CRITICAL. Job cancelled. Backup dispatched. Be safe.';
        setDriverOnline(false);
        setDriverStatus('OFFLINE');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-reply-${Date.now()}`,
          sender: 'DISPATCH',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          isRead: false
        }
      ]);
    }, 1500);
  };

  const countUnreadMessages = () => messages.filter(m => !m.isRead).length;
  const handleClearUnread = useCallback(() => {
    setMessages((prev) => prev.map(m => m.isRead ? m : { ...m, isRead: true }));
  }, []);

  const handleSwipeSuccess = () => {
    if (jobStatus === 'ACCEPTED') {
      handleArrived();
    } else if (jobStatus === 'ARRIVED') {
      handlePob();
    } else if (jobStatus === 'POB') {
      handleStc();
    } else if (jobStatus === 'STC') {
      setJobStatus('PAYMENT');
    }
  };

  const getSwipeText = () => {
    switch (jobStatus) {
      case 'ACCEPTED': return 'SLIDE TO ARRIVE';
      case 'ARRIVED': return 'SLIDE TO PICK UP';
      case 'POB': return 'SLIDE TO DROP OFF';
      case 'STC': return 'SLIDE TO COMPLETE';
      default: return 'SLIDE TO CONFIRM';
    }
  };

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col justify-between p-4 md:p-6 font-sans relative overflow-x-hidden">
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Main Grid: Tablet companion on left, Operator Simulation desk on right */}
      <div className="flex-1 w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: PROFESSIONAL WIDESCREEN DRIVER TABLET TERMINAL */}
        <div className="lg:col-span-8 flex flex-col h-[740px] bg-[#0b0e14] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative" id="autocab-companion-screen">
          
          {/* logged out state: PIN screen */}
          {!loggedIn ? (
            <div className="flex-1 bg-gradient-to-br from-[#0c0f17] via-[#111622] to-[#070a0f] flex flex-col md:flex-row select-none overflow-y-auto">
              
              {/* Left branding Column */}
              <div className="flex-1 min-w-[280px] p-6 flex flex-col justify-between border-r border-slate-800 bg-[#070b12] relative overflow-hidden">
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 flex items-center gap-1.5">
                  <div className="w-7 h-7 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-full h-full text-orange-500 fill-none stroke-current" strokeWidth="2.8" strokeLinecap="round">
                      <path d="M5 12a7 7 0 0 1 14 0" />
                      <path d="M8.5 12a3.5 3.5 0 0 1 7 0" />
                      <circle cx="12" cy="12" r="1.5" className="fill-orange-500" />
                    </svg>
                  </div>
                  <span className="text-white font-extrabold tracking-tighter text-lg uppercase">auto<span className="text-orange-500">cab</span></span>
                </div>

                <div className="my-6 relative rounded-2xl overflow-hidden border border-slate-800/80">
                  <img 
                    src="/src/assets/images/autocab_splash_1783608528131.jpg" 
                    alt="Autocab telemetry splash banner"
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-3 left-4">
                    <span className="bg-orange-500 text-black text-[9px] font-mono font-black px-2 py-0.5 rounded tracking-widest uppercase">
                      LTE SECURE CHANNEL
                    </span>
                    <p className="text-white text-xs font-bold mt-1">YORK FLEET TELEMETRY NODE</p>
                  </div>
                </div>

                <div className="space-y-3 relative z-10 font-mono text-xs text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">FLEET CORRESPONDENCE</span>
                    <p className="text-slate-200 font-bold">{DEFAULT_PROFILE.fleetName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#121622]">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">HARDWARE</span>
                      <p className="text-slate-300 font-bold">MDT-TERM 10X</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">BUILD AGENT</span>
                      <p className="text-slate-300 font-bold">v4.1.22</p>
                    </div>
                  </div>
                </div>

                <div className="text-[9px] text-slate-500 font-mono mt-4">
                  LOGISTICS DATA ENCRYPTED • SECURE PROTOCOL
                </div>
              </div>

              {/* Right keypad pin Column */}
              <div className="flex-1 p-6 flex flex-col justify-center items-center bg-[#0d121c] border-l border-slate-950">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="relative mb-2">
                    <img 
                      src="/src/assets/images/driver_avatar_1783608513016.jpg" 
                      alt="Hassen Nabeel profile" 
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full border-2 border-orange-500 shadow-lg object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0d121c]"></span>
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">{DEFAULT_PROFILE.name}</h3>
                  <p className="text-[10px] font-mono text-slate-400">CAB {DEFAULT_PROFILE.id} • {DEFAULT_PROFILE.vehicleReg}</p>
                </div>

                <div className="w-full max-w-[240px] flex flex-col items-center">
                  <div className="flex justify-center gap-3 mb-2">
                    {[0, 1, 2, 3].map((idx) => (
                      <div 
                        key={idx}
                        className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                          pinInput.length > idx 
                            ? 'bg-orange-500 border-orange-400 scale-110 shadow-[0_0_8px_rgba(249,115,22,0.4)]' 
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="h-4 flex items-center justify-center mb-3">
                    {pinError ? (
                      <span className="text-[9px] text-red-500 font-mono font-black uppercase tracking-wider animate-bounce">
                        ⚠️ INVALID PIN - TRY AGAIN
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                        Enter Pin: 1234
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          if (pinInput.length < 4) {
                            setPinInput(prev => prev + num);
                            setPinError(false);
                          }
                        }}
                        className="h-10 bg-[#151b26] hover:bg-[#1f293b] active:bg-orange-500 active:text-white border border-slate-850 text-slate-200 text-sm font-mono font-extrabold rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer"
                      >
                        {num}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => {
                        setPinInput('');
                        setPinError(false);
                      }}
                      className="h-10 bg-[#1a1515] hover:bg-red-950/40 border border-red-950 text-red-400 text-xs font-mono font-bold rounded-full flex items-center justify-center cursor-pointer"
                    >
                      C
                    </button>

                    <button
                      onClick={() => {
                        if (pinInput.length < 4) {
                          setPinInput(prev => prev + '0');
                          setPinError(false);
                        }
                      }}
                      className="h-10 bg-[#151b26] hover:bg-[#1f293b] active:bg-orange-500 active:text-white border border-slate-850 text-slate-200 text-sm font-mono font-extrabold rounded-full flex items-center justify-center cursor-pointer"
                    >
                      0
                    </button>

                    <button
                      onClick={() => {
                        setPinInput(prev => prev.slice(0, -1));
                        setPinError(false);
                      }}
                      className="h-10 bg-[#151b26] hover:bg-[#1f293b] border border-slate-850 text-slate-400 text-xs font-mono font-bold rounded-full flex items-center justify-center cursor-pointer"
                    >
                      ⌫
                    </button>
                  </div>

                  <button
                    onClick={handlePinSubmit}
                    disabled={pinInput.length !== 4}
                    className={`w-full mt-4 py-2.5 text-xs font-black tracking-widest uppercase rounded-xl transition-all shadow-md ${
                      pinInput.length === 4
                        ? 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-850 cursor-not-allowed'
                    }`}
                  >
                    LOG ON SHIFT
                  </button>
                </div>
              </div>
            </div>
          ) : (
                /* MAIN LOGGED IN FLOW */
                <div className="flex-1 flex flex-col relative h-full">
                  
                  {/* UNIFIED COMPANION HEADER BAR */}
                  <div className="bg-[#111622] px-3 py-2 border-b border-slate-950 flex items-center justify-between text-xs font-mono shrink-0 select-none z-30">
                    <div className="flex items-center gap-3">
                      {/* Hamburger menu button */}
                      <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-slate-300 hover:text-white active:scale-90 transition-all p-1 hover:bg-slate-800/50 rounded-lg"
                      >
                        <Menu className="h-5 w-5" />
                      </button>

                      {/* GPS & 4G indicator */}
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1 bg-[#171e2e] px-2 py-0.5 rounded border border-slate-800 text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          <span className="text-slate-300 font-bold">GPS</span>
                        </div>
                        <div className="flex items-center gap-1 bg-[#171e2e] px-2 py-0.5 rounded border border-slate-800 text-[10px] text-slate-300">
                          <span className="text-emerald-500 font-bold">4G</span>
                        </div>
                      </div>
                    </div>

                    {/* Central Brand Identity: Authentic Shield Crest with Crown */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                          {/* Red Shield */}
                          <path d="M10 20 L50 10 L90 20 C90 55, 75 80, 50 90 C25 80, 10 55, 10 20 Z" fill="#d32f2f" stroke="#fbc02d" strokeWidth="4" />
                          {/* Golden Crown */}
                          <path d="M30 65 L70 65 L75 40 L60 50 L50 30 L40 50 L25 40 Z" fill="#fbc02d" />
                          <circle cx="50" cy="30" r="3" fill="#fff" />
                          <circle cx="25" cy="40" r="3" fill="#fff" />
                          <circle cx="75" cy="40" r="3" fill="#fff" />
                        </svg>
                      </div>
                      <span className="text-white font-black tracking-tighter text-xs uppercase font-sans">
                        auto<span className="text-[#ff3b30]">cab</span>
                      </span>
                    </div>

                    {/* Clock & Messaging Envelope Icon */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200 font-bold tracking-wider text-[10px]">{localTime || '07:35:00'}</span>
                      <span className="text-slate-600">|</span>
 
                       {/* Messaging envelope to enter Messenger chat directly */}
                       <button 
                         onClick={() => {
                           setActiveSubView('MESSENGER');
                           setSidebarOpen(false);
                         }}
                         className="relative p-1 text-slate-300 hover:text-white active:scale-95 transition-all"
                       >
                         <MessageCircle className="h-4.5 w-4.5 text-slate-300" />
                         {countUnreadMessages() > 0 && (
                           <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-black text-[8px] rounded-full flex items-center justify-center border border-slate-950 animate-bounce">
                             {countUnreadMessages()}
                           </span>
                         )}
                       </button>
                     </div>
                  </div>

                  {/* SLIDE OUT SIDEBAR DRAWER OVERLAY MATCHING REAL AUTOCAB */}
                  <AnimatePresence>
                    {sidebarOpen && (
                      <>
                        {/* Dim Backdrop */}
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.4 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSidebarOpen(false)}
                          className="absolute inset-0 bg-black z-40"
                        />

                        {/* Drawer body - Polished light grey/white professional cab theme */}
                        <motion.div
                          initial={{ x: '-100%' }}
                          animate={{ x: 0 }}
                          exit={{ x: '-100%' }}
                          transition={{ type: 'tween', duration: 0.22 }}
                          className="absolute top-0 bottom-0 left-0 w-72 bg-[#f4f5f8] text-slate-800 flex flex-col justify-between z-50 border-r border-slate-300/80 font-mono shadow-2xl"
                        >
                          <div>
                            {/* Drawer Header with driver profile details and shield banner */}
                            <div className="bg-[#111622] p-4 text-white border-b border-slate-950 relative overflow-hidden">
                              <div className="absolute right-2 top-2 opacity-10 pointer-events-none">
                                <svg viewBox="0 0 100 100" className="w-24 h-24 text-white fill-current">
                                  <path d="M10 20 L50 10 L90 20 C90 55, 75 80, 50 90 C25 80, 10 55, 10 20 Z" />
                                </svg>
                              </div>
                              <div className="flex items-center gap-3">
                                <img 
                                  src="/src/assets/images/driver_avatar_1783608513016.jpg" 
                                  alt="Hassen Nabeel profile" 
                                  referrerPolicy="no-referrer"
                                  className="w-12 h-12 rounded-full border-2 border-[#fbc02d] object-cover shadow-md"
                                />
                                <div>
                                  <h3 className="text-xs font-black text-white uppercase tracking-wider">{DEFAULT_PROFILE.name}</h3>
                                  <p className="text-[10px] text-slate-400 font-bold">CAB {DEFAULT_PROFILE.id} • {DEFAULT_PROFILE.vehicleReg}</p>
                                </div>
                              </div>
                            </div>

                            {/* Double Driver Compliance Badges (100% inspect records) */}
                            <div className="p-3 bg-white grid grid-cols-2 gap-2 border-b border-slate-200">
                              <div className="p-2 bg-sky-50 rounded-xl border border-sky-100 flex flex-col justify-center">
                                <span className="text-[8px] text-sky-500 font-black tracking-widest uppercase">DRIVER</span>
                                <span className="text-xs font-black text-sky-800 uppercase mt-0.5">COMPL 100%</span>
                              </div>
                              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col justify-center">
                                <span className="text-[8px] text-emerald-500 font-black tracking-widest uppercase">VEHICLE</span>
                                <span className="text-xs font-black text-emerald-800 uppercase mt-0.5">STAND 100%</span>
                              </div>
                            </div>

                            {/* Menu Options - Clean and tactile with spacing */}
                            <div className="p-3 space-y-1 text-xs">
                              <button
                                onClick={() => {
                                  setActiveSubView('HOME');
                                  setSidebarOpen(false);
                                }}
                                className={`w-full text-left p-3.5 rounded-xl font-bold flex items-center gap-3 transition-colors ${
                                  activeSubView === 'HOME' ? 'bg-[#111622] text-white font-black' : 'hover:bg-slate-200/80 text-slate-700'
                                }`}
                              >
                                <Smartphone className={`h-4.5 w-4.5 ${activeSubView === 'HOME' ? 'text-orange-500' : 'text-slate-500'}`} />
                                <span className="tracking-wide">HOME CONSOLE</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveSubView('SHEETS');
                                  setSidebarOpen(false);
                                }}
                                className={`w-full text-left p-3.5 rounded-xl font-bold flex items-center gap-3 transition-colors ${
                                  activeSubView === 'SHEETS' ? 'bg-[#111622] text-white font-black' : 'hover:bg-slate-200/80 text-slate-700'
                                }`}
                              >
                                <TrendingUp className={`h-4.5 w-4.5 ${activeSubView === 'SHEETS' ? 'text-orange-500' : 'text-slate-500'}`} />
                                <span className="tracking-wide">DRIVER SHEETS</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveSubView('DOCS');
                                  setSidebarOpen(false);
                                }}
                                className={`w-full text-left p-3.5 rounded-xl font-bold flex items-center gap-3 transition-colors ${
                                  activeSubView === 'DOCS' ? 'bg-[#111622] text-white font-black' : 'hover:bg-slate-200/80 text-slate-700'
                                }`}
                              >
                                <FileText className={`h-4.5 w-4.5 ${activeSubView === 'DOCS' ? 'text-orange-500' : 'text-slate-500'}`} />
                                <span className="tracking-wide">COMPLIANCE WALLET</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveSubView('MESSENGER');
                                  setSidebarOpen(false);
                                }}
                                className={`w-full text-left p-3.5 rounded-xl font-bold flex items-center gap-3 transition-colors ${
                                  activeSubView === 'MESSENGER' ? 'bg-[#111622] text-white font-black' : 'hover:bg-slate-200/80 text-slate-700'
                                }`}
                              >
                                <MessageCircle className={`h-4.5 w-4.5 ${activeSubView === 'MESSENGER' ? 'text-orange-500' : 'text-slate-500'}`} />
                                <span className="tracking-wide">MESSENGER CHAT</span>
                              </button>
                            </div>
                          </div>

                          {/* Footer with logout button */}
                          <div className="p-4 border-t border-slate-200 bg-white">
                            <button
                              onClick={() => {
                                setLoggedIn(false);
                                setSidebarOpen(false);
                              }}
                              className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-center rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors"
                            >
                              <LogOut className="h-4.5 w-4.5" />
                              LOGOUT SHIFT
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  {/* SUB-VIEW DISPLAY */}
                  <div className="flex-1 overflow-hidden relative">
                    
                    {activeSubView === 'HOME' && (
                      <div className="h-full relative flex flex-col justify-between">
                        
                        {/* 1. If Job offered: JobPanel offer screen */}
                        {jobStatus === 'OFFERED' && (
                          <JobPanel 
                            currentJob={currentJob}
                            jobStatus={jobStatus}
                            onAcceptJob={handleAcceptJob}
                            onRejectJob={handleRejectJob}
                            onClear={handleClear}
                          />
                        )}

                        {/* 2. If Payment Receipt requested */}
                        {jobStatus === 'PAYMENT' && (
                          <JobPanel 
                            currentJob={currentJob}
                            jobStatus={jobStatus}
                            onAcceptJob={handleAcceptJob}
                            onRejectJob={handleRejectJob}
                            onClear={handleClear}
                          />
                        )}

                        {/* 3. If Offline or Standard Zone Queues list */}
                        {jobStatus === 'NONE' && (
                          <QueuePanel 
                            zones={zones}
                            currentZone={currentZone}
                            onSelectZone={handleSelectZone}
                            driverOnline={driverOnline}
                            onToggleOnline={handleToggleOnline}
                          />
                        )}

                         {/* 4. ACTIVE DRIVING RIDE (Full map overlay with top-HUD taximeter and bottom-drawer controls) */}
                         {(jobStatus === 'ACCEPTED' || jobStatus === 'ARRIVED' || jobStatus === 'POB' || jobStatus === 'STC') && currentJob && (
                           <div className="flex-1 relative flex flex-col h-full overflow-hidden">
                             
                             {/* Sliding top notification toast for Job Modified (01:07) */}
                             <AnimatePresence>
                               {modifiedToast && (
                                 <motion.div
                                   initial={{ y: '-100%', opacity: 0 }}
                                   animate={{ y: 12, opacity: 1 }}
                                   exit={{ y: '-100%', opacity: 0 }}
                                   className="absolute top-16 left-4 right-4 bg-amber-500 text-slate-950 px-4 py-3.5 rounded-2xl border-2 border-amber-400 shadow-2xl z-40 font-sans flex items-center justify-between"
                                 >
                                   <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center font-black animate-pulse text-xs">
                                       🔔
                                     </div>
                                     <div>
                                       <h4 className="text-xs font-black uppercase tracking-wider">{modifiedToast.message}</h4>
                                       <p className="text-[11px] font-bold text-slate-900">{modifiedToast.sub}</p>
                                     </div>
                                   </div>
                                   <button 
                                     onClick={() => setModifiedToast(null)}
                                     className="p-1 hover:bg-slate-950/15 rounded-full text-slate-950 cursor-pointer"
                                   >
                                     <X className="h-4 w-4 stroke-[3]" />
                                   </button>
                                 </motion.div>
                               )}
                             </AnimatePresence>

                             {/* Map full bleed */}
                             <div className="absolute inset-0 z-0">
                               <MapDisplay 
                                 currentJob={currentJob}
                                 jobStatus={jobStatus}
                                 onArriveAtPickup={handleArrived}
                                 onDestinationReached={handleStc}
                               />
                             </div>

                             {/* TOP OVERLAY: DIGITAL TAXIMETER HUD STRIP */}
                             <div className="absolute top-3 left-3 right-3 bg-[#0b0f17]/95 text-white p-3.5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md z-10 flex items-center justify-between font-mono select-none">
                               
                               {/* Left NAV Button to open external maps menu */}
                               <button
                                 onClick={() => setNavMenuOpen(true)}
                                 className="flex items-center gap-1.5 bg-[#171e2d] hover:bg-[#20293d] border border-slate-700/80 px-2.5 py-1.5 rounded-xl text-[10px] font-black text-slate-300 transition-all cursor-pointer uppercase"
                               >
                                 <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-400 fill-none stroke-current" strokeWidth="2.5">
                                   <polygon points="3 11 22 2 13 21 11 13 3 11" />
                                 </svg>
                                 <span>NAV</span>
                               </button>

                               {/* Center Glowing LED taximeter fare total */}
                               <div className="text-center flex flex-col items-center bg-black/40 border border-slate-900 px-4 py-1 rounded-xl shadow-inner">
                                 <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest">FARE TOTAL</span>
                                 <span className="text-xl font-black text-[#ff3333] tracking-wider font-mono glow-text drop-shadow-[0_0_6px_rgba(255,51,51,0.35)] animate-pulse">
                                   £{(jobStatus === 'ACCEPTED' || jobStatus === 'ARRIVED') ? '0.00' : runningFare.toFixed(2)}
                                 </span>
                               </div>

                               {/* Right TARIFF & EXTRAS column */}
                               <div className="flex items-center gap-3">
                                 <div className="text-right border-r border-slate-800 pr-2.5">
                                   <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">TARIFF</span>
                                   <span className="text-xs font-black text-orange-500">1</span>
                                 </div>
                                 <div>
                                   <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">EXTRAS</span>
                                   <span className="text-xs font-black text-slate-300">£0.00</span>
                                 </div>
                               </div>
                             </div>

                             {/* BOTTOM OVERLAY: DYNAMIC JOB DETAIL DRAWER & TACLILE SLIDER BUTTON */}
                             <div className="absolute bottom-3 left-3 right-3 bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-2xl z-10 font-mono select-none flex flex-col overflow-hidden transition-all duration-300">
                               
                               {/* Sliding drawer collapsible top drag handle */}
                               <div 
                                 onClick={() => setBottomSheetOpen(!bottomSheetOpen)}
                                 className="w-full py-2 bg-slate-100 hover:bg-slate-200 flex flex-col items-center justify-center cursor-pointer border-b border-slate-200"
                               >
                                 <div className="w-12 h-1 bg-slate-300 rounded-full mb-1"></div>
                                 <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">
                                   {bottomSheetOpen ? 'Tap to Collapse' : 'Tap for Job Details'}
                                 </span>
                               </div>

                               <div className="p-4 flex flex-col gap-3">
                                 
                                 {bottomSheetOpen ? (
                                   /* EXPANDED VIEW WITH DASHED TIMELINE & PHONE/NOFARE ACTIONS */
                                   <div className="space-y-3">
                                     <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                                       <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 font-black uppercase">
                                         3 PAX (Dale)
                                       </span>
                                       <span className="text-amber-600 font-black uppercase tracking-wider text-[10px]">
                                         ★ Cash Booking
                                       </span>
                                     </div>

                                     {/* Timeline visual */}
                                     <div className="space-y-3 relative">
                                       <div className="absolute left-3 top-2 bottom-2 w-0.5 border-l-2 border-dashed border-slate-300"></div>

                                       {/* Pickup marker */}
                                       <div className="flex gap-3 items-start relative z-10">
                                         <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                                           A
                                         </div>
                                         <div>
                                           <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest block">PICKUP</span>
                                           <p className="text-xs font-sans font-extrabold text-slate-800 leading-tight">
                                             {currentJob.pickup.name}
                                           </p>
                                         </div>
                                       </div>

                                       {/* Destination marker (allows tapping to search and change!) */}
                                       <div 
                                         onClick={() => {
                                           if (jobStatus === 'POB') {
                                             setDestinationSearchOpen(true);
                                           }
                                         }}
                                         className={`flex gap-3 items-start relative z-10 ${jobStatus === 'POB' ? 'bg-orange-50 hover:bg-orange-100/60 p-2 rounded-xl border border-dashed border-orange-200 cursor-pointer transition-colors' : ''}`}
                                       >
                                         <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                                           B
                                         </div>
                                         <div className="flex-1">
                                           <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                                             <span>DESTINATION</span>
                                             {jobStatus === 'POB' && <span className="text-[8px] text-orange-600 font-black underline">(CHANGE)</span>}
                                           </span>
                                           <p className="text-xs font-sans font-extrabold text-slate-800 leading-tight">
                                             {currentJob.destination.name}
                                           </p>
                                         </div>
                                       </div>
                                     </div>

                                     {/* Circular actions row */}
                                     <div className="grid grid-cols-3 gap-2 py-1 pt-2 border-t border-slate-100">
                                       <button 
                                         onClick={() => {
                                           try {
                                             const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                                             const osc = ctx.createOscillator();
                                             const gain = ctx.createGain();
                                             osc.frequency.setValueAtTime(600, ctx.currentTime);
                                             gain.gain.setValueAtTime(0.05, ctx.currentTime);
                                             gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                                             osc.connect(gain);
                                             gain.connect(ctx.destination);
                                             osc.start();
                                             osc.stop(ctx.currentTime + 0.2);
                                           } catch(e) {}
                                           alert("GPS telemetry synchronized. Distance remaining calculated securely.");
                                         }}
                                         className="py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-100/80 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer"
                                       >
                                         <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-sky-600 fill-none stroke-current" strokeWidth="2.5">
                                           <circle cx="12" cy="12" r="10" />
                                           <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                                         </svg>
                                         <span className="text-[9px] font-black">LOCATION</span>
                                       </button>

                                       <button 
                                         onClick={() => {
                                           if (confirm("Are you sure you want to declare a Passenger No Show? This will cancel the booking and plot you back to active queues.")) {
                                             triggerDispatcherMessage("Dispatch York: No-Show registered. Re-plotting available.");
                                             setEarnings((prev) => [
                                               ...prev,
                                               {
                                                 id: `noshow-${Date.now()}`,
                                                 date: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                                                 fareAmount: 5.00,
                                                 fareType: 'CASH',
                                                 pickup: currentJob.pickup.name,
                                                 destination: 'Passenger No-Show Wait Fee'
                                               }
                                             ]);
                                             setCurrentJob(null);
                                             setJobStatus('NONE');
                                             setDriverStatus('AVAILABLE');
                                           }
                                         }}
                                         className="py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-100/80 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer"
                                       >
                                         <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-red-600 fill-none stroke-current" strokeWidth="2.5">
                                           <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                           <line x1="15" y1="9" x2="9" y2="15" />
                                           <line x1="9" y1="9" x2="15" y2="15" />
                                         </svg>
                                         <span className="text-[9px] font-black">NO FARE</span>
                                       </button>

                                       <button 
                                         onClick={() => setActivePhoneCall("+44 7700 900077")}
                                         className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100/80 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer"
                                       >
                                         <PhoneCall className="h-4.5 w-4.5 text-emerald-600" />
                                         <span className="text-[9px] font-black">CALL PAX</span>
                                       </button>
                                     </div>

                                   </div>
                                 ) : (
                                   /* COLLAPSED VIEW STATUS LINE */
                                   <div className="flex justify-between items-center py-1">
                                     <div className="flex items-center gap-2">
                                       <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
                                       <span className="text-[11px] font-sans font-black text-slate-800 uppercase truncate max-w-[240px]">
                                         {currentJob.passengerName} • {currentJob.pickup.name}
                                       </span>
                                     </div>
                                     <span className="text-[9px] font-black text-orange-600 uppercase">
                                       {jobStatus}
                                     </span>
                                   </div>
                                 )}

                                 {/* Sliding horizontal tactile button always visible at bottom */}
                                 <div className="mt-1">
                                   <SliderButton 
                                     text={getSwipeText()} 
                                     onSwipeSuccess={handleSwipeSuccess} 
                                     color={jobStatus === 'ARRIVED' ? 'green' : jobStatus === 'STC' ? 'red' : 'orange'}
                                   />
                                 </div>
                               </div>
                             </div>

                           </div>
                         )}

                      </div>
                    )}

                    {activeSubView === 'SHEETS' && (
                      <EarningsPanel earnings={earnings} onLynkPay={() => {
                        // Success payment processing chime!
                        try {
                          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                          const osc = ctx.createOscillator();
                          const gain = ctx.createGain();
                          osc.frequency.setValueAtTime(880, ctx.currentTime);
                          gain.gain.setValueAtTime(0.1, ctx.currentTime);
                          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                          osc.connect(gain);
                          gain.connect(ctx.destination);
                          osc.start();
                          osc.stop(ctx.currentTime + 0.45);
                          alert("LynkPay Settlement Requested! Your shift balance has been securely queued for bank transfer.");
                        } catch(e) {}
                      }} />
                    )}

                    {activeSubView === 'DOCS' && (
                      <ProfilePanel profile={DEFAULT_PROFILE} />
                    )}

                    {activeSubView === 'MESSENGER' && (
                      <MessagePanel 
                        messages={messages} 
                        onSendMessage={handleSendMessage} 
                        onClearUnread={handleClearUnread} 
                        onBackToHome={() => setActiveSubView('HOME')}
                      />
                    )}

                  </div>

                </div>
              )}

            </div>

        {/* RIGHT COLUMN: DISPATCH COORDINATOR CONTROL CONSOLE */}
        <div className="lg:col-span-4 flex flex-col gap-5 h-[740px] overflow-y-auto pr-1">
          <div className="bg-[#121824] rounded-2xl p-5 border border-slate-800 shadow-xl">
            <h2 className="text-sm font-black font-sans tracking-widest text-emerald-400 uppercase flex items-center gap-2 mb-3">
              <Tv className="h-5 w-5" /> DISPATCH OPERATIONS CENTER
            </h2>
            <p className="text-xs text-slate-400 font-mono leading-relaxed mb-4">
              Act as the dispatch operator. Fire live situations onto the driver tablet to test compliance documents, tactile swipes, chat presets, and taxi routing.
            </p>

            <div className="space-y-4">
              
              {/* Dispatch trigger */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider mb-1.5">
                  1. Dispatch Booking Offer
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => triggerSimulatedBooking()}
                    disabled={jobStatus !== 'NONE' || !loggedIn || !driverOnline}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-black disabled:bg-slate-850 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                  >
                    <Play className="h-3.5 w-3.5 fill-black" /> DISPATCH NEXT
                  </button>
                  
                  <select
                    disabled={jobStatus !== 'NONE' || !loggedIn || !driverOnline}
                    onChange={(e) => {
                      const idx = parseInt(e.target.value);
                      triggerSimulatedBooking(idx);
                      e.target.value = ''; 
                    }}
                    className="bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer disabled:bg-slate-850 disabled:text-slate-600"
                  >
                    <option value="" disabled>SELECT RIDE...</option>
                    {PRESET_BOOKINGS.map((p, i) => (
                      <option key={i} value={i}>{p.passengerName.slice(0,14)} (£{p.fareAmount})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Warnings Trigger */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider mb-1.5">
                  2. Dispatch Operator Alert Text
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => triggerDispatcherMessage("Premier Dispatch: High congestion reported on Wigginton Rd. Delay registered.")}
                    disabled={!loggedIn}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono rounded text-slate-300 transition-colors disabled:opacity-50"
                  >
                    🚧 DELAY INFO
                  </button>
                  <button
                    onClick={() => triggerDispatcherMessage("CRITICAL SECURITY FLAG: Please verify passenger boarding token before starting taxi meter.")}
                    disabled={jobStatus === 'NONE' || !loggedIn}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono rounded text-slate-300 transition-colors disabled:opacity-50"
                  >
                    🚨 TOKEN CHECK
                  </button>
                </div>
              </div>

              {/* Reset Control */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setCurrentJob(null);
                    setJobStatus('NONE');
                    setDriverOnline(true);
                    setDriverStatus('AVAILABLE');
                    setEarnings([]);
                    setMessages([
                      {
                        id: 'm1',
                        sender: 'DISPATCH',
                        text: 'Shift memory initialized. Companion telemetry secure.',
                        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                        isRead: true,
                      }
                    ]);
                    setActiveSubView('HOME');
                    setJobsOnOfferOpen(false);
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono font-bold text-red-400 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> REBOOT & CLEAR SHIFT
                </button>
              </div>

            </div>
          </div>

          <div className="bg-[#121824]/50 rounded-2xl p-4 border border-slate-800 text-xs font-mono text-slate-400 leading-normal">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold mb-1.5">
              <HelpCircle className="h-4 w-4 text-emerald-400" /> COMPANION CHEAT SHEET
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>Open side-drawer using top-left <span className="text-orange-500 font-bold">☰ Menu</span> button.</li>
              <li>Login using default credential shift PIN: <span className="text-emerald-400">1234</span>.</li>
              <li>Toggle <span className="text-emerald-400">ONLINE</span> at screen bottom to pop up local jobs list, or trigger via right console.</li>
              <li>Swipe the horizontal drawer sliders to progress through ride phases.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* JOBS ON OFFER POPUP MODAL (As shown in video at 00:24) */}
      <AnimatePresence>
        {jobsOnOfferOpen && (
          <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-[100] p-4 select-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white text-slate-800 rounded-3xl p-5 w-full max-w-sm border border-slate-200 shadow-2xl font-sans"
            >
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2.5">
                Jobs on Offer
              </h3>
              
              <div className="my-4">
                <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-orange-50 rounded-xl border border-slate-200/65 cursor-pointer transition-all">
                  <input 
                    type="radio" 
                    defaultChecked 
                    name="offerSelect" 
                    className="w-4 h-4 text-orange-500 border-slate-300 focus:ring-orange-400" 
                  />
                  <div className="font-mono text-xs">
                    <span className="font-bold block text-slate-800">York Hospital</span>
                    <span className="text-slate-400 block text-[10px] mt-0.5">Wigginton Rd, York YO31 8HE</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  onClick={() => setJobsOnOfferOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setJobsOnOfferOpen(false);
                    // trigger York Hospital booking sequence
                    triggerSimulatedBooking(0);
                  }}
                  className="px-5 py-2.5 bg-[#4caf50] hover:bg-[#43a047] text-white font-mono font-extrabold text-xs rounded-xl shadow-md transition-all"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW: CHANGE DESTINATION MODAL (As shown in video at 01:07) */}
      <AnimatePresence>
        {destinationSearchOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4 select-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white text-slate-800 rounded-3xl p-5 w-full max-w-sm border border-slate-200 shadow-2xl font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  Change Destination
                </h3>
                <button 
                  onClick={() => setDestinationSearchOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-full"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* Search box display */}
              <div className="relative mb-4">
                <input 
                  type="text" 
                  placeholder="Search store, street or postcode..." 
                  defaultValue="Argos"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                />
                <span className="absolute left-3 top-3 text-slate-400">🔍</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                <div 
                  onClick={() => {
                    // Update current job destination and price
                    setCurrentJob((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        fareAmount: 4.60,
                        destination: { name: "ARGOS (GEORGE HUDSON ST, YORK)", lat: 53.9575, lng: -1.0872 }
                      };
                    });
                    setRunningFare(4.60);
                    // play notification sound
                    try {
                      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                      const osc = ctx.createOscillator();
                      const gain = ctx.createGain();
                      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
                      gain.gain.setValueAtTime(0.08, ctx.currentTime);
                      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                      osc.connect(gain);
                      gain.connect(ctx.destination);
                      osc.start();
                      osc.stop(ctx.currentTime + 0.35);
                    } catch(e) {}

                    setDestinationSearchOpen(false);
                    // Trigger the Modified Toast sequence
                    setModifiedToast({
                      message: "Job Modified",
                      sub: "Price: £4.60 (Fixed)"
                    });
                    // Auto-dismiss toast in 5 seconds
                    setTimeout(() => {
                      setModifiedToast(null);
                    }, 5000);
                  }}
                  className="p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl cursor-pointer transition-all flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-xs">
                    🛍️
                  </div>
                  <div className="font-mono text-[11px]">
                    <span className="font-extrabold block text-slate-800">ARGOS YORK CENTER</span>
                    <span className="text-slate-500 block text-[9px] mt-0.5">George Hudson St, York YO1 6WR</span>
                  </div>
                </div>

                <div className="p-3 hover:bg-slate-50 border border-slate-100 rounded-xl cursor-pointer transition-all flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs">
                    🚆
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    <span className="font-bold block text-slate-500">York Railway Station</span>
                    <span className="block text-[9px] mt-0.5">Station Rd, York YO24 1AY</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW: NAVIGATION APPS SELECTION MODAL */}
      <AnimatePresence>
        {navMenuOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4 select-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white text-slate-800 rounded-3xl p-5 w-full max-w-sm border border-slate-200 shadow-2xl font-sans text-center"
            >
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-4">
                Select Navigation App
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => {
                    setNavMenuOpen(false);
                    alert("Plotting routing en route with Google Maps Live API");
                  }}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex flex-col items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="text-2xl">🗺️</span>
                  <span className="text-[10px] font-black uppercase text-slate-700">Google Maps</span>
                </button>

                <button
                  onClick={() => {
                    setNavMenuOpen(false);
                    alert("Plotting route with Waze Live Traffic API");
                  }}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex flex-col items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="text-2xl">🚙</span>
                  <span className="text-[10px] font-black uppercase text-slate-700">Waze Navigation</span>
                </button>
              </div>

              <button
                onClick={() => setNavMenuOpen(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-mono text-[10px] font-bold uppercase text-slate-600 cursor-pointer"
              >
                Close Options
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW: PASSENGER VoIP VOICE CALLING SIMULATOR OVERLAY */}
      <AnimatePresence>
        {activePhoneCall && (
          <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[120] p-4 select-none text-white font-sans">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm flex flex-col items-center text-center p-6"
            >
              {/* Pulsing VoIP waves around passenger initials */}
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping scale-150"></div>
                <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse scale-125"></div>
                <div className="w-24 h-24 rounded-full bg-emerald-600 flex items-center justify-center text-4xl font-sans font-black shadow-2xl relative z-10 border-4 border-emerald-500">
                  {currentJob ? currentJob.passengerName.slice(0, 1) : 'P'}
                </div>
              </div>

              <h3 className="text-xl font-extrabold tracking-wide mb-1">
                {currentJob ? currentJob.passengerName : 'Passenger Dale'}
              </h3>
              <p className="text-xs text-emerald-400 font-mono tracking-widest uppercase mb-6 animate-pulse">
                Active VoIP Call Connected
              </p>

              {/* Call timing details */}
              <div className="bg-slate-900/60 border border-slate-800 px-5 py-2.5 rounded-2xl mb-10 text-xs font-mono text-slate-300">
                <span>Duration: 00:14s</span>
                <span className="mx-2 text-slate-600">|</span>
                <span>Bitrate: 48kbps</span>
              </div>

              {/* In-Call controls */}
              <div className="grid grid-cols-3 gap-6 mb-10 text-xs text-slate-400 font-bold w-full max-w-xs">
                <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                  <div className="w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center">
                    🎙️
                  </div>
                  <span>Mute</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                  <div className="w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center">
                    🔊
                  </div>
                  <span>Speaker</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                  <div className="w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center">
                    🔢
                  </div>
                  <span>Keypad</span>
                </div>
              </div>

              {/* End call button (using rotated PhoneCall icon) */}
              <button
                onClick={() => {
                  // play end call chime
                  try {
                    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.frequency.setValueAtTime(350, ctx.currentTime);
                    gain.gain.setValueAtTime(0.08, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.4);
                  } catch(e) {}
                  setActivePhoneCall(null);
                }}
                className="w-16 h-16 rounded-full bg-[#ff3b30] hover:bg-[#d32f2f] flex items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer"
              >
                <PhoneCall className="h-7 w-7 text-white rotate-[135deg]" />
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="w-full text-center mt-6 py-4 border-t border-slate-900 text-[10px] font-mono text-slate-600">
        AUTOCAB DRIVER COMPANION SIMULATOR • YORK PRIVATE HIRE LOGISTICS CORP • DATA CHANNEL SECURE
      </footer>

    </div>
  );
}
