'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface List {
  id: string
  name: string
  description: string | null
  _count: {
    subscribers: number
  }
}

export default function CampaignForm() {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [listId, setListId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [lists, setLists] = useState<List[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingLists, setIsLoadingLists] = useState(true)
  const router = useRouter()

  // Fetch available lists
  useEffect(() => {
    async function fetchLists() {
      try {
        const response = await fetch('/api/lists')
        if (response.ok) {
          const data = await response.json()
          setLists(data)
        }
      } catch (error) {
        console.error('Error fetching lists:', error)
      } finally {
        setIsLoadingLists(false)
      }
    }
    fetchLists()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const campaignData = {
        name,
        subject,
        htmlContent,
        listId,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      })

      if (response.ok) {
        const campaign = await response.json()
        router.push(`/campaigns/${campaign.id}`)
      } else {
        const error = await response.json()
        console.error('Error creating campaign:', error)
        alert('Failed to create campaign: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Failed to create campaign')
    } finally {
      setIsLoading(false)
    }
  }

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById('htmlContent') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = textarea.value
      const before = text.substring(0, start)
      const after = text.substring(end)
      const newText = before + placeholder + after
      setHtmlContent(newText)
      
      // Reset cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + placeholder.length
        textarea.focus()
      }, 0)
    }
  }

  if (isLoadingLists) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading lists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
            <p className="mt-1 text-sm text-gray-600">
              Create and schedule email campaigns for your subscribers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Campaign Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Campaign Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Weekly Newsletter"
              />
            </div>

            {/* Email Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Email Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., This Week's Updates"
              />
            </div>

            {/* Select List */}
            <div>
              <label htmlFor="listId" className="block text-sm font-medium text-gray-700">
                Email List
              </label>
              <select
                id="listId"
                value={listId}
                onChange={(e) => setListId(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a list</option>
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name} ({list._count.subscribers} subscribers)
                  </option>
                ))}
              </select>
              {lists.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  No lists found. <a href="/lists/new" className="text-blue-600 hover:text-blue-500">Create a list first</a>.
                </p>
              )}
            </div>

            {/* Scheduled Date */}
            <div>
              <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700">
                Schedule Send (Optional)
              </label>
              <input
                type="datetime-local"
                id="scheduledAt"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to save as draft. Set a future date to schedule automatic sending.
              </p>
            </div>

            {/* HTML Content */}
            <div>
              <label htmlFor="htmlContent" className="block text-sm font-medium text-gray-700">
                Email Content (HTML)
              </label>
              
              {/* Placeholder Buttons */}
              <div className="mt-1 mb-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => insertPlaceholder('{{firstName}}')}
                  className="px-3 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                >
                  Insert {'{{firstName}}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertPlaceholder('{{lastName}}')}
                  className="px-3 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                >
                  Insert {'{{lastName}}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertPlaceholder('{{unsubscribeUrl}}')}
                  className="px-3 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                >
                  Insert {'{{unsubscribeUrl}}'}
                </button>
              </div>

              <textarea
                id="htmlContent"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                required
                rows={12}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                placeholder="Enter your HTML email content here..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Use {'{{firstName}}'}, {'{{lastName}}'}, and {'{{unsubscribeUrl}}'} as placeholders for personalization.
              </p>
            </div>

            {/* Preview */}
            {htmlContent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="border border-gray-200 rounded-md p-4 bg-gray-50 max-h-64 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || lists.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : scheduledAt ? 'Schedule Campaign' : 'Save Draft'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
