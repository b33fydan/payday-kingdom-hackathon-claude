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
      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-7 space-y-4">

        {/* Header */}
        <div className="text-center pt-2 pb-1">
          {onOpenSettings && (
            <div className="flex justify-end mb-2">
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
          <p className="font-pixel text-emerald-400/70 uppercase tracking-widest text-shadow-label" style={{ fontSize: '0.55rem' }}>
            Payday Kingdom
          </p>
          <h1 className="font-pixel text-white text-xl mt-2 text-shadow-heading" style={{ lineHeight: '1.6' }}>
            {kingdomName || 'My Kingdom'}
          </h1>
          <p className="font-sans text-slate-500 text-xs italic mt-2 leading-relaxed">
            Income feeds the treasury, bills become monsters, and each payday advances {kingdomName || 'your kingdom'} into a richer month.
          </p>
          <div className="divider-glow mt-4" />
        </div>

        {/* Monthly Income Card */}
        <div className="panel-card">
          <div className="flex items-center justify-between mb-3">
            <span className="panel-label text-shadow-label">Monthly Income</span>
            <span className="font-sans text-xs text-slate-500">{currentMonth}</span>
          </div>
          <div className="flex">
            <span className="currency-badge text-lg">$</span>
            <input
              type="number"
              value={income || ''}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="0"
              className="panel-input w-full px-4 py-4 text-lg font-medium rounded-l-none"
            />
          </div>
        </div>

        {/* Bills Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="panel-label text-shadow-label">Bills (Monsters to Slay)</span>
            <span className="font-sans text-xs text-slate-500">{activeBills} active</span>
          </div>

          {/* Existing bills as individual cards */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {bills.map(bill => {
              const cat = BILL_CATEGORIES.find(c => c.id === bill.category)
              return (
                <div key={bill.id} className={`panel-card ${bill.isPaid ? 'opacity-50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${CATEGORY_BG[bill.category] || 'bg-gray-900/30'} flex items-center justify-center shrink-0 mt-0.5`}>
                      <span className="text-lg">{cat?.emoji || '📋'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-sans text-base font-bold text-white truncate">{bill.name}</span>
                        <span className="font-sans text-base text-white font-bold shrink-0">{formatCurrency(bill.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-sans text-xs text-slate-500">{cat?.label || 'Other'}</span>
                        <span className="font-sans text-xs text-slate-500 uppercase tracking-wider">{bill.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    {bill.isPaid ? (
                      <span className="font-sans text-xs font-bold text-emerald-400 tracking-wider uppercase">Slain</span>
                    ) : (
                      <button
                        onClick={() => { removeBill(bill.id); playBillRemove() }}
                        className="font-sans text-xs text-red-400 uppercase tracking-wider border border-red-400/30 rounded-lg px-3 py-1 hover:bg-red-400/10 transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {bills.length === 0 && (
              <div className="panel-card text-center py-6">
                <p className="text-slate-500 text-sm font-sans">No monsters yet. Add your first bill below.</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Bill Card */}
        <div className="panel-card">
          <span className="panel-label text-shadow-label block mb-3">Add Bill</span>
          <form onSubmit={handleAddBill} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                placeholder="Bill name"
                className="panel-input px-4 py-3 text-sm col-span-1"
              />
              <div className="flex">
                <span className="currency-badge text-sm">$</span>
                <input
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="Amount"
                  className="panel-input w-full px-3 py-3 text-sm rounded-l-none"
                />
              </div>
              <select
                value={billCategory}
                onChange={(e) => setBillCategory(e.target.value)}
                className="panel-input px-4 py-3 text-sm col-span-2"
              >
                {BILL_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-pixel uppercase tracking-wider text-xs py-3.5 rounded-xl transition-all active:scale-[0.98] text-shadow-label"
            >
              Add Bill
            </button>
          </form>
        </div>

        {/* Stats Row: Hero Rank + Island Stage */}
        <div className="grid grid-cols-2 gap-3">
          <div className="panel-card">
            <span className="panel-label text-shadow-label block mb-1">Hero Rank</span>
            <p className="font-sans text-white font-bold text-lg text-shadow-label">Lv.{level} {tierName}</p>
          </div>
          <div className="panel-card">
            <span className="panel-label text-shadow-label block mb-1">Island Stage</span>
            <p className="font-sans text-white font-bold text-lg text-shadow-label">{stageName}</p>
          </div>
        </div>

        {/* Stats Row: Totals */}
        <div className="grid grid-cols-3 gap-3">
          <div className="panel-card text-center">
            <span className="panel-label text-shadow-label block mb-1">Total Bills</span>
            <p className="font-sans text-white font-bold text-xl text-shadow-label">{formatCurrency(totalBills)}</p>
          </div>
          <div className="panel-card text-center">
            <span className="panel-label text-shadow-label block mb-1">Surplus</span>
            <p className={`font-sans font-bold text-xl text-shadow-label ${surplus >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(surplus)}
            </p>
          </div>
          <div className="panel-card text-center">
            <span className="panel-label text-shadow-label block mb-1">Months</span>
            <p className="font-sans text-white font-bold text-xl text-shadow-label">{monthsCompleted}</p>
          </div>
        </div>

      </div>

      {/* Sticky bottom: Trigger Payday */}
      <div className="px-6 py-4 md:px-8 border-t border-slate-800/50" style={{ background: '#0a1628' }}>
        {allPaid ? (
          <button
            onClick={() => resetMonth()}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl py-4 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
          >
            <span className="font-pixel text-sm block text-shadow-heading">NEW MONTH</span>
            <span className="font-sans text-xs text-blue-100/70 block mt-1">Reset bills and continue your journey</span>
          </button>
        ) : (
          <button
            onClick={handlePayday}
            disabled={isBattling}
            className="payday-btn w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-700 text-slate-900 disabled:text-slate-500 rounded-xl py-4 transition-all active:scale-[0.98] shadow-lg shadow-yellow-500/25 disabled:shadow-none"
          >
            <span className="font-pixel text-sm block text-shadow-heading">{isBattling ? 'BATTLING...' : 'TRIGGER PAYDAY'}</span>
            {!isBattling && (
              <span className="font-sans text-xs text-slate-800/70 block mt-1">Spawn the hero and slay this month's monsters</span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
