// 认证Hook - 管理登录状态、用户信息、额度
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client'
import type { UserProfile } from '@/lib/supabase/types'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isConfigured: boolean
}

// Demo user for when Supabase is not configured
const DEMO_STORAGE_KEY = 'blessphoto_demo_user'

interface DemoUser {
  id: string
  email: string
  name: string
  avatar_url: string
  free_credits: number
  purchased_credits: number
}

function getDemoUser(): DemoUser | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(DEMO_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }
  return null
}

function setDemoUser(user: DemoUser | null) {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(DEMO_STORAGE_KEY)
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isConfigured: false,
  })

  const supabase = getSupabaseClient()
  const configured = isSupabaseConfigured()

  useEffect(() => {
    if (configured && supabase) {
      const initAuth = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            setState({
              user,
              profile: profile || null,
              isLoading: false,
              isConfigured: true,
            })
          } else {
            setState({
              user: null,
              profile: null,
              isLoading: false,
              isConfigured: true,
            })
          }
        } catch (error) {
          console.error('[use-auth] Auth init error:', error)
          setState(prev => ({ ...prev, isLoading: false, isConfigured: true }))
        }
      }

      initAuth()

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setState({
            user: session.user,
            profile: profile || null,
            isLoading: false,
            isConfigured: true,
          })
        } else {
          setState({
            user: null,
            profile: null,
            isLoading: false,
            isConfigured: true,
          })
        }
      })

      return () => subscription.unsubscribe()
    } else {
      // Demo mode
      const demoUser = getDemoUser()
      if (demoUser) {
        setState({
          user: { id: demoUser.id, email: demoUser.email } as User,
          profile: {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            avatar_url: demoUser.avatar_url,
            free_credits: demoUser.free_credits,
            purchased_credits: demoUser.purchased_credits,
            credits_expire_at: null,
            total_usage_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          isLoading: false,
          isConfigured: false,
        })
      } else {
        setState({
          user: null,
          profile: null,
          isLoading: false,
          isConfigured: false,
        })
      }
    }
  }, [configured, supabase])

  const signInWithGoogle = useCallback(async () => {
    if (configured && supabase) {
      const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })
      if (error) {
        console.error('[use-auth] Google sign in error:', error)
        throw error
      }
    } else {
      // Demo mode
      const demoUser: DemoUser = {
        id: 'demo-' + Math.random().toString(36).substring(7),
        email: 'demo@blessphoto.com',
        name: 'Demo User',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now(),
        free_credits: 1,
        purchased_credits: 0,
      }
      setDemoUser(demoUser)
      setState({
        user: { id: demoUser.id, email: demoUser.email } as User,
        profile: {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          avatar_url: demoUser.avatar_url,
          free_credits: demoUser.free_credits,
          purchased_credits: demoUser.purchased_credits,
          credits_expire_at: null,
          total_usage_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        isLoading: false,
        isConfigured: false,
      })
    }
  }, [configured, supabase])

  const signOut = useCallback(async () => {
    if (configured && supabase) {
      await supabase.auth.signOut()
    } else {
      setDemoUser(null)
      setState({
        user: null,
        profile: null,
        isLoading: false,
        isConfigured: false,
      })
    }
  }, [configured, supabase])

  const incrementUsage = useCallback(async () => {
    if (!state.profile) return false

    if (configured && supabase) {
      const { data, error } = await supabase.rpc('consume_credit', {
        user_id: state.profile.id
      })

      if (error || !data) {
        console.error('[use-auth] Consume credit error:', error)
        return false
      }

      // 刷新用户档案
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', state.profile.id)
        .single()

      if (profile) {
        setState(prev => ({
          ...prev,
          profile,
        }))
      }

      return true
    } else {
      // Demo mode
      const demoUser = getDemoUser()
      if (demoUser) {
        // 优先消耗购买额度
        if (demoUser.purchased_credits > 0) {
          demoUser.purchased_credits -= 1
        } else if (demoUser.free_credits > 0) {
          demoUser.free_credits -= 1
        } else {
          return false
        }
        
        setDemoUser(demoUser)
        setState(prev => ({
          ...prev,
          profile: prev.profile ? {
            ...prev.profile,
            free_credits: demoUser.free_credits,
            purchased_credits: demoUser.purchased_credits,
          } : null,
        }))
      }
      return true
    }
  }, [state.profile, configured, supabase])

  // 计算是否可以生成
  const canGenerate = state.profile 
    ? (state.profile.purchased_credits > 0 && 
       (!state.profile.credits_expire_at || new Date(state.profile.credits_expire_at) > new Date())) ||
      state.profile.free_credits > 0
    : false

  // 计算剩余额度
  const remainingCredits = state.profile
    ? (() => {
        let total = 0
        
        // 购买额度（未过期）
        if (state.profile.purchased_credits > 0 && 
            (!state.profile.credits_expire_at || new Date(state.profile.credits_expire_at) > new Date())) {
          total += state.profile.purchased_credits
        }
        
        // 免费额度
        total += state.profile.free_credits
        
        return total
      })()
    : 0

  return {
    user: state.user,
    profile: state.profile,
    isLoading: state.isLoading,
    isConfigured: state.isConfigured,
    isLoggedIn: !!state.user,
    canGenerate,
    remainingCredits,
    signInWithGoogle,
    signOut,
    incrementUsage,
  }
}
