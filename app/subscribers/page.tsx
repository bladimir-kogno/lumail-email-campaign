import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Mail, User, Calendar, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface List {
  id: string
  name: string
}

interface Subscriber {
  id: string
  email: string
  firstName: string
  lastName: string
  status: string
  createdAt: string
  list: List
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      setError(null)
      const response = await fetch('/api/subscribers')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setSubscribers(data)
    } catch (error) {
      console.error('Error fetching subscribers:', error)
      setError('Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Subscribers</h1>
          <p className="text-gray-600 mt-2">Manage your email subscribers</p>
        </div>
        <Button asChild>
          <Link href="/subscribers/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Subscriber
          </Link>
        </Button>
      </div>

      {subscribers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscribers yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first subscriber</p>
          <Button asChild>
            <Link href="/subscribers/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Subscriber
            </Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>List</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {subscriber.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {subscriber.firstName || subscriber.lastName
                        ? `${subscriber.firstName} ${subscriber.lastName}`.trim()
                        : '-'}
                    </div>
                  </TableCell>
                  <TableCell>{subscriber.list.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={subscriber.status === 'active' ? 'default' : 'secondary'}
                    >
                      {subscriber.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {new Date(subscriber.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}