import fs from 'fs';
const content1 = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');
const content2 = fs.readFileSync('src/App.tsx', 'utf8');
const translationsContent = fs.readFileSync('src/translations.ts', 'utf8');

const keys = [...content1.matchAll(/uiTranslations\.([a-zA-Z0-9_]+)/g), ...content2.matchAll(/uiTranslations\.([a-zA-Z0-9_]+)/g)].map(m => m[1]);
const uniqueKeys = [...new Set(keys)];

const missing = uniqueKeys.filter(k => !translationsContent.includes(k + ':'));
console.log('Missing keys:', missing);
