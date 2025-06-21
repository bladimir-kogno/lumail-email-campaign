import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function createList(formData: FormData) {
  'use server'
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) {
    throw new Error('List name is required')
  }

  const list = await prisma.list.create({
    data: {
      name,
      description: description || null,
    },
  })

  redirect(`/lists/${list.id}`)
}

export default function NewListPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/lists" className="text-blue-600 hover:text-blue-500">
          ← Back to Lists
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Create New Email List
          </h1>
          
          <form action={createList} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                List Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 form-input"
                placeholder="e.g., Newsletter Subscribers"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                className="mt-1 form-textarea"
                placeholder="Optional description for this list"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Link href="/lists" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary">
                Create List
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
