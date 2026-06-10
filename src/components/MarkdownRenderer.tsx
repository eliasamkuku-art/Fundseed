import React from 'react';

interface MarkdownRendererProps {
  content: string;
  textColor?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, textColor }) => {
  if (!content) return null;

  const parseInlineStyles = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*\*|___)(.*?)\1|(\*\*|__)(.*?)\3|(\*|_)(.*?)\5/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      
      // Add plain text preceding the style match
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }

      if (match[1]) {
        // Bold Italic: ***text***
        parts.push(
          <strong key={matchIndex} className={`font-extrabold italic px-0.5 rounded ${textColor || 'text-stone-950'} bg-emerald-50`}>
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Bold: **text**
        parts.push(
          <strong key={matchIndex} className={`font-extrabold px-0.5 rounded ${textColor || 'text-stone-950'} bg-emerald-50/80`}>
            {match[4]}
          </strong>
        );
      } else if (match[5]) {
        // Italic: *text*
        parts.push(
          <em key={matchIndex} className={`italic ${textColor || 'text-stone-800'}`}>
            {match[6]}
          </em>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;
  const listTextColor = textColor || 'text-stone-700';

  const flushList = (key: number) => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={`ul-${key}`} className={`my-2 space-y-1.5 list-disc pl-5 ${listTextColor}`}>
            {currentList.items}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${key}`} className={`my-2 space-y-1.5 list-decimal pl-5 ${listTextColor}`}>
            {currentList.items}
          </ol>
        );
      }
      currentList = null;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check for Headings
    if (trimmed.startsWith('### ')) {
      flushList(index);
      const headingText = trimmed.replace('### ', '');
      elements.push(
        <h4 key={index} className={`text-sm font-extrabold ${textColor || 'text-stone-900'} mt-4 mb-2 flex items-center gap-1.5`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
          {parseInlineStyles(headingText)}
        </h4>
      );
    } else if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      flushList(index);
      const headingText = trimmed.startsWith('## ') ? trimmed.replace('## ', '') : trimmed.replace('# ', '');
      elements.push(
        <h3 key={index} className={`text-base font-black ${textColor || 'text-stone-900'} mt-5 mb-2.5 border-b pb-1 border-stone-100 flex items-center gap-2`}>
          {parseInlineStyles(headingText)}
        </h3>
      );
    }
    // Check for Bullet Lists
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.substring(2);
      if (!currentList || currentList.type !== 'ul') {
        flushList(index);
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(
        <li key={`li-${index}`} className={`text-sm ${listTextColor} leading-relaxed`}>
          {parseInlineStyles(itemText)}
        </li>
      );
    }
    // Check for Numbered Lists
    else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      const itemText = match ? match[2] : trimmed;
      if (!currentList || currentList.type !== 'ol') {
        flushList(index);
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(
        <li key={`li-${index}`} className={`text-sm ${listTextColor} leading-relaxed`}>
          {parseInlineStyles(itemText)}
        </li>
      );
    }
    // Plain line or blank line
    else {
      flushList(index);
      if (trimmed === '') {
        elements.push(<div key={`blank-${index}`} className="h-1.5" />);
      } else {
        elements.push(
          <p key={index} className={`text-sm ${textColor || 'text-stone-750'} leading-relaxed my-2`}>
            {parseInlineStyles(line)}
          </p>
        );
      }
    }
  });

  // Flush any remaining list at the end
  flushList(lines.length);

  return <div className={`space-y-1 ${textColor || 'text-stone-800'}`}>{elements}</div>;
};
