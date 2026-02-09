import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Download, X } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { Button } from '@/components/ui/button';

interface UpdateInfo {
  version: string;
  body: string | null;
}

interface Props {
  update: UpdateInfo;
  onDismiss: () => void;
}

export default function UpdateToast({ update, onDismiss }: Props) {
  const { t } = useI18n();
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    setError(false);
    try {
      await invoke('install_update');
    } catch (e) {
      console.error('Update installation failed:', e);
      setError(true);
      setInstalling(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-indigo-50 rounded-lg">
          <Download className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-900">
              {t.updater.available} (v{update.version})
            </p>
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{t.updater.error}</p>}
          <div className="flex items-center justify-end gap-2 mt-3">
            <Button variant="ghost" size="sm" onClick={onDismiss} disabled={installing}>
              {t.updater.dismiss}
            </Button>
            <Button size="sm" onClick={handleInstall} disabled={installing}>
              {installing ? t.updater.downloading : t.updater.install}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
