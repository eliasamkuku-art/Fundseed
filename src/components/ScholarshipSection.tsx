import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  Lock, 
  ShieldCheck, 
  Check, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  Award, 
  Compass, 
  FileText, 
  Mail, 
  ArrowRight, 
  GraduationCap, 
  LockKeyhole, 
  MessageSquare,
  Bookmark,
  CheckCircle2,
  HelpCircle,
  Clock,
  ArrowUpRight,
  MapPin,
  RefreshCw,
  Activity
} from 'lucide-react';
import { SkeletonCard, SkeletonPremiumCard } from './SkeletonCard';
import { 
  tanzanianScholars, 
  scholarshipBenefits,
} from '../scholarshipsData';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';

interface ScholarshipSectionProps {
  isPaid: boolean;
  onUnlockPremium: () => void;
  checkoutRef: React.RefObject<HTMLDivElement>;
  onGoToHome?: () => void;
  onGoToCheckout?: () => void;
  onGoToSmartDraft?: () => void;
  lang?: 'sw' | 'en';
}

export default function ScholarshipSection({ isPaid, onUnlockPremium, checkoutRef, onGoToHome, onGoToCheckout, onGoToSmartDraft, lang = 'sw' }: ScholarshipSectionProps) {
  const isEn = lang === 'en';
  // Navigation sliding index for Tanzanian Scholars Carousel
  const [activeSlide, setActiveSlide] = useState(0);

  // Search & Filtering for Premium Scholarship databases
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState('zote');

  // Interactive AI Matcher form state
  const [academicLevel, setAcademicLevel] = useState('masters');
  const [course, setCourse] = useState('');
  const [countryOfInterest, setCountryOfInterest] = useState('Uingereza (UK)');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Firestore Opportunities Data
  const [allOpps, setAllOpps] = useState<any[]>([]);
  const [isLoadingOpps, setIsLoadingOpps] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'opportunities'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const opps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllOpps(opps);
      setIsLoadingOpps(false);
    }, (error) => {
      console.error("ScholarshipSection onSnapshot error:", error);
      setIsLoadingOpps(false);
    });

    return () => unsubscribe();
  }, []);

  const freeFeaturedScholarships = allOpps.filter(o => o.isFeatured);
  const premiumScholarshipDatabases = allOpps.filter(o => o.isPremium);

  // Success Kit Tab and Checklists
  const [successKitTab, setSuccessKitTab] = useState<'sop' | 'lor' | 'cv'>('sop');
  const [sopChecked, setSopChecked] = useState<Record<string, boolean>>({
    hook: false,
    academicConnection: false,
    tzImpact: false,
    futureGoals: false,
  });
  const [lorChecked, setLorChecked] = useState<Record<string, boolean>>({
    earlyRequest: false,
    bragSheet: false,
    academicReference: false,
    professionalReference: false,
  });
  const [cvChecked, setCvChecked] = useState<Record<string, boolean>>({
    noInfographics: false,
    actionVerbs: false,
    impactCentered: false,
    contactInfo: false,
  });

  // Auto scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % tanzanianScholars.length);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % tanzanianScholars.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + tanzanianScholars.length) % tanzanianScholars.length);
  };

  // Basic custom markdown formatter to display output nicely on a page
  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // heading
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-xl sm:text-2xl font-black text-white border-b border-zinc-805 pb-2 mt-6 mb-3 font-display">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-base sm:text-lg font-bold text-emerald-400 mt-5 mb-2 font-display">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-xs sm:text-sm font-bold text-emerald-350 mt-4 mb-2 font-display">{line.substring(4)}</h3>;
      }
      // list
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx} className="ml-4 list-disc text-stone-300 py-0.5 leading-relaxed">{line.substring(2)}</li>;
      }
      if (line.match(/^\d+\.\s/)) {
        return <li key={idx} className="ml-4 list-decimal text-stone-300 py-0.5 leading-relaxed">{line.replace(/^\d+\.\s/, '')}</li>;
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }
      
      return <p key={idx} className="text-stone-300 leading-relaxed py-0.5">{line}</p>;
    });
  };

  // Run a smart, real-time AI recommendation matching based on selected criteria
  const handleAIMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course.trim()) return;

    setAiGenerating(true);
    setAiResult(null);
    setAiError(null);

    try {
      const response = await fetch('/api/scholarships/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          academicLevel,
          course: course.trim(),
          countryOfInterest,
        }),
      });

      if (!response.ok) {
        throw new Error('Imeshindwa kuunganisha na seva. Tafadhali jaribu tena baada ya muda kidogo.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setAiResult(data.result);
    } catch (err: any) {
      console.error('Scholarship AI Match error:', err);
      setAiError(err.message || 'Hitilafu ya kiufundi imetokea wakati wa usindikaji.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Filter premium database entries
  const filteredDB = premiumScholarshipDatabases.filter((dbOpp) => {
    const matchesSearch = dbOpp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          dbOpp.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dbOpp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScope = scopeFilter === 'zote' || 
                         (scopeFilter === 'government' && dbOpp.origin === 'Tanzania') ||
                         (scopeFilter === 'foundation' && dbOpp.origin === 'Duniani');
    return matchesSearch && matchesScope;
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSuccess(false), 8000);
    }
  };

  const handleScrollToCheckout = () => {
    if (onGoToCheckout) {
      onGoToCheckout();
    } else if (checkoutRef && checkoutRef.current) {
      checkoutRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      onUnlockPremium();
    }
  };

  return (
    <section id="scholarships" className="py-12 sm:py-20 bg-stone-50 border-b border-stone-200 scroll-mt-20 min-h-[70vh]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Back Link to Homepage */}
        {onGoToHome && (
          <div className="max-w-5xl mx-auto flex items-center justify-start">
            <button 
              onClick={onGoToHome}
              className="inline-flex items-center space-x-2 text-xs font-bold text-stone-600 hover:text-emerald-700 bg-white border border-stone-200 hover:border-emerald-500/30 px-3.5 py-2 rounded-xl transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>{isEn ? "← Back to Home" : "← Rejea Nyumbani"}</span>
            </button>
          </div>
        )}

        {/* 1. Header Section */}
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <GraduationCap className="h-3.5 w-3.5 text-emerald-700" />
            <span>FundSeed Academy</span>
          </div>
          <h2 className="text-3xl font-black text-stone-950 font-display sm:text-5xl tracking-tight leading-tight">
            {isEn ? "International Scholarships Hub" : "Fursa za Masomo Duniani"}
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {isEn 
              ? "We help talented youth with dreams of studying abroad (Masters, PhD, or research). We do the extra work of finding guaranteed scholarships so students don't waste time and money on fake applications or scams."
              : "Tunasaidia vijana wenye vipaji na ndoto za kusoma nje ya nchi (Masters, PhD, au tafiti). Tunafanya kazi ya ziada ya kutafuta scholarship za uhakika ili mwanafunzi asipoteze muda na pesa kwenye maombi ya uongo au scams."}
          </p>
        </div>

        {/* 2. Important Notice - The Trust Marker */}
        <div className="max-w-4xl mx-auto rounded-xl bg-amber-50 border border-amber-200/60 p-5 flex items-start gap-4 shadow-sm">
          <ShieldCheck className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-amber-900 font-display">
              {isEn ? "Vetted Verification & Official Access Links" : "Vithibitisho vya Uaminifu na Uhakika"}
            </h4>
            <p className="text-amber-800 text-xs leading-relaxed">
              {isEn
                ? "We stand for absolute transparency. All scholarship links direct you straight to official governmental (.gov), educational (.edu), or verified institute (.org) portals, securing you against online predatory scholarship scams."
                : "Tunasimamia maadili na usalama wako. Fursa zote kamilifu hapa chini zinapelekwa pekee kwenye wavuti rasmi zenye viambatanisho vya mamlaka ya serikali husika au taasisi huru zinazoheshimika ulimwenguni."}
            </p>
          </div>
        </div>

        {/* 3. Featured Free Scholarships */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-5xl mx-auto border-b border-stone-200 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-stone-900 font-display">
                {isEn ? "Featured Global Scholarships" : "Mipango Mashuhuri Iliyothibitishwa"}
              </h3>
              <p className="text-stone-500 text-xs">
                {isEn ? "Highly accredited international opportunities available on our free tier" : "Ufadhili mkuu kuanza nao safari yako ya masomo ya kimataifa bila malipo"}
              </p>
            </div>
            <span className="text-[11px] bg-stone-200/75 text-stone-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {isEn ? "Free Access" : "Ufikiaji wa Bure"}
            </span>
          </div>

                <div className="grid gap-6 sm:grid-cols-2 max-w-5xl mx-auto w-full">
                  {isLoadingOpps ? (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                  ) : freeFeaturedScholarships.map((sch, index) => (
                    <motion.div
                      key={sch.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  opacity: { duration: 0.4 },
                  y: { type: 'spring', stiffness: 100, damping: 15 },
                  delay: Math.min(index * 0.08, 0.45)
                }}
                whileHover={{ 
                  y: -6,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(16, 185, 129, 0.18)"
                }}
                className="rounded-3xl border border-stone-100 bg-white p-8 justify-between flex flex-col gap-8 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-900/5"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                      {sch.category}
                    </span>
                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                      sch.status === 'Wazi' ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-600'
                    }`}>
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{sch.status}</span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-stone-950 font-display leading-tight">{sch.title}</h4>
                    <p className="text-sm text-stone-500 font-medium">Mtoa Huduma: <span className="text-stone-800">{sch.provider}</span></p>
                  </div>

                  <div className="space-y-3 border-t border-stone-100 pt-5 text-sm">
                    <div className="flex items-start space-x-3">
                      <Award className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-stone-700 font-medium">Ngazi: <span className="text-stone-950 font-bold">{sch.level}</span></p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-stone-700">Gharama: <span className="text-stone-950 font-semibold">{sch.benefits}</span></p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <HelpCircle className="h-5 w-5 text-stone-400 shrink-0 mt-0.5" />
                      <p className="text-stone-600 leading-relaxed">Sifa: {sch.eligibility}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-6 flex items-center justify-between gap-4">
                  <span className="text-xs text-stone-400 font-semibold truncate">{sch.deadlineInfo}</span>
                  <a
                    href={sch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 rounded-xl bg-stone-950 hover:bg-emerald-600 text-white text-xs font-bold px-5 py-3 transition-all shadow-md shrink-0 h-[48px]"
                  >
                    <span>Tovuti Rasmi</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 4. Paywall Gate for Premium Major 50+ list & AI Matcher */}
        <div className="border-t border-stone-200/80 pt-16">
          {!isPaid ? (
            /* LOCKED STATE */
            <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden min-h-[480px] bg-stone-100 border border-stone-200 p-8 flex items-center justify-center">
              
              {/* Premium locked overlay */}
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md z-10 flex flex-col items-center justify-center p-4">
                <div className="rounded-2xl bg-white p-6 sm:p-10 border border-stone-200/90 shadow-2xl max-w-2xl w-full mx-auto space-y-6 text-center animate-fade-in">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                    <LockKeyhole className="h-6 w-6 text-amber-605 animate-pulse" />
                  </div>
                  
                  <div className="space-y-2.5">
                    <h3 className="text-2xl font-black text-stone-950 font-display">
                      {isEn ? "Premium Scholarship Catalog & AI Matcher" : "Hifadhidata ya Scholarships 50+ & AI Matcher"}
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed max-w-xl mx-auto">
                      {isEn
                        ? "Accessing our validated list of over 50+ elite scholarship sites and our custom Scholarship AI Recommendation Engine is reserved exclusively for Premium VIP members."
                        : "Huduma ya kuona kurasa na tovuti thabiti za mashirika na ubalozi 50+ zinazotoa ruzuku za masomo kweli pamoja na zana yetu ya kipekee ya Scholarship AI Matching Tool imehifadhiwa kwa wateja wa Premium pekee."}
                    </p>
                    <p className="text-xs text-stone-500 font-medium max-w-lg mx-auto">
                      {isEn
                        ? "Process a one-time 20,000 TZS registration to unlock these tools, receive expert SOP drafting guidelines, and join our private VIP community group."
                        : "Lipia ada ya mara moja ya TZS 20,000 kupata huduma hii ya kipekee, usaidizi wa kitaalamu wa maombi ya masomo, na kujiunga na kikundi maalum cha siri cha WhatsApp cha VIP kwa usaidizi vya karibu!"}
                    </p>
                  </div>

                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-left space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>{isEn ? "Premium VIP Gateway Benefits (20,000 TZS):" : "Fungua Milango hii ya Premium kwa TZS 20,000 pekee:"}</span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600">
                      <li className="flex items-center space-x-1.5">
                        <span className="text-emerald-500 font-black">Hapa:</span>
                        <span>{isEn ? "50+ Global Portfolios" : "Orodha ya vyombo 50+"}</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <span className="text-emerald-500 font-black">Hapa:</span>
                        <span>{isEn ? "Scholarship AI Recommendation Engine" : "AI Search Matcher"}</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <span className="text-emerald-500 font-black">Hapa:</span>
                        <span>{isEn ? "Expert SOP & CV Guidelines" : "SOP na CV Templates"}</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <span className="text-emerald-500 font-black">Hapa:</span>
                        <span>{isEn ? "Direct WhatsApp VIP Group Channel" : "WhatsApp VIP Group Link"}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleScrollToCheckout}
                      className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-4 shadow-md transition-all flex items-center justify-center space-x-2 shrink-0"
                    >
                      <span>{isEn ? "Activate VIP Access" : "Fungua sasa (TZS 20,000)"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={onUnlockPremium}
                      className="w-full sm:w-auto rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 text-xs font-bold px-5 py-4 transition-all"
                    >
                      Sandbox: Bypass (Jaribu Kwanza)
                    </button>
                  </div>
                </div>
              </div>

              {/* Blurred database sneak peek layout */}
              <div className="w-full h-full blur-[4px] select-none pointer-events-none opacity-30 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-stone-200">
                  <div className="h-6 w-48 bg-stone-300 rounded" />
                  <div className="h-8 w-24 bg-stone-300 rounded" />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-white rounded-xl p-4 border border-stone-200 space-y-3">
                      <div className="h-4 w-2/3 bg-stone-300 rounded" />
                      <div className="h-3 w-1/2 bg-stone-300 rounded" />
                      <div className="h-8 w-full bg-stone-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* UNLOCKED PREMIUM EXPERIENCE */
            <div className="max-w-5xl mx-auto space-y-16 animate-fade-in">
              
              {/* Database Section */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 font-display flex items-center space-x-2">
                      <Award className="h-5 w-5 text-emerald-600" />
                      <span>Hifadhidata ya Majukwaa 50+ ya Scholarships</span>
                    </h3>
                    <p className="text-stone-500 text-xs">Vyanzo barabara vingi vya unadhili rasmi kwa raia wa Afrika mashariki</p>
                  </div>
                  
                  {/* Scope filter */}
                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-stone-400 shrink-0" />
                    <select
                      value={scopeFilter}
                      onChange={(e) => setScopeFilter(e.target.value)}
                      className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="zote">Chuja Aina zote</option>
                      <option value="government">Siri za Serikali</option>
                      <option value="foundation">Private Foundations</option>
                    </select>
                  </div>
                </div>

                {/* Search field */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Tafuta jina la chuo, nchi au shirika..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white pl-9 pr-4 py-2 text-xs text-stone-900 focus:border-emerald-600 focus:outline-none placeholder-stone-400"
                  />
                </div>

                {/* Grid */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {isLoadingOpps ? (
                    <>
                      <SkeletonPremiumCard />
                      <SkeletonPremiumCard />
                      <SkeletonPremiumCard />
                    </>
                  ) : filteredDB.length > 0 ? (
                    filteredDB.map((dbOpp) => (
                      <motion.div 
                        key={dbOpp.id}
                        whileHover={{ 
                          y: -5,
                          boxShadow: "0 15px 25px -5px rgba(0, 0, 0, 0.07), 0 8px 10px -6px rgba(0, 0, 0, 0.02), 0 0 0 1px rgba(16, 185, 129, 0.12)"
                        }}
                        className="rounded-xl border border-stone-200 bg-white p-5 flex flex-col justify-between transition-colors duration-200 hover:border-emerald-500/30"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                             <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                              {dbOpp.provider}
                            </span>
                            <Bookmark className="h-4 w-4 text-stone-300" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-stone-900 leading-tight">{dbOpp.title}</h4>
                            <p className="text-[10px] text-stone-400 mt-0.5">Wigo: {dbOpp.eligibility?.join(', ') || 'Global'}</p>
                          </div>
                          <p className="text-stone-605 text-[11px] leading-relaxed line-clamp-3">
                            {dbOpp.description}
                          </p>
                        </div>

                        <div className="border-t border-stone-100 pt-3.5 mt-4 flex items-center justify-between gap-2">
                          <span className="text-[9px] text-stone-400 font-medium truncate">{dbOpp.origin}</span>
                          <a
                            href={dbOpp.link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold shrink-0 flex items-center gap-0.5"
                          >
                            <span>Fungua</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full rounded-xl border border-dashed border-stone-200 p-8 text-center text-stone-400 text-xs">
                      Hakuna jukwaa linaloendana na utafiti wako. Jaribu neno lingine.
                    </div>
                  )}
                </div>
              </div>

              {/* AI matching tool section */}
              <div className="rounded-2xl border border-stone-200 bg-zinc-950 text-white p-6 sm:p-10 space-y-6">
                <div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-xl font-black font-display tracking-tight text-white">
                      Zana ya Karibu ya Scholarship Matching AI
                    </h3>
                  </div>
                  <p className="text-stone-400 text-xs mt-1">
                    Weka sifa na kozi unayopendelea kusoma ili robot wetu wa AI achuje fursa bora zinazokufaa sasa hivi.
                  </p>
                </div>

                <form onSubmit={handleAIMatch} className="grid gap-4 sm:grid-cols-4 items-end bg-zinc-900 p-5 rounded-xl border border-zinc-800">
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-stone-300">Ngazi yako ya Elimu</label>
                    <select
                      value={academicLevel}
                      onChange={(e) => setAcademicLevel(e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="degree">Bachelor Degree</option>
                      <option value="masters">Masters Degree</option>
                      <option value="phd">PhD Research</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-stone-300">Kozi yako (e.g. Kilimo, IT)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Environmental Science..."
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none placeholder-zinc-650"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-stone-300">Nchi unayopendelea</label>
                    <select
                      value={countryOfInterest}
                      onChange={(e) => setCountryOfInterest(e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Uingereza (UK)">Uingereza (UK)</option>
                      <option value="Marekani (USA)">Marekani (USA)</option>
                      <option value="Ujerumani (Germany)">Ujerumani (Germany)</option>
                      <option value="Sweden (Uswidi)">Sweden (Uswidi)</option>
                      <option value="Canada">Canada</option>
                      <option value="Japan (Japani)">Japan (Japani)</option>
                      <option value="Uturuki (Turkey)">Uturuki (Turkey)</option>
                      <option value="China (Uchina)">China (Uchina)</option>
                      <option value="Urusi (Russia)">Urusi (Russia)</option>
                      <option value="Uswisi (Switzerland)">Uswisi (Switzerland)</option>
                      <option value="Australia">Australia</option>
                      <option value="Nchi yoyote (Global)">Nchi yoyote (Global)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={aiGenerating}
                    className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs py-2.5 transition-all text-center flex items-center justify-center space-x-1.5 disabled:bg-zinc-850"
                  >
                    {aiGenerating ? (
                      <>
                        <span className="animate-spin text-sm">✦</span>
                        <span>Inachuja...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Tafuta na AI</span>
                      </>
                    )}
                  </button>
                </form>

                {aiError && (
                  <div className="rounded-xl border border-red-900/40 bg-red-950/10 p-5 mt-4 text-xs text-red-400">
                    {aiError}
                  </div>
                )}

                {aiResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-emerald-950 bg-emerald-950/10 p-6 mt-4 space-y-4 text-xs select-text text-stone-200"
                  >
                    <div className="leading-relaxed">
                      {renderFormattedMarkdown(aiResult)}
                    </div>
                  </motion.div>
                )}

              </div>
              
              {/* WhatsApp VIP & Assistance Card */}
              <div className="rounded-2xl bg-gradient-to-br from-green-950 to-stone-950 p-6 sm:p-10 border border-green-900 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-[10px] font-bold text-emerald-400 bg-green-900/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Usaidizi wa Karibu na VIP
                  </span>
                  <h4 className="text-xl font-bold font-display text-white">Je, Unaandika Maombi Sasa Hivi?</h4>
                  <p className="text-xs text-stone-300 leading-relaxed max-w-xl">
                    Jiunge na kundi letu rasmi la WhatsApp upate msaada wa masaa 24/7 kutoka kwa washauri kukiwemo mafundisho kila Jumamosi na templates za bure za SOP.
                  </p>
                </div>
                
                <a
                  href="https://chat.whatsapp.com/invite/dummyFundSeedGroup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-6 py-4 shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 border border-green-500"
                >
                  <MessageSquare className="h-4 w-4 text-white" />
                  <span>Jiunge na Kikundi cha WhatsApp</span>
                </a>
              </div>

            </div>
          )}
            {/* 5. Success Gallery: Alumnae Slide Carousel Section (Tanzanian success stories) */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 space-y-8 max-w-5xl mx-auto shadow-sm">
          <div className="text-center sm:text-left space-y-1.5 border-b border-stone-100 pb-5">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Success Gallery (Galari ya Mafanikio)
            </span>
            <h3 className="text-2xl font-extrabold text-stone-900 font-display mt-2">Success Gallery: Watanzania Waliotoboa Ndoto Zao</h3>
            <p className="text-xs text-stone-500">Mashuhuda halisi waliomudu mchakato mzima kupitia mafunzo na mifumo yetu na kupata ufadhili wa masomo duniani</p>
          </div>

          <div className="relative min-h-[300px] flex items-center justify-center overflow-hidden">
            {tanzanianScholars.map((scholar, sIdx) => {
              if (sIdx !== activeSlide) return null;
              
              return (
                <div key={scholar.id} className="grid md:grid-cols-12 gap-8 items-center w-full animate-fade-in select-none">
                  
                  {/* Left: Beautiful Photo representation */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center">
                    <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] max-w-[240px] rounded-2xl overflow-hidden shadow-md border border-stone-200/60 bg-stone-100">
                      {scholar.image ? (
                        <img 
                          src={scholar.image} 
                          alt={scholar.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-4xl font-extrabold ${scholar.avatarColor}`}>
                          {scholar.avatarChar}
                        </div>
                      )}
                      
                      {/* Floating City & Country Badge */}
                      <div className="absolute bottom-3 left-3 right-3 bg-stone-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white flex items-center space-x-1.5 shadow">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="text-[10px] font-bold tracking-wide truncate">{scholar.city}</span>
                      </div>

                      {/* Floating Year badge */}
                      <div className="absolute top-3 right-3 bg-emerald-600 px-2.5 py-1 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider shadow">
                        {scholar.year}
                      </div>
                    </div>
                  </div>

                  {/* Right: Rich Testimony, University, Program Name & Major Details */}
                  <div className="md:col-span-8 space-y-4 text-left">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg sm:text-xl font-extrabold text-stone-900 font-display leading-tight">{scholar.name}</h4>
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50">
                          {scholar.scholarshipName}
                        </span>
                        <span className="text-xs text-stone-500 font-bold flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-stone-400" />
                          <span>{scholar.city}</span>
                        </span>
                      </div>
                    </div>

                    {/* Testimony Quotation */}
                    <div className="relative pt-4">
                      <span className="absolute top-0 left-0 text-4xl text-emerald-200/50 font-serif select-none -translate-x-1 -translate-y-2">“</span>
                      <p className="text-xs sm:text-sm text-stone-600 italic leading-relaxed pl-3 relative z-10">
                        {scholar.story}
                      </p>
                    </div>

                    {/* Placement Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-stone-100 pt-4 text-xs">
                      <div className="space-y-1 bg-stone-100/50 p-3 rounded-xl border border-stone-200/20">
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Chuo Kikuu (University)</span>
                        <div className="flex items-center space-x-1.5 text-stone-850 font-bold">
                          <GraduationCap className="h-4 w-4 text-teal-600 shrink-0" />
                          <span className="truncate">{scholar.university}</span>
                        </div>
                      </div>

                      <div className="space-y-1 bg-stone-100/50 p-3 rounded-xl border border-stone-200/20">
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Programu (Academic Program)</span>
                        <div className="flex items-center space-x-1.5 text-stone-850 font-bold">
                          <BookOpen className="h-4 w-4 text-indigo-600 shrink-0" />
                          <span className="truncate">{scholar.course}</span>
                        </div>
                      </div>
                    </div>

                    {/* Current Position / Current Status */}
                    <div className="flex items-center space-x-2 text-[10px] sm:text-xs text-stone-500 bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl">
                      <span className="font-bold text-amber-800">Sasa hivi:</span>
                      <span className="font-medium text-stone-605 leading-relaxed">{scholar.location}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Carousel controls */}
          <div className="flex items-center justify-between border-t border-stone-100 pt-5">
            <span className="text-[11px] text-stone-400 font-bold">
              {activeSlide + 1} / {tanzanianScholars.length} wanafunzi waliotoboa
            </span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePrevSlide}
                className="h-8 w-8 rounded-lg border border-stone-200 hover:border-stone-300 bg-stone-50 flex items-center justify-center text-stone-600 transition-colors"
                title="Mshuhuda aliyetangulia"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={handleNextSlide}
                className="h-8 w-8 rounded-lg border border-stone-200 hover:border-stone-300 bg-stone-50 flex items-center justify-center text-stone-600 transition-colors"
                title="Mshuhuda anayefuata"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>      </div>

        {/* 6. Benefits Section / Faida za Scholarship */}
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-stone-900 font-display">Je, Kwa Nini Ukimbilie Scholarships?</h3>
            <p className="text-stone-500 text-xs">Mambo mashuhuri matano yanayoweka fursa hizi mbele kuliko mikopo</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {scholarshipBenefits.map((ben) => (
              <div key={ben.id} className="rounded-2xl border border-stone-200/80 bg-white p-5 space-y-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Check className="h-4 w-4 text-emerald-600" />
                </div>
                <h4 className="text-xs font-bold text-stone-950 font-display leading-snug">{ben.title}</h4>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  {ben.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Scholarship Application Success Kit with Interactive Checklists & Smart-Draft Links */}
        <div id="scholarships-success-kit" className="max-w-5xl mx-auto space-y-10 scroll-mt-20">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span>Kifurushi cha Mafanikio (Application Prep Kit)</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
              Scholarship Application Success Kit
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              Mwongozo shirikishi wa kukuongoza namna ya kuandaa nyaraka safi na mbinu za ushawishi zinazompendeza mfadhili yeyote duniani.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-start">
            
            {/* Left Box: Interactive Tabs & Checklists Container */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200/60 shadow-sm overflow-hidden">
              
              {/* Modern tabs navigation bar */}
              <div className="flex border-b border-stone-100 bg-stone-50/70 p-2 gap-1 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSuccessKitTab('sop')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap select-none cursor-pointer ${
                    successKitTab === 'sop'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                      : 'text-stone-650 hover:text-stone-900 hover:bg-stone-100/80'
                  }`}
                >
                  <GraduationCap className="h-4 w-4 shrink-0" />
                  <span>Statement of Purpose (SOP)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSuccessKitTab('lor')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap select-none cursor-pointer ${
                    successKitTab === 'lor'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                      : 'text-stone-655 hover:text-stone-900 hover:bg-stone-100/80'
                  }`}
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>Barua za Mapendekezo (LOR)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSuccessKitTab('cv')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap select-none cursor-pointer ${
                    successKitTab === 'cv'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                      : 'text-stone-655 hover:text-stone-900 hover:bg-stone-100/80'
                  }`}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span>CV Refinement (ATS)</span>
                </button>
              </div>

              {/* Dynamic tab body content */}
              <div className="p-6 sm:p-8">
                {successKitTab === 'sop' && (
                  <motion.div
                    key="sop-tab"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-stone-850">
                        <span className="text-lg">✍️</span>
                        <h4 className="text-base font-extrabold text-stone-900 font-display">Kuandika "Statement of Purpose" (SOP) yenye Kuvutia</h4>
                      </div>
                      <p className="text-xs text-stone-605 leading-relaxed">
                        SOP ni fursa ya kueleza usiku na mchana wako kimasomo, shauku na namna utakavyorudisha mchango kwa taifa la Tanzania. Haipaswi kuwa marudio ya CV, bali ni hadithi ya uhalisia wako.
                      </p>
                    </div>

                    {/* SOP Quick Strategic Tips */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="bg-emerald-50/20 rounded-2xl border border-emerald-100/40 p-4 space-y-1.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 p-0.5 px-2 rounded-md">TIJA #1</span>
                          <span className="text-xs font-bold text-stone-900">Usiandike Kama Wasifu</span>
                        </div>
                        <p className="text-[11px] text-stone-550 leading-relaxed">
                          Anza mwanzo kabisa na hadithi (hook) inayobeba hisia na sababu halisi ya kuchagua masomo haya. Kamati husoma mamia ya insha, siri ni ushawishi wa sekunde 15 za kwanza.
                        </p>
                      </div>

                      <div className="bg-teal-50/20 rounded-2xl border border-teal-100/40 p-4 space-y-1.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-black text-teal-850 bg-teal-100 p-0.5 px-2 rounded-md">TIJA #2</span>
                          <span className="text-xs font-bold text-stone-900">Dhana ya "Show, Don't Tell"</span>
                        </div>
                        <p className="text-[11px] text-stone-550 leading-relaxed">
                          Usiishie kusema 'I am hardworking'. Thibitisha kwa mifano hai: 'Mimi kama kiongozi wa mradi wa chuo, nilitafuta ufumbuzi wa kubana matumizi ya vifaa vya maabara na kuoanisha matokeo'.
                        </p>
                      </div>
                    </div>

                    {/* SOP Interactive Checklist */}
                    <div className="border-t border-stone-100 pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[11px] font-black text-stone-900 uppercase tracking-wider">Orodha ya SOP Thabiti (SOP Tracker)</h5>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          {Object.values(sopChecked).filter(Boolean).length} / 4 Imekamilika
                        </span>
                      </div>
                      
                      <div className="grid gap-2.5 text-stone-700">
                        <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-stone-100 hover:border-emerald-500/20 hover:bg-stone-50/50 transition-all cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={sopChecked.hook}
                            onChange={() => setSopChecked(p => ({ ...p, hook: !p.hook }))}
                            className="mt-0.5 accent-emerald-600 rounded text-emerald-600 h-4 w-4 shrink-0 transition-transform active:scale-90"
                          />
                          <div className="text-xs">
                            <span className={`font-bold transition-colors block ${sopChecked.hook ? 'text-stone-400 line-through' : 'text-stone-850'}`}>Utangulizi wa "The Hook"</span>
                            <span className="text-[11px] text-stone-450 block mt-0.5">Hadithi yako imeanza kupitia changamoto kubwa (mfano: tatizo la umeme au kilimo) unalotaka nalo kuitatua baada ya masomo.</span>
                          </div>
                        </label>

                        <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-stone-100 hover:border-emerald-500/20 hover:bg-stone-50/50 transition-all cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={sopChecked.academicConnection}
                            onChange={() => setSopChecked(p => ({ ...p, academicConnection: !p.academicConnection }))}
                            className="mt-0.5 accent-emerald-600 rounded text-emerald-600 h-4 w-4 shrink-0 transition-transform active:scale-90"
                          />
                          <div className="text-xs">
                            <span className={`font-bold transition-colors block ${sopChecked.academicConnection ? 'text-stone-400 line-through' : 'text-stone-850'}`}>Uoanishaji na Wasifu wa Chuo (Why this Univ?)</span>
                            <span className="text-[11px] text-stone-450 block mt-0.5">Umetaja wahadhiri mahususi, kitengo cha utafiti, au moduli maalum za chuo hicho kubainisha umelifanyia utafiti chuo husika.</span>
                          </div>
                        </label>

                        <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-stone-100 hover:border-emerald-500/20 hover:bg-stone-50/50 transition-all cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={sopChecked.tzImpact}
                            onChange={() => setSopChecked(p => ({ ...p, tzImpact: !p.tzImpact }))}
                            className="mt-0.5 accent-emerald-600 rounded text-emerald-600 h-4 w-4 shrink-0 transition-transform active:scale-90"
                          />
                          <div className="text-xs">
                            <span className={`font-bold transition-colors block ${sopChecked.tzImpact ? 'text-stone-400 line-through' : 'text-stone-850'}`}>Mchango wa Maendeleo Tanzania (National Relevancy)</span>
                            <span className="text-[11px] text-stone-450 block mt-0.5">Kuweka maelezo jinsi elimu hii inavyosaidia Malengo ya Dira ya Taifa (FYDP III au Agenda ya Sekta).</span>
                          </div>
                        </label>

                        <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-stone-100 hover:border-emerald-500/20 hover:bg-stone-50/50 transition-all cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={sopChecked.futureGoals}
                            onChange={() => setSopChecked(p => ({ ...p, futureGoals: !p.futureGoals }))}
                            className="mt-0.5 accent-emerald-600 rounded text-emerald-600 h-4 w-4 shrink-0 transition-transform active:scale-90"
                          />
                          <div className="text-xs">
                            <span className={`font-bold transition-colors block ${sopChecked.futureGoals ? 'text-stone-400 line-through' : 'text-stone-850'}`}>Malengo ya Sasa na Baadaye (Short & Long-term goals)</span>
                            <span className="text-[11px] text-stone-450 block mt-0.5">Umeeleza wazi asasi utakazofanya nazo kazi kwa sasa nchini, na jinsi unavyotarajia kufikia nafasi hiyo kwa vitendo.</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {successKitTab === 'lor' && (
                  <motion.div
                    key="lor-tab"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-stone-850">
                        <span className="text-lg">Mail:</span>
                        <h4 className="text-base font-bold text-stone-900 font-display">Kupata Barua za Mapendekezo (Letters of Rec - LOR) zenye Mashiko</h4>
                      </div>
                      <p className="text-xs text-stone-605 leading-relaxed">
                        Lipa heshima kwa waandishi wako wa mapendekezo lakini washawishi kwa muhtasari (brag-sheet) ili andiko lao liwe mchanganyiko sahihi wa tathmini na mifano.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="bg-indigo-50/20 rounded-2xl border border-indigo-100/40 p-4 space-y-1.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-black text-indigo-800 bg-indigo-100 p-0.5 px-2 rounded-md">TIJA #1</span>
                          <span className="text-xs font-bold text-stone-900">Uhusiano wa Karibu kwanza</span>
                        </div>
                        <p className="text-[11px] text-stone-550 leading-relaxed">
                          Kamati inapendelea kusoma barua ya Profesa aliyekufundisha darasani na kukuongoza utafiti kuliko Mkuu wa Chuo ambaye hajawahi kuwa na mazungumzo ya kitaaluma na wewe.
                        </p>
                      </div>

                      <div className="bg-amber-50/20 rounded-2xl border border-amber-100/40 p-4 space-y-1.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-black text-amber-850 bg-amber-100 p-0.5 px-2 rounded-md">TIJA #2</span>
                          <span className="text-xs font-bold text-stone-900">Warahisishie Kazi (Wape Rasimu)</span>
                        </div>
                        <p className="text-[11px] text-stone-550 leading-relaxed">
                          Mpe mpendekezaji wako CV yako, maelezo kamili ya programu unayoomba, na unbainishe wazo la mradi uliofanya nao darasani. Inawasaidia kuandika tathmini ya kina.
                        </p>
                      </div>
                    </div>

                    {/* LOR Interactive Checklist */}
                    <div className="border-t border-stone-100 pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[11px] font-black text-stone-900 uppercase tracking-wider">Orodha ya Udhibiti wa LOR (My LOR Plan)</h5>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          {Object.values(lorChecked).filter(Boolean).length} / 4 Imekamilika
                        </span>
                      </div>

                      <div className="grid gap-2.5 text-stone-700">
                        <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-stone-100 hover:border-emerald-500/20 hover:bg-stone-50/50 transition-all cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={lorChecked.earlyRequest}
                            onChange={() => setLorChecked(p => ({ ...p, earlyRequest: !p.earlyRequest }))}
                            className="mt-0.5 accent-emerald-600 rounded text-emerald-600 h-4 w-4 shrink-0 transition-transform active:scale-90"
                          />
                          <div className="text-xs">
                            <span className={`font-bold transition-colors block ${lorChecked.earlyRequest ? 'text-stone-400 line-through' : 'text-stone-850'}`}>Omba Angalau Wiki 4 Mapema</span>
                            <span className="text-[11px] text-stone-450 block mt-0.5">Wahadhiri wa vyuo vya Kitanzania na waajiri wana majukumu mengi. Kuwakumbusha mapema ni kuwajali.</span>
                          </div>
                        </label>

                        <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-stone-100 hover:border-emerald-500/20 hover:bg-stone-50/50 transition-all cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={lorChecked.bragSheet}
                            onChange={() => setLorChecked(p => ({ ...p, bragSheet: !p.bragSheet }))}
                            className="mt-0.5 accent-emerald-600 rounded text-emerald-600 h-4 w-4 shrink-0 transition-transform active:scale-90"
                          />
                          <div className="text-xs">
                            <span className={`font-bold transition-colors block ${lorChecked.bragSheet ? 'text-stone-400 line-through' : 'text-stone-850'}`}>Pakia "Brag Sheet" au muundo mchoro</span>
                            <span className="text-[11px] text-stone-450 block mt-0.5">Ufafanuzi mfupi wa alama ulizofanya vizuri zaidi darasani kwake au andishi maalum ambalo mlilibuni, ili andishi lao liwe na thibitisho.</span>
                          </div>
                        </label>

                        <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-stone-100 hover:border-emerald-500/20 hover:bg-stone-50/50 transition-all cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={lorChecked.academicReference}
                            onChange={() => setLorChecked(p => ({ ...p, academicReference: !p.academicReference }))}
                            className="mt-0.5 accent-emerald-600 rounded text-emerald-600 h-4 w-4 shrink-0 transition-transform active:scale-90"
                          />
                          <div className="text-xs">
                            <span className={`font-bold transition-colors block ${lorChecked.academicReference ? 'text-stone-400 line-through' : 'text-stone-850'}`}>Academic Referee mmoja mzito</span>
                            <span className="text-[11px] text-stone-450 block mt-0.5">Mhadhiri aliyesimamia andiko lako la chuo cha awali, au mwenye taaluma kubwa nchini katika fani unayoiomba sasa hivi.</span>
                          </div>
                        </label>

                        <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-stone-100 hover:border-emerald-500/20 hover:bg-stone-50/50 transition-all cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={lorChecked.professionalReference}
                            onChange={() => setLorChecked(p => ({ ...p, professionalReference: !p.professionalReference }))}
                            className="mt-0.5 accent-emerald-600 rounded text-emerald-600 h-4 w-4 shrink-0 transition-transform active:scale-90"
                          />
                          <div className="text-xs">
                            <span className={`font-bold transition-colors block ${lorChecked.professionalReference ? 'text-stone-400 line-through' : 'text-stone-850'}`}>Barua kutoka kwa Simamizi wa Kazini (Kama inatakiwa)</span>
                            <span className="text-[11px] text-stone-450 block mt-0.5">Mwajiri anayeandika sifa zako za uongozi, utendaji kazi chini ya shinikizo, na ari yako katika sekta husika.</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {successKitTab === 'cv' && (
                  <motion.div
                    key="cv-tab"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-stone-850">
                        <span className="text-lg"></span>
                        <h4 className="text-base font-bold text-stone-900 font-display">Kusafisha na Kusawazisha CV Kupita Kompyuta (ATS Reader)</h4>
                      </div>
                      <p className="text-xs text-stone-605 leading-relaxed">
                        Mifumo ya kisasa hutumia akili bandia ya ATS (Applicant Tracking Systems) inayochuja na kuondoa CV zenye muundo mbaya, mifano ya kienyeji au picha, kabla mwanadamu hajazitathmini.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="bg-red-50/20 rounded-2xl border border-red-100/40 p-4 space-y-1.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-black text-red-955 bg-red-100 p-0.5 px-2 rounded-md">YAKUKWEPA</span>
                          <span className="text-xs font-bold text-stone-900">Epuka Picha & Mabara ya Rangi</span>
                        </div>
                        <p className="text-[11px] text-stone-550 leading-relaxed">
                          Usiweke infographics za ujuzi (kama orodha ya mistari au asilimia). Kompyuta inashindwa kuelewa lugha za graphics na inasoma CV yako kama karatasi tupu. Muundo safi uliowekwa vizuri unafiti zaidi.
                        </p>
                      </div>

                      <div className="bg-emerald-50/20 rounded-2xl border border-emerald-100/40 p-4 space-y-1.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 p-0.5 px-2 rounded-md">YA KUTUMIA</span>
                          <span className="text-xs font-bold text-stone-900">Taja Matokeo katika Namba (Impact Metrics)</span>
                        </div>
                        <p className="text-[11px] text-stone-550 leading-relaxed">
                          Usiandike 'Nilikuwa kiongozi wa kijamii'. Andika kielelezo thabiti: 'Niliongoza hamasa ya kijamii iliyotunza mazingira na kupanda miti 1,400 katika kipindi cha miezi sita'.
                        </p>
                      </div>
                    </div>

                    {/* CV Interactive Checklist */}
                    <div className="border-t border-stone-100 pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[11px] font-black text-stone-900 uppercase tracking-wider">Orodha ya CV Makini (ATS-Friendly Goals)</h5>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          {Object.values(cvChecked).filter(Boolean).length} / 4 Imekamilika
                        </span>
                      </div>

                      <div className="grid gap-2.5 text-stone-700">
                        <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-stone-100 hover:border-emerald-500/20 hover:bg-stone-50/50 transition-all cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={cvChecked.noInfographics}
                            onChange={() => setCvChecked(p => ({ ...p, noInfographics: !p.noInfographics }))}
                            className="mt-0.5 accent-emerald-600 rounded text-emerald-600 h-4 w-4 shrink-0 transition-transform active:scale-90"
                          />
                          <div className="text-xs">
                            <span className={`font-bold transition-colors block ${cvChecked.noInfographics ? 'text-stone-400 line-through' : 'text-stone-850'}`}>Uondoaji wa Elements za Graphics & Picha</span>
                            <span className="text-[11px] text-stone-450 block mt-0.5">CV haina picha yako, ramani za rangi au icons ambazo ATS inashindwa kuzisimbua kwa lugha ya siri.</span>
                          </div>
                        </label>

                        <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-stone-100 hover:border-emerald-500/20 hover:bg-stone-50/50 transition-all cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={cvChecked.actionVerbs}
                            onChange={() => setCvChecked(p => ({ ...p, actionVerbs: !p.actionVerbs }))}
                            className="mt-0.5 accent-emerald-600 rounded text-emerald-600 h-4 w-4 shrink-0 transition-transform active:scale-90"
                          />
                          <div className="text-xs">
                            <span className={`font-bold transition-colors block ${cvChecked.actionVerbs ? 'text-stone-400 line-through' : 'text-stone-850'}`}>Anza Milango kwa usemi thabiti na Vitenzi Amilifu</span>
                            <span className="text-[11px] text-stone-450 block mt-0.5">Kutumia maneno ya kikali: "Spearheaded, Optimized, Managed, Conducted...", badala ya 'I was in charge of'.</span>
                          </div>
                        </label>

                        <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-stone-100 hover:border-emerald-500/20 hover:bg-stone-50/50 transition-all cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={cvChecked.impactCentered}
                            onChange={() => setCvChecked(p => ({ ...p, impactCentered: !p.impactCentered }))}
                            className="mt-0.5 accent-emerald-600 rounded text-emerald-600 h-4 w-4 shrink-0 transition-transform active:scale-90"
                          />
                          <div className="text-xs">
                            <span className={`font-bold transition-colors block ${cvChecked.impactCentered ? 'text-stone-400 line-through' : 'text-stone-850'}`}>Fanya sifa zote kuonyesha Namba (Metrics)</span>
                            <span className="text-[11px] text-stone-450 block mt-0.5">Mfano: 'Niliongeza uandikishaji kimasomo wa klabu kwa asilimia 30 kwa miezi 12', badala ya 'Kusimamia uandikishaji klabu'.</span>
                          </div>
                        </label>

                        <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-stone-100 hover:border-emerald-500/20 hover:bg-stone-50/50 transition-all cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={cvChecked.contactInfo}
                            onChange={() => setCvChecked(p => ({ ...p, contactInfo: !p.contactInfo }))}
                            className="mt-0.5 accent-emerald-600 rounded text-emerald-600 h-4 w-4 shrink-0 transition-transform active:scale-90"
                          />
                          <div className="text-xs">
                            <span className={`font-bold transition-colors block ${cvChecked.contactInfo ? 'text-stone-400 line-through' : 'text-stone-850'}`}>LinkedIn ya Kitaalamu na barua pepe iliyofanyiwa mapitio</span>
                            <span className="text-[11px] text-stone-450 block mt-0.5">Anwani yako ya LinkedIn imesasishwa na unatumia anuani ya heshima kujiwakilisha (mfano: emmanuel.kinabo@outlook.com badala ya king_emmy723@...).</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Box: Dynamic Co-Pilot Card representing direct interactive coupling back to Smart-Draft AI instrument */}
            <div className="lg:col-span-4 bg-gradient-to-b from-stone-900 to-stone-950 text-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 border border-stone-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
              
              <div className="space-y-4 relative z-10 text-left">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Sparkles className="h-5 w-5 text-white animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-[9px] font-black tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/10 px-2.5 py-1 rounded-full uppercase block w-fit">
                    AI Zana Thabiti ya Usajili
                  </span>
                  <h4 className="text-lg font-extrabold text-white font-display leading-tight">
                    Ona na Uandike Kwa Usahihi Kutumia Smart-Draft™ AI
                  </h4>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Je, unakuta kuwa mzito, mgumu au una wasiwasi namna ya kueleza wasifu wako kwa hadithi hii ya kusisimua kwa Kiingereza sahihi kilicho tayari?
                  </p>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Akili mnemba ya FundSeed Smart-Draft™ AI inaweza kukuandalia muundo mchoro, insha safi kabisa, na LOR za mazoezi ndani ya sekunde chache!
                  </p>
                </div>
              </div>

              <div className="border-t border-stone-850 pt-5 space-y-4 relative z-10 text-left">
                <div className="flex items-center space-x-2 text-xs text-stone-300">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>SOP Draft & Insha za Mazoezi</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-stone-300">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>LOR Templates za mapema</span>
                </div>
                
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onGoToSmartDraft}
                    className="w-full inline-flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-3.5 transition-all text-center group active:scale-95 shadow-lg shadow-emerald-900/25 cursor-pointer"
                  >
                    <span>Andika Nyaraka kwa AI sasa</span>
                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 8. Call to Action Newsletter */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-emerald-900 text-white p-8 sm:p-12 text-center space-y-6 shadow-xl border border-emerald-850">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black font-display text-white">Je, ungependa kupata taarifa za fursa mpya kila zinapotoka?</h3>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Usipitwe na fursa hata mara moja. Jisajili kwenye orodha yetu maalum ya barua pepe (Newsletter) ili uwe wa kwanza kupata taarifa za scholarships zinazofunguliwa kila mwezi.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="Ingiza barua pepe yako..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-emerald-800 bg-emerald-950 text-white focus:outline-none focus:border-white text-xs flex-1 placeholder-emerald-700 font-medium"
            />
            <button
              type="submit"
              className="rounded-xl bg-white hover:bg-stone-50 text-emerald-900 font-bold text-xs px-5 py-2.5 transition-all text-center"
            >
              Jiunge na FundSeed Academy
            </button>
          </form>

          {newsletterSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-stone-100 text-xs font-medium flex items-center justify-center space-x-1.5"
            >
              <Check className="h-4 w-4 text-emerald-300" />
              <span>Usajili umefanikiwa! Utapokea taarifa sasa hivi kusiwe na haraka.</span>
            </motion.div>
          )}
        </div>

      </div>
    </section>
  );
}
