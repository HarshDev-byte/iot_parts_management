// Quick test to check if the components API is working
const testAPI = async () => {
  try {
    console.log('Testing components API...')
    const response = await fetch('http://localhost:3002/api/components')
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ API working!')
      console.log(`Found ${data.components?.length || 0} components`)
      if (data.components?.length > 0) {
        console.log('Sample components:')
        data.components.slice(0, 3).forEach(comp => {
          console.log(`- ${comp.name} (${comp.category}) - ${comp.availableQuantity}/${comp.totalQuantity} available`)
        })
      }
    } else {
      console.log('❌ API error:', data)
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message)
  }
}

testAPI()