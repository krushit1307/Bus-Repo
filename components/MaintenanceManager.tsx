'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Edit, Plus, Wrench, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'
import { db } from '@/lib/database'

interface MaintenanceRecord {
  id: string
  bus_id: string
  maintenance_type: 'routine' | 'repair' | 'inspection' | 'emergency'
  description: string
  scheduled_date: string
  completed_date?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  cost?: number
  mechanic_name?: string
  parts_used?: string[]
  mileage_at_service?: number
  next_service_date?: string
  notes?: string
  created_at: string
  updated_at: string
  bus?: any
}

interface BusData {
  id: string
  route_number: string
  capacity: number
  status: string
}

export default function MaintenanceManager() {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [buses, setBuses] = useState<BusData[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    bus_id: '',
    maintenance_type: 'routine' as 'routine' | 'repair' | 'inspection' | 'emergency',
    description: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    status: 'scheduled' as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    cost: '',
    mechanic_name: '',
    mileage_at_service: '',
    next_service_date: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    console.log('🔄 MaintenanceManager - Loading data...')
    setIsLoading(true)
    setError(null)
    
    try {
      const [recordsData, busesData] = await Promise.all([
        db.getMaintenanceRecords(),
        db.getBuses()
      ])
      
      console.log('✅ Maintenance records loaded:', recordsData?.length || 0)
      console.log('✅ Buses loaded:', busesData?.length || 0)
      
      setMaintenanceRecords(recordsData || [])
      setBuses(busesData || [])
    } catch (error: any) {
      console.error('❌ Failed to load maintenance data:', error)
      setError(`Failed to load data: ${error.message}`)
      setMaintenanceRecords([])
      setBuses([])
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      bus_id: '',
      maintenance_type: 'routine',
      description: '',
      scheduled_date: new Date().toISOString().split('T')[0],
      status: 'scheduled',
      priority: 'medium',
      cost: '',
      mechanic_name: '',
      mileage_at_service: '',
      next_service_date: '',
      notes: ''
    })
    setEditingRecord(null)
  }

  const openDialog = (record?: MaintenanceRecord) => {
    if (record) {
      setEditingRecord(record)
      setFormData({
        bus_id: record.bus_id,
        maintenance_type: record.maintenance_type,
        description: record.description,
        scheduled_date: record.scheduled_date?.split('T')[0] || '',
        status: record.status,
        priority: record.priority,
        cost: record.cost?.toString() || '',
        mechanic_name: record.mechanic_name || '',
        mileage_at_service: record.mileage_at_service?.toString() || '',
        next_service_date: record.next_service_date?.split('T')[0] || '',
        notes: record.notes || ''
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const recordData = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        mileage_at_service: formData.mileage_at_service ? parseInt(formData.mileage_at_service) : null
      }

      if (editingRecord) {
        console.log('🔄 Updating maintenance record:', editingRecord.id)
        const updatedRecord = await db.updateMaintenanceRecord(editingRecord.id, recordData)
        setMaintenanceRecords(records => records.map(r => r.id === editingRecord.id ? updatedRecord : r))
        console.log('✅ Maintenance record updated successfully')
      } else {
        console.log('🔄 Adding new maintenance record')
        const newRecord = await db.addMaintenanceRecord(recordData)
        setMaintenanceRecords([newRecord, ...maintenanceRecords])
        console.log('✅ Maintenance record added successfully')
      }

      closeDialog()
    } catch (error: any) {
      console.error('❌ Failed to save maintenance record:', error)
      setError(`Failed to save record: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (record: MaintenanceRecord) => {
    if (!confirm(`Are you sure you want to delete this maintenance record?`)) {
      return
    }

    setIsLoading(true)
    try {
      console.log('🔄 Deleting maintenance record:', record.id)
      await db.deleteMaintenanceRecord(record.id)
      setMaintenanceRecords(records => records.filter(r => r.id !== record.id))
      console.log('✅ Maintenance record deleted successfully')
    } catch (error: any) {
      console.error('❌ Failed to delete maintenance record:', error)
      setError(`Failed to delete record: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-green-100 text-green-800', label: 'Low' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
      critical: { color: 'bg-red-100 text-red-800', label: 'Critical' }
    }
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading && maintenanceRecords.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading maintenance records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vehicle Maintenance Management</h2>
          <p className="text-gray-600">Track and manage vehicle maintenance schedules</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Maintenance Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? 'Edit Maintenance Record' : 'Add New Maintenance Record'}
              </DialogTitle>
              <DialogDescription>
                {editingRecord ? 'Update maintenance record details' : 'Enter maintenance details to schedule or record service'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bus_id">Bus *</Label>
                  <Select value={formData.bus_id} onValueChange={(value) => setFormData({...formData, bus_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a bus" />
                    </SelectTrigger>
                    <SelectContent>
                      {buses.map((bus) => (
                        <SelectItem key={bus.id} value={bus.id}>
                          {bus.route_number} - Capacity: {bus.capacity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maintenance_type">Maintenance Type *</Label>
                  <Select value={formData.maintenance_type} onValueChange={(value: any) => setFormData({...formData, maintenance_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  placeholder="Describe the maintenance work needed"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="scheduled_date">Scheduled Date *</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="mechanic_name">Mechanic Name</Label>
                  <Input
                    id="mechanic_name"
                    value={formData.mechanic_name}
                    onChange={(e) => setFormData({...formData, mechanic_name: e.target.value})}
                    placeholder="John Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mileage_at_service">Mileage at Service</Label>
                  <Input
                    id="mileage_at_service"
                    type="number"
                    value={formData.mileage_at_service}
                    onChange={(e) => setFormData({...formData, mileage_at_service: e.target.value})}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <Label htmlFor="next_service_date">Next Service Date</Label>
                  <Input
                    id="next_service_date"
                    type="date"
                    value={formData.next_service_date}
                    onChange={(e) => setFormData({...formData, next_service_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes or observations"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (editingRecord ? 'Update Record' : 'Add Record')}
                </Button>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
          <Button variant="outline" size="sm" onClick={loadData} className="ml-auto">
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {maintenanceRecords.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No maintenance records found</p>
                <p className="text-sm text-gray-400">Add your first maintenance record to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          maintenanceRecords.map((record) => (
            <Card key={record.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="w-5 h-5" />
                      {record.bus?.route_number || 'Unknown Bus'} - {record.maintenance_type}
                      {getStatusBadge(record.status)}
                      {getPriorityBadge(record.priority)}
                    </CardTitle>
                    <CardDescription>
                      {record.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(record)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(record)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Scheduled: {formatDate(record.scheduled_date)}</span>
                  </div>
                  {record.completed_date && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Completed: {formatDate(record.completed_date)}</span>
                    </div>
                  )}
                  {record.cost && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span>${record.cost.toFixed(2)}</span>
                    </div>
                  )}
                  {record.mechanic_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Mechanic: {record.mechanic_name}</span>
                    </div>
                  )}
                </div>
                {record.mileage_at_service && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-md">
                    <span className="text-sm text-blue-700">
                      Mileage at service: {record.mileage_at_service.toLocaleString()} km
                    </span>
                  </div>
                )}
                {record.next_service_date && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded-md">
                    <span className="text-sm text-yellow-700">
                      Next service due: {formatDate(record.next_service_date)}
                    </span>
                  </div>
                )}
                {record.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-700">Notes: {record.notes}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
