import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Navigation,
  MapPin,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Maximize2,
  Sun,
  Moon,
  Play,
  Pause,
  Flame,
  Calendar,
  Map as MapIcon,
} from 'lucide-react';
import { Booking, JobStatus, BidJob, AuctionJob } from '../types';
import * as L from 'leaflet';

interface Point {
  x?: number;
  y?: number;
  name: string;
  lat: number;
  lng: number;
}

interface MapSimulatorProps {
  currentJob: Booking | null;
  jobStatus: JobStatus;
  onArriveAtPickup?: () => void;
  onDestinationReached?: () => void;
  landmarks?: Record<string, Point>;
  roads?: string[][];
  onTeleport?: (landmarkName: string) => void;
  preBookings?: BidJob[];
  auctions?: AuctionJob[];
  onSelectPreBooking?: (job: BidJob) => void;
  onSelectAuction?: (job: AuctionJob) => void;
  driverOnline?: boolean;
  isVisible?: boolean;
}

export const DEFAULT_MAP_LANDMARKS: Record<string, Point> = {
  'YORK HOSPITAL': { name: 'YORK HOSPITAL', lat: 53.9682, lng: -1.0772 },
  'YORK CITY CENTRE': { name: 'YORK CITY CENTRE', lat: 53.9579, lng: -1.0929 },
  'YORK TRAIN STATION': { name: 'YORK TRAIN STATION', lat: 53.9583, lng: -1.0932 },
  'YORK CLIFTON MOOR': { name: 'YORK CLIFTON MOOR', lat: 53.9904, lng: -1.0998 },
  'LEEDS T/STATION': { name: 'LEEDS T/STATION', lat: 53.7972, lng: -1.5458 },
  'LEEDS BRADFORD AIRPORT': { name: 'LEEDS BRADFORD AIRPORT', lat: 53.8659, lng: -1.6606 },
  'THIRSK': { name: 'THIRSK', lat: 54.2307, lng: -1.3431 },
  'KIRBY MOORSIDE': { name: 'KIRBY MOORSIDE', lat: 54.2691, lng: -0.9298 },
  'PICKERING': { name: 'PICKERING', lat: 54.2442, lng: -0.7761 },
  'HARROGATE': { name: 'HARROGATE', lat: 53.9911, lng: -1.5398 },
  'MALTON (YORK)': { name: 'MALTON (YORK)', lat: 54.1357, lng: -0.7963 },
  'HAXBY (YORK)': { name: 'HAXBY (YORK)', lat: 53.9984, lng: -1.0722 },
  'NATIONAL NORTH': { name: 'NATIONAL NORTH', lat: 54.1000, lng: -1.1000 },
  'ARGOS': { name: 'ARGOS', lat: 53.9575, lng: -1.0667 },
  'SCARBOROUGH': { name: 'SCARBOROUGH', lat: 54.2816, lng: -0.4008 },
};

export function resolveLocationCoords(
  name: string,
  fallback?: { lat: number; lng: number }
): { lat: number; lng: number } {
  const upper = name.trim().toUpperCase();
  if (DEFAULT_MAP_LANDMARKS[upper]) {
    return { lat: DEFAULT_MAP_LANDMARKS[upper].lat, lng: DEFAULT_MAP_LANDMARKS[upper].lng };
  }
  const partialMatch = Object.entries(DEFAULT_MAP_LANDMARKS).find(
    ([key]) => upper.includes(key) || key.includes(upper)
  );
  if (partialMatch) {
    return { lat: partialMatch[1].lat, lng: partialMatch[1].lng };
  }
  if (fallback && fallback.lat && fallback.lng) {
    return fallback;
  }
  return { lat: 53.9579, lng: -1.0929 };
}

const DEFAULT_ROADS = [
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

type TileTheme = 'voyager' | 'dark' | 'osm';

const TILE_CONFIGS: Record<TileTheme, { url: string; subdomains: string; attr: string; bg: string; label: string }> = {
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attr: '&copy; OpenStreetMap contributors &copy; CARTO',
    bg: '#e5e7eb',
    label: 'Streets',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attr: '&copy; OpenStreetMap contributors &copy; CARTO',
    bg: '#090d16',
    label: 'Night',
  },
  osm: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    attr: '&copy; OpenStreetMap contributors',
    bg: '#e5e7eb',
    label: 'OSM',
  },
};

function haversineMeters(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function computeBearing(from: [number, number], to: [number, number]): number {
  const dy = to[0] - from[0];
  const dx = (to[1] - from[1]) * Math.cos((from[0] * Math.PI) / 180);
  return Math.round(((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360);
}

async function fetchStreetRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  signal?: AbortSignal
): Promise<[number, number][]> {
  // If start and end are virtually identical, return direct pair
  if (Math.abs(start.lat - end.lat) < 0.0002 && Math.abs(start.lng - end.lng) < 0.0002) {
    return [
      [start.lat, start.lng],
      [end.lat, end.lng],
    ];
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    if (signal) {
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const coords = data?.routes?.[0]?.geometry?.coordinates;
      if (Array.isArray(coords) && coords.length >= 2) {
        return coords.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
      }
    }
  } catch {
    // Graceful fallback to direct route below
  }

  return [
    [start.lat, start.lng],
    [end.lat, end.lng],
  ];
}

export default function MapSimulator({
  currentJob,
  jobStatus,
  onArriveAtPickup,
  onDestinationReached,
  landmarks,
  roads,
  onTeleport,
  preBookings = [],
  auctions = [],
  onSelectPreBooking,
  onSelectAuction,
  isVisible = true,
}: MapSimulatorProps) {
  const activeLandmarks = (landmarks || DEFAULT_MAP_LANDMARKS) as Record<string, Point>;
  const activeRoads = roads || DEFAULT_ROADS;

  const firstLandmark = Object.values(activeLandmarks)[0] || {
    lat: 53.9682,
    lng: -1.0772,
    name: 'YORK HOSPITAL',
  };

  // Car position & navigation HUD state
  const [carPos, setCarPos] = useState<{ lat: number; lng: number }>({
    lat: firstLandmark.lat,
    lng: firstLandmark.lng,
  });
  const carPosRef = useRef<{ lat: number; lng: number }>({
    lat: firstLandmark.lat,
    lng: firstLandmark.lng,
  });

  const [heading, setHeading] = useState(280);
  const [speed, setSpeed] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [navigationInstruction, setNavigationInstruction] = useState(
    'GPS Active • Standing by for Pre-Bookings or Auction Bids'
  );
  const [tileTheme, setTileTheme] = useState<TileTheme>('voyager');
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState<number>(1);
  const [isSimPaused, setIsSimPaused] = useState<boolean>(false);

  // Refs read inside RAF loop without restarting the effect
  const simSpeedRef = useRef(simSpeedMultiplier);
  simSpeedRef.current = simSpeedMultiplier;
  const isPausedRef = useRef(isSimPaused);
  isPausedRef.current = isSimPaused;
  const onArriveRef = useRef(onArriveAtPickup);
  onArriveRef.current = onArriveAtPickup;
  const onDestRef = useRef(onDestinationReached);
  onDestRef.current = onDestinationReached;

  // Selected Pin preview on map
  const [selectedMapItem, setSelectedMapItem] = useState<{
    type: 'PREBOOKING' | 'AUCTION';
    data: BidJob | AuctionJob;
  } | null>(null);

  // Leaflet Refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const roadsGroupRef = useRef<L.LayerGroup | null>(null);
  const landmarksGroupRef = useRef<L.LayerGroup | null>(null);
  const marketPinsGroupRef = useRef<L.LayerGroup | null>(null);
  const activeRoutePolylineRef = useRef<L.Polyline | null>(null);
  const previewRoutePolylineRef = useRef<L.Polyline | null>(null);
  const carMarkerRef = useRef<L.Marker | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const activeBoundsRef = useRef<L.LatLngBounds | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const safeInvalidate = useCallback(() => {
    const map = mapInstanceRef.current;
    const el = mapContainerRef.current;
    if (map && el && el.clientWidth > 0 && el.clientHeight > 0) {
      map.invalidateSize({ animate: false });
    }
  }, []);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [carPosRef.current.lat, carPosRef.current.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    });

    const cfg = TILE_CONFIGS[tileTheme];
    const tiles = L.tileLayer(cfg.url, {
      maxZoom: 19,
      subdomains: cfg.subdomains,
      attribution: cfg.attr,
    }).addTo(map);
    tileLayerRef.current = tiles;

    roadsGroupRef.current = L.layerGroup().addTo(map);
    landmarksGroupRef.current = L.layerGroup().addTo(map);
    marketPinsGroupRef.current = L.layerGroup().addTo(map);

    const carHtml = `
      <div class="relative w-9 h-9 flex items-center justify-center">
        <div class="absolute inset-0 bg-emerald-500/35 rounded-full animate-ping"></div>
        <div class="car-heading-arrow w-6 h-6 bg-emerald-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center" style="transform: rotate(${heading}deg)">
          <svg class="w-3.5 h-3.5 text-white fill-white" viewBox="0 0 24 24">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>
      </div>
    `;
    const carIcon = L.divIcon({
      html: carHtml,
      className: 'clear-div-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
    carMarkerRef.current = L.marker([carPosRef.current.lat, carPosRef.current.lng], {
      icon: carIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    mapInstanceRef.current = map;

    const t1 = setTimeout(safeInvalidate, 50);
    const t2 = setTimeout(safeInvalidate, 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Re-invalidate when Map tab becomes visible or container resizes
  useEffect(() => {
    if (isVisible) {
      requestAnimationFrame(() => {
        safeInvalidate();
        if (activeBoundsRef.current && mapInstanceRef.current) {
          mapInstanceRef.current.fitBounds(activeBoundsRef.current, { padding: [60, 60], maxZoom: 15 });
        }
      });
      const t = setTimeout(safeInvalidate, 150);
      return () => clearTimeout(t);
    }
  }, [isVisible, safeInvalidate]);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => safeInvalidate());
    observer.observe(container);
    return () => observer.disconnect();
  }, [safeInvalidate]);

  // Switch Tile Layer cleanly on theme change
  const initialMountThemeRef = useRef(true);
  useEffect(() => {
    if (initialMountThemeRef.current) {
      initialMountThemeRef.current = false;
      return;
    }
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = TILE_CONFIGS[tileTheme];
    const newTiles = L.tileLayer(cfg.url, {
      maxZoom: 19,
      subdomains: cfg.subdomains,
      attribution: cfg.attr,
    }).addTo(map);

    tileLayerRef.current = newTiles;
  }, [tileTheme]);

  // Smooth Car Marker Position & Rotation Updates (without recreating DOM node)
  useEffect(() => {
    carPosRef.current = carPos;
    if (carMarkerRef.current) {
      carMarkerRef.current.setLatLng([carPos.lat, carPos.lng]);
    }
  }, [carPos]);

  useEffect(() => {
    if (carMarkerRef.current) {
      const el = carMarkerRef.current.getElement();
      const arrow = el?.querySelector('.car-heading-arrow') as HTMLElement | null;
      if (arrow) {
        arrow.style.transform = `rotate(${heading}deg)`;
      }
    }
  }, [heading]);

  // Draw Network Landmarks & Corridor Hints
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !roadsGroupRef.current || !landmarksGroupRef.current) return;

    roadsGroupRef.current.clearLayers();
    landmarksGroupRef.current.clearLayers();

    activeRoads.forEach(([from, to]) => {
      const p1 = activeLandmarks[from];
      const p2 = activeLandmarks[to];
      if (p1 && p2) {
        L.polyline(
          [
            [p1.lat, p1.lng],
            [p2.lat, p2.lng],
          ],
          {
            color: tileTheme === 'dark' ? '#334155' : '#64748b',
            weight: 2,
            opacity: tileTheme === 'dark' ? 0.5 : 0.25,
            dashArray: '4, 6',
          }
        ).addTo(roadsGroupRef.current!);
      }
    });

    Object.entries(activeLandmarks).forEach(([name, point]) => {
      const circle = L.circleMarker([point.lat, point.lng], {
        radius: 5,
        fillColor: '#475569',
        color: '#ffffff',
        weight: 1.5,
        fillOpacity: 0.9,
      });

      circle.bindTooltip(name, {
        permanent: false,
        direction: 'top',
        className: 'custom-leaflet-tooltip',
      });

      circle.on('click', () => {
        if (jobStatus === 'NONE') {
          const next = { lat: point.lat, lng: point.lng };
          carPosRef.current = next;
          setCarPos(next);
          map.panTo([point.lat, point.lng], { animate: true });
          if (onTeleport) onTeleport(name);
        }
      });

      circle.addTo(landmarksGroupRef.current!);
    });
  }, [activeLandmarks, activeRoads, tileTheme, jobStatus, onTeleport]);

  // Plot Marketplace Pre-Bookings & Auctions with non-overlapping radial offsets
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !marketPinsGroupRef.current) return;

    marketPinsGroupRef.current.clearLayers();
    if (jobStatus !== 'NONE') return;

    const coordCounts = new Map<string, number>();
    const offsetForOverlap = (lat: number, lng: number): [number, number] => {
      const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
      const count = coordCounts.get(key) || 0;
      coordCounts.set(key, count + 1);
      if (count === 0) return [lat, lng];
      const angle = (count * 72 * Math.PI) / 180;
      const radius = 0.0028 + Math.floor(count / 5) * 0.002;
      return [lat + Math.sin(angle) * radius, lng + Math.cos(angle) * radius * 1.4];
    };

    preBookings
      .filter((b) => b.status === 'PENDING')
      .forEach((booking) => {
        const base = resolveLocationCoords(booking.pickupName, booking.pickupCoords);
        const [lat, lng] = offsetForOverlap(base.lat, base.lng);

        const pinHtml = `
          <div class="cursor-pointer group flex flex-col items-center transform transition-transform hover:scale-110">
            <div class="bg-amber-500 hover:bg-amber-400 text-black px-2 py-0.5 rounded-full font-mono text-[10px] font-black shadow-lg flex items-center gap-1 border border-black/40 whitespace-nowrap">
              <span>📅</span>
              <span>£${booking.fareAmount.toFixed(2)}</span>
            </div>
            <div class="w-1.5 h-1.5 bg-amber-500 rounded-full mt-0.5 border border-black/40"></div>
          </div>
        `;

        const icon = L.divIcon({
          html: pinHtml,
          className: 'clear-div-icon',
          iconSize: [70, 28],
          iconAnchor: [35, 24],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(marketPinsGroupRef.current!);
        marker.on('click', () => {
          setSelectedMapItem({ type: 'PREBOOKING', data: booking });
        });
      });

    auctions
      .filter((a) => a.status === 'OPEN' || a.status === 'BID_PLACED')
      .forEach((auction) => {
        const base = resolveLocationCoords(auction.pickupName, auction.pickupCoords);
        const [lat, lng] = offsetForOverlap(base.lat, base.lng);

        const pinHtml = `
          <div class="cursor-pointer group flex flex-col items-center transform transition-transform hover:scale-110">
            <div class="bg-purple-600 hover:bg-purple-500 text-white px-2 py-0.5 rounded-full font-mono text-[10px] font-black shadow-lg flex items-center gap-1 border border-white/40 whitespace-nowrap">
              <span>⚡</span>
              <span>£${(auction.myBid || auction.baseFare).toFixed(2)}</span>
            </div>
            <div class="w-1.5 h-1.5 bg-purple-500 rounded-full mt-0.5 border border-white/40"></div>
          </div>
        `;

        const icon = L.divIcon({
          html: pinHtml,
          className: 'clear-div-icon',
          iconSize: [72, 28],
          iconAnchor: [36, 24],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(marketPinsGroupRef.current!);
        marker.on('click', () => {
          setSelectedMapItem({ type: 'AUCTION', data: auction });
        });
      });
  }, [preBookings, auctions, jobStatus]);

  // Active Route & Street-Level Driving Simulation (runs ONLY when jobStatus or currentJob.id changes!)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const abortController = new AbortController();

    // Clear previous route layers
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (activeRoutePolylineRef.current) {
      map.removeLayer(activeRoutePolylineRef.current);
      activeRoutePolylineRef.current = null;
    }
    if (previewRoutePolylineRef.current) {
      map.removeLayer(previewRoutePolylineRef.current);
      previewRoutePolylineRef.current = null;
    }
    if (pickupMarkerRef.current) {
      map.removeLayer(pickupMarkerRef.current);
      pickupMarkerRef.current = null;
    }
    if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
      destMarkerRef.current = null;
    }
    activeBoundsRef.current = null;

    if (!currentJob || jobStatus === 'NONE' || jobStatus === 'OFFERED') {
      setAnimationProgress(0);
      setSpeed(0);
      setNavigationInstruction('GPS Active • Standing by for Pre-Bookings or Auction Bids');
      return;
    }

    const pickupCoords = resolveLocationCoords(currentJob.pickup.name, currentJob.pickup);
    const destCoords = resolveLocationCoords(currentJob.destination.name, currentJob.destination);

    // Place Pickup (A) Marker
    const pickupIcon = L.divIcon({
      html: `
        <div class="relative w-8 h-8 flex items-center justify-center">
          ${jobStatus === 'ACCEPTED' ? '<div class="absolute inset-0 bg-amber-500/40 rounded-full animate-ping"></div>' : ''}
          <div class="w-6 h-6 bg-amber-500 border-2 border-white rounded-full shadow-xl flex items-center justify-center font-black text-xs text-black">A</div>
        </div>
      `,
      className: 'clear-div-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    pickupMarkerRef.current = L.marker([pickupCoords.lat, pickupCoords.lng], {
      icon: pickupIcon,
      zIndexOffset: 500,
    }).addTo(map);

    // Place Destination (B) Marker
    const destIcon = L.divIcon({
      html: `
        <div class="relative w-8 h-8 flex items-center justify-center">
          ${jobStatus === 'POB' ? '<div class="absolute inset-0 bg-emerald-500/40 rounded-full animate-ping"></div>' : ''}
          <div class="w-6 h-6 bg-emerald-500 border-2 border-white rounded-full shadow-xl flex items-center justify-center font-black text-xs text-white">B</div>
        </div>
      `,
      className: 'clear-div-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    destMarkerRef.current = L.marker([destCoords.lat, destCoords.lng], {
      icon: destIcon,
      zIndexOffset: 500,
    }).addTo(map);

    // Static parked states: ARRIVED (at A) or STC (at B)
    if (jobStatus === 'ARRIVED') {
      carPosRef.current = pickupCoords;
      setCarPos(pickupCoords);
      setSpeed(0);
      setAnimationProgress(1);
      setNavigationInstruction(`Arrived at ${currentJob.pickup.name}. Tap POB when passenger boards.`);

      fetchStreetRoute(pickupCoords, destCoords, abortController.signal).then((pts) => {
        if (abortController.signal.aborted || !mapInstanceRef.current) return;
        previewRoutePolylineRef.current = L.polyline(pts, {
          color: '#10b981',
          weight: 4,
          opacity: 0.45,
          dashArray: '6, 8',
        }).addTo(mapInstanceRef.current);

        const bounds = L.latLngBounds(pts);
        activeBoundsRef.current = bounds;
        safeInvalidate();
        if (mapContainerRef.current && mapContainerRef.current.clientWidth > 0) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
        }
      });

      return () => abortController.abort();
    }

    if (jobStatus === 'STC') {
      carPosRef.current = destCoords;
      setCarPos(destCoords);
      setSpeed(0);
      setAnimationProgress(1);
      setNavigationInstruction(`Arrived at ${currentJob.destination.name}. Settle meter to complete.`);

      fetchStreetRoute(pickupCoords, destCoords, abortController.signal).then((pts) => {
        if (abortController.signal.aborted || !mapInstanceRef.current) return;
        activeRoutePolylineRef.current = L.polyline(pts, {
          color: '#10b981',
          weight: 5,
          opacity: 0.85,
        }).addTo(mapInstanceRef.current);
      });

      return () => abortController.abort();
    }

    // Active driving states: ACCEPTED (Car -> Pickup) or POB (Pickup -> Destination)
    const isToPickup = jobStatus === 'ACCEPTED';
    const startPoint = isToPickup ? { ...carPosRef.current } : pickupCoords;
    const endPoint = isToPickup ? pickupCoords : destCoords;
    const routeColor = isToPickup ? '#f59e0b' : '#10b981';

    setNavigationInstruction(
      isToPickup
        ? `Calculating street route to pickup: ${currentJob.pickup.name}...`
        : `Calculating street route to ${currentJob.destination.name}...`
    );

    const runRoute = async () => {
      const polylinePts = await fetchStreetRoute(startPoint, endPoint, abortController.signal);
      if (abortController.signal.aborted || !mapInstanceRef.current) return;

      const mapNow = mapInstanceRef.current;

      // Draw active street route
      activeRoutePolylineRef.current = L.polyline(polylinePts, {
        color: routeColor,
        weight: 6,
        opacity: 0.9,
        className: 'animated-leaflet-route',
      }).addTo(mapNow);

      // If heading to pickup, also show faint dashed leg from A -> B for context
      if (isToPickup) {
        const previewPts = await fetchStreetRoute(pickupCoords, destCoords, abortController.signal);
        if (!abortController.signal.aborted && mapInstanceRef.current) {
          previewRoutePolylineRef.current = L.polyline(previewPts, {
            color: '#10b981',
            weight: 3,
            opacity: 0.35,
            dashArray: '6, 8',
          }).addTo(mapInstanceRef.current);
        }
      }

      if (abortController.signal.aborted) return;

      const bounds = L.latLngBounds(polylinePts);
      activeBoundsRef.current = bounds;
      safeInvalidate();
      if (mapContainerRef.current && mapContainerRef.current.clientWidth > 0) {
        mapNow.fitBounds(bounds, { padding: [65, 65], maxZoom: 15 });
      }

      // Precompute cumulative distances along polyline for smooth uniform-speed traversal
      const cumDist: number[] = [0];
      let totalDistMeters = 0;
      for (let i = 1; i < polylinePts.length; i++) {
        totalDistMeters += haversineMeters(polylinePts[i - 1], polylinePts[i]);
        cumDist.push(totalDistMeters);
      }

      // If car is already right at the pickup (< 25 meters), arrive immediately after brief pause
      if (totalDistMeters < 25) {
        setAnimationProgress(1);
        setSpeed(0);
        carPosRef.current = endPoint;
        setCarPos(endPoint);
        if (isToPickup && onArriveRef.current) {
          setTimeout(() => !abortController.signal.aborted && onArriveRef.current?.(), 400);
        } else if (!isToPickup && onDestRef.current) {
          setTimeout(() => !abortController.signal.aborted && onDestRef.current?.(), 400);
        }
        return;
      }

      const baseDurationMs = isToPickup ? 10000 : 18000;
      let progress = 0;
      let lastTimestamp: number | null = null;
      let finished = false;

      const step = (timestamp: number) => {
        if (abortController.signal.aborted || finished) return;

        if (lastTimestamp === null) {
          lastTimestamp = timestamp;
        }
        const dt = Math.min(timestamp - lastTimestamp, 100);
        lastTimestamp = timestamp;

        if (!isPausedRef.current) {
          progress = Math.min(progress + (dt * simSpeedRef.current) / baseDurationMs, 1);
          setAnimationProgress(progress);

          const targetDist = progress * totalDistMeters;
          // Find segment containing targetDist
          let segIdx = 0;
          while (segIdx < cumDist.length - 2 && cumDist[segIdx + 1] < targetDist) {
            segIdx++;
          }
          const segStartDist = cumDist[segIdx];
          const segEndDist = cumDist[segIdx + 1];
          const segLen = Math.max(segEndDist - segStartDist, 0.0001);
          const segFrac = Math.max(0, Math.min(1, (targetDist - segStartDist) / segLen));

          const pA = polylinePts[segIdx];
          const pB = polylinePts[segIdx + 1];
          const lat = pA[0] + (pB[0] - pA[0]) * segFrac;
          const lng = pA[1] + (pB[1] - pA[1]) * segFrac;

          const nextPos = { lat, lng };
          carPosRef.current = nextPos;
          setCarPos(nextPos);
          setHeading(computeBearing(pA, pB));

          if (progress < 1) {
            const mph = Math.max(
              18,
              Math.min(48, Math.floor(32 + Math.sin(progress * Math.PI * 5) * 10))
            );
            setSpeed(mph);

            const percent = Math.floor(progress * 100);
            if (isToPickup) {
              if (percent < 30) {
                setNavigationInstruction(`Proceeding to pickup at ${currentJob.pickup.name}. Follow highlighted route.`);
              } else if (percent < 75) {
                setNavigationInstruction(`En route to ${currentJob.pickup.name} • ${(currentJob.distance * (1 - progress)).toFixed(1)} mi remaining.`);
              } else {
                setNavigationInstruction(`Approaching pickup point: ${currentJob.pickup.name}.`);
              }
            } else {
              if (percent < 30) {
                setNavigationInstruction(`Passenger On Board. Navigating to ${currentJob.destination.name}.`);
              } else if (percent < 75) {
                setNavigationInstruction(`Continuing to ${currentJob.destination.name} • ${(currentJob.distance * (1 - progress)).toFixed(1)} mi left.`);
              } else {
                setNavigationInstruction(`Arriving at ${currentJob.destination.name} shortly.`);
              }
            }
          } else {
            finished = true;
            setSpeed(0);
            setAnimationProgress(1);
            if (isToPickup && onArriveRef.current) {
              setNavigationInstruction(`Arrived at ${currentJob.pickup.name}!`);
              onArriveRef.current();
            } else if (!isToPickup && onDestRef.current) {
              setNavigationInstruction(`Arrived at ${currentJob.destination.name}.`);
              onDestRef.current();
            }
            return;
          }
        } else {
          setSpeed(0);
        }

        animationFrameRef.current = requestAnimationFrame(step);
      };

      animationFrameRef.current = requestAnimationFrame(step);
    };

    runRoute();

    return () => {
      abortController.abort();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [currentJob?.id, jobStatus]);

  // Controls
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([carPosRef.current.lat, carPosRef.current.lng], 14, {
        animate: true,
      });
    }
  };

  const handleFitRoute = () => {
    if (mapInstanceRef.current && activeBoundsRef.current) {
      mapInstanceRef.current.fitBounds(activeBoundsRef.current, { padding: [60, 60], animate: true });
    } else {
      handleRecenter();
    }
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleInstantArrive = () => {
    if (!currentJob) return;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    const target =
      jobStatus === 'ACCEPTED'
        ? resolveLocationCoords(currentJob.pickup.name, currentJob.pickup)
        : resolveLocationCoords(currentJob.destination.name, currentJob.destination);

    carPosRef.current = target;
    setCarPos(target);
    setAnimationProgress(1);
    setSpeed(0);

    if (jobStatus === 'ACCEPTED' && onArriveRef.current) {
      onArriveRef.current();
    } else if (jobStatus === 'POB' && onDestRef.current) {
      onDestRef.current();
    }
  };

  const cycleTheme = () => {
    setTileTheme((prev) => (prev === 'voyager' ? 'dark' : prev === 'dark' ? 'osm' : 'voyager'));
  };

  const isRouteActive = jobStatus === 'ACCEPTED' || jobStatus === 'POB';

  return (
    <div className="relative flex flex-col w-full h-full bg-[#0a0e17] text-white overflow-hidden select-none">
      {/* Top Banner: Turn-by-Turn GPS Navigation HUD */}
      <div
        className={`px-4 py-2.5 flex items-center justify-between border-b transition-colors shrink-0 z-20 ${
          jobStatus === 'NONE'
            ? 'bg-[#101726] border-slate-800'
            : jobStatus === 'ACCEPTED' || jobStatus === 'ARRIVED'
            ? 'bg-amber-950/90 border-amber-500/40'
            : 'bg-emerald-950/90 border-emerald-500/40'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              jobStatus === 'NONE'
                ? 'bg-slate-800 text-slate-400'
                : jobStatus === 'ACCEPTED' || jobStatus === 'ARRIVED'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
            }`}
          >
            <Navigation className="h-4 w-4 transform rotate-45" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-widest uppercase font-mono text-slate-400">
                {jobStatus === 'NONE'
                  ? 'DISPATCH GPS STANDBY'
                  : jobStatus === 'ACCEPTED'
                  ? 'EN ROUTE TO PICKUP (A)'
                  : jobStatus === 'ARRIVED'
                  ? 'AT PICKUP (A)'
                  : jobStatus === 'POB'
                  ? 'PASSENGER ON BOARD -> (B)'
                  : 'ARRIVED AT DESTINATION (B)'}
              </span>
              {currentJob && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {currentJob.distance.toFixed(1)} MI
                </span>
              )}
            </div>
            <p className="text-xs font-black text-slate-100 truncate font-sans tracking-wide mt-0.5">
              {navigationInstruction}
            </p>
          </div>
        </div>

        {/* Speedometer & Heading */}
        <div className="flex items-center gap-4 shrink-0 font-mono pl-3 border-l border-slate-800">
          <div className="text-right">
            <div className="text-lg font-black text-emerald-400 leading-none">
              {speed} <span className="text-[9px] text-slate-400 font-bold">MPH</span>
            </div>
            <div className="text-[8px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>HDG {heading}°</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div
        className="relative flex-1 w-full h-full min-h-[280px] overflow-hidden"
        id="leaflet-map-host"
        style={{ background: TILE_CONFIGS[tileTheme].bg }}
      >
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Map Legend / Hint Pill (Top Left when idle) */}
        {jobStatus === 'NONE' && (
          <div className="absolute top-3 left-3 z-[400] bg-[#111726]/90 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md shadow-lg flex items-center gap-3 text-[9px] font-mono pointer-events-none">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <span>📅</span> Pre-Booking
            </span>
            <span className="flex items-center gap-1 text-purple-400 font-bold">
              <span>⚡</span> Auction
            </span>
            <span className="hidden sm:inline text-slate-400">Tap any pin or node</span>
          </div>
        )}

        {/* Floating Right Map Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-[400]">
          <div className="bg-[#111726]/95 border border-slate-800 rounded-xl shadow-xl flex flex-col overflow-hidden backdrop-blur-md">
            <button
              onClick={handleZoomIn}
              className="p-2.5 hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <div className="h-px bg-slate-800" />
            <button
              onClick={handleZoomOut}
              className="p-2.5 hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleRecenter}
            className="p-2.5 bg-[#111726]/95 hover:bg-slate-800 border border-slate-800 rounded-xl text-emerald-400 shadow-xl backdrop-blur-md transition-colors cursor-pointer"
            title="Center Vehicle"
          >
            <Crosshair className="h-4 w-4" />
          </button>

          {currentJob && jobStatus !== 'NONE' && (
            <button
              onClick={handleFitRoute}
              className="p-2.5 bg-[#111726]/95 hover:bg-slate-800 border border-slate-800 rounded-xl text-amber-400 shadow-xl backdrop-blur-md transition-colors cursor-pointer"
              title="Fit Full Route"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={cycleTheme}
            className="px-2 py-2 bg-[#111726]/95 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-200 shadow-xl backdrop-blur-md transition-colors cursor-pointer flex flex-col items-center gap-0.5"
            title={`Switch Map Style (Current: ${TILE_CONFIGS[tileTheme].label})`}
          >
            {tileTheme === 'dark' ? (
              <Moon className="h-3.5 w-3.5 text-indigo-400" />
            ) : tileTheme === 'voyager' ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <MapIcon className="h-3.5 w-3.5 text-emerald-400" />
            )}
            <span className="text-[7px] font-mono font-bold uppercase text-slate-400">
              {TILE_CONFIGS[tileTheme].label}
            </span>
          </button>
        </div>

        {/* Driving Simulation Controls (When Driving) */}
        {isRouteActive && (
          <div className="absolute bottom-4 right-4 bg-[#111726]/95 border border-slate-800 px-3 py-2 rounded-2xl shadow-2xl backdrop-blur-md z-[400] flex items-center gap-2 font-mono text-[10px]">
            <span className="text-slate-400 font-bold uppercase text-[9px]">SIM:</span>
            <button
              onClick={() => setIsSimPaused((p) => !p)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 cursor-pointer"
              title={isSimPaused ? 'Resume' : 'Pause'}
            >
              {isSimPaused ? <Play className="h-3 w-3 text-emerald-400" /> : <Pause className="h-3 w-3" />}
            </button>
            <button
              onClick={() => setSimSpeedMultiplier((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : 1))}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-emerald-400 font-black cursor-pointer"
              title="Toggle Speed"
            >
              {simSpeedMultiplier}x
            </button>
            <button
              onClick={handleInstantArrive}
              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg uppercase tracking-wider cursor-pointer"
            >
              Arrive Now
            </button>
          </div>
        )}

        {/* Active Trip Info HUD Pill (Bottom Left) */}
        {currentJob && jobStatus !== 'NONE' && (
          <div className="absolute bottom-4 left-4 bg-[#0d131f]/95 border border-slate-800 p-3.5 rounded-2xl shadow-2xl max-w-[260px] backdrop-blur-md z-[400]">
            <div className="flex items-start gap-2.5">
              <MapPin
                className={`h-4 w-4 mt-0.5 shrink-0 ${
                  jobStatus === 'ACCEPTED' || jobStatus === 'ARRIVED'
                    ? 'text-amber-500'
                    : 'text-emerald-400'
                }`}
              />
              <div className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono block">
                  {jobStatus === 'ACCEPTED' || jobStatus === 'ARRIVED'
                    ? 'PICKUP POINT (A)'
                    : 'DESTINATION (B)'}
                </span>
                <p className="text-xs font-extrabold text-white truncate max-w-[190px]">
                  {jobStatus === 'ACCEPTED' || jobStatus === 'ARRIVED'
                    ? currentJob.pickup.name
                    : currentJob.destination.name}
                </p>
                <div className="mt-1 flex items-center gap-2 font-mono text-[9px] text-slate-300">
                  <span>
                    REM:{' '}
                    <b className={jobStatus === 'ACCEPTED' ? 'text-amber-400' : 'text-emerald-400'}>
                      {(currentJob.distance * (1 - animationProgress)).toFixed(1)} mi
                    </b>
                  </span>
                  <span>•</span>
                  <span>
                    ETA:{' '}
                    <b>{Math.ceil(currentJob.estimatedDuration * (1 - animationProgress))} min</b>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Marker Popup Card */}
        {selectedMapItem && jobStatus === 'NONE' && (
          <div className="absolute bottom-4 left-4 right-4 max-w-md mx-auto bg-[#111726]/95 border border-slate-700/80 p-4 rounded-2xl shadow-2xl backdrop-blur-md z-[450]">
            <div className="flex items-start justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                {selectedMapItem.type === 'AUCTION' ? (
                  <span className="bg-purple-950/80 border border-purple-800 text-purple-400 px-2 py-0.5 rounded text-[9px] font-mono font-black flex items-center gap-1 uppercase">
                    <Flame className="h-3 w-3 text-purple-400" /> LIVE AUCTION
                  </span>
                ) : (
                  <span className="bg-amber-950/80 border border-amber-800 text-amber-400 px-2 py-0.5 rounded text-[9px] font-mono font-black flex items-center gap-1 uppercase">
                    <Calendar className="h-3 w-3 text-amber-400" /> PRE-BOOKING
                  </span>
                )}
                <span className="text-slate-400 font-mono text-[9px]">
                  ⏰ {selectedMapItem.data.pickupTime}
                </span>
              </div>
              <button
                onClick={() => setSelectedMapItem(null)}
                className="text-slate-400 hover:text-white p-1 text-xs cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-400 text-[10px] uppercase font-mono">From:</span>
                <span className="font-bold text-white truncate">{selectedMapItem.data.pickupName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-slate-400 text-[10px] uppercase font-mono">To:</span>
                <span className="font-bold text-white truncate">
                  {selectedMapItem.data.destinationName}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-slate-300">
                <span>Distance: {selectedMapItem.data.distance} mi</span>
                <span className="text-emerald-400 font-black text-sm">
                  Fare: £
                  {'baseFare' in selectedMapItem.data
                    ? selectedMapItem.data.baseFare.toFixed(2)
                    : selectedMapItem.data.fareAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (selectedMapItem.type === 'PREBOOKING' && onSelectPreBooking) {
                    onSelectPreBooking(selectedMapItem.data as BidJob);
                  } else if (selectedMapItem.type === 'AUCTION' && onSelectAuction) {
                    onSelectAuction(selectedMapItem.data as AuctionJob);
                  }
                  setSelectedMapItem(null);
                }}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase rounded-xl tracking-wider cursor-pointer font-mono"
              >
                {selectedMapItem.type === 'AUCTION'
                  ? '⚡ Place Auction Bid'
                  : '📅 View / Counter Bid'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .leaflet-container {
          width: 100% !important;
          height: 100% !important;
          font-family: inherit !important;
        }
        .custom-leaflet-tooltip {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(148, 163, 184, 0.3) !important;
          color: #f1f5f9 !important;
          font-family: monospace !important;
          font-size: 9px !important;
          font-weight: bold !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4) !important;
        }
        .clear-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .animated-leaflet-route {
          stroke-dasharray: 10, 8;
          animation: routeDashFlow 1.1s linear infinite;
        }
        @keyframes routeDashFlow {
          from {
            stroke-dashoffset: 36;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
