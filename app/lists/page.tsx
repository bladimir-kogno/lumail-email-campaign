import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { DeleteListButton } from './delete-list-button'

async function getLists() {
  return await prisma.list.findMany({
    include: {
      _count: {
        select: {
          subscribers: { where: { status: "active" } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function ListsPage() {
  const lists = await getLists()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Email Lists</h1>
        <Link href="/lists/new" className="btn btn-primary">
          Create New List
        </Link>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No lists</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new email list.</p>
          <div className="mt-6">
            <Link href="/lists/new" className="btn btn-primary">
              Create New List
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {lists.map((list) => (
              <li key={list.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        <Link href={`/lists/${list.id}`} className="hover:underline">
                          {list.name}
                        </Link>
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {list._count.subscribers} subscribers
                        </p>
                      </div>
                    </div>
                    {list.description && (
                      <p className="mt-2 text-sm text-gray-500 truncate">
                        {list.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      Created {new Date(list.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <Link
                      href={`/lists/${list.id}/subscribers`}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Manage Subscribers
                    </Link>
                    <DeleteListButton listId={list.id} listName={list.name} />
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
