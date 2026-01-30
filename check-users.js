const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        isActive: true,
      }
    })

    console.log('\n📋 Users in database:')
    console.log('─'.repeat(60))
    users.forEach(user => {
      console.log(`Email: ${user.email}`)
      console.log(`Name: ${user.name}`)
      console.log(`Role: ${user.role}`)
      console.log(`Active: ${user.isActive}`)
      console.log('─'.repeat(60))
    })

    console.log(`\n✅ Total users: ${users.length}`)

    // Check specific users
    const labAssistant = await prisma.user.findUnique({
      where: { email: 'lab.assistant@sies.edu' }
    })

    if (labAssistant) {
      console.log('\n✅ Lab Assistant user exists!')
      console.log('   Email: lab.assistant@sies.edu')
      console.log('   Password: lab123')
      console.log('   Role:', labAssistant.role)
    } else {
      console.log('\n❌ Lab Assistant user NOT found!')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
