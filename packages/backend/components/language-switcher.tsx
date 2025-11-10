'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCurrentLocale, setLocale, type Locale } from '@/lib/i18n';

export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('th');

  useEffect(() => {
    setCurrentLocale(getCurrentLocale());
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    setLocale(locale);
    setCurrentLocale(locale);
    // Reload page to apply new locale
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Switch Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLocaleChange('th')}
          className={currentLocale === 'th' ? 'bg-accent' : ''}
        >
           ภาษาไทย
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLocaleChange('en')}
          className={currentLocale === 'en' ? 'bg-accent' : ''}
        >
           English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
