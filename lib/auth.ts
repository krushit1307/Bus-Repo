import { createClient } from './supabase-client'
import { createClient as createServerClient } from './supabase-server'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  role: 'admin' | 'user' | 'driver'
  phone?: string
  created_at: string
  updated_at: string
}

export interface SignUpData {
  email: string
  password: string
  full_name?: string
  role?: 'admin' | 'user' | 'driver'
  phone?: string
}

export interface SignInData {
  email: string
  password: string
}

export class AuthService {
  private supabase = createClient()

  // Sign up new user
  async signUp(data: SignUpData) {
    const { email, password, full_name, role, phone } = data
    
    const { data: authData, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role: role || 'user',
          phone
        }
      }
    })

    if (error) throw error
    return authData
  }

  // Sign in existing user
  async signIn(data: SignInData) {
    const { email, password } = data
    
    try {
      const { data: authData, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Supabase auth error:', error)
        throw new Error(error.message || 'Authentication failed')
      }
      
      // Track login session
      if (authData.user) {
        try {
          await this.trackUserSession(authData.user.id)
        } catch (sessionError) {
          console.warn('Failed to track session:', sessionError)
          // Don't fail login if session tracking fails
        }
      }
      
      return authData
    } catch (err: any) {
      console.error('Sign in error:', err)
      if (err.message?.includes('fetch')) {
        throw new Error('Connection error. Please check your internet connection and Supabase configuration.')
      }
      throw err
    }
  }

  // Sign out user
  async signOut() {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (user) {
      // Update logout time
      await this.supabase
        .from('user_sessions')
        .update({ logout_time: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('logout_time', null)
    }

    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error) throw error
    return user
  }

  // Get user profile
  async getUserProfile(userId?: string) {
    const { data: { user } } = await this.supabase.auth.getUser()
    const targetUserId = userId || user?.id
    
    if (!targetUserId) throw new Error('No user ID provided')

    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', targetUserId)
      .single()

    if (error) throw error
    return data as UserProfile
  }

  // Update user profile
  async updateUserProfile(updates: Partial<UserProfile>) {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await this.supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data as UserProfile
  }

  // Check if user is admin
  async isAdmin() {
    try {
      const profile = await this.getUserProfile()
      return profile.role === 'admin'
    } catch {
      return false
    }
  }

  // Get all users (admin only)
  async getAllUsers() {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as UserProfile[]
  }

  // Track user session
  private async trackUserSession(userId: string) {
    try {
      await this.supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent
        })
    } catch (error) {
      console.warn('Failed to track user session:', error)
    }
  }

  // Get client IP (simplified)
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  // Reset password
  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    
    if (error) throw error
  }

  // Update password
  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) throw error
  }
}

export const auth = new AuthService()
