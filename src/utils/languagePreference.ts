import {
  languageOptions,
  type LanguageSelectionId,
} from "@/src/components/home/LanguageSelector";

export function isLanguageSelectionId(
  value: string,
): value is LanguageSelectionId {
  return languageOptions.some((option) => option.id === value);
}

export function getLanguageSelectionFromPreference(
  preferredVariety: string,
): LanguageSelectionId {
  if (preferredVariety === "general") {
    return "shikomori";
  }

  return isLanguageSelectionId(preferredVariety)
    ? preferredVariety
    : "shikomori";
}

export function getPreferenceFromLanguageSelection(
  selection: LanguageSelectionId,
) {
  return selection === "shikomori" ? "general" : selection;
}
