/**
 * Training Styles – Fas B, inspirerat av IMG_0353
 */

export type TrainingStyleIconName =
  | "barbell-outline"
  | "body-outline"
  | "fitness-outline"
  | "leaf-outline"
  | "sparkles-outline"
  | "heart-outline";

export interface TrainingStyle {
  id: string;
  label: string;
  icon: string;
  iconName: TrainingStyleIconName;
}

export const TRAINING_STYLES: TrainingStyle[] = [
  { id: "styrka", label: "Styrka", icon: "💪", iconName: "barbell-outline" },
  { id: "pilates", label: "Pilates", icon: "🧘", iconName: "body-outline" },
  { id: "barre", label: "Barre", icon: "🩰", iconName: "body-outline" },
  { id: "kondition", label: "Kondition", icon: "🏃", iconName: "fitness-outline" },
  { id: "recovery", label: "Recovery", icon: "😌", iconName: "leaf-outline" },
  { id: "yoga", label: "Yoga", icon: "🧘‍♀️", iconName: "body-outline" },
  { id: "mindfulness", label: "Mindfulness", icon: "🌸", iconName: "sparkles-outline" },
  { id: "prepost", label: "Pre & Post", icon: "🤰", iconName: "heart-outline" },
];
