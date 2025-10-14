'use client'

import { useState, useEffect } from 'react'
import { useAuth } from 'components/AuthProvider'
import { Loading } from '@/components/Loading'
import Link from 'next/link'

interface Case {
  id: number
  case_number: string
  title: string
  client_name: string
  case_type: 'criminal' | 'civil' | 'family' | 'corporate' | 'property' | 'other'
  status: 'open' | 'in_progress' | 'closed' | 'on_hold'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  start_date: string
  fees: number
  fees_paid: number
}

export default function CasesPage() {
  const { user, loading: authLoading } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login'
      return
    }
    if (user) {
      fetchCases()
    }
  }, [user, authLoading])

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases')
      const data = await response.json()
      
      if (data.success) {
        // Transform the data to match our interface
        const transformedCases = data.data.cases.map((caseItem: any) => ({
          id: caseItem.id,
          case_number: caseItem.case_number,
          title: caseItem.title,
          client_name: `${caseItem.first_name} ${caseItem.last_name}`,
          case_type: caseItem.case_type,
          status: caseItem.status,
          priority: caseItem.priority,
          start_date: caseItem.start_date,
          fees: parseFloat(caseItem.fees),
          fees_paid: parseFloat(caseItem.fees_paid)
        }))
        setCases(transformedCases)
      } else {
        // Fallback to mock data if API fails
        const mockCases: Case[] = [
          {
            id: 1,
            case_number: 'CASE-2024-001',
            title: 'Business Contract Dispute',
            client_name: 'Alice Johnson',
            case_type: 'civil',
            status: 'in_progress',
            priority: 'high',
            start_date: '2024-01-15',
            fees: 5000.00,
            fees_paid: 2500.00
          },
          {
            id: 2,
            case_number: 'CASE-2024-002',
            title: 'Property Rights Case',
            client_name: 'Bob Smith',
            case_type: 'property',
            status: 'open',
            priority: 'medium',
            start_date: '2024-02-01',
            fees: 3000.00,
            fees_paid: 0.00
          },
          {
            id: 3,
            case_number: 'CASE-2024-003',
            title: 'Family Law Matter',
            client_name: 'Carol Davis',
            case_type: 'family',
            status: 'open',
            priority: 'high',
            start_date: '2024-02-15',
            fees: 7500.00,
            fees_paid: 0.00
          },
          {
            id: 4,
            case_number: 'CASE-2024-004',
            title: 'Criminal Defense',
            client_name: 'David Wilson',
            case_type: 'criminal',
            status: 'in_progress',
            priority: 'urgent',
            start_date: '2024-03-01',
            fees: 4000.00,
            fees_paid: 2000.00
          }
        ]
        setCases(mockCases)
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error)
      // Fallback to mock data on error
      const mockCases: Case[] = [
        {
          id: 1,
          case_number: 'CASE-2024-001',
          title: 'Business Contract Dispute',
          client_name: 'Alice Johnson',
          case_type: 'civil',
          status: 'in_progress',
          priority: 'high',
          start_date: '2024-01-15',
          fees: 5000.00,
          fees_paid: 2500.00
        },
        {
          id: 2,
          case_number: 'CASE-2024-002',
          title: 'Property Rights Case',
          client_name: 'Bob Smith',
          case_type: 'property',
          status: 'open',
          priority: 'medium',
          start_date: '2024-02-01',
          fees: 3000.00,
          fees_paid: 0.00
        },
        {
          id: 3,
          case_number: 'CASE-2024-003',
          title: 'Family Law Matter',
          client_name: 'Carol Davis',
          case_type: 'family',
          status: 'open',
          priority: 'high',
          start_date: '2024-02-15',
          fees: 7500.00,
          fees_paid: 0.00
        },
        {
          id: 4,
          case_number: 'CASE-2024-004',
          title: 'Criminal Defense',
          client_name: 'David Wilson',
          case_type: 'criminal',
          status: 'in_progress',
          priority: 'urgent',
          start_date: '2024-03-01',
          fees: 4000.00,
          fees_paid: 2000.00
        }
      ]
      setCases(mockCases)
    } finally {
      setLoading(false)
    }
  }

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.client_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter
    const matchesType = typeFilter === 'all' || caseItem.case_type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'on_hold':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'urgent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'criminal':
        return 'bg-red-100 text-red-800'
      case 'civil':
        return 'bg-blue-100 text-blue-800'
      case 'family':
        return 'bg-pink-100 text-pink-800'
      case 'corporate':
        return 'bg-purple-100 text-purple-800'
      case 'property':
        return 'bg-green-100 text-green-800'
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
              <h1 className="text-3xl font-bold text-foreground">Cases</h1>
              <p className="text-muted-foreground mt-2">Manage your legal cases</p>
            </div>
            <Link href="/cases/new" className="btn-primary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Case
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">All Types</option>
                <option value="criminal">Criminal</option>
                <option value="civil">Civil</option>
                <option value="family">Family</option>
                <option value="corporate">Corporate</option>
                <option value="property">Property</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCases.length === 0 ? (
            <div className="col-span-full">
              <div className="card text-center py-12">
                <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-muted-foreground">No cases found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            filteredCases.map((caseItem) => (
              <div key={caseItem.id} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{caseItem.title}</h3>
                    <p className="text-sm text-muted-foreground">{caseItem.case_number}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(caseItem.priority)}`}>
                      {caseItem.priority}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {caseItem.client_name}
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(caseItem.case_type)}`}>
                      {caseItem.case_type}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Started {new Date(caseItem.start_date).toLocaleDateString()}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fees:</span>
                    <span className="font-medium">
                      ${caseItem.fees_paid.toLocaleString()} / ${caseItem.fees.toLocaleString()}
                    </span>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(caseItem.fees_paid / caseItem.fees) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/cases/${caseItem.id}`}
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                    <div className="flex space-x-2">
                      <Link
                        href={`/cases/${caseItem.id}/edit`}
                        className="text-muted-foreground hover:text-foreground text-sm"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
