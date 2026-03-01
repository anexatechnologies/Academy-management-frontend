import ReactECharts from 'echarts-for-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AttendanceSummary } from '@/types/dashboard'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  data?: AttendanceSummary
  isLoading: boolean
}

export function AttendanceOverviewChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card className="h-[350px] shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Today's Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Present', 'Absent'],
      bottom: '0%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['Ground', 'Lecture'],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    color: ['#10b981', '#f43f5e'], // Emerald for Present, Rose for Absent
    series: [
      {
        name: 'Present',
        type: 'bar',
        barWidth: '20%',
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        data: [data?.ground.present || 0, data?.lecture.present || 0]
      },
      {
        name: 'Absent',
        type: 'bar',
        barWidth: '20%',
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        data: [data?.ground.absent || 0, data?.lecture.absent || 0]
      }
    ]
  }

  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Today's Attendance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: '280px', width: '100%' }} />
      </CardContent>
    </Card>
  )
}
