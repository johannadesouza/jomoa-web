/**
 * DayNotesSection – visa, lägg till, redigera och radera anteckningar
 * för en given dag och kategori (övrigt | träning).
 *
 * UX:
 * - Tid anges via separata HH + MM fält (number-pad)
 * - Tid visas som en färgad pill
 * - Redigera/Ta bort via swipe-vänster (Animated, ingen extra dep)
 * - Redigera öppnas i en Modal (bottom-sheet stil)
 */
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Alert,
  Modal,
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  TextInput,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useTheme as useTamaguiTheme } from "tamagui";
import { YStack, XStack } from "tamagui";
import { Section, Card, AppText, AppButton } from "../../shared/ui";
import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";
import {
  fetchNotesForDate,
  addNote,
  updateNote,
  deleteNote,
  type DayNote,
  type DayNoteCategory,
} from "../../lib/services/clientDayNotesService";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function padTwo(n: string) {
  return n.replace(/\D/g, "").slice(0, 2);
}

function formatTimeDisplay(time: string | null): string | null {
  if (!time) return null;
  return time.slice(0, 5); // "HH:MM"
}

function parseTimeParts(time: string | null): { hh: string; mm: string } {
  if (!time) return { hh: "", mm: "" };
  const [hh = "", mm = ""] = time.slice(0, 5).split(":");
  return { hh, mm };
}

function buildTime(hh: string, mm: string): string | null {
  const h = hh.replace(/\D/g, "");
  const m = mm.replace(/\D/g, "");
  if (!h && !m) return null;
  const hNum = parseInt(h || "0", 10);
  const mNum = parseInt(m || "0", 10);
  if (hNum > 23 || mNum > 59) return null;
  return `${String(hNum).padStart(2, "0")}:${String(mNum).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────
// TimeInput – HH : MM fält
// ─────────────────────────────────────────────

interface TimeInputProps {
  hh: string;
  mm: string;
  onChangeHH: (v: string) => void;
  onChangeMM: (v: string) => void;
  colors: ReturnType<typeof getThemeColors>;
}

function TimeInput({ hh, mm, onChangeHH, onChangeMM, colors }: TimeInputProps) {
  const mmRef = useRef<TextInput>(null);

  return (
    <XStack alignItems="center" gap="$2">
      <AppText variant="small" color="$colorSecondary">
        Tid (valfri)
      </AppText>
      <XStack
        alignItems="center"
        borderRadius={8}
        borderWidth={1}
        borderColor={colors.borderSoft}
        backgroundColor={colors.card}
        paddingHorizontal={8}
        paddingVertical={4}
        gap={0}
      >
        <TextInput
          style={[styles.timeField, { color: colors.textPrimary }]}
          placeholder="HH"
          placeholderTextColor={colors.textSecondary}
          value={hh}
          keyboardType="number-pad"
          maxLength={2}
          onChangeText={(v) => {
            const clean = padTwo(v);
            onChangeHH(clean);
            if (clean.length === 2) mmRef.current?.focus();
          }}
          returnKeyType="next"
        />
        <Text style={[styles.timeSep, { color: colors.textPrimary }]}>:</Text>
        <TextInput
          ref={mmRef}
          style={[styles.timeField, { color: colors.textPrimary }]}
          placeholder="MM"
          placeholderTextColor={colors.textSecondary}
          value={mm}
          keyboardType="number-pad"
          maxLength={2}
          onChangeText={(v) => onChangeMM(padTwo(v))}
        />
      </XStack>
    </XStack>
  );
}

// ─────────────────────────────────────────────
// TimePill – visar sparad tid snyggt
// ─────────────────────────────────────────────

function TimePill({ time, colors }: { time: string; colors: ReturnType<typeof getThemeColors> }) {
  return (
    <View
      style={[
        styles.timePill,
        { backgroundColor: colors.accent + "22", borderColor: colors.accent + "55" },
      ]}
    >
      <Text style={[styles.timePillText, { color: colors.accent }]}>{time}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// EditNoteModal – redigera i ett bottom-sheet modal
// ─────────────────────────────────────────────

interface EditNoteModalProps {
  visible: boolean;
  note: DayNote | null;
  onClose: () => void;
  onSaved: () => void;
  colors: ReturnType<typeof getThemeColors>;
}

function EditNoteModal({ visible, note, onClose, onSaved, colors }: EditNoteModalProps) {
  const [text, setText] = useState("");
  const [hh, setHH] = useState("");
  const [mm, setMM] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setText(note.text);
      const parts = parseTimeParts(note.time_of_day);
      setHH(parts.hh);
      setMM(parts.mm);
    }
  }, [note]);

  const handleSave = async () => {
    if (!note || !text.trim()) return;
    setSaving(true);
    const t = buildTime(hh, mm);
    await updateNote(note.id, text, t);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalSheet}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.borderSoft }]} />

          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            Redigera anteckning
          </Text>

          <TextInput
            style={[
              styles.modalTextInput,
              {
                color: colors.textPrimary,
                backgroundColor: colors.background,
                borderColor: colors.borderSoft,
              },
            ]}
            placeholder="Anteckning..."
            placeholderTextColor={colors.textSecondary}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
            autoFocus
          />

          <TimeInput hh={hh} mm={mm} onChangeHH={setHH} onChangeMM={setMM} colors={colors} />

          <XStack gap={12} marginTop={20}>
            <Pressable
              style={[
                styles.modalBtn,
                styles.modalBtnGhost,
                { borderColor: colors.borderSoft },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Avbryt</Text>
            </Pressable>
            <Pressable
              style={[
                styles.modalBtn,
                styles.modalBtnPrimary,
                { backgroundColor: saving || !text.trim() ? colors.accent + "66" : colors.accent },
              ]}
              onPress={handleSave}
              disabled={saving || !text.trim()}
            >
              <Text style={[styles.modalBtnText, { color: "#fff" }]}>Spara</Text>
            </Pressable>
          </XStack>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// NoteRow – swipe-vänster för redigera / ta bort
// ─────────────────────────────────────────────

const ACTION_WIDTH = 140; // total bredd på de två actionknapparna
const SWIPE_THRESHOLD = 60;

interface NoteRowProps {
  note: DayNote;
  onEdit: (note: DayNote) => void;
  onDeleted: () => void;
  colors: ReturnType<typeof getThemeColors>;
}

function NoteRow({ note, onEdit, onDeleted, colors }: NoteRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [open, setOpen] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        // Tillåt bara svep åt vänster (negativa värden), max ACTION_WIDTH
        const dx = Math.max(-ACTION_WIDTH, Math.min(0, g.dx + (open ? -ACTION_WIDTH : 0)));
        translateX.setValue(dx);
      },
      onPanResponderRelease: (_, g) => {
        const currentDx = open ? g.dx - ACTION_WIDTH : g.dx;
        if (currentDx < -SWIPE_THRESHOLD) {
          // Öppna actions
          Animated.spring(translateX, {
            toValue: -ACTION_WIDTH,
            useNativeDriver: true,
          }).start(() => setOpen(true));
        } else {
          // Stäng
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start(() => setOpen(false));
        }
      },
    })
  ).current;

  const closeSwipe = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start(() =>
      setOpen(false)
    );
  };

  const handleDelete = () => {
    closeSwipe();
    Alert.alert("Ta bort anteckning", "Vill du ta bort denna anteckning?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Ta bort",
        style: "destructive",
        onPress: async () => {
          await deleteNote(note.id);
          onDeleted();
        },
      },
    ]);
  };

  const timeStr = formatTimeDisplay(note.time_of_day);

  return (
    <View style={styles.swipeWrapper}>
      {/* Action-knappar bakom kortet */}
      <View style={[styles.actionRow, { width: ACTION_WIDTH }]}>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: colors.accent }]}
          onPress={() => {
            closeSwipe();
            onEdit(note);
          }}
        >
          <Text style={styles.actionBtnText}>✏️{"\n"}Redigera</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: colors.error }]}
          onPress={handleDelete}
        >
          <Text style={styles.actionBtnText}>🗑{"\n"}Ta bort</Text>
        </Pressable>
      </View>

      {/* Kortinnehåll – rör sig med svep */}
      <Animated.View
        style={[
          styles.noteCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.borderSoft,
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <XStack alignItems="flex-start" gap={10}>
          {timeStr && <TimePill time={timeStr} colors={colors} />}
          <Text style={[styles.noteText, { color: colors.textPrimary, flex: 1 }]}>
            {note.text}
          </Text>
        </XStack>
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────
// DayNotesSection – huvud-export
// ─────────────────────────────────────────────

interface DayNotesSectionProps {
  clientId: string;
  date: string;
  category: DayNoteCategory;
  title?: string;
  subtitle?: string;
  placeholder?: string;
}

export function DayNotesSection({
  clientId,
  date,
  category,
  title,
  subtitle,
  placeholder,
}: DayNotesSectionProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const [notes, setNotes] = useState<DayNote[]>([]);
  const [newText, setNewText] = useState("");
  const [newHH, setNewHH] = useState("");
  const [newMM, setNewMM] = useState("");
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editNote, setEditNote] = useState<DayNote | null>(null);

  const load = useCallback(async () => {
    const data = await fetchNotesForDate(clientId, date, category);
    setNotes(data);
  }, [clientId, date, category]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!newText.trim()) return;
    setAdding(true);
    const t = buildTime(newHH, newMM);
    await addNote(clientId, date, category, newText, t);
    setNewText("");
    setNewHH("");
    setNewMM("");
    setShowForm(false);
    setAdding(false);
    load();
  };

  const sectionTitle =
    title ?? (category === "träning" ? "Träningsanteckningar" : "Anteckningar");
  const sectionSubtitle =
    subtitle ??
    (category === "träning"
      ? "Egna anteckningar om träningen – hur det kändes, vad du tränade"
      : "T.ex. middag, läkarbesök, resa");
  const inputPlaceholder =
    placeholder ??
    (category === "träning"
      ? "T.ex. kände mig stark, ökade vikten på marklyft..."
      : "Lägg till en anteckning...");

  return (
    <Section title={sectionTitle} subtitle={sectionSubtitle}>
      <YStack gap="$3">
        {notes.length === 0 && !showForm && (
          <Card borderRadius="$3">
            <Card.Content padding="$5">
              <AppText variant="body" muted center>
                Inga anteckningar för denna dag.
              </AppText>
            </Card.Content>
          </Card>
        )}

        {notes.map((n) => (
          <NoteRow
            key={n.id}
            note={n}
            onEdit={setEditNote}
            onDeleted={load}
            colors={colors}
          />
        ))}

        {showForm ? (
          <View
            style={[
              styles.addForm,
              { backgroundColor: colors.card, borderColor: colors.borderSoft },
            ]}
          >
            <TextInput
              style={[
                styles.addTextInput,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.background,
                  borderColor: colors.borderSoft,
                },
              ]}
              placeholder={inputPlaceholder}
              placeholderTextColor={colors.textSecondary}
              value={newText}
              onChangeText={setNewText}
              multiline
              numberOfLines={3}
              autoFocus
            />

            <TimeInput
              hh={newHH}
              mm={newMM}
              onChangeHH={setNewHH}
              onChangeMM={setNewMM}
              colors={colors}
            />

            <XStack gap={10} marginTop="$3">
              <AppButton
                variant="primary"
                size="sm"
                flex={1}
                onPress={handleAdd}
                disabled={adding || !newText.trim()}
              >
                Lägg till
              </AppButton>
              <AppButton
                variant="ghost"
                size="sm"
                onPress={() => {
                  setNewText("");
                  setNewHH("");
                  setNewMM("");
                  setShowForm(false);
                }}
              >
                Avbryt
              </AppButton>
            </XStack>
          </View>
        ) : (
          <AppButton variant="secondary" size="sm" onPress={() => setShowForm(true)}>
            + Ny anteckning
          </AppButton>
        )}
      </YStack>

      <EditNoteModal
        visible={!!editNote}
        note={editNote}
        onClose={() => setEditNote(null)}
        onSaved={load}
        colors={colors}
      />
    </Section>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  // TimeInput
  timeField: {
    fontSize: 16,
    fontWeight: "600",
    width: 32,
    textAlign: "center",
    paddingVertical: 2,
  },
  timeSep: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 2,
  },

  // TimePill
  timePill: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  timePillText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Swipe
  swipeWrapper: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 12,
    marginBottom: 0,
  },
  actionRow: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 16,
  },
  noteCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
  },

  // Add form
  addForm: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  addTextInput: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    fontSize: 15,
    minHeight: 72,
    textAlignVertical: "top",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    gap: 12,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  modalTextInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 15,
    minHeight: 88,
    textAlignVertical: "top",
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnPrimary: {},
  modalBtnGhost: {
    borderWidth: 1,
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
