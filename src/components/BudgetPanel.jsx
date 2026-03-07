import { useState } from 'react'
import useGameStore from '../lib/gameState'
import { BILL_CATEGORIES, MONSTER_COLOR_HEX, formatCurrency } from '../lib/constants'
import { ACHIEVEMENT_DEFS } from '../lib/achievements'
import { playBillAdd, playBillRemove } from '../lib/soundManager'

export default function BudgetPanel() {
  const {
    kingdomName, income, bills, isBattling,
    monthsCompleted, triggerPayday, resetMonth,
    setIncome, addBill, removeBill, achievements,
  } = useGameStore()

  const [billName, setBillName] = useState('')
  const [billAmount, setBillAmount] = useState('')
  const [billCategory, setBillCategory] = useState('other')

  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0)
  const surplus = income - totalBills
  const allPaid = bills.length > 0 && bills.every(b => b.isPaid)

  // Recent achievements (latest 3, sorted by unlock time)
  const recentAchievements = ACHIEVEMENT_DEFS
    .filter(a => achievements[a.id])
    .sort((a, b) => achievements[b.id] - achievements[a.id])
    .slice(0, 3)

  const handleAddBill = (e) => {
    e.preventDefault()
    if (!billName.trim() || !billAmount) return
    addBill({ name: billName.trim(), amount: Number(billAmount), category: billCategory })
    playBillAdd()
    setBillName('')
    setBillAmount('')
    setBillCategory('other')
  }

  const handlePayday = async () => {
    if (isBattling) return
    const battleResult = triggerPayday()
    if (!battleResult) return

    // Run 3D battle animation
    if (window.__runBattleAnimation) {
      await window.__runBattleAnimation(battleResult)
    }
  }

  const handleResetMonth = () => {
    resetMonth()
  }

  return (
    <div className="h-full overflow-y-auto panel-bg p-6 md:p-8 lg:p-10 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-sm shadow-lg shadow-amber-500/20">
          <span>👑</span>
        </div>
        <h2 className="font-pixel text-sm md:text-base text-amber-400 truncate">
          {kingdomName ? `${kingdomName} Treasury` : 'Treasury'}
        </h2>
      </div>

      <div className="divider-glow" />

      {/* Income */}
      <div>
        <label className="font-pixel text-xs text-slate-400 block mb-2.5">Monthly Income</label>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-sans text-base">$</span>
          <input
            type="number"
            value={income || ''}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="0"
            className="input-polished w-full rounded-2xl pl-10 pr-5 py-3.5 text-white text-base font-sans"
          />
        </div>
      </div>

      {/* Bills List */}
      <div className="flex-1 min-h-0">
        <div className="flex items-center justify-between mb-3">
          <label className="font-pixel text-xs text-slate-400">Bills ({bills.length})</label>
          <span className="font-sans text-xs text-slate-500">{formatCurrency(totalBills)}</span>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {bills.map(bill => (
            <div key={bill.id} className={`glass-card flex items-center gap-3 rounded-2xl px-4 py-3 group transition-all hover:border-white/12 ${bill.isPaid ? 'opacity-50' : ''}`}>
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{ backgroundColor: MONSTER_COLOR_HEX[bill.category], boxShadow: `0 0 8px ${MONSTER_COLOR_HEX[bill.category]}50` }}
              />
              <span className="font-sans text-sm flex-1 truncate">{bill.name}</span>
              <span className="font-sans text-sm text-slate-300 font-medium">{formatCurrency(bill.amount)}</span>
              {bill.isPaid && <span className="text-xs text-green-400 font-sans font-semibold tracking-wide">SLAIN</span>}
              {!bill.isPaid && (
                <button
                  onClick={() => { removeBill(bill.id); playBillRemove() }}
                  className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          {bills.length === 0 && (
            <div className="glass-card rounded-2xl px-4 py-6 text-center">
              <p className="text-slate-500 text-sm font-sans">No monsters yet...</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Bill Form */}
      <form onSubmit={handleAddBill} className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={billName}
            onChange={(e) => setBillName(e.target.value)}
            placeholder="Bill name"
            className="input-polished flex-1 rounded-2xl px-5 py-3 text-sm text-white font-sans"
          />
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              placeholder="0"
              className="input-polished w-28 rounded-2xl pl-8 pr-4 py-3 text-sm text-white font-sans"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={billCategory}
            onChange={(e) => setBillCategory(e.target.value)}
            className="input-polished flex-1 rounded-2xl px-5 py-3 text-sm text-white font-sans"
          >
            {BILL_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="glass-card hover:border-white/15 text-white rounded-2xl px-6 py-3 text-sm font-sans font-medium transition-all active:scale-95"
          >
            + Add
          </button>
        </div>
      </form>

      <div className="divider-glow" />

      {/* Surplus */}
      <div className="glass-card rounded-2xl p-5">
        {income === 0 && (
          <p className="font-sans text-xs text-amber-400/80 mb-3">Your treasury is empty, brave soul</p>
        )}
        <div className="flex justify-between items-center">
          <span className="font-pixel text-xs text-slate-400">Surplus</span>
          <span className={`font-sans text-xl font-bold ${surplus >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(surplus)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="font-pixel text-xs text-slate-500">Months Survived</span>
          <span className="font-sans text-sm text-slate-300">{monthsCompleted}</span>
        </div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <label className="font-pixel text-xs text-slate-400 block mb-3">Latest Achievements</label>
          <div className="space-y-2.5">
            {recentAchievements.map(ach => (
              <div key={ach.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                  <span className="text-lg">{ach.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-sm font-medium text-white truncate">{ach.name}</div>
                  <div className="font-sans text-xs text-slate-500">{ach.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pb-2 mt-auto">
        {allPaid ? (
          <button
            onClick={handleResetMonth}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-pixel text-xs py-4 rounded-2xl border border-blue-400/30 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
          >
            NEW MONTH
          </button>
        ) : (
          <button
            onClick={handlePayday}
            disabled={isBattling}
            className="payday-btn w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-pixel text-sm py-4 rounded-2xl border border-amber-400/30 shadow-lg shadow-amber-500/25 disabled:from-slate-700 disabled:to-slate-600 disabled:border-slate-600 disabled:shadow-none active:scale-[0.98] transition-all"
          >
            {isBattling ? 'BATTLING...' : 'TRIGGER PAYDAY'}
          </button>
        )}
      </div>
    </div>
  )
}
