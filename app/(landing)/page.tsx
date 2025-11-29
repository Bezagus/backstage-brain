"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Zap, Shield, Globe, Upload, MessageSquare, Calendar, User2, Search, Bell, Menu } from "lucide-react"
import { motion } from "motion/react"

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-white selection:bg-slate-200 dark:selection:bg-zinc-800">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black dark:bg-white text-white dark:text-black p-1.5 rounded-lg">
                <Zap className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">Backstage Brain</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Link href="#features" className="hover:text-black dark:hover:text-white transition-colors">Características</Link>
            <Link href="#testimonials" className="hover:text-black dark:hover:text-white transition-colors">Testimonios</Link>
            <Link href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">Precios</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors hidden sm:block">
              Iniciar sesión
            </Link>
            <Link href="/signup">
              <Button className="rounded-full px-6 bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200">
                Comenzar ahora <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24 lg:py-32 text-center">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-200">
              <span className="flex h-2 w-2 rounded-full bg-black dark:bg-white mr-2"></span>
              Nuevo: Gestión de Timeline en tiempo real
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
              Tu evento, <span className="underline decoration-4 decoration-slate-300 dark:decoration-zinc-700 underline-offset-4">perfectamente orquestado</span>.
            </motion.h1>
            <motion.p variants={itemVariants} className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400 md:text-xl leading-relaxed">
              La plataforma integral para productores y organizadores. Centraliza archivos, coordina equipos y gestiona el minuto a minuto de tu evento sin estrés.
            </motion.p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 rounded-full text-base bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200">
                  Probar gratis
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 px-8 rounded-full text-base border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800">
                Ver demo
              </Button>
            </div>
          </motion.div>

          {/* Hero Dashboard Preview (Coded Representation) */}
          <motion.div 
            initial={{ opacity: 0, y: 100, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.5, type: "spring" }}
            className="mt-20 relative mx-auto max-w-6xl perspective-1000"
          >
            {/* Background Glow (Monochrome) */}
            <div className="absolute -inset-4 bg-gradient-to-r from-slate-200 to-slate-400 dark:from-zinc-800 dark:to-zinc-700 rounded-[2rem] blur-2xl opacity-40 -z-10"></div>
            
            <div className="relative rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden mx-auto text-left">
                {/* Mockup Window Controls */}
                <div className="border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-zinc-700"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-zinc-700"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-zinc-700"></div>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="px-4 py-1 bg-slate-50 dark:bg-zinc-900 rounded-md text-xs text-slate-400 dark:text-zinc-600 font-mono border border-slate-100 dark:border-zinc-800 w-64 text-center">
                            backstage-brain.app
                        </div>
                    </div>
                    <div className="w-10"></div> {/* Spacer for balance */}
                </div>

                <div className="flex h-[600px] bg-slate-50 dark:bg-black">
                    {/* Sidebar (Mock) */}
                    <div className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 gap-6">
                        <div className="flex items-center gap-2 px-2">
                            <div className="h-8 w-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
                                <Zap className="h-4 w-4 text-white dark:text-black fill-current" />
                            </div>
                            <span className="font-bold text-sm">Backstage Brain</span>
                        </div>
                        <div className="space-y-1">
                             <div className="px-2 py-2 bg-slate-100 dark:bg-zinc-900 rounded-md text-sm font-medium flex items-center gap-3 text-black dark:text-white">
                                <Star className="h-4 w-4" /> Home
                             </div>
                             <div className="px-2 py-2 rounded-md text-sm font-medium flex items-center gap-3 text-slate-500 dark:text-zinc-500">
                                <Upload className="h-4 w-4" /> Upload Center
                             </div>
                             <div className="px-2 py-2 rounded-md text-sm font-medium flex items-center gap-3 text-slate-500 dark:text-zinc-500">
                                <MessageSquare className="h-4 w-4" /> Chat AI
                             </div>
                             <div className="px-2 py-2 rounded-md text-sm font-medium flex items-center gap-3 text-slate-500 dark:text-zinc-500">
                                <Calendar className="h-4 w-4" /> Timeline
                             </div>
                        </div>
                        <div className="mt-auto border-t border-slate-100 dark:border-zinc-800 pt-4">
                            <div className="flex items-center gap-3 px-2">
                                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center">
                                    <User2 className="h-4 w-4 text-slate-500" />
                                </div>
                                <div className="text-xs">
                                    <div className="font-medium text-slate-900 dark:text-white">Admin User</div>
                                    <div className="text-slate-500">admin@backstage.com</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content (Mock) */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Top Bar */}
                        <div className="h-14 border-b border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm flex items-center justify-between px-6">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Menu className="h-4 w-4 md:hidden" />
                                <span className="hidden md:inline">Dashboard</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-64 bg-slate-100 dark:bg-zinc-900 rounded-full hidden md:flex items-center px-3 text-slate-400 text-xs border border-slate-200 dark:border-zinc-800">
                                    <Search className="h-3 w-3 mr-2" /> Buscar...
                                </div>
                                <Bell className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>

                        {/* Scrollable Area */}
                        <div className="flex-1 p-6 overflow-hidden relative">
                             {/* Gradient Overlay to simulate fold */}
                             <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50 dark:from-black to-transparent z-10"></div>

                             <div className="max-w-4xl mx-auto space-y-6 opacity-90">
                                {/* Header Text */}
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="h-6 w-48 bg-slate-900 dark:bg-white rounded-md mb-2"></div>
                                        <div className="h-4 w-64 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
                                    </div>
                                    <div className="h-9 w-24 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md"></div>
                                </div>

                                {/* Summary Card */}
                                <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
                                        <Star className="h-5 w-5 text-slate-900 dark:text-white" />
                                        <div className="h-5 w-32 bg-slate-900 dark:bg-white rounded-md"></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                                                <div className="h-3 w-20 bg-slate-400 dark:bg-zinc-600 rounded mb-3"></div>
                                                <div className="h-8 w-12 bg-slate-900 dark:bg-white rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Access Grid */}
                                <div className="h-4 w-32 bg-slate-900 dark:bg-white rounded-md mt-8 mb-4"></div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { icon: Upload, label: "Subir Archivos" },
                                        { icon: MessageSquare, label: "Chat AI" },
                                        { icon: Calendar, label: "Timeline" }
                                    ].map((item, i) => (
                                        <div key={i} className="h-40 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col justify-between hover:border-slate-400 transition-colors cursor-pointer group">
                                            <div className="flex justify-between items-start">
                                                <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg text-slate-900 dark:text-white group-hover:scale-110 transition-transform">
                                                    <item.icon className="h-5 w-5" />
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-slate-300" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-5 w-24 bg-slate-900 dark:bg-white rounded"></div>
                                                <div className="h-3 w-full bg-slate-200 dark:bg-zinc-800 rounded"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-zinc-800">
            <div className="container mx-auto px-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Todo lo que necesitas para brillar</h2>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Herramientas diseñadas específicamente para la industria del entretenimiento y eventos en vivo.</p>
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                >
                    <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-950 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-slate-900 dark:text-white mb-6">
                            <Star className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Gestión Centralizada</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Accede a todos tus documentos, contratos y riders técnicos desde un solo lugar, seguro y organizado.</p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-950 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-slate-900 dark:text-white mb-6">
                            <Shield className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Seguridad de Nivel</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Tus datos están protegidos con encriptación de grado bancario. Controla quién ve qué con permisos granulares.</p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-950 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-slate-900 dark:text-white mb-6">
                            <Globe className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Colaboración Global</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Trabaja con equipos remotos en tiempo real. Comentarios, aprobaciones y actualizaciones instantáneas.</p>
                    </motion.div>
                </motion.div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
            <div className="container mx-auto px-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative bg-black dark:bg-white rounded-3xl p-8 md:p-16 overflow-hidden text-center border border-slate-800 dark:border-slate-200"
                >
                    <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-white dark:text-black">¿Listo para transformar tu producción?</h2>
                        <p className="text-slate-300 dark:text-slate-700 text-lg">Únete a miles de productores que ya confían en Backstage Brain.</p>
                        <div className="pt-4">
                            <Link href="/signup">
                                <Button size="lg" className="h-14 px-8 rounded-full text-lg bg-white text-black hover:bg-slate-200 dark:bg-black dark:text-white dark:hover:bg-zinc-800 border-none">
                                    Empezar Gratis
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="bg-black dark:bg-white text-white dark:text-black p-1 rounded-md">
                    <Zap className="h-4 w-4 fill-current" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">Backstage Brain</span>
            </div>
            <div className="text-sm text-slate-500">
                © 2025 Backstage Brain. Todos los derechos reservados.
            </div>
            <div className="flex gap-6">
                <Link href="#" className="text-slate-500 hover:text-black dark:hover:text-white transition-colors"><Globe className="h-5 w-5" /></Link>
            </div>
        </div>
      </footer>
    </div>
  )
}
