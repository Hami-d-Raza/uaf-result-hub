import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  BookOpen,
  Search,
  Loader2,
  RefreshCw,
  User,
} from "lucide-react";
import { AGNumberInput } from "@/components/ui/AGNumberInput";
import { TargetFetchSkeleton } from "@/components/ui/LoadingSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatAGNumber } from "@/lib/gpaCalculator";
import { uafScraper } from "@/lib/uaf-scraper";
import type { StudentResult } from "@/types/result";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// -- Types --
interface AGInput { year: string; number: string; }

interface Scenario {
  creditsPerSem: number;
  totalFutureCredits: number;
  requiredGPA: number;
  feasible: boolean;
  label: string;
  badgeColor: string;
}

// -- Scholarship milestones --
const MILESTONES = [
  { name: "Dean's List", cgpa: 3.5, icon: Award, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  { name: "Good Standing", cgpa: 3.0, icon: TrendingUp, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  { name: "Satisfactory", cgpa: 2.0, icon: CheckCircle2, color: "text-primary dark:text-primary", bg: "bg-primary/10 dark:bg-primary/20" },
  { name: "Probation Limit", cgpa: 1.5, icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
];

// -- Math core --
function calcRequiredGPA(
  currentCGPA: number,
  completedCredits: number,
  targetCGPA: number,
  futureCredits: number
): number {
  if (futureCredits <= 0) return Infinity;
  const currentPoints = currentCGPA * completedCredits;
  const targetPoints = targetCGPA * (completedCredits + futureCredits);
  return (targetPoints - currentPoints) / futureCredits;
}

// -- Custom tooltip --
const ProjectionTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg text-xs space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {Number(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
};

// -- Step indicator --
function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
        done  ? "bg-primary border-primary text-primary-foreground"
             : active ? "bg-primary border-primary text-primary-foreground"
             : "bg-muted border-border text-muted-foreground"
      )}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : n}
      </div>
      <span className={cn("text-[10px]", active ? "text-primary font-semibold" : "text-muted-foreground")}>
        {n === 1 ? "Student" : n === 2 ? "Target" : "Results"}
      </span>
    </div>
  );
}

// -- Main component --
export default function TargetCalculator() {
  // Step state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1  AG fetch
  const [agInput, setAgInput] = useState<AGInput>({ year: "", number: "" });
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [student, setStudent] = useState<StudentResult | null>(null);

  // Step 2  target inputs
  const [targetCGPA, setTargetCGPA] = useState("");
  const [remainingSemesters, setRemainingSemesters] = useState(2);
  const [creditsPerSem, setCreditsPerSem] = useState(18);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [perSemCredits, setPerSemCredits] = useState<number[]>([]);

  //  Derived from student 
  const cCGPA    = student?.cgpa ?? 0;
  const cCredits = student?.totalCreditHours ?? 0;
  const tCGPA    = parseFloat(targetCGPA) || 0;

  const isStep2Valid = tCGPA > 0 && tCGPA <= 4.0 && remainingSemesters > 0;

  const semCreditsList = useMemo(() => {
    if (perSemCredits.length === remainingSemesters) return perSemCredits;
    return Array.from({ length: remainingSemesters }, () => creditsPerSem);
  }, [perSemCredits, remainingSemesters, creditsPerSem]);

  const totalFutureCredits = semCreditsList.reduce((a, b) => a + b, 0);

  const requiredGPA = useMemo(() => {
    if (!student || !isStep2Valid) return null;
    return calcRequiredGPA(cCGPA, cCredits, tCGPA, totalFutureCredits);
  }, [cCGPA, cCredits, tCGPA, totalFutureCredits, student, isStep2Valid]);

  const scenarios: Scenario[] = useMemo(() => {
    if (!student || !isStep2Valid) return [];
    const base = [
      { creditsPerSem: 15, label: "Conservative (15 cr/sem)", badgeColor: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400" },
      { creditsPerSem: 18, label: "Standard (18 cr/sem)",     badgeColor: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400" },
      { creditsPerSem: 21, label: "Intensive (21 cr/sem)",    badgeColor: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400" },
    ];
    return base.map((s) => {
      const future = s.creditsPerSem * remainingSemesters;
      const req    = calcRequiredGPA(cCGPA, cCredits, tCGPA, future);
      return { ...s, totalFutureCredits: future, requiredGPA: req, feasible: req <= 4.0 && req >= 0 };
    });
  }, [cCGPA, cCredits, tCGPA, remainingSemesters, student, isStep2Valid]);

  const projectionData = useMemo(() => {
    if (!student || requiredGPA === null) return [];
    const gpaToUse = Math.min(Math.max(requiredGPA, 0), 4.0);
    const points = [{ semester: "Now", cgpa: cCGPA, target: tCGPA }];
    let runningPoints  = cCGPA * cCredits;
    let runningCredits = cCredits;
    semCreditsList.forEach((cr, i) => {
      runningPoints  += gpaToUse * cr;
      runningCredits += cr;
      points.push({ semester: `Sem +${i + 1}`, cgpa: Number((runningPoints / runningCredits).toFixed(2)), target: tCGPA });
    });
    return points;
  }, [cCGPA, cCredits, tCGPA, semCreditsList, requiredGPA, student]);

  const milestoneStatus = useMemo(() => MILESTONES.map((m) => ({
    ...m,
    achieved:  cCGPA >= m.cgpa,
    reachable: tCGPA >= m.cgpa && requiredGPA !== null && requiredGPA <= 4.0,
  })), [cCGPA, tCGPA, requiredGPA]);

  const isFeasible        = requiredGPA !== null && requiredGPA <= 4.0 && requiredGPA >= 0;
  const isAlreadyAchieved = student ? cCGPA >= tCGPA : false;

  //  Handlers 
  async function handleFetch() {
    if (!agInput.year || !agInput.number) return;
    setFetchLoading(true);
    setFetchError("");
    try {
      const formatted = formatAGNumber(agInput.year, agInput.number);
      const result    = await uafScraper.getResult(formatted);
      if (result.error || result.status === "error") {
        setFetchError(result.error ?? "Could not fetch student data. Please check your AG number.");
      } else {
        setStudent(result);
        setStep(2);
      }
    } catch {
      setFetchError("Network error. Please check your connection and try again.");
    } finally {
      setFetchLoading(false);
    }
  }

  function handleReset() {
    setStep(1);
    setAgInput({ year: "", number: "" });
    setFetchError("");
    setStudent(null);
    setTargetCGPA("");
    setRemainingSemesters(2);
    setCreditsPerSem(18);
    setPerSemCredits([]);
  }

  //  Render 
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-2 md:px-8 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Target className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Target CGPA Calculator</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Enter your AG number to auto-fill your current standing, then set your goal.
          </p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <StepDot n={1} active={step === 1} done={step > 1} />
          <div className={cn("flex-1 h-0.5 max-w-[60px] rounded-full transition-colors", step > 1 ? "bg-primary" : "bg-border")} />
          <StepDot n={2} active={step === 2} done={step > 2} />
          <div className={cn("flex-1 h-0.5 max-w-[60px] rounded-full transition-colors", step > 2 ? "bg-primary" : "bg-border")} />
          <StepDot n={3} active={step === 3} done={false} />
        </div>

        <AnimatePresence mode="wait">

          {/* â•â• STEP 1 â€” AG Number â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
              <Card className="border-primary/20 shadow-xl">
                <CardHeader className="pb-3 pt-5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Enter Your AG Number
                  </CardTitle>
                  <CardDescription>We'll fetch your current CGPA and credit hours from UAF LMS</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <AGNumberInput
                    value={agInput}
                    onChange={(val) => { setAgInput(val); setFetchError(""); }}
                  />

                  {fetchError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Fetch Failed</AlertTitle>
                      <AlertDescription>{fetchError}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    className="w-full h-11 font-bold shadow-md"
                    onClick={handleFetch}
                    disabled={fetchLoading || !agInput.year || !agInput.number}
                  >
                    {fetchLoading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Fetching…</>
                    ) : (
                      <><Search className="h-4 w-4 mr-2" />Fetch My Data</>
                    )}
                  </Button>

                  <AnimatePresence>
                    {fetchLoading && <TargetFetchSkeleton />}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* â•â• STEP 2 â€” Target + sliders â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {step === 2 && student && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">

              {/* Student summary card */}
              <Card className="border-primary/30 dark:border-primary/50 bg-primary/5 dark:bg-primary/10">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.registrationNo}{student.program ? ` · ${student.program}` : ""}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-black text-primary">{cCGPA.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">{cCredits} credits</p>
                  </div>
                </CardContent>
              </Card>

              {/* Inputs */}
              <Card className="border-primary/20 shadow-xl">
                <CardHeader className="pb-3 pt-5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Set Your Goal
                  </CardTitle>
                  <CardDescription>Tell us where you want to end up</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* Target CGPA */}
                  <div className="space-y-2">
                    <Label htmlFor="target-cgpa" className="text-sm font-medium">Target CGPA</Label>
                    <Input
                      id="target-cgpa"
                      type="number"
                      min={0} max={4.0} step={0.01}
                      placeholder="e.g. 3.5"
                      value={targetCGPA}
                      onChange={(e) => setTargetCGPA(e.target.value)}
                      className="h-11"
                    />
                    <div className="flex flex-wrap gap-2 mt-1">
                      {[{ label: "Dean's List (3.5)", value: "3.5" }, { label: "Good (3.0)", value: "3.0" }, { label: "Satisfactory (2.5)", value: "2.5" }].map((p) => (
                        <button key={p.value} type="button" onClick={() => setTargetCGPA(p.value)}
                          className={cn("text-[11px] px-2.5 py-1 rounded-full border transition-all",
                            targetCGPA === p.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                          )}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Remaining semesters */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Remaining Semesters</Label>
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">{remainingSemesters}</span>
                    </div>
                    <Slider min={1} max={8} step={1} value={[remainingSemesters]}
                      onValueChange={([v]) => { setRemainingSemesters(v); setPerSemCredits([]); }} className="w-full" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      {[1,2,3,4,5,6,7,8].map((n) => <span key={n}>{n}</span>)}
                    </div>
                  </div>

                  {/* Credits per semester */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Credits per Semester</Label>
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">{creditsPerSem} cr</span>
                    </div>
                    <Slider min={1} max={24} step={1} value={[creditsPerSem]}
                      onValueChange={([v]) => { setCreditsPerSem(v); setPerSemCredits([]); }} className="w-full" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>1 (min)</span><span>18 (standard)</span><span>24 (max)</span>
                    </div>
                  </div>

                  {/* Advanced per-sem credits */}
                  <div>
                    <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      Advanced: set credits per semester individually
                    </button>
                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {Array.from({ length: remainingSemesters }, (_, i) => (
                            <div key={i} className="space-y-1">
                              <Label className="text-[11px] text-muted-foreground">Sem +{i + 1}</Label>
                              <Input type="number" min={1} max={24} className="h-9 text-sm"
                                value={perSemCredits[i] ?? creditsPerSem}
                                onChange={(e) => {
                                  const updated = [...semCreditsList];
                                  updated[i] = parseInt(e.target.value) || creditsPerSem;
                                  setPerSemCredits(updated);
                                }} />
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <Button className="flex-1 h-11 font-bold shadow-md" onClick={() => setStep(3)} disabled={!isStep2Valid}>
                      <Target className="h-4 w-4 mr-2" />Calculate
                    </Button>
                    <Button variant="outline" className="h-11 px-4" onClick={() => setStep(1)}>
                      <RefreshCw className="h-4 w-4 mr-1" />Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* â•â• STEP 3 â€” Results â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {step === 3 && student && isStep2Valid && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">

              {/* Student pill */}
              <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-none">{student.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Current CGPA: {cCGPA.toFixed(2)} · {cCredits} credits</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs gap-1">
                  <RefreshCw className="h-3 w-3" />New
                </Button>
              </div>

              {/* Already achieved */}
              {isAlreadyAchieved && (
                <Card className="border-primary/30 dark:border-primary/40 bg-primary/5 dark:bg-primary/10">
                  <CardContent className="flex items-center gap-4 py-5">
                    <CheckCircle2 className="h-10 w-10 text-primary shrink-0" />
                    <div>
                      <p className="font-bold text-primary dark:text-primary text-lg">You've already achieved your target! ðŸŽ‰</p>
                      <p className="text-sm text-primary/80 dark:text-primary/70">
                        Current CGPA <strong>{cCGPA.toFixed(2)}</strong> already meets or exceeds target <strong>{tCGPA.toFixed(2)}</strong>.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Infeasible */}
              {!isAlreadyAchieved && !isFeasible && (
                <Card className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                  <CardContent className="flex items-center gap-4 py-5">
                    <XCircle className="h-10 w-10 text-red-500 shrink-0" />
                    <div>
                      <p className="font-bold text-red-700 dark:text-red-400 text-lg">Target not reachable with current plan</p>
                      <p className="text-sm text-red-600 dark:text-red-500">
                        Required GPA ({requiredGPA !== null ? requiredGPA.toFixed(2) : "â€”"}) exceeds 4.0.
                        Try increasing credits or remaining semesters on the previous step.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Main result card */}
              {!isAlreadyAchieved && (
                <Card className={cn("border-2", isFeasible ? "border-primary/40 bg-primary/5" : "border-red-300 dark:border-red-700")}>
                  <CardContent className="py-6 px-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="text-center md:text-left">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Required GPA per Semester</p>
                        <p className={cn("text-6xl font-black leading-none",
                          isFeasible
                            ? requiredGPA! >= 3.7 ? "text-amber-500" : requiredGPA! >= 3.0 ? "text-primary" : "text-violet-500"
                            : "text-red-500"
                        )}>
                          {requiredGPA !== null && requiredGPA <= 4.0 ? requiredGPA.toFixed(2) : "4.0+"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">out of 4.0</p>
                      </div>
                      <div className="hidden md:block w-px h-20 bg-border" />
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                        <div><p className="text-xs text-muted-foreground">Current CGPA</p><p className="text-xl font-bold">{cCGPA.toFixed(2)}</p></div>
                        <div><p className="text-xs text-muted-foreground">Target CGPA</p><p className="text-xl font-bold text-primary">{tCGPA.toFixed(2)}</p></div>
                        <div><p className="text-xs text-muted-foreground">CGPA Gap</p><p className="text-xl font-bold">{(tCGPA - cCGPA).toFixed(2)}</p></div>
                        <div><p className="text-xs text-muted-foreground">Completed Credits</p><p className="text-xl font-bold">{cCredits}</p></div>
                        <div><p className="text-xs text-muted-foreground">Future Credits</p><p className="text-xl font-bold">{totalFutureCredits}</p></div>
                        <div><p className="text-xs text-muted-foreground">Total Credits</p><p className="text-xl font-bold">{cCredits + totalFutureCredits}</p></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Projection chart */}
              {projectionData.length > 1 && (
                <Card>
                  <CardHeader className="pb-2 pt-5">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base">CGPA Projection</CardTitle>
                    </div>
                    <CardDescription>Estimated trajectory if you maintain the required GPA each semester</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-4">
                    <div className="h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={projectionData} margin={{ top: 8, right: 16, left: -16, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                          <XAxis dataKey="semester" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                          <YAxis domain={[Math.max(0, cCGPA - 0.5), 4.0]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                          <Tooltip content={<ProjectionTooltip />} />
                          <ReferenceLine y={tCGPA} stroke="#6366f1" strokeDasharray="5 3" strokeWidth={1.5}
                            label={{ value: `Target ${tCGPA}`, position: "insideTopRight", fontSize: 10, fill: "#6366f1" }} />
                          <Line type="monotone" dataKey="cgpa" name="Projected CGPA" stroke="hsl(var(--primary))"
                            strokeWidth={2.5} dot={{ r: 5, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }} activeDot={{ r: 7 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Scenarios */}
              <Card>
                <CardHeader className="pb-2 pt-5">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Credit Load Scenarios</CardTitle>
                  </div>
                  <CardDescription>Required GPA for different credit loads over {remainingSemesters} semester{remainingSemesters > 1 ? "s" : ""}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pb-5">
                  {scenarios.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      className={cn("flex items-center justify-between rounded-xl border p-4",
                        s.feasible ? "bg-card hover:bg-muted/30" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                      )}>
                      <div>
                        <p className="text-sm font-semibold">{s.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.totalFutureCredits} total future credits</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn("text-2xl font-black",
                          s.feasible ? s.requiredGPA >= 3.7 ? "text-amber-500" : s.requiredGPA >= 3.0 ? "text-primary" : "text-violet-500" : "text-red-500")}>
                          {s.requiredGPA <= 4.0 && s.requiredGPA >= 0 ? s.requiredGPA.toFixed(2) : "4.0+"}
                        </span>
                        <Badge variant="outline" className={cn("text-[10px]", s.badgeColor)}>
                          {s.feasible ? "Achievable âœ“" : "Not Feasible âœ—"}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Milestones */}
              <Card>
                <CardHeader className="pb-2 pt-5">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Academic Milestones</CardTitle>
                  </div>
                  <CardDescription>Your current and potential academic standing</CardDescription>
                </CardHeader>
                <CardContent className="pb-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {milestoneStatus.map((m, i) => (
                      <motion.div key={m.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className={cn("flex items-center gap-3 rounded-xl border p-4", m.achieved ? `${m.bg} border-current/20` : "bg-card")}>
                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", m.bg)}>
                          <m.icon className={cn("h-5 w-5", m.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{m.name}</p>
                            {m.achieved && <Badge className="text-[9px] px-1.5 py-0 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400">✓ Achieved</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Requires CGPA ≥ {m.cgpa.toFixed(1)}
                            {!m.achieved && m.reachable && " · Reachable with your plan ✓"}
                            {!m.achieved && !m.reachable && " · Not reachable with current plan"}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 rounded-lg bg-muted/40 border border-border p-3 text-xs text-muted-foreground">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Calculations are estimates assuming equal GPA distribution across semesters. Actual results depend on course difficulty, credit loads, and UAF grading policies. Use as a planning guide.</p>
              </div>

              {/* Back button */}
              <Button variant="outline" className="w-full h-11" onClick={() => setStep(2)}>
                <ChevronUp className="h-4 w-4 mr-2" />Adjust Parameters
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </Layout>
  );
}
