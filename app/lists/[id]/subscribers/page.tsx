import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { AddSubscriberForm } from './add-subscriber-form'
import { DeleteSubscriberButton } from './delete-subscriber-button'

async function getListWithSubscribers(listId: string) {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: {
      subscribers: {
        where: { status: "active" },
        orderBy: { createdAt: 'desc' }
      }
    }
  })
  
  if (!list) {
    throw new Error('List not found')
  }
  
  return list
}

export default async function ListSubscribersPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const list = await getListWithSubscribers(params.id)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/lists" className="text-blue-600 hover:text-blue-500 text-sm">
            ← Back to Lists
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {list.name} - Subscribers
          </h1>
          <p className="text-gray-600">{list.subscribers.length} active subscribers</p>
        </div>
      </div>

      {/* Add Subscriber Form */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Subscriber</h2>
          <AddSubscriberForm listId={params.id} />
        </div>
      </div>

      {/* Subscribers List */}
      {list.subscribers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No subscribers</h3>
          <p className="mt-1 text-sm text-gray-500">Add your first subscriber to get started.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {list.subscribers.map((subscriber) => (
              <li key={subscriber.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {subscriber.firstName || subscriber.lastName
                          ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
                          : 'No name'}
                      </p>
                      <p className="ml-2 text-sm text-gray-500">
                        {subscriber.email}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Subscribed {new Date(subscriber.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    <DeleteSubscriberButton 
                      subscriberId={subscriber.id} 
                      subscriberEmail={subscriber.email} 
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
