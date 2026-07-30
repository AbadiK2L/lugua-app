import type { AuthError, Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { AppState, Platform } from "react-native";

import {
  isSupabaseConfigured,
  supabase,
} from "@/src/lib/supabase";
import {
  mapProfileRow,
  type UserProfile,
  type UserRole,
} from "@/src/types/profile";

const PROFILE_COLUMNS =
  "id, display_name, role, preferred_language, preferred_variety, created_at, updated_at";
const CONFIGURATION_ERROR = "Configuration Supabase manquante";
const PROFILE_ERROR =
  "Ton profil Lugua n’a pas pu être chargé. Vérifie ta connexion puis réessaie.";

export type AuthActionResult =
  | { ok: true }
  | { ok: false; message: string };

export type SignUpResult =
  | {
      ok: true;
      requiresEmailConfirmation: boolean;
    }
  | {
      ok: false;
      message: string;
    };

export type AuthSessionContextValue = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isRefreshingProfile: boolean;
  authError: string | null;
  signIn: (input: {
    email: string;
    password: string;
  }) => Promise<AuthActionResult>;
  signUp: (input: {
    displayName: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<SignUpResult>;
  signOut: () => Promise<AuthActionResult>;
  refreshProfile: () => Promise<AuthActionResult>;
  updateProfile: (updates: {
    displayName?: string;
    preferredVariety?: string;
  }) => Promise<AuthActionResult>;
  clearAuthError: () => void;
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(
  undefined,
);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getAuthErrorMessage(error: AuthError) {
  const message = error.message.toLowerCase();
  const code = error.code?.toLowerCase() ?? "";

  if (message.includes("invalid login credentials")) {
    return "E-mail ou mot de passe incorrect.";
  }

  if (message.includes("email not confirmed")) {
    return "Confirme ton adresse e-mail avant de te connecter.";
  }

  if (
    message.includes("already registered") ||
    code.includes("user_already_exists")
  ) {
    return "Un compte existe déjà avec cette adresse e-mail.";
  }

  if (
    message.includes("password") &&
    (message.includes("short") ||
      message.includes("at least") ||
      message.includes("characters"))
  ) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }

  if (code.includes("over_request_rate_limit") || error.status === 429) {
    return "Trop de tentatives ont été effectuées. Attends un moment puis réessaie.";
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("network request failed") ||
    message.includes("networkerror")
  ) {
    return "Connexion réseau impossible. Vérifie ta connexion puis réessaie.";
  }

  if (
    code.includes("refresh_token") ||
    code.includes("session_not_found") ||
    message.includes("session")
  ) {
    return "Ta session a expiré. Connecte-toi de nouveau.";
  }

  return "L’authentification n’a pas abouti. Réessaie dans un instant.";
}

async function fetchProfile(userId: string) {
  if (!supabase) {
    return { ok: false as const, message: CONFIGURATION_ERROR };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .single();

  if (error || !data) {
    return { ok: false as const, message: PROFILE_ERROR };
  }

  try {
    return { ok: true as const, profile: mapProfileRow(data) };
  } catch {
    return { ok: false as const, message: PROFILE_ERROR };
  }
}

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isProfileResolved, setIsProfileResolved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const profileRequestIdRef = useRef(0);
  const submittingRef = useRef(false);

  const applySession = useCallback((nextSession: Session | null) => {
    const nextUserId = nextSession?.user.id ?? null;

    if (currentUserIdRef.current !== nextUserId) {
      currentUserIdRef.current = nextUserId;
      profileRequestIdRef.current += 1;
      setProfile(null);
      setIsProfileResolved(nextUserId === null);
    }

    setSession(nextSession);
  }, []);

  useEffect(() => {
    let active = true;

    if (!supabase) {
      setAuthError(CONFIGURATION_ERROR);
      setIsSessionReady(true);
      setIsProfileResolved(true);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        applySession(nextSession);
      }
    });

    async function restoreSession() {
      if (!supabase) {
        return;
      }

      const {
        data: { session: restoredSession },
        error,
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (error) {
        setAuthError(getAuthErrorMessage(error));
      }

      applySession(restoredSession);
      setIsSessionReady(true);
    }

    void restoreSession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  useEffect(() => {
    const client = supabase;

    if (Platform.OS === "web" || !client) {
      return;
    }

    const nativeClient = client;

    function updateAutoRefresh(state: string) {
      if (state === "active") {
        nativeClient.auth.startAutoRefresh();
      } else {
        nativeClient.auth.stopAutoRefresh();
      }
    }

    updateAutoRefresh(AppState.currentState);
    const subscription = AppState.addEventListener("change", updateAutoRefresh);

    return () => {
      subscription.remove();
      nativeClient.auth.stopAutoRefresh();
    };
  }, []);

  useEffect(() => {
    if (!isSessionReady) {
      return;
    }

    const userId = session?.user.id;

    if (!userId) {
      setProfile(null);
      setIsProfileResolved(true);
      setIsRefreshingProfile(false);
      return;
    }

    const profileUserId = userId;
    const requestId = profileRequestIdRef.current + 1;
    profileRequestIdRef.current = requestId;
    setIsProfileResolved(false);
    setIsRefreshingProfile(true);

    async function loadProfile() {
      const result = await fetchProfile(profileUserId);

      if (
        profileRequestIdRef.current !== requestId ||
        currentUserIdRef.current !== profileUserId
      ) {
        return;
      }

      if (result.ok) {
        setProfile(result.profile);
        setAuthError(null);
      } else {
        setProfile(null);
        setAuthError(result.message);
      }

      setIsRefreshingProfile(false);
      setIsProfileResolved(true);
    }

    void loadProfile();
  }, [isSessionReady, session?.user.id]);

  const refreshProfile = useCallback(async (): Promise<AuthActionResult> => {
    const userId = session?.user.id;

    if (!userId) {
      const message = "Aucune session active.";
      setAuthError(message);
      return { ok: false, message };
    }

    const requestId = profileRequestIdRef.current + 1;
    profileRequestIdRef.current = requestId;
    setIsRefreshingProfile(true);
    setAuthError(null);

    const result = await fetchProfile(userId);

    if (
      profileRequestIdRef.current === requestId &&
      currentUserIdRef.current === userId
    ) {
      if (result.ok) {
        setProfile(result.profile);
      } else {
        setProfile(null);
        setAuthError(result.message);
      }

      setIsRefreshingProfile(false);
      setIsProfileResolved(true);
    }

    return result.ok
      ? { ok: true }
      : { ok: false, message: result.message };
  }, [session?.user.id]);

  const signIn = useCallback(
    async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }): Promise<AuthActionResult> => {
      if (!supabase || !isSupabaseConfigured) {
        setAuthError(CONFIGURATION_ERROR);
        return { ok: false, message: CONFIGURATION_ERROR };
      }

      if (submittingRef.current) {
        return {
          ok: false,
          message: "Une demande est déjà en cours.",
        };
      }

      submittingRef.current = true;
      setIsSubmitting(true);
      setAuthError(null);

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizeEmail(email),
          password,
        });

        if (error) {
          const message = getAuthErrorMessage(error);
          setAuthError(message);
          return { ok: false, message };
        }

        applySession(data.session);
        return { ok: true };
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [applySession],
  );

  const signUp = useCallback(
    async ({
      displayName,
      email,
      password,
      role,
    }: {
      displayName: string;
      email: string;
      password: string;
      role: UserRole;
    }): Promise<SignUpResult> => {
      if (!supabase || !isSupabaseConfigured) {
        setAuthError(CONFIGURATION_ERROR);
        return { ok: false, message: CONFIGURATION_ERROR };
      }

      if (submittingRef.current) {
        return {
          ok: false,
          message: "Une demande est déjà en cours.",
        };
      }

      submittingRef.current = true;
      setIsSubmitting(true);
      setAuthError(null);

      try {
        const normalizedDisplayName = displayName.trim();
        const { data, error } = await supabase.auth.signUp({
          email: normalizeEmail(email),
          password,
          options: {
            data: {
              display_name: normalizedDisplayName,
              role,
              preferred_language: "shikomori",
              preferred_variety: "general",
            },
          },
        });

        if (error) {
          const message = getAuthErrorMessage(error);
          setAuthError(message);
          return { ok: false, message };
        }

        if (data.user?.identities?.length === 0) {
          const message =
            "Un compte existe déjà avec cette adresse e-mail.";
          setAuthError(message);
          return { ok: false, message };
        }

        if (data.session) {
          applySession(data.session);
        }

        return {
          ok: true,
          requiresEmailConfirmation: data.session === null,
        };
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [applySession],
  );

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    if (!supabase || !isSupabaseConfigured) {
      setAuthError(CONFIGURATION_ERROR);
      return { ok: false, message: CONFIGURATION_ERROR };
    }

    if (submittingRef.current) {
      return {
        ok: false,
        message: "Une demande est déjà en cours.",
      };
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        const message = getAuthErrorMessage(error);
        setAuthError(message);
        return { ok: false, message };
      }

      applySession(null);
      return { ok: true };
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [applySession]);

  const updateProfile = useCallback(
    async ({
      displayName,
      preferredVariety,
    }: {
      displayName?: string;
      preferredVariety?: string;
    }): Promise<AuthActionResult> => {
      if (!supabase || !isSupabaseConfigured) {
        setAuthError(CONFIGURATION_ERROR);
        return { ok: false, message: CONFIGURATION_ERROR };
      }

      const userId = session?.user.id;

      if (!userId) {
        const message = "Ta session a expiré. Connecte-toi de nouveau.";
        setAuthError(message);
        return { ok: false, message };
      }

      if (submittingRef.current) {
        return {
          ok: false,
          message: "Une demande est déjà en cours.",
        };
      }

      const updates: {
        display_name?: string;
        preferred_variety?: string;
      } = {};

      if (displayName !== undefined) {
        const normalizedDisplayName = displayName.trim();

        if (
          normalizedDisplayName.length < 1 ||
          normalizedDisplayName.length > 80
        ) {
          const message =
            "Le nom affiché doit contenir entre 1 et 80 caractères.";
          setAuthError(message);
          return { ok: false, message };
        }

        updates.display_name = normalizedDisplayName;
      }

      if (preferredVariety !== undefined) {
        updates.preferred_variety = preferredVariety;
      }

      if (Object.keys(updates).length === 0) {
        return { ok: true };
      }

      submittingRef.current = true;
      setIsSubmitting(true);
      setAuthError(null);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", userId)
          .select(PROFILE_COLUMNS)
          .single();

        if (error || !data) {
          const message =
            "Le profil n’a pas pu être mis à jour. Vérifie ta connexion puis réessaie.";
          setAuthError(message);
          return { ok: false, message };
        }

        try {
          setProfile(mapProfileRow(data));
          return { ok: true };
        } catch {
          setAuthError(PROFILE_ERROR);
          return { ok: false, message: PROFILE_ERROR };
        }
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [session?.user.id],
  );

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading:
        !isSessionReady || (session !== null && !isProfileResolved),
      isSubmitting,
      isRefreshingProfile,
      authError,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfile,
      clearAuthError: () => setAuthError(null),
    }),
    [
      authError,
      isProfileResolved,
      isRefreshingProfile,
      isSessionReady,
      isSubmitting,
      profile,
      refreshProfile,
      session,
      signIn,
      signOut,
      signUp,
      updateProfile,
    ],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error(
      "useAuthSession doit être utilisé dans AuthSessionProvider",
    );
  }

  return context;
}
