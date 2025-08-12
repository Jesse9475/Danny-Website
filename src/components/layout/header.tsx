'use client';

import { useState } from 'react';
import { Car, Settings, Globe, Sun, Moon, HelpCircle, X, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/lib/language-context';
import { useTheme } from '@/lib/theme-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang as any);
    setIsLanguageModalOpen(false);
  };

  const handleThemeSelect = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsThemeModalOpen(false);
  };

  const languages = [
    { code: 'en', name: t('language.english'), flag: '🇺🇸' },
    { code: 'es', name: t('language.spanish'), flag: '🇪🇸' },
    { code: 'ar', name: t('language.arabic'), flag: '🇸🇦' },
    { code: 'ko', name: t('language.korean'), flag: '🇰🇷' },
    { code: 'zh', name: t('language.chinese'), flag: '🇨🇳' },
  ];

  const themes = [
    { value: 'light', name: t('settings.lightMode'), icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', name: t('settings.darkMode'), icon: <Moon className="h-4 w-4" /> },
    { value: 'system', name: 'System', icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <>
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 relative">
          <div className="flex items-center justify-between">
            {/* Left side - Logo */}
            <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
              <Car className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">{t('header.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('header.subtitle')}</p>
              </div>
            </Link>
            
            {/* Center - Navigation */}
            <nav className="flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                {t('nav.home')}
              </Link>
              <Link href="/inventory" className="text-sm font-medium hover:text-primary transition-colors">
                {t('nav.inventory')}
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                {t('nav.about')}
              </Link>
            </nav>

            {/* Right side - Settings */}
            <div className="flex items-center space-x-4">
              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 p-2">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-[100]">
                  <DropdownMenuItem 
                    className="flex items-center gap-2"
                    onClick={() => setIsLanguageModalOpen(true)}
                  >
                    <Globe className="h-4 w-4" />
                    {t('settings.language')}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2"
                    onClick={() => setIsThemeModalOpen(true)}
                  >
                    {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    Theme
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    {t('settings.help')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Language Selection Modal */}
      <Dialog open={isLanguageModalOpen} onOpenChange={setIsLanguageModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {t('settings.language')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={language === lang.code ? "default" : "outline"}
                className="h-16 text-lg justify-start"
                onClick={() => handleLanguageSelect(lang.code)}
              >
                <span className="text-2xl mr-4">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
                {language === lang.code && (
                  <span className="ml-auto text-sm bg-primary-foreground text-primary px-2 py-1 rounded">
                    {t('common.selected')}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Theme Selection Modal */}
      <Dialog open={isThemeModalOpen} onOpenChange={setIsThemeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Theme
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {themes.map((themeOption) => (
              <Button
                key={themeOption.value}
                variant={theme === themeOption.value ? "default" : "outline"}
                className="h-16 text-lg justify-start"
                onClick={() => handleThemeSelect(themeOption.value as 'light' | 'dark' | 'system')}
              >
                <span className="mr-4">{themeOption.icon}</span>
                <span className="font-medium">{themeOption.name}</span>
                {theme === themeOption.value && (
                  <span className="ml-auto text-sm bg-primary-foreground text-primary px-2 py-1 rounded">
                    {t('common.selected')}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 