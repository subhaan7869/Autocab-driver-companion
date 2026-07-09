import React from 'react';
import { CreditCard, Landmark, Check, AlertCircle } from 'lucide-react';
import { EarningsRecord } from '../types';

interface EarningsPanelProps {
  earnings: EarningsRecord[];
  onLynkPay?: () => void;
}

export default function EarningsPanel({ earnings, onLynkPay }: EarningsPanelProps) {
  // Aggregate card/account balances (as Lynk pay only handles electronic payouts)
  const totalAmount = earnings.reduce((sum, item) => sum + item.fareAmount, 0);
  const cardAccAmount = earnings
    .filter(e => e.fareType === 'CARD' || e.fareType === 'ACCOUNT')
    .reduce((sum, item) => sum + item.fareAmount, 0);

  // Autocab balance in video is -6.30. Let's add driver's electronic earnings to clear it!
  const startingBalance = -6.30;
  const currentBalance = startingBalance + cardAccAmount;

  const todayDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col h-full bg-[#f4f5f8] text-slate-800 overflow-hidden" id="driver-sheets-container">
      {/* Header matching video */}
      <div className="bg-[#111622] px-4 py-3 border-b border-slate-900 flex items-center justify-between shrink-0">
        <span className="font-mono text-xs font-bold text-slate-200 tracking-widest uppercase">DRIVER SHEETS</span>
        <div className="text-[11px] font-mono font-bold text-orange-500 bg-orange-950/20 px-3 py-1 rounded border border-orange-500/20">
          {todayDate}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        
        <div className="space-y-4">
          {/* Balance card matching video at 00:16 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-x divide-slate-100 flex">
            {/* Previous Balance */}
            <div className="flex-1 p-4 text-center">
              <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">PREVIOUS BALANCE</p>
              <p className={`text-2xl font-black font-mono mt-1.5 ${startingBalance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                £{startingBalance.toFixed(2)}
              </p>
            </div>
            {/* Current Balance */}
            <div className="flex-1 p-4 text-center bg-slate-50/50">
              <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">CURRENT BALANCE</p>
              <p className={`text-2xl font-black font-mono mt-1.5 ${currentBalance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                £{currentBalance.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Transactions Sheet */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex-1 flex flex-col min-h-[220px]">
            <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">
              TRANSACTION LOG
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {earnings.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2.5">
                    <AlertCircle className="h-5 w-5 text-slate-300" />
                  </div>
                  <p className="text-xs font-mono text-slate-400 font-bold">No Transactions</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">Ready to sync next shift clearing</p>
                </div>
              ) : (
                [...earnings].reverse().map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-slate-400 font-bold">{item.date}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                          item.fareType === 'CASH' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          item.fareType === 'CARD' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          'bg-purple-50 text-purple-600 border border-purple-100'
                        }`}>
                          {item.fareType}
                        </span>
                      </div>
                      <p className="text-slate-800 font-extrabold mt-1 text-[11px] truncate max-w-[170px] sm:max-w-[280px]">
                        {item.pickup}
                      </p>
                    </div>
                    <div className="text-right font-black text-slate-900 text-sm">
                      £{item.fareAmount.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Huge Lynk Pay button at bottom of sheet matching video */}
        <div className="pt-4 mt-4 border-t border-slate-200/60 shrink-0">
          <button
            onClick={onLynkPay}
            className="w-full py-3.5 bg-[#111622] hover:bg-[#1f293d] text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <CreditCard className="h-4 w-4 text-orange-500" />
            Lynk Pay
          </button>
          <p className="text-[8px] text-slate-400 font-mono text-center mt-2 leading-relaxed">
            Payments processed via LynkPay security node. May take a moment to reflect in banking portals.
          </p>
        </div>

      </div>
    </div>
  );
}
