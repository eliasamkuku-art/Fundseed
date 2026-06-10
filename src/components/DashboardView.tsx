import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Coins, 
  TrendingUp, 
  User, 
  Sprout,
  Lock, 
  Unlock, 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  Download, 
  Copy, 
  FolderLock, 
  Plus, 
  BookOpen, 
  Activity, 
  Trash2, 
  Check, 
  Grid,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  LogOut,
  Mail,
  Sliders,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  ExternalLink,
  Search,
  Filter,
  Printer,
  Building2,
  Bot
} from 'lucide-react';
import { SkeletonPremiumCard } from './SkeletonCard';
import { uiTranslations } from '../translations';
import GrantMatchingQuiz from './GrantMatchingQuiz';
import { MsaidiziModal } from './MsaidiziModal';
import { generatePDF } from '../pdfExporter';
import confetti from 'canvas-confetti';
import { 
  freeFeaturedScholarships, 
  newFeaturedGrants,
  premiumScholarshipDatabases 
} from '../scholarshipsData';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

interface DashboardViewProps {
  lang: 'sw' | 'en';
  currentUser: any;
  setCurrentUser: (u: any) => void;
  users: any[];
  setUsers: (users: any[]) => void;
  savedDrafts: any[];
  setSavedDrafts: (drafts: any[]) => void;
  isPaid: boolean;
  setIsPaid: (p: boolean) => void;
  setShowAuthModal: (s: boolean) => void;
  
  // Smart-Draft forms passing props
  activeTool: 'business-plan' | 'pitch-deck';
  setActiveTool: (tool: 'business-plan' | 'pitch-deck') => void;
  isGenerating: boolean;
  handleGenerateAI: (e: React.FormEvent) => Promise<void>;
  aiResult: string | null;
  setAiResult: (res: string | null) => void;
  generationError: string | null;
  setGenerationError: (err: string | null) => void;
  copied: boolean;
  handleCopyToClipboard: () => void;
  handleDownloadFile: () => void;
  bpForm: any;
  setBpForm: (f: any) => void;
  pdForm: any;
  setPdForm: (f: any) => void;
  checkoutSectionRef: any;
  scrollToSection: any;
  onUnlockPremium: () => void;
  renderFormattedMarkdown: (text: string) => React.ReactNode;

  // New grant matching quiz props
  interests: string[];
  setInterests: (interests: string[]) => void;
}

export default function DashboardView({
  lang,
  currentUser,
  setCurrentUser,
  users,
  setUsers,
  savedDrafts,
  setSavedDrafts,
  isPaid,
  setIsPaid,
  setShowAuthModal,
  activeTool,
  setActiveTool,
  isGenerating,
  handleGenerateAI,
  aiResult,
  setAiResult,
  generationError,
  setGenerationError,
  copied,
  handleCopyToClipboard,
  handleDownloadFile,
  bpForm,
  setBpForm,
  pdForm,
  setPdForm,
  checkoutSectionRef,
  scrollToSection,
  onUnlockPremium,
  renderFormattedMarkdown,
  interests,
  setInterests
}: DashboardViewProps) {
  const isEn = lang === 'en';

  // Local profile editing states for progressive profiling
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phoneNumber || '');
  const [editAge, setEditAge] = useState(currentUser?.age || '');
  const [editField, setEditField] = useState(currentUser?.field || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditPhone(currentUser.phoneNumber || '');
      setEditAge(currentUser.age || '');
      setEditField(currentUser.field || '');
    }
  }, [currentUser]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) return;
    
    setIsSavingProfile(true);
    setSaveSuccess(false);

    try {
      const userDocRef = doc(db, 'users', currentUser.userId);
      const updateData = {
        name: editName,
        phoneNumber: editPhone,
        age: editAge,
        field: editField
      };

      await updateDoc(userDocRef, updateData);

      // Update parent state
      setCurrentUser((prev: any) => ({
        ...prev,
        ...updateData
      }));

      // Update the local users state list in parent if it exists
      if (users && setUsers) {
        const updatedUsers = users.map((u: any) => 
          u.email.toLowerCase() === currentUser.email.toLowerCase() 
            ? { ...u, name: editName, phoneNumber: editPhone } 
            : u
        );
        setUsers(updatedUsers);
        localStorage.setItem('fundseed_all_users_db', JSON.stringify(updatedUsers));
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4500);

      // Confetti feedback!
      confetti({
        particleCount: 85,
        spread: 55,
        origin: { y: 0.85 }
      });
    } catch (err) {
      console.error("Failed to update profile in Firestore:", err);
      alert("Imeshindwa kuhifadhi wasifu. Tafadhali jaribu tena.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

  // Active Tab within dashboard once authenticated
  const [activeTab, setActiveTab] = useState<'smart-draft' | 'my-portfolio' | 'academy' | 'admin-panel' | 'profile'>(() => {
    if (currentUser?.isAdmin) return 'admin-panel';
    return 'smart-draft';
  });

  const [portfolioTab, setPortfolioTab] = useState<'drafts' | 'opportunities'>('drafts');

  // Admin Publish Grant Form State
  const [grantTitle, setGrantTitle] = useState('');
  const [grantProvider, setGrantProvider] = useState('');
  const [grantAmount, setGrantAmount] = useState('');
  const [grantCategory, setGrantCategory] = useState<'ruzuku' | 'mkopo' | 'equity' | 'incubator'>('ruzuku');
  const [grantDesc, setGrantDesc] = useState('');
  const [grantEligibility, setGrantEligibility] = useState('');
  const [grantDeadline, setGrantDeadline] = useState('');
  const [grantOrigin, setGrantOrigin] = useState<'Tanzania' | 'Duniani'>('Tanzania');
  const [grantPublishSuccess, setGrantPublishSuccess] = useState(false);
  
  // Real-time Firestore Opportunities
  const [dbOpps, setDbOpps] = React.useState<any[]>([]);
  const [isLoadingOpps, setIsLoadingOpps] = React.useState(true);
  const [editingOppId, setEditingOppId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedDatabase = async () => {
    if (dbOpps.length > 0) {
      alert(isEn ? "Database already has opportunities." : "Database tayari ina fursa.");
      return;
    }
    if (!confirm(isEn ? "Seed the database with 50+ curated opportunities?" : "Unataka kupakia fursa 50+ za mwanzo kwenye kanzidata?")) return;
    
    setIsSeeding(true);
    try {
      for (const sch of freeFeaturedScholarships) {
        await addDoc(collection(db, 'opportunities'), {
          title: sch.title,
          provider: sch.provider,
          amount: sch.benefits,
          category: 'ruzuku',
          description: `Level: ${sch.level}. Status: ${sch.status}`,
          eligibility: [sch.eligibility],
          deadline: sch.deadlineInfo,
          origin: sch.category === 'Government' ? 'Tanzania' : 'Duniani',
          link: sch.url,
          status: 'verified',
          createdAt: serverTimestamp(),
          isFeatured: true
        });
      }

      for (const dbSch of premiumScholarshipDatabases) {
        await addDoc(collection(db, 'opportunities'), {
          title: dbSch.name,
          provider: dbSch.type,
          amount: dbSch.type === 'Ufadhili wa Serikali' ? "Full Funding" : "Partial/Full",
          category: 'ruzuku',
          description: dbSch.description,
          eligibility: [dbSch.scope, dbSch.countries],
          deadline: 'Ongoing',
          origin: dbSch.countries.includes('Tanzania') ? 'Tanzania' : 'Duniani',
          link: dbSch.officialUrl,
          status: 'verified',
          createdAt: serverTimestamp(),
          isPremium: true
        });
      }

      alert(isEn ? "Database successfully seeded!" : "Kanzidata imesasishwa na fursa za mwanzo!");
    } catch (err) {
      console.error("Seeding error:", err);
      alert("Error seeding: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsSeeding(false);
    }
  };

  React.useEffect(() => {
    const q = query(collection(db, 'opportunities'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let opps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Auto-merge new grants if not seeded
      const existingTitles = new Set(opps.map((o: any) => o.title));
      const unseededNewGrants = newFeaturedGrants.filter(g => !existingTitles.has(g.title)).map(g => ({
        id: g.id,
        title: g.title,
        provider: g.provider,
        amount: g.benefits,
        category: (g.title.toLowerCase().includes('credit') || g.title.toLowerCase().includes('loan') || g.id.includes('loan') || g.id.includes('credit')) ? 'mkopo' : (g.category === 'Government' ? 'incubator' : 'ruzuku'),
        description: `Level: ${g.level}. Status: ${g.status}`,
        eligibility: [g.eligibility],
        deadline: g.deadlineInfo,
        origin: g.category === 'Government' ? 'Tanzania' : 'Duniani',
      }));
      
      opps = [...unseededNewGrants, ...opps];
      
      setDbOpps(opps);
      setIsLoadingOpps(false);
    }, (error) => {
      console.error("DashboardView onSnapshot error:", error);
      setIsLoadingOpps(false);
    });

    return () => unsubscribe();
  }, []);

  const [viewingDraftContent, setViewingDraftContent] = useState<string | null>(null);
  const [viewingDraftTitle, setViewingDraftTitle] = useState<string>('');
  const [academyTab, setAcademyTab] = useState<'how-to-win' | 'understanding-tanzania' | 'serikali-funding'>('how-to-win');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAuthModal(true); 
  };

  const handleSignout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fundseed_logged_user');
    setIsPaid(false);
    setAiResult(null);
    setViewingDraftContent(null);
  };

  const handleToggleUserVIP = (userId: string) => {
    const updated = users.map(user => {
      if (user.id === userId) {
        const nextState = !user.isPaid;
        if (nextState) {
          confetti({ particleCount: 40, spread: 45 });
        }
        return { ...user, isPaid: nextState };
      }
      return user;
    });
    setUsers(updated);
    localStorage.setItem('fundseed_all_users_db', JSON.stringify(updated));

    const activeTarget = updated.find(u => u.email.toLowerCase() === currentUser?.email?.toLowerCase());
    if (activeTarget && !currentUser.isAdmin) {
      const updatedSession = { ...currentUser, isPaid: activeTarget.isPaid };
      setCurrentUser(updatedSession);
      localStorage.setItem('fundseed_logged_user', JSON.stringify(updatedSession));
      setIsPaid(activeTarget.isPaid);
    }
  };

  const handleDeleteUserRow = (userId: string) => {
    const filtered = users.filter(user => user.id !== userId);
    setUsers(filtered);
    localStorage.setItem('fundseed_all_users_db', JSON.stringify(filtered));
  };

  const handleAdminPublishOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantTitle.trim() || !grantProvider.trim() || !grantAmount.trim()) {
      alert(isEn ? "Please fill in Title, Provider and Funding Amount" : "Tafadhali jaza kichwa, mtoa fursa na kiasi.");
      return;
    }

    const data: any = {
      title: grantTitle.trim(),
      provider: grantProvider.trim(),
      amount: grantAmount.trim(),
      category: grantCategory,
      description: grantDesc.trim() || "Active regional development funding program.",
      eligibility: grantEligibility.split('\n').filter(l => l.trim() !== ''),
      deadline: grantDeadline.trim() || "Ongoing",
      origin: grantOrigin,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingOppId) {
        await updateDoc(doc(db, 'opportunities', editingOppId), data);
        setEditingOppId(null);
        alert(isEn ? "Opportunity updated!" : "Fursa imesasishwa!");
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, 'opportunities'), data);
        setGrantPublishSuccess(true);
        confetti({ particleCount: 50, spread: 60 });
        setTimeout(() => setGrantPublishSuccess(false), 5000);
      }
      setGrantTitle('');
      setGrantProvider('');
      setGrantAmount('');
      setGrantDesc('');
      setGrantEligibility('');
      setGrantDeadline('');
    } catch (err) {
      console.error("Error publishing opportunity:", err);
      alert("Error: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const handleEditOpp = (opp: any) => {
    setEditingOppId(opp.id);
    setGrantTitle(opp.title);
    setGrantProvider(opp.provider);
    setGrantAmount(opp.amount);
    setGrantCategory(opp.category);
    setGrantDesc(opp.description);
    setGrantEligibility(opp.eligibility.join('\n'));
    setGrantDeadline(opp.deadline);
    setGrantOrigin(opp.origin);
    const formElement = document.getElementById('opp-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteOpp = async (oppId: string) => {
    if (!confirm(isEn ? "Are you sure you want to delete this opportunity?" : "Je, una uhakika unataka kufuta fursa hii?")) return;
    try {
      await deleteDoc(doc(db, 'opportunities', oppId));
    } catch (err) {
      console.error("Error deleting opportunity:", err);
    }
  };

  const handleDeleteDraft = (draftId: string) => {
    const filtered = savedDrafts.filter(d => d.id !== draftId);
    setSavedDrafts(filtered);
    localStorage.setItem('fundseed_saved_drafts_log_db', JSON.stringify(filtered));
  };

  const totalUsersDbCount = users.length;
  const totalVIPUsersDbCount = users.filter(u => u.isPaid).length;
  const grossRevenue = totalVIPUsersDbCount * 20000;
  const computedConversionRate = totalUsersDbCount > 0 
    ? ((totalVIPUsersDbCount / totalUsersDbCount) * 100).toFixed(1) 
    : '0.0';

  const clientPortfolioDrafts = savedDrafts.filter(d => d.userEmail.toLowerCase() === currentUser?.email?.toLowerCase());

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in text-stone-900">
      
      <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-stone-200 p-5 rounded-2xl shadow-sm ${viewingDraftContent ? 'no-print' : ''}`}>
        <div className="flex items-center space-x-3.5">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100 text-stone-600 border border-stone-200">
            {currentUser ? (
              <User className="h-5 w-5 text-emerald-600" />
            ) : (
              <Lock className="h-5 w-5 text-stone-400" />
            )}
          </div>
          <div>
            {currentUser ? (
              <>
                <h2 className="text-base font-extrabold text-stone-900 font-display flex items-center gap-2">
                  <span>{uiTranslations.userWelcomeTitle[lang]} {currentUser.name}!</span>
                  {currentUser.isAdmin ? (
                    <span className="rounded-full bg-amber-100 text-amber-800 text-[9px] font-black px-2.5 py-0.5 uppercase tracking-wider border border-amber-200/50">SYSTEM ADMIN</span>
                  ) : currentUser.isPaid ? (
                    <span className="rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black px-2.5 py-0.5 uppercase tracking-wider border border-emerald-200/50">VIP PREMIUM</span>
                  ) : (
                    <span className="rounded-full bg-stone-100 text-stone-600 text-[9px] font-black px-2.5 py-0.5 uppercase tracking-wider border border-stone-200">BASIC TIER</span>
                  )}
                </h2>
                <p className="text-xs text-stone-500 font-medium">Session: <span className="font-mono text-stone-700">{currentUser.email}</span></p>
              </>
            ) : (
              <>
                <h2 className="text-base font-extrabold text-stone-900 font-display">{isEn ? "VIP Account Portal" : "Mfumo wa Akaunti za VIP"}</h2>
                <p className="text-xs text-stone-500">{isEn ? "Authenticate to save documents and access courses" : "Jisajili au ingia ili kupata huduma thabiti na masomo ya chuo"}</p>
              </>
            )}
          </div>
        </div>

        {currentUser && (
          <button onClick={handleSignout} className="rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold px-4 py-2 flex items-center space-x-1.5 transition-all">
            <LogOut className="h-3.5 w-3.5" />
            <span>{uiTranslations.btnSignout[lang]}</span>
          </button>
        )}
      </div>

      {!currentUser ? (
        <div className="grid gap-8 lg:grid-cols-12 max-w-5xl mx-auto">
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 space-y-6 shadow-sm">
            <div className="space-y-1.5">
              <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest">{isEn ? "AUTHENTICATION" : "UTHIBITISHO WA CHOMBO"}</span>
              <h3 className="text-2xl font-black text-stone-900 font-display leading-tight">{uiTranslations.authLoginTitle[lang]}</h3>
              <p className="text-stone-700 text-xs leading-relaxed">{uiTranslations.authLoginDesc[lang]}</p>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-1 text-xs font-bold text-stone-700">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-stone-800">{isEn ? "Email Address" : "Anwani ya Barua Pepe (Email)"}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400"><Mail className="h-4 w-4" /></span>
                  <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="e.g. juma.hamisi@gmail.com" className="w-full pl-9 rounded-xl border border-stone-300 bg-stone-50/50 px-3.5 py-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                </div>
              </div>
              <button type="submit" className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 shadow-md transition-all text-center flex items-center justify-center space-x-1 uppercase tracking-wider">
                <span>{uiTranslations.btnLogin[lang]}</span>
              </button>
            </form>
          </div>
          <div className="lg:col-span-5 bg-gradient-to-br from-stone-900 to-zinc-950 text-white rounded-2xl p-6 sm:p-10 space-y-6 flex flex-col justify-between shadow-md">
            <div className="space-y-4">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest font-mono">FundSeed Premium</span>
              <h4 className="text-2xl font-bold font-display leading-tight">{isEn ? "Draft Standard Portfolios" : "Tengeneza Mipango Rasmi"}</h4>
              <p className="text-stone-300 text-xs leading-relaxed">Join Adamu Kafuruma’s vetted database network today.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className={`space-y-6 ${viewingDraftContent ? 'no-print' : ''}`}>
          <div className="flex items-center space-x-1.5 overflow-x-auto bg-stone-100 p-1.5 rounded-xl border border-stone-200">
            {currentUser.isAdmin && (
              <button onClick={() => setActiveTab('admin-panel')} className={`rounded-lg px-4 py-2 text-xs font-extrabold transition-all shrink-0 flex items-center space-x-1.5 ${activeTab === 'admin-panel' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}><Sliders className="h-4 w-4" /><span>{uiTranslations.navAdmin[lang]}</span></button>
            )}
            <button onClick={() => setActiveTab('smart-draft')} className={`rounded-lg px-4 py-2 text-xs font-extrabold transition-all shrink-0 flex items-center space-x-1.5 ${activeTab === 'smart-draft' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}><Sparkles className="h-4 w-4" /><span>Smart-Draft™ AI</span></button>
            <button onClick={() => setActiveTab('my-portfolio')} className={`rounded-lg px-4 py-2 text-xs font-extrabold transition-all shrink-0 flex items-center space-x-1.5 ${activeTab === 'my-portfolio' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}><FileText className="h-4 w-4" /><span>{isEn ? "My Saved Blueprints" : "Nyaraka Zilizosaviwa"} ({clientPortfolioDrafts.length})</span></button>
            <button onClick={() => setActiveTab('academy')} className={`rounded-lg px-4 py-2 text-xs font-extrabold transition-all shrink-0 flex items-center space-x-1.5 ${activeTab === 'academy' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}><BookOpen className="h-4 w-4" /><span>FundSeed Academy</span></button>
            <button onClick={() => setActiveTab('profile')} className={`rounded-lg px-4 py-2 text-xs font-extrabold transition-all shrink-0 flex items-center space-x-1.5 ${activeTab === 'profile' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}><User className="h-4 w-4" /><span>{isEn ? 'Profile' : 'Wasifu'}</span></button>
          </div>

          {activeTab === 'admin-panel' && currentUser.isAdmin && (
            <div className="space-y-8 animate-fade-in text-xs">
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-stone-950 font-display flex items-center gap-2">
                  <span>{uiTranslations.adminWelcomeTitle[lang]}</span>
                </h3>
                <p className="text-stone-600 text-xs">{uiTranslations.adminWelcomeSub[lang]}</p>
              </div>

              {/* High Level Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{uiTranslations.adminStatsUsers[lang]}</span>
                    <Users className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-stone-900 font-display">{totalUsersDbCount}</div>
                </div>
                <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{uiTranslations.adminStatsVIP[lang]}</span>
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-stone-900 font-display">{totalVIPUsersDbCount}</div>
                </div>
                <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{isEn ? 'Conversion Rate' : 'Kiwango cha VIP'}</span>
                    <Activity className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-black text-stone-900 font-display">{computedConversionRate}%</div>
                </div>
                <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{isEn ? 'Total Revenue' : 'Mapato Jumla'}</span>
                    <Coins className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-stone-900 font-display">{(grossRevenue).toLocaleString()} TZS</div>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                {/* 1. Grant Publishing Form */}
                <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden" id="opp-form">
                  <div className="bg-stone-50 border-b border-stone-100 p-4 flex items-center justify-between">
                    <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
                       <Plus className="h-4 w-4 text-emerald-600" />
                       <span>{editingOppId ? (isEn ? 'Edit Opportunity' : 'Hariri Fursa') : (isEn ? 'Publish Opportunity' : 'Chapisha Fursa Mpya')}</span>
                    </h4>
                    {editingOppId && (
                      <button onClick={() => {
                        setEditingOppId(null);
                        setGrantTitle('');
                        setGrantProvider('');
                        setGrantAmount('');
                        setGrantDesc('');
                        setGrantEligibility('');
                        setGrantDeadline('');
                      }} className="text-stone-400 hover:text-stone-600">Cancel</button>
                    )}
                  </div>
                  <form onSubmit={handleAdminPublishOpportunity} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500">Opportunity Title</label>
                        <input type="text" value={grantTitle} onChange={(e) => setGrantTitle(e.target.value)} className="w-full rounded-xl border border-stone-200 p-2.5 bg-stone-50/50" placeholder="e.g. Tony Elumelu Grant" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500">Provider</label>
                        <input type="text" value={grantProvider} onChange={(e) => setGrantProvider(e.target.value)} className="w-full rounded-xl border border-stone-200 p-2.5 bg-stone-50/50" placeholder="e.g. TEF Foundation" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-500">Amount</label>
                          <input type="text" value={grantAmount} onChange={(e) => setGrantAmount(e.target.value)} className="w-full rounded-xl border border-stone-200 p-2.5 bg-stone-50/50" placeholder="$5,000" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-500">Category</label>
                          <select value={grantCategory} onChange={(e: any) => setGrantCategory(e.target.value)} className="w-full rounded-xl border border-stone-200 p-2.5 bg-stone-50/50">
                            <option value="ruzuku">Ruzuku</option>
                            <option value="mkopo">Mkopo</option>
                            <option value="equity">Equity</option>
                            <option value="incubator">Incubator</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-500">Deadline</label>
                          <input type="text" value={grantDeadline} onChange={(e) => setGrantDeadline(e.target.value)} className="w-full rounded-xl border border-stone-200 p-2.5 bg-stone-50/50" placeholder="30 June 2026" />
                        </div>
                    </div>

                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-stone-500">Short Description</label>
                       <textarea value={grantDesc} onChange={(e) => setGrantDesc(e.target.value)} rows={2} className="w-full rounded-xl border border-stone-200 p-2.5 bg-stone-50/50" />
                    </div>

                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-stone-500">Eligibility (One per line)</label>
                       <textarea value={grantEligibility} onChange={(e) => setGrantEligibility(e.target.value)} rows={3} className="w-full rounded-xl border border-stone-200 p-2.5 bg-stone-50/50" placeholder="Tanzanian Citizen\nBusiness registered at BRELA" />
                    </div>

                    <button type="submit" className="w-full bg-stone-900 text-white rounded-xl py-3 font-bold hover:bg-black transition-all">
                      {editingOppId ? 'Update Opportunity' : 'Publish to Live Database'}
                    </button>
                    
                    {grantPublishSuccess && (
                      <p className="text-emerald-600 font-bold text-center animate-pulse">✓ Opportunity published successfully!</p>
                    )}
                  </form>
                </div>

                {/* 2. User Management Roll */}
                <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-stone-50 border-b border-stone-100 p-4 flex items-center justify-between">
                    <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
                       <Users className="h-4 w-4 text-emerald-600" />
                       <span>Manage Registered Users</span>
                    </h4>
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input 
                        type="text" 
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        placeholder="Search emails..." 
                        className="pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 bg-white text-[10px] w-48"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto max-h-[440px]">
                    <table className="w-full text-left border-collapse">
                       <thead className="bg-stone-50/50 text-[10px] font-bold text-stone-500 border-b border-stone-100">
                         <tr>
                            <th className="px-4 py-3">User & Email</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Joined</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                         </tr>
                       </thead>
                       <tbody>
                         {users.filter(u => u.email.toLowerCase().includes(userSearchTerm.toLowerCase())).map((u, idx) => (
                           <tr key={u.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                              <td className="px-4 py-3 space-y-0.5">
                                <div className="font-bold text-stone-900">{u.name}</div>
                                <div className="text-[10px] text-stone-500 font-mono italic">{u.email}</div>
                              </td>
                              <td className="px-4 py-3">
                                <button 
                                  onClick={() => handleToggleUserVIP(u.id)}
                                  className={`px-2 py-0.5 rounded-md font-bold text-[9px] transition-all flex items-center gap-1.5 ${u.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-400 border border-stone-200'}`}
                                >
                                  {u.isPaid ? <ShieldCheck className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                  <span>{u.isPaid ? 'VIP ACCESS' : 'BASIC'}</span>
                                </button>
                              </td>
                              <td className="px-4 py-3 text-stone-500 text-[10px]">{u.registeredAt}</td>
                              <td className="px-4 py-3 text-right">
                                 <button onClick={() => handleDeleteUserRow(u.id)} className="h-7 w-7 inline-flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-500 transition-all border border-stone-100 hover:border-red-100">
                                   <Trash2 className="h-3.5 w-3.5" />
                                 </button>
                              </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 3. Opportunity List Table */}
              <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-stone-50 border-b border-stone-100 p-4 flex items-center justify-between">
                    <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
                       <Grid className="h-4 w-4 text-emerald-600" />
                       <span>Active Opportunities in Cloud DB</span>
                    </h4>
                    <div className="flex items-center gap-3">
                      {dbOpps.length === 0 && (
                        <button 
                          onClick={handleSeedDatabase}
                          disabled={isSeeding}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1.5 hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {isSeeding ? 'Seeding...' : 'Seed Initial 50+ Opps'}
                        </button>
                      )}
                      <div className="relative">
                        <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input 
                          type="text" 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Filter opportunities..." 
                          className="pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 bg-white text-[10px] w-64"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead className="bg-stone-50/50 text-[10px] font-bold text-stone-500 border-b border-stone-100">
                          <tr>
                             <th className="px-4 py-3">Title & Provider</th>
                             <th className="px-4 py-3">Category</th>
                             <th className="px-4 py-3">Funding</th>
                             <th className="px-4 py-3">Origin</th>
                             <th className="px-4 py-3">Deadline</th>
                             <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dbOpps.filter(opp => opp.title.toLowerCase().includes(searchTerm.toLowerCase())).map((opp) => (
                            <tr key={opp.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                               <td className="px-4 py-3">
                                  <div className="font-bold text-stone-900 line-clamp-1">{opp.title}</div>
                                  <div className="text-[10px] text-stone-500">{opp.provider}</div>
                               </td>
                               <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                                    opp.category === 'ruzuku' ? 'bg-emerald-50 text-emerald-700' :
                                    opp.category === 'mkopo' ? 'bg-blue-50 text-blue-700' : 'bg-stone-100 text-stone-600'
                                  }`}>{opp.category}</span>
                               </td>
                               <td className="px-4 py-3 font-mono font-bold text-stone-700">{opp.amount}</td>
                               <td className="px-4 py-3 text-stone-600">{opp.origin}</td>
                               <td className="px-4 py-3 text-stone-500">{opp.deadline}</td>
                               <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                     <button onClick={() => handleEditOpp(opp)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-stone-100 hover:bg-emerald-50 text-stone-400 hover:text-emerald-700 transition-all">
                                        <Edit2 className="h-3.5 w-3.5" />
                                     </button>
                                     <button onClick={() => handleDeleteOpp(opp.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-500 transition-all">
                                        <Trash2 className="h-3.5 w-3.5" />
                                     </button>
                                  </div>
                               </td>
                            </tr>
                          ))}
                        </tbody>
                     </table>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'smart-draft' && (
            <div className="animate-fade-in text-xs space-y-6">
              {!isPaid && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Lock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-amber-900 uppercase tracking-tight">{isEn ? 'Verification Required' : 'Uthibitisho Unahitajika'}</h4>
                      <p className="text-amber-700/80 text-[10px] sm:text-xs">{isEn ? 'Upgrade to VIP to generate your business plans.' : 'Lipia TZS 20,000 ili uweze kutumia AI yetu kutengeneza Business Plan rasmi.'}</p>
                    </div>
                  </div>
                  <button onClick={onUnlockPremium} className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm transition-all whitespace-nowrap">
                    {isEn ? 'Unlock AI Access' : 'Fungua AI Sasa'}
                  </button>
                </div>
              )}

              <div className="grid gap-8 lg:grid-cols-12">
                {/* Form Column */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                      <h4 className="text-[11px] font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-600" />
                        <span>Smart-Draft™ AI Builder</span>
                      </h4>
                      <div className="flex bg-stone-100 p-1 rounded-lg">
                        <button 
                          onClick={() => setActiveTool('business-plan')}
                          className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${activeTool === 'business-plan' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                          BP
                        </button>
                        <button 
                          onClick={() => setActiveTool('pitch-deck')}
                          className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${activeTool === 'pitch-deck' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                          Pitch
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleGenerateAI} className="space-y-4">
                      {activeTool === 'business-plan' ? (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-stone-600 uppercase tracking-wider block">{uiTranslations.lblBusinessName[lang]}</label>
                            <input 
                              type="text" 
                              required 
                              value={bpForm.businessName} 
                              onChange={(e) => setBpForm({...bpForm, businessName: e.target.value})}
                              placeholder="e.g. Salama Organic Poultry"
                              className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-3.5 py-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all font-bold"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-stone-600 uppercase tracking-wider block">{uiTranslations.lblIndustry[lang]}</label>
                            <input 
                              type="text" 
                              required 
                              value={bpForm.industry} 
                              onChange={(e) => setBpForm({...bpForm, industry: e.target.value})}
                              placeholder="e.g. Kilimo, Biashara Ndogo"
                              className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-3.5 py-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all font-bold"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-stone-600 uppercase tracking-wider block">{uiTranslations.lblProblem[lang]}</label>
                            <textarea 
                              required 
                              rows={3}
                              value={bpForm.problem} 
                              onChange={(e) => setBpForm({...bpForm, problem: e.target.value})}
                              placeholder="Je, biashara yako inatatua changamoto gani kwenye jamii yako?"
                              className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-3.5 py-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all font-semibold leading-relaxed"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-stone-600 uppercase tracking-wider block">{uiTranslations.lblSolution[lang]}</label>
                            <textarea 
                              required 
                              rows={3}
                              value={bpForm.solution} 
                              onChange={(e) => setBpForm({...bpForm, solution: e.target.value})}
                              placeholder="Toa suluhisho la kipekee la biashara yako..."
                              className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-3.5 py-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all font-semibold leading-relaxed"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-stone-600 uppercase tracking-wider block">{uiTranslations.lblTargetCustomers[lang]}</label>
                            <input 
                              type="text" 
                              required 
                              value={bpForm.targetCustomers} 
                              onChange={(e) => setBpForm({...bpForm, targetCustomers: e.target.value})}
                              placeholder="e.g. Mama lishe, mahasibu, au wakulima wa Mbeya"
                              className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-3.5 py-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all font-bold"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-stone-600 uppercase tracking-wider block">{uiTranslations.lblBudget[lang]}</label>
                            <input 
                              type="text" 
                              required 
                              value={bpForm.budgetString} 
                              onChange={(e) => setBpForm({...bpForm, budgetString: e.target.value})}
                              placeholder="e.g. Milioni 15 TZS"
                              className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-3.5 py-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all font-bold"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                           <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-stone-600 uppercase tracking-wider block">{uiTranslations.lblStartupName[lang]}</label>
                            <input 
                              type="text" 
                              required 
                              value={pdForm.startupName} 
                              onChange={(e) => setPdForm({...pdForm, startupName: e.target.value})}
                              placeholder="e.g. Rafiki Logistics"
                              className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-3.5 py-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all font-bold"
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-stone-600 uppercase tracking-wider block">{isEn ? 'Market Size (TAM/SAM)' : 'Ukubwa wa Soko'}</label>
                            <input 
                              type="text" 
                              required 
                              value={pdForm.marketSize} 
                              onChange={(e) => setPdForm({...pdForm, marketSize: e.target.value})}
                              placeholder="e.g. Bilioni 2.5 TZS kwa mwaka"
                              className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-3.5 py-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all font-bold"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-stone-600 uppercase tracking-wider block">{isEn ? 'Revenue Model' : 'Mfumo wa Mapato'}</label>
                            <textarea 
                              required 
                              rows={2}
                              value={pdForm.businessModel} 
                              onChange={(e) => setPdForm({...pdForm, businessModel: e.target.value})}
                              placeholder="Unapataje fedha? (e.g. Asilimia 10% ya kila miamala)"
                              className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-3.5 py-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all font-semibold leading-relaxed"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-stone-600 uppercase tracking-wider block">{isEn ? 'Funding Needs' : 'Mahitaji ya Mitaji'}</label>
                            <input 
                              type="text" 
                              required 
                              value={pdForm.fundingNeeds} 
                              onChange={(e) => setPdForm({...pdForm, fundingNeeds: e.target.value})}
                              placeholder="e.g. Milioni 30 TZS kwa ajili ya App"
                              className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-3.5 py-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all font-bold"
                            />
                          </div>
                        </div>
                      )}

                      <button 
                        type="submit" 
                        disabled={isGenerating || !isPaid} 
                        className={`w-full rounded-2xl py-4 flex items-center justify-center gap-3 transition-all font-black uppercase tracking-widest shadow-lg ${
                          !isPaid 
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                            : isGenerating 
                              ? 'bg-emerald-50 text-emerald-700 cursor-not-allowed' 
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                        }`}
                      >
                        {isGenerating ? (
                          <>
                            <div className="h-5 w-5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                            <span>{isEn ? 'Analyzing...' : 'Inachakata...'}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5" />
                            <span>{uiTranslations.btnGenerateDraft[lang]}</span>
                          </>
                        )}
                      </button>

                      <p className="text-[10px] text-center text-stone-400 italic">
                        {isEn ? 'Powered by FundSeed AI Local Engine - Version 2.4.0' : 'Inaendeshwa na Mfumo wa AI wa FundSeed Tanzania v2.4.0'}
                      </p>
                    </form>
                  </div>
                </div>

                {/* Display Result Column */}
                <div className="lg:col-span-7">
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col h-full min-h-[500px] space-y-5 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-bl-full opacity-50 pointer-events-none" />

                    <div className="border-b border-stone-100 pb-3 flex items-center justify-between z-10">
                      <h4 className="text-[11px] font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        <span>AI Drafting Terminal</span>
                      </h4>
                      {aiResult && (
                        <div className="flex items-center gap-2.5">
                           <button 
                             onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant'))}
                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white text-[10px] font-bold hover:bg-stone-800 transition-all shadow-sm"
                           >
                             <Bot className="h-3 w-3" />
                             <span>{isEn ? 'Ask Assistant' : 'Uliza Msaidizi'}</span>
                           </button>
                           <button onClick={handleCopyToClipboard} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 text-[10px] font-bold hover:bg-stone-200 transition-all border border-stone-200">
                             {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                             <span>{copied ? 'Copied' : (isEn ? 'Copy' : 'Nakili')}</span>
                           </button>
                           <button onClick={handleDownloadFile} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 shadow-md transition-all">
                             <Download className="h-3 w-3" />
                             <span>{isEn ? 'Download PDF' : 'Pakua PDF'}</span>
                           </button>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-200 pr-1 max-h-[700px]">
                      {isGenerating ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 space-y-6">
                           <div className="relative">
                             <div className="h-20 w-20 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                             <Sparkles className="h-8 w-8 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                           </div>
                           <div className="text-center space-y-2 max-w-sm">
                             <p className="text-sm font-black text-stone-800 uppercase tracking-wider">{isEn ? 'AI is Drafting Your Success...' : 'AI Inatengeneza Mafanikio Yako...'}</p>
                             <p className="text-stone-500 text-xs leading-relaxed">
                               Tafadhali usifunge dirisha hili. AI inachambua soko na sekta yako ili kuunda mchanganuo bora kabisa.
                             </p>
                           </div>
                        </div>
                      ) : generationError ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                           <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                             <Activity className="h-6 w-6 text-red-600" />
                           </div>
                           <p className="text-red-700 font-bold text-xs">{generationError}</p>
                           <button 
                            onClick={onUnlockPremium}
                            className="text-emerald-700 text-xs font-black underline hover:text-emerald-800"
                           >
                            {isEn ? 'Check Subscription Status' : 'Angalia hali ya malipo yako hapa'}
                           </button>
                        </div>
                      ) : aiResult ? (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }}
                          className="prose prose-stone prose-xs max-w-none prose-p:leading-relaxed prose-headings:font-display prose-headings:font-black prose-headings:tracking-tight font-sans selection:bg-emerald-100 p-2"
                        >
                          {renderFormattedMarkdown(aiResult)}
                        </motion.div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-30 select-none">
                           <Grid className="h-24 w-24 text-stone-200 stroke-[0.5]" />
                           <div className="space-y-1.5">
                             <p className="text-sm font-bold text-stone-600 capitalize underline decoration-stone-200 underline-offset-4">{isEn ? 'Waiting for your command' : 'Inangojea maagizo yako'}</p>
                             <p className="text-[10px] text-stone-600 max-w-xs">{isEn ? 'Fill in the form on the left and click generate to see the magic happen.' : 'Jaza fomu iliyopo kushoto kisha bonyeza kitufe cha zalisha kuona matokeo.'}</p>
                           </div>
                        </div>
                      )}
                    </div>

                    {aiResult && (
                      <div className="mt-4 pt-4 border-t border-stone-50 bg-stone-50/50 -mx-6 -mb-6 p-6 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">{isEn ? 'Rate this draft:' : 'Tathmini matokeo:'}</p>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => setFeedbackGiven('up')}
                              className={`p-1.5 rounded-lg transition-all ${feedbackGiven === 'up' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'hover:bg-emerald-50 text-stone-400 hover:text-emerald-600'}`}
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => setFeedbackGiven('down')}
                              className={`p-1.5 rounded-lg transition-all ${feedbackGiven === 'down' ? 'bg-red-100 text-red-700 shadow-sm' : 'hover:bg-red-50 text-stone-400 hover:text-red-600'}`}
                            >
                              <ThumbsDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="h-4 w-px bg-stone-200" />
                        <button className="flex items-center gap-1.5 text-stone-400 hover:text-stone-600 font-bold tracking-tight text-[10px] transition-all">
                          <Check className="h-3.5 w-3.5" />
                          <span>AUTO-SAVED TO CLOUD</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'my-portfolio' && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in text-xs">
              <div className="border-b border-stone-100 flex space-x-6 items-end">
                <button onClick={() => setPortfolioTab('drafts')} className={`pb-3 font-display uppercase tracking-wider font-extrabold text-xs transition-all border-b-2 ${portfolioTab === 'drafts' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>My Drafts ({clientPortfolioDrafts.length})</button>
                <button onClick={() => setPortfolioTab('opportunities')} className={`pb-3 font-display uppercase tracking-wider font-extrabold text-xs transition-all border-b-2 ${portfolioTab === 'opportunities' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>Saved (0)</button>
              </div>
              {portfolioTab === 'drafts' ? (
                <>
                  {clientPortfolioDrafts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead><tr className="bg-stone-50 border-b"><th>Jina</th><th>Hali</th><th>Action</th></tr></thead>
                        <tbody>
                          {clientPortfolioDrafts.map((d: any) => (
                            <tr key={d.id} className="border-b"><td className="p-2">{d.title}</td><td className="p-2">Saved</td><td className="p-2"><button onClick={() => {setViewingDraftContent(d.content); setViewingDraftTitle(d.title)}} className="text-emerald-700 hover:underline">Tazama</button></td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">Hakuna andiko lililopatikana.</div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">Hakuna fursa zilizosaviwa.</div>
              )}
            </div>
          )}

          {activeTab === 'academy' && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in text-xs">
              <div className="border-b border-stone-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-black text-stone-900 font-display uppercase">FundSeed Academy</h3>
                  <p className="text-stone-500 text-xs">{isEn ? 'Master the art of securing grants and business scaling' : 'Jifunze mbinu bora za kupata ruzuku na kukuza biashara kitalaamu'}</p>
                </div>
                {!isPaid && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[10px]">
                    <Lock className="h-3 w-3" />
                    <span>BAADHI YA MASOMO YAMEFUNGA</span>
                  </div>
                )}
              </div>

              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-3 space-y-2">
                  {[
                    { id: 'mbona-kufeli', title: isEn ? 'Why Grants Fail?' : 'Siri: Mbona Ruzuku hufeli?', icon: <Activity className="h-4 w-4" /> },
                    { id: 'miradi-kipaumbele', title: isEn ? 'Priority Projects' : 'Miradi ya Kipaumbele TZ', icon: <TrendingUp className="h-4 w-4" /> },
                    { id: 'incubator-vs-accelerator', title: isEn ? 'Incubators Guide' : 'Incubator vs Accelerator', icon: <Layers className="h-4 w-4" /> },
                    { id: 'serikali-funding', title: isEn ? 'Govt Funding Flows' : 'Mfumo wa Fedha za Serikali', icon: <Building2 className="h-4 w-4" /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setAcademyTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border font-bold ${
                        academyTab === tab.id 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-700'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.title}</span>
                    </button>
                  ))}
                </div>

                <div className="lg:col-span-9 bg-stone-50/50 rounded-2xl p-6 border border-stone-100 min-h-[400px]">
                  {academyTab === 'mbona-kufeli' && (
                    <div className="space-y-4 animate-fade-in">
                      <h4 className="text-sm font-black text-stone-900 uppercase tracking-tight flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-600" />
                        <span>Siri ya Mbona Maombi Mengi ya Ruzuku Hufeli Tanzania?</span>
                      </h4>
                      <div className="prose prose-stone prose-xs max-w-none text-stone-660 leading-relaxed space-y-3">
                        <p>Kulingana na takfiti za kijamii, 70% ya waombaji ruzuku nchini Tanzania hufeli katika hatua ya kwanza kabisa (Administrative Screening). Sababu kuu ni:</p>
                        <ul className="grid gap-3 sm:grid-cols-2">
                          <li className="bg-white p-3 rounded-xl border border-stone-200 flex gap-3">
                            <span className="font-black text-emerald-600">01</span>
                            <div>
                                <b className="text-stone-900 block mb-1">Kukosa Leseni Sahihi</b>
                                <span>Wengi huomba ruzuku bila kuwa na usajili wa BRELA au TIN za kampuni husika kama inavyotakiwa.</span>
                            </div>
                          </li>
                          <li className="bg-white p-3 rounded-xl border border-stone-200 flex gap-3">
                            <span className="font-black text-emerald-600">02</span>
                            <div>
                                <b className="text-stone-900 block mb-1">Impact Isiyoonekana</b>
                                <span>Maombi mengi huzingatia faida ya mwombaji badala ya athari kwa jamii (Social Impact). Fadhila hutoa fedha kusaidia wenye mahitaji.</span>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                  {academyTab === 'miradi-kipaumbele' && (
                    <div className="space-y-4 animate-fade-in">
                        <h4 className="text-sm font-black text-stone-900 uppercase tracking-tight flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                            <span>Miradi ya Kipaumbele ya Serikali ya Tanzania (2024-2026)</span>
                        </h4>
                        <div className="space-y-3">
                            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                                <b className="text-emerald-700 block mb-1 uppercase tracking-wider text-[10px]">Blue Economy (Uchumi wa Buluu)</b>
                                <p className="text-stone-600">Ufugaji wa vizimba baharini (Mariculture) na usindikaji wa samaki Zanzibar na Pwani unashika kipaumbele kikubwa sasa.</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                                <b className="text-emerald-700 block mb-1 uppercase tracking-wider text-[10px]">Value Addition Agriculture</b>
                                <p className="text-stone-600">Serikali kupitia TADB na SIDO inatafuta wabunifu wa kuongeza thamani ya mazao kama Parachichi, Alizeti (Mafuta) na Korosho.</p>
                            </div>
                        </div>
                    </div>
                  )}
                  {academyTab === 'incubator-vs-accelerator' && (
                    <div className="space-y-4 animate-fade-in">
                         <h4 className="text-sm font-black text-stone-900 uppercase tracking-tight flex items-center gap-2">
                            <Layers className="h-4 w-4 text-emerald-600" />
                            <span>Kujua Tofauti Kati ya Incubator na Accelerator</span>
                        </h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                             <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                                 <b className="text-emerald-800 text-xs block mb-2 uppercase tracking-widest">Incubator (Kituo cha Uzalishaji)</b>
                                 <p className="text-emerald-700/80 leading-relaxed">Hapa unapata mafunzo, ofisi, na mwongozo (mentorship) ukiwa ndio unaanza (Idea stage). Lengo ni Kukusaidia "Kuzaliwa" kibiashara.</p>
                             </div>
                             <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                                 <b className="text-indigo-800 text-xs block mb-2 uppercase tracking-widest">Accelerator (Kituo cha Kasi)</b>
                                 <p className="text-indigo-700/80 leading-relaxed">Hapa unapewa mtaji (Capital) na masoko uunganike na wawekezaji wakubwa ukiwa tayari una biashara inayofanya kazi. Lengo ni "Kukimbia".</p>
                             </div>
                        </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in text-xs">
              <div className="border-b border-stone-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-black text-stone-900 font-display uppercase">{isEn ? 'Account Profile' : 'Wasifu wa Akaunti'}</h3>
                  <p className="text-stone-500 text-xs">{isEn ? 'Manage your account and progressive profiling settings' : 'Boresha au kamilisha wasifu wako hapa ili upate manufaa kamili'}</p>
                </div>
                <div className="flex items-center space-x-2">
                   <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${isPaid ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-stone-100 text-stone-600 border border-stone-200'}`}>
                     {isPaid ? 'PREMIUM VIP' : 'BASIC TIER'}
                   </span>
                </div>
              </div>

              {saveSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 font-bold text-xs"
                >
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{isEn ? "Profile updated successfully!" : "Wasifu wako umehifadhiwa kikamilifu kwenye seva ya wingu!"}</span>
                </motion.div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-extrabold text-stone-500 tracking-wider block">{isEn ? 'Full Name' : 'Jina Lako Kamili'}</label>
                      <input 
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="e.g. Juma Hamisi"
                        className="w-full rounded-xl border border-stone-200 bg-stone-50/40 px-3.5 py-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-extrabold text-stone-500 tracking-wider block">{isEn ? 'Email Address' : 'Barua Pepe'}</label>
                      <input 
                        type="email"
                        disabled
                        value={currentUser?.email || ''}
                        className="w-full rounded-xl border border-stone-200 bg-stone-100 px-3.5 py-3 text-xs text-stone-400 font-semibold cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-extrabold text-stone-500 tracking-wider block">{isEn ? 'Phone Number' : 'Namba ya Simu'}</label>
                      <input 
                        type="tel"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="e.g. 07XXXXXXXX"
                        className="w-full rounded-xl border border-stone-200 bg-stone-50/40 px-3.5 py-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-extrabold text-stone-500 tracking-wider block">{isEn ? 'Your Age' : 'Umri Wako'}</label>
                        <select
                          value={editAge}
                          onChange={(e) => setEditAge(e.target.value)}
                          className="w-full rounded-xl border border-stone-200 bg-stone-50/40 px-3.5 py-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold cursor-pointer"
                        >
                          <option value="">-- Chagua --</option>
                          <option value="Chini ya 18">Chini ya 18</option>
                          <option value="Miaka 18 - 24">18 - 24</option>
                          <option value="Miaka 25 - 35">25 - 35</option>
                          <option value="Miaka 36 - 50">36 - 50</option>
                          <option value="Zaidi ya 50">Zaidi ya 50</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-extrabold text-stone-500 tracking-wider block">{isEn ? 'Sector / Field' : 'Fani / Sekta yako'}</label>
                        <select
                          value={editField}
                          onChange={(e) => setEditField(e.target.value)}
                          className="w-full rounded-xl border border-stone-200 bg-stone-50/40 px-3.5 py-3 text-xs text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold cursor-pointer"
                        >
                          <option value="">-- Chagua --</option>
                          <option value="Kilimo & Ufugaji">Kilimo & Ufugaji</option>
                          <option value="Biashara & Ujasiriamali">Biashara & Ujasiriamali</option>
                          <option value="Teknolojia & Ubunifu">Teknolojia & Ubunifu</option>
                          <option value="Masomo / Elimu">Masomo / Elimu</option>
                          <option value="Afya / Jamii">Afya / Jamii</option>
                          <option value="Sanaa & Burudani">Sanaa & Burudani</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-stone-400 text-[10px] leading-snug text-center sm:text-left">
                    <span>Nyaraka zilizoundwa: <b>{clientPortfolioDrafts.length}</b></span>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {!isPaid && (
                      <button
                        type="button"
                        onClick={onUnlockPremium}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100/80 text-xs font-bold transition-all text-center"
                      >
                        {isEn ? "Upgrade to VIP" : "Mwanachama VIP"}
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSavingProfile && <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      <span>{isEn ? 'Save Profile' : 'Hifadhi Wasifu'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {viewingDraftContent && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h4 className="font-bold">{viewingDraftTitle}</h4>
              <button onClick={() => setViewingDraftContent(null)}>✕</button>
            </div>
            <div className="text-xs leading-relaxed prose prose-stone">{renderFormattedMarkdown(viewingDraftContent)}</div>
          </div>
        </div>
      )}

      {/* Msaidizi Chat Modal (Now Global in App.tsx) */}
    </div>
  );
}
