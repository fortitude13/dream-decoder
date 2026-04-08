import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ChevronDown, Search, Trash2, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import FloatingHeroImage from '../components/FloatingHeroImage';

interface SavedDream {
  id: string;
  date: string;
  dreamText: string;
  reflection: string;
  summary: string;
  oneLiner: string;
  emotionalInsight: string;
  symbols: { name: string; meaning: string }[];
  imageUrl?: string;
}

export default function JournalPage() {
  const [journal, setJournal] = useState<SavedDream[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('dream_journal');
    if (saved) {
      setJournal(JSON.parse(saved));
    } else {
      // Example data for first-time users
      const examples: SavedDream[] = [
        {
          id: 'ex1',
          date: '2026-03-30',
          dreamText: '거대한 고래를 타고 밤하늘을 날아다니는 꿈을 꿨어요. 별들이 손에 닿을 듯 가까웠고 기분이 아주 평온했습니다.',
          summary: '자유와 정신적 성장을 상징하는 꿈',
          oneLiner: '내면의 평화와 새로운 가능성을 향한 비행',
          emotionalInsight: '현재 삶에서 느끼는 압박감에서 벗어나 진정한 자유를 갈망하고 있음을 나타냅니다.',
          reflection: '밤하늘의 고래는 당신의 무의식이 품은 거대한 지혜와 평온을 상징합니다.',
          symbols: [{ name: '고래', meaning: '거대한 지혜와 무의식의 힘' }, { name: '비행', meaning: '자유와 관점의 변화' }]
        },
        {
          id: 'ex2',
          date: '2026-03-29',
          dreamText: '끝이 없는 도서관에서 길을 잃었어요. 책장들이 계속 움직이고 있었고 어떤 책을 찾아야 할지 몰라 당황했습니다.',
          summary: '지식에 대한 갈구와 선택의 기로',
          oneLiner: '수많은 정보 속에서 나만의 답을 찾는 과정',
          emotionalInsight: '결정해야 할 중요한 문제 앞에서 정보 과부하로 인한 불안감을 느끼고 있을 수 있습니다.',
          reflection: '무한한 책장은 당신이 마주한 수많은 선택지와 그로 인한 혼란을 투영합니다.',
          symbols: [{ name: '도서관', meaning: '지식, 기억, 무의식의 저장소' }, { name: '길을 잃음', meaning: '목표 상실 또는 혼란' }]
        }
      ];
      setJournal(examples);
    }
  }, []);

  const deleteDream = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = journal.filter(d => d.id !== id);
    setJournal(updated);
    localStorage.setItem('dream_journal', JSON.stringify(updated));
  };

  const handleShare = async (entry: SavedDream, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dream Decoder',
          text: `내 꿈의 해몽: "${entry.oneLiner}"`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다.');
    }
  };

  const filteredJournal = journal.filter(d => 
    d.dreamText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.oneLiner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute inset-0 z-10 overflow-y-auto py-24 px-6 pb-32"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        <FloatingHeroImage 
          src="https://postfiles.pstatic.net/MjAyNjAzMTRfMjAx/MDAxNzczNDk3NzY2Mzk4.-JsPqvqeXi3-K40Dvw_yFvbeVqf0DW32-RD_jhdAt_cg.igUtPWOZF_4UtPiV_6UZcqir-yPYMy1fxNMEqHZUDRcg.PNG/pen.png?type=w966"
          alt="Dream Journal"
          glowColorClass="bg-purple-500"
          shadowColor="rgba(168,85,247,0.4)"
        />

        <h2 className="text-4xl font-serif text-center mb-12 text-gradient">꿈 기록장</h2>

        <div className="w-full max-w-md mb-12 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="꿈의 내용을 검색해보세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
          />
        </div>
        
        {filteredJournal.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 font-serif italic">기록된 꿈이 없습니다. 당신의 밤을 기록해보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 w-full">
            {filteredJournal.map(entry => (
              <div key={entry.id} className="glass-panel rounded-3xl overflow-hidden border border-purple-500/20 group">
                <div 
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  className="p-6 cursor-pointer hover:bg-white/5 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center"
                >
                  {entry.imageUrl && (
                    <div className="w-full md:w-24 aspect-square rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                      <img src={entry.imageUrl} alt="Dream" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 text-purple-400/70 text-xs mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{entry.date}</span>
                    </div>
                    <h3 className="text-xl font-serif text-purple-100 mb-2">"{entry.oneLiner}"</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">{entry.dreamText}</p>
                  </div>
                  <div className="flex items-center gap-4 self-end md:self-center">
                    <button 
                      onClick={(e) => handleShare(entry, e)}
                      className="p-2 text-slate-600 hover:text-purple-400 transition-colors"
                      title="공유하기"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => deleteDream(entry.id, e)}
                      className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                      title="삭제하기"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronDown className={`w-5 h-5 text-purple-500 transition-transform ${expandedId === entry.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedId === entry.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-black/40 border-t border-purple-500/20"
                    >
                      <div className="p-8 space-y-8">
                        <div className="space-y-4">
                          <h4 className="text-xs tracking-[0.2em] text-purple-400 uppercase">AI Interpretation</h4>
                          <p className="text-lg font-serif text-slate-200 leading-relaxed italic">"{entry.reflection}"</p>
                          <p className="text-slate-400 leading-relaxed">{entry.emotionalInsight}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {entry.symbols.map((s, i) => (
                            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                              <span className="text-purple-300 font-serif block mb-1">{s.name}</span>
                              <span className="text-xs text-slate-500">{s.meaning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
