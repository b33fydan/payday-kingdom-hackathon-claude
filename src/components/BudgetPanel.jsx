import { useState } from 'react'
import useGameStore from '../lib/gameState'
import { BILL_CATEGORIES, MONSTER_COLOR_HEX, formatCurrency, getTierName, getIslandStageName } from '../lib/constants'
import { playBillAdd, playBillRemove } from '../lib/soundManager'

const CATEGORY_BG = {
  housing: 'bg-red-900/30',
  utilities: 'bg-yellow-900/30',
  phone: 'bg-purple-900/30',
  transport: 'bg-orange-900/30',
  food: 'bg-green-900/30',
  insurance: 'bg-blue-900/30',
  entertainment: 'bg-pink-900/30',
  other: 'bg-gray-900/30',
}

export default function BudgetPanel({ onOpenSettings }) {
  const {
    kingdomName, income, bills, isBattling, level,
    monthsCompleted, islandStage, totalBillsSlain,
    triggerPayday, resetMonth,
    setIncome, addBill, removeBill,
  } = useGameStore()

  const [billName, setBillName] = useState('')
  const [billAmount, setBillAmount] = useState('')
  const [billCategory, setBillCategory] = useState('housing')

  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0)
  const surplus = income - totalBills
  const allPaid = bills.length > 0 && bills.every(b => b.isPaid)
  const activeBills = bills.filter(b => !b.isPaid).length

  const tierName = getTierName(level)
  const stageName = getIslandStageName(islandStage)
  const currentMonth = new Date().toISOString().slice(0, 7)

  const handleAddBill = (e) => {
    e.preventDefault()
    if (!billName.trim() || !billAmount) return
    addBill({ name: billName.trim(), amount: Number(billAmount), category: billCategory })
    playBillAdd()
    setBillName('')
    setBillAmount('')
  }

  const handlePayday = async () => {
    if (isBattling) return
    const battleResult = triggerPayday()
    if (!battleResult) return
    if (window.__runBattleAnimation) {
      await window.__runBattleAnimation(battleResult)
    }
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#0a1628' }}>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-7 space-y-5">

        {/* Title Block — The Crown */}
        <div className="text-center pt-6 pb-4 px-4">
          {onOpenSettings && (
            <div className="flex justify-end -mt-4 mb-3">
              <button
                onClick={onOpenSettings}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                title="Settings"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.062 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          <p className="font-pixel text-emerald-400/60 uppercase tracking-widest text-shadow-label" style={{ fontSize: '0.5rem' }}>
            Your Kingdom Treasury
          </p>
          <p className="font-pixel text-emerald-400 uppercase tracking-widest mt-1.5 text-shadow-label" style={{ fontSize: '0.65rem' }}>
            Payday Kingdom
          </p>
          <h1 className="font-pixel text-white mt-4 text-shadow-title leading-relaxed text-3xl md:text-4xl" style={{ lineHeight: '1.8' }}>
            {kingdomName || 'My Kingdom'}
          </h1>
          {/* Badge row: level + stage + month */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <span className="font-sans text-xs text-amber-400/90 bg-amber-400/10 px-3 py-1 rounded-full text-shadow-label">
              Lv.{level} {tierName}
            </span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="font-sans text-xs text-slate-300/80 bg-white/5 px-3 py-1 rounded-full text-shadow-label">
              {stageName}
            </span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="font-sans text-xs text-slate-400/80 bg-white/5 px-3 py-1 rounded-full text-shadow-label">
              Month #{monthsCompleted}
            </span>
          </div>
          <p className="font-sans text-slate-500 text-xs italic mt-4 leading-relaxed max-w-xs mx-auto">
            Income feeds the treasury, bills become monsters, and each payday advances {kingdomName || 'your kingdom'} into a richer month.
          </p>
          <div className="divider-glow mt-5" />
        </div>

        {/* Monthly Income Card */}
        <div className="panel-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="panel-label text-shadow-label" style={{ fontSize: '0.75rem' }}>Monthly Income</span>
            <span className="font-sans text-xs text-slate-500">{currentMonth}</span>
          </div>
          <div className="flex">
            <span className="currency-badge text-xl" style={{ padding: '0 1rem' }}>$</span>
            <input
              type="number"
              value={income || ''}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="0"
              className="panel-input w-full px-5 py-4 text-xl font-bold rounded-l-none"
            />
          </div>
        </div>

        {/* Bills Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="panel-label text-shadow-label" style={{ fontSize: '0.75rem' }}>Bills (Monsters to Slay)</span>
            <span className="font-sans text-xs text-slate-500">{activeBills} active</span>
          </div>

          {/* Existing bills as individual cards */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {bills.map(bill => {
              const cat = BILL_CATEGORIES.find(c => c.id === bill.category)
              return (
                <div key={bill.id} className={`panel-card ${bill.isPaid ? 'opacity-50' : ''}`} style={{ padding: '1.1rem 1.25rem' }}>
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl ${CATEGORY_BG[bill.category] || 'bg-gray-900/30'} flex items-center justify-center shrink-0 mt-0.5`}>
                      <span className="text-xl">{cat?.emoji || '📋'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-sans text-lg font-bold text-white truncate text-shadow-label">{bill.name}</span>
                        <span className="font-sans text-xl text-white font-bold shrink-0 text-shadow-label">{formatCurrency(bill.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="font-sans text-xs text-slate-500">{cat?.label || 'Other'}</span>
                        <span className="font-sans text-xs text-slate-500 uppercase tracking-wider">{bill.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    {bill.isPaid ? (
                      <span className="font-sans text-xs font-bold text-emerald-400 tracking-wider uppercase">Slain</span>
                    ) : (
                      <button
                        onClick={() => { removeBill(bill.id); playBillRemove() }}
                        className="font-sans text-xs text-red-400 uppercase tracking-wider border border-red-400/30 rounded-lg px-4 py-1.5 hover:bg-red-400/10 transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {bills.length === 0 && (
              <div className="panel-card text-center py-8">
                <p className="text-slate-500 text-sm font-sans">No monsters yet. Add your first bill below.</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Bill Card */}
        <div className="panel-card" style={{ padding: '1.25rem 1.5rem' }}>
          <span className="panel-label text-shadow-label block mb-4" style={{ fontSize: '0.75rem' }}>Add Bill</span>
          <form onSubmit={handleAddBill} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                placeholder="Bill name"
                className="panel-input px-4 py-3.5 text-base col-span-1"
              />
              <div className="flex">
                <span className="currency-badge text-base">$</span>
                <input
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="Amount"
                  className="panel-input w-full px-4 py-3.5 text-base rounded-l-none"
                />
              </div>
              <select
                value={billCategory}
                onChange={(e) => setBillCategory(e.target.value)}
                className="panel-input px-4 py-3.5 text-base col-span-2"
              >
                {BILL_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-pixel uppercase tracking-wider text-xs py-4 rounded-xl transition-all active:scale-[0.98] text-shadow-label"
            >
              Add Bill
            </button>
          </form>
        </div>

        {/* Stats Row: Totals */}
        <div className="grid grid-cols-3 gap-3">
          <div className="panel-card text-center" style={{ padding: '1.25rem 0.75rem' }}>
            <span className="panel-label text-shadow-label block mb-2" style={{ fontSize: '0.65rem' }}>Total Bills</span>
            <p className="font-sans text-white font-bold text-2xl text-shadow-label">{formatCurrency(totalBills)}</p>
          </div>
          <div className="panel-card text-center" style={{ padding: '1.25rem 0.75rem' }}>
            <span className="panel-label text-shadow-label block mb-2" style={{ fontSize: '0.65rem' }}>Surplus</span>
            <p className={`font-sans font-bold text-2xl text-shadow-label ${surplus >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(surplus)}
            </p>
          </div>
          <div className="panel-card text-center" style={{ padding: '1.25rem 0.75rem' }}>
            <span className="panel-label text-shadow-label block mb-2" style={{ fontSize: '0.65rem' }}>Bills Slain</span>
            <p className="font-sans text-amber-400 font-bold text-2xl text-shadow-label">{totalBillsSlain}</p>
          </div>
        </div>

      </div>

      {/* Sticky bottom: Trigger Payday */}
      <div className="px-6 py-5 md:px-8 border-t border-slate-800/50" style={{ background: '#0a1628' }}>
        {allPaid ? (
          <button
            onClick={() => resetMonth()}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl py-5 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
          >
            <span className="font-pixel text-base block text-shadow-heading">NEW MONTH</span>
            <span className="font-sans text-sm text-blue-100/70 block mt-1.5">Reset bills and continue your journey</span>
          </button>
        ) : (
          <button
            onClick={handlePayday}
            disabled={isBattling}
            className="payday-btn w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-700 text-slate-900 disabled:text-slate-500 rounded-2xl py-5 transition-all active:scale-[0.98] shadow-lg shadow-yellow-500/25 disabled:shadow-none"
          >
            <span className="font-pixel text-base block text-shadow-heading">{isBattling ? 'BATTLING...' : 'TRIGGER PAYDAY'}</span>
            {!isBattling && (
              <span className="font-sans text-sm text-slate-800/70 block mt-1.5">Spawn the hero and slay this month's monsters</span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
