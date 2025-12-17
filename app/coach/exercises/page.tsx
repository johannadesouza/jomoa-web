"use client";

import { useExercises } from "@/hooks/useExercises";
import { Exercise } from "@/lib/types/common";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Chip } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";

export default function CoachExercises() {
  const { exercises, loading, error, refetch } = useExercises({
    includeCoachExercises: true,
    includeGlobalExercises: true,
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Övningar" subtitle="Hantera dina övningar" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Övningar" subtitle="Hantera dina övningar" />
        <ErrorState title="Kunde inte ladda övningar" message={error || "Ett oväntat fel uppstod"} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Övningar" subtitle="Hantera dina övningar" />

      {exercises.length === 0 ? (
        <EmptyState
          title="Inga övningar ännu"
          description="När du har övningar kommer de att visas här."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Utrustning</TableHead>
                  <TableHead>Typ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exercises.map((exercise) => (
                  <TableRow key={exercise.id}>
                    <TableCell>
                      <div className="text-sm font-medium text-[#5A6B5D]">
                        {exercise.name}
                      </div>
                      {exercise.description && (
                        <div className="text-sm text-[#5A6B5D]/70 mt-1">
                          {exercise.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-[#5A6B5D]">
                        {exercise.category || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-[#5A6B5D]">
                        {exercise.equipment || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip variant={exercise.is_global ? "info" : "default"}>
                        {exercise.is_global ? "Global" : "Egen"}
                      </Chip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
