'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface List {
  id: string
  name: string
  _count: {
    subscribers: number
  }
}

interface CampaignFormProps {
  lists: List[]
}

export function CampaignForm({ lists }: CampaignFormProps) {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [listId, setListId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [sendNow, setSendNow] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          subject,
          htmlContent,
          listId,
          scheduledAt: sendNow ? null : scheduledAt,
          sendNow,
        }),
      })

      if (response.ok) {
        const campaign = await response.json()
        router.push(`/campaigns/${campaign.id}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create campaign')
      }
    } catch (error) {
      setError('Failed to create campaign')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get current datetime for min attribute
  const now = new Date()
  const minDateTime = new Date(now.getTime() + 5 * 60000).toISOString().slice(0, 16) // 5 minutes from now

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Campaign Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 form-input"
            placeholder="e.g., Weekly Newsletter #1"
          />
        </div>

        <div>
          <label htmlFor="listId" className="block text-sm font-medium text-gray-700">
            Email List *
          </label>
          <select
            id="listId"
            value={listId}
            onChange={(e) => setListId(e.target.value)}
            required
            className="mt-1 form-select"
          >
            <option value="">Select a list</option>
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name} ({list._count.subscribers} subscribers)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
          Subject Line *
        </label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="mt-1 form-input"
          placeholder="Your email subject line"
        />
      </div>

      <div>
        <label htmlFor="htmlContent" className="block text-sm font-medium text-gray-700">
          Email Content (HTML) *
        </label>
        <textarea
          id="htmlContent"
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          required
          rows={12}
          className="mt-1 form-textarea font-mono text-sm"
          placeholder={`<html>
<head>
  <title>Your Email</title>
</head>
<body>
  <h1>Hello {{firstName}}!</h1>
  <p>Your email content goes here...</p>
  
  <p style="font-size: 12px; color: #666; margin-top: 20px;">
    <a href="{{unsubscribeUrl}}">Unsubscribe</a>
  </p>
</body>
</html>`}
        />
        <p className="mt-2 text-sm text-gray-500">
          You can use <code>{'{{firstName}}'}</code>, <code>{'{{lastName}}'}</code>, and <code>{'{{unsubscribeUrl}}'}</code> as placeholders.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="sendNow"
            type="radio"
            name="timing"
            checked={sendNow}
            onChange={() => setSendNow(true)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <label htmlFor="sendNow" className="ml-3 block text-sm font-medium text-gray-700">
            Send immediately
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="scheduleFor"
            type="radio"
            name="timing"
            checked={!sendNow}
            onChange={() => setSendNow(false)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <label htmlFor="scheduleFor" className="ml-3 block text-sm font-medium text-gray-700">
            Schedule for later
          </label>
        </div>

        {!sendNow && (
          <div className="ml-7">
            <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700">
              Schedule Date & Time *
            </label>
            <input
              type="datetime-local"
              id="scheduledAt"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required={!sendNow}
              min={minDateTime}
              className="mt-1 form-input"
            />
            <p className="mt-1 text-sm text-gray-500">
              Campaign must be scheduled at least 5 minutes in the future
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary disabled:opacity-50"
        >
          {isSubmitting 
            ? 'Creating...' 
            : sendNow 
              ? 'Create & Send Campaign' 
              : 'Create & Schedule Campaign'
          }
        </button>
      </div>
    </form>
  )
}
