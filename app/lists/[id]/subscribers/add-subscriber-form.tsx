'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AddSubscriberFormProps {
  listId: string
}

export function AddSubscriberForm({ listId }: AddSubscriberFormProps) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/lists/${listId}/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName: firstName || null,
          lastName: lastName || null,
        }),
      })

      if (response.ok) {
        setEmail('')
        setFirstName('')
        setLastName('')
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to add subscriber')
      }
    } catch (error) {
      setError('Failed to add subscriber')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 form-input"
            placeholder="subscriber@example.com"
          />
        </div>
        
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 form-input"
            placeholder="John"
          />
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 form-input"
            placeholder="Doe"
          />
        </div>
      </div>
      
      <div>
        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="btn btn-primary disabled:opacity-50"
        >
          {isSubmitting ? 'Adding...' : 'Add Subscriber'}
        </button>
      </div>
    </form>
  )
}
