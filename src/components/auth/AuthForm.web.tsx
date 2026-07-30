import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

type AuthFormProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onSubmit: () => void;
};

export function AuthForm({ children, style, onSubmit }: AuthFormProps) {
  function submit(event: { preventDefault: () => void }) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={submit} style={{ position: "relative", width: "100%" }}>
      <View style={style}>{children}</View>
      <button
        aria-hidden
        tabIndex={-1}
        type="submit"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </form>
  );
}
