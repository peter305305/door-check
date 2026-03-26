import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabase'

const SECURITY_PIN = '2026'
const ADMIN_PIN = '5959'

function PinGate({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pin === SECURITY_PIN) {
      onUnlock('security')
    } else if (pin === ADMIN_PIN) {
      onUnlock('admin')
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

function GuestCard({ guest, onCheckIn, onUndo, isBlacklisted }) {
  const isCheckedIn = guest.checked_in
  const checkedInTime = guest.checked_in_at
    ? new Date(guest.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className={`rounded-xl border p-4 sm:p-5 transition-all ${
      isBlacklisted
        ? 'bg-red-950/30 border-red-800/50'
        : isCheckedIn
          ? 'bg-surface-900/50 border-surface-700/50'
          : 'bg-surface-800 border-surface-600'
    }`}>
      {isBlacklisted && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-red-900/40 border border-red-800/40">
          <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <span className="text-sm font-semibold text-red-400">BLACKLISTED — DO NOT ADMIT</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-lg font-semibold truncate ${isBlacklisted ? 'text-red-300' : isCheckedIn ? 'text-gray-400' : 'text-white'}`}>
              {guest.first_name} {guest.last_name}
            </h3>
            {isCheckedIn && !isBlacklisted && (
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

        {!isBlacklisted && (
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
        )}
      </div>
    </div>
  )
}

function TabBar({ tab, onChange, isAdmin }) {
  const tabs = [
    { value: 'guests', label: 'Guest List' },
    { value: 'blacklist', label: 'Blacklist' },
    ...(isAdmin ? [{ value: 'admin', label: 'Add Guest' }] : []),
  ]

  return (
    <div className="flex bg-surface-800 rounded-lg border border-surface-600 p-0.5">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
            tab === t.value
              ? t.value === 'blacklist'
                ? 'bg-red-900/60 text-red-300'
                : t.value === 'admin'
                  ? 'bg-blue-900/60 text-blue-300'
                  : 'bg-surface-600 text-white'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {t.label}
        </button>
      ))}
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

function BlacklistPanel({ blacklist, onAdd, onRemove }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [reason, setReason] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (!firstName.trim()) return
    onAdd(firstName.trim(), lastName.trim(), reason.trim())
    setFirstName('')
    setLastName('')
    setReason('')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
      {/* Add form */}
      <form onSubmit={handleAdd} className="rounded-xl border border-red-800/40 bg-red-950/20 p-4 space-y-3">
        <p className="text-sm font-semibold text-red-400">Add to Blacklist</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name *"
            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-600 text-white placeholder-gray-600 outline-none focus:border-red-500 transition-colors"
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-600 text-white placeholder-gray-600 outline-none focus:border-red-500 transition-colors"
          />
        </div>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-600 text-white placeholder-gray-600 outline-none focus:border-red-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!firstName.trim()}
          className="w-full py-3 rounded-lg text-base font-semibold bg-red-600 hover:bg-red-500 disabled:bg-surface-700 disabled:text-gray-600 text-white transition-colors active:scale-[0.98]"
        >
          Add to Blacklist
        </button>
      </form>

      {/* Blacklist entries */}
      {blacklist.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600">No blacklisted individuals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blacklist.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-red-800/40 bg-red-950/20 p-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-red-300">
                  {entry.first_name} {entry.last_name}
                </h3>
                {entry.reason && (
                  <p className="text-sm text-red-400/70 mt-1">{entry.reason}</p>
                )}
                <p className="text-xs text-gray-600 mt-1">
                  Added {new Date(entry.added_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => onRemove(entry.id)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium bg-surface-700 hover:bg-surface-600 text-gray-400 hover:text-gray-200 border border-surface-600 transition-colors active:scale-[0.97]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AdminPanel({ onAdded }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [invitedBy, setInvitedBy] = useState('')
  const [contact, setContact] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState(null)
  const [recentAdds, setRecentAdds] = useState([])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!firstName.trim()) return

    const { error } = await supabase.from('checkins').insert({
      first_name: firstName.trim(),
      last_name: lastName.trim() || null,
      invited_by: invitedBy.trim() || null,
      contact_details: contact.trim() || null,
      notes: notes.trim() || null,
      attending: true,
      checked_in: false,
    })

    if (error) {
      setStatus('error')
    } else {
      setRecentAdds((prev) => [`${firstName.trim()} ${lastName.trim()}`.trim(), ...prev])
      setStatus('success')
      setFirstName('')
      setLastName('')
      setInvitedBy('')
      setContact('')
      setNotes('')
      if (onAdded) onAdded()
    }
    setTimeout(() => setStatus(null), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
      <form onSubmit={handleAdd} className="rounded-xl border border-blue-800/40 bg-blue-950/20 p-5 space-y-3">
        <p className="text-sm font-semibold text-blue-400">Add Guest to List</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name *"
            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-600 text-white placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-600 text-white placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <input
          type="text"
          value={invitedBy}
          onChange={(e) => setInvitedBy(e.target.value)}
          placeholder="Invited by"
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-600 text-white placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
        />
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Contact details (phone, email, IG)"
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-600 text-white placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
        />
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-600 text-white placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!firstName.trim()}
          className="w-full py-3 rounded-lg text-base font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-surface-700 disabled:text-gray-600 text-white transition-colors active:scale-[0.98]"
        >
          Add to Guest List
        </button>
        {status === 'success' && (
          <p className="text-center text-sm font-medium text-green-400">Guest added successfully!</p>
        )}
        {status === 'error' && (
          <p className="text-center text-sm font-medium text-red-400">Failed to add. Try again.</p>
        )}
      </form>

      {recentAdds.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Recently Added This Session</p>
          <div className="space-y-2">
            {recentAdds.map((name, i) => (
              <div key={i} className="rounded-lg border border-blue-800/30 bg-blue-950/10 px-4 py-2.5 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-white">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tab, setTab] = useState('guests')
  const [guests, setGuests] = useState([])
  const [blacklist, setBlacklist] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const searchRef = useRef(null)

  const fetchGuests = useCallback(async () => {
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .order('last_name', { ascending: true })

    if (!error && data) setGuests(data)
    setLoading(false)
  }, [])

  const fetchBlacklist = useCallback(async () => {
    const { data, error } = await supabase
      .from('blacklist')
      .select('*')
      .order('added_at', { ascending: false })

    if (!error && data) setBlacklist(data)
  }, [])

  useEffect(() => {
    if (!unlocked) return
    fetchGuests()
    fetchBlacklist()

    const guestChannel = supabase
      .channel('checkins-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkins' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setGuests((prev) => prev.map((g) => (g.id === payload.new.id ? payload.new : g)))
        } else if (payload.eventType === 'INSERT') {
          setGuests((prev) => [...prev, payload.new])
        } else if (payload.eventType === 'DELETE') {
          setGuests((prev) => prev.filter((g) => g.id !== payload.old.id))
        }
      })
      .subscribe()

    const blacklistChannel = supabase
      .channel('blacklist-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blacklist' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setBlacklist((prev) => [payload.new, ...prev])
        } else if (payload.eventType === 'DELETE') {
          setBlacklist((prev) => prev.filter((b) => b.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(guestChannel)
      supabase.removeChannel(blacklistChannel)
    }
  }, [unlocked, fetchGuests, fetchBlacklist])

  useEffect(() => {
    if (unlocked && !loading && tab === 'guests') {
      setTimeout(() => searchRef.current?.focus(), 100)
    }
  }, [unlocked, loading, tab])

  const handleCheckIn = async (id) => {
    const now = new Date().toISOString()
    setGuests((prev) => prev.map((g) => g.id === id ? { ...g, checked_in: true, checked_in_at: now } : g))
    await supabase.from('checkins').update({ checked_in: true, checked_in_at: now }).eq('id', id)
  }

  const handleUndo = async (id) => {
    setGuests((prev) => prev.map((g) => g.id === id ? { ...g, checked_in: false, checked_in_at: null } : g))
    await supabase.from('checkins').update({ checked_in: false, checked_in_at: null }).eq('id', id)
  }

  const handleAddBlacklist = async (firstName, lastName, reason) => {
    await supabase.from('blacklist').insert({ first_name: firstName, last_name: lastName || null, reason: reason || null })
    fetchBlacklist()
  }

  const handleRemoveBlacklist = async (id) => {
    await supabase.from('blacklist').delete().eq('id', id)
    fetchBlacklist()
  }

  if (!unlocked) {
    return <PinGate onUnlock={(role) => { setUnlocked(true); setIsAdmin(role === 'admin') }} />
  }

  // Build blacklist name set for quick lookup
  const blacklistNames = new Set(
    blacklist.map((b) => `${(b.first_name || '').toLowerCase()} ${(b.last_name || '').toLowerCase()}`.trim())
  )

  const isGuestBlacklisted = (g) => {
    const fullName = `${(g.first_name || '').toLowerCase()} ${(g.last_name || '').toLowerCase()}`.trim()
    return blacklistNames.has(fullName)
  }

  const searchLower = search.toLowerCase().trim()

  // Find blacklisted people who aren't on the guest list but match the search
  const guestNames = new Set(
    guests.map((g) => `${(g.first_name || '').toLowerCase()} ${(g.last_name || '').toLowerCase()}`.trim())
  )
  const blacklistOnlyResults = searchLower
    ? blacklist
        .filter((b) => {
          const fn = (b.first_name || '').toLowerCase()
          const ln = (b.last_name || '').toLowerCase()
          const full = `${fn} ${ln}`.trim()
          // Not already on guest list
          if (guestNames.has(full)) return false
          // Matches search
          return fn.includes(searchLower) || ln.includes(searchLower) || full.includes(searchLower)
        })
        .map((b) => ({
          id: `bl-${b.id}`,
          first_name: b.first_name,
          last_name: b.last_name || '',
          invited_by: null,
          contact_details: null,
          notes: b.reason ? `Blacklist reason: ${b.reason}` : null,
          checked_in: false,
          checked_in_at: null,
          _blacklistOnly: true,
        }))
    : []

  const filtered = [...guests, ...blacklistOnlyResults]
    .filter((g) => {
      if (searchLower) {
        const match =
          (g.first_name || '').toLowerCase().includes(searchLower) ||
          (g.last_name || '').toLowerCase().includes(searchLower) ||
          (`${g.first_name} ${g.last_name}`).toLowerCase().includes(searchLower) ||
          (g.invited_by || '').toLowerCase().includes(searchLower)
        if (!match) return false
      }
      if (g._blacklistOnly) return true
      if (filter === 'pending') return !g.checked_in
      if (filter === 'checked') return g.checked_in
      return true
    })
    .sort((a, b) => {
      // Blacklisted first, then unchecked, then checked
      const aBlack = isGuestBlacklisted(a) || a._blacklistOnly
      const bBlack = isGuestBlacklisted(b) || b._blacklistOnly
      if (aBlack && !bBlack) return -1
      if (!aBlack && bBlack) return 1
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
                <span className="text-gray-600 ml-1">in</span>
              </span>
              {blacklist.length > 0 && (
                <span className="text-sm font-medium text-red-400 ml-2">
                  {blacklist.length} banned
                </span>
              )}
            </div>
          </div>

          {/* Tab bar */}
          <TabBar tab={tab} onChange={setTab} isAdmin={isAdmin} />

          {/* Search & filter (guests tab only) */}
          {tab === 'guests' && (
            <>
              <div className="relative mt-3">
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
              <div className="mt-3 flex items-center justify-between">
                <FilterToggle filter={filter} onChange={setFilter} />
                <span className="text-xs text-gray-600">
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {tab === 'guests' ? (
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
                  isBlacklisted={isGuestBlacklisted(guest) || guest._blacklistOnly}
                />
              ))}
            </div>
          )}
        </div>
      ) : tab === 'blacklist' ? (
        <BlacklistPanel
          blacklist={blacklist}
          onAdd={handleAddBlacklist}
          onRemove={handleRemoveBlacklist}
        />
      ) : tab === 'admin' && isAdmin ? (
        <AdminPanel onAdded={fetchGuests} />
      ) : null}
    </div>
  )
}
