import { Redirect, type Href } from "expo-router";

import { useSessionPreview } from "@/src/contexts/SessionPreviewContext";

export default function EntryRedirect() {
  const { role } = useSessionPreview();

  if (role === "student") {
    return <Redirect href={"/student" as Href} />;
  }

  if (role === "teacher") {
    return <Redirect href={"/teacher" as Href} />;
  }

  return <Redirect href="/auth/welcome" />;
}
