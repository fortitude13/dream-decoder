import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Constellation from './components/Constellation';
import Navigation from './components/Navigation';
import SymbolsPage from './pages/SymbolsPage';
import JournalPage from './pages/JournalPage';
import FloatingHeroImage from './components/FloatingHeroImage';
import AnalysisConstellation from './components/AnalysisConstellation';
import { interpretDream, generateDreamImage, DreamInterpretation } from './services/gemini';
import DreamConstellation from './components/DreamConstellation';
import { Sparkles, Moon, Sparkle, Feather, Key, Compass, ChevronDown, Share2, Link, Download, Calendar } from 'lucide-react';
import SparklesText from './components/SparklesText';
import html2canvas from 'html2canvas';

type PageState = 'intro' | 'input' | 'analysis' | 'result' | 'symbols' | 'journal';

interface SavedDream extends DreamInterpretation {
  id: string;
  date: string;
  dreamText: string;
  imageUrl?: string;
}

const COMMON_KEYWORDS = [
  { id: 'falling', label: '추락', icon: '🪂' },
  { id: 'water', label: '물/바다', icon: '🌊' },
  { id: 'flying', label: '비행', icon: '🦅' },
  { id: 'chase', label: '쫓김', icon: '🏃' },
  { id: 'teeth', label: '치아', icon: '🦷' },
  { id: 'exam', label: '시험', icon: '📝' },
  { id: 'forest', label: '숲', icon: '🌲' },
  { id: 'fear', label: '공포', icon: '😨' },
  { id: 'joy', label: '기쁨', icon: '✨' },
  { id: 'fire', label: '불', icon: '🔥' },
  { id: 'death', label: '죽음', icon: '💀' },
  { id: 'money', label: '돈', icon: '💰' },
];

export default function App() {
  const [page, setPage] = useState<PageState>('intro');
  const [dreamText, setDreamText] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [resultData, setResultData] = useState<DreamInterpretation | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [resultVideo, setResultVideo] = useState('https://cdn.midjourney.com/video/c7ad1d31-fd55-471b-b72d-acb51fee211b/0.mp4');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleStart = () => setPage('input');

  const handleSubmit = async () => {
    if (!dreamText.trim()) return;
    setPage('analysis');
    
    const interpretationPromise = interpretDream(dreamText, selectedKeywords);
    
    const steps = [
      "꿈의 상징 분석 중...",
      "감정 패턴 해석 중...",
      "무의식 의미 탐색 중..."
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setAnalysisStep(i);
      await new Promise(r => setTimeout(r, 2000));
    }
    
    // Extra delay for the final constellation animation
    await new Promise(r => setTimeout(r, 1500));

    try {
      const interpretation = await interpretationPromise;
      if (interpretation) {
        // Save to journal
        const newDream: SavedDream = {
          ...interpretation,
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          dreamText
        };
        const saved = localStorage.getItem('dream_journal');
        const journal = saved ? JSON.parse(saved) : [];
        const updatedJournal = [newDream, ...journal];
        localStorage.setItem('dream_journal', JSON.stringify(updatedJournal));
        
        setResultData(newDream);
        setPage('result');
      } else {
        setResultData({
          reflection: "별들이 구름에 가려졌습니다. 꿈을 해석할 수 없습니다.",
          summary: "해석 실패",
          oneLiner: "해석할 수 없는 꿈입니다.",
          symbols: [],
          emotionalInsight: "잠시 후 다시 시도해 주세요."
        });
      }
    } catch (error: any) {
      console.error(error);
      if (error.message === "MISSING_API_KEY") {
        setResultData({
          reflection: "별의 열쇠(API Key)가 설정되지 않았습니다.",
          summary: "설정 오류",
          oneLiner: ".env 파일에 API 키를 설정해주세요.",
          symbols: [],
          emotionalInsight: "루트 디렉토리에 .env 파일을 생성하고 GEMINI_API_KEY를 입력해야 꿈을 해독할 수 있습니다. .env.example 파일을 참고하세요."
        });
      } else if (error.message === "QUOTA_EXCEEDED_90") {
        setResultData({
          reflection: "오늘의 로컬 해몽 제한에 도달했습니다.",
          summary: "로컬 쿼터 초과",
          oneLiner: "내일 다시 시도하거나 브라우저 캐시를 비워주세요.",
          symbols: [],
          emotionalInsight: "무분별한 해몽을 방지하기 위해 로컬에 저장된 일일 사용량을 모두 소진했습니다. 내일 다시 새로운 꿈으로 찾아와 주세요."
        });
      } else if (error.message === "API_QUOTA_EXHAUSTED") {
        setResultData({
          reflection: "현재 별의 기운(API 서버)이 매우 혼잡합니다.",
          summary: "서버 일시 한계",
          oneLiner: "약 1분 후에 다시 시도해 보세요.",
          symbols: [],
          emotionalInsight: "Google API 서버에서 일시적으로 요청이 거절되었습니다. 무료 티어의 분당 요청 제한(RPM) 때문일 수 있으니, 잠시 마음을 가다듬고 1분 후에 다시 시도해 주시기 바랍니다."
        });
      } else {
        setResultData({
          reflection: "에테르의 교란으로 인해 꿈을 읽을 수 없었습니다.",
          summary: "오류 발생",
          oneLiner: "알 수 없는 오류가 발생했습니다.",
          symbols: [],
          emotionalInsight: "잠시 후 다시 시도해 주세요."
        });
      }
    }
    
    setResultVideo('https://cdn.midjourney.com/video/c7ad1d31-fd55-471b-b72d-acb51fee211b/0.mp4');
    setPage('result');
  };

  const handleJustSave = () => {
    if (!dreamText.trim()) return;
    const newDream: SavedDream = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      dreamText,
      summary: "기록된 꿈",
      oneLiner: "기록만 남긴 꿈입니다.",
      reflection: "이 꿈은 해몽 없이 기록되었습니다.",
      emotionalInsight: "나중에 다시 읽어보며 의미를 찾아보세요.",
      symbols: selectedKeywords.map(k => ({ name: k, meaning: "선택된 키워드" }))
    };
    const saved = localStorage.getItem('dream_journal');
    const journal = saved ? JSON.parse(saved) : [];
    const updatedJournal = [newDream, ...journal];
    localStorage.setItem('dream_journal', JSON.stringify(updatedJournal));
    setPage('journal');
  };

  const handleGenerateImage = async () => {
    if (!resultData || !dreamText) return;
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateDreamImage(dreamText, resultData.summary);
      if (imageUrl) {
        setGeneratedImageUrl(imageUrl);
        // Update saved dream with image
        const saved = localStorage.getItem('dream_journal');
        if (saved) {
          const journal = JSON.parse(saved) as SavedDream[];
          const updatedJournal = journal.map(d => 
            d.id === (resultData as SavedDream).id ? { ...d, imageUrl } : d
          );
          localStorage.setItem('dream_journal', JSON.stringify(updatedJournal));
        }
      }
    } catch (error) {
      console.error("Image generation failed:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('링크가 복사되었습니다.');
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dream Decoder',
          text: `내 꿈의 해몽: "${resultData?.oneLiner}"`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#05050a',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `dream-interpretation-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Save image failed:', err);
    }
  };

  const reset = () => {
    setDreamText('');
    setSelectedKeywords([]);
    setResultData(null);
    setAnalysisStep(0);
    setGeneratedImageUrl(null);
    setPage('input');
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-200 font-sans overflow-x-hidden relative selection:bg-purple-500/30">
      <AnimatePresence>
        {page === 'intro' && (
          <motion.div
            key="intro-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 1.5 }}
            className="fixed inset-0 z-0 pointer-events-none"
          >
            <video 
              autoPlay 
              muted 
              loop 
              playsInline
              ref={(el) => { if (el) el.playbackRate = 0.7; }}
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="https://cdn.midjourney.com/video/61ae127f-2392-432f-b092-6fafcb74b881/0.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
          </motion.div>
        )}
      </AnimatePresence>

      {page !== 'intro' && page !== 'analysis' && <Constellation />}
      
      <Navigation currentPage={page} setPage={setPage} />

      <AnimatePresence mode="wait">
        {page === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center pointer-events-none"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="relative z-10 px-6 flex flex-col items-center w-full max-w-5xl pointer-events-auto"
            >
              <p className="text-sm md:text-lg font-sans tracking-[0.3em] uppercase text-purple-300 drop-shadow-2xl mb-6 drop-shadow-lg font-medium">
                Dreams are fragments of the subconscious.
              </p>
              <h1 className="text-5xl md:text-8xl font-serif mb-16 text-white drop-shadow-2xl font-light tracking-tight leading-[1.1]">
                <SparklesText>
                  당신의 꿈은 <br /> 무엇을 말하고 있나요?
                </SparklesText>
              </h1>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPage('input')}
                className="w-full max-w-lg glass-panel rounded-full p-4 shadow-2xl border border-white/20 backdrop-blur-md bg-white/5 hover:bg-white/10 cursor-text flex items-center transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 text-purple-400 mx-3" />
                <span className="text-slate-300 text-lg font-light tracking-wide opacity-70">어떤 꿈을 꾸셨나요?</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {page === 'input' && (
          <motion.div 
            key="input"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-start z-10 px-4 py-8 overflow-y-auto"
          >
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center pb-20 pt-16">
              
              <FloatingHeroImage 
                src="https://postfiles.pstatic.net/MjAyNjAzMDhfMjgw/MDAxNzcyOTY5NzcyNTQz.GXy5fCDUdaVu2Uogc2RXJJESG-Rxhe6s10NMNjdhd18g.F7fTbt5s1X-0RVjL_AsAJFsYreumU1GLcKDzOBNXnRMg.PNG/%EC%A0%9C%EB%AA%A9_%EC%97%86%EC%9D%8C-1.png?type=w966"
                alt="Crystal Ball"
                glowColorClass="bg-purple-500"
                shadowColor="rgba(168,85,247,0.4)"
                onClick={handleSubmit} 
                disabled={!dreamText.trim()} 
              />

              <div className="w-full glass-panel rounded-3xl p-6 md:p-10 shadow-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
                <h2 className="text-2xl font-serif text-center mb-8 text-purple-200">
                  어젯밤 어떤 꿈을 꾸셨나요?
                </h2>
                
                <textarea
                  autoFocus
                  value={dreamText}
                  onChange={(e) => setDreamText(e.target.value)}
                  placeholder="예: 하늘을 나는 꿈을 꿨어요. 구름 사이를 자유롭게 다니며 행복한 기분을 느꼈습니다."
                  className="w-full h-40 bg-black/40 border border-purple-500/30 rounded-xl p-4 text-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all resize-none mb-6"
                />

                <div className="mb-8">
                  <label className="block text-sm font-medium text-purple-300 mb-4 ml-1">
                    기억나는 키워드 (선택사항)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_KEYWORDS.map((keyword) => (
                      <button
                        key={keyword.id}
                        onClick={() => {
                          setSelectedKeywords(prev => 
                            prev.includes(keyword.label) 
                              ? prev.filter(k => k !== keyword.label)
                              : [...prev, keyword.label]
                          );
                        }}
                        className={`px-4 py-2 rounded-full text-sm transition-all border ${
                          selectedKeywords.includes(keyword.label)
                            ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                            : 'bg-black/40 border-purple-500/20 text-slate-400 hover:border-purple-500/50'
                        }`}
                      >
                        {keyword.icon} {keyword.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={handleJustSave}
                    disabled={!dreamText.trim()}
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 disabled:bg-slate-800 disabled:text-slate-500 text-slate-300 rounded-full font-medium tracking-wide transition-all disabled:cursor-not-allowed border border-white/10 cursor-pointer"
                  >
                    기록만 남기기
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!dreamText.trim()}
                    className="px-10 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-full font-medium tracking-wide transition-all disabled:cursor-not-allowed shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] cursor-pointer"
                  >
                    해몽 시작하기
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {page === 'analysis' && (
          <motion.div 
            key="analysis"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6"
          >
            <AnalysisConstellation keywords={selectedKeywords} step={analysisStep} />
            <div className="text-center z-10 pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.p
                  key={analysisStep}
                  initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                  transition={{ duration: 0.8 }}
                  className="text-3xl md:text-5xl font-serif text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                >
                  {[
                    "꿈의 상징 분석 중...",
                    "감정 패턴 해석 중...",
                    "무의식 의미 탐색 중..."
                  ][analysisStep]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {page === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden"
          >
            {/* Hero Section */}
            <div className="relative w-full h-screen flex flex-col items-center justify-center">
              <div className="absolute inset-0 z-0">
                <motion.video 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ duration: 2 }}
                  src={resultVideo}
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#05050a]" />
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1.5 }}
                className="relative z-10 text-center px-6"
              >
                <p className="text-sm md:text-lg font-sans tracking-[0.3em] uppercase text-purple-300 mb-6 drop-shadow-lg font-medium">
                  Your Dream Has Been Decoded
                </p>
                <h2 className="text-4xl md:text-7xl font-serif text-white drop-shadow-2xl font-light tracking-tight leading-[1.1]">
                  당신의 꿈이 <br className="md:hidden" />해독되었습니다
                </h2>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 1 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce"
              >
                <span className="text-xs tracking-[0.2em] text-white/50 uppercase">Scroll to explore</span>
                <ChevronDown className="w-5 h-5 text-white/50" />
              </motion.div>
            </div>

            {/* Interpretation Sections */}
            <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col gap-24 relative z-10">
              
              {resultData && (
                <div className="space-y-24">
                  {/* Shareable Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center gap-8"
                  >
                    <div ref={cardRef} className="relative w-full max-w-md aspect-[3/4] bg-gradient-to-br from-indigo-950 via-purple-950 to-black rounded-[2rem] p-8 shadow-[0_0_50px_rgba(168,85,247,0.3)] border border-white/10 overflow-hidden group">
                      {generatedImageUrl ? (
                        <img src={generatedImageUrl} alt="Dream Visualization" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      ) : (
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      
                      <div className="relative h-full flex flex-col justify-between z-10">
                        <div className="flex justify-between items-start">
                          <Sparkles className="w-6 h-6 text-purple-300" />
                          <span className="text-[10px] tracking-[0.3em] text-white/40 uppercase">Dream Decoder</span>
                        </div>
                        
                        <div className="text-center space-y-6">
                          <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto" />
                          <h4 className="text-2xl md:text-3xl font-serif text-white leading-tight italic">
                            "{resultData.oneLiner}"
                          </h4>
                          <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto" />
                          <p className="text-sm text-purple-200/80 font-light tracking-wide">
                            {resultData.summary}
                          </p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                          <div className="text-[10px] tracking-[0.2em] text-white/30 uppercase">Scan to decode yours</div>
                          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                            <Moon className="w-4 h-4 text-white/60" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                      <button 
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs tracking-widest text-slate-300 transition-all"
                      >
                        <Link className="w-3 h-3" />
                        COPY LINK
                      </button>
                      <button 
                        onClick={handleShareNative}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs tracking-widest text-slate-300 transition-all"
                      >
                        <Share2 className="w-3 h-3" />
                        SHARE
                      </button>
                      <button 
                        onClick={handleSaveImage}
                        className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-full text-xs tracking-widest text-purple-200 transition-all"
                      >
                        <Download className="w-3 h-3" />
                        SAVE AS IMAGE
                      </button>
                    </div>
                  </motion.div>

                  {/* Image Generation CTA */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center gap-6"
                  >
                    {!generatedImageUrl && (
                      <button
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage}
                        className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full overflow-hidden transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <span className="relative flex items-center gap-3 text-sm font-medium tracking-widest text-white">
                          {isGeneratingImage ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              이미지 생성 중...
                            </>
                          ) : (
                            <>
                              <Sparkle className="w-4 h-4" />
                              꿈의 장면 시각화하기
                            </>
                          )}
                        </span>
                      </button>
                    )}
                    <p className="text-xs text-slate-500 text-center max-w-xs">
                      AI가 당신의 꿈을 바탕으로 초현실적인 이미지를 생성합니다. (약 10-20초 소요)
                    </p>
                  </motion.div>

                  {/* Dream Reflection */}
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1 }}
                    className="relative"
                  >
                    <div className="flex flex-col items-center text-center mb-8">
                      <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                        <Feather className="w-8 h-8 text-purple-300" />
                      </div>
                      <h3 className="text-3xl font-serif text-purple-100 mb-2">무의식의 메아리</h3>
                      <p className="text-sm tracking-[0.2em] text-purple-400/60 uppercase">Dream Reflection</p>
                    </div>
                    <div className="glass-panel rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                      <p className="text-xl md:text-3xl font-serif text-slate-200 leading-relaxed italic">
                        "{resultData.reflection}"
                      </p>
                    </div>
                  </motion.div>

                  {/* Key Symbols */}
                  {resultData.symbols && resultData.symbols.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 1 }}
                      className="relative"
                    >
                      <div className="flex flex-col items-center text-center mb-10">
                        <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                          <Key className="w-8 h-8 text-blue-300" />
                        </div>
                        <h3 className="text-3xl font-serif text-blue-100 mb-2">꿈의 열쇠</h3>
                        <p className="text-sm tracking-[0.2em] text-blue-400/60 uppercase">Key Symbols</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {resultData.symbols.map((symbol, idx) => (
                          <div key={idx} className="glass-panel rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/5 transition-colors group">
                            <div className="w-12 h-12 rounded-full bg-blue-900/50 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                              <Sparkles className="w-5 h-5 text-blue-300" />
                            </div>
                            <h4 className="text-xl font-serif text-purple-200 mb-3">{symbol.name}</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">{symbol.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Personal Insight */}
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1 }}
                    className="relative"
                  >
                    <div className="flex flex-col items-center text-center mb-8">
                      <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <Compass className="w-8 h-8 text-emerald-300" />
                      </div>
                      <h3 className="text-3xl font-serif text-emerald-100 mb-2">감정적 통찰</h3>
                      <p className="text-sm tracking-[0.2em] text-emerald-400/60 uppercase">Emotional Insight</p>
                    </div>
                    <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                      <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-serif text-center">
                        {resultData.emotionalInsight}
                      </p>
                    </div>
                  </motion.div>

                  {/* Dream Constellation */}
                  {resultData.symbols && resultData.symbols.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 1 }}
                      className="relative pt-12"
                    >
                      <div className="flex flex-col items-center text-center mb-8">
                        <h3 className="text-3xl font-serif text-purple-100 mb-2">당신의 꿈자리</h3>
                        <p className="text-sm tracking-[0.2em] text-purple-400/60 uppercase">Your Dream Constellation</p>
                        <p className="text-xs text-slate-500 mt-4">Everything is connected. Your subconscious is a universe.</p>
                      </div>
                      <DreamConstellation symbols={resultData.symbols} />
                    </motion.div>
                  )}
                </div>
              )}

              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-12 pb-24 flex justify-center"
              >
                <button
                  onClick={reset}
                  className="px-10 py-4 border border-purple-500/50 rounded-full text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 transition-all tracking-widest text-sm cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                >
                  다른 꿈 해몽하기
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {page === 'symbols' && <SymbolsPage key="symbols" />}
        {page === 'journal' && <JournalPage key="journal" />}
      </AnimatePresence>
    </div>
  );
}
