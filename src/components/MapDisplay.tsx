import React, { useEffect, useState, useRef } from 'react';
import { Navigation, Compass, MapPin, Eye, Info } from 'lucide-react';
import { Booking, JobStatus } from '../types';

interface MapDisplayProps {
  currentJob: Booking | null;
  jobStatus: JobStatus;
  onArriveAtPickup?: () => void;
  onDestinationReached?: () => void;
}

interface Point {
  x: number;
  y: number;
  name: string;
}

// Map coordinates for landmarks
export const MAP_LANDMARKS: Record<string, Point> = {
  'YORK HOSPITAL': { x: 400, y: 150, name: 'YORK HOSPITAL' },
  'YORK CITY CENTRE': { x: 420, y: 350, name: 'YORK CITY CENTRE' },
  'LEEDS T/STATION': { x: 180, y: 520, name: 'LEEDS T/STATION' },
  'THIRSK': { x: 250, y: 100, name: 'THIRSK' },
  'KIRBY MOORSIDE': { x: 500, y: 80, name: 'KIRBY MOORSIDE' },
  'PICKERING': { x: 620, y: 120, name: 'PICKERING' },
  'HARROGATE': { x: 150, y: 380, name: 'HARROGATE' },
  'MALTON (YORK)': { x: 680, y: 220, name: 'MALTON (YORK)' },
  'HAXBY (YORK)': { x: 500, y: 200, name: 'HAXBY (YORK)' },
  'NATIONAL NORTH': { x: 380, y: 50, name: 'NATIONAL NORTH' },
  'ARGOS': { x: 550, y: 400, name: 'ARGOS' },
};

// Map roads (connections between landmarks for drawing visual paths)
const ROADS = [
  ['THIRSK', 'NATIONAL NORTH'],
  ['NATIONAL NORTH', 'YORK HOSPITAL'],
  ['YORK HOSPITAL', 'YORK CITY CENTRE'],
  ['YORK CITY CENTRE', 'LEEDS T/STATION'],
  ['YORK CITY CENTRE', 'ARGOS'],
  ['YORK HOSPITAL', 'HAXBY (YORK)'],
  ['HAXBY (YORK)', 'PICKERING'],
  ['PICKERING', 'KIRBY MOORSIDE'],
  ['KIRBY MOORSIDE', 'MALTON (YORK)'],
  ['MALTON (YORK)', 'ARGOS'],
  ['HARROGATE', 'LEEDS T/STATION'],
  ['HARROGATE', 'YORK CITY CENTRE'],
];

export default function MapDisplay({
  currentJob,
  jobStatus,
  onArriveAtPickup,
  onDestinationReached,
}: MapDisplayProps) {
  const [carPos, setCarPos] = useState<Point>({ x: 420, y: 350, name: 'YORK CITY CENTRE' });
  const [animationProgress, setAnimationProgress] = useState(0);
  const [navigationInstruction, setNavigationInstruction] = useState('GPS active. Waiting for booking.');
  const [speed, setSpeed] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Determine source and destination points based on jobStatus
  const getRoutePoints = (): { start: Point; end: Point } | null => {
    if (!currentJob) return null;

    const pickupLandmark = MAP_LANDMARKS[currentJob.pickup.name] || { x: 400, y: 150, name: currentJob.pickup.name };
    const destLandmark = MAP_LANDMARKS[currentJob.destination.name] || { x: 550, y: 400, name: currentJob.destination.name };

    if (jobStatus === 'ACCEPTED') {
      // Heading to pickup.
      const initialPoint = MAP_LANDMARKS[currentJob.destination.name === 'YORK CITY CENTRE' ? 'YORK HOSPITAL' : 'YORK CITY CENTRE'];
      return { start: initialPoint, end: pickupLandmark };
    } else if (jobStatus === 'POB' || jobStatus === 'STC') {
      // Passenger on board, heading to destination
      return { start: pickupLandmark, end: destLandmark };
    }
    return null;
  };

  const route = getRoutePoints();

  useEffect(() => {
    if (!route) {
      setAnimationProgress(0);
      setSpeed(0);
      if (jobStatus === 'NONE' || jobStatus === 'OFFERED') {
        setNavigationInstruction('GPS Standby - Position Registered in Queue');
      }
      return;
    }

    let startTimestamp: number | null = null;
    const duration = jobStatus === 'ACCEPTED' ? 8000 : 15000; // time to drive (8s to pickup, 15s to destination)

    setSpeed(30 + Math.floor(Math.random() * 15));

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      setAnimationProgress(progress);

      // Interpolate car position
      const x = route.start.x + (route.end.x - route.start.x) * progress;
      const y = route.start.y + (route.end.y - route.start.y) * progress;
      setCarPos({ x, y, name: 'On Route' });

      // Dynamic instructions & speed
      if (progress < 1) {
        setSpeed(Math.max(15, Math.min(50, Math.floor(35 + Math.sin(progress * Math.PI * 4) * 15))));
        
        // Navigation notes
        const percent = Math.floor(progress * 100);
        if (jobStatus === 'ACCEPTED') {
          if (percent < 30) {
            setNavigationInstruction(`Proceed to pickup: ${currentJob?.pickup.name}. Turn right in 100 yards.`);
          } else if (percent < 70) {
            setNavigationInstruction(`Follow Ring Road toward ${currentJob?.pickup.name}. Traffic light ahead.`);
          } else {
            setNavigationInstruction(`Arriving at pickup point: ${currentJob?.pickup.name} shortly.`);
          }
        } else {
          if (percent < 25) {
            setNavigationInstruction(`Passenger On Board. Route to ${currentJob?.destination.name} started.`);
          } else if (percent < 50) {
            setNavigationInstruction(`Keep left at junction, merge onto High St. 1.2 miles remaining.`);
          } else if (percent < 80) {
            setNavigationInstruction(`Continue straight. Expect delays near city core. 0.5 miles remaining.`);
          } else {
            setNavigationInstruction(`Arriving at ${currentJob?.destination.name} in 200 yards.`);
          }
        }

        animationRef.current = requestAnimationFrame(step);
      } else {
        // Animation finished
        setSpeed(0);
        setAnimationProgress(1);
        if (jobStatus === 'ACCEPTED' && onArriveAtPickup) {
          setNavigationInstruction(`Arrived at ${currentJob?.pickup.name}. Awaiting passenger.`);
          onArriveAtPickup();
        } else if ((jobStatus === 'POB' || jobStatus === 'STC') && onDestinationReached) {
          setNavigationInstruction(`Arrived at ${currentJob?.destination.name}. Please clear the meter.`);
          onDestinationReached();
        }
      }
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [jobStatus, currentJob]);

  // Handle minor drift or wander in available state
  useEffect(() => {
    if (jobStatus !== 'NONE' && jobStatus !== 'OFFERED') return;

    // Small periodic wander animation to simulate sitting in traffic or crawling
    const wanderInterval = setInterval(() => {
      setSpeed(Math.random() > 0.7 ? Math.floor(Math.random() * 8) : 0);
    }, 4000);

    return () => clearInterval(wanderInterval);
  }, [jobStatus]);

  return (
    <div className="relative flex flex-col h-full bg-[#111827] text-white overflow-hidden rounded-lg border border-slate-800">
      {/* Top Banner: Turn-by-Turn GPS HUD */}
      <div className={`p-3 flex items-center gap-3 border-b transition-colors ${
        jobStatus === 'NONE' ? 'bg-[#1F2937] border-slate-700' :
        jobStatus === 'ACCEPTED' ? 'bg-amber-950/70 border-amber-500/30' :
        'bg-emerald-950/70 border-emerald-500/30'
      }`}>
        <div className={`p-2 rounded-full ${
          jobStatus === 'NONE' ? 'bg-slate-700 text-slate-400' :
          jobStatus === 'ACCEPTED' ? 'bg-amber-500 text-black animate-pulse' :
          'bg-emerald-500 text-black'
        }`}>
          <Navigation className="h-5 w-5 transform rotate-45" id="nav-arrow-icon" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 font-medium tracking-wider uppercase font-mono">
            {jobStatus === 'NONE' ? 'Active Dispatch GPS' : 
             jobStatus === 'ACCEPTED' ? 'Routing to Pickup' : 'Passenger on Board'}
          </p>
          <p className="text-sm font-bold text-slate-100 truncate font-sans">
            {navigationInstruction}
          </p>
        </div>
        
        {/* Speedometer & GPS quality HUD */}
        <div className="text-right border-l border-slate-800 pl-4 font-mono">
          <div className="text-lg font-bold text-emerald-400">{speed} <span className="text-xs text-slate-400">MPH</span></div>
          <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            3D FIX
          </div>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 bg-[#0f172a] overflow-hidden select-none">
        {/* Simple grid lines background to resemble military/tactical dispatch maps */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <svg className="w-full h-full min-h-[220px]" viewBox="0 0 800 650" id="driver-map-svg">
          {/* Define Gradients & Markers */}
          <defs>
            <radialGradient id="beacon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="pickup-beacon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Draw Roads (Background Connections) */}
          {ROADS.map(([from, to], i) => {
            const p1 = MAP_LANDMARKS[from];
            const p2 = MAP_LANDMARKS[to];
            if (!p1 || !p2) return null;
            return (
              <line
                key={`road-${i}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#1e293b"
                strokeWidth="4"
                strokeLinecap="round"
              />
            );
          })}

          {/* Draw Main Highways (Double line styling) */}
          {ROADS.map(([from, to], i) => {
            const p1 = MAP_LANDMARKS[from];
            const p2 = MAP_LANDMARKS[to];
            if (!p1 || !p2) return null;
            return (
              <line
                key={`road-inner-${i}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#0f172a"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}

          {/* Draw active routing path if heading to pickup or destination */}
          {route && (
            <>
              {/* Pulsing route underline */}
              <line
                x1={route.start.x}
                y1={route.start.y}
                x2={route.end.x}
                y2={route.end.y}
                stroke={jobStatus === 'ACCEPTED' ? '#f59e0b' : '#10b981'}
                strokeWidth="6"
                strokeOpacity="0.3"
                strokeLinecap="round"
              />
              {/* Dynamic route path dash line */}
              <line
                x1={route.start.x}
                y1={route.start.y}
                x2={route.end.x}
                y2={route.end.y}
                stroke={jobStatus === 'ACCEPTED' ? '#f59e0b' : '#10b981'}
                strokeWidth="3"
                strokeDasharray="8, 6"
                className="animated-route-dash"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Landmarks pins */}
          {Object.entries(MAP_LANDMARKS).map(([name, point]) => {
            const isPickup = currentJob && currentJob.pickup.name === name;
            const isDest = currentJob && currentJob.destination.name === name;
            
            return (
              <g key={`landmark-${name}`} transform={`translate(${point.x}, ${point.y})`}>
                {/* Ping rings for pickup/destinations */}
                {isPickup && (
                  <circle r="25" fill="url(#pickup-beacon)" className="animate-ping" style={{ animationDuration: '3s' }} />
                )}
                {isDest && (
                  <circle r="30" fill="url(#beacon)" className="animate-ping" style={{ animationDuration: '3s' }} />
                )}

                {/* Point anchor dot */}
                <circle
                  r={isPickup || isDest ? "7" : "4"}
                  fill={isPickup ? "#f59e0b" : isDest ? "#10b981" : "#475569"}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />

                {/* Styled labels */}
                <text
                  y="-12"
                  textAnchor="middle"
                  className={`text-[10px] font-bold font-mono tracking-wider fill-slate-300 pointer-events-none drop-shadow-md`}
                  style={{
                    fill: isPickup ? '#f59e0b' : isDest ? '#10b981' : '#cbd5e1',
                    fontSize: isPickup || isDest ? '11px' : '9px',
                  }}
                >
                  {name}
                </text>
              </g>
            );
          })}

          {/* Active Job Marker overlay (Car Icon or visual beacon) */}
          {currentJob && jobStatus !== 'NONE' && (
            <>
              {/* Pickup location indicator */}
              <g transform={`translate(${MAP_LANDMARKS[currentJob.pickup.name]?.x || 300}, ${MAP_LANDMARKS[currentJob.pickup.name]?.y || 300})`}>
                <circle r="12" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="1" />
                <text y="4" textAnchor="middle" className="fill-amber-500 font-bold text-[9px] font-sans">A</text>
              </g>
              {/* Destination location indicator */}
              <g transform={`translate(${MAP_LANDMARKS[currentJob.destination.name]?.x || 500}, ${MAP_LANDMARKS[currentJob.destination.name]?.y || 500})`}>
                <circle r="12" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="1" />
                <text y="4" textAnchor="middle" className="fill-emerald-400 font-bold text-[9px] font-sans">B</text>
              </g>
            </>
          )}

          {/* The Driver's Taxi Cab Car */}
          <g transform={`translate(${carPos.x}, ${carPos.y})`}>
            {/* Halo pulse */}
            <circle r="18" fill="rgba(16, 185, 129, 0.15)" className="animate-pulse" />
            
            {/* Base shadow */}
            <ellipse cx="0" cy="4" rx="10" ry="5" fill="black" fillOpacity="0.4" />
            
            {/* Cab Shape */}
            <rect x="-8" y="-5" width="16" height="10" rx="3" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            
            {/* Windshield */}
            <path d="M -5 -2 L -3 -4 L 3 -4 L 5 -2 Z" fill="#1e293b" />
            
            {/* Yellow TAXI sign on top */}
            <rect x="-3" y="-7" width="6" height="3" fill="#f59e0b" rx="1" />
            <circle cx="0" cy="-5.5" r="1" fill="#000" />
            
            {/* Animated Beacon Circle when driving */}
            {speed > 0 && (
              <circle r="10" stroke="#10b981" strokeWidth="1" fill="none" className="animate-ping" style={{ animationDuration: '1.5s' }} />
            )}
          </g>
        </svg>

        {/* Dynamic map overlays - floating stats */}
        <div className="absolute top-3 left-3 bg-[#0f172a]/95 px-3 py-1.5 rounded-md border border-slate-800 text-[11px] font-mono flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
          <Compass className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '15s' }} />
          <span>HDG: <span className="text-emerald-400 font-bold">284° W</span></span>
        </div>

        <div className="absolute bottom-3 right-3 bg-[#0f172a]/95 px-3 py-1.5 rounded-md border border-slate-800 text-[11px] font-mono flex items-center gap-2 shadow-lg backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span>GPS ACCURACY: <span className="text-emerald-400 font-bold">&lt; 1.8m</span></span>
        </div>

        {/* Small Navigation HUD on the map */}
        {currentJob && jobStatus !== 'NONE' && (
          <div className="absolute bottom-3 left-3 bg-slate-900/90 p-3 rounded-lg border border-slate-800 shadow-xl max-w-xs backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <MapPin className={`h-4 w-4 mt-0.5 ${jobStatus === 'ACCEPTED' ? 'text-amber-500' : 'text-emerald-400'}`} />
              <div>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">
                  {jobStatus === 'ACCEPTED' ? 'PICKUP EN ROUTE' : 'DESTINATION EN ROUTE'}
                </p>
                <p className="text-xs font-bold text-white truncate max-w-[160px]">
                  {jobStatus === 'ACCEPTED' ? currentJob.pickup.name : currentJob.destination.name}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-slate-300">
                  <span>DIS: <b className={jobStatus === 'ACCEPTED' ? 'text-amber-500' : 'text-emerald-400'}>
                    {(currentJob.distance * (1 - animationProgress)).toFixed(1)} mi
                  </b></span>
                  <span>•</span>
                  <span>ETA: <b>
                    {Math.ceil(currentJob.estimatedDuration * (1 - animationProgress))} min
                  </b></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Styled animation style block to handle route line flow */}
      <style>{`
        .animated-route-dash {
          stroke-dasharray: 8, 6;
          animation: routeDashFlow 1.2s linear infinite;
        }
        @keyframes routeDashFlow {
          from {
            stroke-dashoffset: 28;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
