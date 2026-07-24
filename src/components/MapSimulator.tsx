import React, { useEffect, useState, useRef } from 'react';
import { Navigation, Compass, MapPin } from 'lucide-react';
import { Booking, JobStatus } from '../types';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapSimulatorProps {
  currentJob: Booking | null;
  jobStatus: JobStatus;
  onArriveAtPickup?: () => void;
  onDestinationReached?: () => void;
  landmarks?: Record<string, Point>;
  roads?: string[][];
  onTeleport?: (landmarkName: string) => void;
  darkMode?: boolean;
}

interface Point {
  x: number;
  y: number;
  name: string;
  lat?: number;
  lng?: number;
}

// Default map coordinates for landmarks (York fallback)
export const MAP_LANDMARKS: Record<string, Point> = {
  'YORK HOSPITAL': { x: 400, y: 150, name: 'YORK HOSPITAL', lat: 53.9682, lng: -1.0772 },
  'YORK CITY CENTRE': { x: 420, y: 350, name: 'YORK CITY CENTRE', lat: 53.9579, lng: -1.0929 },
  'LEEDS T/STATION': { x: 180, y: 520, name: 'LEEDS T/STATION', lat: 53.7972, lng: -1.5458 },
  'THIRSK': { x: 250, y: 100, name: 'THIRSK', lat: 54.2307, lng: -1.3431 },
  'KIRBY MOORSIDE': { x: 500, y: 80, name: 'KIRBY MOORSIDE', lat: 54.2691, lng: -0.9298 },
  'PICKERING': { x: 620, y: 120, name: 'PICKERING', lat: 54.2442, lng: -0.7761 },
  'HARROGATE': { x: 150, y: 380, name: 'HARROGATE', lat: 53.9911, lng: -1.5398 },
  'MALTON (YORK)': { x: 680, y: 220, name: 'MALTON (YORK)', lat: 54.1357, lng: -0.7963 },
  'HAXBY (YORK)': { x: 500, y: 200, name: 'HAXBY (YORK)', lat: 53.9984, lng: -1.0722 },
  'NATIONAL NORTH': { x: 380, y: 50, name: 'NATIONAL NORTH', lat: 54.1000, lng: -1.1000 },
  'ARGOS': { x: 550, y: 400, name: 'ARGOS', lat: 53.9575, lng: -1.0667 },
};

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

export default function MapSimulator({
  currentJob,
  jobStatus,
  onArriveAtPickup,
  onDestinationReached,
  landmarks,
  roads,
  onTeleport,
  darkMode = true,
}: MapSimulatorProps) {
  const activeLandmarks = (landmarks || MAP_LANDMARKS) as Record<string, Point & { lat?: number; lng?: number }>;
  const activeRoads = roads || ROADS;

  const firstLandmarkName = Object.keys(activeLandmarks)[0] || 'YORK CITY CENTRE';
  const firstLandmark = activeLandmarks[firstLandmarkName] || { x: 420, y: 350, name: 'YORK CITY CENTRE', lat: 53.9579, lng: -1.0929 };

  const [carPos, setCarPos] = useState<{ lat: number; lng: number }>({
    lat: firstLandmark.lat || 53.9579,
    lng: firstLandmark.lng || -1.0929,
  });
  const [animationProgress, setAnimationProgress] = useState(0);
  const [navigationInstruction, setNavigationInstruction] = useState('GPS active. Waiting for booking.');
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(284);
  const animationRef = useRef<number | null>(null);

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const roadsGroupRef = useRef<L.LayerGroup | null>(null);
  const landmarkMarkersGroupRef = useRef<L.LayerGroup | null>(null);
  const activeRoutePolylineRef = useRef<L.Polyline | null>(null);
  const carMarkerRef = useRef<L.Marker | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Update Leaflet Tile Layer whenever dark mode state changes dynamically
  useEffect(() => {
    if (tileLayerRef.current) {
      const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      tileLayerRef.current.setUrl(tileUrl);
    }
  }, [darkMode]);

  // Update Leaflet Car Marker Icon dynamically whenever heading changes
  useEffect(() => {
    if (carMarkerRef.current) {
      const customCarHtml = `
        <div id="leaflet-car-marker" class="relative w-8 h-8 flex items-center justify-center">
          <div class="absolute inset-0 bg-[#10b981]/40 rounded-full animate-ping opacity-60"></div>
          <div class="w-5 h-5 bg-[#10b981] border-2 border-white rounded-full shadow-md flex items-center justify-center transform transition-all duration-300" style="transform: rotate(${heading}deg)">
            <svg class="w-2.5 h-2.5 text-white fill-white" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </div>
        </div>
      `;
      const carIcon = L.divIcon({
        html: customCarHtml,
        className: 'clear-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      carMarkerRef.current.setIcon(carIcon);
    }
  }, [heading]);

  // Initialize Map Instance once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    
    try {
      const map = L.map(mapContainerRef.current, {
        center: [carPos.lat, carPos.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: true,
      });

      // Premium CartoDB Dark/Light dynamic tiles matching theme settings
      const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      const tiles = L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap contributors &copy; CartoDB'
      }).addTo(map);

      tileLayerRef.current = tiles;

      mapInstanceRef.current = map;

      // Create container layer groups
      roadsGroupRef.current = L.layerGroup().addTo(map);
      landmarkMarkersGroupRef.current = L.layerGroup().addTo(map);

      // Initialise driver car icon
      const customCarHtml = `
        <div id="leaflet-car-marker" class="relative w-8 h-8 flex items-center justify-center">
          <div class="absolute inset-0 bg-[#10b981]/40 rounded-full animate-ping opacity-60"></div>
          <div class="w-5 h-5 bg-[#10b981] border-2 border-white rounded-full shadow-md flex items-center justify-center transform transition-all duration-300" style="transform: rotate(${heading}deg)">
            <svg class="w-2.5 h-2.5 text-white fill-white" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </div>
        </div>
      `;

      const carIcon = L.divIcon({
        html: customCarHtml,
        className: 'clear-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      carMarkerRef.current = L.marker([carPos.lat, carPos.lng], { icon: carIcon }).addTo(map);

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (e: any) {
      console.error(e.message || String(e));
    }
  }, []);

  // Force map invalidation on mount, resize, or tab layout switches to resolve the "black map" issue
  useEffect(() => {
    const map = mapInstanceRef.current;
    const container = mapContainerRef.current;
    if (!map || !container) return;

    // Trigger immediate invalidate and periodic invalidates in case parent animations are running
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    const t3 = setTimeout(() => map.invalidateSize(), 800);
    const t4 = setTimeout(() => map.invalidateSize(), 2000);

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      observer.disconnect();
    };
  }, [jobStatus, currentJob]);

  // Update center when landmarks change (active city node changes)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const firstPoint = Object.values(activeLandmarks)[0];
    if (firstPoint && firstPoint.lat && firstPoint.lng) {
      mapInstanceRef.current.setView([firstPoint.lat, firstPoint.lng], 12);
      setCarPos({ lat: firstPoint.lat, lng: firstPoint.lng });
    }
  }, [landmarks]);

  // Update landmarks and road layers dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Clear previous layers
    if (landmarkMarkersGroupRef.current) {
      landmarkMarkersGroupRef.current.clearLayers();
    }
    if (roadsGroupRef.current) {
      roadsGroupRef.current.clearLayers();
    }

    // 2. Plot Roads (lines linking landmarks)
    activeRoads.forEach(([from, to]) => {
      const p1 = activeLandmarks[from];
      const p2 = activeLandmarks[to];
      if (p1 && p2 && p1.lat && p1.lng && p2.lat && p2.lng) {
        L.polyline([[p1.lat, p1.lng], [p2.lat, p2.lng]], {
          color: '#1e293b',
          weight: 4,
          opacity: 0.6,
        }).addTo(roadsGroupRef.current!);

        L.polyline([[p1.lat, p1.lng], [p2.lat, p2.lng]], {
          color: '#0f172a',
          weight: 2,
          opacity: 0.8,
        }).addTo(roadsGroupRef.current!);
      }
    });

    // 3. Plot Landmarks (circles and labels)
    Object.entries(activeLandmarks).forEach(([name, point]) => {
      if (!point.lat || !point.lng) return;

      const isPickup = currentJob && currentJob.pickup.name === name;
      const isDest = currentJob && currentJob.destination.name === name;

      const markerColor = isPickup ? '#f59e0b' : isDest ? '#10b981' : '#475569';
      const markerRadius = isPickup || isDest ? 8 : 4;

      const circle = L.circleMarker([point.lat, point.lng], {
        radius: markerRadius,
        fillColor: markerColor,
        color: '#0f172a',
        weight: 1.5,
        fillOpacity: 1,
      });

      // Bind interactive tooltips for landmark names
      circle.bindTooltip(name, {
        permanent: true,
        direction: 'top',
        className: 'custom-leaflet-tooltip',
        offset: [0, -4],
      });

      // Click to teleport functionality
      circle.on('click', () => {
        if (jobStatus === 'NONE' && onTeleport) {
          onTeleport(name);
        }
      });

      circle.addTo(landmarkMarkersGroupRef.current!);
    });
  }, [landmarks, activeRoads, currentJob, jobStatus, onTeleport]);

  // Sync car marker on lat/lng coordinate updates
  useEffect(() => {
    if (carMarkerRef.current) {
      carMarkerRef.current.setLatLng([carPos.lat, carPos.lng]);
    }
  }, [carPos]);

  // Handle route points calculation
  const getRoutePoints = (): { start: { lat: number; lng: number }; end: { lat: number; lng: number } } | null => {
    if (!currentJob) return null;

    const pickupLandmark = activeLandmarks[currentJob.pickup.name];
    const destLandmark = activeLandmarks[currentJob.destination.name];

    const pickupLat = pickupLandmark?.lat || currentJob.pickup.lat;
    const pickupLng = pickupLandmark?.lng || currentJob.pickup.lng;

    const destLat = destLandmark?.lat || currentJob.destination.lat;
    const destLng = destLandmark?.lng || currentJob.destination.lng;

    if (jobStatus === 'ACCEPTED') {
      const initialPoint = activeLandmarks[currentJob.destination.name] || firstLandmark;
      return {
        start: { lat: initialPoint.lat || 53.9579, lng: initialPoint.lng || -1.0929 },
        end: { lat: pickupLat, lng: pickupLng },
      };
    } else if (jobStatus === 'POB' || jobStatus === 'STC') {
      return {
        start: { lat: pickupLat, lng: pickupLng },
        end: { lat: destLat, lng: destLng },
      };
    }
    return null;
  };

  const route = getRoutePoints();

  // Sync heading from route points
  useEffect(() => {
    if (route) {
      const dy = route.end.lat - route.start.lat;
      const dx = route.end.lng - route.start.lng;
      const angle = Math.round(Math.atan2(dx, dy) * 180 / Math.PI);
      setHeading(angle);
    }
  }, [route]);

  // Run the route driving simulation loop
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous active routing and markers
    if (activeRoutePolylineRef.current) {
      map.removeLayer(activeRoutePolylineRef.current);
      activeRoutePolylineRef.current = null;
    }
    if (pickupMarkerRef.current) {
      map.removeLayer(pickupMarkerRef.current);
      pickupMarkerRef.current = null;
    }
    if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
      destMarkerRef.current = null;
    }

    if (!route) {
      setAnimationProgress(0);
      setSpeed(0);
      if (jobStatus === 'NONE' || jobStatus === 'OFFERED') {
        setNavigationInstruction('GPS Standby - Position Registered in Queue');
      }
      return;
    }

    // Centered map during simulation
    map.setView([route.start.lat, route.start.lng], 13);

    // Plot Route Polyline
    const routeColor = jobStatus === 'ACCEPTED' ? '#f59e0b' : '#10b981';
    activeRoutePolylineRef.current = L.polyline([[route.start.lat, route.start.lng], [route.end.lat, route.end.lng]], {
      color: routeColor,
      weight: 5,
      opacity: 0.8,
      className: 'animated-leaflet-route',
    }).addTo(map);

    // Plot Dynamic A & B Waypoint Markers
    if (jobStatus === 'ACCEPTED') {
      // Pickup Beacon HTML
      const pickupIcon = L.divIcon({
        html: `
          <div class="relative w-8 h-8 flex items-center justify-center">
            <div class="absolute inset-0 bg-[#f59e0b]/45 rounded-full animate-ping"></div>
            <div class="w-5 h-5 bg-[#f59e0b] border-2 border-white rounded-full shadow-md flex items-center justify-center font-black text-[10px] text-black">A</div>
          </div>
        `,
        className: 'clear-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      pickupMarkerRef.current = L.marker([route.end.lat, route.end.lng], { icon: pickupIcon }).addTo(map);
    } else {
      // Dest Beacon HTML
      const destIcon = L.divIcon({
        html: `
          <div class="relative w-8 h-8 flex items-center justify-center">
            <div class="absolute inset-0 bg-[#10b981]/45 rounded-full animate-ping"></div>
            <div class="w-5 h-5 bg-[#10b981] border-2 border-white rounded-full shadow-md flex items-center justify-center font-black text-[10px] text-white">B</div>
          </div>
        `,
        className: 'clear-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      destMarkerRef.current = L.marker([route.end.lat, route.end.lng], { icon: destIcon }).addTo(map);
    }

    let startTimestamp: number | null = null;
    const duration = jobStatus === 'ACCEPTED' ? 8000 : 15000; // Drive duration

    setSpeed(30 + Math.floor(Math.random() * 15));

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      setAnimationProgress(progress);

      // Interpolate GPS Position
      const lat = route.start.lat + (route.end.lat - route.start.lat) * progress;
      const lng = route.start.lng + (route.end.lng - route.start.lng) * progress;
      setCarPos({ lat, lng });

      if (progress < 1) {
        setSpeed(Math.max(15, Math.min(50, Math.floor(35 + Math.sin(progress * Math.PI * 4) * 15))));

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

  // Simulated traffic crawling drift when in NONE or OFFERED state
  useEffect(() => {
    if (jobStatus !== 'NONE' && jobStatus !== 'OFFERED') return;

    const wanderInterval = setInterval(() => {
      setSpeed(Math.random() > 0.7 ? Math.floor(Math.random() * 8) : 0);
    }, 4000);

    return () => clearInterval(wanderInterval);
  }, [jobStatus]);

  const getCompassDirection = (deg: number) => {
    const d = (deg + 360) % 360;
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(d / 45) % 8;
    return `${d}° ${directions[idx]}`;
  };

  return (
    <div className="relative flex flex-col w-full h-full bg-[#111827] text-white overflow-hidden rounded-lg border border-slate-800">
      {/* Top Banner: Turn-by-Turn GPS HUD */}
      <div className={`p-3 flex items-center gap-3 border-b transition-colors shrink-0 z-10 ${
        jobStatus === 'NONE' ? 'bg-[#1F2937] border-slate-700' :
        jobStatus === 'ACCEPTED' ? 'bg-amber-950/70 border-amber-500/30' :
        'bg-emerald-950/70 border-emerald-500/30'
      }`}>
        <div className={`p-2 rounded-full shrink-0 ${
          jobStatus === 'NONE' ? 'bg-slate-700 text-slate-400' :
          jobStatus === 'ACCEPTED' ? 'bg-amber-500 text-black animate-pulse' :
          'bg-emerald-500 text-black'
        }`}>
          <Navigation className="h-5 w-5 transform rotate-45" id="nav-arrow-icon" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase font-mono">
            {jobStatus === 'NONE' ? 'Active Dispatch GPS' : 
             jobStatus === 'ACCEPTED' ? 'Routing to Pickup' : 'Passenger on Board'}
          </p>
          <p className="text-xs font-extrabold text-slate-100 truncate font-sans leading-tight">
            {navigationInstruction}
          </p>
        </div>
        
        {/* Speedometer & GPS quality HUD */}
        <div className="text-right border-l border-slate-800 pl-3 font-mono shrink-0">
          <div className="text-base font-black text-emerald-400">{speed} <span className="text-[10px] text-slate-400">MPH</span></div>
          <div className="text-[9px] text-slate-400 flex items-center justify-end gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            3D FIX
          </div>
        </div>
      </div>

      {/* Main Map Container Area */}
      <div className="relative flex-1 bg-[#0f172a] overflow-hidden select-none min-h-[200px] w-full" id="leaflet-map-host">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {/* Dynamic map overlays - floating stats */}
        <div className="absolute top-3 left-3 bg-[#0f172a]/95 px-3 py-1.5 rounded-md border border-slate-800 text-[10px] font-mono flex items-center gap-1.5 shadow-lg backdrop-blur-sm z-[400] pointer-events-none">
          <Compass className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '15s' }} />
          <span>HDG: <span className="text-emerald-400 font-bold">{getCompassDirection(heading)}</span></span>
        </div>

        <div className="absolute bottom-3 right-3 bg-[#0f172a]/95 px-3 py-1.5 rounded-md border border-slate-800 text-[10px] font-mono flex items-center gap-2 shadow-lg backdrop-blur-sm z-[400] pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span>GPS ACCURACY: <span className="text-emerald-400 font-bold">&lt; 1.8m</span></span>
        </div>

        {/* Small Navigation HUD on the map */}
        {currentJob && jobStatus !== 'NONE' && (
          <div className="absolute bottom-3 left-3 bg-slate-900/90 p-3 rounded-lg border border-slate-800 shadow-xl max-w-[240px] backdrop-blur-sm z-[400] pointer-events-none">
            <div className="flex items-start gap-2">
              <MapPin className={`h-4 w-4 mt-0.5 shrink-0 ${jobStatus === 'ACCEPTED' ? 'text-amber-500' : 'text-emerald-400'}`} />
              <div className="min-w-0">
                <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider font-semibold leading-none">
                  {jobStatus === 'ACCEPTED' ? 'PICKUP EN ROUTE' : 'DESTINATION EN ROUTE'}
                </p>
                <p className="text-xs font-bold text-white truncate max-w-[170px] mt-0.5 leading-tight">
                  {jobStatus === 'ACCEPTED' ? currentJob.pickup.name : currentJob.destination.name}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[9px] font-mono text-slate-300">
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

      {/* Styled animation and overrides style block to handle Leaflet styling */}
      <style>{`
        .custom-leaflet-tooltip {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(148, 163, 184, 0.25) !important;
          color: #cbd5e1 !important;
          font-family: monospace !important;
          font-size: 8px !important;
          font-weight: bold !important;
          padding: 2px 5px !important;
          border-radius: 4px !important;
          box-shadow: none !important;
          white-space: nowrap !important;
        }
        .custom-leaflet-tooltip::before {
          border-top-color: rgba(15, 23, 42, 0.95) !important;
        }
        .clear-div-icon {
          background: none !important;
          border: none !important;
          padding: 0 !important;
        }
        /* Pulsing route polyline animation */
        .animated-leaflet-route {
          stroke-dasharray: 8, 6;
          animation: leafletDashFlow 1.2s linear infinite;
        }
        @keyframes leafletDashFlow {
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
