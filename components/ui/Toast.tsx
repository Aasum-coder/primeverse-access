'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  visible: boolean
  onClose: () => void
}

export default function Toast({ message, type = 'success', visible, onClose }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3500)
      return () => clearTimeout(timer)
    }
  }, [visible, onClose])

  if (!visible) return null

  const borderColor = type === 'success'
    ? 'rgba(74,157,90,0.4)'
    : type === 'error'
    ? 'rgba(239,68,68,0.4)'
    : 'rgba(212,165,55,0.3)'

  const iconColor = type === 'success'
    ? '#6dc07f'
    : type === 'error'
    ? '#f87171'
    : '#d4a537'

  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      animation: 'toastSlideIn 0.3s ease-out',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 20px', borderRadius: 12,
        background: 'rgba(8,8,8,0.95)', border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        maxWidth: 380, fontFamily: "'Outfit', sans-serif",
      }}>
        <span style={{ color: iconColor, fontSize: 18 }}>
          {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
        </span>
        <span style={{ fontSize: 14, color: '#f0e6d0' }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            marginLeft: 8, background: 'none', border: 'none',
            color: '#5a5347', cursor: 'pointer', fontSize: 14, padding: 0,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
