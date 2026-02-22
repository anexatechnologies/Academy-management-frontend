import { useState, useMemo } from "react"
import { RequirePermission } from "@/components/auth/RequirePermission"
import { usePermissions } from "@/hooks/use-permissions"
import { useNavigate } from "react-router-dom"
import { UserPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useUsers, useDeleteUser, useToggleUserStatus } from "@/hooks/api/use-users"
import { useRoles } from "@/hooks/api/use-roles"
import BodyLayout from "@/components/layout/BodyLayout"
import { toast } from "sonner"
import { EditButton } from "@/components/ui/edit-button"
import { DeleteButton } from "@/components/ui/delete-button"
import { SearchBar } from "@/components/ui/search-bar"
import { CustomSelect } from "@/components/ui/custom-select"

import { useSearchFilter } from "@/hooks/use-search-filter"

const UsersListPage = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  type UserFilters = {
    role?: string
    status?: string
  }

  const { search, setSearch, params, setFilter, resetFilters } = useSearchFilter<UserFilters>({
    initialFilters: {},
  })

  const { data, isLoading } = useUsers({
    page,
    limit,
    ...params,
  })

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser()
  const { mutate: toggleStatus } = useToggleUserStatus()

  const { data: rolesData, isLoading: isLoadingRoles } = useRoles()
  const { canUpdateUser, canDeleteUser } = usePermissions()

  const handleDelete = (id: number) => {
    toast.promise(
      new Promise((resolve, reject) => {
        deleteUser(id, {
          onSuccess: resolve,
          onError: reject,
        })
      }),
      {
        loading: "Deleting user...",
        success: "User deleted successfully",
        error: (err: unknown) => {
          const error = err as Error & { response?: { data?: { message?: string } } };
          return error.response?.data?.message || "Failed to delete user";
        },
      }
    )
  }

  const handleStatusChange = (userId: number, currentStatus: boolean, newStatusStr: string) => {
    const newStatus = newStatusStr === "active"
    if (currentStatus !== newStatus) {
      toast.promise(
        new Promise((resolve, reject) => {
          toggleStatus(userId, {
            onSuccess: resolve,
            onError: reject,
          })
        }),
        {
          loading: "Updating status...",
          success: "Status updated successfully",
          error: (err: unknown) => {
            const error = err as Error & { response?: { data?: { message?: string } } };
            return error.response?.data?.message || "Failed to update status";
          },
        }
      )
    }
  }

  const breadcrumbs = useMemo(() => [{ label: "User Management" }], [])

  return (
    <BodyLayout
      breadcrumbs={breadcrumbs}
      toolbar={
        <div className="flex items-center gap-3">
          <SearchBar
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10"
          />
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          
          <CustomSelect
            value={params.role || "all"}
            onValueChange={(val) => setFilter("role", val === "all" ? undefined : val)}
            triggerClassName="w-[150px]"
            isLoading={isLoadingRoles}
            options={[
              { value: "all", label: "All Roles" },
              ...(rolesData || []).map(r => ({ value: r.name, label: r.name.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) }))
            ]}
          />

          <CustomSelect
            value={params.status || "all"}
            onValueChange={(val) => setFilter("status", val === "all" ? undefined : val)}
            triggerClassName="w-[140px]"
            options={[
              { value: "all", label: "All Status" },
              {
                value: "active",
                label: (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Active</span>
                  </div>
                )
              },
              {
                value: "inactive",
                label: (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Inactive</span>
                  </div>
                )
              }
            ]}
          />

          {(search || params.role || params.status) && (
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
      }
      actions={
        <RequirePermission module="users" action="create">
          <Button onClick={() => navigate("/users/new")} className="rounded-xl shadow-lg shadow-primary/20 h-10">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </RequirePermission>
      }
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table
          page={page}
          pageSize={limit}
          totalPages={data?.pagination?.totalPages || 1}
          totalData={data?.pagination?.totalData || 0}
          onPageChange={setPage}
          onPageSizeChange={(newLimit) => {
            setLimit(newLimit)
            setPage(1)
          }}
        >
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              {(canUpdateUser || canDeleteUser) && (
                <TableHead className="w-[120px] text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody loading={isLoading} columnCount={(canUpdateUser || canDeleteUser) ? 7 : 6} rowCount={limit}>
            {!isLoading && data?.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                  {user.full_name}
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium uppercase tracking-wider">
                    {user.role_name?.replace(/_/g, " ")}
                  </span>
                </TableCell>
                <TableCell>
                  <CustomSelect
                    value={user.is_active ? "active" : "inactive"}
                    disabled={!canUpdateUser}
                    onValueChange={(val) => handleStatusChange(user.id, user.is_active, val)}
                    triggerClassName="h-8 w-[110px] text-sm font-medium"
                    options={[
                      {
                        value: "active",
                        label: (
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span>Active</span>
                          </div>
                        )
                      },
                      {
                        value: "inactive",
                        label: (
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            <span>Inactive</span>
                          </div>
                        )
                      }
                    ]}
                  />
                </TableCell>
                {(canUpdateUser || canDeleteUser) && (
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      {canUpdateUser && (
                        <EditButton title="User" onEdit={() => navigate(`/users/edit/${user.id}`)} />
                      )}
                      {canDeleteUser && (
                        <DeleteButton
                          title="User"
                          loading={isDeleting}
                          onDelete={() => handleDelete(user.id)}
                        />
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!isLoading && data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={(canUpdateUser || canDeleteUser) ? 7 : 6} className="h-32 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </BodyLayout>
  )
}

export default UsersListPage
