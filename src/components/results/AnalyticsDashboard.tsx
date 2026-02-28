import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  AlertTriangle,
  BookOpen,
  BarChart2,
  Activity,
  Star,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StudentResult, SemesterResult } from "@/types/result";

interface AnalyticsDashboardProps {
  student: StudentResult;
}

// Grade bucket colours (consistent with app palette)
const GRADE_COLORS: Record<string, string> = {
  A: "#f59e0b",   // amber (primary)
  B: "#a855f7",   // violet
  C: "#6366f1",   // indigo
  D: "#f97316",   // orange
  F: "#ef4444",   // red
};

const GPA_COLORS = {
  line: "hsl(var(--primary))",
  dot: "hsl(var(--primary))",
  cgpaRef: "#6366f1",
  area: "hsl(var(--primary) / 0.1)",
};

// Custom tooltip for GPA trend
const GpaTrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const gpa = payload[0]?.value as number;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg text-xs space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-primary font-bold text-sm">GPA: {gpa?.toFixed(2)}</p>
    </div>
  );
};

// Custom tooltip for grade distribution
const GradeTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg text-xs space-y-1">
      <p className="font-semibold">Grade {label}</p>
      <p className="text-foreground">{payload[0]?.value} course(s)</p>
    </div>
  );
};

// Custom tooltip for credit hours
const CreditTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg text-xs space-y-1">
      <p className="font-semibold">{label}</p>
      <p className="text-foreground">{payload[0]?.value} credit hours</p>
    </div>
  );
};

// Small stat card
function InsightCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay = 0,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  sub?: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="h-full">
        <CardContent className="p-4 flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
            {sub && <p className="text-[11px] text-muted-foreground truncate">{sub}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AnalyticsDashboard({ student }: AnalyticsDashboardProps) {
  // ── Derived data ─────────────────────────────────────────────────────────────

  const sortedSemesters = useMemo(
    () =>
      [...student.semesters].sort((a, b) => {
        if (a.semesterNumber !== b.semesterNumber)
          return a.semesterNumber - b.semesterNumber;
        return a.semester.localeCompare(b.semester);
      }),
    [student.semesters]
  );

  // GPA trend data — trim semester labels for mobile
  const gpaTrendData = useMemo(
    () =>
      sortedSemesters.map((sem) => ({
        label: sem.semester.toLowerCase().includes("summer")
          ? "Summer"
          : `Sem ${sem.semesterNumber}`,
        fullLabel: sem.semester,
        gpa: Number(sem.gpa.toFixed(2)),
      })),
    [sortedSemesters]
  );

  // Grade distribution across ALL subjects
  const gradeDistribution = useMemo(() => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    student.semesters.forEach((sem) => {
      sem.subjects.forEach((sub) => {
        const letter = sub.grade?.charAt(0).toUpperCase() ?? "F";
        if (letter in counts) counts[letter]++;
        else if (letter === "A") counts["A"]++;
      });
    });
    return Object.entries(counts).map(([grade, count]) => ({ grade, count }));
  }, [student.semesters]);

  // Detailed grade breakdown (A+, A, A-…) for tooltip richness
  const detailedGradeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    student.semesters.forEach((sem) => {
      sem.subjects.forEach((sub) => {
        const g = sub.grade?.toUpperCase() ?? "F";
        counts[g] = (counts[g] ?? 0) + 1;
      });
    });
    return counts;
  }, [student.semesters]);

  // Credit hours per semester
  const creditData = useMemo(
    () =>
      sortedSemesters.map((sem) => ({
        label: sem.semester.toLowerCase().includes("summer")
          ? "Summer"
          : `Sem ${sem.semesterNumber}`,
        credits: sem.totalCreditHours,
      })),
    [sortedSemesters]
  );

  // Best / worst semester (ignore 0-credit semesters)
  const validSems = sortedSemesters.filter((s) => s.totalCreditHours > 0);
  const bestSem = validSems.reduce(
    (b, s) => (s.gpa > (b?.gpa ?? -1) ? s : b),
    validSems[0]
  );
  const worstSem = validSems.reduce(
    (w, s) => (s.gpa < (w?.gpa ?? 99) ? s : w),
    validSems[0]
  );

  // Trend: compare last two semesters
  const lastTwo = validSems.slice(-2);
  const trend =
    lastTwo.length < 2
      ? "neutral"
      : lastTwo[1].gpa > lastTwo[0].gpa
      ? "up"
      : lastTwo[1].gpa < lastTwo[0].gpa
      ? "down"
      : "neutral";

  const trendDiff =
    lastTwo.length === 2
      ? Math.abs(lastTwo[1].gpa - lastTwo[0].gpa).toFixed(2)
      : "0.00";

  // Total subjects
  const totalSubjects = student.semesters.reduce(
    (acc, s) => acc + s.subjects.length,
    0
  );

  // Highest single-semester GPA
  const peakGPA = Math.max(...validSems.map((s) => s.gpa));

  // Pass rate
  const allSubjects = student.semesters.flatMap((s) => s.subjects);
  const passCount = allSubjects.filter((s) => (s.grade?.toUpperCase() ?? "F") !== "F").length;
  const passRate = allSubjects.length
    ? ((passCount / allSubjects.length) * 100).toFixed(1)
    : "0";

  // GPA color for dot fill
  const dotColor = (gpa: number) => {
    if (gpa >= 3.5) return "#f59e0b";
    if (gpa >= 2.5) return "#a855f7";
    if (gpa >= 1.5) return "#6366f1";
    return "#ef4444";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* ── Section header ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Academic performance insights for {student.name}
          </p>
        </div>
      </div>

      {/* ── Insight cards row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <InsightCard
          icon={
            trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
          }
          label="Semester Trend"
          value={
            trend === "up"
              ? `▲ +${trendDiff}`
              : trend === "down"
              ? `▼ −${trendDiff}`
              : "Stable"
          }
          sub={
            lastTwo.length === 2
              ? `vs previous semester`
              : "Need more semesters"
          }
          color={
            trend === "up"
              ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
              : trend === "down"
              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              : "bg-muted text-muted-foreground"
          }
          delay={0}
        />
        <InsightCard
          icon={Star}
          label="Peak Semester GPA"
          value={peakGPA.toFixed(2)}
          sub={bestSem ? bestSem.semester : "—"}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          delay={0.05}
        />
        <InsightCard
          icon={AlertTriangle}
          label="Lowest Semester"
          value={worstSem ? worstSem.gpa.toFixed(2) : "—"}
          sub={worstSem ? worstSem.semester : "—"}
          color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          delay={0.1}
        />
        <InsightCard
          icon={Award}
          label="Pass Rate"
          value={`${passRate}%`}
          sub={`${passCount} / ${allSubjects.length} courses`}
          color="bg-primary/10 text-primary"
          delay={0.15}
        />
      </div>

      {/* ── GPA Trend Line Chart ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card>
          <CardHeader className="pb-2 pt-5">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Semester GPA Trend</CardTitle>
            </div>
            <CardDescription>
              GPA per semester with overall CGPA reference line
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={gpaTrendData}
                  margin={{ top: 8, right: 16, left: -16, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 4]}
                    ticks={[0, 1, 2, 3, 4]}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<GpaTrendTooltip />} />
                  {/* CGPA reference line */}
                  <ReferenceLine
                    y={student.cgpa}
                    stroke={GPA_COLORS.cgpaRef}
                    strokeDasharray="5 3"
                    strokeWidth={1.5}
                    label={{
                      value: `CGPA ${student.cgpa.toFixed(2)}`,
                      position: "insideTopRight",
                      fontSize: 10,
                      fill: GPA_COLORS.cgpaRef,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gpa"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      return (
                        <circle
                          key={payload.label}
                          cx={cx}
                          cy={cy}
                          r={5}
                          fill={dotColor(payload.gpa)}
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                        />
                      );
                    }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-2 justify-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-5 bg-primary rounded" />
                Semester GPA
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-5 bg-indigo-500 rounded border-dashed" style={{ borderBottom: "2px dashed #6366f1", background: "transparent" }} />
                CGPA {student.cgpa.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Grade Distribution + Credit Hours ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grade Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2 pt-5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Grade Distribution</CardTitle>
              </div>
              <CardDescription>
                Total: {allSubjects.length} courses across all semesters
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={gradeDistribution}
                    margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
                    barSize={36}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                    <XAxis
                      dataKey="grade"
                      tick={{ fontSize: 12, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<GradeTooltip />} />
                    <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                      {gradeDistribution.map((entry) => (
                        <Cell
                          key={entry.grade}
                          fill={GRADE_COLORS[entry.grade] ?? "#94a3b8"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Grade badges */}
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {gradeDistribution
                  .filter((g) => g.count > 0)
                  .map((g) => (
                    <span
                      key={g.grade}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border"
                      style={{
                        backgroundColor: `${GRADE_COLORS[g.grade]}18`,
                        borderColor: `${GRADE_COLORS[g.grade]}40`,
                        color: GRADE_COLORS[g.grade],
                      }}
                    >
                      {g.grade}: {g.count}
                    </span>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Credit Hours per Semester */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2 pt-5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Credit Hours per Semester</CardTitle>
              </div>
              <CardDescription>
                Total credit hours completed: {student.totalCreditHours}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={creditData}
                    margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
                    barSize={32}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CreditTooltip />} />
                    <Bar
                      dataKey="credits"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.75}
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {creditData.map((c) => (
                  <span
                    key={c.label}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {c.label}: {c.credits} cr
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Semester Summary Table ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        <Card>
          <CardHeader className="pb-2 pt-5">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Semester Summary</CardTitle>
            </div>
            <CardDescription>
              GPA and credit breakdown per semester
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Semester
                    </th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Courses
                    </th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      GPA
                    </th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSemesters.map((sem, idx) => {
                    const isHighest = sem.gpa === peakGPA && validSems.length > 0;
                    const gpaColor =
                      sem.gpa >= 3.5
                        ? "text-amber-600 dark:text-amber-400"
                        : sem.gpa >= 2.5
                        ? "text-violet-600 dark:text-violet-400"
                        : sem.gpa >= 1.5
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-red-600 dark:text-red-400";

                    return (
                      <tr
                        key={idx}
                        className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {sem.semester}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">
                          {sem.subjects.length}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">
                          {sem.totalCreditHours}
                        </td>
                        <td className={`px-4 py-3 text-center font-bold ${gpaColor}`}>
                          {sem.gpa.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isHighest ? (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">
                              ★ Best
                            </Badge>
                          ) : sem.gpa === worstSem?.gpa && validSems.length > 1 ? (
                            <Badge variant="outline" className="text-red-600 border-red-300 dark:text-red-400 dark:border-red-700 text-[10px]">
                              ↓ Lowest
                            </Badge>
                          ) : sem.gpa >= 3.5 ? (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">
                              Excellent
                            </Badge>
                          ) : sem.gpa >= 3.0 ? (
                            <Badge className="bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 text-[10px]">
                              Good
                            </Badge>
                          ) : sem.gpa >= 2.5 ? (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 text-[10px]">
                              Average
                            </Badge>
                          ) : sem.gpa >= 2.0 ? (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-400 dark:text-yellow-400 dark:border-yellow-600 text-[10px]">
                              Below Avg
                            </Badge>
                          ) : sem.gpa >= 1.5 ? (
                            <Badge variant="outline" className="text-orange-600 border-orange-400 dark:text-orange-400 dark:border-orange-600 text-[10px]">
                              Poor
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 text-[10px]">
                              Critical
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
