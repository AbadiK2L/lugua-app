import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";

import {
  languageOptions,
  type LanguageSelectionId,
} from "@/src/components/home/LanguageSelector";

type LanguageSelectionContextValue = {
  selectedLanguage: LanguageSelectionId;
  setSelectedLanguage: (language: LanguageSelectionId) => void;
};

const LanguageSelectionContext = createContext<
  LanguageSelectionContextValue | undefined
>(undefined);

export function LanguageSelectionProvider({ children }: PropsWithChildren) {
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageSelectionId>(languageOptions[0].id);
  const value = useMemo(
    () => ({ selectedLanguage, setSelectedLanguage }),
    [selectedLanguage],
  );

  return (
    <LanguageSelectionContext.Provider value={value}>
      {children}
    </LanguageSelectionContext.Provider>
  );
}

export function useLanguageSelection() {
  const context = useContext(LanguageSelectionContext);

  if (!context) {
    throw new Error(
      "useLanguageSelection must be used inside LanguageSelectionProvider",
    );
  }

  return context;
}
