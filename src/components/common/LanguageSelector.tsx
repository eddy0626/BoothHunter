import { Globe } from 'lucide-react';
import { useI18n, LANGUAGE_OPTIONS } from '../../lib/i18n';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex-1">
            <Select value={language} onValueChange={(v) => setLanguage(v as 'ko' | 'en')}>
              <SelectTrigger className="h-8 border-none shadow-none text-sm text-gray-700 hover:text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.nativeLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">{t.settings.languageHint}</TooltipContent>
      </Tooltip>
    </div>
  );
}
