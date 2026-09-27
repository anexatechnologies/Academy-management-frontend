import { useState } from "react"
import BodyLayout from "@/components/layout/BodyLayout"
import { IdCardGenerationForm } from "@/components/students/IdCardGenerationForm"
import { useCourses } from "@/hooks/api/use-courses"
import { useBatches } from "@/hooks/api/use-batches"
import { useStudents } from "@/hooks/api/use-students"
import { useDownloadIdCards } from "@/hooks/api/use-reports"

export default function IdCardGenerationPage() {
  const breadcrumbs = [
    { label: "Student Management", href: "/students" },
    { label: "Generate ID Cards" },
  ]

  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [selectedBatch, setSelectedBatch] = useState<string>("")
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

  const { data: coursesData } = useCourses()
  const { data: batchesData } = useBatches()

  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({
    limit: 1000,
    status: "active",
    course_id: selectedCourse && selectedCourse !== "all" ? selectedCourse : undefined,
    batch_id: selectedBatch && selectedBatch !== "all" ? selectedBatch : undefined,
  })

  const { mutate: downloadIdCards, isPending } = useDownloadIdCards()

  const courses = coursesData?.data ?? []
  const batches = batchesData?.data ?? []
  const allStudents = studentsData?.data ?? []

  const handleSubmit = (params: { studentIds?: number[], batchId?: number, courseId?: number, all?: boolean }) => {
    downloadIdCards(params)
  }

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bulk ID Card Generator</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate printable ID cards for courses, batches, or explicitly selected students.
          </p>
        </div>

        <IdCardGenerationForm
          courses={courses}
          batches={batches}
          allStudents={allStudents}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          selectedBatch={selectedBatch}
          setSelectedBatch={setSelectedBatch}
          selectedStudentIds={selectedStudentIds}
          setSelectedStudentIds={setSelectedStudentIds}
          isLoadingStudents={isLoadingStudents}
          isPending={isPending}
          onSubmit={handleSubmit}
        />
      </div>
    </BodyLayout>
  )
}
