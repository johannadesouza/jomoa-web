import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, useColorScheme } from "react-native";
import { YStack, XStack } from "tamagui";
import Markdown from "react-native-markdown-display";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Screen, AppText, AppIcon, AppButton } from "../../shared/ui";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { fetchArticleBySlug, Article } from "../../lib/repos/contentRepo/articles";
import { getThemeColors } from "../../shared/theme/colors";
import { useTheme } from "../../shared/context/ThemeContext";

type Props = NativeStackScreenProps<RootStackParamList, "ArticleDetail">;

const CATEGORY_COLORS: Record<string, string> = {
  Träning: "#D96D46",
  Kost: "#81C784",
  Cykel: "#9C6EB5",
  Livsstil: "#5C9EAD",
  FAQ: "#FFB74D",
};

export function ArticleDetailScreen({ route, navigation }: Props) {
  const slug = route.params?.slug;

  if (!slug) {
    return (
      <Screen centered padded>
        <YStack alignItems="center" gap="$4">
          <AppText variant="body" muted center>
            Artikeln kunde inte laddas. Gå tillbaka och försök igen.
          </AppText>
          <AppButton variant="secondary" onPress={() => navigation.goBack()}>
            Tillbaka
          </AppButton>
        </YStack>
      </Screen>
    );
  }
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchArticleBySlug(slug)
      .then(setArticle)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Screen centered>
        <ActivityIndicator size="large" color={colors.accent} />
      </Screen>
    );
  }

  if (error || !article) {
    return (
      <Screen centered padded>
        <YStack alignItems="center" gap="$4">
          <AppIcon name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <AppText variant="body" muted center>
            Kunde inte ladda artikeln. Försök igen senare.
          </AppText>
        </YStack>
      </Screen>
    );
  }

  const categoryColor = article.category ? (CATEGORY_COLORS[article.category] ?? colors.accent) : colors.accent;

  const markdownStyles = {
    body: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 26,
      fontFamily: "System",
    },
    heading1: {
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: "700" as const,
      marginTop: 24,
      marginBottom: 8,
    },
    heading2: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: "700" as const,
      marginTop: 20,
      marginBottom: 6,
    },
    heading3: {
      color: colors.textPrimary,
      fontSize: 17,
      fontWeight: "600" as const,
      marginTop: 16,
      marginBottom: 4,
    },
    paragraph: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 26,
      marginBottom: 12,
    },
    strong: {
      fontWeight: "700" as const,
      color: colors.textPrimary,
    },
    em: {
      fontStyle: "italic" as const,
      color: colors.textSecondary,
    },
    bullet_list: {
      marginBottom: 12,
    },
    ordered_list: {
      marginBottom: 12,
    },
    list_item: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 4,
    },
    blockquote: {
      backgroundColor: colors.card,
      borderLeftWidth: 4,
      borderLeftColor: categoryColor,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginVertical: 12,
      borderRadius: 4,
    },
    code_inline: {
      backgroundColor: colors.surface3,
      color: colors.textPrimary,
      borderRadius: 4,
      paddingHorizontal: 4,
      fontSize: 14,
      fontFamily: "Courier",
    },
    fence: {
      backgroundColor: colors.surface3,
      borderRadius: 8,
      padding: 12,
      marginVertical: 12,
    },
    hr: {
      backgroundColor: colors.borderSoft,
      marginVertical: 16,
    },
    link: {
      color: colors.accent,
    },
  };

  return (
    <Screen scroll padded safeArea edges={["bottom"]}>
      <YStack gap="$6" paddingTop="$4" paddingBottom="$8">
        {/* Header */}
        <YStack gap="$3">
          {article.category && (
            <XStack alignItems="center" gap="$2">
              <YStack
                paddingHorizontal="$3"
                paddingVertical="$1"
                borderRadius="$full"
                backgroundColor={categoryColor + "22"}
              >
                <AppText
                  variant="caption"
                  style={{ color: categoryColor, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  {article.category}
                </AppText>
              </YStack>
              {article.reading_time_minutes && (
                <AppText variant="caption" muted>
                  {article.reading_time_minutes} min läsning
                </AppText>
              )}
            </XStack>
          )}

          <AppText variant="h1" style={{ fontSize: 26, lineHeight: 34, fontWeight: "700" }}>
            {article.title}
          </AppText>

          {article.excerpt && (
            <AppText variant="body" muted style={{ lineHeight: 24 }}>
              {article.excerpt}
            </AppText>
          )}

          {article.published_at && (
            <XStack alignItems="center" gap="$2">
              <AppIcon name="calendar-outline" size={14} color={colors.textSecondary} />
              <AppText variant="caption" muted>
                {new Date(article.published_at).toLocaleDateString("sv-SE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </AppText>
            </XStack>
          )}
        </YStack>

        {/* Divider */}
        <YStack height={1} backgroundColor="$borderSoft" />

        {/* Content */}
        {article.content ? (
          <Markdown style={markdownStyles}>{article.content}</Markdown>
        ) : (
          <AppText variant="body" muted center>
            Inget innehåll tillgängligt.
          </AppText>
        )}
      </YStack>
    </Screen>
  );
}
