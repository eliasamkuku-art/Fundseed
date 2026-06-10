import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Bell, Check, Trash2, Globe, MapPin, Sparkles, Filter } from 'lucide-react';

interface NotificationSignupProps {
  lang: 'sw' | 'en';
  currentUser: any;
  activeFilters: {
    category: string;
    origin: string;
    searchTerm: string;
  };
}

interface Subscription {
  id: string;
  name: string;
  email: string;
  category: string;
  origin: string;
  sector: string;
  createdAt: string;
}

export default function OpportunityNotificationSignup({
  lang,
  currentUser,
  activeFilters
}: NotificationSignupProps) {
  const isEn = lang === 'en';

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [category, setCategory] = useState('zote');
  const [origin, setOrigin] = useState('zote');
  const [sector, setSector] = useState('any');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isManageOpen, setIsManageOpen] = useState(false);

  // Load existing subscriptions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fundseed_opportunity_subscriptions');
    if (saved) {
      try {
        setSubscriptions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse subscriptions', e);
      }
    }
  }, []);

  // Sync state with currentUser or active filter changes
  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
    if (currentUser?.name) {
      setFullName(currentUser.name);
    }
  }, [currentUser]);

  // Sync default options when active page filters change
  useEffect(() => {
    if (activeFilters.category !== 'zote') {
      setCategory(activeFilters.category);
    }
    if (activeFilters.origin !== 'zote') {
      setOrigin(activeFilters.origin);
    }
    if (activeFilters.searchTerm) {
      setSector(activeFilters.searchTerm.split(' ')[0]);
    }
  }, [activeFilters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    // Network delay
    setTimeout(() => {
      const newSub: Subscription = {
        id: 'sub-' + Date.now(),
        name: fullName || (isEn ? 'Subscriber' : 'Mtumiaji'),
        email: email.trim().toLowerCase(),
        category,
        origin,
        sector: sector || 'any',
        createdAt: new Date().toISOString().split('T')[0]
      };

      const updated = [newSub, ...subscriptions];
      setSubscriptions(updated);
      localStorage.setItem('fundseed_opportunity_subscriptions', JSON.stringify(updated));

      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Clear or reset fields if not logged in
      if (!currentUser) {
        setFullName('');
        setEmail('');
      }

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }, 1200);
  };

  const handleDelete = (id: string) => {
    const updated = subscriptions.filter(s => s.id !== id);
    setSubscriptions(updated);
    localStorage.setItem('fundseed_opportunity_subscriptions', JSON.stringify(updated));
  };

  // Translations dictionary
  const text = {
    title: {
      sw: 'Pata Arifa Mpya za Ruzuku & Mikopo via Email',
      en: 'Get Instant Grant & Loan Alerts via Email'
    },
    desc: {
      sw: 'Jiunge upokee ripoti na taarifa za papo hapo kwenye barua pepe yako kila fursa mpya inayolingana na vigezo vyako inapowekwa kwenye mfumo wetu.',
      en: 'Subscribe to receive instant, automatic email notifications whenever new funding opportunities matching your criteria are added.'
    },
    emailLabel: {
      sw: 'Barua Pepe yako (Email)',
      en: 'Your Email Address'
    },
    nameLabel: {
      sw: 'Jina Lako Kamili',
      en: 'Your Full Name'
    },
    categoryLabel: {
      sw: 'Aina ya Ufadhili unaotaka kufuata',
      en: 'Preferred Category'
    },
    originLabel: {
      sw: 'Eneo la Kijiografia la Fursa',
      en: 'Geographic Target'
    },
    sectorLabel: {
      sw: 'Sekta / Neno Muhimu la Kutafuta (Hiari)',
      en: 'Economic Sector / Keyword (Optional)'
    },
    buttonSubscribe: {
      sw: 'Amilisha Arifa Sasa',
      en: 'Activate Alerts Now'
    },
    buttonSubmitting: {
      sw: 'Inaamilisha katika database wetu...',
      en: 'Configuring alert routing...'
    },
    successTitle: {
      sw: 'Arifa Zimeamilishwa Salama!',
      en: 'Email Alerts Configured Successfully!'
    },
    successDesc: {
      sw: 'Kila wiki tutakutumia orodha iliyosafishwa ya fursa mpya za kibiashara na masomo zinazolingana na vichujio vyako.',
      en: 'We will dispatch tailored notification packages directly to your inbox matching these unique filters.'
    },
    showMine: {
      sw: 'Simamia Arifa zangu',
      en: 'Manage my Alerts'
    },
    savedAlertsTitle: {
      sw: 'Hifadhi ya Arifa za Email Zako',
      en: 'Your Configured Alert Filters'
    },
    noAlerts: {
      sw: 'Baud hujaamilisha arifa zozote za fursa.',
      en: "You have no active notification streams configured yet."
    },
    catAll: { sw: 'Aina Zote', en: 'All Categories' },
    catRuzuku: { sw: 'Ruzuku Pekee', en: 'Grants Only' },
    catMikopo: { sw: 'Mikopo ya Nafuu', en: 'Concessional Loans' },
    catEquity: { sw: 'Uwekezaji (Equity)', en: 'Equity Investments' },
    catIncubator: { sw: 'Incubators / Malezi', en: 'Incubators & Accelerators' },
    origAll: { sw: 'Kote (Tanzania & Kimataifa)', en: 'Anywhere (Local & Global)' },
    origTz: { sw: 'Tanzania pekee', en: 'Tanzania Domestic' },
    origGlobal: { sw: 'Kimataifa pekee', en: 'Global Programs' },
    backToSignup: {
      sw: 'Rudi kwenye fomu ya kujiunga',
      en: 'Return to alert parameters'
    }
  };

  const getCategoryLabel = (catVal: string) => {
    switch (catVal) {
      case 'ruzuku': return text.catRuzuku[lang];
      case 'mkopo': return text.catMikopo[lang];
      case 'equity': return text.catEquity[lang];
      case 'incubator': return text.catIncubator[lang];
      default: return text.catAll[lang];
    }
  };

  const getOriginLabel = (origVal: string) => {
    switch (origVal) {
      case 'Tanzania': return text.origTz[lang];
      case 'Duniani': return text.origGlobal[lang];
      default: return text.origAll[lang];
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50/70 via-stone-50 to-stone-100/80 rounded-2xl border border-emerald-500/10 p-5 sm:p-6 shadow-sm max-w-5xl mx-auto mt-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-stone-200/50">
        <div className="flex items-start space-x-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200/50 flex-shrink-0">
            <Bell className="h-5 w-5 text-emerald-600 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 font-display flex items-center gap-1.5 leading-tight">
              <span>{text.title[lang]}</span>
              <Sparkles className="h-4 w-4 text-emerald-600 hidden sm:inline" />
            </h3>
            <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
              {text.desc[lang]}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsManageOpen(!isManageOpen)}
          className="self-start md:self-center shrink-0 inline-flex items-center space-x-1.5 text-xs font-bold text-stone-700 hover:text-emerald-700 px-3.5 py-2 rounded-xl bg-white border border-stone-200 shadow-sm transition-all hover:bg-stone-50 cursor-pointer"
        >
          <Filter className="h-3.5 w-3.5" />
          <span>{isManageOpen ? text.backToSignup[lang] : `${text.showMine[lang]} (${subscriptions.length})`}</span>
        </button>
      </div>

      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 flex items-start gap-3"
        >
          <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold">{text.successTitle[lang]}</h4>
            <p className="text-xs mt-0.5 opacity-90">{text.successDesc[lang]}</p>
          </div>
        </motion.div>
      )}

      {isManageOpen ? (
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-stone-700 uppercase tracking-wider">
            {text.savedAlertsTitle[lang]}
          </h4>
          
          {subscriptions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-200 p-6 text-center text-xs text-stone-500 bg-white">
              {text.noAlerts[lang]}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="rounded-xl border border-stone-200 bg-white p-3.5 flex items-start justify-between gap-3 shadow-2xs hover:border-stone-300 transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Mail className="h-3.5 w-3.5 text-stone-400" />
                      <span className="text-xs font-bold text-stone-800 truncate block max-w-[180px] sm:max-w-xs">{sub.email}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 font-bold text-stone-700">
                        {getCategoryLabel(sub.category)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold flex items-center gap-1">
                        <Globe className="h-2.5 w-2.5" />
                        {getOriginLabel(sub.origin)}
                      </span>
                      {sub.sector && sub.sector !== 'any' && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold">
                          "{sub.sector}"
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-stone-50 transition-colors"
                    title={lang === 'en' ? 'Remove Alert' : 'Ondoa Arifa'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-12 items-end">
          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wide block">
              {text.nameLabel[lang]}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? "e.g., Baraka John" : "mfano: Baraka John"}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 focus:border-emerald-600 focus:outline-none placeholder-stone-400 transition-shadow focus:ring-1 focus:ring-emerald-500/10"
            />
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wide block">
              {text.emailLabel[lang]}
            </label>
            <input
              type="email"
              required
              placeholder={isEn ? "name@example.com" : "juma@gmail.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 focus:border-emerald-600 focus:outline-none placeholder-stone-400 transition-shadow focus:ring-1 focus:ring-emerald-500/10"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wide block">
              {text.categoryLabel[lang]}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-800 focus:border-emerald-600 focus:outline-none font-medium"
            >
              <option value="zote">{text.catAll[lang]}</option>
              <option value="ruzuku">{text.catRuzuku[lang]}</option>
              <option value="mkopo">{text.catMikopo[lang]}</option>
              <option value="equity">{text.catEquity[lang]}</option>
              <option value="incubator">{text.catIncubator[lang]}</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wide block">
              {text.originLabel[lang]}
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full text-xs rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-800 focus:border-emerald-600 focus:outline-none font-medium"
            >
              <option value="zote">{text.origAll[lang]}</option>
              <option value="Tanzania">{text.origTz[lang]}</option>
              <option value="Duniani">{text.origGlobal[lang]}</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-3 shadow-xs active:scale-98 transition-all flex items-center justify-center space-x-1.5 cursor-pointer h-[40px] ${
                isSubmitting ? 'opacity-82 cursor-not-allowed' : ''
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>{isSubmitting ? text.buttonSubmitting[lang] : text.buttonSubscribe[lang]}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
