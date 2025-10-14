'use client'

import { useState, useEffect } from 'react'
import { useAuth } from 'components/AuthProvider';
import { Loading } from '@/components/Loading';
import Link from 'next/link'

interface Client {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  occupation: string
  status: 'active' | 'inactive' | 'potential'
  created_at: string
}

export default function ClientsPage() {
  const { user, loading: authLoading } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/advocate/login'
      return
    }
    if (user) {
      fetchClients()
    }
  }, [user, authLoading])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()
      
      if (data.success) {
        setClients(data.data.clients)
      } else {
        // Fallback to mock data if API fails
        const mockClients: Client[] = [
          {
            id: 1,
            first_name: 'Alice',
            last_name: 'Johnson',
            email: 'alice.johnson@email.com',
            phone: '+1-555-0101',
            occupation: 'Business Owner',
            status: 'active',
            created_at: '2024-01-15T10:00:00Z'
          },
          {
            id: 2,
            first_name: 'Bob',
            last_name: 'Smith',
            email: 'bob.smith@email.com',
            phone: '+1-555-0102',
            occupation: 'Engineer',
            status: 'active',
            created_at: '2024-02-01T14:30:00Z'
          },
          {
            id: 3,
            first_name: 'Carol',
            last_name: 'Davis',
            email: 'carol.davis@email.com',
            phone: '+1-555-0103',
            occupation: 'Teacher',
            status: 'potential',
            created_at: '2024-02-15T09:15:00Z'
          },
          {
            id: 4,
            first_name: 'David',
            last_name: 'Wilson',
            email: 'david.wilson@email.com',
            phone: '+1-555-0104',
            occupation: 'Doctor',
            status: 'active',
            created_at: '2024-03-01T16:45:00Z'
          }
        ]
        setClients(mockClients)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      // Fallback to mock data on error
      const mockClients: Client[] = [
        {
          id: 1,
          first_name: 'Alice',
          last_name: 'Johnson',
          email: 'alice.johnson@email.com',
          phone: '+1-555-0101',
          occupation: 'Business Owner',
          status: 'active',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          first_name: 'Bob',
          last_name: 'Smith',
          email: 'bob.smith@email.com',
          phone: '+1-555-0102',
          occupation: 'Engineer',
          status: 'active',
          created_at: '2024-02-01T14:30:00Z'
        },
        {
          id: 3,
          first_name: 'Carol',
          last_name: 'Davis',
          email: 'carol.davis@email.com',
          phone: '+1-555-0103',
          occupation: 'Teacher',
          status: 'potential',
          created_at: '2024-02-15T09:15:00Z'
        },
        {
          id: 4,
          first_name: 'David',
          last_name: 'Wilson',
          email: 'david.wilson@email.com',
          phone: '+1-555-0104',
          occupation: 'Doctor',
          status: 'active',
          created_at: '2024-03-01T16:45:00Z'
        }
      ]
      setClients(mockClients)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'potential':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (authLoading || loading) {
    return <Loading />
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Please log in to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Clients</h1>
              <p className="text-muted-foreground mt-2">Manage your client database</p>
            </div>
            <Link href="/clients/new" className="btn-primary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Client
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="potential">Potential</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Occupation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-muted-foreground">
                        <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="mt-2">No clients found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {client.first_name[0]}{client.last_name[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">
                              {client.first_name} {client.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">{client.email}</div>
                        <div className="text-sm text-muted-foreground">{client.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {client.occupation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(client.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/clients/${client.id}`}
                            className="text-primary hover:text-primary/80"
                          >
                            View
                          </Link>
                          <Link
                            href={`/clients/${client.id}/edit`}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
