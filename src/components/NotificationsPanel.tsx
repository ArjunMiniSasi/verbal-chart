import { useState } from 'react'
import { 
  Bell, 
  UserPlus, 
  Calendar, 
  Clock,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: string
  type: 'incoming_patient' | 'schedule' | 'activity'
  icon: React.ElementType
  oneLiner: string
  content: string
  timestamp: string
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'incoming_patient',
    icon: UserPlus,
    oneLiner: 'New patient arrival: Max (Golden Retriever)',
    content: 'Max, a 3-year-old Golden Retriever, has arrived for consultation. Owner: John Smith. Scheduled appointment at 2:00 PM.',
    timestamp: '5 minutes ago',
    read: false
  },
  {
    id: '2',
    type: 'schedule',
    icon: Calendar,
    oneLiner: 'Upcoming appointment: Bella at 3:30 PM',
    content: 'You have an appointment with Bella (Persian Cat) at 3:30 PM today. Owner: Sarah Johnson. Follow-up visit for vaccination.',
    timestamp: '15 minutes ago',
    read: false
  },
  {
    id: '3',
    type: 'activity',
    icon: Clock,
    oneLiner: 'Pending SOAP note review: Charlie',
    content: 'SOAP note for Charlie (Labrador) from yesterday\'s consultation is pending your review and approval.',
    timestamp: '1 hour ago',
    read: false
  },
  {
    id: '4',
    type: 'schedule',
    icon: Calendar,
    oneLiner: 'Today\'s schedule: 5 appointments',
    content: 'You have 5 appointments scheduled for today: 2 new cases and 3 follow-ups. Next appointment: Max at 2:00 PM.',
    timestamp: '2 hours ago',
    read: true
  },
  {
    id: '5',
    type: 'incoming_patient',
    icon: UserPlus,
    oneLiner: 'Emergency case: Luna (German Shepherd)',
    content: 'Luna, a 5-year-old German Shepherd, has arrived as an emergency case. Owner: Mike Davis. Please attend immediately.',
    timestamp: '3 hours ago',
    read: true
  }
]

export const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getNotificationIcon = (notification: Notification) => {
    const Icon = notification.icon
    const iconClass = "h-5 w-5"
    
    switch (notification.type) {
      case 'incoming_patient':
        return <Icon className={`${iconClass} text-blue-600`} />
      case 'schedule':
        return <Icon className={`${iconClass} text-green-600`} />
      case 'activity':
        return <Icon className={`${iconClass} text-orange-600`} />
      default:
        return <Icon className={`${iconClass} text-gray-600`} />
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-7"
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.oneLiner}
                            </p>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {notification.content}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{notification.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
