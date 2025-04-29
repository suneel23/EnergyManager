import React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Language } from '@/lib/translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();

  const languages: { value: Language; label: string; flag: string }[] = [
    { value: 'en', label: 'English', flag: '🇬🇧' },
    { value: 'ru', label: 'Русский', flag: '🇷🇺' },
    { value: 'tj', label: 'Тоҷикӣ', flag: '🇹🇯' },
  ];

  return (
    <div className={className}>
      <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
        <SelectTrigger className="w-[180px]">
          <Globe className="h-4 w-4 mr-2" />
          <SelectValue placeholder={t('language')} />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              <div className="flex items-center">
                <span className="mr-2">{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Mini version for mobile or compact displays
export function LanguageSwitcherMini({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  const getFlag = (lang: Language): string => {
    switch (lang) {
      case 'en': return '🇬🇧';
      case 'ru': return '🇷🇺';
      case 'tj': return '🇹🇯';
      default: return '🇬🇧';
    }
  };

  const languages: Language[] = ['en', 'ru', 'tj'];
  const nextLanguage = languages[(languages.indexOf(language) + 1) % languages.length];

  return (
    <button 
      className={`flex items-center justify-center p-2 rounded-md hover:bg-accent ${className}`} 
      onClick={() => setLanguage(nextLanguage)}
      aria-label="Change language"
    >
      <span className="text-xl">{getFlag(language)}</span>
    </button>
  );
}