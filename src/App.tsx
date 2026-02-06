import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { listen } from '@tauri-apps/api/event';
import { SearchProvider } from './lib/SearchContext';
import { I18nProvider } from './lib/i18n';
import { ToastProvider } from './lib/ToastContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import UpdateToast from './components/common/UpdateToast';
import ToastContainer from './components/common/Toast';
import AppLayout from './components/layout/AppLayout';
import SearchPage from './pages/SearchPage';
import FavoritesPage from './pages/FavoritesPage';
import StatsPage from './pages/StatsPage';
import ItemDetailPage from './pages/ItemDetailPage';

interface UpdateInfo {
  version: string;
  body: string | null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    const unlisten = listen<UpdateInfo>('update-available', (event) => {
      setUpdateInfo(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ErrorBoundary>
          <ToastProvider>
            <BrowserRouter>
              <SearchProvider>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<SearchPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/stats" element={<StatsPage />} />
                    <Route path="/item/:id" element={<ItemDetailPage />} />
                  </Routes>
                </AppLayout>
                <ToastContainer />
              </SearchProvider>
            </BrowserRouter>
          </ToastProvider>
        </ErrorBoundary>
        {updateInfo && <UpdateToast update={updateInfo} onDismiss={() => setUpdateInfo(null)} />}
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
