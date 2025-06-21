'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteSubscriberButtonProps {
  subscriberId: string
  subscriberEmail: string
}

export function DeleteSubscriberButton({ subscriberId, subscriberEmail }: DeleteSubscriberButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/subscribers/${subscriberId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        router.refresh()
        setShowConfirm(false)
      } else {
        console.error('Failed to delete subscriber')
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Remove subscriber?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-sm text-red-600 hover:text-red-500 disabled:opacity-50"
        >
          {isDeleting ? 'Removing...' : 'Yes'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="text-sm text-gray-600 hover:text-gray-500"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-sm text-red-600 hover:text-red-500"
    >
      Remove
    </button>
  )
}
