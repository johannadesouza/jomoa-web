"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ReadinessDataPoint {
  date: string;
  sleep_quality: number | null;
  energy_level: number | null;
  stress_level: number | null;
  soreness: number | null;
}

interface ReadinessTrendChartProps {
  data: ReadinessDataPoint[];
  days?: 7 | 30;
}

export function ReadinessTrendChart({ data, days = 7 }: ReadinessTrendChartProps) {
  // Formatera datum för visning
  const formattedData = data.map((point) => ({
    ...point,
    date: new Date(point.date).toLocaleDateString("sv-SE", { month: "short", day: "numeric" }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E5E0" />
        <XAxis
          dataKey="date"
          stroke="#5A6B5D"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          domain={[0, 10]}
          stroke="#5A6B5D"
          style={{ fontSize: "12px" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FEFCF8",
            border: "1px solid rgba(232,229,224,0.4)",
            borderRadius: "20px",
            padding: "8px 12px",
          }}
          labelStyle={{ color: "#5A6B5D", fontWeight: "600" }}
        />
        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
          iconType="line"
        />
        <Line
          type="monotone"
          dataKey="sleep_quality"
          stroke="#8B6F47"
          strokeWidth={2}
          dot={{ fill: "#8B6F47", r: 4 }}
          name="Sömn"
        />
        <Line
          type="monotone"
          dataKey="energy_level"
          stroke="#5A6B5D"
          strokeWidth={2}
          dot={{ fill: "#5A6B5D", r: 4 }}
          name="Energi"
        />
        <Line
          type="monotone"
          dataKey="stress_level"
          stroke="#D96D46"
          strokeWidth={2}
          dot={{ fill: "#D96D46", r: 4 }}
          name="Stress"
        />
        <Line
          type="monotone"
          dataKey="soreness"
          stroke="#BA8E90"
          strokeWidth={2}
          dot={{ fill: "#BA8E90", r: 4 }}
          name="Ömhet"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

