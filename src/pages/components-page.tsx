import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SearchBar } from "@/components/ui/search-bar"
import { Upload } from "@/components/ui/upload"
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2 } from "lucide-react"

export default function ComponentsPage() {
  const [isLoading, setIsLoading] = React.useState(false)

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

      {/* Inputs Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Inputs & Forms</h2>
          <p className="text-muted-foreground">Standard and custom input components.</p>
        </div>
        <div className="grid gap-8 max-w-xl">
          <div className="space-y-2">
            <span className="text-sm font-medium">Standard Input</span>
            <Input placeholder="Enter your name..." />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Textarea</span>
            <Textarea placeholder="Enter your description..." />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Search Bar</span>
            <SearchBar 
              placeholder="Search students, classes..." 
              onSearch={handleSearch}
            />
            {isLoading && <p className="text-xs text-primary animate-pulse">Searching...</p>}
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

      {/* Modals & Popovers */}
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
                <Input placeholder="Full Name" />
                <Input placeholder="Email Address" type="email" />
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

      {/* Tables Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Data Tables</h2>
          <p className="text-muted-foreground">A clean table for displaying structured data.</p>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableCaption>A list of recently enrolled students.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-right">Fees Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">STD001</TableCell>
                <TableCell>John Doe</TableCell>
                <TableCell>Web Development</TableCell>
                <TableCell className="text-right text-green-600 font-medium">Paid</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">STD002</TableCell>
                <TableCell>Jane Smith</TableCell>
                <TableCell>UI/UX Design</TableCell>
                <TableCell className="text-right text-yellow-600 font-medium">Pending</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">STD003</TableCell>
                <TableCell>Robert Brown</TableCell>
                <TableCell>Data Science</TableCell>
                <TableCell className="text-right text-red-600 font-medium">Overdue</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
