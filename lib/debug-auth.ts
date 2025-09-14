// Debug utility to test Supabase connection
import { createClient } from '@supabase/supabase-js'

export async function testSupabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('=== Supabase Connection Test ===')
  console.log('URL:', supabaseUrl ? 'Set' : 'Missing')
  console.log('Key:', supabaseKey ? 'Set' : 'Missing')
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables')
    return false
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test basic connection
    const { data, error } = await supabase.from('buses').select('count').limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Connection successful')
    return true
  } catch (err: any) {
    console.error('❌ Connection error:', err.message)
    return false
  }
}

export async function testAuth() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Environment variables not set')
    return
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test auth endpoint
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Auth test failed:', error.message)
    } else {
      console.log('✅ Auth endpoint accessible')
    }
  } catch (err: any) {
    console.error('❌ Auth error:', err.message)
  }
}
