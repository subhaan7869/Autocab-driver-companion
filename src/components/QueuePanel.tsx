import React from 'react';
import { MapPin, Clock, Car, ChevronRight, ToggleLeft, ToggleRight, MessageSquare } from 'lucide-react';
import { Zone } from '../types';

interface QueuePanelProps {
  zones: Zone[];
  currentZone: string | null;
  onSelectZone: (zoneName: string) => void;
  driverOnline: boolean;
  onToggleOnline: () => void;
}

export default function QueuePanel({
  zones,
  currentZone,
  onSelectZone,
  driverOnline,
  onToggleOnline,
}: QueuePanelProps) {
  return (
    <div className="flex flex-col h-full bg-[#eceff1] text-slate-800 select-none font-mono" id="zone-queues-table">
      
      {/* Table Subheader columns matching video at 00:05 */}
      <div className="bg-[#cfd8dc] px-4 py-2 border-b border-slate-400 grid grid-cols-12 text-[10px] font-bold text-slate-700 uppercase tracking-wider shrink-0 shadow-sm">
        <div className="col-span-2 border-r border-slate-400/40 pr-2 flex items-center gap-1">
          <span>mi</span>
        </div>
        <div className="col-span-5 border-r border-slate-400/40 px-2 truncate">
          Zone Name
        </div>
        <div className="col-span-2 border-r border-slate-400/40 text-center flex items-center justify-center">
          <Clock className="h-3.5 w-3.5 text-slate-700" />
        </div>
        <div className="col-span-2 border-r border-slate-400/40 text-center flex items-center justify-center">
          <Car className="h-3.5 w-3.5 text-slate-700" />
        </div>
        <div className="col-span-1 text-center"></div>
      </div>

      {/* Rows scrollable area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-200/80 bg-white">
        {zones.map((zone) => {
          const isPlotted = currentZone === zone.name;
          const isYorkHospital = zone.id === '38';
          const hasBookings = isYorkHospital || zone.activeBookings > 0;

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone(zone.name)}
              className={`grid grid-cols-12 px-4 py-3 items-center text-xs font-bold transition-all cursor-pointer border-b border-slate-100 ${
                isPlotted
                  ? 'bg-orange-50 text-orange-950 font-extrabold border-l-4 border-l-orange-500 pl-3'
                  : 'hover:bg-slate-50 text-slate-800'
              }`}
            >
              {/* Zone ID / distance column */}
              <div className="col-span-2 text-slate-500 font-bold">
                {zone.id}
              </div>

              {/* Zone Name column */}
              <div className="col-span-5 text-[11px] uppercase tracking-wide truncate font-black pr-1">
                {zone.name}
              </div>

              {/* Bookings column with yellow highlight for York Hospital matching video */}
              <div className="col-span-2 text-center flex items-center justify-center">
                {hasBookings ? (
                  <span className="w-6 h-5 flex items-center justify-center bg-[#fbc02d] text-slate-950 rounded text-[11px] font-black shadow-sm border border-yellow-600 animate-pulse">
                    1
                  </span>
                ) : (
                  <span className="text-slate-300 font-medium">0</span>
                )}
              </div>

              {/* Cabs column */}
              <div className="col-span-2 text-center text-slate-600 font-bold">
                {zone.carsInZone}
              </div>

              {/* Status bullet */}
              <div className="col-span-1 text-right flex items-center justify-end">
                {isPlotted ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.8)]"></span>
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Offline/Online bottom bar matching video at 00:05 and 00:23 */}
      <div 
        onClick={onToggleOnline}
        className={`px-5 py-3 flex items-center justify-between border-t transition-all duration-200 cursor-pointer shadow-[0_-2px_10px_rgba(0,0,0,0.05)] ${
          driverOnline 
            ? 'bg-[#2e7d32] border-emerald-900 text-white shadow-[inset_0_2px_6px_rgba(0,0,0,0.2)]' 
            : 'bg-[#cfd8dc] border-slate-300 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {driverOnline ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
              <span className="text-xs font-black tracking-widest uppercase">
                Position: 1 • {currentZone || 'YORK HOSPITAL'}
              </span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
              <span className="text-xs font-black tracking-widest uppercase text-slate-600">
                You are offline
              </span>
            </>
          )}
        </div>

        {/* Toggle switch handle */}
        <div>
          {driverOnline ? (
            <div className="flex items-center gap-1.5 text-[10px] font-black">
              <span className="text-white uppercase tracking-wider text-[9px]">ONLINE</span>
              <ToggleRight className="h-8 w-8 text-white stroke-[2.5]" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600">
              <span className="uppercase tracking-wider text-[9px]">OFFLINE</span>
              <ToggleLeft className="h-8 w-8 text-slate-500 stroke-[2.5]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
