import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SearchBar } from "@/components/ui/search-bar"
import { Upload } from "@/components/ui/upload"
import { EditButton } from "@/components/ui/edit-button"
import { DeleteButton } from "@/components/ui/delete-button"
import { usePagination } from "@/hooks/use-pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ComponentsPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [errorValue, setErrorValue] = React.useState("This field is required")
  const [searchQuery, setSearchQuery] = React.useState("")

  const pagination = usePagination({
    totalItems: 100,
    initialPageSize: 10,
  })

  const students = [
    { id: "STD001", name: "John Doe", course: "Web Development", status: "Paid" },
    { id: "STD002", name: "Jane Smith", course: "UI/UX Design", status: "Pending" },
    { id: "STD003", name: "Robert Brown", course: "Data Science", status: "Overdue" },
    { id: "STD004", name: "Alice Green", course: "Cyber Security", status: "Paid" },
    { id: "STD005", name: "Michael White", course: "Mobile App Dev", status: "Pending" },
    { id: "STD006", name: "Emma Black", course: "Digital Marketing", status: "Paid" },
    { id: "STD007", name: "David Blue", course: "Cloud Computing", status: "Overdue" },
    { id: "STD008", name: "Sophia Grey", course: "AI & Machine Learning", status: "Paid" },
  ]

  const handleSearch = (value: string) => {
    console.log("Searching for:", value)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1500)
  }

  return (
    <div className="w-full py-10 px-4 md:px-6 space-y-16">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Component Gallery</h1>
        <p className="text-muted-foreground text-lg">
          A collection of reusable components built for Academy Management System.
        </p>
      </header>

      {/* Tables Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Data Tables</h2>
          <p className="text-muted-foreground">A premium, structured table with sticky headers and simplified pagination.</p>
        </div>
        
        <div className="space-y-12">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Standard Table with Sticky Header</h3>
            <Table
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalPages={pagination.totalPages}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
              containerClassName="max-h-[300px]"
            >
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="w-[150px]">Fees Status</TableHead>
                  <TableHead className="w-[120px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-semibold text-slate-900">{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "font-medium",
                        student.status === "Paid" ? "text-green-600" : 
                        student.status === "Pending" ? "text-yellow-600" : "text-rose-600"
                      )}>
                        {student.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <EditButton title="Student" />
                        <DeleteButton title="Student" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground italic text-center">
              The header remains sticky while scrolling through data rows.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Loading State (Matched Widths)</h3>
            <Table paginationRequired={false}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="w-[150px]">Fees Status</TableHead>
                  <TableHead className="w-[120px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody loading columnCount={5} rowCount={3} />
            </Table>
            <p className="text-xs text-muted-foreground text-center italic">
              Column widths are strictly maintained between loading and data states to prevent layout shift.
            </p>
          </div>
        </div>
      </section>

      {/* Buttons Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Buttons</h2>
          <p className="text-muted-foreground">Various button styles and states.</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link Button</Button>
          <Button disabled>Disabled</Button>
          <Button>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        </div>
      </section>

      {/* Action Buttons Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Action Buttons</h2>
          <p className="text-muted-foreground">Specialized buttons for common data actions with built-in tooltips and confirmation.</p>
        </div>
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Standard States</h3>
            <div className="flex gap-4 items-center">
              <EditButton title="Student" onEdit={() => console.log("Edit clicked")} />
              <DeleteButton title="Student" onDelete={() => console.log("Delete clicked")} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Loading States</h3>
            <div className="flex gap-4 items-center">
              <EditButton title="Student" loading />
              <DeleteButton title="Student" loading />
            </div>
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Forms & Inputs</h2>
          <p className="text-muted-foreground">Standard and custom input components with validation states.</p>
        </div>
        <div className="grid gap-8 max-w-xl">
          <Input 
            label="Standard Input" 
            placeholder="Enter your name..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Input 
            label="Input with Error" 
            placeholder="Enter your email..." 
            error={errorValue}
            onChange={(e) => setErrorValue(e.target.value)}
          />
          <Textarea 
            label="Description" 
            placeholder="Enter your description..." 
          />
          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5">Search Bar</Label>
            <SearchBar 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, classes..." 
              onSearch={handleSearch}
            />
            {isLoading && <p className="text-xs text-primary animate-pulse">Searching for "{searchQuery}"...</p>}
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">File Upload</h2>
          <p className="text-muted-foreground">Drag and drop file upload component.</p>
        </div>
        <div className="max-w-xl">
          <Upload 
            accept="image/*,.pdf" 
            maxFiles={3} 
            onFilesSelected={(files) => console.log("Selected:", files)} 
          />
        </div>
      </section>

      {/* Overlays Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Overlays</h2>
          <p className="text-muted-foreground">Dialogs and Popovers for contextual information.</p>
        </div>
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Modal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter the details of the student you wish to enroll in the academy.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input label="Full Name" placeholder="Student name" />
                <Input label="Email Address" placeholder="email@example.com" type="email" />
              </div>
              <DialogFooter>
                <Button type="submit">Save Student</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Help Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Guidelines</h4>
                  <p className="text-sm text-muted-foreground">
                    Please ensure all student data is verified before submission.
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </section>
    </div>
  )
}
