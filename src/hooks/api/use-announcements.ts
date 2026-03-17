import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import type { 
  AnnouncementTemplate, 
  TargetCountResponse, 
  AnnouncementPayload,
  AnnouncementResponse
} from "@/types/announcement"

export const useTemplates = (params?: { category?: string; channel?: string }) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["templates", params],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<{ 
        success: boolean; 
        data: AnnouncementTemplate[];
        count: number;
      }>("/templates", { params })
      return data.data
    },
    placeholderData: keepPreviousData,
  })
}

export const useAnnouncementTargets = () => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["announcement-targets"],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<{ 
        success: boolean; 
        data: TargetCountResponse 
      }>("/announcements/targets")
      return data.data
    },
  })
}

export const useSendAnnouncement = () => {
  const axiosPrivate = useAxiosPrivate()
  return useMutation({
    mutationFn: async (payload: AnnouncementPayload) => {
      const { data } = await axiosPrivate.post<AnnouncementResponse>("/announcements/send", payload)
      return data
    },
  })
}
