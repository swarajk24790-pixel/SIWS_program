import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  RotateCw, 
  HelpCircle, 
  Layers, 
  MessageSquare, 
  Check, 
  X, 
  ArrowRight,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function NotesSolver() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const [docs, setDocs] = useState(() => {
    try {
      const saved = localStorage.getItem('unipilot_notes_docs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Dynamic AI State for current document
  const [docSummaries, setDocSummaries] = useState({});
  const [docCards, setDocCards] = useState({});
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  // Flashcards state
  const [flippedCards, setFlippedCards] = useState({});
  const defaultFlashcards = [
    {
      id: 1,
      front: 'Upload a document first to generate flashcards.',
      back: 'Use the "Upload Notes / Deck" button or drag-and-drop zone to add your study material.'
    }
  ];

  const currentFlashcards = docCards[selectedDocId] || defaultFlashcards;

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const quizQuestions = [
    {
      question: 'Upload a document to generate practice quiz questions.',
      options: ['Upload a document first', 'N/A', 'N/A', 'N/A'],
      correct: 0,
      explanation: 'Upload your notes or slides to auto-generate quiz questions.'
    }
  ];

  const handleAnswerClick = (optionIdx) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIdx);
    if (optionIdx === quizQuestions[quizIndex].correct) {
      setQuizScore(quizScore + 1);
    }
  };

  const handleNextQuestion = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(quizIndex + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploading(true);
    // Simulate processing time for the file
    setTimeout(() => {
      const newDoc = {
        id: `doc-${Date.now()}`,
        title: file.name,
        subject: 'Uploaded Document',
        size: file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(1)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        pages: '—',
        status: 'Ready',
        uploadedAt: 'Just now'
      };
      setDocs(prev => {
        const updated = [newDoc, ...prev];
        try { localStorage.setItem('unipilot_notes_docs', JSON.stringify(updated)); } catch (e) {}
        return updated;
      });
      setSelectedDocId(newDoc.id);
      setIsUploading(false);
    }, 800);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const activeDoc = docs.find(d => d.id === selectedDocId) || docs[0] || {
    id: 'placeholder',
    title: 'No document selected',
    subject: 'Upload a document to start',
    status: 'Ready'
  };

  const handleGenerateSummaryAI = async () => {
    setIsLoadingSummary(true);
    try {
      const res = await api.chat(`Summarize: ${activeDoc.title} about ${activeDoc.subject}`, []);
      setDocSummaries(prev => ({ ...prev, [selectedDocId]: {
        summary: res.reply || res || '',
        key_takeaways: res.suggested_actions || [],
        formulas: []
      } }));
    } catch (err) {
      console.warn('[NotesSolver] AI summary failed, using default:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleGenerateCardsAI = async () => {
    setIsLoadingCards(true);
    try {
      const res = await api.chat(`Generate flashcards: ${activeDoc.title} about ${activeDoc.subject}`, []);
      const flashcardsText = res.reply || res || '';
      const flashcards = flashcardsText.split('\n\n').filter(f => f.trim()).slice(0, 4).map((f, i) => {
        const lines = f.split('\n');
        const front = lines[0] || `Flashcard ${i + 1}`;
        const back = lines[1] || 'No answer available';
        return { id: i + 1, front, back };
      });
      setDocCards(prev => ({ ...prev, [selectedDocId]: flashcards }));
    } catch (err) {
      console.warn('[NotesSolver] AI flashcards failed, using default:', err);
    } finally {
      setIsLoadingCards(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">AI Notes & Doubt Solver</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ground answer generation, flashcard synthesis, and practice exam simulations in your actual course materials.
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.docx,.pptx,.doc,.ppt,.txt"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <button
          onClick={triggerFileInput}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-glow-primary transition-all self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{isUploading ? 'Indexing PDF...' : 'Upload Notes / Deck'}</span>
        </button>
      </div>

      {/* Main Grid: Left Documents List, Right Active Document Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-3xl bg-darkCard/80 border border-darkBorder/90">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Indexed Documents ({docs.length})
            </h3>

            <div className="space-y-2.5">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all text-left ${
                    selectedDocId === doc.id
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-glow-primary'
                      : 'bg-darkBg/60 border-darkBorder/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${
                      selectedDocId === doc.id ? 'text-indigo-400' : 'text-slate-400'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{doc.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{doc.subject}</p>
                      
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">{doc.pages} pages • {doc.size}</span>
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          doc.status === 'Ready' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-amber-500/20 text-amber-400 animate-pulse'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Drag and Drop Zone */}
            <div 
              onClick={triggerFileInput}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFileUpload(e.dataTransfer.files); }}
              className="mt-4 border-2 border-dashed border-darkBorder/80 hover:border-indigo-500/40 rounded-2xl p-5 text-center cursor-pointer bg-darkBg/40 hover:bg-darkBg transition-all"
            >
              <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-slate-300">Drop new syllabus or slides</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Supports PDF, DOCX, PPTX up to 50MB</p>
            </div>
          </div>
        </div>

        {/* Right Study Station (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {!activeDoc ? (
            <div className="p-10 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No document selected</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload your notes or slides using the button above to generate summaries, flashcards, and practice quizzes.
              </p>
              <button
                onClick={triggerFileInput}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-primary transition-all"
              >
                Upload Notes / Deck
              </button>
            </div>
          ) : (
          <>
          {/* Active Document Header & Tool Bar */}
          <div className="p-5 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-darkBorder/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">{activeDoc.title}</h3>
                  <span className="text-xs text-slate-400">{activeDoc.subject} • Status: {activeDoc.status}</span>
                </div>
              </div>

              {/* Action: Ask scoped question */}
              <button
                onClick={() => navigate('/chat', { state: { initialPrompt: `Ask a question about ${activeDoc.title}` } })}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-darkBg border border-indigo-500/30 hover:border-indigo-500 text-indigo-300 text-xs font-semibold transition-all self-start sm:self-auto"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask about this doc</span>
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'summary'
                    ? 'bg-indigo-600 text-white shadow-glow-primary'
                    : 'bg-darkBg text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Summarize</span>
              </button>

              <button
                onClick={() => setActiveTab('flashcards')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'flashcards'
                    ? 'bg-indigo-600 text-white shadow-glow-primary'
                    : 'bg-darkBg text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Flashcards (4)</span>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'quiz'
                    ? 'bg-indigo-600 text-white shadow-glow-primary'
                    : 'bg-darkBg text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Practice Quiz (3 Qs)</span>
              </button>
            </div>
          </div>

          {/* Tab 1: AI Summary Content */}
          {activeTab === 'summary' && (
            <div className="p-6 rounded-3xl bg-darkCard/90 border border-darkBorder/90 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Grounded Core Principles
                </span>
                <button
                  onClick={handleGenerateSummaryAI}
                  disabled={isLoadingSummary}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingSummary ? 'animate-spin' : ''}`} />
                  <span>{isLoadingSummary ? 'Analyzing...' : 'Regenerate with AI'}</span>
                </button>
              </div>

              {docSummaries[selectedDocId] ? (
                <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <p className="p-3.5 rounded-2xl bg-darkBg border border-darkBorder">
                    {docSummaries[selectedDocId].summary}
                  </p>
                  {docSummaries[selectedDocId].key_takeaways?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-darkBg border border-darkBorder space-y-2">
                      <h4 className="font-bold text-white text-xs">Essential Key Takeaways:</h4>
                      <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                        {docSummaries[selectedDocId].key_takeaways.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {docSummaries[selectedDocId].formulas?.length > 0 && (
                    <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                      <span className="text-[11px] font-bold text-indigo-300 uppercase">Formulas / Invariants:</span>
                      <div className="mt-1 font-mono text-xs text-indigo-200">
                        {docSummaries[selectedDocId].formulas.join(' • ')}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    The <strong>Raft Consensus Protocol</strong> simplifies state machine replication compared to Paxos by explicitly decomposing consensus into three discrete subproblems: 
                    <em>Leader Election</em>, <em>Log Replication</em>, and <em>Safety</em>.
                  </p>

                  <div className="p-4 rounded-2xl bg-darkBg border border-darkBorder space-y-2">
                    <h4 className="font-bold text-white text-xs">Essential State Invariants:</h4>
                    <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                      <li><strong>Election Safety:</strong> Exactly one leader can be active in any given numerical term.</li>
                      <li><strong>Leader Append-Only:</strong> A leader never overwrites or truncates its own log entries; it only appends new entries.</li>
                      <li><strong>Log Matching:</strong> If two logs contain an entry with the same index and term, they are identical up to that point.</li>
                      <li><strong>Leader Completeness:</strong> If a log entry is committed in a given term, that entry is guaranteed to exist in the leader logs for all higher terms.</li>
                    </ul>
                  </div>

                  <p>
                    Cluster membership changes and log compaction use memory snapshots to avoid unbounded disk consumption during continuous production telemetry.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Flashcard Viewer (Click-to-flip grid desktop / swipeable mobile) */}
          {activeTab === 'flashcards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Click any card to flip between Question and Answer</span>
                <button
                  onClick={handleGenerateCardsAI}
                  disabled={isLoadingCards}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingCards ? 'animate-spin' : ''}`} />
                  <span>{isLoadingCards ? 'Generating...' : 'AI Generate Cards'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentFlashcards.map((card) => {
                  const isFlipped = flippedCards[card.id];
                  return (
                    <div
                      key={card.id}
                      onClick={() => setFlippedCards({ ...flippedCards, [card.id]: !isFlipped })}
                      className="min-h-[170px] p-5 rounded-3xl bg-darkCard border border-darkBorder hover:border-indigo-500/50 cursor-pointer flex flex-col justify-between transition-all group shadow-md"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span className="uppercase">Card #{card.id}</span>
                        <span className="text-indigo-400 group-hover:underline">
                          {isFlipped ? 'Show Front' : 'Show Answer'}
                        </span>
                      </div>

                      <div className="my-auto py-2">
                        {isFlipped ? (
                          <p className="text-xs sm:text-sm font-medium text-emerald-300 leading-relaxed">
                            {card.back}
                          </p>
                        ) : (
                          <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed">
                            {card.front}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-darkBorder/40 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{isFlipped ? '✓ Answer' : '? Question'}</span>
                        <RotateCw className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Practice Quiz Viewer (One question at a time, scoring at end) */}
          {activeTab === 'quiz' && (
            <div className="p-6 rounded-3xl bg-darkCard/90 border border-darkBorder/90">
              {!quizFinished ? (
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-darkBorder mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Question {quizIndex + 1} of {quizQuestions.length}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Current Score: {quizScore}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white mb-4">
                    {quizQuestions[quizIndex].question}
                  </h3>

                  <div className="space-y-2.5 mb-6">
                    {quizQuestions[quizIndex].options.map((opt, optIdx) => {
                      const isChosen = selectedAnswer === optIdx;
                      const isCorrect = optIdx === quizQuestions[quizIndex].correct;
                      let btnStyle = 'bg-darkBg/80 border-darkBorder text-slate-300 hover:border-indigo-500/50';

                      if (selectedAnswer !== null) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300';
                        } else if (isChosen) {
                          btnStyle = 'bg-rose-500/15 border-rose-500/50 text-rose-300';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleAnswerClick(optIdx)}
                          className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {selectedAnswer !== null && isCorrect && (
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {selectedAnswer !== null && isChosen && !isCorrect && (
                            <X className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedAnswer !== null && (
                    <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 mb-4">
                      <strong>Explanation: </strong> {quizQuestions[quizIndex].explanation}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      disabled={selectedAnswer === null}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs shadow-glow-primary transition-all flex items-center gap-2"
                    >
                      <span>{quizIndex === quizQuestions.length - 1 ? 'Finish & See Score' : 'Next Question'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto text-2xl font-bold">
                    {quizScore}/{quizQuestions.length}
                  </div>
                  <h3 className="text-xl font-bold text-white">Quiz Completed!</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    You scored {Math.round((quizScore / quizQuestions.length) * 100)}% on the Raft Consensus module.
                  </p>
                  <button
                    onClick={resetQuiz}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors"
                  >
                    Retake Quiz
                  </button>
                </div>
              )}
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
}
