"use client";

interface CycleCircleProps {
  cycleDay: number;
  phase: string;
  periodStartDate: string;
  className?: string;
}

const PHASE_COLORS = {
  Mens: {
    bg: "bg-terracotta/20",
    border: "border-terracotta",
    dot: "bg-terracotta",
    text: "text-terracotta",
  },
  Follikulär: {
    bg: "bg-soft-pink",
    border: "border-mauve/30",
    dot: "bg-mauve",
    text: "text-mauve-dark",
  },
  Ägglossning: {
    bg: "bg-sand/50",
    border: "border-terracotta-light",
    dot: "bg-terracotta-light",
    text: "text-terracotta",
  },
  Luteal: {
    bg: "bg-mauve/20",
    border: "border-mauve",
    dot: "bg-mauve-dark",
    text: "text-mauve-dark",
  },
};

const PHASE_ICONS = {
  Mens: "🩸",
  Follikulär: "🌸",
  Ägglossning: "✨",
  Luteal: "🌙",
};

export default function CycleCircle({
  cycleDay,
  phase,
  periodStartDate,
  className = "",
}: CycleCircleProps) {
  const phaseColor = PHASE_COLORS[phase as keyof typeof PHASE_COLORS] || PHASE_COLORS.Follikulär;
  const phaseIcon = PHASE_ICONS[phase as keyof typeof PHASE_ICONS] || "🌸";

  // Beräkna position för nuvarande dag i cirkeln (28 dagar = 360 grader)
  const angle = ((cycleDay - 1) / 28) * 360 - 90; // -90 för att börja från toppen
  const radius = 100; // SVG radius
  const centerX = 120;
  const centerY = 120;
  const x = centerX + radius * Math.cos((angle * Math.PI) / 180);
  const y = centerY + radius * Math.sin((angle * Math.PI) / 180);

  // Generera 28 dagar för cirkeln
  const days = Array.from({ length: 28 }, (_, i) => i + 1);

  // Bestäm vilka dagar som tillhör vilken fas
  const getDayPhase = (day: number): string => {
    if (day >= 1 && day <= 5) return "Mens";
    if (day >= 6 && day <= 13) return "Follikulär";
    if (day >= 14 && day <= 16) return "Ägglossning";
    if (day >= 17 && day <= 28) return "Luteal";
    return "Follikulär";
  };

  const getDayColor = (day: number): string => {
    const dayPhase = getDayPhase(day);
    const colors = PHASE_COLORS[dayPhase as keyof typeof PHASE_COLORS];
    return colors.dot;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="bg-white rounded-3xl p-8 border-2 border-mauve/20 shadow-soft">
        <div className="text-center mb-6">
          <h3 className="text-lg font-the-seasons text-plum mb-2">Cykelöversikt</h3>
          <p className="text-sm text-mauve-dark">
            {new Date(periodStartDate).toLocaleDateString("sv-SE", {
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        {/* Cirkulär visualisering */}
        <div className="relative mx-auto" style={{ width: 240, height: 240 }}>
          <svg width="240" height="240" className="transform -rotate-90">
            {/* Bakgrundscirkel */}
            <circle
              cx="120"
              cy="120"
              r="100"
              fill="none"
              stroke="#E8D5D0"
              strokeWidth="2"
              opacity="0.3"
            />

            {/* Dag-punkter */}
            {days.map((day) => {
              const dayAngle = ((day - 1) / 28) * 360;
              const dayX = centerX + radius * Math.cos((dayAngle * Math.PI) / 180);
              const dayY = centerY + radius * Math.sin((dayAngle * Math.PI) / 180);
              const isCurrentDay = day === cycleDay;
              const dayColor = getDayColor(day);

              return (
                <circle
                  key={day}
                  cx={dayX}
                  cy={dayY}
                  r={isCurrentDay ? 6 : 4}
                  fill={isCurrentDay ? dayColor : dayColor}
                  opacity={isCurrentDay ? 1 : 0.6}
                  className={isCurrentDay ? "animate-pulse" : ""}
                />
              );
            })}

            {/* Nuvarande dag marker */}
            {cycleDay <= 28 && (
              <>
                <circle cx={x} cy={y} r="8" fill={phaseColor.dot} className="animate-pulse" />
                <circle cx={x} cy={y} r="12" fill="none" stroke={phaseColor.dot} strokeWidth="2" opacity="0.5" />
                {/* Pil som pekar på nuvarande dag */}
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke={phaseColor.dot}
                  strokeWidth="2"
                  opacity="0.6"
                />
              </>
            )}
          </svg>

          {/* Centrum med dag och fas */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl mb-2 ${phaseColor.text}`}>{phaseIcon}</div>
            <div className="text-3xl font-the-seasons font-bold text-plum mb-1">
              Dag {cycleDay}
            </div>
            <div className={`text-sm font-medium ${phaseColor.text}`}>{phase}</div>
          </div>
        </div>

        {/* Fas-beskrivning */}
        <div className={`mt-6 p-4 rounded-2xl ${phaseColor.bg} border ${phaseColor.border}`}>
          <p className="text-sm text-plum text-center">
            {phase === "Mens" && "Din mens pågår. Ta det lugnt och vila."}
            {phase === "Follikulär" && "Follikulär fas - perfekt tid för träning!"}
            {phase === "Ägglossning" && "Ägglossning - hög energi och styrka."}
            {phase === "Luteal" && "Luteal fas - fokus på återhämtning."}
          </p>
        </div>
      </div>
    </div>
  );
}

