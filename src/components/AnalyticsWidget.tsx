import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  FileText, 
  Clock, 
  TrendingUp, 
  Calendar,
  Activity
} from "lucide-react"

interface AnalyticsData {
  totalPatients: number
  patientsThisWeek: number
  totalSOAPNotes: number
  pendingCases: number
  averageResponseTime: string
  weeklyGrowth: number
}

interface AnalyticsWidgetProps {
  data: AnalyticsData
  variant?: 'overview' | 'detailed'
}

export const AnalyticsWidget = ({ data, variant = 'overview' }: AnalyticsWidgetProps) => {
  const stats = [
    {
      title: 'Total Patients',
      value: data.totalPatients,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      change: data.weeklyGrowth,
      changeLabel: 'this week'
    },
    {
      title: 'New This Week',
      value: data.patientsThisWeek,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      change: null
    },
    {
      title: 'SOAP Notes',
      value: data.totalSOAPNotes,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      change: null
    },
    {
      title: 'Pending Cases',
      value: data.pendingCases,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      change: null
    }
  ]

  if (variant === 'detailed') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                    {stat.change !== null && (
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">
                          +{stat.change}% {stat.changeLabel}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // Overview variant
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-medical-primary" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-medical-primary">
              {data.totalPatients}
            </div>
            <div className="text-sm text-muted-foreground">Total Patients</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {data.patientsThisWeek}
            </div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">SOAP Notes</span>
            <Badge variant="outline">{data.totalSOAPNotes}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Pending Cases</span>
            <Badge variant={data.pendingCases > 0 ? "destructive" : "outline"}>
              {data.pendingCases}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Avg Response Time</span>
            <span className="text-sm font-medium">{data.averageResponseTime}</span>
          </div>
        </div>

        {data.weeklyGrowth > 0 && (
          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">
              +{data.weeklyGrowth}% growth this week
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
