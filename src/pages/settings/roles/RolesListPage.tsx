import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

import { useRoles, useDeleteRole } from "@/hooks/api/use-roles"
import { EditButton } from "@/components/ui/edit-button"
import { DeleteButton } from "@/components/ui/delete-button"
import BodyLayout from "@/components/layout/BodyLayout"
import { DateCell } from "@/components/ui/date-cell"
import RoleFormModal from "./components/RoleFormModal"
import { usePagination } from "@/hooks/use-pagination"
import { useSearchFilter } from "@/hooks/use-search-filter"
import { SearchBar } from "@/components/ui/search-bar"

const RolesListPage = () => {
  const { page, pageSize, setPage, setPageSize, setTotal } = usePagination()
  const { search, setSearch } = useSearchFilter({ initialFilters: {} })

  const { data, isLoading, isFetching } = useRoles({
    page,
    limit: pageSize,
    search,
  })

  // Sync total
  useMemo(() => {
    if (data?.pagination?.totalData) {
      setTotal(data.pagination.totalData)
    }
  }, [data?.pagination?.totalData, setTotal])

  const deleteRole = useDeleteRole()
  
  const [deletingId, setDeletingId] = useState<number | null>(null)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null)

  const handleCreateNew = () => {
    setEditingRoleId(null)
    setIsModalOpen(true)
  }

  const handleEdit = (id: number) => {
    setEditingRoleId(id)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRoleId(null)
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await deleteRole.mutateAsync(id)
      toast.success("Role deleted successfully")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete role"
      toast.error(errorMessage)
    } finally {
      setDeletingId(null)
    }
  }

  const breadcrumbs = useMemo(() => [
    { label: "Roles & Permissions" }
  ], [])

  // Filter out system default roles from deletion/editing if needed, 
  // but for now we render broadly.
  return (
    <>
      <BodyLayout 
        breadcrumbs={breadcrumbs}
        toolbar={
          <div className="flex items-center gap-3 px-2 py-2">
            <SearchBar
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10"
            />
          </div>
        }
        actions={
          <Button onClick={handleCreateNew} className="rounded-xl shadow-lg shadow-primary/20 h-10">
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        }
      >
        <div className="max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <Table
              page={page}
              pageSize={pageSize}
              totalPages={data?.pagination?.totalPages || 1}
              totalData={data?.pagination?.totalData || 0}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            >
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-[120px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody loading={isLoading} fetching={isFetching && !isLoading} columnCount={5} rowCount={data?.data?.length || 5}>
                {!isLoading && data?.data?.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>#{role.id}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{role.name}</span>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate" title={role.description}>
                      {role.description || <span className="text-slate-400 italic">No description</span>}
                    </TableCell>
                    <TableCell>
                      <DateCell date={role.created_at} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <EditButton title="Role" onEdit={() => handleEdit(role.id)} />
                        {/* Optionally disable deletion for super_admin. We rely on backend error for now. */}
                        <DeleteButton
                          title="Role"
                          loading={deletingId === role.id}
                          onDelete={() => handleDelete(role.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && data?.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No roles found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </BodyLayout>

      {/* Slide-out or Dialog approach handled inside RoleFormModal */}
      <RoleFormModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        roleId={editingRoleId} 
      />
    </>
  )
}

export default RolesListPage
