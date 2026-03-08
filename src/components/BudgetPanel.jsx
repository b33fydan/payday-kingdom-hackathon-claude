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

        {/* Title Block — left-aligned, commanding */}
        <div className="pt-4 pb-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-pixel text-emerald-400 uppercase tracking-widest text-shadow-label" style={{ fontSize: '0.6rem' }}>
                Your Kingdom Treasury
              </p>
              <p className="font-sans text-slate-500 uppercase text-xs tracking-wider mt-1">Payday Kingdom</p>
            </div>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="font-pixel text-xs text-slate-400 border border-slate-600 rounded-lg px-4 py-2 hover:text-white hover:border-slate-400 transition-all text-shadow-label"
              >
                Settings
              </button>
            )}
          </div>
          <h1 className="font-pixel text-white mt-5 text-shadow-title text-4xl md:text-5xl" style={{ lineHeight: '1.4' }}>
            {kingdomName || 'My Kingdom'}
          </h1>
          <p className="font-sans text-slate-400 text-sm mt-4 leading-relaxed">
            Income feeds the treasury, bills become monsters, and each payday advances {kingdomName || 'your kingdom'} into a richer month.
          </p>
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
            <span className="font-sans text-xs text-slate-500 uppercase tracking-wider">{activeBills} active</span>
          </div>

          {/* Existing bills */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {bills.map(bill => {
              const cat = BILL_CATEGORIES.find(c => c.id === bill.category)
              return (
                <div key={bill.id} className={`panel-card ${bill.isPaid ? 'opacity-50' : ''}`} style={{ padding: '1rem 1.25rem' }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${CATEGORY_BG[bill.category] || 'bg-gray-900/30'} flex items-center justify-center shrink-0`}>
                      <span className="text-xl">{cat?.emoji || '📋'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-sans text-lg font-bold text-white block truncate text-shadow-label">{bill.name}</span>
                      <span className="font-sans text-xs text-slate-500">{cat?.label || 'Other'}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-sans text-xl text-white font-bold block text-shadow-label">{formatCurrency(bill.amount)}</span>
                      <span className="font-sans text-xs text-slate-500 uppercase tracking-wider">{bill.category}</span>
                    </div>
                    <div className="shrink-0 ml-2">
                      {bill.isPaid ? (
                        <span className="font-pixel text-xs text-emerald-400 tracking-wider uppercase text-shadow-label">Slain</span>
                      ) : (
                        <button
                          onClick={() => { removeBill(bill.id); playBillRemove() }}
                          className="font-pixel text-xs text-slate-400 uppercase border border-slate-600 rounded-lg px-3 py-2 hover:text-red-400 hover:border-red-400/50 transition-all text-shadow-label"
                        >
                          Remove
                        </button>
                      )}
                    </div>
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
                className="panel-input px-4 py-3.5 text-base"
              />
              <input
                type="number"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                placeholder="Amount"
                className="panel-input px-4 py-3.5 text-base"
              />
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

        {/* Hero Rank + Island Stage */}
        <div className="grid grid-cols-2 gap-3">
          <div className="panel-card" style={{ padding: '1.25rem 1.5rem' }}>
            <span className="panel-label text-shadow-label block mb-2" style={{ fontSize: '0.7rem' }}>Hero Rank</span>
            <p className="font-sans text-white font-bold text-xl text-shadow-label">Lv.{level} {tierName}</p>
          </div>
          <div className="panel-card" style={{ padding: '1.25rem 1.5rem' }}>
            <span className="panel-label text-shadow-label block mb-2" style={{ fontSize: '0.7rem' }}>Island Stage</span>
            <p className="font-sans text-white font-bold text-xl text-shadow-label">{stageName}</p>
          </div>
        </div>

        {/* Stats Row: Totals */}
        <div className="grid grid-cols-3 gap-3">
          <div className="panel-card" style={{ padding: '1.25rem 0.75rem' }}>
            <span className="panel-label text-shadow-label block mb-2" style={{ fontSize: '0.6rem' }}>Total Bills</span>
            <p className="font-sans text-white font-bold text-2xl text-shadow-label">{formatCurrency(totalBills)}</p>
          </div>
          <div className="panel-card" style={{ padding: '1.25rem 0.75rem' }}>
            <span className="panel-label text-shadow-label block mb-2" style={{ fontSize: '0.6rem' }}>Surplus</span>
            <p className={`font-sans font-bold text-2xl text-shadow-label ${surplus >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(surplus)}
            </p>
          </div>
          <div className="panel-card" style={{ padding: '1.25rem 0.75rem' }}>
            <span className="panel-label text-shadow-label block mb-2" style={{ fontSize: '0.6rem' }}>Months Survived</span>
            <p className="font-sans text-white font-bold text-2xl text-shadow-label">{monthsCompleted}</p>
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
            <span className="font-pixel text-sm block text-shadow-heading">NEW MONTH</span>
            <span className="font-sans text-xs text-blue-100/70 block mt-1.5">Reset bills and continue your journey</span>
          </button>
        ) : (
          <button
            onClick={handlePayday}
            disabled={isBattling}
            className="payday-btn w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-700 text-slate-900 disabled:text-slate-500 rounded-2xl py-5 transition-all active:scale-[0.98] shadow-lg shadow-yellow-500/25 disabled:shadow-none"
          >
            <span className="font-pixel text-sm block text-shadow-heading">{isBattling ? 'BATTLING...' : 'TRIGGER PAYDAY'}</span>
            {!isBattling && (
              <span className="font-sans text-xs text-slate-800/70 block mt-1.5">Spawn the hero and slay this month's monsters</span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
