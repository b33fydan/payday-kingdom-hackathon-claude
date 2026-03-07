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

  const [showAddBill, setShowAddBill] = useState(false)
  const [newBillName, setNewBillName] = useState('')
  const [newBillAmount, setNewBillAmount] = useState('')
  const [newBillCategory, setNewBillCategory] = useState('housing')

  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0)
  const surplus = income - totalBills
  const allPaid = bills.length > 0 && bills.every(b => b.isPaid)

  // Recent achievements (latest 3, sorted by unlock time)
  const recentAchievements = ACHIEVEMENT_DEFS
    .filter(a => achievements[a.id])
    .sort((a, b) => achievements[b.id] - achievements[a.id])
    .slice(0, 3)

  const handleQuickAdd = (cat) => {
    setNewBillCategory(cat.id)
    setNewBillName(cat.label)
    setShowAddBill(true)
  }

  const handleAddBill = () => {
    if (!newBillName.trim() || !newBillAmount) return
    addBill({ name: newBillName.trim(), amount: Number(newBillAmount), category: newBillCategory })
    playBillAdd()
    setNewBillName('')
    setNewBillAmount('')
    setShowAddBill(false)
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
    <div className="h-full overflow-y-auto panel-bg px-8 py-6 md:px-10 md:py-8 lg:px-12 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-base shadow-lg shadow-amber-500/25">
          <span>👑</span>
        </div>
        <div>
          <h2 className="font-pixel text-sm md:text-base text-amber-400 truncate">
            {kingdomName ? `${kingdomName}` : 'Treasury'}
          </h2>
          <span className="font-sans text-xs text-slate-500">Treasury</span>
        </div>
      </div>

      {/* Income Card */}
      <div className="neon-card rounded-2xl p-5">
        <label className="font-pixel text-xs text-amber-300 block mb-3">Monthly Income</label>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-400/60 font-sans text-lg font-bold">$</span>
          <input
            type="number"
            value={income || ''}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="0"
            className="input-polished w-full rounded-2xl pl-11 pr-5 py-4 text-white text-lg font-sans font-medium"
          />
        </div>
      </div>

      {/* Bills Card */}
      <div className="neon-card rounded-2xl p-5 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <label className="font-pixel text-xs text-amber-300">Monsters ({bills.length})</label>
          <span className="font-sans text-sm text-slate-400 font-medium">{formatCurrency(totalBills)}</span>
        </div>

        {/* Existing bills */}
        <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0 max-h-40">
          {bills.map(bill => (
            <div key={bill.id} className={`flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 group transition-all hover:bg-white/[0.06] ${bill.isPaid ? 'opacity-50' : ''}`}>
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: MONSTER_COLOR_HEX[bill.category], boxShadow: `0 0 10px ${MONSTER_COLOR_HEX[bill.category]}50` }}
              />
              <span className="font-sans text-sm flex-1 truncate text-slate-200">{bill.name}</span>
              <span className="font-sans text-sm text-white font-semibold">{formatCurrency(bill.amount)}</span>
              {bill.isPaid && <span className="text-xs text-green-400 font-sans font-bold tracking-wider">SLAIN</span>}
              {!bill.isPaid && (
                <button
                  onClick={() => { removeBill(bill.id); playBillRemove() }}
                  className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xl leading-none"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          {bills.length === 0 && (
            <div className="py-4 text-center">
              <p className="text-slate-500 text-sm font-sans">Add your first monster below</p>
            </div>
          )}
        </div>

        {/* Quick add: category buttons */}
        {!showAddBill ? (
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <label className="font-sans text-xs text-slate-500 block mb-2.5">Tap to add a bill:</label>
            <div className="grid grid-cols-4 gap-2">
              {BILL_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleQuickAdd(cat)}
                  className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-400/30 hover:bg-amber-400/5 transition-all active:scale-95"
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="font-sans text-[10px] text-slate-400">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{BILL_CATEGORIES.find(c => c.id === newBillCategory)?.emoji}</span>
              <span className="font-sans text-sm text-amber-300 font-medium">
                New {BILL_CATEGORIES.find(c => c.id === newBillCategory)?.label} Bill
              </span>
            </div>
            <input
              type="text"
              value={newBillName}
              onChange={(e) => setNewBillName(e.target.value)}
              placeholder="Bill name"
              className="input-polished w-full rounded-xl px-5 py-3.5 text-sm text-white font-sans"
              autoFocus
            />
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
              <input
                type="number"
                value={newBillAmount}
                onChange={(e) => setNewBillAmount(e.target.value)}
                placeholder="Amount"
                className="input-polished w-full rounded-xl pl-10 pr-5 py-3.5 text-sm text-white font-sans"
                onKeyDown={(e) => e.key === 'Enter' && handleAddBill()}
              />
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={handleAddBill}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-sans text-sm font-bold py-3 rounded-xl transition-all active:scale-[0.97] shadow-lg shadow-amber-500/20"
              >
                Add Monster
              </button>
              <button
                onClick={() => { setShowAddBill(false); setNewBillName(''); setNewBillAmount('') }}
                className="px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-400 font-sans text-sm hover:text-white transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Achievements Card — in the middle */}
      <div className="neon-card rounded-2xl p-5">
        <label className="font-pixel text-xs text-amber-300 block mb-3">Achievements</label>
        {recentAchievements.length > 0 ? (
          <div className="space-y-3">
            {recentAchievements.map(ach => (
              <div key={ach.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
                  <span className="text-xl">{ach.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-sm font-semibold text-white truncate">{ach.name}</div>
                  <div className="font-sans text-xs text-slate-400">{ach.desc}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-3 text-center">
            <p className="font-sans text-xs text-slate-500">Slay your first bill to earn achievements</p>
          </div>
        )}
      </div>

      {/* Surplus Card */}
      <div className="neon-card rounded-2xl p-5">
        {income === 0 && (
          <p className="font-sans text-sm text-amber-400/80 mb-3">Your treasury is empty, brave soul</p>
        )}
        <div className="flex justify-between items-center">
          <span className="font-pixel text-xs text-amber-300">Surplus</span>
          <span className={`font-sans text-2xl font-bold ${surplus >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(surplus)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="font-pixel text-xs text-slate-500">Months Survived</span>
          <span className="font-sans text-base text-slate-300 font-medium">{monthsCompleted}</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="pb-2">
        {allPaid ? (
          <button
            onClick={() => resetMonth()}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-pixel text-xs py-4 rounded-2xl border border-blue-400/30 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
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
