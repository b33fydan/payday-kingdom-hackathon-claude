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
    <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="onboard-card rounded-3xl p-8 md:p-10 text-center space-y-6 animate-fade-in">
            <div className="text-6xl mb-2">⚔️</div>
            <h1 className="font-pixel text-base md:text-lg text-amber-400 leading-relaxed">Welcome, brave soul.</h1>
            <p className="font-sans text-slate-300 text-sm leading-relaxed px-2">
              Your financial discipline builds a thriving world.
              Every bill is a monster. Every payday is a battle.
              Every month grows your kingdom.
            </p>
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-900 font-pixel text-xs px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
            >
              Begin Your Journey →
            </button>
          </div>
        )}

        {/* Step 1: Name Kingdom */}
        {step === 1 && (
          <div className="onboard-card rounded-3xl p-8 md:p-10 space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="text-5xl mb-3">🏰</div>
              <h2 className="font-pixel text-sm text-amber-400 leading-relaxed">Name Your Kingdom</h2>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Fort Savings, Castle Coinsworth..."
              className="input-polished w-full rounded-2xl px-5 py-4 text-white font-sans text-base"
              autoFocus
            />
            <div>
              <label className="font-pixel text-xs text-slate-400 block mb-3">Banner Color</label>
              <div className="flex gap-3 justify-center">
                {BANNER_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-11 h-11 rounded-xl transition-all shadow-lg ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c, boxShadow: color === c ? `0 4px 16px ${c}60` : undefined }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-900 font-pixel text-xs py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Income */}
        {step === 2 && (
          <div className="onboard-card rounded-3xl p-8 md:p-10 space-y-6 animate-fade-in">
            <div className="text-center px-2">
              <div className="text-5xl mb-3">💰</div>
              <h2 className="font-pixel text-sm text-amber-400 leading-relaxed">How much treasure arrives each month?</h2>
            </div>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">$</span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncomeLocal(e.target.value)}
                placeholder="5000"
                className="input-polished w-full rounded-2xl pl-10 pr-5 py-4 text-white text-lg font-sans"
                autoFocus
              />
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-900 font-pixel text-xs py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 3: Bills */}
        {step === 3 && (
          <div className="onboard-card rounded-3xl p-8 md:p-10 space-y-5 animate-fade-in">
            <div className="text-center px-2">
              <div className="text-5xl mb-3">👹</div>
              <h2 className="font-pixel text-sm text-amber-400 mb-2 leading-relaxed">What monsters threaten your realm?</h2>
              <p className="font-sans text-xs text-slate-500">Add at least one bill</p>
            </div>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {bills.map((bill, i) => (
                <div key={i} className="flex gap-2.5 items-center">
                  <select
                    value={bill.category}
                    onChange={(e) => updateBill(i, 'category', e.target.value)}
                    className="input-polished rounded-xl px-3 py-3 text-xs text-white font-sans w-28"
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
                    className="input-polished flex-1 rounded-xl px-4 py-3 text-sm text-white font-sans"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={bill.amount}
                      onChange={(e) => updateBill(i, 'amount', e.target.value)}
                      placeholder="0"
                      className="input-polished w-24 rounded-xl pl-7 pr-3 py-3 text-sm text-white font-sans"
                    />
                  </div>
                  {bills.length > 1 && (
                    <button
                      onClick={() => removeBillRow(i)}
                      className="text-slate-600 hover:text-red-400 text-lg transition-colors"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addBillRow}
              className="w-full glass-card hover:border-white/15 text-slate-400 font-sans text-sm py-3 rounded-2xl transition-all"
            >
              + Add Another Monster
            </button>
            <button
              onClick={handleComplete}
              disabled={!hasValidBill}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:from-slate-700 disabled:to-slate-600 disabled:text-slate-500 text-slate-900 font-pixel text-xs py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/20 disabled:shadow-none active:scale-[0.98]"
            >
              Forge My Kingdom →
            </button>
          </div>
        )}

        {/* Step indicators */}
        <div className="flex justify-center gap-2.5 mt-8">
          {[0, 1, 2, 3].map(s => (
            <div
              key={s}
              className={`rounded-full transition-all ${s === step ? 'w-6 h-2 bg-amber-400' : 'w-2 h-2'} ${s < step ? 'bg-amber-700' : s > step ? 'bg-slate-700' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
