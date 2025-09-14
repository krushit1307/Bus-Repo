"use client"

import { ChartTooltipContent } from "@/components/ui/chart"

import { ChartTooltip } from "@/components/ui/chart"

import { ChartContainer } from "@/components/ui/chart"

import { Alert } from "@/components/ui/alert"
import { AlertDescription } from "@/components/ui/alert"

import { useState, useEffect } from "react"
import { db } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertCircle, Bus, Users, Zap, TrendingUp, MapPin, Clock, Fuel, Settings, AlertTriangle, CheckCircle, XCircle, BarChart3, RefreshCw, Download, TrendingDown } from 'lucide-react'
import ScheduleManager from '@/components/ScheduleManager'
import ScheduleDisplay from '@/components/ScheduleDisplay'
import DriverManager from '@/components/DriverManager'
import MaintenanceManager from '@/components/MaintenanceManager'
import DriverRatingManager from '@/components/DriverRatingManager'
import LoginPage from "@/components/LoginPage"
import {
  LogOut,
  X,
  Star,
  DollarSign,
  Cloud,
  Navigation,
  Shield,
  Plus,
  Edit,
  Trash2,
  Save,
  Anvil as Cancel,
  UserCheck,
  Route,
  Calendar,
  Car,
  Wrench,
  User,
  Filter,
  MoreHorizontal,
} from "lucide-react"
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as PieChartComponent,
  Pie,
  Cell,
  Tooltip,
  Legend,
  PieChart,
} from "recharts"
import { Activity } from "lucide-react"

const initialAlerts = [
  {
    id: 1,
    type: "warning",
    severity: "medium",
    message: "Bus B002 experiencing high passenger load on Route R2",
    timestamp: "2 min ago",
    route: "R2",
    resolved: false,
  },
  {
    id: 2,
    type: "info",
    severity: "low",
    message: "Route R1 optimization completed - 8% efficiency improvement",
    timestamp: "15 min ago",
    route: "R1",
    resolved: false,
  },
  {
    id: 3,
    type: "critical",
    severity: "high",
    message: "Bus B004 fuel level below 20% - refueling required",
    timestamp: "5 min ago",
    route: "R1",
    resolved: false,
  },
]

const initialBusData = [
  {
    id: 1,
    number: "B001",
    route: "R1",
    passengers: 32,
    capacity: 50,
    speed: 35,
    fuel: 78,
    load: "medium",
    status: "On Time",
    nextStop: "Central Station",
    eta: "3 min",
    driver: "John Smith",
    location: { lat: 40.7128, lng: -74.006 },
    lastMaintenance: "2023-12-20",
    mileage: 45230,
    delay: 0,
  },
  {
    id: 2,
    number: "B002",
    route: "R2",
    passengers: 45,
    capacity: 50,
    speed: 28,
    fuel: 65,
    load: "high",
    status: "Delayed",
    nextStop: "Park Avenue",
    eta: "7 min",
    driver: "Sarah Johnson",
    location: { lat: 40.7589, lng: -73.9851 },
    lastMaintenance: "2023-12-25",
    mileage: 52100,
    delay: 5,
  },
  {
    id: 3,
    number: "B003",
    route: "R3",
    passengers: 18,
    capacity: 45,
    speed: 42,
    fuel: 89,
    load: "low",
    status: "On Time",
    nextStop: "University Campus",
    eta: "2 min",
    driver: "Mike Wilson",
    location: { lat: 40.7282, lng: -73.7949 },
    lastMaintenance: "2024-01-01",
    mileage: 38900,
    delay: 0,
  },
  {
    id: 4,
    number: "B004",
    route: "R1",
    passengers: 41,
    capacity: 50,
    speed: 31,
    fuel: 72,
    load: "high",
    status: "On Time",
    nextStop: "Shopping Mall",
    eta: "5 min",
    driver: "Emma Davis",
    location: { lat: 40.7505, lng: -73.9934 },
    lastMaintenance: "2023-12-15",
    mileage: 61200,
    delay: 0,
  },
  {
    id: 5,
    number: "B005",
    route: "R4",
    passengers: 28,
    capacity: 45,
    speed: 38,
    fuel: 84,
    load: "medium",
    status: "On Time",
    nextStop: "Tech Park",
    eta: "4 min",
    driver: "Alex Rodriguez",
    location: { lat: 40.7831, lng: -73.9712 },
    lastMaintenance: "2024-01-05",
    mileage: 42800,
    delay: 0,
  },
  {
    id: 6,
    number: "B006",
    route: "R5",
    passengers: 15,
    capacity: 40,
    speed: 45,
    fuel: 91,
    load: "low",
    status: "Early",
    nextStop: "Airport Terminal",
    eta: "8 min",
    driver: "Lisa Chen",
    delay: -2,
    location: { lat: 40.6892, lng: -74.1745 },
    lastMaintenance: "2024-01-03",
    mileage: 35600,
  },
  {
    id: 7,
    number: "B007",
    route: "R2",
    passengers: 39,
    capacity: 50,
    speed: 33,
    fuel: 67,
    load: "high",
    status: "On Time",
    nextStop: "Medical Center",
    eta: "6 min",
    driver: "Robert Kim",
    delay: 1,
    location: { lat: 40.7614, lng: -73.9776 },
    lastMaintenance: "2023-12-28",
    mileage: 48900,
  },
  {
    id: 8,
    number: "B008",
    route: "R3",
    passengers: 22,
    capacity: 45,
    speed: 40,
    fuel: 76,
    load: "low",
    status: "On Time",
    nextStop: "Sports Complex",
    eta: "3 min",
    driver: "Maria Santos",
    delay: 0,
    location: { lat: 40.7489, lng: -73.9857 },
    lastMaintenance: "2024-01-02",
    mileage: 41200,
  },
  {
    id: 9,
    number: "B009",
    route: "R6",
    passengers: 36,
    capacity: 50,
    speed: 29,
    fuel: 58,
    load: "medium",
    status: "Delayed",
    nextStop: "Industrial Zone",
    eta: "9 min",
    driver: "James Thompson",
    delay: 4,
    location: { lat: 40.6782, lng: -73.9442 },
    lastMaintenance: "2023-12-18",
    mileage: 55700,
  },
  {
    id: 10,
    number: "B010",
    route: "R4",
    passengers: 44,
    capacity: 50,
    speed: 26,
    fuel: 63,
    load: "high",
    status: "Delayed",
    nextStop: "Convention Center",
    eta: "11 min",
    driver: "Jennifer Lee",
    delay: 6,
    location: { lat: 40.7505, lng: -73.9934 },
    lastMaintenance: "2023-12-22",
    mileage: 49800,
  },
  {
    id: 11,
    number: "B011",
    route: "R7",
    passengers: 19,
    capacity: 40,
    speed: 44,
    fuel: 88,
    load: "low",
    status: "On Time",
    nextStop: "Riverside Park",
    eta: "5 min",
    driver: "Michael Brown",
    delay: 0,
    location: { lat: 40.7829, lng: -73.9654 },
    lastMaintenance: "2024-01-04",
    mileage: 37400,
  },
  {
    id: 12,
    number: "B012",
    route: "R8",
    passengers: 31,
    capacity: 45,
    speed: 37,
    fuel: 74,
    load: "medium",
    status: "On Time",
    nextStop: "Financial District",
    eta: "7 min",
    driver: "Amanda White",
    delay: 0,
    location: { lat: 40.7074, lng: -74.0113 },
    lastMaintenance: "2023-12-30",
    mileage: 44600,
  },
  {
    id: 13,
    number: "B013",
    route: "R1",
    passengers: 47,
    capacity: 50,
    speed: 24,
    fuel: 69,
    load: "high",
    status: "Delayed",
    nextStop: "City Hall",
    eta: "12 min",
    driver: "David Garcia",
    delay: 7,
    location: { lat: 40.7128, lng: -74.006 },
    lastMaintenance: "2023-12-16",
    mileage: 53200,
  },
  {
    id: 14,
    number: "B014",
    route: "R9",
    passengers: 26,
    capacity: 40,
    speed: 41,
    fuel: 82,
    load: "medium",
    status: "On Time",
    nextStop: "Library Square",
    eta: "4 min",
    driver: "Sarah Martinez",
    delay: 0,
    location: { lat: 40.7549, lng: -73.984 },
    lastMaintenance: "2024-01-01",
    mileage: 39800,
  },
]

const extendedBusData = [
  ...initialBusData,
  {
    id: "BUS-007",
    route: "R4",
    passengers: 28,
    capacity: 45,
    speed: 42,
    fuel: 78,
    status: "On Route",
    nextStop: "Tech Park",
    eta: "8 min",
    load: "medium",
    driver: "Sarah Wilson",
    gps: { lat: 12.9716, lng: 77.5946 },
  },
  {
    id: "BUS-008",
    route: "R5",
    passengers: 15,
    capacity: 40,
    speed: 35,
    fuel: 65,
    status: "At Stop",
    nextStop: "Airport",
    eta: "2 min",
    load: "low",
    driver: "Mike Johnson",
    gps: { lat: 12.9716, lng: 77.5946 },
  },
]

const enhancedAlerts = [
  ...initialAlerts,
  {
    id: 6,
    type: "info",
    severity: "low",
    message: "Route R4 experiencing light traffic - ETA updated",
    timestamp: "5 min ago",
    route: "R4",
    resolved: false,
  },
  {
    id: 7,
    type: "warning",
    severity: "medium",
    message: "Bus BUS-008 fuel level at 65% - refuel recommended",
    timestamp: "8 min ago",
    route: "R5",
    resolved: false,
  },
  {
    id: 8,
    type: "success",
    severity: "low",
    message: "Peak hour optimization completed - 15% efficiency gain",
    timestamp: "12 min ago",
    route: "All",
    resolved: false,
  },
]

const contextualData = {
  weather: {
    condition: "Partly Cloudy",
    temperature: "28°C",
    humidity: "65%",
    windSpeed: "12 km/h",
    impact: "Minimal impact on operations",
  },
  traffic: {
    overall: "Moderate",
    incidents: 2,
    avgDelay: "3.2 min",
    peakHours: "8-10 AM, 5-7 PM",
  },
  systemHealth: {
    uptime: "99.8%",
    activeVehicles: 8,
    totalRoutes: 5,
    avgFuelLevel: "72%",
  },
}

// Generate maintenance data from real bus data
const generateMaintenanceData = (buses: any[]) => {
  return buses.map((bus) => {
    const mileage = Math.floor(Math.random() * 50000) + 30000
    const daysSinceService = Math.floor(Math.random() * 90)
    const nextServiceDate = new Date()
    nextServiceDate.setDate(nextServiceDate.getDate() + (90 - daysSinceService))
    
    let condition = "Good"
    let priority = "Low"
    
    if (mileage > 60000) {
      condition = "Needs Attention"
      priority = "High"
    } else if (mileage > 50000) {
      condition = "Fair"
      priority = "Medium"
    } else {
      condition = "Excellent"
      priority = "Low"
    }
    
    return {
      busId: bus.route_number || `BUS-${bus.id.slice(0, 3)}`,
      nextService: nextServiceDate.toISOString().split('T')[0],
      mileage,
      condition,
      priority
    }
  })
}

// Generate driver performance data from real driver data
const generateDriverPerformance = (drivers: any[]) => {
  return drivers.filter(d => d.status === 'active').map((driver) => {
    const trips = Math.floor(Math.random() * 100) + 100
    const onTime = Math.floor(Math.random() * 20) + 80
    const fuelEff = (Math.random() * 2 + 7).toFixed(1)
    const incidents = Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0
    const rating = (4.5 + Math.random() * 0.5).toFixed(1)
    
    return {
      name: driver.full_name,
      rating: parseFloat(rating),
      trips,
      onTime,
      fuelEff: parseFloat(fuelEff),
      incidents
    }
  })
}

const demandForecast = [
  { time: "6 AM", demand: 15, predicted: 18 },
  { time: "7 AM", demand: 35, predicted: 32 },
  { time: "8 AM", demand: 50, predicted: 48 },
  { time: "9 AM", demand: 42, predicted: 45 },
  { time: "10 AM", demand: 120, predicted: 115 },
  { time: "11 AM", demand: 95, predicted: 98 },
  { time: "12 PM", demand: 85, predicted: 88 },
  { time: "1 PM", demand: 78, predicted: 75 },
  { time: "2 PM", demand: 65, predicted: 68 },
  { time: "3 PM", demand: 72, predicted: 70 },
  { time: "4 PM", demand: 88, predicted: 85 },
  { time: "5 PM", demand: 110, predicted: 108 },
  { time: "6 PM", demand: 95, predicted: 92 },
  { time: "7 PM", demand: 75, predicted: 78 },
  { time: "8 PM", demand: 55, predicted: 58 },
  { time: "9 PM", demand: 35, predicted: 32 },
]

const utilizationData = [
  { name: "Route R1", value: 35, color: "#0891b2" },
  { name: "Route R2", value: 45, color: "#10b981" },
  { name: "Route R3", value: 20, color: "#6366f1" },
]

const performanceData = [
  { metric: "On-Time Performance", value: 87, target: 85 },
  { metric: "Passenger Satisfaction", value: 92, target: 90 },
  { metric: "Fuel Efficiency", value: 78, target: 80 },
  { metric: "Route Coverage", value: 95, target: 90 },
]

const scheduleData = [
  {
    route: "R1",
    departure: "06:00",
    arrival: "06:45",
    frequency: "15 min",
    status: "On Time",
    nextBus: "2 min",
    passengers: 28,
    capacity: 50,
  },
  {
    route: "R1",
    departure: "06:15",
    arrival: "07:00",
    frequency: "15 min",
    status: "Delayed",
    nextBus: "5 min",
    passengers: 42,
    capacity: 50,
  },
  {
    route: "R2",
    departure: "06:30",
    arrival: "07:20",
    frequency: "20 min",
    status: "On Time",
    nextBus: "8 min",
    passengers: 35,
    capacity: 45,
  },
  {
    route: "R2",
    departure: "06:50",
    arrival: "07:40",
    frequency: "20 min",
    status: "Early",
    nextBus: "12 min",
    passengers: 18,
    capacity: 45,
  },
  {
    route: "R3",
    departure: "07:00",
    arrival: "07:35",
    frequency: "25 min",
    status: "On Time",
    nextBus: "3 min",
    passengers: 31,
    capacity: 40,
  },
]

const passengerAnalytics = [
  { station: "Central Station", boardings: 245, alightings: 189, waiting: 12, avgWait: "4.2 min" },
  { station: "Park Avenue", boardings: 198, alightings: 156, waiting: 8, avgWait: "3.8 min" },
  { station: "University Campus", boardings: 167, alightings: 203, waiting: 15, avgWait: "5.1 min" },
  { station: "Shopping Mall", boardings: 134, alightings: 98, waiting: 6, avgWait: "2.9 min" },
  { station: "Business District", boardings: 289, alightings: 234, waiting: 18, avgWait: "6.3 min" },
  { station: "Hospital", boardings: 87, alightings: 112, waiting: 4, avgWait: "3.2 min" },
]

const liveTrackingData = [
  {
    busId: "B001",
    route: "R1",
    currentStop: "Central Station",
    nextStop: "Park Avenue",
    eta: "3 min",
    passengers: 32,
    capacity: 50,
    speed: 35,
    delay: 0,
    driver: "John Smith",
    fuel: 78,
    temperature: 22,
    coordinates: { lat: 40.7128, lng: -74.006 },
  },
  {
    busId: "B002",
    route: "R2",
    currentStop: "University Campus",
    nextStop: "Shopping Mall",
    eta: "7 min",
    passengers: 45,
    capacity: 50,
    speed: 28,
    delay: 5,
    driver: "Sarah Johnson",
    fuel: 65,
    temperature: 24,
    coordinates: { lat: 40.7589, lng: -73.9851 },
  },
]

const detailedAnalytics = {
  ridership: [
    { hour: "06:00", passengers: 45, revenue: 135 },
    { hour: "07:00", passengers: 89, revenue: 267 },
    { hour: "08:00", passengers: 156, revenue: 468 },
    { hour: "09:00", passengers: 134, revenue: 402 },
    { hour: "10:00", passengers: 98, revenue: 294 },
    { hour: "11:00", passengers: 76, revenue: 228 },
    { hour: "12:00", passengers: 112, revenue: 336 },
  ],
  efficiency: [
    { route: "R1", onTime: 87, fuelEff: 12.5, satisfaction: 4.2 },
    { route: "R2", onTime: 92, fuelEff: 11.8, satisfaction: 4.5 },
    { route: "R3", onTime: 78, fuelEff: 13.2, satisfaction: 3.9 },
  ],
}

const weatherData = {
  temperature: "24°C",
  condition: "Partly Cloudy",
  humidity: "65%",
  windSpeed: "12 km/h",
  visibility: "10 km",
}

const trafficData = {
  overall: "Moderate",
  mainRoutes: [
    { name: "MG Road", status: "Heavy", delay: "8 min" },
    { name: "Brigade Road", status: "Light", delay: "2 min" },
    { name: "Commercial St", status: "Moderate", delay: "5 min" },
  ],
}

const systemHealth = {
  servers: "99.8%",
  gps: "100%",
  payment: "98.5%",
  communication: "99.2%",
}

const passengerDemandData = [
  { time: "06:00", passengers: 150 },
  { time: "07:00", passengers: 350 },
  { time: "08:00", passengers: 500 },
  { time: "09:00", passengers: 420 },
  { time: "10:00", passengers: 380 },
  { time: "11:00", passengers: 250 },
  { time: "12:00", passengers: 300 },
  { time: "13:00", passengers: 280 },
  { time: "14:00", passengers: 250 },
  { time: "15:00", passengers: 320 },
  { time: "16:00", passengers: 480 },
  { time: "17:00", passengers: 550 },
  { time: "18:00", passengers: 450 },
  { time: "19:00", passengers: 350 },
  { time: "20:00", passengers: 250 },
  { time: "21:00", passengers: 150 },
]

const routeUtilizationData = [
  { name: "Route A", value: 350, color: "#0088FE" },
  { name: "Route B", value: 250, color: "#00C49F" },
  { name: "Route C", value: 180, color: "#FFBB28" },
  { name: "Route D", value: 220, color: "#FF8042" },
]

function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedBus, setSelectedBus] = useState<any>(null)
  const [selectedRoute, setSelectedRoute] = useState<string>("All")
  const [timeframe, setTimeframe] = useState<string>("Today")
  const [searchTerm, setSearchTerm] = useState("")
  const [busData, setBusData] = useState<any[]>([])
  const [routeData, setRouteData] = useState<any[]>([])
  const [scheduleData, setScheduleData] = useState<any[]>([])
  const [driverData, setDriverData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<"admin" | "user">("user")
  const [isEditing, setIsEditing] = useState(false)
  const [editingBus, setEditingBus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [busStats, setBusStats] = useState<any>(null)
  const [routeStats, setRouteStats] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleLogin = (role: "admin" | "user") => {
    setIsLoggedIn(true)
    setUserRole(role)
  }

  // Load data from Supabase when component mounts
  useEffect(() => {
    if (!isLoggedIn) return
    
    loadDashboardData()
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadDashboardData()
      setLastUpdate(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [isLoggedIn])

  const loadData = async () => {
    console.log('🔄 Dashboard - Loading data...')
    setIsLoading(true)
    setError(null)
    
    try {
      const [buses, routes, schedules, drivers] = await Promise.all([
        db.getBuses(),
        db.getRoutes(),
        db.getSchedules(),
        db.getDrivers()
      ])
      
      console.log('✅ Buses loaded:', buses?.length || 0)
      console.log('✅ Routes loaded:', routes?.length || 0)
      console.log('✅ Schedules loaded:', schedules?.length || 0)
      console.log('✅ Drivers loaded:', drivers?.length || 0)
      
      setBusData(buses || [])
      setRouteData(routes || [])
      setScheduleData(schedules || [])
      setDriverData(drivers || [])
      console.log('🎉 Data loaded successfully')
    } catch (error: any) {
      console.error('❌ Failed to load data:', error)
      setError(`Failed to load data: ${error.message}`)
      setBusData([])
      setRouteData([])
      setScheduleData([])
      setDriverData([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [buses, routes, busStatistics, routeStatistics] = await Promise.all([
        db.getBuses(),
        db.getRoutes(),
        db.getBusStatistics(),
        db.getRouteStatistics()
      ])
      
      // Transform Supabase data to match existing component structure
      const transformedBuses = buses.map((bus: any) => ({
        id: bus.id,
        number: bus.bus_number, // Use bus_number instead of route_number
        route: bus.route_number,
        passengers: Math.floor(Math.random() * bus.capacity * 0.8) + 5, // Simulate passenger count
        capacity: bus.capacity,
        speed: Math.floor(Math.random() * 30) + 25, // Simulate speed
        fuel: Math.floor(Math.random() * 40) + 60, // Simulate fuel level
        load: bus.status === 'active' ? (Math.random() > 0.5 ? 'medium' : 'low') : 'low',
        status: bus.status === 'active' ? 'On Time' : bus.status === 'maintenance' ? 'Maintenance' : 'Inactive',
        nextStop: bus.current_location,
        eta: Math.floor(Math.random() * 10) + 2 + ' min',
        driver: 'Driver ' + bus.route_number,
        location: { lat: 40.7128 + (Math.random() - 0.5) * 0.1, lng: -74.006 + (Math.random() - 0.5) * 0.1 },
        lastMaintenance: new Date(bus.updated_at).toLocaleDateString(),
        mileage: Math.floor(Math.random() * 50000) + 20000,
        delay: Math.floor(Math.random() * 10) - 2
      }))
      
      setBusData(transformedBuses)
      setRouteData(routes)
      setBusStats(busStatistics)
      setRouteStats(routeStatistics)
      
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
      // Fallback to mock data if Supabase fails
      setBusData(initialBusData)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setSelectedBus(null)
    setSelectedRoute("All")
    setSearchTerm("")
  }

  const handleOptimize = async () => {
    setIsOptimizing(true)
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const newAlert = {
      id: alerts.length + 1,
      type: "success",
      severity: "low",
      message: "AI optimization completed - Routes rebalanced for 12% efficiency improvement",
      timestamp: "Just now",
      route: "All",
      resolved: false,
    }

    setAlerts((prev) => [newAlert, ...prev])
    setIsOptimizing(false)
  }

  const handleAddBus = async () => {
    try {
      console.log('🚌 Starting add bus operation...')
      const routeNumber = `R${String(busData.length + 1).padStart(2, "0")}`
      
      // Generate unique bus names
      const busNames = [
        'Ocean Breeze', 'Mountain View', 'City Star', 'Golden Arrow', 'Silver Line',
        'Blue Wave', 'Green Valley', 'Red Phoenix', 'Purple Rain', 'Orange Sunset',
        'Thunder Bolt', 'Lightning Fast', 'Wind Runner', 'Storm Chaser', 'Sky Rider',
        'River Flow', 'Forest Trail', 'Desert Wind', 'Arctic Express', 'Tropical Cruise'
      ]
      
      const usedNames = busData.map(bus => bus.number)
      const availableNames = busNames.filter(name => !usedNames.includes(name))
      const busName = availableNames.length > 0 ? availableNames[0] : `Bus ${Date.now()}`
      
      // Create new bus in database
      const newBusData = {
        route_number: routeNumber,
        bus_number: busName,
        capacity: 50,
        status: 'active' as const,
        current_location: `Stop ${Math.floor(Math.random() * 20) + 1}`
      }
      
      console.log('📤 Sending to database:', newBusData)
      const savedBus = await db.addBus(newBusData)
      console.log('✅ Database response:', savedBus)
      
      if (!savedBus || !savedBus.id) {
        throw new Error('No bus data returned from database')
      }
      
      // Add to local state immediately for instant feedback
      const newBus = {
        id: savedBus.id,
        number: savedBus.bus_number,
        route: savedBus.route_number,
        status: "active",
        passengers: Math.floor(Math.random() * 30) + 10,
        capacity: savedBus.capacity,
        speed: Math.floor(Math.random() * 30) + 20,
        fuel: Math.floor(Math.random() * 50) + 50,
        load: "low",
        driver: "Driver " + (busData.length + 1),
        nextStop: savedBus.current_location,
        eta: Math.floor(Math.random() * 10) + 2 + ' min',
        location: { lat: 23.0225 + (Math.random() - 0.5) * 0.1, lng: 72.5714 + (Math.random() - 0.5) * 0.1 },
        lastMaintenance: new Date().toLocaleDateString(),
        mileage: Math.floor(Math.random() * 50000) + 10000,
        delay: 0
      }
      
      setBusData([...busData, newBus])
      console.log('🎉 Bus added successfully! Check Supabase dashboard.')
      setError(`Bus "${busName}" added successfully! Check Supabase dashboard.`)
      setTimeout(() => setError(''), 5000)
      
    } catch (error) {
      console.error('❌ Error adding bus:', error)
      setError('Failed to add bus: ' + (error as any)?.message || 'Unknown error')
    }
  }

  const handleEditBus = (bus: any) => {
    setEditingBus({ ...bus })
    setIsEditing(true)
  }

  const handleSaveBus = async () => {
    try {
      console.log('🔄 Starting update bus operation...')
      console.log('📝 Editing bus data:', editingBus)
      
      const busId = typeof editingBus.id === 'number' ? editingBus.id.toString() : editingBus.id
      console.log('🆔 Using bus ID:', busId)
      
      const updateData = {
        bus_number: editingBus.number,
        route_number: editingBus.route,
        capacity: editingBus.capacity,
        current_location: editingBus.nextStop,
        status: editingBus.status
      }
      console.log('📤 Sending update to database:', updateData)
      
      const updatedBus = await db.updateBus(busId, updateData)
      console.log('✅ Database update response:', updatedBus)
      
      if (!updatedBus || !updatedBus.id) {
        throw new Error('No updated bus data returned from database')
      }
      
      // Update local state with actual database response
      setBusData(busData.map(bus => 
        bus.id === editingBus.id ? { 
          ...bus, 
          number: updatedBus.bus_number,
          route: updatedBus.route_number,
          capacity: updatedBus.capacity,
          nextStop: updatedBus.current_location,
          status: updatedBus.status
        } : bus
      ))
      
      setIsEditing(false)
      setEditingBus(null)
      
      console.log('🎉 Bus updated successfully! Check Supabase dashboard.')
      setError(`Bus "${updatedBus.bus_number}" updated successfully! Check Supabase dashboard.`)
      setTimeout(() => setError(''), 5000)
      
      // Refresh data to ensure consistency
      console.log('🔄 Refreshing dashboard data...')
      await loadDashboardData()
      console.log('✅ Dashboard data refreshed')
      
    } catch (error) {
      console.error('❌ Error updating bus:', error)
      setError('Failed to update bus: ' + (error as any)?.message || 'Unknown error')
    }
  }

  const handleDeleteBus = async (busId: number) => {
    try {
      console.log('🗑️ Starting delete bus operation...')
      console.log('🆔 Deleting bus ID:', busId)
      
      // Find bus name for confirmation message
      const busToDelete = busData.find(bus => bus.id === busId)
      const busName = busToDelete?.number || 'Unknown Bus'
      
      // Delete bus from database
      await db.deleteBus(busId.toString())
      console.log('✅ Bus deleted from database')
      
      // Update local state
      setBusData(busData.filter(bus => bus.id !== busId))
      
      console.log('🎉 Bus deleted successfully! Check Supabase dashboard.')
      setError(`Bus "${busName}" deleted successfully! Check Supabase dashboard.`)
      setTimeout(() => setError(''), 5000)
      
    } catch (error) {
      console.error('❌ Error deleting bus:', error)
      setError('Failed to delete bus: ' + (error as any)?.message || 'Unknown error')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingBus(null)
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return "🚨"
      case "warning":
        return "⚠️"
      case "info":
        return "ℹ️"
      case "success":
        return "✅"
      default:
        return "🔔"
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-500 bg-red-50"
      case "medium":
        return "border-yellow-500 bg-yellow-50"
      case "low":
        return "border-blue-500 bg-blue-50"
      default:
        return "border-gray-500 bg-gray-50"
    }
  }

  const getBusColor = (load: string) => {
    switch (load) {
      case "low":
        return "bg-green-500 shadow-green-500/50"
      case "medium":
        return "bg-yellow-500 shadow-yellow-500/50"
      case "high":
        return "bg-red-500 shadow-red-500/50"
      default:
        return "bg-gray-500 shadow-gray-500/50"
    }
  }

  const getLoadPercentage = (passengers: number, capacity: number) => {
    return Math.round((passengers / capacity) * 100)
  }

  const filteredBuses = busData.filter(
    (bus) =>
      (selectedRoute === "All" || bus.route === selectedRoute) &&
      (searchTerm === "" ||
        bus.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.route.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const renderAdminPanel = () => {
    if (userRole !== "admin") return null

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-emerald-600" />
            Admin Management Panel
          </h2>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
            <UserCheck className="h-4 w-4 mr-1" />
            Admin Access
          </Badge>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="buses">Buses</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="buses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Bus Fleet Management</h3>
              <Button onClick={handleAddBus} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add New Bus
              </Button>
            </div>

            <div className="grid gap-4">
              {busData.map((bus) => (
                <Card key={bus.id} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                        <div>
                          <Label className="text-sm font-medium">Bus Number</Label>
                          {isEditing && editingBus?.id === bus.id ? (
                            <Input
                              value={editingBus.number}
                              onChange={(e) => setEditingBus({ ...editingBus, number: e.target.value })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-lg font-semibold">{bus.number}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Route</Label>
                          {isEditing && editingBus?.id === bus.id ? (
                            <Input
                              value={editingBus.route}
                              onChange={(e) => setEditingBus({ ...editingBus, route: e.target.value })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-sm">{bus.route}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Driver</Label>
                          {isEditing && editingBus?.id === bus.id ? (
                            <Input
                              value={editingBus.driver}
                              onChange={(e) => setEditingBus({ ...editingBus, driver: e.target.value })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-sm">{bus.driver}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Status</Label>
                          {isEditing && editingBus?.id === bus.id ? (
                            <Select
                              value={editingBus.status}
                              onValueChange={(value) => setEditingBus({ ...editingBus, status: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant={bus.status === "active" ? "default" : "secondary"}>{bus.status}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {isEditing && editingBus?.id === bus.id ? (
                          <>
                            <Button size="sm" onClick={handleSaveBus} className="bg-green-600 hover:bg-green-700">
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              <Cancel className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleEditBus(bus)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteBus(bus.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Passengers</p>
                        <p className="text-lg font-semibold">
                          {bus.passengers}/{bus.capacity}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Fuel Level</p>
                        <p className="text-lg font-semibold">{bus.fuel}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Speed</p>
                        <p className="text-lg font-semibold">{bus.speed} km/h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="routes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Route Management</h3>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add New Route
              </Button>
            </div>
            <div className="grid gap-4">
              {Array.from(new Set(busData.map((bus) => bus.route))).map((route, index) => (
                <Card key={index} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{route}</h4>
                        <p className="text-sm text-muted-foreground">
                          {busData.filter((bus) => bus.route === route).length} buses assigned
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <ScheduleManager />
          </TabsContent>

          <TabsContent value="drivers" className="space-y-4">
            <DriverManager />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "admin":
        return renderAdminPanel()
      case "live-tracking":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Live Bus Tracking</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    Weather Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Condition:</span>
                      <span className="font-medium">{contextualData.weather.condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temperature:</span>
                      <span className="font-medium">{contextualData.weather.temperature}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">{contextualData.weather.impact}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Traffic Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Overall:</span>
                      <Badge variant="outline">{contextualData.traffic.overall}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Incidents:</span>
                      <span className="font-medium">{contextualData.traffic.incidents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Delay:</span>
                      <span className="font-medium">{contextualData.traffic.avgDelay}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span className="font-medium text-green-600">{contextualData.systemHealth.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Buses:</span>
                      <span className="font-medium">{contextualData.systemHealth.activeVehicles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Fuel:</span>
                      <span className="font-medium">{contextualData.systemHealth.avgFuelLevel}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Enhanced Map */}
              <div className="lg:col-span-2">
                <Card className="h-[600px]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Navigation className="h-5 w-5" />
                      Real-time Bus Locations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full">
                    {/* Enhanced map with more details */}
                    <div className="relative w-full h-[480px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden border">
                      {/* Enhanced map background */}
                      <div className="absolute inset-0">
                        {/* Water bodies */}
                        <div className="absolute top-10 right-10 w-32 h-20 bg-blue-200/60 rounded-full"></div>
                        <div className="absolute bottom-20 left-16 w-24 h-16 bg-blue-200/60 rounded-lg"></div>

                        {/* Parks */}
                        <div className="absolute top-32 left-20 w-28 h-24 bg-green-200/50 rounded-lg"></div>
                        <div className="absolute bottom-32 right-24 w-36 h-28 bg-green-200/50 rounded-full"></div>

                        {/* Buildings */}
                        <div className="absolute top-16 left-32 w-20 h-16 bg-gray-300/40 rounded"></div>
                        <div className="absolute top-40 right-32 w-24 h-20 bg-gray-300/40 rounded"></div>
                        <div className="absolute bottom-40 left-40 w-28 h-24 bg-gray-300/40 rounded"></div>
                      </div>

                      {/* Street network */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Major roads */}
                        <line x1="0" y1="45" x2="100" y2="45" stroke="#FCD34D" strokeWidth="3" opacity="0.9" />
                        <line x1="45" y1="0" x2="45" y2="100" stroke="#FCD34D" strokeWidth="3" opacity="0.9" />

                        {/* Secondary roads */}
                        <line x1="0" y1="25" x2="100" y2="25" stroke="#6B7280" strokeWidth="4" opacity="0.8" />
                        <line x1="0" y1="25" x2="100" y2="25" stroke="#FFFFFF" strokeWidth="2" opacity="0.9" />
                        <line x1="0" y1="65" x2="100" y2="65" stroke="#6B7280" strokeWidth="4" opacity="0.8" />
                        <line x1="0" y1="65" x2="100" y2="65" stroke="#FFFFFF" strokeWidth="2" opacity="0.9" />
                        <line x1="25" y1="0" x2="25" y2="100" stroke="#6B7280" strokeWidth="4" opacity="0.8" />
                        <line x1="25" y1="0" x2="25" y2="100" stroke="#FFFFFF" strokeWidth="2" opacity="0.9" />
                        <line x1="70" y1="0" x2="70" y2="100" stroke="#6B7280" strokeWidth="4" opacity="0.8" />
                        <line x1="70" y1="0" x2="70" y2="100" stroke="#FFFFFF" strokeWidth="2" opacity="0.9" />

                        {/* Bus routes */}
                        <path
                          d="M 5 20 Q 25 30 45 25 Q 65 20 95 30"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="4"
                          opacity="0.8"
                          strokeDasharray="8,4"
                        />
                        <path
                          d="M 10 50 Q 30 40 50 55 Q 70 60 90 50"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="4"
                          opacity="0.8"
                          strokeDasharray="8,4"
                        />
                        <path
                          d="M 15 75 Q 35 65 55 70 Q 75 75 85 80"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="4"
                          opacity="0.8"
                          strokeDasharray="8,4"
                        />
                      </svg>

                      {/* Bus stop markers */}
                      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-lg"></div>
                      <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-lg"></div>
                      <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-lg"></div>
                      <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-lg"></div>

                      {/* Enhanced bus markers with detailed info */}
                      {busData.map((bus, index) => (
                        <div
                          key={bus.id}
                          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110 ${
                            selectedBus?.id === bus.id ? "z-20 scale-125" : "z-10"
                          }`}
                          style={{
                            left: `${25 + index * 20}%`,
                            top: `${30 + index * 15}%`,
                          }}
                          onClick={() => setSelectedBus(selectedBus?.id === bus.id ? null : bus)}
                        >
                          <div className="relative">
                            <div
                              className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold ${
                                bus.load === "high"
                                  ? "bg-red-500"
                                  : bus.load === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                            >
                              <Bus className="h-4 w-4" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>

                            {/* Detailed popup */}
                            {selectedBus?.id === bus.id && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-xl border p-3 min-w-[200px] z-30">
                                <div className="text-sm space-y-2">
                                  <div className="font-semibold text-center border-b pb-1">
                                    {bus.id} - Route {bus.route}
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      Passengers:{" "}
                                      <span className="font-medium">
                                        {bus.passengers}/{bus.capacity}
                                      </span>
                                    </div>
                                    <div>
                                      Speed: <span className="font-medium">{bus.speed} km/h</span>
                                    </div>
                                    <div>
                                      Fuel: <span className="font-medium">{bus.fuel}%</span>
                                    </div>
                                    <div>
                                      Status: <span className="font-medium">{bus.status}</span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-center pt-1 border-t">
                                    Next: {bus.nextStop} ({bus.eta})
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Live Tracking Details */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Active Buses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                    {liveTrackingData.map((bus) => (
                      <div key={bus.busId} className="p-3 border rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{bus.busId}</span>
                          <Badge variant={bus.delay > 0 ? "destructive" : "default"}>Route {bus.route}</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <div>Driver: {bus.driver}</div>
                          <div>Current: {bus.currentStop}</div>
                          <div>
                            Next: {bus.nextStop} ({bus.eta})
                          </div>
                          <div className="flex justify-between">
                            <span>
                              Load: {bus.passengers}/{bus.capacity}
                            </span>
                            <span>Fuel: {bus.fuel}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              bus.passengers / bus.capacity > 0.8
                                ? "bg-red-500"
                                : bus.passengers / bus.capacity > 0.6
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{ width: `${(bus.passengers / bus.capacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case "analytics":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <div className="flex gap-2">
                <select className="px-3 py-2 border rounded-md">
                  <option>Last 24 Hours</option>
                  <option>Last Week</option>
                  <option>Last Month</option>
                </select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="maintenance">Vehicle Maintenance</TabsTrigger>
                <TabsTrigger value="performance">Driver Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Vehicle Maintenance Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {generateMaintenanceData(busData).map((vehicle: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold">{vehicle.busId}</span>
                              <Badge
                                variant={
                                  vehicle.priority === "High"
                                    ? "destructive"
                                    : vehicle.priority === "Medium"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {vehicle.priority}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <div className="text-muted-foreground">Next Service</div>
                                <div className="font-medium">{vehicle.nextService}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Mileage</div>
                                <div className="font-medium">{vehicle.mileage.toLocaleString()} km</div>
                              </div>
                            </div>
                            <div className="mt-2 text-xs">
                              Condition: <span className="font-medium">{vehicle.condition}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Driver Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {generateDriverPerformance(driverData).map((driver: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold">{driver.name}</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{driver.rating}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <div className="text-muted-foreground">Trips</div>
                                <div className="font-medium">{driver.trips}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">On-Time %</div>
                                <div className="font-medium">{driver.onTime}%</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Fuel Eff.</div>
                                <div className="font-medium">{driver.fuelEff} km/l</div>
                              </div>
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Incidents: {driver.incidents}</span>
                              <Badge variant={driver.incidents === 0 ? "secondary" : "destructive"} className="text-xs">
                                {driver.incidents === 0
                                  ? "Clean Record"
                                  : `${driver.incidents} Incident${driver.incidents > 1 ? "s" : ""}`}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="maintenance">
                <MaintenanceManager />
              </TabsContent>

              <TabsContent value="performance">
                <DriverRatingManager />
              </TabsContent>
            </Tabs>
          </div>
        )

      case "alerts":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">System Alerts</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  Mark All Read
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {alerts.map((alert) => (
                  <Alert key={alert.id} className={`${getAlertColor(alert.severity)} transition-all duration-300`}>
                    <AlertDescription className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">{getAlertIcon(alert.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {alert.route}
                          </Badge>
                          <Badge
                            variant={
                              alert.severity === "high"
                                ? "destructive"
                                : alert.severity === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Alert Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Critical</span>
                      <Badge variant="destructive">{alerts.filter((a: any) => a.severity === "high").length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Warning</span>
                      <Badge variant="default">{alerts.filter((a: any) => a.severity === "medium").length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Info</span>
                      <Badge variant="secondary">{alerts.filter((a: any) => a.severity === "low").length}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case "schedules":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Bus Schedules</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Schedule
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Real-time schedule with live updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Route</th>
                        <th className="text-left p-2">Departure</th>
                        <th className="text-left p-2">Arrival</th>
                        <th className="text-left p-2">Frequency</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Next Bus</th>
                        <th className="text-left p-2">Load</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleData.map((schedule, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <Badge variant="outline">{schedule.route}</Badge>
                          </td>
                          <td className="p-2 font-mono">{schedule.departure}</td>
                          <td className="p-2 font-mono">{schedule.arrival}</td>
                          <td className="p-2">{schedule.frequency}</td>
                          <td className="p-2">
                            <Badge
                              variant={
                                schedule.status === "On Time"
                                  ? "default"
                                  : schedule.status === "Delayed"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {schedule.status}
                            </Badge>
                          </td>
                          <td className="p-2">{schedule.nextBus}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    schedule.passengers / schedule.capacity > 0.8
                                      ? "bg-red-500"
                                      : schedule.passengers / schedule.capacity > 0.6
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                  }`}
                                  style={{ width: `${(schedule.passengers / schedule.capacity) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">
                                {schedule.passengers}/{schedule.capacity}
                              </span>
                            </div>
                          </td>
                          <td className="p-2">
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "passengers":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Passenger Analytics</h2>
              <div className="flex gap-2">
                <select className="px-3 py-2 border rounded-md">
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Station Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Station Activity</CardTitle>
                  <CardDescription>Boarding and alighting data by station</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {passengerAnalytics.map((station, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold">{station.station}</h4>
                          <Badge variant="outline">{station.waiting} waiting</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Boardings</div>
                            <div className="font-semibold text-green-600">{station.boardings}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Alightings</div>
                            <div className="font-semibold text-blue-600">{station.alightings}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">Avg. wait time: {station.avgWait}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Passenger Flow Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Passenger Flow Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      boardings: { label: "Boardings", color: "hsl(var(--chart-1))" },
                      alightings: { label: "Alightings", color: "hsl(var(--chart-2))" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={passengerAnalytics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="station" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="boardings" fill="var(--color-boardings)" />
                        <Bar dataKey="alightings" fill="var(--color-alightings)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="glass-card hover-lift">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-blue-500" />
                    Weather Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{weatherData.temperature}</span>
                    <span className="text-sm text-muted-foreground">{weatherData.condition}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Humidity: {weatherData.humidity}</div>
                    <div>Wind: {weatherData.windSpeed}</div>
                    <div>Visibility: {weatherData.visibility}</div>
                    <div className="text-green-600 font-medium">Optimal</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-orange-500" />
                    Traffic Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Overall: {trafficData.overall}</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      Live
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {trafficData.mainRoutes.map((route, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{route.name}</span>
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              route.status === "Heavy"
                                ? "bg-red-100 text-red-700"
                                : route.status === "Moderate"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {route.status}
                          </span>
                          <span className="text-muted-foreground">+{route.delay}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {Object.entries(systemHealth).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="capitalize text-sm">{key.replace(/([A-Z])/g, " $1")}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: value }}></div>
                          </div>
                          <span className="text-sm font-medium text-green-600">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card className="glass-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
                  <Bus className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">24/25</div>
                  <p className="text-xs text-muted-foreground">96% fleet utilization</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">All systems operational</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Passengers</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">8,247</div>
                  <p className="text-xs text-muted-foreground">+15.2% vs yesterday</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">Peak: 9:30 AM</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">₹45,231</div>
                  <p className="text-xs text-muted-foreground">Target: ₹50,000</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "90.5%" }}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">4.2 min</div>
                  <p className="text-xs text-muted-foreground">-1.3 min improvement</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingDown className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">Optimized</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
                  <Zap className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">94.2%</div>
                  <p className="text-xs text-muted-foreground">AI optimization active</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs">Excellent performance</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Passenger Demand Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={passengerDemandData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="passengers"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    Route Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChartComponent>
                      <Pie
                        data={routeUtilizationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {routeUtilizationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                    </PieChartComponent>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex">
      {/* Sidebar */}
      <aside
        className={`glass-sidebar w-80 p-6 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative z-40 h-full`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Smart Bus System</h1>
              <p className="text-xs text-slate-600">AI-Powered Management</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="space-y-3 flex-1">
          <Button
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            className={`w-full justify-start gap-3 h-12 rounded-xl font-medium hover-lift transition-all duration-200 ${
              activeTab === "dashboard"
                ? "bg-emerald-600 text-white shadow-lg hover:bg-emerald-700"
                : "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 bg-white/50"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <BarChart3 className="h-5 w-5" />
            Dashboard
          </Button>

          {userRole === "admin" && (
            <Button
              variant={activeTab === "admin" ? "default" : "ghost"}
              className={`w-full justify-start gap-3 h-12 rounded-xl font-medium hover-lift transition-all duration-200 ${
                activeTab === "admin"
                  ? "bg-emerald-600 text-white shadow-lg hover:bg-emerald-700"
                  : "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 bg-white/50"
              }`}
              onClick={() => setActiveTab("admin")}
            >
              <Settings className="h-5 w-5" />
              Admin Panel
              <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-700">
                Admin
              </Badge>
            </Button>
          )}

          <Button
            variant={activeTab === "live-tracking" ? "default" : "ghost"}
            className={`w-full justify-start gap-3 h-12 rounded-xl font-medium hover-lift transition-all duration-200 ${
              activeTab === "live-tracking"
                ? "bg-emerald-600 text-white shadow-lg hover:bg-emerald-700"
                : "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 bg-white/50"
            }`}
            onClick={() => setActiveTab("live-tracking")}
          >
            <MapPin className="h-5 w-5" />
            Live Tracking
          </Button>
          <Button
            variant={activeTab === "analytics" ? "default" : "ghost"}
            className={`w-full justify-start gap-3 h-12 rounded-xl font-medium hover-lift transition-all duration-200 ${
              activeTab === "analytics"
                ? "bg-emerald-600 text-white shadow-lg hover:bg-emerald-700"
                : "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 bg-white/50"
            }`}
            onClick={() => setActiveTab("analytics")}
          >
            <TrendingUp className="h-5 w-5" />
            Analytics
          </Button>
          <Button
            variant={activeTab === "alerts" ? "default" : "ghost"}
            className={`w-full justify-start gap-3 h-12 rounded-xl font-medium hover-lift transition-all duration-200 ${
              activeTab === "alerts"
                ? "bg-emerald-600 text-white shadow-lg hover:bg-emerald-700"
                : "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 bg-white/50"
            }`}
            onClick={() => setActiveTab("alerts")}
          >
            <AlertTriangle className="h-5 w-5" />
            Alerts
            <Badge variant="secondary" className="ml-auto bg-red-100 text-red-700 border-red-200">
              {alerts.filter((a: any) => !a.resolved).length}
            </Badge>
          </Button>
          <Button
            variant={activeTab === "schedules" ? "default" : "ghost"}
            className={`w-full justify-start gap-3 h-12 rounded-xl font-medium hover-lift transition-all duration-200 ${
              activeTab === "schedules"
                ? "bg-emerald-600 text-white shadow-lg hover:bg-emerald-700"
                : "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 bg-white/50"
            }`}
            onClick={() => setActiveTab("schedules")}
          >
            <Clock className="h-5 w-5" />
            Schedules
          </Button>
          <Button
            variant={activeTab === "passengers" ? "default" : "ghost"}
            className={`w-full justify-start gap-3 h-12 rounded-xl font-medium hover-lift transition-all duration-200 ${
              activeTab === "passengers"
                ? "bg-emerald-600 text-white shadow-lg hover:bg-emerald-700"
                : "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 bg-white/50"
            }`}
            onClick={() => setActiveTab("passengers")}
          >
            <Users className="h-5 w-5" />
            Passengers
          </Button>
        </nav>

        <div className="border-t border-emerald-200/50 pt-6">
          <div className="mb-4 p-3 bg-white/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium">Logged in as:</span>
            </div>
            <Badge variant={userRole === "admin" ? "default" : "secondary"} className="capitalize">
              {userRole}
            </Badge>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>

          <div className="text-center text-slate-500 text-sm space-y-1 mt-4">
            <p className="font-medium">&copy; 2024 Smart Bus System</p>
            <p className="text-xs">AI-Powered Transit Management</p>
            <div className="flex justify-center gap-2 mt-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 space-y-8">{renderContent()}</main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}

export default function SmartBusDashboard() {
  return <Dashboard />
}
