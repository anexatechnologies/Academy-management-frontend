import { useEffect, useRef, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X, Loader2, UserCircle2, SlidersHorizontal, MapPin, Calendar, Hash, Phone } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
import { ComboBox } from "@/components/ui/combobox"
import { useStudents } from "@/hooks/api/use-students"
import { useSearchFilter } from "@/hooks/use-search-filter"
import { useCourseComboBox, useBatchComboBox } from "@/hooks/use-combobox-data"
import { GENDER_TYPES } from "@/utils/student-constants"
import { cn } from "@/lib/utils"
import { DateCell } from "@/components/ui/date-cell"
import type { Student } from "@/types/student"

interface StudentQuickSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type StudentFilters = {
  status: string | undefined
  gender: string | undefined
  course_id: string | undefined
  batch_id: string | undefined
}

const LIMIT = 10

export function StudentQuickSearchModal({ open, onOpenChange }: StudentQuickSearchModalProps) {
  const navigate = useNavigate()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(1)
  const [accumulated, setAccumulated] = useState<Student[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const { search, setSearch, params, setFilter, resetFilters } = useSearchFilter<StudentFilters>({
    initialFilters: {
      status: undefined,
      gender: undefined,
      course_id: undefined,
      batch_id: undefined,
    },
    onFilterChange: () => setPage(1),
  })

  const { data, isLoading, isFetching } = useStudents({
    page,
    limit: LIMIT,
    ...params,
  })

  const courseComboBox = useCourseComboBox()
  const batchComboBox = useBatchComboBox()

  // Reset everything when modal opens/closes
  useEffect(() => {
    if (open) {
      setPage(1)
      setAccumulated([])
      setShowFilters(false)
      setTimeout(() => searchInputRef.current?.focus(), 50)
    } else {
      resetFilters()
      setPage(1)
      setAccumulated([])
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset accumulated list when filters/search change
  useEffect(() => {
    setPage(1)
    setAccumulated([])
  }, [params.search, params.status, params.gender, params.course_id, params.batch_id])

  // Accumulate results for infinite scroll
  useEffect(() => {
    if (!data?.data) return
    if (page === 1) {
      setAccumulated(data.data)
    } else {
      setAccumulated((prev) => {
        const seen = new Set(prev.map((s) => s.id))
        const unique = data.data.filter((s) => !seen.has(s.id))
        return [...prev, ...unique]
      })
    }
  }, [data, page])

  const hasMore = data ? page < (data.pagination?.totalPages ?? 1) : false

  // Infinite scroll on the results list
  const handleScroll = useCallback(() => {
    const el = listRef.current
    if (!el || !hasMore || isFetching) return
    const threshold = 80
    if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
      setPage((prev) => prev + 1)
    }
  }, [hasMore, isFetching])

  const handleSelectStudent = (student: Student) => {
    onOpenChange(false)
    navigate(`/students/view/${student.id}`)
  }

  const hasActiveFilters =
    !!params.status || !!params.gender || !!params.course_id || !!params.batch_id

  const handleClearAll = () => {
    resetFilters()
    setPage(1)
    setAccumulated([])
    searchInputRef.current?.focus()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 gap-0 max-w-2xl w-full overflow-hidden rounded-2xl"
      >
        {/* Visually hidden title for a11y */}
        <DialogTitle className="sr-only">Quick Student Search</DialogTitle>

        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name, ID, or contact..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
          <div className="flex items-center gap-1 shrink-0">
            {(search || hasActiveFilters) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearAll}
                className="h-7 w-7 text-slate-400 hover:text-slate-600 rounded-full"
                title="Clear all"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                "h-7 w-7 rounded-full transition-colors",
                showFilters || hasActiveFilters
                  ? "text-primary bg-primary/10 hover:bg-primary/20"
                  : "text-slate-400 hover:text-slate-600"
              )}
              title="Toggle filters"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {hasActiveFilters && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-7 w-7 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
            <CustomSelect
              value={params.status || "all"}
              onValueChange={(val) => setFilter("status", val === "all" ? undefined : val)}
              triggerClassName="h-8 text-xs w-[130px]"
              options={[
                { value: "all", label: "All Status" },
                {
                  value: "active",
                  label: (
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Active</span>
                    </div>
                  ),
                },
                {
                  value: "inactive",
                  label: (
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      <span>Inactive</span>
                    </div>
                  ),
                },
              ]}
            />

            <CustomSelect
              value={params.gender || "all"}
              onValueChange={(val) => setFilter("gender", val === "all" ? undefined : val)}
              triggerClassName="h-8 text-xs w-[130px]"
              options={[
                { value: "all", label: "All Genders" },
                ...GENDER_TYPES,
              ]}
            />

            <ComboBox
              placeholder="All Courses"
              value={params.course_id || ""}
              onValueChange={(val) => setFilter("course_id", val || undefined)}
              options={courseComboBox.options}
              onSearch={courseComboBox.onSearch}
              onLoadMore={courseComboBox.onLoadMore}
              onReset={courseComboBox.onReset}
              hasMore={courseComboBox.hasMore}
              isLoading={courseComboBox.isLoading}
              isLoadingMore={courseComboBox.isLoadingMore}
              searchPlaceholder="Search courses..."
              emptyText="No courses found."
              triggerClassName="h-8 text-xs w-[150px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
            />

            <ComboBox
              placeholder="All Batches"
              value={params.batch_id || ""}
              onValueChange={(val) => setFilter("batch_id", val || undefined)}
              options={batchComboBox.options}
              onSearch={batchComboBox.onSearch}
              onLoadMore={batchComboBox.onLoadMore}
              onReset={batchComboBox.onReset}
              hasMore={batchComboBox.hasMore}
              isLoading={batchComboBox.isLoading}
              isLoadingMore={batchComboBox.isLoadingMore}
              searchPlaceholder="Search batches..."
              emptyText="No batches found."
              triggerClassName="h-8 text-xs w-[150px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
            />

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilter("status", undefined)
                  setFilter("gender", undefined)
                  setFilter("course_id", undefined)
                  setFilter("batch_id", undefined)
                }}
                className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}

        {/* Results list */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="overflow-y-auto max-h-[420px] divide-y divide-slate-100 dark:divide-slate-800"
        >
          {/* Loading skeleton */}
          {isLoading && (
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && accumulated.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <UserCircle2 className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {search || hasActiveFilters ? "No students match your search." : "Start typing to search students."}
              </p>
            </div>
          )}

          {/* Student rows */}
          {!isLoading &&
            accumulated.map((student) => {
              const location = [student.city, student.state].filter(Boolean).join(", ")
              return (
                <button
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                >
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0 text-sm mt-0.5">
                    {student.photo_url ? (
                      <img
                        src={student.photo_url}
                        alt={student.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      student.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    {/* Row 1: name + badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors truncate">
                        {student.name}
                      </p>
                      {student.gender && (
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0",
                            student.gender === "Male"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : student.gender === "Female"
                                ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
                                : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {student.gender}
                        </span>
                      )}
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0",
                          student.status === "active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                        )}
                      >
                        {student.status}
                      </span>
                    </div>

                    {/* Row 2: ID + reg no */}
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-slate-500 font-mono tracking-wider">
                        #{student.student_id}
                      </span>
                      {student.registration_no && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Hash className="h-2.5 w-2.5 shrink-0" />
                          {student.registration_no}
                        </span>
                      )}
                    </div>

                    {/* Row 3: meta details */}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {student.personal_contact && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Phone className="h-2.5 w-2.5 shrink-0" />
                          {student.personal_contact}
                        </span>
                      )}
                      {student.date_of_birth && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Calendar className="h-2.5 w-2.5 shrink-0" />
                          <span className="text-slate-500 font-medium">DOB:</span>
                          <DateCell
                            date={student.date_of_birth}
                            textClassName="text-[11px] text-slate-400"
                          />
                        </span>
                      )}
                      {location && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-[180px]">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />
                          {location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: registration date */}
                  <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0 pt-0.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Reg. Date</span>
                    <DateCell
                      date={student.registration_date}
                      textClassName="text-[11px] text-slate-500 font-medium"
                    />
                  </div>
                </button>
              )
            })}

          {/* Load-more spinner */}
          {isFetching && !isLoading && (
            <div className="flex justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
          <span className="text-[11px] text-slate-400">
            {!isLoading && data
              ? `${data.pagination?.totalData ?? 0} student${(data.pagination?.totalData ?? 0) !== 1 ? "s" : ""} found`
              : ""}
          </span>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[10px]">
              Esc
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
