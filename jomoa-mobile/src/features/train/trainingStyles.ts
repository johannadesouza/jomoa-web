/**
 * Training Styles – Fas B, inspirerat av IMG_0353
 */

export interface TrainingStyle {
  id: string;
  label: string;
  icon: string;
}

export const TRAINING_STYLES: TrainingStyle[] = [
  { id: "styrka", label: "Styrka", icon: "💪" },
  { id: "pilates", label: "Pilates", icon: "🧘" },
  { id: "barre", label: "Barre", icon: "🩰" },
  { id: "kondition", label: "Kondition", icon: "🏃" },
  { id: "recovery", label: "Recovery", icon: "😌" },
  { id: "yoga", label: "Yoga", icon: "🧘‍♀️" },
  { id: "mindfulness", label: "Mindfulness", icon: "🌸" },
  { id: "prepost", label: "Pre & Post", icon: "🤰" },
];
