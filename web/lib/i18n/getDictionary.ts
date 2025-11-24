import en from "./en.json";
import sv from "./sv.json";

const dictionaries = {
  en,
  sv,
} as const;

export async function getDictionary(
  locale: "en" | "sv"
): Promise<typeof en> {
  return dictionaries[locale] || dictionaries.en;
}

