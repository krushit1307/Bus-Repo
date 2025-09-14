// Test Supabase connection and CRUD operations
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Key:', supabaseKey ? 'Set' : 'Missing')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test basic read
    console.log('\n1. Testing READ operation...')
    const { data: buses, error: readError } = await supabase
      .from('buses')
      .select('*')
      .limit(1)
    
    if (readError) {
      console.error('❌ Read failed:', readError)
      return false
    }
    console.log('✅ Read successful:', buses?.length || 0, 'buses found')

    // Test insert
    console.log('\n2. Testing INSERT operation...')
    const { data: newBus, error: insertError } = await supabase
      .from('buses')
      .insert({
        route_number: 'TEST01',
        bus_number: 'Test Bus',
        current_location: 'Test Location',
        capacity: 50,
        status: 'active'
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Insert failed:', insertError)
      return false
    }
    console.log('✅ Insert successful:', newBus)

    // Test update
    console.log('\n3. Testing UPDATE operation...')
    const { data: updatedBus, error: updateError } = await supabase
      .from('buses')
      .update({ bus_number: 'Updated Test Bus' })
      .eq('id', newBus.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Update failed:', updateError)
      return false
    }
    console.log('✅ Update successful:', updatedBus)

    // Test delete
    console.log('\n4. Testing DELETE operation...')
    const { error: deleteError } = await supabase
      .from('buses')
      .delete()
      .eq('id', newBus.id)

    if (deleteError) {
      console.error('❌ Delete failed:', deleteError)
      return false
    }
    console.log('✅ Delete successful')

    console.log('\n🎉 All CRUD operations working!')
    return true

  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}

testConnection()
