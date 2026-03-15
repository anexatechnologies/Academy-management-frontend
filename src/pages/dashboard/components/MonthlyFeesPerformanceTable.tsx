import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useMonthlyPerformance } from "@/hooks/api/use-dashboard"
import { usePagination } from "@/hooks/use-pagination"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export function MonthlyFeesPerformanceTable() {
  const { page, pageSize, setPage, setPageSize } = usePagination({ initialPageSize: 12 })
  
  const { data, isLoading, isFetching } = useMonthlyPerformance({
    page,
    limit: pageSize,
  })

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  const getPerformanceIcon = (performance: number) => {
    if (performance >= 90) return <TrendingUp className="h-4 w-4 text-emerald-500" />
    if (performance < 70) return <TrendingDown className="h-4 w-4 text-rose-500" />
    return <Minus className="h-4 w-4 text-amber-500" />
  }

  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          Monthly Fees Performance
        </CardTitle>
        <CardDescription>Expected vs. Collected fees on a monthly basis</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table
          page={page}
          pageSize={pageSize}
          totalPages={data?.pagination?.totalPages || 1}
          totalData={data?.pagination?.totalData || 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          containerClassName="border-t border-slate-200 dark:border-slate-800"
        >
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead className="px-6">Month</TableHead>
              <TableHead className="px-6 text-right">Expected</TableHead>
              <TableHead className="px-6 text-right">Collected</TableHead>
              <TableHead className="px-6 text-right">Remaining</TableHead>
              <TableHead className="px-6 text-right">Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody loading={isLoading} fetching={isFetching && !isLoading} columnCount={5} rowCount={pageSize}>
            {!isLoading && data?.data?.map((item) => {
              const expectedValue = parseFloat(item.expected.toString()) || 0
              const collectedValue = parseFloat(item.collected.toString()) || 0
              const performance = expectedValue > 0 ? (collectedValue / expectedValue) * 100 : 0
              
              return (
                <TableRow key={item.month}>
                  <TableCell className="px-6 font-medium">{formatMonth(item.month)}</TableCell>
                  <TableCell className="px-6 text-right font-medium text-slate-600">
                    ₹{expectedValue.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-6 text-right font-semibold text-emerald-600">
                    ₹{collectedValue.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-6 text-right font-medium text-rose-600">
                    ₹{(parseFloat(item.gap.toString()) || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-6">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-xs font-bold ${
                        performance >= 90 ? 'text-emerald-600' : 
                        performance < 70 ? 'text-rose-600' : 'text-amber-600'
                      }`}>
                        {performance.toFixed(1)}%
                      </span>
                      {getPerformanceIcon(performance)}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {!isLoading && data?.data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No performance data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
