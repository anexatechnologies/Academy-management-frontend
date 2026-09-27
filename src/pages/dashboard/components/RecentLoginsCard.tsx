import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useLoginLogs } from "@/hooks/api/use-users"
import { usePermissions } from "@/hooks/use-permissions"
import { useSearchFilter } from "@/hooks/use-search-filter"
import { 
  ShieldCheck, 
  Search, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Monitor, 
  Smartphone, 
  Globe, 
  X,
  Clock
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

/**
 * Parses user agent string to extract human-readable browser, OS, and device type.
 */
function parseUserAgent(ua: string | null | undefined): { browser: string; os: string; isMobile: boolean } {
  if (!ua) {
    return { browser: "Unknown Browser", os: "Unknown Device", isMobile: false }
  }

  let browser = "Web Browser"
  if (ua.includes("Edg/")) {
    browser = "Microsoft Edge"
  } else if (ua.includes("Chrome/") && !ua.includes("Edg/")) {
    browser = "Chrome"
  } else if (ua.includes("Firefox/")) {
    browser = "Firefox"
  } else if (ua.includes("Safari/") && !ua.includes("Chrome/")) {
    browser = "Safari"
  } else if (ua.includes("Opera") || ua.includes("OPR/")) {
    browser = "Opera"
  } else if (ua.includes("PostmanRuntime")) {
    browser = "Postman Client"
  } else if (ua.includes("curl")) {
    browser = "cURL"
  }

  let os = "Desktop"
  let isMobile = false

  if (/iPhone/i.test(ua)) {
    os = "iPhone"
    isMobile = true
  } else if (/iPad/i.test(ua)) {
    os = "iPad"
    isMobile = true
  } else if (/Android/i.test(ua)) {
    os = "Android"
    isMobile = true
  } else if (/Windows NT 10.0/i.test(ua)) {
    os = "Windows"
  } else if (/Windows/i.test(ua)) {
    os = "Windows"
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = "macOS"
  } else if (/Linux/i.test(ua)) {
    os = "Linux"
  }

  return { browser, os, isMobile }
}

/**
 * Formats IP address for clean readability (e.g. ::1 -> Localhost).
 */
function formatIpAddress(ip: string | null | undefined): string {
  if (!ip) return "—"
  if (ip === "::1" || ip === "127.0.0.1") return "127.0.0.1 (Localhost)"
  // Strip IPv6-mapped IPv4 prefix if present (e.g. ::ffff:192.168.1.1)
  if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "")
  return ip
}

/**
 * Returns role badge styling classes based on role name.
 */
function getRoleBadgeClass(role: string | null | undefined): string {
  switch (role?.toLowerCase()) {
    case "super_admin":
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20"
    case "admin":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
    case "instructor":
    case "teacher":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
    case "staff":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
  }
}

/**
 * Formats login timestamp into relative and absolute strings.
 */
function formatLoginTimestamp(isoString: string): { relative: string; exact: string } {
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) {
      return { relative: "—", exact: isoString }
    }
    return {
      relative: formatDistanceToNow(date, { addSuffix: true }),
      exact: format(date, "dd MMM yyyy, hh:mm a"),
    }
  } catch {
    return { relative: "—", exact: isoString }
  }
}

export function RecentLoginsCard() {
  const { isSuperAdmin } = usePermissions()
  const [page, setPage] = useState(1)
  const pageSize = 5

  const { search, setSearch, params, resetFilters } = useSearchFilter<{}>({
    initialFilters: {},
    onFilterChange: () => setPage(1),
  })

  const { data, isLoading, isFetching, refetch } = useLoginLogs(
    {
      page,
      limit: pageSize,
      search: params.search,
    },
    { enabled: isSuperAdmin }
  )

  // Strictly enforce superuser-only access
  if (!isSuperAdmin) {
    return null
  }

  const pagination = data?.pagination
  const totalPages = pagination?.totalPages || 1
  const totalData = pagination?.totalData || 0

  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Recent Login Activity
          </CardTitle>
          <CardDescription>
            Live security audit log of authenticated user sign-ins
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-60">
            <Input
              type="text"
              placeholder="Search user or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
              className="h-9 text-xs pr-8 bg-slate-50/70 dark:bg-slate-900/60"
            />
            {search && (
              <button
                type="button"
                onClick={resetFilters}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-9 w-9 p-0 rounded-lg shrink-0"
              >
                <RotateCw className={cn("h-4 w-4 text-muted-foreground", isFetching && "animate-spin text-primary")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh log history</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <Table
          paginationRequired={false}
          containerClassName="border-t border-slate-200 dark:border-slate-800 rounded-none border-x-0 border-b-0 shadow-none"
        >
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead className="px-6 text-xs font-bold uppercase tracking-wider">User</TableHead>
              <TableHead className="px-6 text-xs font-bold uppercase tracking-wider">Role</TableHead>
              <TableHead className="px-6 text-xs font-bold uppercase tracking-wider">IP Address</TableHead>
              <TableHead className="px-6 text-xs font-bold uppercase tracking-wider">Device & Browser</TableHead>
              <TableHead className="px-6 text-xs font-bold uppercase tracking-wider text-center">Status</TableHead>
              <TableHead className="px-6 text-xs font-bold uppercase tracking-wider text-right">Login Time</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody
            loading={isLoading}
            fetching={isFetching && !isLoading}
            columnCount={6}
            rowCount={pageSize}
          >
            {!isLoading && data?.data?.map((log) => {
              const device = parseUserAgent(log.user_agent)
              const time = formatLoginTimestamp(log.login_at)

              return (
                <TableRow key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  {/* User Full Name & Username */}
                  <TableCell className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs shrink-0 select-none">
                        {log.full_name?.charAt(0)?.toUpperCase() || log.username?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">
                          {log.full_name || log.username}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          @{log.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role Badge */}
                  <TableCell className="px-6 py-3">
                    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase border inline-block whitespace-nowrap", getRoleBadgeClass(log.role_name))}>
                      {log.role_name?.replace(/_/g, " ") || "User"}
                    </span>
                  </TableCell>

                  {/* IP Address */}
                  <TableCell className="px-6 py-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-slate-300">
                      <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="whitespace-nowrap">{formatIpAddress(log.ip_address)}</span>
                    </div>
                  </TableCell>

                  {/* Browser & OS */}
                  <TableCell className="px-6 py-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-help group max-w-[200px]">
                          {device.isMobile ? (
                            <Smartphone className="h-4 w-4 text-slate-400 group-hover:text-primary shrink-0 transition-colors" />
                          ) : (
                            <Monitor className="h-4 w-4 text-slate-400 group-hover:text-primary shrink-0 transition-colors" />
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                              {device.browser}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {device.os}
                            </span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs">
                        <p className="font-medium text-slate-100 mb-1">User Agent:</p>
                        <p className="text-[11px] text-slate-300 break-all">{log.user_agent || "No user-agent string recorded"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-6 py-3 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide capitalize",
                        log.status === "success"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          log.status === "success" ? "bg-emerald-500" : "bg-rose-500"
                        )}
                      />
                      {log.status || "success"}
                    </span>
                  </TableCell>

                  {/* Time */}
                  <TableCell className="px-6 py-3 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {time.relative}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                        <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                        {time.exact}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}

            {!isLoading && (!data?.data || data.data.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                    <p className="text-sm font-medium">No login logs recorded yet</p>
                    <p className="text-xs text-muted-foreground">
                      {search ? "No records match your search filter." : "Successful logins will automatically appear here in real time."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Compact Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
          <span className="text-xs text-muted-foreground">
            Page <span className="font-semibold text-slate-700 dark:text-slate-300">{pagination?.currentPage || page}</span> of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{totalPages}</span>
            {totalData > 0 && (
              <span className="ml-1 text-slate-400">({totalData} total records)</span>
            )}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading || isFetching}
              className="h-8 px-2.5 text-xs rounded-lg gap-1 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading || isFetching}
              className="h-8 px-2.5 text-xs rounded-lg gap-1 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
