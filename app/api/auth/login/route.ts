import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    // Autenticación dummy usando DatabaseService
    const photographer = await database.verifyPhotographer(email, password)
    
    if (photographer) {
      // Token dummy simple (sin JWT por ahora)
      const dummyToken = `dummy-token-${Date.now()}`
      
      const response = NextResponse.json({
        success: true,
        user: { 
          id: photographer.id, 
          name: photographer.name, 
          email: photographer.email,
          studioName: photographer.studioName
        }
      })
      
      response.cookies.set('auth-token', dummyToken, {
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
    console.error('Error en login:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
} 