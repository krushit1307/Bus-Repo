'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Edit, Plus, Clock, MapPin, Bus } from 'lucide-react'

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

interface Route {
  id: string
  name: string
  start_point: string
  end_point: string
}

interface Bus {
  id: string
  bus_number: string
  route_number: string
  status: string
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' }
]

export default function ScheduleManager() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    route_id: '',
    bus_id: '',
    departure_time: '',
    arrival_time: '',
    days_of_week: [] as number[],
    frequency_minutes: 30,
    is_active: true
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔄 Loading schedule management data...')
      
      // Load routes and buses first (they definitely exist)
      console.log('🛣️ Loading routes...')
      const routesData = await db.getRoutes()
      console.log('✅ Routes loaded:', routesData.length)
      
      console.log('🚌 Loading buses...')
      const busesData = await db.getBuses()
      console.log('✅ Buses loaded:', busesData.length)
      
      // Try to load schedules, but handle gracefully if table doesn't exist
      let schedulesData: Schedule[] = []
      try {
        console.log('📊 Loading schedules...')
        schedulesData = await db.getSchedules()
        console.log('✅ Schedules loaded:', schedulesData.length)
      } catch (scheduleError: any) {
        console.warn('⚠️ Schedules table not found or accessible:', scheduleError.message)
        if (scheduleError.message?.includes('schedules')) {
          setError('Schedules table not found. Please run the database schema update in Supabase.')
        }
        schedulesData = []
      }
      
      setSchedules(schedulesData || [])
      setRoutes(routesData || [])
      setBuses((busesData || []).filter(bus => bus.status === 'active'))
      
      if (schedulesData.length > 0 || !error) {
        console.log('🎉 Data loaded successfully')
      }
    } catch (error) {
      console.error('❌ Error loading schedule data:', error)
      setError(`Failed to load data: ${(error as any)?.message || 'Unknown error'}`)
      
      // Set empty arrays to prevent UI crashes
      setSchedules([])
      setRoutes([])
      setBuses([])
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      route_id: '',
      bus_id: '',
      departure_time: '',
      arrival_time: '',
      days_of_week: [],
      frequency_minutes: 30,
      is_active: true
    })
    setEditingSchedule(null)
  }

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      route_id: schedule.route_id,
      bus_id: schedule.bus_id,
      departure_time: schedule.departure_time,
      arrival_time: schedule.arrival_time,
      days_of_week: schedule.days_of_week,
      frequency_minutes: schedule.frequency_minutes,
      is_active: schedule.is_active
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.route_id || !formData.bus_id || !formData.departure_time || !formData.arrival_time) {
      setError('Please fill in all required fields')
      return
    }

    if (formData.days_of_week.length === 0) {
      setError('Please select at least one day of the week')
      return
    }

    try {
      if (editingSchedule) {
        await db.updateSchedule(editingSchedule.id, formData)
      } else {
        await db.addSchedule(formData)
      }
      
      await loadData()
      setIsDialogOpen(false)
      resetForm()
      setError('')
    } catch (error) {
      console.error('Error saving schedule:', error)
      setError('Failed to save schedule')
    }
  }

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return
    
    try {
      await db.deleteSchedule(scheduleId)
      await loadData()
      setError('')
    } catch (error) {
      console.error('Error deleting schedule:', error)
      setError('Failed to delete schedule')
    }
  }

  const toggleScheduleStatus = async (schedule: Schedule) => {
    try {
      await db.updateSchedule(schedule.id, { is_active: !schedule.is_active })
      await loadData()
      setError('')
    } catch (error) {
      console.error('Error updating schedule status:', error)
      setError('Failed to update schedule status')
    }
  }

  const handleDayToggle = (dayValue: number) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(dayValue)
        ? prev.days_of_week.filter(d => d !== dayValue)
        : [...prev.days_of_week, dayValue].sort()
    }))
  }

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getDaysDisplay = (days: number[]) => {
    return days.map(day => DAYS_OF_WEEK[day]?.short).join(', ')
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading schedules...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Schedule Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="route">Route *</Label>
                <Select value={formData.route_id} onValueChange={(value) => setFormData(prev => ({ ...prev, route_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map(route => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name} ({route.start_point} → {route.end_point})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bus">Bus *</Label>
                <Select value={formData.bus_id} onValueChange={(value) => setFormData(prev => ({ ...prev, bus_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {buses.map(bus => (
                      <SelectItem key={bus.id} value={bus.id}>
                        {bus.bus_number} ({bus.route_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departure_time">Departure Time *</Label>
                  <Input
                    id="departure_time"
                    type="time"
                    value={formData.departure_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, departure_time: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="arrival_time">Arrival Time *</Label>
                  <Input
                    id="arrival_time"
                    type="time"
                    value={formData.arrival_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, arrival_time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Days of Week *</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={formData.days_of_week.includes(day.value)}
                        onCheckedChange={() => handleDayToggle(day.value)}
                      />
                      <Label htmlFor={`day-${day.value}`} className="text-sm">
                        {day.short}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="frequency">Frequency (minutes)</Label>
                <Input
                  id="frequency"
                  type="number"
                  min="15"
                  max="120"
                  step="15"
                  value={formData.frequency_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency_minutes: parseInt(e.target.value) || 30 }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked as boolean }))}
                />
                <Label htmlFor="is_active">Active Schedule</Label>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSchedule ? 'Update' : 'Create'} Schedule
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {schedules.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No schedules found. Create your first schedule to get started.</p>
            </CardContent>
          </Card>
        ) : (
          schedules.map(schedule => (
            <Card key={schedule.id} className={`${!schedule.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">
                        {schedule.route?.name || 'Unknown Route'}
                      </span>
                      <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                        {schedule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Bus className="w-4 h-4" />
                      <span>{schedule.bus?.bus_number || 'Unknown Bus'}</span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span>{formatTime(schedule.departure_time)}</span>
                      </div>
                      <span>→</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-red-600" />
                        <span>{formatTime(schedule.arrival_time)}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Days:</span> {getDaysDisplay(schedule.days_of_week)}
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Frequency:</span> Every {schedule.frequency_minutes} minutes
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleScheduleStatus(schedule)}
                    >
                      {schedule.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(schedule)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(schedule.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
