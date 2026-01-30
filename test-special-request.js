// Test special request API
const testData = {
  partName: 'Special Component Request',
  description: 'See attached link or images for details',
  quantity: 1,
  estimatedPrice: null,
  websiteUrl: 'https://robu.in/product/esp32-cam',
  imageUrls: null,
  purpose: 'Need for IoT project testing',
  projectId: null,
}

console.log('Test data:', JSON.stringify(testData, null, 2))

fetch('http://localhost:3000/api/special-requests', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'your-session-cookie-here' // You'll need to get this from browser
  },
  body: JSON.stringify(testData),
})
  .then(res => res.json())
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err))
