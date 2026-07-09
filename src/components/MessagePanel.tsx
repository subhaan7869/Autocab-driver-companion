import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, CheckCheck, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Message } from '../types';

interface MessagePanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onClearUnread: () => void;
  onBackToHome: () => void;
}

const PRESET_MESSAGES = [
  'Yes',
  'No',
  'Out of car 5 minutes',
  'Back in Car',
  'Going off shift in 30 mins Thanks',
  'Can I go off now please. Thanks',
  'Less than 5 minutes',
  'customer no longer wants car, please cancel job',
  'outside office',
  'Toilet Break',
  'thank you',
  'CAN I MAKE A FUEL STOP??',
  'GOING OFF SHIFT IN 1-HOUR. THANKS',
];

export default function MessagePanel({
  messages,
  onSendMessage,
  onClearUnread,
  onBackToHome,
}: MessagePanelProps) {
  const [inputText, setInputText] = useState('');
  const [cannedOpen, setCannedOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    onClearUnread();
  }, [onClearUnread]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    onSendMessage(text);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] text-slate-800 overflow-hidden" id="messenger-screen-panel">
      {/* Messenger Header matching video at 01:31 */}
      <div className="bg-[#111622] px-4 py-3 border-b border-slate-900 flex items-center justify-between shrink-0">
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-slate-300 font-mono font-bold text-xs hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 text-orange-500" />
          BACK
        </button>
        <span className="font-mono text-xs font-bold text-slate-200 tracking-wider">MESSENGER</span>
        <div className="w-12"></div> {/* spacing spacer */}
      </div>

      {/* Main Chat feed matching video colors */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#eaebee] flex flex-col">
        {messages.map((msg) => {
          const isDriver = msg.sender === 'DRIVER';
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[80%] ${isDriver ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div className="text-[9px] font-mono text-slate-400 mb-0.5 px-1 uppercase font-bold">
                {isDriver ? 'MY CAB' : 'DISPATCH'} • {msg.timestamp}
              </div>
              
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-mono font-bold shadow-sm border ${
                  isDriver
                    ? 'bg-[#1b68ff] text-white border-[#1556d6] rounded-tr-none'
                    : 'bg-[#ff3b30]/10 text-[#8f1d18] border-[#ff3b30]/15 rounded-tl-none bg-[#fff] !text-[#2c3e50]' 
                }`}
                style={!isDriver ? { borderLeft: '4px solid #ff3b30' } : {}}
              >
                {msg.text}
              </div>

              {isDriver && (
                <span className="text-[9px] text-[#1b68ff] flex items-center gap-0.5 mt-0.5 font-mono font-bold">
                  <CheckCheck className="h-3 w-3" /> Sent
                </span>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Canned preset messages slide-up sheet matching video at 01:31 */}
      <div className="bg-white border-t border-slate-300/80 shrink-0">
        <button
          onClick={() => setCannedOpen(!cannedOpen)}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 border-b border-slate-200 flex items-center justify-between px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500"
        >
          <span>Predefined replies ({PRESET_MESSAGES.length})</span>
          {cannedOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>

        {cannedOpen && (
          <div className="h-36 overflow-y-auto p-2.5 grid grid-cols-2 sm:grid-cols-3 gap-1.5 bg-slate-50">
            {PRESET_MESSAGES.map((msg, i) => (
              <button
                key={`canned-${i}`}
                onClick={() => {
                  handleSend(msg);
                  // Optionally close after select to maintain compact layout
                }}
                className="text-left p-2 bg-white hover:bg-orange-50 hover:border-orange-500/45 border border-slate-200 text-[10px] font-mono text-slate-700 hover:text-orange-950 font-bold rounded-lg truncate transition-all active:scale-[0.98]"
              >
                {msg}
              </button>
            ))}
          </div>
        )}

        {/* Free text type input */}
        <div className="p-3 bg-[#e4e7eb] flex items-center gap-2 border-t border-slate-300">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
            placeholder="freetype:-"
            className="flex-1 bg-white border border-slate-300 rounded-full px-4 py-2 text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={() => handleSend(inputText)}
            className="bg-[#111622] hover:bg-slate-850 active:scale-95 text-white p-2.5 rounded-full font-bold transition-all shrink-0 shadow-sm"
          >
            <Send className="h-4 w-4 text-orange-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
