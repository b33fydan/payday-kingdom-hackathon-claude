import { useState } from 'react'
import useGameStore from '../lib/gameState'
import { BILL_CATEGORIES, MONSTER_COLOR_HEX, formatCurrency } from '../lib/constants'
import { playBillAdd, playBillRemove } from '../lib/soundManager'

export default function BudgetPanel() {
  const {
    kingdomName, income, bills, isBattling,
    monthsCompleted, triggerPayday, resetMonth,
    setIncome, addBill, removeBill,
  } = useGameStore()

  const [billName, setBillName] = useState('')
  const [billAmount, setBillAmount] = useState('')
  const [billCategory, setBillCategory] = useState('other')

  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0)
  const surplus = income - totalBills
  const allPaid = bills.length > 0 && bills.every(b => b.isPaid)

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
    <div className="h-full overflow-y-auto bg-slate-900 p-4 md:p-6 flex flex-col gap-4">
      {/* Header */}
      <h2 className="font-pixel text-sm md:text-base text-amber-400 truncate">
        {kingdomName ? `${kingdomName} Treasury` : 'Treasury'}
      </h2>

      {/* Income */}
      <div>
        <label className="font-pixel text-xs text-slate-400 block mb-1">Monthly Income</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-sans">$</span>
          <input
            type="number"
            value={income || ''}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="0"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-white font-sans focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Bills List */}
      <div className="flex-1 min-h-0">
        <div className="flex items-center justify-between mb-2">
          <label className="font-pixel text-xs text-slate-400">Bills ({bills.length})</label>
          <span className="font-sans text-xs text-slate-500">{formatCurrency(totalBills)}</span>
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {bills.map(bill => (
            <div key={bill.id} className={`flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 group ${bill.isPaid ? 'opacity-50' : ''}`}>
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: MONSTER_COLOR_HEX[bill.category] }}
              />
              <span className="font-sans text-sm flex-1 truncate">{bill.name}</span>
              <span className="font-sans text-sm text-slate-300">{formatCurrency(bill.amount)}</span>
              {bill.isPaid && <span className="text-xs text-green-400">SLAIN</span>}
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
            <p className="text-slate-600 text-sm font-sans text-center py-4">No monsters yet...</p>
          )}
        </div>
      </div>

      {/* Add Bill Form */}
      <form onSubmit={handleAddBill} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={billName}
            onChange={(e) => setBillName(e.target.value)}
            placeholder="Bill name"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-sans focus:border-amber-400 focus:outline-none"
          />
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              placeholder="0"
              className="w-24 bg-slate-800 border border-slate-700 rounded-lg pl-5 pr-2 py-2 text-sm text-white font-sans focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={billCategory}
            onChange={(e) => setBillCategory(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-sans focus:border-amber-400 focus:outline-none"
          >
            {BILL_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-4 py-2 text-sm font-sans transition-colors"
          >
            + Add
          </button>
        </div>
      </form>

      {/* Surplus */}
      <div className="bg-slate-800 rounded-lg p-3">
        {income === 0 && (
          <p className="font-sans text-xs text-amber-400 mb-2">Your treasury is empty, brave soul</p>
        )}
        <div className="flex justify-between items-center">
          <span className="font-pixel text-xs text-slate-400">Surplus</span>
          <span className={`font-sans text-lg font-bold ${surplus >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(surplus)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="font-pixel text-xs text-slate-500">Months Survived</span>
          <span className="font-sans text-sm text-slate-300">{monthsCompleted}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {allPaid ? (
          <button
            onClick={handleResetMonth}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-pixel text-xs py-3 rounded-xl border-2 border-blue-400"
          >
            NEW MONTH
          </button>
        ) : (
          <button
            onClick={handlePayday}
            disabled={isBattling}
            className="payday-btn w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-pixel text-sm py-3 rounded-xl border-2 border-amber-400 disabled:from-slate-700 disabled:to-slate-600 disabled:border-slate-500"
          >
            {isBattling ? 'BATTLING...' : 'TRIGGER PAYDAY'}
          </button>
        )}
      </div>
    </div>
  )
}
