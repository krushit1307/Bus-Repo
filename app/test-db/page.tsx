'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/database'

interface Bus {
  id: string
  route_number: string
  current_location: string
  status: 'active' | 'inactive' | 'maintenance'
  capacity: number
  created_at: string
  updated_at: string
}

interface Route {
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

export default function TestDatabase() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        setLoading(true)
        const [busesData, routesData] = await Promise.all([
          db.getBuses(),
          db.getRoutes()
        ])
        setBuses(busesData)
        setRoutes(routesData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Testing Supabase Connection...</h1>
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Connection Error</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Make sure you have:</p>
          <ul className="list-disc list-inside mt-2">
            <li>Added your Supabase URL and anon key to .env.local</li>
            <li>Created the database tables using the SQL schema</li>
            <li>Restarted your development server</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-green-600">✅ Supabase Connected Successfully!</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Buses Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Buses ({buses.length})</h2>
          <div className="space-y-3">
            {buses.map((bus) => (
              <div key={bus.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Route {bus.route_number}</h3>
                    <p className="text-gray-600">{bus.current_location}</p>
                    <p className="text-sm text-gray-500">Capacity: {bus.capacity}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    bus.status === 'active' ? 'bg-green-100 text-green-800' :
                    bus.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {bus.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Routes Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Routes ({routes.length})</h2>
          <div className="space-y-3">
            {routes.map((route) => (
              <div key={route.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold">{route.name}</h3>
                <p className="text-gray-600">{route.start_point} → {route.end_point}</p>
                <p className="text-sm text-gray-500">
                  {route.distance_km}km • {route.estimated_duration} min
                </p>
                <div className="mt-2">
                  <p className="text-xs text-gray-400">
                    Stops: {route.stops.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Your Supabase connection is working perfectly!</li>
          <li>• You can now integrate this data into your main dashboard</li>
          <li>• Use the database service functions in your components</li>
        </ul>
      </div>
    </div>
  )
}
