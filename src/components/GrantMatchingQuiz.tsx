import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, ArrowRight, ArrowLeft, RefreshCw, Layers, Award, Target, BookOpen, CheckSquare, Heart } from 'lucide-react';

interface GrantMatchingQuizProps {
  lang: 'sw' | 'en';
  onInterestsSaved: (interests: string[]) => void;
  initialInterests?: string[];
}

interface QuizOption {
  id: string;
  tag: string;
  textEn: string;
  textSw: string;
  icon: React.ReactNode;
}

interface QuizQuestion {
  id: number;
  titleEn: string;
  titleSw: string;
  subtitleEn: string;
  subtitleSw: string;
  multiple: boolean;
  options: QuizOption[];
}

export default function GrantMatchingQuiz({
  lang,
  onInterestsSaved,
  initialInterests = []
}: GrantMatchingQuizProps) {
  const isEn = lang === 'en';
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = welcome, 1 = Q1, 2 = Q2, 3 = Q3, 4 = completed
  const [selectedTags, setSelectedTags] = useState<string[]>(initialInterests);
  
  // Keep local copy synced with prop
  useEffect(() => {
    if (initialInterests && initialInterests.length > 0) {
      setSelectedTags(initialInterests);
    }
  }, [initialInterests]);

  const questions: QuizQuestion[] = [
    {
      id: 1,
      titleEn: "What is your primary industry/sector?",
      titleSw: "Sekta yako kuu ya biashara ni ipi?",
      subtitleEn: "Select one or more sectors you operate in",
      subtitleSw: "Chagua sekta moja au zaidi unayojishughulisha nayo",
      multiple: true,
      options: [
        {
          id: 'q1-1',
          tag: 'Agriculture',
          textEn: "🌾 Agriculture or Farming",
          textSw: "🌾 Kilimo, Uzalishaji au Ufugaji",
          icon: <Layers className="h-4 w-4" />
        },
        {
          id: 'q1-2',
          tag: 'Tech',
          textEn: "💻 Tech, Software & Apps",
          textSw: "💻 Teknolojia, Apps na Mifumo",
          icon: <Sparkles className="h-4 w-4" />
        },
        {
          id: 'q1-3',
          tag: 'Education',
          textEn: "🎓 Education, Training or Academy",
          textSw: "🎓 Elimu, Mafunzo au Chuo",
          icon: <BookOpen className="h-4 w-4" />
        },
        {
          id: 'q1-4',
          tag: 'Healthcare',
          textEn: "🏥 Healthcare & BioTech",
          textSw: "🏥 Huduma za Afya na Tiba",
          icon: <Heart className="h-4 w-4" />
        }
      ]
    },
    {
      id: 2,
      titleEn: "Who is the primary founder / target demographic?",
      titleSw: "Mwanzilishi mkuu au kundi walengwa ni kina nani?",
      subtitleEn: "Select demographic focal points",
      subtitleSw: "Chagua makundi yanayolengwa na mradi/biashara yako",
      multiple: true,
      options: [
        {
          id: 'q2-1',
          tag: 'Women',
          textEn: "👩‍💼 Women-led / Female focused",
          textSw: "👩‍💼 Biashara inayoongozwa na Wanawake",
          icon: <Award className="h-4 w-4" />
        },
        {
          id: 'q2-2',
          tag: 'Youth',
          textEn: "🧑‍💻 Youth-led (Under 35 years)",
          textSw: "🧑‍💻 Inayoongozwa na Vijana (Chini ya miaka 35)",
          icon: <Target className="h-4 w-4" />
        }
      ]
    }
  ];

  const handleStartQuiz = () => {
    setSelectedTags([]);
    setCurrentStep(1);
  };

  const toggleOption = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completed!
      onInterestsSaved(selectedTags);
      setCurrentStep(questions.length + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setCurrentStep(0);
    }
  };

  const handleReset = () => {
    setSelectedTags([]);
    onInterestsSaved([]);
    setCurrentStep(0);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5 sm:p-6 max-w-2xl mx-auto overflow-hidden relative">
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-center py-4"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-stone-900 font-display">
                {isEn ? "🎯 Smart Grant-Matching Quiz" : "🎯 Dodoso la Kulinganisha Ruzuku"}
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                {isEn 
                  ? "Take a quick 35-second quiz to define your business interests (e.g., Agriculture, Tech). We will instantly tag your profile and prioritize relevant grants at the top of your feed!"
                  : "Chukua dodoso fupi la sekunde 35 ili kuainisha malengo ya biashara yako (mf. Kilimo, Teknolojia). Tutapanga na kuweka ruzuku zinazokufaa kabisa juu ya mtiririko wako!"
                }
              </p>
            </div>

            {selectedTags.length > 0 ? (
              <div className="space-y-2 pt-2">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  {isEn ? "Your Matched Interests" : "Sekta Zako Zilizoainishwa"}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 pb-2">
                  {selectedTags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-250 animate-fade-in">
                      {tag === 'Agriculture' ? (isEn ? '🌾 Agriculture' : '🌾 Kilimo') :
                       tag === 'Tech' ? (isEn ? '💻 Tech & Digital' : '💻 Teknolojia') :
                       tag === 'Education' ? (isEn ? '🎓 Education' : '🎓 Elimu/Chuo') :
                       tag === 'Healthcare' ? (isEn ? '🏥 Healthcare' : '🏥 Sayansi ya Afya') :
                       tag === 'Women' ? (isEn ? '👩‍💼 Women-Led' : '👩‍💼 Wanawake') :
                       tag === 'Youth' ? (isEn ? '🧑‍💻 Youth-Led' : '🧑‍💻 Vijana') : tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={handleStartQuiz}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-semibold cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{isEn ? "Retake Quiz" : "Rudia Dodoso"}</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                  >
                    {isEn ? "Clear Tags" : "Futa Lebo"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleStartQuiz}
                className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                <span>{isEn ? "Start Matching" : "Anza Dodoso la Fursa"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        )}

        {currentStep > 0 && currentStep <= questions.length && (
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Header progress info */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                {isEn ? "Evaluation Wizard" : "Mchawi wa Tathmini"}
              </span>
              <span className="text-stone-405 text-xs font-bold font-mono">
                {isEn ? `Step ${currentStep} of ${questions.length}` : `Hatua ${currentStep} ya ${questions.length}`}
              </span>
            </div>

            {/* Question title */}
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-stone-900 font-display">
                {isEn ? questions[currentStep - 1].titleEn : questions[currentStep - 1].titleSw}
              </h3>
              <p className="text-xs text-stone-500">
                {isEn ? questions[currentStep - 1].subtitleEn : questions[currentStep - 1].subtitleSw}
              </p>
            </div>

            {/* List of select options */}
            <div className="grid gap-2.5 py-1">
              {questions[currentStep - 1].options.map((opt) => {
                const isSelected = selectedTags.includes(opt.tag);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleOption(opt.tag)}
                    className={`flex items-center justify-between p-4 rounded-xl border text-left text-xs transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/10 font-bold text-stone-900'
                        : 'border-stone-200 bg-stone-50/30 hover:bg-stone-50 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-lg border ${
                        isSelected 
                          ? 'bg-emerald-500 text-white border-emerald-500' 
                          : 'bg-white text-stone-500 border-stone-200'
                      }`}>
                        {opt.icon}
                      </div>
                      <span>{isEn ? opt.textEn : opt.textSw}</span>
                    </div>

                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'bg-white border-stone-300 text-transparent'
                    }`}>
                      <Check className="h-3 w-3" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Actions block footer */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center space-x-1.5 text-stone-500 hover:text-stone-850 px-3 py-2 text-xs font-bold cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{isEn ? "Back" : "Rudi"}</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl px-5 py-2.5 text-xs font-extrabold tracking-wide transition-all shadow-sm cursor-pointer"
              >
                <span>{currentStep === questions.length ? (isEn ? "Save Results & View" : "Hifadhi Matokeo") : (isEn ? "Continue" : "Endelea")}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep > questions.length && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 text-center py-4"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-250">
              <Check className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-stone-900 font-display">
                {isEn ? "🎉 Profile Aligned & Matched!" : "🎉 Profaili Yako Imesasishwa!"}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                {isEn
                  ? "Your selected interest categories have been successfully linked to your device profile. We have filtered and highlighted highly matching grants at the top of your feed!"
                  : "Makataa na masuala unayopendelea yamehifadhiwa sasa kwenye wasifu wako. Tumepanga na kupandisha ruzuku zinazokufaa juu kabisa ya kurasa ya ruzuku!"
                }
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 py-1">
              {selectedTags.map(tag => (
                <span key={tag} className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {tag === 'Agriculture' ? (isEn ? '🌾 Agriculture' : '🌾 Kilimo') :
                   tag === 'Tech' ? (isEn ? '💻 Tech' : '💻 Teknolojia') :
                   tag === 'Education' ? (isEn ? '🎓 Education' : '🎓 Elimu') :
                   tag === 'Healthcare' ? (isEn ? '🏥 Healthcare' : '🏥 Sayansi ya Afya') :
                   tag === 'Women' ? (isEn ? '👩‍💼 Women-Led' : '👩‍💼 Wanawake') :
                   tag === 'Youth' ? (isEn ? '🧑‍💻 Youth-Led' : '🧑‍💻 Vijana') : tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(0)}
                className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-bold cursor-pointer"
              >
                {isEn ? "Back to Start" : "Rudi Mwanzo"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  // Scroll directly to grants or trigger redirect
                  const feedEl = document.getElementById('grants-view-destination') || document.getElementById('opp-list-section');
                  if (feedEl) {
                    feedEl.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    // Send window event to scroll or switch navigations
                    window.dispatchEvent(new CustomEvent('fundseed_navigate_grants'));
                  }
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold tracking-wide shadow-sm cursor-pointer"
              >
                {isEn ? "View Highlighted Grants 🚀" : "Kagua Ruzuku Zilizooana 🚀"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
