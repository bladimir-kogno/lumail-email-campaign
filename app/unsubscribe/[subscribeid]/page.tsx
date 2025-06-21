import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

async function unsubscribeUser(subscriberId: string) {
  try {
    const subscriber = await prisma.subscriber.findUnique({
      where: { id: subscriberId },
      include: { list: true }
    })

    if (!subscriber) {
      return null
    }

    // Deactivate the subscriber
    await prisma.subscriber.update({
      where: { id: subscriberId },
      data: { status: "inactive" }
    })

    return {
      email: subscriber.email,
      listName: subscriber.list.name
    }
  } catch (error) {
    console.error('Error unsubscribing user:', error)
    return null
  }
}

export default async function UnsubscribePage({ 
  params,
  searchParams 
}: { 
  params: { subscriberId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const action = searchParams.action

  // If no action, show confirmation page
  if (!action) {
    const subscriber = await prisma.subscriber.findUnique({
      where: { id: params.subscriberId },
      include: { list: true }
    })

    if (!subscriber || subscriber.status !== 'active') {
      notFound()
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Unsubscribe Confirmation
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Are you sure you want to unsubscribe from our emails?
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Email: <strong>{subscriber.email}</strong>
              </p>
              <p className="text-sm text-gray-600">
                List: <strong>{subscriber.list.name}</strong>
              </p>
              
              <div className="flex space-x-4 justify-center mt-6">
                <a
                  href={`/unsubscribe/${params.subscriberId}?action=confirm`}
                  className="btn btn-danger"
                >
                  Yes, Unsubscribe
                </a>
                <button
                  onClick={() => window.close()}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If action is confirm, process unsubscribe
  if (action === 'confirm') {
    const result = await unsubscribeUser(params.subscriberId)

    if (!result) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Successfully Unsubscribed
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              You have been unsubscribed from future emails.
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                <strong>{result.email}</strong> has been unsubscribed from <strong>{result.listName}</strong>
              </p>
              <p className="text-xs text-gray-500 mt-4">
                If you unsubscribed by mistake, please contact us to resubscribe.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  notFound()
}
