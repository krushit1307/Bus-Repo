'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Bus, Calendar } from 'lucide-react'

interface Schedule {
  id: string
  route_id: string
  bus_id: string
  departure_time: string
  arrival_time: string
  days_of_week: number[]
  frequency_minutes: number
  is_active: boolean
  route?: { name: string; start_point: string; end_point: string }
  bus?: { bus_number: string; route_number: string }
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ScheduleDisplay() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    try {
      setLoading(true)
      const data = await db.getSchedules()
      setSchedules(data.filter(schedule => schedule.is_active))
      setError('')
    } catch (error) {
      console.error('Error loading schedules:', error)
      setError('Failed to load schedules')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getDaysDisplay = (days: number[]) => {
    return days.map(day => DAYS_OF_WEEK[day]).join(', ')
  }

  const getCurrentDaySchedules = () => {
    const today = new Date().getDay()
    return schedules.filter(schedule => 
      schedule.days_of_week.includes(today)
    )
  }

  const getUpcomingSchedules = () => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    return getCurrentDaySchedules().filter(schedule => {
      const [hours, minutes] = schedule.departure_time.split(':').map(Number)
      const scheduleTime = hours * 60 + minutes
      return scheduleTime > currentTime
    }).sort((a, b) => {
      const [aHours, aMinutes] = a.departure_time.split(':').map(Number)
      const [bHours, bMinutes] = b.departure_time.split(':').map(Number)
      return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes)
    })
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading schedules...</div>
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const todaySchedules = getCurrentDaySchedules()
  const upcomingSchedules = getUpcomingSchedules()

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaySchedules.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No schedules for today</p>
            ) : (
              todaySchedules.map(schedule => (
                <div key={schedule.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">
                          {schedule.route?.name || 'Unknown Route'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Bus className="w-4 h-4" />
                        <span>{schedule.bus?.bus_number || 'Unknown Bus'}</span>
                      </div>
                    </div>
                    <Badge variant="outline">
                      Every {schedule.frequency_minutes}m
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span>{formatTime(schedule.departure_time)}</span>
                    </div>
                    <span>→</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-red-600" />
                      <span>{formatTime(schedule.arrival_time)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Departures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Next Departures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingSchedules.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No more departures today</p>
            ) : (
              upcomingSchedules.slice(0, 5).map(schedule => (
                <div key={schedule.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">
                      {schedule.route?.name || 'Unknown Route'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {schedule.bus?.bus_number || 'Unknown Bus'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {formatTime(schedule.departure_time)}
                    </div>
                    <div className="text-xs text-gray-600">
                      Every {schedule.frequency_minutes}m
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Active Schedules */}
      <Card>
        <CardHeader>
          <CardTitle>All Active Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {schedules.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No active schedules found</p>
            ) : (
              schedules.map(schedule => (
                <div key={schedule.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">
                          {schedule.route?.name || 'Unknown Route'}
                        </span>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Bus className="w-4 h-4" />
                        <span>{schedule.bus?.bus_number || 'Unknown Bus'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-700 mb-1">Schedule</div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span>{formatTime(schedule.departure_time)}</span>
                        <span>→</span>
                        <Clock className="w-4 h-4 text-red-600" />
                        <span>{formatTime(schedule.arrival_time)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-700 mb-1">Days</div>
                      <div>{getDaysDisplay(schedule.days_of_week)}</div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-700 mb-1">Frequency</div>
                      <div>Every {schedule.frequency_minutes} minutes</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
