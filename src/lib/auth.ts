import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/types/database'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          return null
        }

        // Simple password check (in production, use bcrypt)
        // For demo: hod123, lab123, student123
        const validPasswords: Record<string, string> = {
          'hod@sies.edu': 'hod123',
          'lab.assistant@sies.edu': 'lab123',
          'demo.student@sies.edu': 'student123',
        }

        if (validPasswords[user.email] !== credentials.password) {
          console.log('Invalid password for:', user.email)
          return null
        }

        console.log('Login successful:', user.email)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          prn: user.prn,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.role = token.role as UserRole
        session.user.department = token.department as string
        session.user.prn = token.prn as string
        session.user.isActive = true
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.department = user.department
        token.prn = user.prn
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
})
