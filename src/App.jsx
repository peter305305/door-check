import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabase'

const PIN_CODE = '2026'
const TABLE = 'checkins'

function PinGate({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pin === PIN_CODE) {
      onUnlock()
    } else {
      setError(true)
      setPin('')
      setTimeout(() => setError(false), 1500)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-800 border border-surface-600 mb-5">
            <svg className="w-8 h-8 text-accent-green" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Door Check</h1>
          <p className="text-gray-500 mt-2 text-sm">Enter security PIN to continue</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="----"
            className={`w-full text-center text-4xl tracking-[0.5em] font-mono py-4 px-6 rounded-xl bg-surface-800 border ${
              error ? 'border-red-500' : 'border-surface-600 focus:border-accent-green'
            } text-white placeholder-gray-600 outline-none transition-colors`}
          />
          {error && (
            <p className="text-red-400 text-sm text-center mt-3">Incorrect PIN</p>
          )}
          <button
            type="submit"
            className="w-full mt-5 py-4 rounded-xl bg-accent-green hover:bg-accent-green-hover text-white font-semibold text-lg transition-colors active:scale-[0.98]"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  )
}

function GuestCard({ guest, onCheckIn, onUndo }) {
  const isCheckedIn = guest.checked_in
  const checkedInTime = guest.checked_in_at
    ? new Date(guest.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className={`rounded-xl border p-4 sm:p-5 transition-all ${
      isCheckedIn
        ? 'bg-surface-900/50 border-surface-700/50'
        : 'bg-surface-800 border-surface-600'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-lg font-semibold truncate ${isCheckedIn ? 'text-gray-400' : 'text-white'}`}>
              {guest.first_name} {guest.last_name}
            </h3>
            {isCheckedIn && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/40 text-green-400 border border-green-800/40 whitespace-nowrap">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                CHECKED IN
              </span>
            )}
          </div>

          {guest.invited_by && (
            <p className="text-sm text-gray-500 mt-1">
              <span className="text-gray-600">Invited by</span>{' '}
              <span className={isCheckedIn ? 'text-gray-500' : 'text-gray-300'}>{guest.invited_by}</span>
            </p>
          )}

          {guest.contact_details && (
            <p className="text-sm text-gray-500 mt-1">
              <span className="text-gray-600">Contact</span>{' '}
              <span className={isCheckedIn ? 'text-gray-500' : 'text-gray-300'}>{guest.contact_details}</span>
            </p>
          )}

          {guest.notes && (
            <p className={`text-sm mt-2 ${isCheckedIn ? 'text-gray-600' : 'text-yellow-500/80'}`}>
              {guest.notes}
            </p>
          )}

          {checkedInTime && (
            <p className="text-xs text-gray-600 mt-2">Checked in at {checkedInTime}</p>
          )}
        </div>

        <div className="flex-shrink-0">
          {isCheckedIn ? (
            <button
              onClick={() => onUndo(guest.id)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium bg-surface-700 hover:bg-surface-600 text-gray-400 hover:text-gray-200 border border-surface-600 transition-colors active:scale-[0.97]"
            >
              Undo
            </button>
          ) : (
            <button
              onClick={() => onCheckIn(guest.id)}
              className="px-5 py-3 rounded-lg text-base font-semibold bg-accent-green hover:bg-accent-green-hover text-white shadow-lg shadow-green-900/20 transition-colors active:scale-[0.97]"
            >
              Check In
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterToggle({ filter, onChange }) {
  const options = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Not Checked In' },
    { value: 'checked', label: 'Checked In' },
  ]

  return (
    <div className="flex bg-surface-800 rounded-lg border border-surface-600 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            filter === opt.value
              ? 'bg-surface-600 text-white'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [guests, setGuests] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const searchRef = useRef(null)

  // Fetch all guests on mount
  const fetchGuests = useCallback(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('last_name', { ascending: true })

    if (!error && data) {
      setGuests(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!unlocked) return
    fetchGuests()

    // Real-time subscription
    const channel = supabase
      .channel('guests-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setGuests((prev) =>
              prev.map((g) => (g.id === payload.new.id ? payload.new : g))
            )
          } else if (payload.eventType === 'INSERT') {
            setGuests((prev) => [...prev, payload.new])
          } else if (payload.eventType === 'DELETE') {
            setGuests((prev) => prev.filter((g) => g.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [unlocked, fetchGuests])

  // Auto-focus search when unlocked
  useEffect(() => {
    if (unlocked && !loading) {
      setTimeout(() => searchRef.current?.focus(), 100)
    }
  }, [unlocked, loading])

  const handleCheckIn = async (id) => {
    const now = new Date().toISOString()
    // Optimistic update
    setGuests((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, checked_in: true, checked_in_at: now } : g
      )
    )
    await supabase
      .from(TABLE)
      .update({ checked_in: true, checked_in_at: now })
      .eq('id', id)
  }

  const handleUndo = async (id) => {
    // Optimistic update
    setGuests((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, checked_in: false, checked_in_at: null } : g
      )
    )
    await supabase
      .from(TABLE)
      .update({ checked_in: false, checked_in_at: null })
      .eq('id', id)
  }

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} />
  }

  const searchLower = search.toLowerCase().trim()
  const filtered = guests
    .filter((g) => {
      // Search filter
      if (searchLower) {
        const match =
          (g.first_name || '').toLowerCase().includes(searchLower) ||
          (g.last_name || '').toLowerCase().includes(searchLower) ||
          (`${g.first_name} ${g.last_name}`).toLowerCase().includes(searchLower) ||
          (g.invited_by || '').toLowerCase().includes(searchLower)
        if (!match) return false
      }
      // Status filter
      if (filter === 'pending') return !g.checked_in
      if (filter === 'checked') return g.checked_in
      return true
    })
    .sort((a, b) => {
      // Unchecked first, then checked
      if (a.checked_in && !b.checked_in) return 1
      if (!a.checked_in && b.checked_in) return -1
      return 0
    })

  const totalGuests = guests.length
  const checkedInCount = guests.filter((g) => g.checked_in).length

  return (
    <div className="min-h-dvh pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface-950/95 backdrop-blur-md border-b border-surface-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-white tracking-tight">Door Check</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">
                <span className="text-accent-green font-bold">{checkedInCount}</span>
                <span className="text-gray-600"> / </span>
                <span className="text-gray-400">{totalGuests}</span>
                <span className="text-gray-600 ml-1">checked in</span>
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guests..."
              className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-surface-800 border border-surface-600 text-white text-lg placeholder-gray-600 outline-none focus:border-accent-green transition-colors"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); searchRef.current?.focus() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-600 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <div className="mt-3 flex items-center justify-between">
            <FilterToggle filter={filter} onChange={setFilter} />
            <span className="text-xs text-gray-600">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Guest list */}
      <div className="max-w-2xl mx-auto px-4 mt-4">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-surface-600 border-t-accent-green rounded-full animate-spin" />
            <p className="text-gray-600 mt-3 text-sm">Loading guests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-12 h-12 mx-auto text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
            </svg>
            <p className="text-gray-600 mt-3">No guests found</p>
            {search && (
              <p className="text-gray-700 text-sm mt-1">Try a different search term</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((guest) => (
              <GuestCard
                key={guest.id}
                guest={guest}
                onCheckIn={handleCheckIn}
                onUndo={handleUndo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
