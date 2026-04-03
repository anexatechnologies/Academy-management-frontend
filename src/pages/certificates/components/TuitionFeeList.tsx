import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Receipt, Printer, Loader2, IndianRupee, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ComboBox } from "@/components/ui/combobox"
import { SearchBar } from "@/components/ui/search-bar"
import { DatePickerInput } from "@/components/ui/date-picker"
import { usePagination } from "@/hooks/use-pagination"
import { useSearchFilter } from "@/hooks/use-search-filter"
import { useStudentComboBox, useBatchComboBox, useCourseComboBox } from "@/hooks/use-combobox-data"
import { useCertificates, useCertificatePayments } from "@/hooks/api/use-certificates"
import { format } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const TuitionFeeList = () => {
  const { page, pageSize, setPage, setPageSize, setTotal } = usePagination()
  
  type PaymentFilters = {
    student_id: string | undefined
    batch_id: string | undefined
    course_id: string | undefined
    from_date: string | undefined
    to_date: string | undefined
  }

  const { search, setSearch, debouncedSearch, filters, setFilter, params, resetFilters } = useSearchFilter<PaymentFilters>({
    initialFilters: {
      student_id: undefined,
      batch_id: undefined,
      course_id: undefined,
      from_date: undefined,
      to_date: undefined,
    },
    onFilterChange: () => setPage(1)
  })

  const { data, isLoading, isFetching } = useCertificatePayments({
    page,
    limit: pageSize,
    search: debouncedSearch,
    ...params
  })

  // Sync total items with pagination
  useEffect(() => {
    if (data?.pagination?.totalData) {
      setTotal(data.pagination.totalData)
    }
  }, [data?.pagination?.totalData, setTotal])

  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const { downloadCertificate } = useCertificates()

  const studentComboBox = useStudentComboBox(filters.batch_id)
  const batchComboBox = useBatchComboBox()
  const courseComboBox = useCourseComboBox()

  const handleDownloadReceipt = async (paymentId: number) => {
    try {
      setIsDownloading(`receipt-${paymentId}`)
      await downloadCertificate(`receipt/${paymentId}`, {})
      toast.success("Payment receipt opened successfully")
    } catch (error) {
      toast.error("Failed to download receipt")
    } finally {
      setIsDownloading(null)
    }
  }

  // Calculate total paid for the current page
  const pageTotalPaid = data?.data.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  const hasActiveFilters = search || filters.student_id || filters.batch_id || filters.course_id || filters.from_date || filters.to_date

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Filters Toolbar */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl shadow-md p-4 sticky top-[104px] z-[18] transition-all duration-300">
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            placeholder="Search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10"
            disabled={isDownloading !== null}
          />

          <ComboBox
            placeholder="All Batches"
            value={filters.batch_id || ""}
            onValueChange={(val) => setFilter("batch_id", val || undefined)}
            options={batchComboBox.options}
            onSearch={batchComboBox.onSearch}
            onLoadMore={batchComboBox.onLoadMore}
            isLoading={batchComboBox.isLoading}
            hasMore={batchComboBox.hasMore}
            className="w-full md:w-44"
            triggerClassName="h-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            disabled={isDownloading !== null}
          />

          <ComboBox
            placeholder="All Courses"
            value={filters.course_id || ""}
            onValueChange={(val) => setFilter("course_id", val || undefined)}
            options={courseComboBox.options}
            onSearch={courseComboBox.onSearch}
            onLoadMore={courseComboBox.onLoadMore}
            isLoading={courseComboBox.isLoading}
            hasMore={courseComboBox.hasMore}
            className="w-full md:w-44"
            triggerClassName="h-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            disabled={isDownloading !== null}
          />

          <ComboBox
            placeholder="All Students"
            value={filters.student_id || ""}
            onValueChange={(val) => setFilter("student_id", val || undefined)}
            options={studentComboBox.options}
            onSearch={studentComboBox.onSearch}
            onLoadMore={studentComboBox.onLoadMore}
            isLoading={studentComboBox.isLoading}
            hasMore={studentComboBox.hasMore}
            className="w-full md:w-56"
            triggerClassName="h-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            disabled={isDownloading !== null}
          />

          <div className="flex items-center gap-2">
            <DatePickerInput
              placeholder="From Date"
              value={filters.from_date ? new Date(filters.from_date) : null}
              onChange={(date) => setFilter("from_date", date ? format(date, "yyyy-MM-dd") : undefined)}
              className="w-36 h-10"
              wrapperClassName="h-10"
              disabled={isDownloading !== null}
            />
            <DatePickerInput
              placeholder="To Date"
              value={filters.to_date ? new Date(filters.to_date) : null}
              onChange={(date) => setFilter("to_date", date ? format(date, "yyyy-MM-dd") : undefined)}
              className="w-36 h-10"
              wrapperClassName="h-10"
              disabled={isDownloading !== null}
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={resetFilters}
              className="h-10 w-10 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 shrink-0 rounded-full"
              title="Clear filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Receipt className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Paid Installments Verification</h3>
              <p className="text-[10px] text-slate-500 font-medium tracking-tight">Verify payment records and download individual receipts.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Page Total:</span>
            <div className="flex items-center gap-1 text-sm font-black text-emerald-700">
              <IndianRupee className="h-3 w-3" />
              {pageTotalPaid.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-4">
          <Table
            page={page}
            pageSize={pageSize}
            totalPages={data?.pagination?.totalPages || 1}
            totalData={data?.pagination?.totalData || 0}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            containerClassName="max-h-[320px]"
          >
              <TableHeader className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur sticky top-0 z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[120px] text-[11px] font-bold text-slate-600 dark:text-slate-400">DATE</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-600 dark:text-slate-400">STUDENT</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-600 dark:text-slate-400">COURSE/BATCH</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-600 dark:text-slate-400">TYPE</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-600 dark:text-slate-400 text-right">AMOUNT</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-600 dark:text-slate-400 text-right">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody loading={isLoading} fetching={isFetching && !isLoading} columnCount={6} rowCount={pageSize}>
                {!isLoading && data?.data.map((payment, index) => (
                  <TableRow key={`${payment.id}-${index}`} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <TableCell className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {format(new Date(payment.payment_date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{payment.student_name || "Unknown Student"}</span>
                        <span className="text-[11px] text-slate-500 font-mono tracking-wider">{payment.student_reg_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-400">{payment.course_name}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{payment.batch_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {payment.payment_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-slate-900 dark:text-slate-100 text-right">
                      ₹{Number(payment.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadReceipt(payment.id)}
                                disabled={isDownloading !== null || payment.payment_type?.toUpperCase() === "REFUND"}
                                className="h-8 px-3 rounded-lg text-primary hover:text-primary hover:bg-primary/5 font-bold text-[11px] gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                              >
                                {isDownloading === `receipt-${payment.id}` ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Printer className="h-3.5 w-3.5" />
                                    Receipt
                                  </>
                                )}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {payment.payment_type?.toUpperCase() === "REFUND" && (
                            <TooltipContent side="left" className="bg-slate-900 border-slate-800 text-white text-[10px] py-1 px-2">
                              Receipt is not available for the refund
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && data?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64">
                      <div className="flex flex-col items-center justify-center text-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                          <Receipt className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">No payment records found</p>
                          <p className="text-xs text-slate-500 font-medium max-w-[240px]">Try adjusting your filters or search terms to find what you're looking for.</p>
                        </div>
                        {hasActiveFilters && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={resetFilters}
                            className="h-8 rounded-lg text-[11px] font-bold"
                          >
                            Clear All Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    )
  }

export default TuitionFeeList
