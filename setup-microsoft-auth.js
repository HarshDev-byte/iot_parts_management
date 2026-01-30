#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const crypto = require('crypto')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function setupMicrosoftAuth() {
  console.log('🔐 Microsoft Authentication Setup for IoT Parts Management System\n')
  
  console.log('Before running this script, make sure you have:')
  console.log('1. Created an Azure AD application')
  console.log('2. Configured redirect URI: http://localhost:3000/api/auth/callback/azure-ad')
  console.log('3. Generated a client secret')
  console.log('4. Granted API permissions (openid, profile, email, User.Read)\n')
  
  const proceed = await question('Have you completed the Azure AD setup? (y/n): ')
  if (proceed.toLowerCase() !== 'y') {
    console.log('\n📖 Please follow the setup guide in MICROSOFT_AUTH_SETUP.md first')
    rl.close()
    return
  }

  console.log('\n📝 Please provide your Azure AD application details:\n')

  const clientId = await question('Azure AD Client ID: ')
  const clientSecret = await question('Azure AD Client Secret: ')
  const tenantId = await question('Azure AD Tenant ID (optional): ')
  const collegeDomain = await question('College Domain (e.g., yourcollege.edu): ')

  // Generate a secure NextAuth secret
  const nextAuthSecret = crypto.randomBytes(32).toString('base64')

  // Read current .env file
  const envPath = path.join(process.cwd(), '.env')
  let envContent = fs.readFileSync(envPath, 'utf8')

  // Update environment variables
  envContent = envContent.replace(/AZURE_AD_CLIENT_ID=".*"/, `AZURE_AD_CLIENT_ID="${clientId}"`)
  envContent = envContent.replace(/AZURE_AD_CLIENT_SECRET=".*"/, `AZURE_AD_CLIENT_SECRET="${clientSecret}"`)
  envContent = envContent.replace(/AZURE_AD_TENANT_ID=".*"/, `AZURE_AD_TENANT_ID="${tenantId}"`)
  envContent = envContent.replace(/COLLEGE_DOMAIN=".*"/, `COLLEGE_DOMAIN="${collegeDomain}"`)
  envContent = envContent.replace(/NEXTAUTH_SECRET=".*"/, `NEXTAUTH_SECRET="${nextAuthSecret}"`)

  // Write updated .env file
  fs.writeFileSync(envPath, envContent)

  console.log('\n✅ Microsoft Authentication configured successfully!')
  console.log('\n📋 Configuration Summary:')
  console.log(`   Client ID: ${clientId}`)
  console.log(`   Tenant ID: ${tenantId || 'Not specified'}`)
  console.log(`   College Domain: ${collegeDomain}`)
  console.log(`   NextAuth Secret: Generated securely`)
  
  console.log('\n🚀 Next steps:')
  console.log('1. Start the development server: npm run dev')
  console.log('2. Visit http://localhost:3000')
  console.log('3. Click "Sign In with Microsoft"')
  console.log('4. Test with a user from your college domain')

  console.log('\n🔒 Security Notes:')
  console.log('- Only users with @' + collegeDomain + ' emails can sign in')
  console.log('- Users are auto-assigned roles based on email patterns')
  console.log('- All authentication events are logged for audit')

  rl.close()
}

setupMicrosoftAuth().catch(console.error)