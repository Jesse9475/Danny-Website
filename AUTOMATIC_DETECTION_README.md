# Automatic Theme & Language Detection

This application automatically detects and applies your device's theme and language preferences, providing a seamless user experience that adapts to your system settings.

## 🌙 Automatic Dark Mode Detection

### How It Works
- **System Detection**: The app automatically detects your device's theme preference using `window.matchMedia('(prefers-color-scheme: dark')`
- **Real-time Updates**: Changes to your system theme are detected in real-time and applied immediately
- **Smart Fallback**: If system detection fails, the app gracefully falls back to a default theme

### Theme Options
1. **System (Default)**: Automatically follows your device's theme setting
2. **Light Mode**: Always uses light theme regardless of system preference
3. **Dark Mode**: Always uses dark theme regardless of system preference

### Technical Implementation
- Uses CSS custom properties for theme variables
- Implements `useEffect` hooks to listen for system theme changes
- Stores user preference in localStorage for persistence
- Handles SSR gracefully with hydration warnings suppressed

## 🌍 Automatic Language Detection

### How It Works
- **Browser Detection**: Automatically detects your browser's language using `navigator.language`
- **Smart Mapping**: Maps browser language codes to supported application languages
- **Fallback Chain**: Falls back to English if your language isn't supported

### Supported Languages
- **English (en)**: Default language
- **Spanish (es)**: Español
- **Arabic (ar)**: العربية
- **Korean (ko)**: 한국어
- **Chinese (zh)**: 中文

### Language Detection Priority
1. **User Selection**: Manually chosen language (stored in localStorage)
2. **Browser Language**: Automatically detected from `navigator.language`
3. **Fallback**: English (en) if detection fails

### Technical Implementation
- Implements React Context for global language state
- Uses translation keys for all user-facing text
- Automatically switches text direction for RTL languages (Arabic)
- Persists language preference in localStorage

## 🚀 Getting Started

### For Users
1. **Theme**: Your device's theme will be automatically applied
2. **Language**: Your browser's language will be automatically detected
3. **Manual Override**: You can manually change themes and languages using the settings panel

### For Developers
1. **Theme Context**: Use `useTheme()` hook to access theme state
2. **Language Context**: Use `useLanguage()` hook to access language state
3. **Translation**: Use `t('key')` function to get translated text

## 📱 Mobile & System Integration

### iOS/macOS
- Automatically detects system appearance (Light/Dark/Auto)
- Responds to Control Center theme changes
- Integrates with system-wide dark mode

### Android
- Detects system theme preference
- Responds to Quick Settings theme toggle
- Integrates with Material Design theme system

### Windows
- Detects Windows theme setting
- Responds to system theme changes
- Integrates with Windows 10/11 dark mode

## 🔧 Customization

### Adding New Languages
1. Add language code to `Language` type in `language-context.tsx`
2. Add translations to the `translations` object
3. Update language detection mapping if needed

### Adding New Theme Variables
1. Define CSS custom properties in `globals.css`
2. Add theme-specific values for light/dark modes
3. Use the variables in your components

## 🐛 Troubleshooting

### Theme Not Updating
- Check if system theme detection is working
- Verify localStorage isn't blocking the app
- Check browser console for errors

### Language Not Detecting
- Verify browser language is set correctly
- Check if language is in supported list
- Clear localStorage and refresh

### Performance Issues
- Theme changes are optimized with CSS variables
- Language switching is instant with pre-loaded translations
- No unnecessary re-renders during theme/language changes

## 📊 Browser Support

- **Chrome**: Full support for theme and language detection
- **Firefox**: Full support for theme and language detection
- **Safari**: Full support for theme and language detection
- **Edge**: Full support for theme and language detection
- **Mobile Browsers**: Full support across iOS Safari and Chrome Mobile

## 🎯 Best Practices

1. **Always provide fallbacks** for unsupported languages
2. **Test theme switching** on different devices and browsers
3. **Use semantic color names** in CSS for better theme support
4. **Implement RTL support** for languages like Arabic
5. **Cache translations** for better performance
6. **Handle SSR gracefully** with proper hydration

## 🔗 Related Files

- `src/lib/theme-context.tsx` - Theme management and detection
- `src/lib/language-context.tsx` - Language management and detection
- `src/components/ui/theme-language-demo.tsx` - Demo component
- `src/app/globals.css` - Theme CSS variables
- `src/app/layout.tsx` - Root layout with providers
- `src/app/admin/layout.tsx` - Admin layout with providers
