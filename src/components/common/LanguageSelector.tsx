import { Globe } from 'lucide-react';
import { useI18n, LANGUAGE_OPTIONS } from '../../lib/i18n';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'ko' | 'en')}
        className="flex-1 text-sm bg-transparent border-none outline-none cursor-pointer text-gray-700 hover:text-gray-900"
        title={t.settings.languageHint}
      >
        {LANGUAGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
