import { useState } from "react"
import { Award, Search, Users } from "lucide-react"
import { ComboBox } from "@/components/ui/combobox"
import { useBatchComboBox, useStudentComboBox } from "@/hooks/use-combobox-data"
import StudentCompletionForm from "./StudentCompletionForm"

const CourseCompletion = () => {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  
  const batchComboBox = useBatchComboBox()
  const studentComboBox = useStudentComboBox(selectedBatchId || undefined)

  // Find selected batch name and course ID
  const selectedBatch = batchComboBox.rawData?.find(b => String(b.id) === selectedBatchId)
  const courseId = selectedBatch?.course_id

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-6 md:p-8 animate-in zoom-in-95 duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              1. Select Batch
            </h3>
            <ComboBox
              options={batchComboBox.options}
              value={selectedBatchId || ""}
              onValueChange={(val) => {
                setSelectedBatchId(val)
                setSelectedStudentId(null) // Reset student when batch changes
              }}
              onSearch={batchComboBox.onSearch}
              onLoadMore={batchComboBox.onLoadMore}
              isLoading={batchComboBox.isLoading}
              hasMore={batchComboBox.hasMore}
              placeholder="Search by batch name..."
              className="w-full h-11 rounded-xl"
              disabled={isDownloading}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              2. Select Student
            </h3>
            <ComboBox
              options={studentComboBox.options}
              value={selectedStudentId || ""}
              onValueChange={setSelectedStudentId}
              onSearch={studentComboBox.onSearch}
              onLoadMore={studentComboBox.onLoadMore}
              isLoading={studentComboBox.isLoading}
              hasMore={studentComboBox.hasMore}
              placeholder={selectedBatchId ? "Search students in batch..." : "Select a batch first"}
              disabled={!selectedBatchId || isDownloading}
              className="w-full h-11 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        {selectedStudentId && courseId ? (
          <StudentCompletionForm 
            studentId={selectedStudentId} 
            courseId={courseId} 
            isDownloading={isDownloading}
            setIsDownloading={setIsDownloading}
          />
        ) : !selectedBatchId ? (
          <div className="bg-slate-50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Award className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Academic Completion Rewards</h3>
              <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto mt-1">Start by selecting a batch to view students and generate their course completion certificates.</p>
            </div>
          </div>
        ) : !selectedStudentId ? (
          <div className="bg-slate-50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-3">
             <div className="animate-bounce">
               <Users className="h-8 w-8 text-primary/40" />
             </div>
             <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Select a student to continue</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default CourseCompletion
