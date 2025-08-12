'use client';

import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, Moon, Monitor, Globe } from 'lucide-react';

export function ThemeLanguageDemo() {
  const { theme, setTheme, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getLanguageName = (langCode: string) => {
    const languageNames = {
      en: 'English',
      es: 'Español',
      ar: 'العربية',
      ko: '한국어',
      zh: '中文'
    };
    return languageNames[langCode as keyof typeof languageNames] || langCode;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Theme Detection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getThemeIcon(theme)}
            {t('settings.theme')}
          </CardTitle>
          <CardDescription>
            {t('settings.theme')} {t('settings.system')} - {t('settings.darkMode')} / {t('settings.lightMode')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('settings.system')}:</span>
            <Badge variant={theme === 'system' ? 'default' : 'secondary'}>
              {theme === 'system' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('settings.darkMode')}:</span>
            <Badge variant={isDark ? 'default' : 'secondary'}>
              {isDark ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((themeOption) => (
              <button
                key={themeOption}
                onClick={() => setTheme(themeOption)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  theme === themeOption
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {themeOption === 'light' && <Sun className="h-3 w-3 inline mr-1" />}
                {themeOption === 'dark' && <Moon className="h-3 w-3 inline mr-1" />}
                {themeOption === 'system' && <Monitor className="h-3 w-3 inline mr-1" />}
                {themeOption}
              </button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>• {t('settings.system')}: Automatically follows your device's theme</p>
            <p>• {t('settings.darkMode')}: Always dark mode</p>
            <p>• {t('settings.lightMode')}: Always light mode</p>
          </div>
        </CardContent>
      </Card>

      {/* Language Detection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t('settings.language')}
          </CardTitle>
          <CardDescription>
            Automatically detected from your browser settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Language:</span>
            <Badge variant="default">
              {getLanguageName(language)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(['en', 'es', 'ar', 'ko', 'zh'] as const).map((langCode) => (
              <button
                key={langCode}
                onClick={() => setLanguage(langCode)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  language === langCode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {getLanguageName(langCode)}
              </button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>• Language is automatically detected from your browser</p>
            <p>• You can manually override the selection</p>
            <p>• Your preference is saved for future visits</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
