import { useState } from 'react'
import useGameStore from '../lib/gameState'
import { BILL_CATEGORIES, MONSTER_COLOR_HEX } from '../lib/constants'

const BANNER_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#fbbf24', '#8b5cf6', '#ec4899']

export default function Onboarding() {
  const { setKingdomName, setBannerColor, setIncome, addBill, completeOnboarding } = useGameStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [income, setIncomeLocal] = useState('')
  const [bills, setBills] = useState([{ name: '', amount: '', category: 'housing' }])

  const handleNext = () => {
    if (step === 1) {
      setKingdomName(name || 'My Kingdom')
      setBannerColor(color)
    } else if (step === 2) {
      setIncome(income)
    }
    setStep(s => s + 1)
  }

  const handleComplete = () => {
    setIncome(income)
    bills.forEach(bill => {
      if (bill.name.trim() && bill.amount) {
        addBill({ name: bill.name.trim(), amount: Number(bill.amount), category: bill.category })
      }
    })
    completeOnboarding()
  }

  const updateBill = (index, field, value) => {
    setBills(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b))
  }

  const addBillRow = () => {
    setBills(prev => [...prev, { name: '', amount: '', category: 'other' }])
  }

  const removeBillRow = (index) => {
    if (bills.length <= 1) return
    setBills(prev => prev.filter((_, i) => i !== index))
  }

  const hasValidBill = bills.some(b => b.name.trim() && b.amount)

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="text-6xl mb-4">⚔️</div>
            <h1 className="font-pixel text-lg text-amber-400">Welcome, brave soul.</h1>
            <p className="font-sans text-slate-300 text-sm leading-relaxed">
              Your financial discipline builds a thriving world.
              Every bill is a monster. Every payday is a battle.
              Every month grows your kingdom.
            </p>
            <button
              onClick={handleNext}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-pixel text-xs px-6 py-3 rounded-xl transition-colors"
            >
              Begin Your Journey →
            </button>
          </div>
        )}

        {/* Step 1: Name Kingdom */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="text-4xl mb-3">🏰</div>
              <h2 className="font-pixel text-sm text-amber-400">Name Your Kingdom</h2>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Fort Savings, Castle Coinsworth..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white font-sans focus:border-amber-400 focus:outline-none"
              autoFocus
            />
            <div>
              <label className="font-pixel text-xs text-slate-400 block mb-2">Banner Color</label>
              <div className="flex gap-3 justify-center">
                {BANNER_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-lg transition-transform ${color === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-pixel text-xs px-6 py-3 rounded-xl transition-colors"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Income */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h2 className="font-pixel text-sm text-amber-400">How much treasure arrives each month?</h2>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">$</span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncomeLocal(e.target.value)}
                placeholder="5000"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-4 py-3 text-white text-lg font-sans focus:border-amber-400 focus:outline-none"
                autoFocus
              />
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-pixel text-xs px-6 py-3 rounded-xl transition-colors"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 3: Bills */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center">
              <div className="text-4xl mb-3">👹</div>
              <h2 className="font-pixel text-sm text-amber-400 mb-1">What monsters threaten your realm?</h2>
              <p className="font-sans text-xs text-slate-500">Add at least one bill</p>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {bills.map((bill, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select
                    value={bill.category}
                    onChange={(e) => updateBill(i, 'category', e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white font-sans focus:border-amber-400 focus:outline-none w-28"
                  >
                    {BILL_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={bill.name}
                    onChange={(e) => updateBill(i, 'name', e.target.value)}
                    placeholder="Bill name"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-sans focus:border-amber-400 focus:outline-none"
                  />
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={bill.amount}
                      onChange={(e) => updateBill(i, 'amount', e.target.value)}
                      placeholder="0"
                      className="w-20 bg-slate-800 border border-slate-700 rounded-lg pl-5 pr-2 py-2 text-sm text-white font-sans focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  {bills.length > 1 && (
                    <button
                      onClick={() => removeBillRow(i)}
                      className="text-slate-600 hover:text-red-400 text-lg"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addBillRow}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-sans text-sm py-2 rounded-lg transition-colors border border-slate-700"
            >
              + Add Another Monster
            </button>
            <button
              onClick={handleComplete}
              disabled={!hasValidBill}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-pixel text-xs px-6 py-3 rounded-xl transition-colors"
            >
              Forge My Kingdom →
            </button>
          </div>
        )}

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2, 3].map(s => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${s === step ? 'bg-amber-400' : s < step ? 'bg-amber-700' : 'bg-slate-700'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
