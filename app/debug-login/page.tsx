'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DebugLogin() {
  const [result, setResult] = useState<string>('')
  const router = useRouter()

  const testLogin = async () => {
    try {
      setResult('Enviando petición de login...')
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'demo@example.com', 
          password: 'password' 
        }),
      })

      const data = await response.json()
      
      setResult(`
        Status: ${response.status}
        Response: ${JSON.stringify(data, null, 2)}
        Headers: ${JSON.stringify(Object.fromEntries(response.headers), null, 2)}
      `)

      if (response.ok) {
        setResult(prev => prev + '\n\nRedirigiendo al dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (error) {
      setResult(`Error: ${error}`)
    }
  }

  const testDashboardAccess = async () => {
    try {
      setResult('Probando acceso al dashboard...')
      
      const response = await fetch('/dashboard', {
        credentials: 'include'
      })
      
      setResult(`
        Dashboard Status: ${response.status}
        Redirected: ${response.redirected}
        URL: ${response.url}
      `)
    } catch (error) {
      setResult(`Error: ${error}`)
    }
  }

  const clearCookies = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })
      setResult(`Logout Status: ${response.status}`)
    } catch (error) {
      setResult(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">LECORRAL PICKER - Debug Sistema de Login</h1>
        
        <div className="space-y-4 mb-8">
          <button 
            onClick={testLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Login (demo@example.com / password)
          </button>
          
          <button 
            onClick={testDashboardAccess}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Dashboard Access
          </button>
          
          <button 
            onClick={clearCookies}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear Cookies (Logout)
          </button>
        </div>

        <div className="bg-white p-4 rounded border">
          <h2 className="font-bold mb-2">Resultado:</h2>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>

        <div className="mt-8">
          <h2 className="font-bold mb-2">Información del navegador:</h2>
          <pre className="bg-gray-50 p-4 rounded text-sm">
            User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent : 'Server-side'}
            Cookies: {typeof document !== 'undefined' ? document.cookie : 'No access from server'}
          </pre>
        </div>
      </div>
    </div>
  )
} 