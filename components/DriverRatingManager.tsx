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
import { Trash2, Edit, Plus, Star, TrendingUp, Calendar, AlertCircle, User } from 'lucide-react'
import { db } from '@/lib/database'

interface DriverPerformanceRecord {
  id: string
  driver_id: string
  evaluation_date: string
  overall_rating: number
  safety_rating?: number
  punctuality_rating?: number
  fuel_efficiency_rating?: number
  customer_service_rating?: number
  trips_completed: number
  on_time_percentage?: number
  fuel_efficiency_kmpl?: number
  incidents_count: number
  complaints_count: number
  commendations_count: number
  evaluator_name?: string
  comments?: string
  created_at: string
  updated_at: string
  driver?: any
}

interface DriverData {
  id: string
  employee_id: string
  full_name: string
  status: string
}

export default function DriverRatingManager() {
  const [performanceRecords, setPerformanceRecords] = useState<DriverPerformanceRecord[]>([])
  const [drivers, setDrivers] = useState<DriverData[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<DriverPerformanceRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    driver_id: '',
    evaluation_date: new Date().toISOString().split('T')[0],
    overall_rating: '4.0',
    safety_rating: '4.0',
    punctuality_rating: '4.0',
    fuel_efficiency_rating: '4.0',
    customer_service_rating: '4.0',
    trips_completed: '0',
    on_time_percentage: '',
    fuel_efficiency_kmpl: '',
    incidents_count: '0',
    complaints_count: '0',
    commendations_count: '0',
    evaluator_name: '',
    comments: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    console.log('🔄 DriverRatingManager - Loading data...')
    setIsLoading(true)
    setError(null)
    
    try {
      const [recordsData, driversData] = await Promise.all([
        db.getDriverPerformanceRecords(),
        db.getDrivers()
      ])
      
      console.log('✅ Performance records loaded:', recordsData?.length || 0)
      console.log('✅ Drivers loaded:', driversData?.length || 0)
      
      setPerformanceRecords(recordsData || [])
      setDrivers(driversData || [])
    } catch (error: any) {
      console.error('❌ Failed to load performance data:', error)
      setError(`Failed to load data: ${error.message}`)
      setPerformanceRecords([])
      setDrivers([])
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      driver_id: '',
      evaluation_date: new Date().toISOString().split('T')[0],
      overall_rating: '4.0',
      safety_rating: '4.0',
      punctuality_rating: '4.0',
      fuel_efficiency_rating: '4.0',
      customer_service_rating: '4.0',
      trips_completed: '0',
      on_time_percentage: '',
      fuel_efficiency_kmpl: '',
      incidents_count: '0',
      complaints_count: '0',
      commendations_count: '0',
      evaluator_name: '',
      comments: ''
    })
    setEditingRecord(null)
  }

  const openDialog = (record?: DriverPerformanceRecord) => {
    if (record) {
      setEditingRecord(record)
      setFormData({
        driver_id: record.driver_id,
        evaluation_date: record.evaluation_date?.split('T')[0] || '',
        overall_rating: record.overall_rating?.toString() || '4.0',
        safety_rating: record.safety_rating?.toString() || '4.0',
        punctuality_rating: record.punctuality_rating?.toString() || '4.0',
        fuel_efficiency_rating: record.fuel_efficiency_rating?.toString() || '4.0',
        customer_service_rating: record.customer_service_rating?.toString() || '4.0',
        trips_completed: record.trips_completed?.toString() || '0',
        on_time_percentage: record.on_time_percentage?.toString() || '',
        fuel_efficiency_kmpl: record.fuel_efficiency_kmpl?.toString() || '',
        incidents_count: record.incidents_count?.toString() || '0',
        complaints_count: record.complaints_count?.toString() || '0',
        commendations_count: record.commendations_count?.toString() || '0',
        evaluator_name: record.evaluator_name || '',
        comments: record.comments || ''
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
        overall_rating: parseFloat(formData.overall_rating),
        safety_rating: formData.safety_rating ? parseFloat(formData.safety_rating) : null,
        punctuality_rating: formData.punctuality_rating ? parseFloat(formData.punctuality_rating) : null,
        fuel_efficiency_rating: formData.fuel_efficiency_rating ? parseFloat(formData.fuel_efficiency_rating) : null,
        customer_service_rating: formData.customer_service_rating ? parseFloat(formData.customer_service_rating) : null,
        trips_completed: parseInt(formData.trips_completed) || 0,
        on_time_percentage: formData.on_time_percentage ? parseFloat(formData.on_time_percentage) : null,
        fuel_efficiency_kmpl: formData.fuel_efficiency_kmpl ? parseFloat(formData.fuel_efficiency_kmpl) : null,
        incidents_count: parseInt(formData.incidents_count) || 0,
        complaints_count: parseInt(formData.complaints_count) || 0,
        commendations_count: parseInt(formData.commendations_count) || 0
      }

      if (editingRecord) {
        console.log('🔄 Updating performance record:', editingRecord.id)
        const updatedRecord = await db.updateDriverPerformanceRecord(editingRecord.id, recordData)
        setPerformanceRecords(records => records.map(r => r.id === editingRecord.id ? updatedRecord : r))
        console.log('✅ Performance record updated successfully')
      } else {
        console.log('🔄 Adding new performance record')
        const newRecord = await db.addDriverPerformanceRecord(recordData)
        setPerformanceRecords([newRecord, ...performanceRecords])
        console.log('✅ Performance record added successfully')
      }

      closeDialog()
    } catch (error: any) {
      console.error('❌ Failed to save performance record:', error)
      setError(`Failed to save record: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (record: DriverPerformanceRecord) => {
    if (!confirm(`Are you sure you want to delete this performance record?`)) {
      return
    }

    setIsLoading(true)
    try {
      console.log('🔄 Deleting performance record:', record.id)
      await db.deleteDriverPerformanceRecord(record.id)
      setPerformanceRecords(records => records.filter(r => r.id !== record.id))
      console.log('✅ Performance record deleted successfully')
    } catch (error: any) {
      console.error('❌ Failed to delete performance record:', error)
      setError(`Failed to delete record: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getRatingStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />)
    }
    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }

    return <div className="flex items-center gap-1">{stars}</div>
  }

  const getPerformanceBadge = (rating: number) => {
    if (rating >= 4.5) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (rating >= 4.0) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
    if (rating >= 3.5) return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>
    if (rating >= 3.0) return <Badge className="bg-orange-100 text-orange-800">Below Average</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading && performanceRecords.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading driver performance records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Driver Performance Management</h2>
          <p className="text-gray-600">Track and evaluate driver performance ratings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Performance Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? 'Edit Performance Record' : 'Add New Performance Record'}
              </DialogTitle>
              <DialogDescription>
                {editingRecord ? 'Update driver performance evaluation' : 'Enter driver performance evaluation details'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driver_id">Driver *</Label>
                  <Select value={formData.driver_id} onValueChange={(value) => setFormData({...formData, driver_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.full_name} ({driver.employee_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="evaluation_date">Evaluation Date *</Label>
                  <Input
                    id="evaluation_date"
                    type="date"
                    value={formData.evaluation_date}
                    onChange={(e) => setFormData({...formData, evaluation_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Performance Ratings (0.0 - 5.0)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="overall_rating">Overall Rating *</Label>
                    <Input
                      id="overall_rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.overall_rating}
                      onChange={(e) => setFormData({...formData, overall_rating: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="safety_rating">Safety Rating</Label>
                    <Input
                      id="safety_rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.safety_rating}
                      onChange={(e) => setFormData({...formData, safety_rating: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="punctuality_rating">Punctuality Rating</Label>
                    <Input
                      id="punctuality_rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.punctuality_rating}
                      onChange={(e) => setFormData({...formData, punctuality_rating: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fuel_efficiency_rating">Fuel Efficiency Rating</Label>
                    <Input
                      id="fuel_efficiency_rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.fuel_efficiency_rating}
                      onChange={(e) => setFormData({...formData, fuel_efficiency_rating: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_service_rating">Customer Service Rating</Label>
                    <Input
                      id="customer_service_rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.customer_service_rating}
                      onChange={(e) => setFormData({...formData, customer_service_rating: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Performance Metrics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="trips_completed">Trips Completed</Label>
                    <Input
                      id="trips_completed"
                      type="number"
                      min="0"
                      value={formData.trips_completed}
                      onChange={(e) => setFormData({...formData, trips_completed: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="on_time_percentage">On-Time Percentage</Label>
                    <Input
                      id="on_time_percentage"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.on_time_percentage}
                      onChange={(e) => setFormData({...formData, on_time_percentage: e.target.value})}
                      placeholder="95.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fuel_efficiency_kmpl">Fuel Efficiency (km/l)</Label>
                    <Input
                      id="fuel_efficiency_kmpl"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.fuel_efficiency_kmpl}
                      onChange={(e) => setFormData({...formData, fuel_efficiency_kmpl: e.target.value})}
                      placeholder="8.5"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Incident Tracking</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="incidents_count">Incidents Count</Label>
                    <Input
                      id="incidents_count"
                      type="number"
                      min="0"
                      value={formData.incidents_count}
                      onChange={(e) => setFormData({...formData, incidents_count: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="complaints_count">Complaints Count</Label>
                    <Input
                      id="complaints_count"
                      type="number"
                      min="0"
                      value={formData.complaints_count}
                      onChange={(e) => setFormData({...formData, complaints_count: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="commendations_count">Commendations Count</Label>
                    <Input
                      id="commendations_count"
                      type="number"
                      min="0"
                      value={formData.commendations_count}
                      onChange={(e) => setFormData({...formData, commendations_count: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="evaluator_name">Evaluator Name</Label>
                <Input
                  id="evaluator_name"
                  value={formData.evaluator_name}
                  onChange={(e) => setFormData({...formData, evaluator_name: e.target.value})}
                  placeholder="Transport Manager"
                />
              </div>

              <div>
                <Label htmlFor="comments">Comments</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => setFormData({...formData, comments: e.target.value})}
                  placeholder="Additional comments about driver performance"
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
        {performanceRecords.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No performance records found</p>
                <p className="text-sm text-gray-400">Add your first performance evaluation to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          performanceRecords.map((record) => (
            <Card key={record.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {record.driver?.full_name || 'Unknown Driver'} ({record.driver?.employee_id})
                      {getPerformanceBadge(record.overall_rating)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      {getRatingStars(record.overall_rating)}
                      <span className="ml-2">{record.overall_rating.toFixed(1)}/5.0</span>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Evaluated: {formatDate(record.evaluation_date)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Trips: {record.trips_completed}</span>
                  </div>
                  {record.on_time_percentage && (
                    <div>
                      <span className="text-gray-600">On-time: {record.on_time_percentage}%</span>
                    </div>
                  )}
                  {record.fuel_efficiency_kmpl && (
                    <div>
                      <span className="text-gray-600">Fuel: {record.fuel_efficiency_kmpl} km/l</span>
                    </div>
                  )}
                </div>

                {(record.safety_rating || record.punctuality_rating || record.fuel_efficiency_rating || record.customer_service_rating) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {record.safety_rating && (
                      <div className="text-center p-2 bg-blue-50 rounded-md">
                        <div className="text-xs text-gray-600 mb-1">Safety</div>
                        <div className="font-semibold text-blue-700">{record.safety_rating.toFixed(1)}</div>
                      </div>
                    )}
                    {record.punctuality_rating && (
                      <div className="text-center p-2 bg-green-50 rounded-md">
                        <div className="text-xs text-gray-600 mb-1">Punctuality</div>
                        <div className="font-semibold text-green-700">{record.punctuality_rating.toFixed(1)}</div>
                      </div>
                    )}
                    {record.fuel_efficiency_rating && (
                      <div className="text-center p-2 bg-yellow-50 rounded-md">
                        <div className="text-xs text-gray-600 mb-1">Fuel Efficiency</div>
                        <div className="font-semibold text-yellow-700">{record.fuel_efficiency_rating.toFixed(1)}</div>
                      </div>
                    )}
                    {record.customer_service_rating && (
                      <div className="text-center p-2 bg-purple-50 rounded-md">
                        <div className="text-xs text-gray-600 mb-1">Customer Service</div>
                        <div className="font-semibold text-purple-700">{record.customer_service_rating.toFixed(1)}</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-red-50 rounded-md">
                    <div className="text-xs text-gray-600 mb-1">Incidents</div>
                    <div className="font-semibold text-red-700">{record.incidents_count}</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded-md">
                    <div className="text-xs text-gray-600 mb-1">Complaints</div>
                    <div className="font-semibold text-orange-700">{record.complaints_count}</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-md">
                    <div className="text-xs text-gray-600 mb-1">Commendations</div>
                    <div className="font-semibold text-green-700">{record.commendations_count}</div>
                  </div>
                </div>

                {record.evaluator_name && (
                  <div className="mb-3 p-2 bg-blue-50 rounded-md">
                    <span className="text-sm text-blue-700">
                      Evaluated by: {record.evaluator_name}
                    </span>
                  </div>
                )}

                {record.comments && (
                  <div className="p-2 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-700">Comments: {record.comments}</span>
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
