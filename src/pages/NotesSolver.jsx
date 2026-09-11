import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, FileText, Sparkles, CheckCircle2, Clock, RotateCw,
  HelpCircle, Layers, MessageSquare, Check, X, ArrowRight,
  BookOpen, RefreshCw, Brain, Trophy, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

export default function NotesSolver() {
  const navigate = useNavigate();
  const { addQuizResult } = useApp();
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const [docs, setDocs] = useState(() => {
    try {
      const saved = localStorage.getItem('unipilot_notes_docs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [docSummaries, setDocSummaries] = useState({});
  const [docCards, setDocCards] = useState({});
  const [docQuizzes, setDocQuizzes] = useState({});
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [quizError, setQuizError] = useState('');

  const [flippedCards, setFlippedCards] = useState({});

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeDoc = docs.find(d => d.id === selectedDocId) || docs[0] || {
    id: 'placeholder', title: 'No document selected', subject: 'Upload a document to start', status: 'Ready'
  };

  const currentFlashcards = docCards[selectedDocId] || [
    { id: 1, front: 'Upload a document first to generate flashcards.', back: 'Use the Upload Notes button or drag-and-drop zone to add your study material.' }
  ];

  const currentQuiz = docQuizzes[selectedDocId] || null;

  const handleAnswerClick = (optIdx) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optIdx);
    if (currentQuiz && optIdx === currentQuiz[quizIndex].correct) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!currentQuiz) return;
    if (quizIndex < currentQuiz.length - 1) {
      setQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
      // Save quiz result to dashboard
      const result = {
        id: Date.now(),
        docTitle: activeDoc.title,
        subject: activeDoc.subject,
        score: quizScore + (selectedAnswer === currentQuiz[quizIndex].correct ? 1 : 0),
        total: currentQuiz.length,
        percentage: Math.round(((quizScore + (selectedAnswer === currentQuiz[quizIndex].correct ? 1 : 0)) / currentQuiz.length) * 100),
        completedAt: new Date().toLocaleString(),
        timestamp: Date.now()
      };
      addQuizResult(result);
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
    setTimeout(() => {
      const newDoc = {
        id: `doc-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        subject: 'Uploaded Document',
        size: file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(1)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        pages: '—', status: 'Ready', uploadedAt: 'Just now'
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

  const handleGenerateSummaryAI = async () => {
    setIsLoadingSummary(true);
    setSummaryError('');
    try {
      const res = await api.summarizeNotesAI(activeDoc.title, activeDoc.subject);
      setDocSummaries(prev => ({
        ...prev,
        [selectedDocId || activeDoc.id]: {
          summary: res.summary || '',
          key_takeaways: res.key_takeaways || [],
          formulas: res.formulas || []
        }
      }));
    } catch (err) {
      setSummaryError('AI summary unavailable. Make sure the backend is running and try again.');
      console.warn('[NotesSolver] AI summary failed:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleGenerateCardsAI = async () => {
    setIsLoadingCards(true);
    try {
      const res = await api.getFlashcardsAI(activeDoc.title, activeDoc.subject, 6);
      const cards = (res.flashcards || []).map((c, i) => ({ id: i + 1, front: c.front, back: c.back }));
      setDocCards(prev => ({ ...prev, [selectedDocId || activeDoc.id]: cards }));
    } catch (err) {
      console.warn('[NotesSolver] Flashcards failed:', err);
    } finally {
      setIsLoadingCards(false);
    }
  };

  const handleGenerateQuizAI = async () => {
    setIsLoadingQuiz(true);
    setQuizError('');
    resetQuiz();
    try {
      const res = await api.generateQuizAI(activeDoc.title, activeDoc.subject, 5);
      const questions = res.questions || [];
      if (questions.length === 0) throw new Error('No questions returned');
      setDocQuizzes(prev => ({ ...prev, [selectedDocId || activeDoc.id]: questions }));
    } catch (err) {
      setQuizError('Could not generate quiz. Make sure the backend is running with a valid OpenRouter API key.');
      console.warn('[NotesSolver] Quiz generation failed:', err);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const docId = selectedDocId || activeDoc.id;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">AI Notes & Doubt Solver</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            AI-powered summaries, flashcards, and auto-generated practice quizzes from your course material.
          </p>
        </div>

        <input type="file" ref={fileInputRef} className="hidden"
          accept=".pdf,.docx,.pptx,.doc,.ppt,.txt"
          onChange={(e) => handleFileUpload(e.target.files)} />
        <button onClick={triggerFileInput} disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-glow-primary transition-all self-start sm:self-auto">
          <UploadCloud className="w-4 h-4" />
          <span>{isUploading ? 'Indexing...' : 'Upload Notes / Deck'}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-3xl bg-darkCard/80 border border-darkBorder/90">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Indexed Documents ({docs.length})
            </h3>

            <div className="space-y-2.5">
              {docs.map((doc) => (
                <div key={doc.id} onClick={() => { setSelectedDocId(doc.id); resetQuiz(); }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    (selectedDocId || (docs[0] && docs[0].id)) === doc.id
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-glow-primary'
                      : 'bg-darkBg/60 border-darkBorder/70 hover:border-slate-700'
                  }`}>
                  <div className="flex items-start gap-2.5">
                    <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${
                      (selectedDocId || (docs[0] && docs[0].id)) === doc.id ? 'text-indigo-400' : 'text-slate-400'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{doc.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{doc.subject}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">{doc.size}</span>
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          doc.status === 'Ready' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400 animate-pulse'
                        }`}>{doc.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Drag and Drop Zone */}
            <div onClick={triggerFileInput}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFileUpload(e.dataTransfer.files); }}
              className="mt-4 border-2 border-dashed border-darkBorder/80 hover:border-indigo-500/40 rounded-2xl p-5 text-center cursor-pointer bg-darkBg/40 hover:bg-darkBg transition-all">
              <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-slate-300">Drop new syllabus or slides</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Supports PDF, DOCX, PPTX up to 50MB</p>
            </div>
          </div>
        </div>

        {/* Right Study Station */}
        <div className="lg:col-span-8 space-y-4">
          {docs.length === 0 ? (
            <div className="p-10 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No document selected</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload your notes or slides to generate summaries, flashcards, and AI quizzes.
              </p>
              <button onClick={triggerFileInput}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-primary transition-all">
                Upload Notes / Deck
              </button>
            </div>
          ) : (
            <>
              {/* Active Doc Header & Tabs */}
              <div className="p-5 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-darkBorder/70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white">{activeDoc.title}</h3>
                      <span className="text-xs text-slate-400">{activeDoc.subject}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/chat', { state: { initialPrompt: `Ask a question about ${activeDoc.title}` } })}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-darkBg border border-indigo-500/30 hover:border-indigo-500 text-indigo-300 text-xs font-semibold transition-all self-start sm:self-auto">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ask about this doc</span>
                  </button>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {[
                    { id: 'summary', label: 'Summarize', icon: Sparkles },
                    { id: 'flashcards', label: 'Flashcards', icon: Layers },
                    { id: 'quiz', label: 'AI Quiz', icon: Brain },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeTab === tab.id ? 'bg-indigo-600 text-white shadow-glow-primary' : 'bg-darkBg text-slate-400 hover:text-white'
                      }`}>
                      <tab.icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab 1: AI Summary */}
              {activeTab === 'summary' && (
                <div className="p-6 rounded-3xl bg-darkCard/90 border border-darkBorder/90 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">AI Summary</span>
                    <button onClick={handleGenerateSummaryAI} disabled={isLoadingSummary}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-all disabled:opacity-50">
                      <RefreshCw className={`w-3 h-3 ${isLoadingSummary ? 'animate-spin' : ''}`} />
                      <span>{isLoadingSummary ? 'Analyzing...' : 'Generate with AI'}</span>
                    </button>
                  </div>

                  {summaryError && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {summaryError}
                    </div>
                  )}

                  {docSummaries[docId] ? (
                    <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      <p className="p-3.5 rounded-2xl bg-darkBg border border-darkBorder">
                        {docSummaries[docId].summary}
                      </p>
                      {docSummaries[docId].key_takeaways?.length > 0 && (
                        <div className="p-4 rounded-2xl bg-darkBg border border-darkBorder space-y-2">
                          <h4 className="font-bold text-white text-xs">Key Takeaways:</h4>
                          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                            {docSummaries[docId].key_takeaways.map((t, idx) => <li key={idx}>{t}</li>)}
                          </ul>
                        </div>
                      )}
                      {docSummaries[docId].formulas?.length > 0 && (
                        <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                          <span className="text-[11px] font-bold text-indigo-300 uppercase">Formulas / Rules:</span>
                          <div className="mt-1 font-mono text-xs text-indigo-200">{docSummaries[docId].formulas.join(' • ')}</div>
                        </div>
                      )}
                      <button onClick={() => setActiveTab('quiz')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-600/30 transition-all">
                        <Brain className="w-3.5 h-3.5" /> Take AI Quiz on this topic
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-3">
                      <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-sm text-slate-400">Click "Generate with AI" to get a structured summary, key takeaways, and formulas for <strong className="text-slate-300">{activeDoc.title}</strong>.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Flashcards */}
              {activeTab === 'flashcards' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Click any card to flip between Question and Answer</span>
                    <button onClick={handleGenerateCardsAI} disabled={isLoadingCards}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-all disabled:opacity-50">
                      <RefreshCw className={`w-3 h-3 ${isLoadingCards ? 'animate-spin' : ''}`} />
                      <span>{isLoadingCards ? 'Generating...' : 'AI Generate Cards'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentFlashcards.map((card) => {
                      const isFlipped = flippedCards[card.id];
                      return (
                        <div key={card.id}
                          onClick={() => setFlippedCards({ ...flippedCards, [card.id]: !isFlipped })}
                          className="min-h-[170px] p-5 rounded-3xl bg-darkCard border border-darkBorder hover:border-indigo-500/50 cursor-pointer flex flex-col justify-between transition-all group shadow-md">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                            <span className="uppercase">Card #{card.id}</span>
                            <span className="text-indigo-400 group-hover:underline">{isFlipped ? 'Show Front' : 'Show Answer'}</span>
                          </div>
                          <div className="my-auto py-2">
                            {isFlipped ? (
                              <p className="text-xs sm:text-sm font-medium text-emerald-300 leading-relaxed">{card.back}</p>
                            ) : (
                              <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed">{card.front}</p>
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

              {/* Tab 3: AI Quiz */}
              {activeTab === 'quiz' && (
                <div className="p-6 rounded-3xl bg-darkCard/90 border border-darkBorder/90">
                  {!currentQuiz ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto">
                        <Brain className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">AI-Generated Practice Quiz</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Generate a 5-question multiple-choice quiz based on the topic of <strong className="text-slate-300">{activeDoc.title}</strong>. Your score will be tracked on your dashboard.
                        </p>
                      </div>
                      {quizError && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-left">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {quizError}
                        </div>
                      )}
                      <button onClick={handleGenerateQuizAI} disabled={isLoadingQuiz}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg transition-all">
                        {isLoadingQuiz ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isLoadingQuiz ? 'Generating Quiz...' : 'Generate AI Quiz'}
                      </button>
                    </div>
                  ) : !quizFinished ? (
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-darkBorder mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                          Question {quizIndex + 1} of {currentQuiz.length}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-mono">Score: {quizScore}</span>
                          <button onClick={() => { resetQuiz(); setDocQuizzes(prev => { const n = {...prev}; delete n[docId]; return n; }); }}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors">New Quiz</button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1.5 w-full bg-darkBg rounded-full overflow-hidden mb-5">
                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${((quizIndex) / currentQuiz.length) * 100}%` }} />
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white mb-4">{currentQuiz[quizIndex].question}</h3>

                      <div className="space-y-2.5 mb-6">
                        {currentQuiz[quizIndex].options.map((opt, optIdx) => {
                          const isChosen = selectedAnswer === optIdx;
                          const isCorrect = optIdx === currentQuiz[quizIndex].correct;
                          let btnStyle = 'bg-darkBg/80 border-darkBorder text-slate-300 hover:border-indigo-500/50';
                          if (selectedAnswer !== null) {
                            if (isCorrect) btnStyle = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300';
                            else if (isChosen) btnStyle = 'bg-rose-500/15 border-rose-500/50 text-rose-300';
                          }
                          return (
                            <button key={optIdx} onClick={() => handleAnswerClick(optIdx)}
                              className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}>
                              <span>{opt}</span>
                              {selectedAnswer !== null && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                              {selectedAnswer !== null && isChosen && !isCorrect && <X className="w-4 h-4 text-rose-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {selectedAnswer !== null && (
                        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 mb-4">
                          <strong>Explanation: </strong>{currentQuiz[quizIndex].explanation}
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button onClick={handleNextQuestion} disabled={selectedAnswer === null}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs shadow-glow-primary transition-all flex items-center gap-2">
                          <span>{quizIndex === currentQuiz.length - 1 ? 'Finish & See Score' : 'Next Question'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                        <Trophy className="w-10 h-10" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {quizScore}/{currentQuiz.length}
                        </h3>
                        <p className="text-sm font-semibold text-slate-300 mt-1">
                          {Math.round((quizScore / currentQuiz.length) * 100)}% Score
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2">
                          {Math.round((quizScore / currentQuiz.length) * 100) >= 80
                            ? '🎉 Excellent! You have a strong grasp of this topic.'
                            : Math.round((quizScore / currentQuiz.length) * 100) >= 60
                              ? '👍 Good effort! Review the explanations to strengthen your understanding.'
                              : '📚 Keep studying! Go through the summary and try again.'}
                        </p>
                        <p className="text-[11px] text-emerald-400 mt-2">✓ Result saved to your dashboard</p>
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={resetQuiz}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors">
                          Retake Quiz
                        </button>
                        <button onClick={() => { resetQuiz(); setDocQuizzes(prev => { const n = {...prev}; delete n[docId]; return n; }); }}
                          className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors">
                          New Quiz
                        </button>
                      </div>
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
