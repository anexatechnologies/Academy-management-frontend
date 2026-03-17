import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import type { MessagingSettings, BankAccount, BiometricDevice } from "@/types/settings"

export const useMessagingSettings = () => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["messaging-settings"],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<{ status: string; data: MessagingSettings }>("/settings")
      return data.data
    },
  })
}

export const useUpdateMessagingSettings = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      const { data } = await axiosPrivate.put("/settings", {
        settings
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging-settings"] })
    }
  })
}

// Bank Accounts
export const useBankAccounts = () => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<{ success: boolean; data: BankAccount[] }>("/settings/banks")
      return data.data
    },
  })
}

export const useCreateBankAccount = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<BankAccount, "id">) => {
      const { data } = await axiosPrivate.post("/settings/banks", payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] })
    }
  })
}

export const useUpdateBankAccount = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: BankAccount) => {
      const { data } = await axiosPrivate.put(`/settings/banks/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] })
    }
  })
}

export const useDeleteBankAccount = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosPrivate.delete(`/settings/banks/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] })
    }
  })
}

// Biometric Devices
export const useBiometricDevices = () => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["biometric-devices"],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<{ success: boolean; data: BiometricDevice[] }>("/settings/biometrics")
      return data.data
    },
  })
}

export const useCreateBiometricDevice = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<BiometricDevice, "id">) => {
      const { data } = await axiosPrivate.post("/settings/biometrics", payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biometric-devices"] })
    }
  })
}

export const useUpdateBiometricDevice = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: BiometricDevice) => {
      const { data } = await axiosPrivate.put(`/settings/biometrics/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biometric-devices"] })
    }
  })
}

export const useDeleteBiometricDevice = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosPrivate.delete(`/settings/biometrics/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biometric-devices"] })
    }
  })
}
