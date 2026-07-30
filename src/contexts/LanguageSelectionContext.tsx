import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import {
  languageOptions,
  type LanguageSelectionId,
} from "@/src/components/home/LanguageSelector";
import {
  type AuthActionResult,
  useAuthSession,
} from "@/src/contexts/AuthSessionContext";
import {
  getLanguageSelectionFromPreference,
  getPreferenceFromLanguageSelection,
} from "@/src/utils/languagePreference";

type LanguageSelectionContextValue = {
  selectedLanguage: LanguageSelectionId;
  setSelectedLanguage: (
    language: LanguageSelectionId,
  ) => Promise<AuthActionResult>;
};

const LanguageSelectionContext = createContext<
  LanguageSelectionContextValue | undefined
>(undefined);

export function LanguageSelectionProvider({ children }: PropsWithChildren) {
  const { profile, updateProfile } = useAuthSession();
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageSelectionId>(languageOptions[0].id);

  useEffect(() => {
    if (!profile) {
      return;
    }

    const profileSelection = getLanguageSelectionFromPreference(
      profile.preferredVariety,
    );
    setSelectedLanguage((current) =>
      current === profileSelection ? current : profileSelection,
    );
  }, [profile]);

  const persistSelectedLanguage = useCallback(
    async (language: LanguageSelectionId) => {
      if (language === selectedLanguage) {
        return { ok: true } as const;
      }

      const result = await updateProfile({
        preferredVariety: getPreferenceFromLanguageSelection(language),
      });

      if (result.ok) {
        setSelectedLanguage(language);
      }

      return result;
    },
    [selectedLanguage, updateProfile],
  );

  const value = useMemo(
    () => ({
      selectedLanguage,
      setSelectedLanguage: persistSelectedLanguage,
    }),
    [persistSelectedLanguage, selectedLanguage],
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
