import ReactECharts from 'echarts-for-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { StudentCount } from '@/types/dashboard'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  data?: StudentCount
  isLoading: boolean
}

export function StudentDemographicsChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card className="h-[350px] shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Student Demographics</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <Skeleton className="h-[200px] w-[200px] rounded-full" />
        </CardContent>
      </Card>
    )
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center',
      icon: 'circle'
    },
    color: ['#6366f1', '#ec4899', '#cbd5e1'], // Indigo for male, Pink for female, slate for unknown
    series: [
      {
        name: 'Gender Distribution',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: data?.male || 0, name: 'Male' },
          { value: data?.female || 0, name: 'Female' }
        ]
      }
    ]
  }

  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Student Demographics</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: '280px', width: '100%' }} />
      </CardContent>
    </Card>
  )
}
