import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type PipelineDatum = {
  name: string;
  value: number;
  fill: string;
};

const colors = {
  gold: "#a8751c",
  ink: "#1f1f1f",
  muted: "#6b665e",
  border: "#e5dfd4",
};

export default function AdminPipelineChart({ data }: { data: PipelineDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 12 }}>
        <CartesianGrid stroke={colors.border} vertical={false} />
        <XAxis dataKey="name" angle={-18} textAnchor="end" height={55} tick={{ fill: colors.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: colors.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "#ffffff", border: `1px solid ${colors.border}`, borderRadius: 8, color: colors.ink }} cursor={{ fill: "rgba(168,117,28,0.08)" }} />
        <Bar dataKey="value" fill={colors.gold} radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

