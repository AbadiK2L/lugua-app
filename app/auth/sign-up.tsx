import { router, type Href } from "expo-router";
import { useRef, useState } from "react";
import {
  Pressable,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AuthButton } from "@/src/components/auth/AuthButton";
import { AuthForm } from "@/src/components/auth/AuthForm";
import { AuthScreenShell } from "@/src/components/auth/AuthScreenShell";
import { AuthTextField } from "@/src/components/auth/AuthTextField";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { useAuthSession } from "@/src/contexts/AuthSessionContext";
import type { UserRole } from "@/src/types/profile";

type SignUpErrors = {
  displayName?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  role?: string;
};

const roleOptions: {
  role: UserRole;
  label: string;
  description: string;
}[] = [
  {
    role: "student",
    label: "Élève",
    description:
      "J’apprends le shiKomori avec des leçons, des scénarios et du contenu oral.",
  },
  {
    role: "teacher",
    label: "Professeur",
    description:
      "Je crée des cours, organise mes classes et prépare des devoirs.",
  },
];

function RoleOption({
  option,
  selected,
  onSelect,
}: {
  option: (typeof roleOptions)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={option.label}
      accessibilityHint={option.description}
      accessibilityState={{ selected }}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.roleOption,
        selected && styles.roleOptionSelected,
        focused && styles.focused,
        pressed && styles.pressed,
      ]}
    >
      <View
        aria-hidden
        style={[styles.radio, selected && styles.radioSelected]}
      >
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.roleCopy}>
        <Text style={styles.roleTitle}>{option.label}</Text>
        <Text style={styles.roleDescription}>{option.description}</Text>
      </View>
    </Pressable>
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignUpScreen() {
  const { signUp, isSubmitting, authError, clearAuthError } = useAuthSession();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmationRef = useRef<TextInput>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(
    null,
  );

  function resetSubmissionError() {
    setFormError(null);
    clearAuthError();
  }

  async function submit() {
    if (isSubmitting) {
      return;
    }

    const normalizedDisplayName = displayName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const nextErrors: SignUpErrors = {};

    if (!normalizedDisplayName) {
      nextErrors.displayName = "Saisis un nom affiché.";
    } else if (normalizedDisplayName.length > 80) {
      nextErrors.displayName =
        "Le nom affiché ne peut pas dépasser 80 caractères.";
    }

    if (!normalizedEmail) {
      nextErrors.email = "Saisis ton adresse e-mail.";
    } else if (!isValidEmail(normalizedEmail)) {
      nextErrors.email = "Saisis une adresse e-mail valide.";
    }

    if (password.length < 8) {
      nextErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères.";
    }

    if (passwordConfirmation !== password) {
      nextErrors.passwordConfirmation =
        "Les deux mots de passe ne correspondent pas.";
    }

    if (!role) {
      nextErrors.role = "Choisis ton rôle Lugua.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !role) {
      return;
    }

    clearAuthError();
    setFormError(null);
    const result = await signUp({
      displayName: normalizedDisplayName,
      email: normalizedEmail,
      password,
      role,
    });

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    if (result.requiresEmailConfirmation) {
      setConfirmationEmail(normalizedEmail);
    }
  }

  if (confirmationEmail) {
    return (
      <AuthScreenShell
        title="Vérifie ton adresse e-mail"
        subtitle={`Un message de confirmation a été envoyé à ${confirmationEmail}. Confirme ton adresse, puis connecte-toi.`}
      >
        <View style={styles.actions}>
          <AuthButton
            label="Aller à la connexion"
            onPress={() => router.replace("/auth/sign-in" as Href)}
          />
          <AuthButton
            label="Utiliser une autre adresse"
            variant="secondary"
            onPress={() => {
              setConfirmationEmail(null);
              setEmail("");
              setPassword("");
              setPasswordConfirmation("");
              resetSubmissionError();
            }}
          />
        </View>
      </AuthScreenShell>
    );
  }

  return (
    <AuthScreenShell
      title="Créer un compte"
      subtitle="Choisis ton rôle une seule fois. Ton profil ouvrira ensuite toujours le bon espace."
      onBack={() => {
        clearAuthError();
        router.back();
      }}
    >
      <AuthForm
        style={styles.form}
        onSubmit={() => {
          void submit();
        }}
      >
        <AuthTextField
          label="Nom affiché"
          error={errors.displayName}
          hint="Entre 1 et 80 caractères."
          value={displayName}
          onChangeText={(value) => {
            setDisplayName(value);
            setErrors((current) => ({
              ...current,
              displayName: undefined,
            }));
            resetSubmissionError();
          }}
          autoCapitalize="words"
          autoComplete="name"
          maxLength={80}
          returnKeyType="next"
          textContentType="name"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <AuthTextField
          ref={emailRef}
          label="E-mail"
          error={errors.email}
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setErrors((current) => ({ ...current, email: undefined }));
            resetSubmissionError();
          }}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="next"
          textContentType="emailAddress"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <AuthTextField
          ref={passwordRef}
          label="Mot de passe"
          error={errors.password}
          hint="8 caractères minimum."
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setErrors((current) => ({ ...current, password: undefined }));
            resetSubmissionError();
          }}
          autoCapitalize="none"
          autoComplete="new-password"
          returnKeyType="next"
          secureTextEntry
          textContentType="newPassword"
          onSubmitEditing={() => confirmationRef.current?.focus()}
        />
        <AuthTextField
          ref={confirmationRef}
          label="Confirmer le mot de passe"
          error={errors.passwordConfirmation}
          value={passwordConfirmation}
          onChangeText={(value) => {
            setPasswordConfirmation(value);
            setErrors((current) => ({
              ...current,
              passwordConfirmation: undefined,
            }));
            resetSubmissionError();
          }}
          autoCapitalize="none"
          autoComplete="new-password"
          returnKeyType="done"
          secureTextEntry
          textContentType="newPassword"
          onSubmitEditing={() => {
            if (Platform.OS !== "web") {
              void submit();
            }
          }}
        />

        <View style={styles.roleSection}>
          <Text style={styles.roleLabel}>Rôle</Text>
          <View accessibilityRole="radiogroup" style={styles.roleOptions}>
            {roleOptions.map((option) => {
              const selected = role === option.role;

              return (
                <RoleOption
                  key={option.role}
                  option={option}
                  selected={selected}
                  onSelect={() => {
                    setRole(option.role);
                    setErrors((current) => ({
                      ...current,
                      role: undefined,
                    }));
                    resetSubmissionError();
                  }}
                />
              );
            })}
          </View>
          {errors.role ? (
            <Text
              accessibilityLiveRegion="polite"
              role="alert"
              style={styles.fieldError}
            >
              {errors.role}
            </Text>
          ) : null}
        </View>

        <Text style={styles.roleNotice}>
          Le rôle choisi détermine ton espace Lugua et ne pourra pas encore
          être modifié directement dans l’application.
        </Text>

        {formError ?? authError ? (
          <Text
            accessibilityLiveRegion="assertive"
            role="alert"
            style={styles.formError}
          >
            {formError ?? authError}
          </Text>
        ) : null}

        <AuthButton
          label="Créer mon compte"
          busy={isSubmitting}
          onPress={() => {
            void submit();
          }}
        />
      </AuthForm>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 17,
  },
  actions: {
    gap: 10,
  },
  roleSection: {
    gap: 9,
  },
  roleLabel: {
    color: HOME_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  roleOptions: {
    gap: 9,
  },
  roleOption: {
    minHeight: 80,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    padding: 14,
  },
  roleOptionSelected: {
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.accentSoft,
  },
  radio: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: HOME_COLORS.textMuted,
    borderRadius: 11,
    marginTop: 1,
  },
  radioSelected: {
    borderColor: HOME_COLORS.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: HOME_COLORS.accent,
  },
  roleCopy: {
    minWidth: 0,
    flex: 1,
    gap: 4,
  },
  roleTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "900",
  },
  roleDescription: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  roleNotice: {
    color: HOME_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  fieldError: {
    color: "#f1a5ae",
    fontSize: 12,
    fontWeight: "700",
  },
  formError: {
    color: "#f1a5ae",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  focused: {
    borderWidth: 2,
    borderColor: HOME_COLORS.textPrimary,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
