import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    // Para demo, permitir cualquier credencial válida
    if (email === 'demo@example.com' && password === 'password') {
      const token = generateToken('demo-user')
      
      const response = NextResponse.json({
        success: true,
        user: { id: 'demo-user', name: 'Studio Pro', email: 'demo@example.com' }
      })
      
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 días
      })
      
      return response
    }

    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
} 