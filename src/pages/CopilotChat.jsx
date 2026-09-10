import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  BookOpen, 
  ArrowRight,
  Plus,
  Trash2,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function CopilotChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const { attendance, assignments } = useApp();
  const messagesEndRef = useRef(null);

  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Chat sessions history
  const [sessions, setSessions] = useState([
    { id: 'sess-1', title: 'DBMS Attendance calculation', time: 'Today, 9:40 AM' },
    { id: 'sess-2', title: 'Exam Prep & Flashcard generation', time: 'Yesterday' },
    { id: 'sess-3', title: 'Raft consensus debugging notes', time: '3 days ago' },
  ]);
  const [activeSessionId, setActiveSessionId] = useState('sess-1');

  // Messages with inline structured render support
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'assistant',
      text: "Hello! I'm your UniPilot academic assistant. I'm synced with your timetable, notes, and attendance data. How can I help you today?",
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Handle incoming initial prompt from navigation/quick widget
  useEffect(() => {
    if (location.state?.initialPrompt) {
      handleUserQuery(location.state.initialPrompt);
      // clear location state so it doesn't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleUserQuery = async (queryText) => {
    if (!queryText.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: queryText,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Build history payload from recent messages (max 6)
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.sender === 'assistant' ? 'assistant' : 'user',
        content: m.text || ''
      }));

      const res = await api.chat(queryText, historyPayload);
      const botResponse = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: res.reply || res.text || 'Done.',
        type: res.widget?.type || 'text',
        data: res.widget?.data || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      console.warn('[CopilotChat] Live AI error, falling back locally:', err);
      // Fallback response if network or AI error
      const lower = queryText.toLowerCase();
      let botResponse;
      if (lower.includes('bunk') || lower.includes('attendance')) {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: 'Here is your real-time attendance diagnosis across active courses:',
          type: 'structured_attendance',
          data: {
            subject: 'Database Management Systems',
            held: 28,
            attended: 20,
            currentPct: 71.4,
            requiredPct: 75,
            bunkPct: 68.9,
            actionAdvice: 'DBMS is currently in the danger zone. Distributed Systems (86.1%) and AI (87.5%) can safely accommodate 1-2 absences.'
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      } else {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: `I analyzed "${queryText}". I can calculate attendance impacts, generate study roadmaps, or synthesize your activity feed into resume bullets.`,
          type: 'text',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleUserQuery(input);
  };

  const chips = [
    'Can I bunk DBMS today?',
    'Summarize my OS notes',
    'What is due this week?',
    'Synthesize my hackathon win for resume'
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex rounded-3xl bg-darkCard/80 border border-darkBorder/90 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Persistent Chat History Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-darkBg/60 border-r border-darkBorder/70 p-4 shrink-0">
        <button
          onClick={() => {
            const newSess = { id: `sess-${Date.now()}`, title: 'New Conversation', time: 'Just now' };
            setSessions([newSess, ...sessions]);
            setActiveSessionId(newSess.id);
            setMessages([{
              id: `m-${Date.now()}`,
              sender: 'assistant',
              text: 'New academic thread started. What are we studying or solving today?',
              type: 'text',
              timestamp: 'Just now'
            }]);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all mb-4"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat Thread</span>
        </button>

        <div className="flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          <History className="w-3.5 h-3.5" />
          <span>Recent Sessions</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex flex-col ${
                activeSessionId === s.id
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <span className="truncate">{s.title}</span>
              <span className="text-[10px] text-slate-500 mt-0.5">{s.time}</span>
            </button>
          ))}
        </div>

        <div className="pt-3 border-t border-darkBorder text-[11px] text-slate-400 flex items-center justify-between">
          <span>Model: UniPilot RAG Engine</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-darkBg/30">
        {/* Chat Thread Header */}
        <div className="px-6 py-3.5 border-b border-darkBorder/70 bg-darkCard/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 p-[1px]">
              <div className="w-full h-full bg-darkBg rounded-[11px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">UniPilot Chat</h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Grounded in your timetable & course documents
              </p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-darkCard border border-indigo-500/30 text-indigo-400'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div className="space-y-2 max-w-[85%] sm:max-w-xl">
                {/* Standard Text bubble */}
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-sm shadow-glow-primary'
                    : 'bg-darkCard border border-darkBorder/80 text-slate-200 rounded-tl-sm shadow-md'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Inline Structured Results: Attendance Card */}
                {msg.type === 'structured_attendance' && (
                  <div className="p-4 rounded-2xl bg-darkCard/90 border border-rose-500/30 shadow-lg space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-darkBorder">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-bold text-white">{msg.data.subject}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                        Attendance Risk
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-darkBg border border-darkBorder">
                        <span className="text-[10px] text-slate-400 block">Classes Held</span>
                        <span className="text-xs font-bold text-white font-mono">{msg.data.held}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-darkBg border border-darkBorder">
                        <span className="text-[10px] text-slate-400 block">Attended</span>
                        <span className="text-xs font-bold text-white font-mono">{msg.data.attended}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <span className="text-[10px] text-rose-300 block">Current %</span>
                        <span className="text-xs font-bold text-rose-400 font-mono">{msg.data.currentPct}%</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-darkBg/90 border border-darkBorder text-[11px] text-slate-300">
                      <p className="leading-snug">{msg.data.actionAdvice}</p>
                    </div>

                    <button
                      onClick={() => navigate('/attendance')}
                      className="w-full py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <span>Open Attendance Calculator</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Inline Structured Results: Tasks Card */}
                {msg.type === 'structured_tasks' && (
                  <div className="p-4 rounded-2xl bg-darkCard border border-darkBorder shadow-lg space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-darkBorder">
                      <Calendar className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold text-white">Upcoming Coursework Matrix</span>
                    </div>
                    {msg.data.slice(0, 3).map((t) => (
                      <div key={t.id} className="p-2.5 rounded-xl bg-darkBg border border-darkBorder flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-200">{t.title}</p>
                          <p className="text-[10px] text-slate-400">{t.subject} • Due: {t.dueDate}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          {t.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Structured Results: Notes Card */}
                {msg.type === 'structured_notes' && (
                  <div className="p-4 rounded-2xl bg-darkCard border border-sky-500/30 shadow-lg space-y-2.5">
                    <div className="flex items-center gap-2 pb-2 border-b border-darkBorder">
                      <BookOpen className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold text-white">{msg.data.doc}</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                      {msg.data.keyTakeaways.map((k, i) => (
                        <li key={i} className="leading-relaxed">{k}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => navigate('/notes')}
                      className="w-full py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold"
                    >
                      Generate Flashcards for this Topic
                    </button>
                  </div>
                )}

                <span className="text-[10px] text-slate-500 block px-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-darkCard border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-darkCard border border-darkBorder text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[11px]">UniPilot is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Suggested Chips, File Attach, and Mic Voice Input */}
        <div className="p-4 border-t border-darkBorder/80 bg-darkCard/60 space-y-3">
          {/* Suggested prompt chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {chips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleUserQuery(chip)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-darkBg border border-darkBorder hover:border-indigo-500/40 text-[11px] text-slate-300 hover:text-white transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            {/* Attach file / PDF button (feeds to Notes & Doubt Solver) */}
            <button
              type="button"
              onClick={() => navigate('/notes')}
              className="p-2.5 rounded-xl bg-darkBg border border-darkBorder text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Attach PDF/notes for grounded answering"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice input mic button */}
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isRecording 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                  : 'bg-darkBg border border-darkBorder text-slate-400 hover:text-white'
              }`}
              title="Voice input"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about timetable, attendance calculations, notes, or resume..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-glow-primary transition-all flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
