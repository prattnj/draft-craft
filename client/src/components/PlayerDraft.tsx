import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useSocket } from '@/hooks/useSocket'
import { BankItem } from '@/types/game'
import { soundYourTurn, soundAutoPick } from '@/sounds'
import Timer from './Timer'
import clsx from 'clsx'

type Tab = 'bank' | 'mypicks' | 'predraft' | 'watchlist'

export default function PlayerDraft() {
  const { room, myId, autoPick, setAutoPick } = useGameStore()
  const { send } = useSocket()
  const [tab, setTab] = useState<Tab>('bank')
  const [search, setSearch] = useState('')
  const [pickingFor, setPickingFor] = useState<BankItem | null>(null)

  const currentPickerId = room?.draft?.pickOrder[room.draft.currentPickIndex]
  const isMyTurn = !!myId && currentPickerId === myId
  const prevIsMyTurn = useRef(false)

  useEffect(() => {
    if (isMyTurn && !prevIsMyTurn.current) soundYourTurn()
    prevIsMyTurn.current = isMyTurn
  }, [isMyTurn])

  useEffect(() => {
    if (autoPick) soundAutoPick()
  }, [autoPick])

  if (!room || !myId || !room.draft) return null

  const me = room.players.find(p => p.id === myId)!
  const draft = room.draft
  const currentPicker = room.players.find(p => p.id === currentPickerId)
  const category = room.category
  const settings = room.settings
  const totalRounds = category.isNone ? (settings.roundCount ?? 10) : category.positions.length

  const available = room.availableDraftees.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  const onWatchlist = (id: string) => me.watchlist.includes(id)
  const onPreDraft = (id: string) => me.preDraft.some(pd => pd.drafteeId === id)

  const emptyPositions = category.isNone
    ? null
    : category.positions.filter(pos => !me.picks.some(pk => pk.positionId === pos.id))

  const handlePickDraftee = (draftee: BankItem) => {
    if (!isMyTurn || draft.pendingAutoPick) return
    if (category.isNone) {
      send({ type: 'make_pick', drafteeId: draftee.id, positionId: `pick-${me.picks.length + 1}` })
      setPickingFor(null)
    } else {
      setPickingFor(draftee)
    }
  }

  const handlePickPosition = (posId: string) => {
    if (!pickingFor) return
    send({ type: 'make_pick', drafteeId: pickingFor.id, positionId: posId })
    setPickingFor(null)
  }

  const handlePreDraftDraftee = (draftee: BankItem) => {
    if (isMyTurn) return
    if (category.isNone) {
      send({ type: 'pre_draft_add', drafteeId: draftee.id, positionId: 'next' })
    } else {
      setPickingFor(draftee)
    }
  }

  const handlePreDraftPosition = (posId: string) => {
    if (!pickingFor) return
    send({ type: 'pre_draft_add', drafteeId: pickingFor.id, positionId: posId })
    setPickingFor(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Turn banner */}
      <div className={clsx(
        'px-4 py-3 flex items-center justify-between',
        isMyTurn ? 'bg-brand-700' : 'bg-gray-900 border-b border-gray-800'
      )}>
        <div>
          {isMyTurn ? (
            <span className="font-bold text-white">Your turn to pick!</span>
          ) : (
            <span className="text-gray-400 text-sm">
              <span className="font-medium text-gray-200">{currentPicker?.name}</span> is picking…
            </span>
          )}
          <div className="text-xs text-gray-400 mt-0.5">
            Round {Math.floor(draft.currentPickIndex / room.players.length) + 1}/{totalRounds}
          </div>
        </div>
        {draft.timerExpiresAt && <Timer expiresAt={draft.timerExpiresAt} />}
      </div>

      {/* Auto-pick prompt */}
      {autoPick && isMyTurn && draft.pendingAutoPick && (
        <div className="mx-4 mt-3 card p-4 border-yellow-700 bg-yellow-900/20">
          <p className="font-semibold text-yellow-300 mb-1">⚡ Auto-pick ready</p>
          <p className="text-sm text-gray-300 mb-3">
            <span className="font-bold">{autoPick.drafteeeName}</span> → {autoPick.pick.positionLabel}
          </p>
          <div className="flex gap-2">
            <button className="btn-primary flex-1 py-2" onClick={() => { send({ type: 'confirm_auto_pick' }); setAutoPick(null) }}>
              Confirm
            </button>
            <button className="btn-secondary flex-1 py-2" onClick={() => { send({ type: 'skip_auto_pick' }); setAutoPick(null) }}>
              Skip & Pick Manually
            </button>
          </div>
        </div>
      )}

      {/* Position picker modal */}
      {pickingFor && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end">
          <div className="w-full bg-gray-900 rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400">{isMyTurn ? 'Pick for' : 'Pre-draft'}</p>
                <p className="font-bold text-lg">{pickingFor.name}</p>
              </div>
              <button className="btn-ghost" onClick={() => setPickingFor(null)}>✕</button>
            </div>
            <div className="space-y-2">
              {(emptyPositions ?? category.positions).map(pos => (
                <button
                  key={pos.id}
                  className="w-full card px-4 py-3 text-left hover:bg-gray-800 transition flex items-center gap-3"
                  onClick={() => isMyTurn ? handlePickPosition(pos.id) : handlePreDraftPosition(pos.id)}
                >
                  <span className="text-gray-200 font-medium">{pos.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {(['bank', 'mypicks', 'predraft', 'watchlist'] as Tab[]).map(t => (
          <button
            key={t}
            className={clsx(
              'flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition',
              tab === t ? 'text-brand-400 border-b-2 border-brand-500' : 'text-gray-500 hover:text-gray-300'
            )}
            onClick={() => setTab(t)}
          >
            {t === 'bank' && 'Bank'}
            {t === 'mypicks' && `My Picks (${me.picks.length})`}
            {t === 'predraft' && `Pre-Draft (${me.preDraft.length})`}
            {t === 'watchlist' && `Watch (${me.watchlist.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'bank' && (
          <div>
            <div className="p-3 sticky top-0 bg-gray-950 z-10">
              <input
                className="input text-sm py-2"
                placeholder="Search draftees…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="px-3 pb-3 space-y-1">
              {available.map(d => (
                <div key={d.id} className="flex items-center gap-2">
                  <button
                    className={clsx(
                      'flex-1 text-left px-4 py-2.5 rounded-xl text-sm font-medium transition',
                      isMyTurn && !draft.pendingAutoPick
                        ? 'hover:bg-brand-800 hover:text-white cursor-pointer bg-gray-900'
                        : 'bg-gray-900 text-gray-300 cursor-default'
                    )}
                    onClick={() => isMyTurn && !draft.pendingAutoPick ? handlePickDraftee(d) : handlePreDraftDraftee(d)}
                  >
                    {d.name}
                    {onPreDraft(d.id) && <span className="ml-2 badge bg-brand-900 text-brand-300">pre</span>}
                  </button>
                  <button
                    className={clsx('p-2 rounded-lg transition text-sm', onWatchlist(d.id) ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400')}
                    title="Add to watchlist"
                    onClick={() => send(onWatchlist(d.id) ? { type: 'watchlist_remove', drafteeId: d.id } : { type: 'watchlist_add', drafteeId: d.id })}
                  >
                    ★
                  </button>
                </div>
              ))}
              {available.length === 0 && (
                <p className="text-gray-600 text-center py-8">No draftees found</p>
              )}
            </div>
          </div>
        )}

        {tab === 'mypicks' && (
          <div className="p-4 space-y-2">
            {category.isNone ? (
              me.picks.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No picks yet</p>
              ) : (
                <ol className="space-y-2">
                  {me.picks.map((pk, i) => (
                    <li key={pk.positionId} className="card px-4 py-3 flex gap-3 text-sm items-center">
                      <span className="text-gray-500 w-6">{i + 1}.</span>
                      <span className="font-medium">{pk.drafteeeName}</span>
                    </li>
                  ))}
                </ol>
              )
            ) : (
              category.positions.map(pos => {
                const pick = me.picks.find(pk => pk.positionId === pos.id)
                const canSwap = settings.allowSwaps && pick
                return (
                  <div key={pos.id} className="card px-4 py-3 flex gap-3 text-sm items-center">
                    <span className="text-gray-400 shrink-0 text-xs">{pos.label}</span>
                    {pick ? (
                      <>
                        <span className="font-medium flex-1">{pick.drafteeeName}</span>
                        {canSwap && (
                          <button
                            className="text-xs text-gray-500 hover:text-brand-400"
                            onClick={() => {
                              const other = prompt('Swap with which position? (type the label)')
                              if (!other) return
                              const target = category.positions.find(p => p.label.toLowerCase() === other.toLowerCase())
                              if (target) send({ type: 'swap_picks', positionIdA: pos.id, positionIdB: target.id })
                            }}
                          >
                            swap
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'predraft' && (
          <div className="p-4 space-y-2">
            {me.preDraft.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-2">No pre-draft picks</p>
                <p className="text-gray-700 text-sm">Tap a name in the Bank to queue a pick for your next turn</p>
              </div>
            ) : (
              me.preDraft.map((pd, i) => {
                const available = room.availableDraftees.some(d => d.id === pd.drafteeId)
                return (
                  <div key={i} className={clsx('card px-4 py-3 flex items-center gap-3 text-sm', !available && 'opacity-40')}>
                    <span className="text-gray-500 w-5">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{room.availableDraftees.find(d => d.id === pd.drafteeId)?.name ?? pd.drafteeId}</div>
                      {!category.isNone && <div className="text-xs text-gray-500">→ {pd.positionLabel}</div>}
                      {!available && <div className="text-xs text-red-400">Already drafted</div>}
                    </div>
                    <div className="flex gap-1">
                      {i > 0 && (
                        <button className="btn-ghost py-1 px-2 text-xs" onClick={() => send({ type: 'pre_draft_reorder', from: i, to: i - 1 })}>↑</button>
                      )}
                      {i < me.preDraft.length - 1 && (
                        <button className="btn-ghost py-1 px-2 text-xs" onClick={() => send({ type: 'pre_draft_reorder', from: i, to: i + 1 })}>↓</button>
                      )}
                      <button className="btn-ghost py-1 px-2 text-xs text-red-400" onClick={() => send({ type: 'pre_draft_remove', index: i })}>✕</button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'watchlist' && (
          <div className="p-4 space-y-2">
            {me.watchlist.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-2">Watchlist is empty</p>
                <p className="text-gray-700 text-sm">Tap the ★ next to a name in the Bank to watch them</p>
              </div>
            ) : (
              me.watchlist.map(id => {
                const draftee = room.availableDraftees.find(d => d.id === id)
                return (
                  <div key={id} className={clsx('card px-4 py-3 flex items-center gap-3 text-sm', !draftee && 'opacity-40')}>
                    <span className="text-yellow-400">★</span>
                    <span className="flex-1 font-medium">{draftee?.name ?? id}</span>
                    {!draftee && <span className="text-xs text-gray-500">Drafted</span>}
                    <button
                      className="text-xs text-gray-500 hover:text-red-400"
                      onClick={() => send({ type: 'watchlist_remove', drafteeId: id })}
                    >
                      ✕
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
