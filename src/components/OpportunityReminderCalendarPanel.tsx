import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Bell, Trash2, ArrowUpRight, Clock, AlertTriangle, Sparkles, Check } from 'lucide-react';
import { Opportunity } from '../types';
import OpportunityReminderActions, { getParsedDeadlineDate } from './OpportunityReminderActions';

interface OpportunityReminderCalendarPanelProps {
  allOpportunities: Opportunity[];
  lang: 'sw' | 'en';
  onViewOpportunity: (oppId: string) => void;
}

interface DeadlineCountdown {
  text: string;
  daysLeft: number;
  badgeColor: string;
}

export function getDeadlineCountdown(deadline: string, lang: 'sw' | 'en'): DeadlineCountdown {
  const isEn = lang === 'en';
  const lower = deadline.toLowerCase();

  const isOngoing = 
    lower.includes('ongoing') || 
    lower.includes('endelea') || 
    lower.includes('daima') || 
    lower.includes('round') || 
    lower.includes('wave') || 
    lower.includes('directorate') || 
    lower.includes('ofisi') ||
    lower.includes('wazi') ||
    lower.includes('wa kwanza');

  if (isOngoing) {
    return {
      text: isEn ? 'Ongoing Enrollment' : 'Maombi Yanaendelea',
      daysLeft: 999,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-150'
    };
  }

  const targetDate = getParsedDeadlineDate(deadline);
  const now = new Date();
  
  // Set times to midnight to calculate diff days
  const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d2 = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: isEn ? 'Deadline passed' : 'Muda wa mwisho umepita',
      daysLeft: diffDays,
      badgeColor: 'bg-red-50 text-red-650 border-red-100 font-medium'
    };
  } else if (diffDays === 0) {
    return {
      text: isEn ? '⚠️ Ends TODAY!' : '⚠️ Mwisho ni LEO!',
      daysLeft: 0,
      badgeColor: 'bg-red-500 text-white border-red-600 font-black animate-pulse'
    };
  } else if (diffDays === 1) {
    return {
      text: isEn ? '⏳ Ends TOMORROW!' : '⏳ Mwisho ni KESHO!',
      daysLeft: 1,
      badgeColor: 'bg-amber-500 text-stone-950 border-amber-600 font-black'
    };
  } else if (diffDays <= 7) {
    return {
      text: isEn ? `${diffDays} days remaining (Urgent)` : `Siku ${diffDays} zimebaki (Haraka)`,
      daysLeft: diffDays,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200 font-bold'
    };
  } else {
    return {
      text: isEn ? `${diffDays} days left` : `Siku ${diffDays} zimebaki`,
      daysLeft: diffDays,
      badgeColor: 'bg-stone-50 text-stone-700 border-stone-200/80 font-bold'
    };
  }
}

export default function OpportunityReminderCalendarPanel({
  allOpportunities,
  lang,
  onViewOpportunity
}: OpportunityReminderCalendarPanelProps) {
  const isEn = lang === 'en';
  const [reminderIds, setReminderIds] = useState<string[]>([]);
  const [trackedOpps, setTrackedOpps] = useState<Opportunity[]>([]);

  // Reload tracked reminders from localStorage
  const loadRemindersAndSync = () => {
    const saved = localStorage.getItem('fundseed_opportunity_reminders');
    if (saved) {
      try {
        const ids: string[] = JSON.parse(saved);
        setReminderIds(ids);
        
        // Find opportunity matches in parent dataset
        const matches = allOpportunities.filter(opp => ids.includes(opp.id));
        setTrackedOpps(matches);
      } catch (err) {
        console.error('Failed to parse reminders array', err);
      }
    } else {
      setReminderIds([]);
      setTrackedOpps([]);
    }
  };

  useEffect(() => {
    loadRemindersAndSync();
    
    // Add custom window event listener for inter-component sync triggers
    window.addEventListener('fundseed_reminder_sync', loadRemindersAndSync);
    return () => {
      window.removeEventListener('fundseed_reminder_sync', loadRemindersAndSync);
    };
  }, [allOpportunities]);

  const removeReminder = (oppId: string) => {
    const updated = reminderIds.filter(id => id !== oppId);
    localStorage.setItem('fundseed_opportunity_reminders', JSON.stringify(updated));
    setReminderIds(updated);
    setTrackedOpps(trackedOpps.filter(opp => opp.id !== oppId));

    // Dispatch global event so that cards sync state instantly
    window.dispatchEvent(new Event('fundseed_reminder_sync'));
  };

  if (trackedOpps.length === 0) {
    return (
      <div className="max-w-5xl mx-auto rounded-2xl border border-dashed border-stone-300 bg-stone-50/40 p-6 md:p-8 text-center animate-fade-in">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-400 border border-stone-200 mb-3">
          <Calendar className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-bold text-stone-850 font-display">
          {isEn ? 'No Application Deadlines Tracked' : 'Hujatenga Makataa ya Kufuatilia Bado'}
        </h4>
        <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
          {isEn 
            ? 'Tap the bell alert trigger 🔔 next to any funding opportunity card to track its deadline relative countdown and add reminders here!'
            : 'Bonyeza kengele ya kualika 🔔 pembeni mwa fursa yoyote ya ruzuku ili uone siku zilizobaki hapa na usikose tarehe ya mwisho!'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto rounded-2xl border border-amber-300/60 bg-gradient-to-br from-amber-50/20 via-white to-stone-50 border-stone-200/80 p-5 shadow-xs space-y-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-stone-150 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700 border border-amber-200">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {isEn ? 'Your Deadlines Calender & Reminders' : 'Kalenda na Vikumbusho vyako vya Makataa'}
            </h3>
            <p className="text-[11px] text-stone-605">
              {isEn 
                ? 'Your actively flagged funding and grant application tracking pipelines' 
                : 'Fursa zilizoteuliwa kukumbushwa na mhudumiaji ili kutozipitisha tarehe'
              }
            </p>
          </div>
        </div>

        <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-[10px] font-black text-amber-800">
          {trackedOpps.length} {isEn ? 'Tracked' : 'Zinafuatiliwa'}
        </span>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {trackedOpps.map((opp) => {
            const countdown = getDeadlineCountdown(opp.deadline, lang);
            const isUrgent = countdown.daysLeft <= 7 && countdown.daysLeft >= 0;

            return (
              <motion.div
                key={opp.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`rounded-xl border p-3.5 bg-white flex flex-col justify-between gap-3 shadow-xs relative transition-all duration-300 ${
                  isUrgent 
                    ? 'border-amber-400 bg-amber-50/5/30 ring-1 ring-amber-500/5' 
                    : 'border-stone-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-1.5">
                    {/* Category Label */}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                      opp.category === 'ruzuku' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      opp.category === 'mkopo' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {opp.category === 'ruzuku' ? (isEn ? 'Grant' : 'Ruzuku') :
                       opp.category === 'mkopo' ? (isEn ? 'Loan' : 'Mikopo') :
                       'Accelerator'}
                    </span>

                    {/* Deadline Relative Badge */}
                    <div className={`px-2 py-0.5 rounded border text-[10px] flex items-center gap-1 ${countdown.badgeColor}`}>
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>{countdown.text}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-stone-850 font-display line-clamp-2 leading-tight">
                      {opp.title}
                    </h4>
                    <p className="text-[10px] text-stone-500 flex items-center gap-1">
                      <span>{isEn ? 'Provider' : 'Mtoa Msaada'}:</span>
                      <span className="font-semibold text-stone-705 truncate max-w-[120px]">{opp.provider}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 bg-stone-50/40 rounded-b-xl -m-3.5 mt-2 p-3">
                  <button
                    onClick={() => removeReminder(opp.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-stone-100 transition-all cursor-pointer"
                    title={isEn ? 'Remove tracking alarm' : 'Ondoa kengele ya kikumbusho'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex items-center space-x-1.5">
                    {/* Compact Calendar addition & integration */}
                    <OpportunityReminderActions 
                      opp={opp} 
                      lang={lang} 
                      compact={true}
                      onReminderChanged={loadRemindersAndSync} 
                    />

                    {/* View/Reveal Card button */}
                    <button
                      onClick={() => onViewOpportunity(opp.id)}
                      className="inline-flex items-center justify-center rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-extrabold px-2.5 py-1.5 tracking-wide transition-all gap-1 cursor-pointer"
                    >
                      <span>{isEn ? 'Open' : 'Fungua'}</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
