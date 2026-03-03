import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUser, LogOut, Receipt } from "lucide-react"
import BonafideForm from "./BonafideForm"
import TCForm from "./TCForm"
import TuitionFeeList from "./TuitionFeeList"

const GeneralCertificates = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="bonafide" className="w-full">
        <TabsList className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-0 h-auto rounded-none w-full justify-start gap-8 shadow-none sticky top-[52px] z-[19]">
          <TabsTrigger 
            value="bonafide" 
            className="rounded-none px-4 py-3 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all text-sm font-bold flex items-center gap-2 hover:text-primary cursor-pointer shadow-none data-[state=active]:shadow-none -mb-[1px]"
          >
            <FileUser className="h-4 w-4" />
            Bonafide
          </TabsTrigger>
          <TabsTrigger 
            value="tc" 
            className="rounded-none px-4 py-3 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all text-sm font-bold flex items-center gap-2 hover:text-primary cursor-pointer shadow-none data-[state=active]:shadow-none -mb-[1px]"
          >
            <LogOut className="h-4 w-4" />
            Transfer (TC)
          </TabsTrigger>
          <TabsTrigger 
            value="tuition" 
            className="rounded-none px-4 py-3 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all text-sm font-bold flex items-center gap-2 hover:text-primary cursor-pointer shadow-none data-[state=active]:shadow-none -mb-[1px]"
          >
            <Receipt className="h-4 w-4" />
            Tuition Fee
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <TabsContent value="bonafide" className="mt-0 outline-none">
            <BonafideForm />
          </TabsContent>
          <TabsContent value="tc" className="mt-0 outline-none">
            <TCForm />
          </TabsContent>
          <TabsContent value="tuition" className="mt-0 outline-none">
            <TuitionFeeList />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default GeneralCertificates
