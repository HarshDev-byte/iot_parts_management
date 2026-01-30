#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

function verifyAuthSetup() {
  console.log('🔍 Verifying Microsoft Authentication Setup...\n')

  // Check .env file
  const envPath = path.join(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found')
    return false
  }

  const envContent = fs.readFileSync(envPath, 'utf8')
  const envVars = {}
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
      envVars[key] = value.replace(/"/g, '')
    }
  })

  let allGood = true

  // Check required variables
  const requiredVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'AZURE_AD_CLIENT_ID',
    'AZURE_AD_CLIENT_SECRET',
    'COLLEGE_DOMAIN'
  ]

  console.log('📋 Environment Variables Check:')
  requiredVars.forEach(varName => {
    const value = envVars[varName]
    if (!value || value === '') {
      console.log(`❌ ${varName}: Not set`)
      allGood = false
    } else if (value.includes('example') || value.includes('your-') || value.includes('change-')) {
      console.log(`⚠️  ${varName}: Contains placeholder value`)
      allGood = false
    } else {
      console.log(`✅ ${varName}: Configured`)
    }
  })

  // Check NextAuth secret strength
  const secret = envVars['NEXTAUTH_SECRET']
  if (secret && secret.length < 32) {
    console.log('⚠️  NEXTAUTH_SECRET: Should be at least 32 characters long')
    allGood = false
  }

  // Check auth configuration files
  console.log('\n📁 Configuration Files Check:')
  
  const authFiles = [
    'src/lib/auth.ts',
    'src/app/api/auth/[...nextauth]/route.ts',
    'src/app/auth/signin/page.tsx'
  ]

  authFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${filePath}: Found`)
    } else {
      console.log(`❌ ${filePath}: Missing`)
      allGood = false
    }
  })

  // Check database setup
  console.log('\n🗄️  Database Check:')
  const dbUrl = envVars['DATABASE_URL']
  if (dbUrl && dbUrl.includes('file:')) {
    const dbPath = dbUrl.replace('file:', '')
    if (fs.existsSync(dbPath)) {
      console.log('✅ SQLite database: Found')
    } else {
      console.log('⚠️  SQLite database: Not found (will be created on first run)')
    }
  } else if (dbUrl && dbUrl.includes('postgresql:')) {
    console.log('✅ PostgreSQL database: Configured')
  } else {
    console.log('❌ Database: Not properly configured')
    allGood = false
  }

  // Summary
  console.log('\n📊 Setup Summary:')
  if (allGood) {
    console.log('🎉 Microsoft Authentication is properly configured!')
    console.log('\n🚀 Ready to start:')
    console.log('   npm run dev')
    console.log('   Visit: http://localhost:3000')
  } else {
    console.log('❌ Some issues found. Please review the setup.')
    console.log('\n📖 For help, check:')
    console.log('   - MICROSOFT_AUTH_SETUP.md')
    console.log('   - Run: node setup-microsoft-auth.js')
  }

  return allGood
}

verifyAuthSetup()