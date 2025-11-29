import { NextRequest } from 'next/server'
import { supabase } from './supabase'
import { UserRole } from './types'

/**
 * Obtener el usuario actual desde el token de autorización
 */
export async function getCurrentUser(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Verificar si el usuario tiene acceso a un evento
 */
export async function checkEventAccess(userId: string, eventId: string) {
  const { data, error } = await supabase
    .from('event_users')
    .select('role')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .single()

  if (error || !data) {
    return null
  }

  return data.role as UserRole
}

/**
 * Verificar si el usuario tiene un rol específico o superior
 */
export function hasPermission(userRole: UserRole | null, requiredRole: UserRole): boolean {
  if (!userRole) return false

  const roleHierarchy: Record<UserRole, number> = {
    'ADMIN': 3,
    'MANAGER': 2,
    'STAFF': 1
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
