import { router } from "expo-router";
import { useRef, useState } from "react";
import { Platform, StyleSheet, Text, TextInput } from "react-native";

import { AuthButton } from "@/src/components/auth/AuthButton";
import { AuthForm } from "@/src/components/auth/AuthForm";
import { AuthScreenShell } from "@/src/components/auth/AuthScreenShell";
import { AuthTextField } from "@/src/components/auth/AuthTextField";
import { useAuthSession } from "@/src/contexts/AuthSessionContext";

type SignInErrors = {
  email?: string;
  password?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignInScreen() {
  const { signIn, isSubmitting, authError, clearAuthError } = useAuthSession();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<SignInErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  function resetSubmissionError() {
    setFormError(null);
    clearAuthError();
  }

  async function submit() {
    if (isSubmitting) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const nextErrors: SignInErrors = {};

    if (!normalizedEmail) {
      nextErrors.email = "Saisis ton adresse e-mail.";
    } else if (!isValidEmail(normalizedEmail)) {
      nextErrors.email = "Saisis une adresse e-mail valide.";
    }

    if (!password) {
      nextErrors.password = "Saisis ton mot de passe.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    clearAuthError();
    setFormError(null);
    const result = await signIn({
      email: normalizedEmail,
      password,
    });

    if (!result.ok) {
      setFormError(result.message);
    }
  }

  return (
    <AuthScreenShell
      title="Se connecter"
      subtitle="Retrouve automatiquement ton espace Élève ou Professeur."
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
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setErrors((current) => ({ ...current, password: undefined }));
            resetSubmissionError();
          }}
          autoCapitalize="none"
          autoComplete="current-password"
          returnKeyType="done"
          secureTextEntry
          textContentType="password"
          onSubmitEditing={() => {
            if (Platform.OS !== "web") {
              void submit();
            }
          }}
        />

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
          label="Se connecter"
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
  formError: {
    color: "#f1a5ae",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
});
