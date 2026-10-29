import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import en from "../locales/en";
import km from "../locales/km";

const LanguageContext = createContext();

const translations = {
  en,
  km,
};

const BACKEND_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const fetchLanguageFromBackend = async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/language/`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.language || null;
  } catch {
    return null;
  }
};

const pushLanguageToBackend = async (lang) => {
  try {
    await fetch(`${BACKEND_URL}/api/language/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: lang }),
    });
  } catch {
    // ignore network error
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || localStorage.getItem("admin_language") || "km";
  });

  useEffect(() => {
    localStorage.setItem("admin_language", language);
    localStorage.setItem("language", language);
    document.documentElement.lang = language === "km" ? "km" : "en";
  }, [language]);

  // Backend polling — sync every 2 seconds with frontend_user
  useEffect(() => {
    const poll = async () => {
      const backendLang = await fetchLanguageFromBackend();
      if ((backendLang === "en" || backendLang === "km") && backendLang !== language) {
        setLanguage(backendLang);
        localStorage.setItem("language", backendLang);
        localStorage.setItem("admin_language", backendLang);
      }
    };

    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [language]);

  const changeLanguage = (lang) => {
    if (lang === "en" || lang === "km") {
      setLanguage(lang);
      localStorage.setItem("language", lang);
      localStorage.setItem("admin_language", lang);
      pushLanguageToBackend(lang);
    }
  };


  const t = (key) => {
    const keys = key.split(".");

    let result = translations[language];

    for (const item of keys) {
      if (result?.[item] === undefined) {
        return key;
      }

      result = result[item];
    }

    return result;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
};

export default LanguageContext;