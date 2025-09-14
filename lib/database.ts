import { createClient } from './supabase-client'

// Explicit type definitions to fix TypeScript issues
interface BusData {
  id: string
  route_number: string
  bus_number: string
  current_location: string
  status: 'active' | 'inactive' | 'maintenance'
  capacity: number
  created_at: string
  updated_at: string
}

interface RouteData {
  id: string
  name: string
  start_point: string
  end_point: string
  stops: string[]
  distance_km: number
  estimated_duration: number
  created_at: string
  updated_at: string
}

interface ScheduleData {
  id: string
  route_id: string
  bus_id: string
  departure_time: string
  arrival_time: string
  days_of_week: number[]
  frequency_minutes: number
  is_active: boolean
  created_at: string
  updated_at: string
  route?: RouteData
  bus?: BusData
}

interface ScheduleStopData {
  id: string
  schedule_id: string
  stop_name: string
  stop_order: number
  arrival_time: string
  departure_time: string
  created_at: string
}

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
  current_bus?: BusData
}

export class DatabaseService {
  private supabase = createClient() as any

  // Bus operations
  async getBuses(): Promise<BusData[]> {
    console.log('DatabaseService.getBuses - Starting...')
    
    try {
      const { data, error } = await this.supabase
        .from('buses')
        .select('*')
        .order('created_at', { ascending: false })
      
      console.log('DatabaseService.getBuses - Response:', { data, error })
      
      if (error) {
        console.error('DatabaseService.getBuses - Error:', error)
        throw error
      }
      
      console.log('DatabaseService.getBuses - Success:', data?.length || 0, 'buses')
      return data as BusData[] || []
    } catch (error) {
      console.error('DatabaseService.getBuses - Exception:', error)
      throw error
    }
  }

  async getBusById(id: string) {
    const { data, error } = await this.supabase
      .from('buses')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async addBus(busData: any): Promise<BusData> {
    console.log('DatabaseService.addBus - Input data:', busData)
    
    const { data, error } = await (this.supabase as any)
      .from('buses')
      .insert(busData as any)
      .select()
      .single()
    
    console.log('DatabaseService.addBus - Supabase response:', { data, error })
    
    if (error) {
      console.error('DatabaseService.addBus - Error:', error)
      throw error
    }
    
    if (!data) {
      console.error('DatabaseService.addBus - No data returned')
      throw new Error('No data returned from insert operation')
    }
    
    console.log('DatabaseService.addBus - Success:', data)
    return data as BusData
  }

  async updateBus(id: string, updates: any): Promise<BusData> {
    console.log('DatabaseService.updateBus - ID:', id, 'Updates:', updates)
    
    const { data, error } = await this.supabase
      .from('buses')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single()
    
    console.log('Supabase response:', { data, error })
    
    if (error) {
      console.error('Supabase update failed:', error)
      throw new Error(`Database update failed: ${error.message}`)
    }
    
    if (!data) {
      throw new Error('No data returned from update - bus may not exist')
    }
    
    return data as BusData
  }

  async deleteBus(id: string) {
    console.log('DatabaseService.deleteBus - Deleting bus ID:', id)
    
    const { error } = await this.supabase
      .from('buses')
      .delete()
      .eq('id', id)
    
    console.log('DatabaseService.deleteBus - Delete response:', { error })
    
    if (error) {
      console.error('DatabaseService.deleteBus - Error:', error)
      throw error
    }
    
    console.log('DatabaseService.deleteBus - Success')
  }


  // Route operations
  async getRoutes(): Promise<RouteData[]> {
    console.log('DatabaseService.getRoutes - Starting...')
    
    try {
      const { data, error } = await this.supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false })
      
      console.log('DatabaseService.getRoutes - Response:', { data, error })
      
      if (error) {
        console.error('DatabaseService.getRoutes - Error:', error)
        throw error
      }
      
      console.log('DatabaseService.getRoutes - Success:', data?.length || 0, 'routes')
      return data as RouteData[] || []
    } catch (error) {
      console.error('DatabaseService.getRoutes - Exception:', error)
      throw error
    }
  }

  async getRouteById(id: string) {
    const { data, error } = await this.supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async createRoute(route: any): Promise<RouteData> {
    const { data, error } = await this.supabase
      .from('routes')
      .insert(route as any)
      .select()
      .single()
    
    if (error) throw error
    return data as RouteData
  }

  async updateRoute(id: string, updates: any): Promise<RouteData> {
    const { data, error } = await this.supabase
      .from('routes')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as RouteData
  }

  async deleteRoute(id: string) {
    const { error } = await this.supabase
      .from('routes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Analytics and dashboard queries
  async getBusStatistics() {
    const { data, error } = await this.supabase
      .from('buses')
      .select('status')
    
    if (error) throw error
    
    const busData = data as { status: string }[]
    const stats = busData.reduce((acc, bus) => {
      acc[bus.status] = (acc[bus.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      total: busData.length,
      active: stats.active || 0,
      inactive: stats.inactive || 0,
      maintenance: stats.maintenance || 0
    }
  }

  async getRouteStatistics() {
    const { data, error } = await this.supabase
      .from('routes')
      .select('distance_km, estimated_duration')
    
    if (error) throw error
    
    const routeData = data as { distance_km: number; estimated_duration: number }[]
    const totalDistance = routeData.reduce((sum, route) => sum + route.distance_km, 0)
    const avgDistance = routeData.length > 0 ? totalDistance / routeData.length : 0
    const avgDuration = routeData.length > 0 
      ? routeData.reduce((sum, route) => sum + route.estimated_duration, 0) / routeData.length 
      : 0
    
    return {
      total: routeData.length,
      totalDistance,
      avgDistance,
      avgDuration
    }
  }

  // Schedule operations
  async getSchedules(): Promise<ScheduleData[]> {
    console.log('DatabaseService.getSchedules - Starting...')
    
    try {
      const { data, error } = await this.supabase
        .from('schedules')
        .select(`
          *,
          route:routes(*),
          bus:buses(*)
        `)
        .order('created_at', { ascending: false })
      
      console.log('DatabaseService.getSchedules - Response:', { data, error })
      
      if (error) {
        console.error('DatabaseService.getSchedules - Error:', error)
        throw error
      }
      
      console.log('DatabaseService.getSchedules - Success:', data?.length || 0, 'schedules')
      return data as ScheduleData[] || []
    } catch (error) {
      console.error('DatabaseService.getSchedules - Exception:', error)
      throw error
    }
  }

  async getScheduleById(id: string): Promise<ScheduleData> {
    const { data, error } = await this.supabase
      .from('schedules')
      .select(`
        *,
        route:routes(*),
        bus:buses(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as ScheduleData
  }

  async addSchedule(scheduleData: any): Promise<ScheduleData> {
    console.log('DatabaseService.addSchedule - Input:', scheduleData)
    
    const { data, error } = await this.supabase
      .from('schedules')
      .insert(scheduleData)
      .select(`
        *,
        route:routes(*),
        bus:buses(*)
      `)
      .single()
    
    console.log('DatabaseService.addSchedule - Response:', { data, error })
    
    if (error) {
      console.error('DatabaseService.addSchedule - Error:', error)
      throw error
    }
    
    if (!data) {
      throw new Error('No data returned from schedule insert')
    }
    
    return data as ScheduleData
  }

  async updateSchedule(id: string, updates: any): Promise<ScheduleData> {
    console.log('DatabaseService.updateSchedule - ID:', id, 'Updates:', updates)
    
    const { data, error } = await this.supabase
      .from('schedules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        route:routes(*),
        bus:buses(*)
      `)
      .single()
    
    if (error) {
      console.error('DatabaseService.updateSchedule - Error:', error)
      throw error
    }
    
    if (!data) {
      throw new Error('No data returned from schedule update')
    }
    
    return data as ScheduleData
  }

  async deleteSchedule(id: string) {
    console.log('DatabaseService.deleteSchedule - ID:', id)
    
    const { error } = await this.supabase
      .from('schedules')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('DatabaseService.deleteSchedule - Error:', error)
      throw error
    }
  }

  // Schedule stops operations
  async getScheduleStops(scheduleId: string): Promise<ScheduleStopData[]> {
    const { data, error } = await this.supabase
      .from('schedule_stops')
      .select('*')
      .eq('schedule_id', scheduleId)
      .order('stop_order')
    
    if (error) throw error
    return data as ScheduleStopData[]
  }

  async addScheduleStop(stopData: any): Promise<ScheduleStopData> {
    const { data, error } = await this.supabase
      .from('schedule_stops')
      .insert(stopData)
      .select()
      .single()
    
    if (error) throw error
    return data as ScheduleStopData
  }

  async updateScheduleStop(id: string, updates: any): Promise<ScheduleStopData> {
    const { data, error } = await this.supabase
      .from('schedule_stops')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as ScheduleStopData
  }

  async deleteScheduleStop(id: string) {
    const { error } = await this.supabase
      .from('schedule_stops')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  async getActiveSchedulesForRoute(routeId: string): Promise<ScheduleData[]> {
    const { data, error } = await this.supabase
      .from('schedules')
      .select(`
        *,
        route:routes(*),
        bus:buses(*)
      `)
      .eq('route_id', routeId)
      .eq('is_active', true)
      .order('departure_time')
    
    if (error) throw error
    return data as ScheduleData[]
  }

  // Driver operations
  async getDrivers(): Promise<DriverData[]> {
    console.log('DatabaseService.getDrivers - Starting...')
    
    try {
      const { data, error } = await this.supabase
        .from('drivers')
        .select(`
          *,
          current_bus:buses(*)
        `)
        .order('created_at', { ascending: false })
      
      console.log('DatabaseService.getDrivers - Response:', { data, error })
      
      if (error) {
        console.error('DatabaseService.getDrivers - Error:', error)
        throw error
      }
      
      console.log('DatabaseService.getDrivers - Success:', data?.length || 0, 'drivers')
      return data as DriverData[] || []
    } catch (error) {
      console.error('DatabaseService.getDrivers - Exception:', error)
      throw error
    }
  }

  async getDriverById(id: string): Promise<DriverData> {
    const { data, error } = await this.supabase
      .from('drivers')
      .select(`
        *,
        current_bus:buses(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as DriverData
  }

  async addDriver(driverData: any): Promise<DriverData> {
    console.log('DatabaseService.addDriver - Input:', driverData)
    
    const { data, error } = await this.supabase
      .from('drivers')
      .insert(driverData)
      .select(`
        *,
        current_bus:buses(*)
      `)
      .single()
    
    console.log('DatabaseService.addDriver - Response:', { data, error })
    
    if (error) {
      console.error('DatabaseService.addDriver - Error:', error)
      throw error
    }
    
    if (!data) {
      throw new Error('No data returned from driver insert')
    }
    
    return data as DriverData
  }

  async updateDriver(id: string, updates: any): Promise<DriverData> {
    console.log('DatabaseService.updateDriver - ID:', id, 'Updates:', updates)
    
    const { data, error } = await this.supabase
      .from('drivers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        current_bus:buses(*)
      `)
      .single()
    
    if (error) {
      console.error('DatabaseService.updateDriver - Error:', error)
      throw error
    }
    
    if (!data) {
      throw new Error('No data returned from driver update')
    }
    
    return data as DriverData
  }

  async deleteDriver(id: string) {
    console.log('DatabaseService.deleteDriver - ID:', id)
    
    const { error } = await this.supabase
      .from('drivers')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('DatabaseService.deleteDriver - Error:', error)
      throw error
    }
  }

  async getDriverStatistics() {
    const { data, error } = await this.supabase
      .from('drivers')
      .select('status')
    
    if (error) throw error
    
    const driverData = data as { status: string }[]
    const stats = driverData.reduce((acc, driver) => {
      acc[driver.status] = (acc[driver.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      total: driverData.length,
      active: stats.active || 0,
      inactive: stats.inactive || 0,
      on_leave: stats.on_leave || 0,
      suspended: stats.suspended || 0
    }
  }

  // Maintenance Records operations
  async getMaintenanceRecords(): Promise<any[]> {
    console.log('DatabaseService.getMaintenanceRecords - Starting...')
    
    try {
      const { data, error } = await this.supabase
        .from('maintenance_records')
        .select(`
          *,
          bus:buses(*)
        `)
        .order('scheduled_date', { ascending: false })
      
      console.log('DatabaseService.getMaintenanceRecords - Response:', { data, error })
      
      if (error) {
        console.error('DatabaseService.getMaintenanceRecords - Error:', error)
        throw error
      }
      
      console.log('DatabaseService.getMaintenanceRecords - Success:', data?.length || 0, 'records')
      return data || []
    } catch (error) {
      console.error('DatabaseService.getMaintenanceRecords - Exception:', error)
      throw error
    }
  }

  async addMaintenanceRecord(recordData: any): Promise<any> {
    console.log('DatabaseService.addMaintenanceRecord - Input:', recordData)
    
    const { data, error } = await this.supabase
      .from('maintenance_records')
      .insert(recordData)
      .select(`
        *,
        bus:buses(*)
      `)
      .single()
    
    console.log('DatabaseService.addMaintenanceRecord - Response:', { data, error })
    
    if (error) {
      console.error('DatabaseService.addMaintenanceRecord - Error:', error)
      throw error
    }
    
    return data
  }

  async updateMaintenanceRecord(id: string, updates: any): Promise<any> {
    console.log('DatabaseService.updateMaintenanceRecord - ID:', id, 'Updates:', updates)
    
    const { data, error } = await this.supabase
      .from('maintenance_records')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        bus:buses(*)
      `)
      .single()
    
    if (error) {
      console.error('DatabaseService.updateMaintenanceRecord - Error:', error)
      throw error
    }
    
    return data
  }

  async deleteMaintenanceRecord(id: string) {
    console.log('DatabaseService.deleteMaintenanceRecord - ID:', id)
    
    const { error } = await this.supabase
      .from('maintenance_records')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('DatabaseService.deleteMaintenanceRecord - Error:', error)
      throw error
    }
  }

  // Driver Performance Records operations
  async getDriverPerformanceRecords(): Promise<any[]> {
    console.log('DatabaseService.getDriverPerformanceRecords - Starting...')
    
    try {
      const { data, error } = await this.supabase
        .from('driver_performance_records')
        .select(`
          *,
          driver:drivers(*)
        `)
        .order('evaluation_date', { ascending: false })
      
      console.log('DatabaseService.getDriverPerformanceRecords - Response:', { data, error })
      
      if (error) {
        console.error('DatabaseService.getDriverPerformanceRecords - Error:', error)
        throw error
      }
      
      console.log('DatabaseService.getDriverPerformanceRecords - Success:', data?.length || 0, 'records')
      return data || []
    } catch (error) {
      console.error('DatabaseService.getDriverPerformanceRecords - Exception:', error)
      throw error
    }
  }

  async addDriverPerformanceRecord(recordData: any): Promise<any> {
    console.log('DatabaseService.addDriverPerformanceRecord - Input:', recordData)
    
    const { data, error } = await this.supabase
      .from('driver_performance_records')
      .insert(recordData)
      .select(`
        *,
        driver:drivers(*)
      `)
      .single()
    
    console.log('DatabaseService.addDriverPerformanceRecord - Response:', { data, error })
    
    if (error) {
      console.error('DatabaseService.addDriverPerformanceRecord - Error:', error)
      throw error
    }
    
    return data
  }

  async updateDriverPerformanceRecord(id: string, updates: any): Promise<any> {
    console.log('DatabaseService.updateDriverPerformanceRecord - ID:', id, 'Updates:', updates)
    
    const { data, error } = await this.supabase
      .from('driver_performance_records')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        driver:drivers(*)
      `)
      .single()
    
    if (error) {
      console.error('DatabaseService.updateDriverPerformanceRecord - Error:', error)
      throw error
    }
    
    return data
  }

  async deleteDriverPerformanceRecord(id: string) {
    console.log('DatabaseService.deleteDriverPerformanceRecord - ID:', id)
    
    const { error } = await this.supabase
      .from('driver_performance_records')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('DatabaseService.deleteDriverPerformanceRecord - Error:', error)
      throw error
    }
  }
}

export const db = new DatabaseService()
