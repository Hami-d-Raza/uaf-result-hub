import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableRow, TableCell } from "@/components/ui/table";

// Student Overview Skeleton
export function StudentOverviewSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar Skeleton */}
            <Skeleton className="h-20 w-20 rounded-full" />

            {/* Student Info Skeleton */}
            <div className="flex-1 space-y-2 text-center md:text-left">
              <Skeleton className="h-7 w-48 mx-auto md:mx-0" />
              <Skeleton className="h-5 w-32 mx-auto md:mx-0" />
              <Skeleton className="h-4 w-40 mx-auto md:mx-0" />
            </div>

            {/* CGPA Display Skeleton */}
            <div className="bg-primary-foreground/10 backdrop-blur rounded-xl p-4">
              <Skeleton className="h-16 w-24" />
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Result Card Skeleton
export function ResultCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-12 w-20 rounded-lg" />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3">
                    <Skeleton className="h-3 w-16" />
                  </th>
                  <th className="text-center p-3">
                    <Skeleton className="h-3 w-8 mx-auto" />
                  </th>
                  <th className="text-center p-3">
                    <Skeleton className="h-3 w-12 mx-auto" />
                  </th>
                  <th className="text-center p-3">
                    <Skeleton className="h-3 w-12 mx-auto" />
                  </th>
                  <th className="text-center p-3">
                    <Skeleton className="h-3 w-8 mx-auto" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="p-3">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </td>
                    <td className="p-3">
                      <Skeleton className="h-4 w-8 mx-auto" />
                    </td>
                    <td className="p-3">
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </td>
                    <td className="p-3">
                      <Skeleton className="h-6 w-8 mx-auto rounded" />
                    </td>
                    <td className="p-3">
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Table Row Skeleton for Class Results
export function TableRowSkeleton() {
  return (
    <tr className="border-b border-border">
      <td className="p-2 text-center">
        <Skeleton className="h-4 w-6 mx-auto" />
      </td>
      <td className="p-2">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="p-2">
        <Skeleton className="h-4 w-full max-w-xs" />
      </td>
      <td className="p-2 text-center">
        <Skeleton className="h-4 w-12 mx-auto" />
      </td>
      <td className="p-2 text-center">
        <Skeleton className="h-6 w-16 mx-auto rounded-md" />
      </td>
      <td className="p-2 text-center">
        <Skeleton className="h-4 w-12 mx-auto" />
      </td>
      <td className="p-2 text-center">
        <Skeleton className="h-8 w-16 mx-auto rounded-md" />
      </td>
    </tr>
  );
}

// Full Page Loading Skeleton for Individual Result
export function IndividualResultSkeleton() {
  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-2 md:px-8 pb-8">
      {/* Hidden Desktop Button Skeleton */}
      <div className="hidden md:flex justify-start mb-4">
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      {/* Student Overview */}
      <StudentOverviewSkeleton />

      {/* Semester Results Header */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResultCardSkeleton index={0} />
          <ResultCardSkeleton index={1} />
          <ResultCardSkeleton index={2} />
          <ResultCardSkeleton index={3} />
        </div>
      </div>
    </div>
  );
}

// Class Result Table Skeleton
export function ClassResultTableSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="w-full border shadow-sm rounded-xl">
        <CardHeader className="px-4 py-4 md:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="h-9 p-2">
                    <Skeleton className="h-3 w-6 mx-auto" />
                  </th>
                  <th className="h-9 p-2">
                    <Skeleton className="h-3 w-20" />
                  </th>
                  <th className="h-9 p-2">
                    <Skeleton className="h-3 w-16" />
                  </th>
                  <th className="h-9 p-2">
                    <Skeleton className="h-3 w-12" />
                  </th>
                  <th className="h-9 p-2">
                    <Skeleton className="h-3 w-12" />
                  </th>
                  <th className="h-9 p-2">
                    <Skeleton className="h-3 w-16" />
                  </th>
                  <th className="h-9 p-2">
                    <Skeleton className="h-3 w-16" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Smart Search Result Card Skeleton
export function SearchResultCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-full max-w-xs" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Target Calculator fetch skeleton (student summary card placeholder)
export function TargetFetchSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary/30 dark:border-primary/50 bg-primary/5 dark:bg-primary/10">
        <CardContent className="flex items-center gap-4 py-4">
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="space-y-1.5 shrink-0 text-right">
            <Skeleton className="h-8 w-16 ml-auto" />
            <Skeleton className="h-3 w-14 ml-auto" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Class Result streaming row skeleton (6 columns)
export function ClassResultRowSkeleton() {
  return (
    <TableRow className="h-8">
      <TableCell className="py-1 px-1 md:px-4 text-center"><Skeleton className="h-3 w-4 mx-auto" /></TableCell>
      <TableCell className="py-1 pl-1 pr-0"><Skeleton className="h-3 w-20" /></TableCell>
      <TableCell className="py-1 pl-0 pr-2"><Skeleton className="h-3 w-32" /></TableCell>
      <TableCell className="py-1 px-1 md:px-4 text-center"><Skeleton className="h-3 w-10 mx-auto" /></TableCell>
      <TableCell className="py-1 px-1 md:px-4 text-center"><Skeleton className="h-3 w-10 mx-auto" /></TableCell>
      <TableCell className="py-1 px-1" />
    </TableRow>
  );
}

// Smart Search streaming row skeleton (6 columns)
export function SmartSearchRowSkeleton() {
  return (
    <TableRow className="h-10">
      <TableCell className="py-2 px-1 text-center"><Skeleton className="h-3 w-4 mx-auto" /></TableCell>
      <TableCell className="py-2 px-1"><Skeleton className="h-3 w-20" /></TableCell>
      <TableCell className="py-2 px-2"><Skeleton className="h-3 w-28" /></TableCell>
      <TableCell className="py-2 px-1 text-center"><Skeleton className="h-3 w-10 mx-auto" /></TableCell>
      <TableCell className="py-2 px-1 text-center"><Skeleton className="h-5 w-8 mx-auto rounded" /></TableCell>
      <TableCell className="py-2 px-1" />
    </TableRow>
  );
}
