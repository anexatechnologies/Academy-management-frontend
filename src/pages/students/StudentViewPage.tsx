import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Calendar,
  CreditCard,
  History,
  Info,
  GraduationCap,
  BookOpen,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import BodyLayout from "@/components/layout/BodyLayout"
import { useStudent } from "@/hooks/api/use-students"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DateCell } from "@/components/ui/date-cell"
import { cn, formatCurrency } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePayments } from "@/hooks/api/use-payments"
import { PaymentDialog } from "@/components/students/PaymentDialog"
import type { PaymentType } from "@/types/payment"
import { IndianRupee } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const StudentViewPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: student, isLoading } = useStudent(Number(id))
  const { data: payments } = usePayments(Number(id))
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedPaymentConfig, setSelectedPaymentConfig] = useState<{
    courseId: number;
    courseName: string;
    type: PaymentType;
    remainingAmount: number;
    defaultAmount?: number;
  } | null>(null)

  const breadcrumbs = [
    { label: "Student Management", href: "/students" },
    { label: student ? student.name : "View Student" },
  ]

  if (isLoading) {
    return (
      <BodyLayout breadcrumbs={breadcrumbs}>
        <div className="max-w-7xl space-y-6">
          <Skeleton className="h-[200px] w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[400px] w-full rounded-2xl" />
            <Skeleton className="h-[400px] lg:col-span-2 w-full rounded-2xl" />
          </div>
        </div>
      </BodyLayout>
    )
  }

  if (!student) {
    return (
      <BodyLayout breadcrumbs={breadcrumbs}>
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
            <User className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Student not found</h2>
          <p className="text-slate-500 mt-2">The student you are looking for might have been removed or the ID is invalid.</p>
          <Button variant="link" onClick={() => navigate("/students")} className="mt-4 text-primary">Back to students list</Button>
        </div>
      </BodyLayout>
    )
  }

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-5xl animate-in fade-in duration-500 pb-12">
        <Tabs defaultValue="general" className="w-full">
          {/* Sticky Header & Navigation */}
          <div className="sticky -top-6 z-30 bg-white dark:bg-slate-950 pt-2 border-b border-slate-200 dark:border-slate-800 transition-all duration-300 shadow-none">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 px-1">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate("/students")} className="rounded-full h-10 w-10 shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{student.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                      STUDENT
                    </span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                      student.status === "active" 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    )}>
                      {student.status}
                    </span>
                  </div>
                </div>
              </div>
              <Button onClick={() => navigate(`/students/edit/${student.id}`)} className="h-10 px-6 rounded-xl shadow-lg shadow-primary/20">
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </div>

            <TabsList className="bg-transparent border-b border-slate-200 dark:border-slate-800 p-0 h-auto rounded-none w-full justify-start gap-8 shadow-none">
              <TabsTrigger 
                value="general" 
                className="rounded-none px-4 py-3 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all text-sm font-bold flex items-center gap-2 hover:text-primary cursor-pointer shadow-none data-[state=active]:shadow-none -mb-[1px]"
              >
                <User className="h-4 w-4" /> General Details
              </TabsTrigger>
              <TabsTrigger 
                value="instalment" 
                className="rounded-none px-4 py-3 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all text-sm font-bold flex items-center gap-2 hover:text-primary cursor-pointer shadow-none data-[state=active]:shadow-none -mb-[1px]"
              >
                <CreditCard className="h-4 w-4" /> Instalment Payment
              </TabsTrigger>
              <TabsTrigger 
                value="monthly" 
                className="rounded-none px-4 py-3 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all text-sm font-bold flex items-center gap-2 hover:text-primary cursor-pointer shadow-none data-[state=active]:shadow-none -mb-[1px]"
              >
                <History className="h-4 w-4" /> Monthly Payment
              </TabsTrigger>
            </TabsList>
          </div>

          <div>
            <TabsContent value="general" className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-[143.5px] space-y-4">
                  <Card className="shadow-sm border-none bg-white dark:bg-slate-950 overflow-hidden rounded-2xl">
                    <CardContent className="pt-8 flex flex-col items-center text-center">
                      <div className="h-32 w-32 rounded-full ring-4 ring-primary/5 p-1 bg-white dark:bg-slate-900 mb-4 overflow-hidden shrink-0 shadow-sm">
                        {student.photo_url ? (
                          <img src={student.photo_url} alt={student.name} className="h-full w-full rounded-full object-cover" />
                        ) : (
                          <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                            {student.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{student.name}</h3>
                      <p className="text-sm text-slate-500 mt-1 font-medium italic">Student ID: #{student.student_id}</p>
                      
                      <Separator className="my-6 opacity-50" />
                      
                      <div className="w-full space-y-5 text-left">
                        <ContactItem icon={<Mail className="h-4 w-4" />} label="Email Address" value={student.email} />
                        <ContactItem icon={<Phone className="h-4 w-4" />} label="Personal Contact" value={student.personal_contact} />
                        <ContactItem 
                          icon={<MapPin className="h-4 w-4" />} 
                          label="Address" 
                          value={[student.address, student.city, student.state]
                            .filter(Boolean)
                            .join(", ") + (student.pincode ? ` - ${student.pincode}` : "") || "N/A"} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Main Content Areas */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="shadow-sm border-none bg-white dark:bg-slate-950 overflow-hidden rounded-2xl">
                  <CardHeader className="pb-0 pt-4 px-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100 m-0">
                      <User className="h-5 w-5 text-primary" /> Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0.5 pb-6 px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-7 gap-x-10">
                      <DetailItem label="Date of Birth" value={<DateCell date={student.date_of_birth} />} icon={<Calendar className="h-4 w-4" />} />
                      <DetailItem label="Gender" value={student.gender} />
                      <DetailItem label="Category" value={student.category} />
                      <DetailItem label="Religion" value={student.religion} />
                      <DetailItem label="Nationality" value={student.nationality} />
                      <DetailItem label="Heard About Us" value={student.heard_about_us} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-none bg-white dark:bg-slate-950 overflow-hidden rounded-2xl">
                  <CardHeader className="pb-0 pt-4 px-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100 m-0">
                      <GraduationCap className="h-5 w-5 text-primary" /> Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0.5 pb-6 px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-7 gap-x-10">
                      <DetailItem label="Registration Date" value={<DateCell date={student.registration_date} />} icon={<Calendar className="h-4 w-4" />} />
                      <DetailItem label="Stream" value={student.stream} />
                      <DetailItem label="Class/Year" value={student.class_year} />
                      <DetailItem label="University Enroll No." value={student.university_enrollment_no || "N/A"} />
                      <div className="sm:col-span-2">
                        <DetailItem label="School/College/Company" value={student.school_college_company} icon={<BookOpen className="h-4 w-4" />} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-none bg-white dark:bg-slate-950 overflow-hidden rounded-2xl">
                  <CardHeader className="pb-0 pt-4 px-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100 m-0">
                      <Users className="h-5 w-5 text-primary" /> Parental Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0.5 pb-6 px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-7 gap-x-10">
                      <DetailItem label="Father / Husband Name" value={student.father_husband_name} icon={<User className="h-4 w-4" />} />
                      <DetailItem label="Mother's Name" value={student.mother_name} />
                      <DetailItem label="Father's Contact" value={student.father_contact} icon={<Phone className="h-4 w-4" />} />
                      <DetailItem label="Mother's Contact" value={student.mother_contact} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Enrolled Courses & Batches Section */}
            <div className="mt-6 md:mt-8">
              <Card className="shadow-sm border-none bg-white dark:bg-slate-950 overflow-hidden rounded-2xl">
                <CardHeader className="pb-4 pt-5 px-6 border-b border-slate-100 dark:border-slate-800/60">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100 m-0">
                    <BookOpen className="h-5 w-5 text-primary" /> Enrolled Courses & Batches
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {student.batches && student.batches.length > 0 ? (
                    <div className="w-full relative">
                      <Table paginationRequired={false}>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Batch</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total Fees</TableHead>
                            <TableHead className="text-right">Fee Paid</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {student.batches.map((batch: any) => (
                            <TableRow key={batch.id}>
                              <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                                {batch.course_name}
                              </TableCell>
                              <TableCell className="font-medium text-primary">
                                {batch.batch_name}
                              </TableCell>
                              <TableCell>
                                {(() => {
                                  const isEndDatePassed = new Date(batch.end_date) < new Date()
                                  const hasPendingFees = Number(batch.fees_remaining) > 0

                                  if (isEndDatePassed && hasPendingFees) {
                                    return (
                                      <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                        Fee Due
                                      </span>
                                    )
                                  } else if (isEndDatePassed && !hasPendingFees) {
                                    return (
                                      <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                        Completed
                                      </span>
                                    )
                                  } else {
                                    return (
                                      <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        Active
                                      </span>
                                    )
                                  }
                                })()}
                              </TableCell>
                              <TableCell className="text-right font-medium text-slate-900 dark:text-slate-100">
                                ₹{formatCurrency(batch.total_fees_with_tax)}
                              </TableCell>
                              <TableCell className="text-right font-bold text-emerald-600">
                                ₹{formatCurrency(batch.fees_paid)}
                              </TableCell>
                              <TableCell className="text-right font-bold text-rose-600">
                                ₹{formatCurrency(batch.fees_remaining)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-900 mb-3 ring-8 ring-slate-50/50 dark:ring-slate-900/50">
                        <BookOpen className="h-5 w-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">No courses enrolled yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="instalment" className="mt-4 outline-none space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 gap-6">
                {student.batches && student.batches.length > 0 ? student.batches.map((batch: any) => (
                  <Card key={batch.id} className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden rounded-2xl">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                          {batch.course_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{batch.course_name}</h3>
                          <p className="text-sm text-slate-500 font-medium">Batch: <span className="text-primary font-bold">{batch.batch_name}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest leading-none mb-1">Total Fees</p>
                          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">₹{formatCurrency(batch.total_fees_with_tax)}</p>
                        </div>
                        <Separator orientation="vertical" className="h-10 bg-slate-200 dark:bg-slate-800" />
                        <div className="text-right">
                          <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-widest leading-none mb-1">Paid</p>
                          <p className="text-lg font-bold text-emerald-600">₹{formatCurrency(batch.fees_paid)}</p>
                        </div>
                        <Separator orientation="vertical" className="h-10 bg-slate-200 dark:bg-slate-800" />
                        <div className="text-right">
                          <p className="text-[10px] text-rose-500 uppercase font-bold tracking-widest leading-none mb-1">Remaining</p>
                          <p className="text-lg font-bold text-rose-600">₹{formatCurrency(batch.fees_remaining)}</p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-block ml-4">
                              <Button 
                                onClick={() => {
                                  setSelectedPaymentConfig({
                                    courseId: batch.student_course_id,
                                    courseName: batch.course_name,
                                    type: "instalment",
                                    remainingAmount: Number(batch.fees_remaining)
                                  })
                                  setIsPaymentDialogOpen(true)
                                }}
                                disabled={Number(batch.fees_remaining) <= 0}
                                className="h-11 px-6 rounded-xl shadow-lg shadow-primary/20"
                              >
                                <CreditCard className="mr-2 h-4 w-4" /> Record Payment
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {Number(batch.fees_remaining) <= 0 && (
                            <TooltipContent>
                              <p>Fees for this course are fully paid.</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </div>
                    </div>
                    
                    <CardContent className="p-0">
                      <div className="p-6 md:p-8">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <History className="h-3.5 w-3.5" /> Instalment History
                        </h4>
                        <div className="space-y-4">
                          {payments?.filter(p => p.student_course_id === batch.student_course_id && p.payment_type === "instalment").length ? (
                            payments
                              .filter(p => p.student_course_id === batch.student_course_id && p.payment_type === "instalment")
                              .map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-colors group">
                                  <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                                      <IndianRupee className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">₹{formatCurrency(payment.amount)}</p>
                                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider"><DateCell date={payment.payment_date} /></p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-8">
                                    <div className="text-right hidden sm:block">
                                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Mode</p>
                                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{payment.payment_mode}</p>
                                    </div>
                                    {payment.transaction_reference && (
                                      <div className="text-right hidden sm:block">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Reference</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase">{payment.transaction_reference}</p>
                                      </div>
                                    )}
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400">
                                      <Info className="h-4 w-4" />
                                    </div>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                              <p className="text-sm text-slate-500 font-medium">No instalment payments recorded for this course.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-20 bg-white dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-900 mb-4 ring-8 ring-slate-50/50 dark:ring-slate-900/50">
                      <BookOpen className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No Courses Enrolled</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">This student is not currently enrolled in any courses. Enroll them in a course to manage instalment payments.</p>
                  </div>
                )}
             </div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-4 outline-none space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 gap-6">
                {student.batches && student.batches.length > 0 ? student.batches.map((batch: any) => (
                  <Card key={batch.id} className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden rounded-2xl">
                    <div className="p-6 md:p-8 flex items-center justify-between bg-emerald-50/30 dark:bg-emerald-500/5 border-b border-emerald-100/30 dark:border-emerald-500/10">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/20">
                          {batch.batch_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{batch.batch_name}</h3>
                          <p className="text-sm text-slate-500 font-medium">{batch.course_name}</p>
                        </div>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-block">
                            <Button 
                              onClick={() => {
                                setSelectedPaymentConfig({
                                  courseId: batch.student_course_id,
                                  courseName: batch.batch_name,
                                  type: "monthly",
                                  remainingAmount: Number(batch.fees_remaining),
                                  defaultAmount: Number(batch.fees_remaining) > 0 ? Number(batch.fees_remaining) : 0
                                })
                                setIsPaymentDialogOpen(true)
                              }}
                              variant="outline"
                              disabled={Number(batch.fees_remaining) <= 0}
                              className="h-11 px-6 rounded-xl border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all font-bold"
                            >
                              <IndianRupee className="mr-2 h-4 w-4" /> Record Monthly Fee
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {Number(batch.fees_remaining) <= 0 && (
                          <TooltipContent>
                            <p>Fees for this course are fully paid.</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </div>

                    <CardContent className="p-0">
                      <div className="p-6 md:p-8">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <History className="h-3.5 w-3.5" /> Monthly History
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {payments?.filter(p => p.student_course_id === batch.student_course_id && p.payment_type === "monthly").length ? (
                            payments
                              .filter(p => p.student_course_id === batch.student_course_id && p.payment_type === "monthly")
                              .map((payment) => (
                                <div key={payment.id} className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex flex-col gap-3 group">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full"><DateCell date={payment.payment_date} /></span>
                                    <span className="text-emerald-500 text-xs font-black">PAID</span>
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-lg font-black text-slate-900 dark:text-slate-100">₹{formatCurrency(payment.amount)}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{payment.payment_mode}</p>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="col-span-full text-center py-10 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                              <p className="text-sm text-slate-500 font-medium">No monthly fees recorded for this batch.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-20 bg-white dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 mb-4 ring-8 ring-emerald-50/50 dark:ring-emerald-900/10">
                      <History className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No Courses Enrolled</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">This student is not currently enrolled in any courses. Enroll them in a course to manage monthly fees.</p>
                  </div>
                )}
             </div>
          </TabsContent>
          </div>
        </Tabs>
      </div>

      {selectedPaymentConfig && (
        <PaymentDialog
          id={Number(id)}
          isOpen={isPaymentDialogOpen}
          onClose={() => {
            setIsPaymentDialogOpen(false)
            setSelectedPaymentConfig(null)
          }}
          studentCourseId={selectedPaymentConfig.courseId}
          courseName={selectedPaymentConfig.courseName}
          paymentType={selectedPaymentConfig.type}
          remainingAmount={selectedPaymentConfig.remainingAmount}
          defaultAmount={selectedPaymentConfig.defaultAmount}
        />
      )}
    </BodyLayout>
  )
}

const ContactItem = ({ icon, label, value }: { icon?: React.ReactNode; label: string; value?: string | null }) => (
  <div className="flex items-start gap-4 transition-all duration-300">
    {icon && <div className="mt-1 text-primary shrink-0 opacity-80">{icon}</div>}
    <div className="flex flex-col min-w-0 flex-1">
      <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">{label}</span>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:text-primary cursor-default break-all leading-snug">{value || "Not provided"}</span>
    </div>
  </div>
)

const DetailItem = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="flex flex-col items-start text-left">
    <span className="text-[11px] text-slate-400 uppercase font-bold tracking-widest leading-none mb-1">{label}</span>
    <div className="flex items-center gap-2.5">
      {icon && <span className="text-primary/70">{icon}</span>}
      <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">{value || "N/A"}</span>
    </div>
  </div>
)

export default StudentViewPage
