import { useMemo } from "react"
import { ComboBox } from "@/components/ui/combobox"
import { MultiSelectComboBox } from "@/components/ui/multi-select-combobox"
import { FormFooter } from "@/components/ui/form-footer"
import { Label } from "@/components/ui/label"
import type { Course } from "@/types/course"
import type { Batch } from "@/types/batch"
import type { Student } from "@/types/student"

interface IdCardGenerationFormProps {
  courses: Course[]
  batches: Batch[]
  allStudents: Student[]
  selectedCourse: string
  setSelectedCourse: (val: string) => void
  selectedBatch: string
  setSelectedBatch: (val: string) => void
  selectedStudentIds: string[]
  setSelectedStudentIds: (vals: string[]) => void
  isLoadingStudents: boolean
  isPending: boolean
  onSubmit: (params: { studentIds?: number[], batchId?: number, courseId?: number, all?: boolean }) => void
}

export const IdCardGenerationForm = ({
  courses,
  batches,
  allStudents,
  selectedCourse,
  setSelectedCourse,
  selectedBatch,
  setSelectedBatch,
  selectedStudentIds,
  setSelectedStudentIds,
  isLoadingStudents,
  isPending,
  onSubmit
}: IdCardGenerationFormProps) => {

  const courseOptions = useMemo(() => [
    { value: "all", label: "All Courses" },
    ...courses.map((c) => ({ value: String(c.id), label: c.name }))
  ], [courses])

  const batchOptions = useMemo(() => {
    // If a course is selected, filter batches by that course. Otherwise show all batches.
    const filtered = batches.filter((b) => {
      if (selectedCourse && selectedCourse !== "all") {
        if (b.courses && b.courses.length > 0) {
          return b.courses.some(c => String(c.id) === selectedCourse)
        }
        return String(b.course_id) === selectedCourse
      }
      return true
    })
    return [
      { value: "all", label: "All Batches" },
      ...filtered.map((b) => ({ value: String(b.id), label: b.name }))
    ]
  }, [batches, selectedCourse])

  const getStudentCourseName = (student: Student): string => {
    const batches = student.batches ?? []
    if (batches.length === 0) return ""
    const names = [...new Set(batches.map(b => b.course_name))].filter(Boolean)
    return names.join(", ")
  }

  const studentOptions = useMemo(() => {
    return allStudents.map((s) => ({
      value: String(s.id),
      label: s.name,
      subLabel: s.registration_no ? `Reg: ${s.registration_no}` : undefined,
      badge: getStudentCourseName(s) || undefined,
    }))
  }, [allStudents])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedStudentIds.length > 0) {
      onSubmit({ studentIds: selectedStudentIds.map(Number) })
    } else if (selectedBatch && selectedBatch !== "all") {
      onSubmit({ batchId: Number(selectedBatch) })
    } else if (selectedCourse && selectedCourse !== "all") {
      onSubmit({ courseId: Number(selectedCourse) })
    } else {
      onSubmit({ all: true })
    }
  }

  let generateLabel = "Generate for All Active Students"
  if (selectedStudentIds.length > 0) {
    generateLabel = `Generate for ${selectedStudentIds.length} Selected Student${selectedStudentIds.length > 1 ? "s" : ""}`
  } else if (selectedBatch && selectedBatch !== "all") {
    generateLabel = "Generate for Selected Batch"
  } else if (selectedCourse && selectedCourse !== "all") {
    generateLabel = "Generate for Selected Course"
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-6">

          {/* Section 1: Filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">1</span>
              <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Select Scope / Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Course</Label>
                <ComboBox
                  value={selectedCourse}
                  onValueChange={(val) => {
                    setSelectedCourse(val)
                    setSelectedBatch("all")
                    setSelectedStudentIds([])
                  }}
                  options={courseOptions}
                  placeholder="All Courses"
                  searchPlaceholder="Search courses..."
                  emptyText="No courses found."
                  disabled={isPending}
                  triggerClassName="w-full h-10 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Batch</Label>
                <ComboBox
                  value={selectedBatch}
                  onValueChange={(val) => {
                    setSelectedBatch(val)
                    setSelectedStudentIds([])
                  }}
                  options={batchOptions}
                  placeholder="All Batches"
                  searchPlaceholder="Search batches..."
                  emptyText="No batches found."
                  disabled={isPending}
                  triggerClassName="w-full h-10 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Section 2: Specific Student Multi-Select Dropdown */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">2</span>
              <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Select Specific Students (Optional)</h2>
            </div>

            <MultiSelectComboBox
              values={selectedStudentIds}
              onValuesChange={setSelectedStudentIds}
              options={studentOptions}
              placeholder="All active students in selected filters (Default)"
              searchPlaceholder="Search by student name or reg no..."
              emptyText="No matching active students found."
              disabled={isPending}
              isLoading={isLoadingStudents}
              triggerClassName="w-full h-10 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            />

            <p className="text-xs text-slate-500 italic">
              Leave empty to generate ID cards for all students matching the selected course and batch filters above.
            </p>
          </div>

        </div>

        {/* Card Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-end bg-slate-50/50 dark:bg-slate-800/50">
          <FormFooter
            isLoading={isPending}
            submitLabel={generateLabel}
            loadingLabel="Generating..."
            cancelHref="/students"
            className="border-none shadow-none p-0 bg-transparent mt-0"
          />
        </div>
      </div>
    </form>
  )
}
