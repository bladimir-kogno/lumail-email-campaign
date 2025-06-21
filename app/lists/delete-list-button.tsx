'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteListButtonProps {
  listId: string
  listName: string
}

export function DeleteListButton({ listId, listName }: DeleteListButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        router.refresh()
        setShowConfirm(false)
      } else {
        console.error('Failed to delete list')
      }
    } catch (error) {
      console.error('Error deleting list:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Delete "{listName}"?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-sm text-red-600 hover:text-red-500 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Yes'}
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
      Delete
    </button>
  )
}
