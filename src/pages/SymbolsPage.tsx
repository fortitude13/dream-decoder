import React, { useState } from 'react';
import { motion } from 'motion/react';
import FloatingHeroImage from '../components/FloatingHeroImage';

const SYMBOL_CATEGORIES = [
  { name: '동물', symbols: [
    { name: '고양이', meaning: '직감, 독립성, 숨겨진 여성성', example: '검은 고양이가 길을 안내하는 꿈' },
    { name: '뱀', meaning: '치유, 변화, 혹은 숨겨진 위협', example: '허물을 벗는 뱀을 지켜보는 꿈' },
    { name: '새', meaning: '자유, 이상, 새로운 소식', example: '창가에 앉은 파랑새가 노래하는 꿈' }
  ]},
  { name: '자연', symbols: [
    { name: '물', meaning: '감정과 무의식의 상태. 맑은 물은 평온을, 탁한 물은 혼란을 의미합니다.', example: '끝이 보이지 않는 맑은 바다를 수영하는 꿈' },
    { name: '불', meaning: '열정, 파괴, 그리고 정화. 새로운 시작을 위한 에너지를 상징하기도 합니다.', example: '오래된 건물이 불타오르는 것을 멀리서 지켜보는 꿈' },
    { name: '숲', meaning: '미지의 세계, 무의식의 깊은 곳. 탐험해야 할 내면의 영역을 나타냅니다.', example: '안개 낀 숲속에서 빛나는 길을 따라 걷는 꿈' }
  ]},
  { name: '행동', symbols: [
    { name: '비행', meaning: '자유와 해방, 억압으로부터의 탈출. 높은 관점에서 상황을 바라보는 능력을 의미합니다.', example: '도시 위를 자유롭게 날아다니며 아래를 내려다보는 꿈' },
    { name: '추락', meaning: '불안과 통제 상실, 실패에 대한 두려움. 현재 삶의 기반이 흔들리고 있음을 암시합니다.', example: '끝이 없는 어둠 속으로 계속해서 떨어지는 꿈' },
    { name: '달리기', meaning: '목표를 향한 갈망 또는 무언가로부터의 도피. 에너지가 한 방향으로 집중됨을 나타냅니다.', example: '누군가에게 쫓기며 필사적으로 숲을 달리는 꿈' }
  ]},
  { name: '장소', symbols: [
    { name: '미로', meaning: '혼란, 삶의 방향성 상실. 해결해야 할 복잡한 문제나 내면의 갈등을 상징합니다.', example: '거대한 도서관이 미로처럼 변해 출구를 찾는 꿈' },
    { name: '집', meaning: '자신의 자아, 내면의 상태. 각 방은 성격의 서로 다른 측면을 나타냅니다.', example: '어릴 적 살던 집의 지하실에서 새로운 방을 발견하는 꿈' },
    { name: '학교', meaning: '배움, 평가에 대한 압박감. 사회적 기준에 부합하려는 노력이나 스트레스를 의미합니다.', example: '준비하지 못한 시험을 치르며 당황하는 꿈' }
  ]},
];

export default function SymbolsPage() {
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredCategories = activeCategory === 'All' 
    ? SYMBOL_CATEGORIES 
    : SYMBOL_CATEGORIES.filter(cat => cat.name === activeCategory);

  const categories = ['All', ...SYMBOL_CATEGORIES.map(cat => cat.name)];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute inset-0 z-10 overflow-y-auto py-24 px-6 pb-32 custom-scrollbar"
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        
        <FloatingHeroImage 
          src="https://postfiles.pstatic.net/MjAyNjAzMTRfNTUg/MDAxNzczNDk2NTc3NTA1.iGy5Fv8BDePssnXO0CUf3Dd0I6bJGOkPDO7foEjlaiAg.6Ifi8O8gI1Fi2i53Z40hailu-U4_Z51hPHn4NutWqCgg.PNG/book.png?type=w966"
          alt="Dream Symbols"
          glowColorClass="bg-blue-500"
          shadowColor="rgba(59,130,246,0.4)"
        />

        <h2 className="text-4xl font-serif text-center mb-8 text-gradient">꿈의 상징 사전</h2>
        
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-xs tracking-widest uppercase transition-all border ${
                activeCategory === cat
                  ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-16 w-full">
          {filteredCategories.map(category => (
            <div key={category.name}>
              <div className="flex justify-between items-end mb-6 border-b border-purple-500/20 pb-2">
                <h3 className="text-2xl font-serif text-purple-200">{category.name}</h3>
                <span className="text-[10px] tracking-[0.2em] text-slate-500 uppercase mb-1">
                  {category.symbols.length} Symbols
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {category.symbols.map(symbol => (
                  <div 
                    key={symbol.name}
                    onClick={() => setExpandedSymbol(expandedSymbol === symbol.name ? null : symbol.name)}
                    className="glass-panel p-6 rounded-2xl cursor-pointer hover:border-purple-400/50 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h4 className="text-xl font-medium text-purple-100 mb-2">{symbol.name}</h4>
                    <motion.div 
                      initial={false}
                      animate={{ height: expandedSymbol === symbol.name ? 'auto' : 0, opacity: expandedSymbol === symbol.name ? 1 : 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-slate-300 mt-4 text-sm leading-relaxed">{symbol.meaning}</p>
                      
                      <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] tracking-[0.1em] text-purple-400 uppercase mb-2">Real Example</p>
                        <p className="text-xs text-slate-400 italic">"{symbol.example}"</p>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navigation logic would go here
                        }}
                        className="mt-6 text-[10px] tracking-[0.2em] text-purple-400 hover:text-purple-300 transition-colors uppercase border-b border-purple-500/20 pb-1"
                      >
                        Search in my dreams
                      </button>
                    </motion.div>
                    {expandedSymbol !== symbol.name && (
                      <p className="text-xs text-purple-400/50 mt-4 tracking-widest uppercase">의미 보기</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
