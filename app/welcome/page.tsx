'use client'

import { motion } from "framer-motion"
import Link from "next/link"
import { MessageSquare, Calendar, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function WelcomePage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-zinc-950">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-4xl space-y-12"
      >
        <motion.div variants={item} className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            ¡Qué bueno verte de nuevo!
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            ¿Qué te gustaría hacer hoy?
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <motion.div variants={item}>
            <Link href="/chat" className="group block h-full">
              <Card className="h-full p-8 border-2 border-transparent hover:border-slate-200 dark:hover:border-zinc-800 hover:shadow-2xl transition-all duration-300 bg-white dark:bg-zinc-900">
                <div className="flex flex-col h-full justify-between space-y-8">
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <MessageSquare className="w-7 h-7 text-black dark:text-white" />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                      Chat Assistant
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Interactúa directamente con tu asistente de IA para resolver dudas, consultar documentos o generar contenido rápido.
                    </p>
                  </div>
                  
                  <div className="flex items-center text-black dark:text-white font-medium group-hover:translate-x-2 transition-transform">
                    Ir al Chat <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link href="/dashboard" className="group block h-full">
              <Card className="h-full p-8 border-2 border-transparent hover:border-slate-200 dark:hover:border-zinc-800 hover:shadow-2xl transition-all duration-300 bg-white dark:bg-zinc-900">
                <div className="flex flex-col h-full justify-between space-y-8">
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-7 h-7 text-black dark:text-white" />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                      Gestionar Eventos
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Accede a tu panel de control para administrar archivos, ver el timeline y coordinar la logística de tus eventos.
                    </p>
                  </div>

                  <div className="flex items-center text-black dark:text-white font-medium group-hover:translate-x-2 transition-transform">
                    Ir al Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
