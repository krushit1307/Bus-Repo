'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Plus, User, Phone, Mail, Calendar, Award, AlertCircle } from 'lucide-react'
import { db } from '@/lib/database'

interface DriverData {
  id: string
  employee_id: string
  full_name: string
  email: string
  phone: string
  license_number: string
  license_expiry: string
  hire_date: string
  status: 'active' | 'inactive' | 'on_leave' | 'suspended'
  experience_years: number
  current_bus_id: string | null
  emergency_contact_name: string
  emergency_contact_phone: string
  address: string
  created_at: string
  updated_at: string
  current_bus?: any
}

interface BusData {
  id: string
  route_number: string
  capacity: number
  status: string
}

export default function DriverManager() {
  const [drivers, setDrivers] = useState<DriverData[]>([])
  const [buses, setBuses] = useState<BusData[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<DriverData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    phone: '',
    license_number: '',
    license_expiry: '',
    hire_date: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive' | 'on_leave' | 'suspended',
    experience_years: 0,
    current_bus_id: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    address: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    console.log('🔄 DriverManager - Loading data...')
    setIsLoading(true)
    setError(null)
    
    try {
      const [driversData, busesData] = await Promise.all([
        db.getDrivers(),
        db.getBuses()
      ])
      
      console.log('✅ Drivers loaded:', driversData?.length || 0)
      console.log('✅ Buses loaded:', busesData?.length || 0)
      
      setDrivers(driversData || [])
      setBuses(busesData || [])
    } catch (error: any) {
      console.error('❌ Failed to load driver data:', error)
      setError(`Failed to load data: ${error.message}`)
      setDrivers([])
      setBuses([])
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      employee_id: '',
      full_name: '',
      email: '',
      phone: '',
      license_number: '',
      license_expiry: '',
      hire_date: new Date().toISOString().split('T')[0],
      status: 'active',
      experience_years: 0,
      current_bus_id: 'none',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      address: ''
    })
    setEditingDriver(null)
  }

  const openDialog = (driver?: DriverData) => {
    if (driver) {
      setEditingDriver(driver)
      setFormData({
        employee_id: driver.employee_id,
        full_name: driver.full_name,
        email: driver.email || '',
        phone: driver.phone || '',
        license_number: driver.license_number,
        license_expiry: driver.license_expiry?.split('T')[0] || '',
        hire_date: driver.hire_date?.split('T')[0] || '',
        status: driver.status,
        experience_years: driver.experience_years || 0,
        current_bus_id: driver.current_bus_id || 'none',
        emergency_contact_name: driver.emergency_contact_name || '',
        emergency_contact_phone: driver.emergency_contact_phone || '',
        address: driver.address || ''
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
      const driverData = {
        ...formData,
        experience_years: Number(formData.experience_years),
        current_bus_id: formData.current_bus_id || null
      }

      if (editingDriver) {
        console.log('🔄 Updating driver:', editingDriver.id)
        const updatedDriver = await db.updateDriver(editingDriver.id, driverData)
        setDrivers(drivers.map(d => d.id === editingDriver.id ? updatedDriver : d))
        console.log('✅ Driver updated successfully')
      } else {
        console.log('🔄 Adding new driver')
        const newDriver = await db.addDriver(driverData)
        setDrivers([newDriver, ...drivers])
        console.log('✅ Driver added successfully')
      }

      closeDialog()
    } catch (error: any) {
      console.error('❌ Failed to save driver:', error)
      
      // Handle specific database constraint errors
      let errorMessage = error.message
      if (error.message.includes('drivers_license_number_key')) {
        errorMessage = 'License number already exists. Please use a unique license number.'
      } else if (error.message.includes('drivers_employee_id_key')) {
        errorMessage = 'Employee ID already exists. Please use a unique employee ID.'
      } else if (error.message.includes('drivers_email_key')) {
        errorMessage = 'Email already exists. Please use a unique email address.'
      }
      
      setError(`Failed to save driver: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (driver: DriverData) => {
    if (!confirm(`Are you sure you want to delete driver ${driver.full_name}?`)) {
      return
    }

    setIsLoading(true)
    try {
      console.log('🔄 Deleting driver:', driver.id)
      await db.deleteDriver(driver.id)
      setDrivers(drivers.filter(d => d.id !== driver.id))
      console.log('✅ Driver deleted successfully')
    } catch (error: any) {
      console.error('❌ Failed to delete driver:', error)
      setError(`Failed to delete driver: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      on_leave: { color: 'bg-yellow-100 text-yellow-800', label: 'On Leave' },
      suspended: { color: 'bg-red-100 text-red-800', label: 'Suspended' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading && drivers.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading drivers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Driver Management</h2>
          <p className="text-gray-600">Manage bus drivers and their information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
              </DialogTitle>
              <DialogDescription>
                {editingDriver ? 'Update driver information' : 'Enter driver details to add them to the system'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee_id">Employee ID *</Label>
                  <Input
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    required
                    placeholder="EMP001"
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                    placeholder="John Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@smartbus.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1-555-0101"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license_number">License Number *</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                    required
                    placeholder="DL123456789"
                  />
                </div>
                <div>
                  <Label htmlFor="license_expiry">License Expiry</Label>
                  <Input
                    id="license_expiry"
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => setFormData({...formData, license_expiry: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experience_years">Experience (Years)</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="current_bus_id">Assigned Bus</Label>
                <Select value={formData.current_bus_id} onValueChange={(value) => setFormData({...formData, current_bus_id: value === "none" ? "" : value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bus (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No bus assigned</SelectItem>
                    {buses.map((bus) => (
                      <SelectItem key={bus.id} value={bus.id}>
                        {bus.route_number} - Capacity: {bus.capacity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                    placeholder="+1-555-0102"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="123 Main St, City, State"
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
                  {isLoading ? 'Saving...' : (editingDriver ? 'Update Driver' : 'Add Driver')}
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
        {drivers.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No drivers found</p>
                <p className="text-sm text-gray-400">Add your first driver to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          drivers.map((driver) => (
            <Card key={driver.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {driver.full_name}
                      {getStatusBadge(driver.status)}
                    </CardTitle>
                    <CardDescription>
                      Employee ID: {driver.employee_id} | License: {driver.license_number}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(driver)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(driver)}
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
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{driver.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{driver.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Hired: {formatDate(driver.hire_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span>{driver.experience_years} years exp.</span>
                  </div>
                </div>
                {driver.current_bus && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-md">
                    <span className="text-sm text-blue-700">
                      Assigned to Bus: {driver.current_bus.route_number} (Capacity: {driver.current_bus.capacity})
                    </span>
                  </div>
                )}
                {driver.license_expiry && new Date(driver.license_expiry) < new Date() && (
                  <div className="mt-3 p-2 bg-red-50 rounded-md">
                    <span className="text-sm text-red-700">
                      ⚠️ License expired on {formatDate(driver.license_expiry)}
                    </span>
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
