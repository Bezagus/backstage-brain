'use client'

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Zap, Mail, Loader2, User, Lock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function SignupPage() {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signUp(email, password, fullName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cuenta')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex flex-col bg-zinc-900 text-white py-12 px-12 justify-between relative overflow-hidden">
        <Link href="/" className="z-10 flex items-center gap-2 pt-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="bg-white text-black p-1.5 rounded-lg">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight">Backstage Brain</span>
        </Link>

        <div className="z-10 relative flex flex-col items-center justify-center flex-1">
           <div className="relative w-full max-w-[400px] aspect-square">
               <Image 
                src="/login.png" 
                alt="Event Production Illustration" 
                fill
                className="object-contain"
                priority
               />
           </div>
           <div className="text-center mt-8 space-y-2 max-w-md">
               <h2 className="text-2xl font-bold">Organiza como un profesional</h2>
               <p className="text-zinc-400">Únete a la comunidad de productores que están revolucionando la gestión de eventos.</p>
           </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 bg-white dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Crear una cuenta
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ingresa tus datos para comenzar tu prueba gratuita
            </p>
          </div>

          <div className="grid gap-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="name">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="name"
                      placeholder="Juan Pérez"
                      type="text"
                      autoCapitalize="none"
                      autoComplete="name"
                      autoCorrect="off"
                      className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 pl-9"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="email"
                      placeholder="nombre@ejemplo.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="password"
                      placeholder="••••••••"
                      type="password"
                      autoCapitalize="none"
                      autoComplete="new-password"
                      className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 w-full"
                  disabled={loading}
                >
                  {loading ? 'Creando cuenta...' : 'Registrarse con Email'}
                </Button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-950 px-2 text-slate-500 dark:text-slate-400">
                  O continuar con
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900" type="button" disabled>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
          </div>

          <p className="px-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Al hacer clic en continuar, aceptas nuestros{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Política de Privacidad
            </Link>
            .
          </p>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="font-semibold text-black dark:text-white hover:underline">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
