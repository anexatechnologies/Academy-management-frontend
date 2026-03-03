import BodyLayout from "@/components/layout/BodyLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Award } from "lucide-react"
import GeneralCertificates from "./components/GeneralCertificates"
import CourseCompletion from "./components/CourseCompletion"

const CertificationPage = () => {
  const breadcrumbs = [
    { label: "Certificates", href: "/certificates" },
    { label: "Generate Certificate" },
  ]

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certification Module</h1>
          <p className="text-sm text-muted-foreground font-medium">Generate and download official documents and academic rewards.</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-0 h-auto rounded-none w-full justify-start gap-8 shadow-none sticky top-0 z-[20]">
            <TabsTrigger 
              value="general" 
              className="rounded-none px-4 py-3 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all text-sm font-bold flex items-center gap-2 hover:text-primary cursor-pointer shadow-none data-[state=active]:shadow-none -mb-[1px]"
            >
              <FileText className="h-4 w-4" />
              General Certificates
            </TabsTrigger>
            <TabsTrigger 
              value="course" 
              className="rounded-none px-4 py-3 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all text-sm font-bold flex items-center gap-2 hover:text-primary cursor-pointer shadow-none data-[state=active]:shadow-none -mb-[1px]"
            >
              <Award className="h-4 w-4" />
              Course Completion
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="general" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <GeneralCertificates />
            </TabsContent>
            <TabsContent value="course" className="mt-0 outline-none">
              <CourseCompletion />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </BodyLayout>
  )
}

export default CertificationPage
