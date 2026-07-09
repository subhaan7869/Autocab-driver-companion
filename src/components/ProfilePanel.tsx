import React from 'react';
import { ShieldCheck, Calendar, FileText, ChevronRight, Award } from 'lucide-react';
import { DriverProfile } from '../types';

interface ProfilePanelProps {
  profile: DriverProfile;
}

export default function ProfilePanel({ profile }: ProfilePanelProps) {
  return (
    <div className="flex flex-col h-full bg-[#f4f5f8] text-slate-800 overflow-hidden" id="driver-wallet-container">
      {/* Header matching video style */}
      <div className="bg-[#111622] px-4 py-3 border-b border-slate-900 flex items-center justify-between shrink-0">
        <span className="font-mono text-xs font-bold text-slate-200 tracking-wider uppercase">DRIVER COMPLIANCE WALLET</span>
        <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] font-black uppercase">
          <ShieldCheck className="h-4 w-4 text-emerald-400 animate-pulse" />
          VERIFIED & APPROVED
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Driver Summary Badge Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
          <img 
            src="/src/assets/images/driver_avatar_1783608513016.jpg" 
            alt="Hassen Nabeel profile" 
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-full border-2 border-orange-500 object-cover shadow-sm shrink-0"
          />
          <div>
            <h3 className="text-sm font-black text-slate-950 font-sans tracking-wide uppercase">{profile.name}</h3>
            <p className="text-[10px] font-mono text-slate-400 font-bold">BADGE NO: {profile.badgeNumber} • FLEET PIN: {profile.driverPin}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] font-mono bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                {profile.vehicleModel}
              </span>
              <span className="text-[9px] font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                {profile.vehicleReg}
              </span>
            </div>
          </div>
        </div>

        {/* Credentials Wallet List */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">
            CRITICAL ENFORCEMENT COMPLIANCE
          </h4>

          <div className="space-y-2">
            {profile.documents.map((doc, idx) => {
              const isValid = doc.status === 'VALID';
              const isWarning = doc.status === 'WARNING';
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 p-3.5 flex items-center justify-between transition-all hover:border-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isValid ? 'bg-emerald-50 text-emerald-600' :
                      isWarning ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                    }`}>
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-mono font-extrabold text-slate-800 uppercase tracking-wide">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>Expiry: {doc.expiryDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full border ${
                      isValid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      isWarning ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {doc.status}
                    </span>
                    <ChevronRight className="h-4.5 w-4.5 text-slate-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Quality Badges */}
        <div className="bg-[#111622] text-white rounded-2xl p-4 border border-slate-950 flex justify-between items-center relative overflow-hidden shadow-md">
          {/* subtle gold ambient glow */}
          <div className="absolute -right-12 -bottom-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <span className="text-[9px] font-mono text-amber-500 font-black uppercase tracking-widest block mb-1">
              FLEET RATING SCORE
            </span>
            <p className="text-2xl font-black font-mono tracking-tight">
              {profile.rating.toFixed(2)} / 5.00
            </p>
            <p className="text-[9px] font-mono text-slate-400 mt-1 leading-normal">
              Based on your last 100 passenger evaluations
            </p>
          </div>

          <div className="relative z-10 w-11 h-11 bg-amber-500/15 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
            <Award className="h-6 w-6 stroke-[2]" />
          </div>
        </div>
      </div>
    </div>
  );
}
