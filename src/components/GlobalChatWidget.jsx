import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquareCode, Sparkles, X, Send, ArrowRight } from 'lucide-react';

export default function GlobalChatWidget() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // If already on /chat page, don't show the duplicate floating bubble
  if (location.pathname === '/chat') return null;

  const handleSend = (e) => {
    e?.preventDefault();
    if (!prompt.trim()) return;
    navigate('/chat', { state: { initialPrompt: prompt } });
    setOpen(false);
    setPrompt('');
  };

  const quickPrompts = [
    'Can I bunk DBMS today?',
    'Summarize my OS notes',
    'What is due this week?'
  ];

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-5 z-40">
      {open ? (
        <div className="w-80 sm:w-96 rounded-3xl bg-darkCard border border-darkBorder shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-darkBorder">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">UniPilot Quick Chat</span>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 my-3">
            Ask any academic, attendance, or resume question:
          </p>

          <div className="space-y-1.5 mb-3">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => {
                  navigate('/chat', { state: { initialPrompt: qp } });
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg bg-darkBg/80 border border-darkBorder/60 text-[11px] text-slate-300 hover:text-indigo-300 hover:border-indigo-500/40 transition-colors flex items-center justify-between"
              >
                <span>{qp}</span>
                <ArrowRight className="w-3 h-3 opacity-50" />
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything..."
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 text-white font-medium text-xs shadow-glow-primary hover:scale-105 transition-all group"
          aria-label="Ask UniPilot"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="hidden sm:inline font-semibold">Ask UniPilot</span>
        </button>
      )}
    </div>
  );
}
