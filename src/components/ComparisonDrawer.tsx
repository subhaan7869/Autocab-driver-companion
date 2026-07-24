import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ShieldCheck, Cpu, Info, Zap, Smartphone, ArrowRight, HelpCircle } from 'lucide-react';

interface ComparisonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComparisonDrawer({ isOpen, onClose }: ComparisonDrawerProps) {
  const features = [
    {
      title: "Zone Queue & Plotting Mechanics",
      realApp: "Automated GPS plotting with geo-fencing. Drivers enter queues when they cross physical zone borders. Strict FIFO sequence enforced with rejection penalties.",
      simulator: "Fully Simulated. Shows live zone sizes, active bookings, and supports manual zone plotting as well as fully automated Live GPS plot detection.",
      status: "FULLY SIMULATED",
      statusColor: "text-emerald-500 bg-emerald-500/10"
    },
    {
      title: "Real-time Taximeter & Tariffs",
      realApp: "Calibrated hardware taximeters or GPS meters with complex tariffs: day, night, Sunday/Holiday multipliers, luggage fee additions, and automated wait-rate charges.",
      simulator: "Dynamic Virtual Taximeter. Simulates a standard £4.50 base charge with continuous real-time distance accretion (£1.85/mi) plus automated wait-rate accumulation.",
      status: "FULLY SIMULATED",
      statusColor: "text-emerald-500 bg-emerald-500/10"
    },
    {
      title: "Multi-City GPS & Geofencing",
      realApp: "Bound to a single regional dispatch jurisdiction (e.g. Leeds City Council PHV rules). Relies on high-frequency server-side location synchronization.",
      simulator: "Interactive GPS Engine. Simulates 5 major UK cities (York, Manchester, Leeds, London, Birmingham) with real-time browser Geolocation tracking and nearest-zone auto-plotting.",
      status: "DYNAMIC MATCHING",
      statusColor: "text-orange-500 bg-orange-500/10"
    },
    {
      title: "Fleet Telemetry & Voice Channels",
      realApp: "Uses analog/digital trunked UHF radio channels or modern digital VoIP push-to-talk (PTT) directly integrated with emergency panic triggers.",
      simulator: "Tactile Voice-Call request queuing. Replicates companion-terminal UI by placing driver requests into dispatch logs with simulated automatic acknowledgements.",
      status: "SIMULATED",
      statusColor: "text-blue-500 bg-blue-500/10"
    },
    {
      title: "Regulatory Compliance Audit",
      realApp: "Requires real-time API integrations with local municipal licensing bodies to block drivers whose Taxi Badges or vehicle MOTs have lapsed.",
      simulator: "Interactive Wallet. Showcases a 100% compliant local digital wallet validating vehicle registration plates, driver photo badge, and active insurance timelines.",
      status: "SIMULATED",
      statusColor: "text-blue-500 bg-blue-500/10"
    },
    {
      title: "Bidding & Job Pre-Allocation",
      realApp: "Allows bidding on future shift blocks or advanced pre-bookings. Automatically pre-allocates jobs to drivers heading near appropriate pickup points.",
      simulator: "Interactive Pre-Booking Console. Features complete driver bid requests, bid securement logs, manual advanced booking creation, and future earnings integration.",
      status: "SIMULATED",
      statusColor: "text-blue-500 bg-blue-500/10"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Back Dimmer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950 z-[120]"
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 right-0 w-full max-w-lg bg-[#0c1017] text-slate-100 border-l border-slate-800 shadow-2xl z-[130] flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#0e1420]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-orange-500" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white leading-tight">
                    Autocab Feature Audit
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    COMPANION TERMINAL VS COMMERCIAL DISPATCH
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List scrollable container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Top advice note */}
              <div className="p-3.5 bg-gradient-to-r from-orange-500/10 to-transparent border-l-4 border-l-orange-500 rounded-r-xl text-xs text-slate-300 leading-relaxed font-sans">
                <span className="font-extrabold text-orange-400 block mb-1">💡 CO-PILOT ANALYSIS</span>
                This simulator is designed to duplicate the exact ergonomics, color layouts, chime sequences, and visual queues of commercial in-cab MDTs (Mobile Data Terminals) like Autocab Phantom. Below is an audit of how features stack up to commercial equivalents.
              </div>

              {/* Grid of features */}
              <div className="space-y-3">
                {features.map((f, i) => (
                  <div key={i} className="p-4 bg-[#111723] rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all">
                    <div className="flex justify-between items-start mb-2.5">
                      <h4 className="text-xs font-black text-white uppercase tracking-wide">
                        {f.title}
                      </h4>
                      <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded tracking-wider ${f.statusColor}`}>
                        {f.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px] leading-relaxed">
                      <div className="flex gap-2 items-start bg-slate-900/40 p-2 rounded-lg border border-slate-950/30">
                        <span className="text-[9px] font-mono font-bold text-slate-500 shrink-0 select-none uppercase mt-0.5">MDT:</span>
                        <p className="text-slate-400">{f.realApp}</p>
                      </div>
                      <div className="flex gap-2 items-start bg-orange-500/5 p-2 rounded-lg border border-orange-500/10">
                        <span className="text-[9px] font-mono font-bold text-orange-400 shrink-0 select-none uppercase mt-0.5">SIM:</span>
                        <p className="text-slate-200 font-medium">{f.simulator}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#0c1017] text-[10px] text-center text-slate-500 font-mono">
              TELEMETRY CORE VERSION 4.1.22 • AUTOCAB COMPANION SIMULATOR
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
