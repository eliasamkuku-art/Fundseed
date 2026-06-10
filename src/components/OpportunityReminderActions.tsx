import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, Calendar, Download, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { Opportunity } from '../types';

interface OpportunityReminderActionsProps {
  opp: Opportunity;
  lang: 'sw' | 'en';
  compact?: boolean;
  onReminderChanged?: () => void;
}

// Resilient Swahili and English deadline date parser
export function getParsedDeadlineDate(deadline: string): Date {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // Default to current month
  let day = now.getDate() + 7; // Default to 1 week from now if not parseable

  const lower = deadline.toLowerCase();

  // If ongoing or not specific date, default to 1 month from now
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
    const target = new Date();
    target.setMonth(target.getMonth() + 1);
    return target;
  }

  // Look for 4-digit year (e.g. 2026, 2027)
  const yearMatch = deadline.match(/\b(202[4-9]|203[0-9])\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10);
  }

  // Look for days (1-31)
  const dayMatch = deadline.match(/\b([1-9]|[12][0-9]|3[01])\b/g);
  if (dayMatch) {
    // filter out any match that is the same as the year
    const dayVal = dayMatch.find(d => parseInt(d, 10) !== year);
    if (dayVal) {
      day = parseInt(dayVal, 10);
    }
  }

  // Look for month matching
  const months_en = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const months_sw = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'ago', 'sep', 'okt', 'nov', 'des'];

  for (let i = 0; i < 12; i++) {
    if (lower.includes(months_en[i]) || lower.includes(months_sw[i])) {
      month = i;
      break;
    }
  }

  const result = new Date(year, month, day, 10, 0, 0); // 10:00 AM
  if (isNaN(result.getTime())) {
    const target = new Date();
    target.setDate(target.getDate() + 7);
    return target;
  }
  return result;
}

export default function OpportunityReminderActions({
  opp,
  lang,
  compact = false,
  onReminderChanged
}: OpportunityReminderActionsProps) {
  const isEn = lang === 'en';
  const [hasReminder, setHasReminder] = useState(false);
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync state for whether tracking reminder is enabled
  useEffect(() => {
    const saved = localStorage.getItem('fundseed_opportunity_reminders');
    if (saved) {
      try {
        const ids: string[] = JSON.parse(saved);
        setHasReminder(ids.includes(opp.id));
      } catch (e) {
        console.error(e);
      }
    }
  }, [opp.id]);

  // Click outside listener for the dropdown menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCalendarMenu(false);
      }
    }
    if (showCalendarMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendarMenu]);

  // Handle local reminder toggle
  const toggleReminder = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const saved = localStorage.getItem('fundseed_opportunity_reminders') || '[]';
    let ids: string[] = [];
    try {
      ids = JSON.parse(saved);
    } catch (err) {
      ids = [];
    }

    let nextState = false;
    let updated: string[] = [];
    
    if (ids.includes(opp.id)) {
      updated = ids.filter(id => id !== opp.id);
      nextState = false;
      const msg = isEn 
        ? `Reminder removed for "${opp.title}"` 
        : `Kikumbusho kimeondolewa kwa "${opp.title}"`;
      triggerToast(msg);
    } else {
      updated = [...ids, opp.id];
      nextState = true;
      const msg = isEn 
        ? `Reminder set for "${opp.title}"! We will show tracking countdowns in your calendar panel.` 
        : `Kikumbusho kimewekwa kwa "${opp.title}"! Utaona hesabu ya siku zilizobaki kwenye kalenda yako.`;
      triggerToast(msg);
      
      // Attempt standard browser notification requests gracefully
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        } else if (Notification.permission === 'granted') {
          try {
            new Notification(isEn ? 'FundSeed Deadline Alert Set' : 'Kikumbusho cha FundSeed Kimewekwa', {
              body: isEn 
                ? `You will track the deadline for ${opp.title}: ${opp.deadline}`
                : `Utafuatilia tarehe ya mwisho ya ${opp.title}: ${opp.deadline}`,
              icon: '/logo.png'
            });
          } catch (e) {
            console.warn('Notification construction bypassed', e);
          }
        }
      }
    }

    localStorage.setItem('fundseed_opportunity_reminders', JSON.stringify(updated));
    setHasReminder(nextState);
    if (onReminderChanged) {
      onReminderChanged();
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  // Helper parser variables
  const targetDate = getParsedDeadlineDate(opp.deadline);
  
  // Format iCal date helper (YYYYMMDDTHHMMSSZ)
  const formatIcalDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startStamp = formatIcalDate(targetDate);
  const endStamp = formatIcalDate(new Date(targetDate.getTime() + 2 * 60 * 60 * 1000)); // 2 hours duration
  const nowStamp = formatIcalDate(new Date());

  // Generate Google Calendar Link
  const getGoogleCalendarUrl = () => {
    const title = `FundSeed: ${opp.title}`;
    const details = `${isEn ? 'Provider' : 'Mtoa Programu'}: ${opp.provider}\n${isEn ? 'Max Amount' : 'Kiwango cha Juu'}: ${opp.amount}\n\n${opp.description}\n\n--- ${isEn ? 'Generated by FundSeed' : 'Imeandaliwa na FundSeed'}`;
    const location = opp.origin;
    
    // Google Calendar template actions URL format (dates are YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ)
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startStamp}/${endStamp}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&sf=true&output=xml`;
  };

  // Generate and Download iCalendar (.ics) File
  const handleDownloadIcs = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCalendarMenu(false);

    const titleStr = opp.title.replace(/[,;]/g, '\\$&');
    const descStr = opp.description.replace(/[,;]/g, '\\$&').replace(/\n/g, '\\n');
    const providerStr = opp.provider.replace(/[,;]/g, '\\$&');
    const amountStr = opp.amount.replace(/[,;]/g, '\\$&');
    const locationStr = opp.origin.replace(/[,;]/g, '\\$&');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FundSeed Tanzania//NONSGML Deadlines Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:opp-event-${opp.id}-${Date.now()}@fundseed.co.tz`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART:${startStamp}`,
      `DTEND:${endStamp}`,
      `SUMMARY:${titleStr}`,
      `DESCRIPTION:${descStr}\\n\\nProvider: ${providerStr}\\nInvestment Range: ${amountStr}\\n\\nPowered by FundSeed Tanzania`,
      `LOCATION:${locationStr}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'TRANSP:OPAQUE',
      'BEGIN:VALARM',
      'TRIGGER:-P1D', // Alarm 1 day before
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: FundSeed Funding Deadline tomorrow',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    try {
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileSafeName = opp.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .substring(0, 30);
      
      link.setAttribute('download', `fundseed_${fileSafeName}_deadline.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      triggerToast(isEn ? 'ICS Calendar file downloaded!' : 'Faili la ICS la kalenda limepakuliwa!');
    } catch (err) {
      console.error(err);
      triggerToast(isEn ? 'Failed to download calendar file.' : 'Imeshindwa kupakua faili la kalenda.');
    }
  };

  if (compact) {
    return (
      <div className="relative inline-flex items-center space-x-1.5 z-10">
        <button
          onClick={toggleReminder}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            hasReminder 
              ? 'bg-amber-50 border-amber-300 text-amber-600 shadow-2xs' 
              : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-100'
          }`}
          title={hasReminder 
            ? (isEn ? 'Remove Reminder' : 'Ondoa Kikumbusho') 
            : (isEn ? 'Set Deadline Alert' : 'Weka Kikumbusho')
          }
        >
          <Bell className={`h-3.5 w-3.5 ${hasReminder ? 'fill-current animate-pulse' : ''}`} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowCalendarMenu(!showCalendarMenu);
          }}
          className="p-1.5 rounded-lg border bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-all cursor-pointer"
          title={isEn ? 'Add to Calendar' : 'Hifadhi kwenye Kalenda'}
        >
          <Calendar className="h-3.5 w-3.5" />
        </button>

        {/* Dropdown Calendar menu */}
        {showCalendarMenu && (
          <div 
            ref={menuRef}
            className="absolute top-8 right-0 bg-white border border-stone-200 rounded-xl shadow-lg z-50 py-1.5 w-48 text-left text-xs animate-fade-in"
          >
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowCalendarMenu(false)}
              className="px-3 py-2 hover:bg-stone-50 text-stone-700 flex items-center space-x-2 border-b border-stone-100"
            >
              <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
              <span>Google Calendar</span>
            </a>
            <button
              onClick={handleDownloadIcs}
              className="w-full text-left px-3 py-2 hover:bg-stone-50 text-stone-700 flex items-center space-x-2 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              <span>Apple / iCal (ICS)</span>
            </button>
          </div>
        )}

        {/* In-app Notification toast */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl bg-stone-900/95 border border-stone-800 p-4 text-white shadow-xl flex items-start gap-2.5 animate-slide-up backdrop-blur-md">
            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
              <Check className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium leading-relaxed">{toastMessage}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto relative">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl bg-stone-900/95 border border-stone-800 p-4 text-white shadow-xl flex items-start gap-2.5 animate-slide-up backdrop-blur-md">
          <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
            <Check className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium leading-relaxed">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Reminder Toggle Button */}
      <button
        type="button"
        onClick={toggleReminder}
        className={`inline-flex items-center justify-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-lg border transition-all cursor-pointer ${
          hasReminder
            ? 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-300 text-amber-700'
            : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
        }`}
      >
        <Bell className={`h-4 w-4 ${hasReminder ? 'fill-current text-amber-600 animate-pulse' : ''}`} />
        <span>
          {hasReminder 
            ? (isEn ? 'Tracking Deadline' : 'Makataa Yanafuatiliwa') 
            : (isEn ? 'Set Alarm' : 'Nikumbushe Mara Moja')
          }
        </span>
      </button>

      {/* Save to Calendar Trigger Dropdown Button */}
      <div className="relative inline-block w-full sm:w-auto" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowCalendarMenu(!showCalendarMenu);
          }}
          className="w-full inline-flex items-center justify-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-all cursor-pointer"
        >
          <Calendar className="h-4 w-4 text-stone-500" />
          <span>{isEn ? 'Add to Calendar' : 'Hifadhi kwenye Kalenda'}</span>
        </button>

        {showCalendarMenu && (
          <div className="absolute right-0 bottom-12 sm:bottom-auto sm:top-11 bg-white border border-stone-200 rounded-xl shadow-xl z-50 py-2 w-full sm:w-48 text-left text-xs text-stone-700 animate-fade-in">
            <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-50 mb-1">
              {isEn ? 'Select Platform' : 'Chagua Kalenda'}
            </div>
            
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowCalendarMenu(false)}
              className="px-3 py-2.5 hover:bg-stone-50 text-stone-800 flex items-center space-x-2.5 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4 text-blue-500 shrink-0" />
              <span>Google Calendar</span>
            </a>

            <button
              type="button"
              onClick={handleDownloadIcs}
              className="w-full text-left px-3 py-2.5 hover:bg-stone-50 text-stone-800 flex items-center space-x-2.5 cursor-pointer"
            >
              <Download className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Apple / Outlook (iCal .ics)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
