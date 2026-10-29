import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(() => {
    try { return JSON.parse(localStorage.getItem('crxs_selected_app')); } catch { return null; }
  });

  const fetchApps = async () => {
    const token = localStorage.getItem('crxs_token');
    if (!token) {
      setApps([]);
      return;
    }
    try {
      const res = await api.get('/apps');
      if (res.data.success) {
        setApps(res.data.apps);
        // Keep the selected app in sync (rename, pause/resume, etc.) and fall back to the first app
        const current = res.data.apps.find((a) => a._id === selectedApp?._id);
        if (current) {
          selectApp(current);
        } else if (res.data.apps.length > 0) {
          selectApp(res.data.apps[0]);
        } else {
          setSelectedApp(null);
          localStorage.removeItem('crxs_selected_app');
        }
      }
    } catch {}
  };

  const selectApp = (app) => {
    setSelectedApp(app);
    localStorage.setItem('crxs_selected_app', JSON.stringify(app));
  };

  useEffect(() => { fetchApps(); }, []);

  return (
    <AppContext.Provider value={{ apps, selectedApp, selectApp, fetchApps }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
