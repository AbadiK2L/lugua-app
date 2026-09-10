export function buildPublishedDictionaryEntryHref(
  lexemeId: string,
  localeCode: string,
): string {
  return (
    "/dictionary/lexeme/" +
    encodeURIComponent(lexemeId) +
    "?locale=" +
    encodeURIComponent(localeCode)
  );
}
