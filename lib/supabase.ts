import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (you can generate these from your Supabase dashboard)
export type Database = {
  public: {
    Tables: {
      buses: {
        Row: {
          id: string
          route_number: string
          bus_number: string
          current_location: string
          status: 'active' | 'inactive' | 'maintenance'
          capacity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          route_number: string
          bus_number: string
          current_location: string
          status?: 'active' | 'inactive' | 'maintenance'
          capacity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          route_number?: string
          bus_number?: string
          current_location?: string
          status?: 'active' | 'inactive' | 'maintenance'
          capacity?: number
          created_at?: string
          updated_at?: string
        }
      }
      routes: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          start_point: string
          end_point: string
          stops: string[]
          distance_km: number
          estimated_duration: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_point?: string
          end_point?: string
          stops?: string[]
          distance_km?: number
          estimated_duration?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'user' | 'driver'
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'user' | 'driver'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'user' | 'driver'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          login_time: string
          logout_time: string | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id: string
          login_time?: string
          logout_time?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          login_time?: string
          logout_time?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
