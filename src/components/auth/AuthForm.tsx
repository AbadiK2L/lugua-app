import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

type AuthFormProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onSubmit: () => void;
};

export function AuthForm({ children, style }: AuthFormProps) {
  return <View style={style}>{children}</View>;
}
