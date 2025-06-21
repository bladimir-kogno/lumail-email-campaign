import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { CampaignForm } from './campaign-form'

async function getLists() {
  return await prisma.list.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          subscribers: { where: { active: true } }
        }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export default async function NewCampaignPage() {
  const lists = await getLists()

  if (lists.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/campaigns" className="text-blue-600 hover:text-blue-500">
            ← Back to Campaigns
          </Link>
        </div>

        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No email lists</h3>
          <p className="mt-1 text-sm text-gray-500">You need to create an email list before creating a campaign.</p>
          <div className="mt-6">
            <Link href="/lists/new" className="btn btn-primary">
              Create Email List
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/campaigns" className="text-blue-600 hover:text-blue-500">
          ← Back to Campaigns
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Create New Email Campaign
          </h1>
          
          <CampaignForm lists={lists} />
        </div>
      </div>
    </div>
  )
}
