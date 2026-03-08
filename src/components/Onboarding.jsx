import { useState } from 'react'
import useGameStore from '../lib/gameState'
import { BILL_CATEGORIES, formatCurrency } from '../lib/constants'

const BANNER_COLORS = [
  { hex: '#ef4444', label: 'Red' },
  { hex: '#3b82f6', label: 'Blue' },
  { hex: '#22c55e', label: 'Green' },
  { hex: '#8b5cf6', label: 'Purple' },
  { hex: '#fbbf24', label: 'Gold' },
  { hex: '#1e293b', label: 'Black' },
]

const TOTAL_STEPS = 5

function StepHeader({ step, onSkip }) {
  return (
    <div className="flex items-start justify-between mb-2">
      <div>
        <p className="font-pixel text-emerald-400 uppercase tracking-widest text-shadow-label" style={{ fontSize: '0.6rem' }}>
          Begin Your Journey
        </p>
        <p className="font-sans text-slate-500 uppercase text-xs tracking-wider mt-1">
          Step {step} of {TOTAL_STEPS}
        </p>
      </div>
      <button
        onClick={onSkip}
        className="font-pixel text-xs text-slate-400 border border-slate-600 rounded-lg px-4 py-2 hover:text-white hover:border-slate-400 transition-all text-shadow-label"
      >
        Skip
      </button>
    </div>
  )
}

export default function Onboarding() {
  const { setKingdomName, setBannerColor, setIncome, addBill, completeOnboarding } = useGameStore()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#fbbf24')
  const [income, setIncomeLocal] = useState('')
  const [bills, setBills] = useState([{ name: '', amount: '', category: 'housing' }])

  const handleNext = () => {
    if (step === 2) {
      setKingdomName(name || 'My Kingdom')
      setBannerColor(color)
    } else if (step === 3) {
      setIncome(income)
    } else if (step === 4) {
      setIncome(income)
      bills.forEach(bill => {
        if (bill.name.trim() && bill.amount) {
          addBill({ name: bill.name.trim(), amount: Number(bill.amount), category: bill.category })
        }
      })
    }
    setStep(s => s + 1)
  }

  const handleComplete = () => {
    // Ensure everything is saved
    if (step <= 2) {
      setKingdomName(name || 'My Kingdom')
      setBannerColor(color)
    }
    if (step <= 3) {
      setIncome(income)
    }
    if (step <= 4) {
      bills.forEach(bill => {
        if (bill.name.trim() && bill.amount) {
          addBill({ name: bill.name.trim(), amount: Number(bill.amount), category: bill.category })
        }
      })
    }
    completeOnboarding()
  }

  const handleSkip = () => {
    setKingdomName(name || 'My Kingdom')
    setBannerColor(color)
    if (income) setIncome(income)
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
  const validBillCount = bills.filter(b => b.name.trim() && b.amount).length
  const totalBillAmount = bills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4 md:p-6">
      <div className="max-w-2xl w-full">
        <div className="onboard-card rounded-3xl p-8 md:p-10 animate-fade-in">

          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="space-y-6">
              <StepHeader step={1} onSkip={handleSkip} />
              <h1 className="font-pixel text-2xl md:text-3xl text-white leading-relaxed text-shadow-title mt-6">
                Welcome, brave soul.
              </h1>
              <p className="font-sans text-slate-300 text-sm md:text-base leading-relaxed max-w-lg">
                In Payday Kingdom, your financial discipline builds a thriving voxel world. Bills become monsters. Paydays summon heroes. Your consistency grows the island.
              </p>
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleNext}
                  className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-pixel text-xs px-10 py-4 rounded-2xl transition-all shadow-lg shadow-yellow-500/20 active:scale-[0.98] text-shadow-label"
                >
                  Begin Your Journey
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Name Kingdom */}
          {step === 2 && (
            <div className="space-y-6">
              <StepHeader step={2} onSkip={handleSkip} />
              <h2 className="font-pixel text-xl md:text-2xl text-white leading-relaxed text-shadow-title mt-6">
                Name Your Kingdom
              </h2>
              <p className="font-sans text-slate-400 text-sm leading-relaxed">
                Give the realm an identity and choose a banner color that will fly above the island.
              </p>
              <div>
                <label className="panel-label text-shadow-label block mb-3">Kingdom Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Fort Savings"
                  className="panel-input w-full rounded-xl px-5 py-4 text-white font-sans text-base"
                  autoFocus
                />
              </div>
              <div>
                <label className="panel-label text-shadow-label block mb-3">Banner Color</label>
                <div className="grid grid-cols-6 gap-3">
                  {BANNER_COLORS.map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setColor(c.hex)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                        color === c.hex
                          ? 'border-amber-400 bg-white/5'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div
                        className="w-full aspect-[2/1] rounded-lg"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="font-pixel text-slate-400 uppercase" style={{ fontSize: '0.45rem' }}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNext}
                  className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-pixel text-xs px-10 py-4 rounded-2xl transition-all shadow-lg shadow-yellow-500/20 active:scale-[0.98] text-shadow-label"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Income */}
          {step === 3 && (
            <div className="space-y-6">
              <StepHeader step={3} onSkip={handleSkip} />
              <h2 className="font-pixel text-xl md:text-2xl text-white leading-relaxed text-shadow-title mt-6">
                How much treasure arrives each month?
              </h2>
              <p className="font-sans text-slate-400 text-sm leading-relaxed">
                Enter the monthly income that keeps your kingdom running.
              </p>
              <div className="panel-card" style={{ padding: '1.25rem 1.5rem' }}>
                <label className="panel-label text-shadow-label block mb-3">Monthly Income</label>
                <div className="flex">
                  <span className="currency-badge text-lg rounded-l-xl">$</span>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncomeLocal(e.target.value)}
                    placeholder="3200"
                    className="panel-input w-full rounded-l-none rounded-r-xl px-5 py-4 text-white text-lg font-sans"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNext}
                  className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-pixel text-xs px-10 py-4 rounded-2xl transition-all shadow-lg shadow-yellow-500/20 active:scale-[0.98] text-shadow-label"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Bills */}
          {step === 4 && (
            <div className="space-y-5">
              <StepHeader step={4} onSkip={handleSkip} />
              <h2 className="font-pixel text-xl md:text-2xl text-white leading-relaxed text-shadow-title mt-6">
                What monsters threaten your realm?
              </h2>
              <p className="font-sans text-slate-400 text-sm leading-relaxed">
                Add at least one recurring bill. These become the monsters your hero battles every payday.
              </p>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {bills.map((bill, i) => (
                  <div key={i} className="panel-card" style={{ padding: '1rem 1.25rem' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="panel-label text-shadow-label" style={{ fontSize: '0.65rem' }}>Bill {i + 1}</span>
                      {bills.length > 1 && (
                        <button
                          onClick={() => removeBillRow(i)}
                          className="font-pixel text-xs text-slate-500 border border-slate-600 rounded-lg px-3 py-1.5 hover:text-red-400 hover:border-red-400/50 transition-all"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={bill.name}
                        onChange={(e) => updateBill(i, 'name', e.target.value)}
                        placeholder="Bill name"
                        className="panel-input px-4 py-3 text-sm text-white"
                      />
                      <input
                        type="number"
                        value={bill.amount}
                        onChange={(e) => updateBill(i, 'amount', e.target.value)}
                        placeholder="Amount"
                        className="panel-input px-4 py-3 text-sm text-white"
                      />
                      <select
                        value={bill.category}
                        onChange={(e) => updateBill(i, 'category', e.target.value)}
                        className="panel-input px-4 py-3 text-sm text-white col-span-2"
                      >
                        {BILL_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={addBillRow}
                  className="font-pixel text-xs text-slate-400 border border-slate-600 rounded-xl px-5 py-3 hover:text-white hover:border-slate-400 transition-all text-shadow-label"
                >
                  Add Another Monster
                </button>
                <div className="flex-1" />
                <button
                  onClick={handleNext}
                  disabled={!hasValidBill}
                  className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-pixel text-xs px-8 py-3 rounded-2xl transition-all shadow-lg shadow-yellow-500/20 disabled:shadow-none active:scale-[0.98] text-shadow-label"
                >
                  Forge My Kingdom
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Summary */}
          {step === 5 && (
            <div className="space-y-6">
              <StepHeader step={5} onSkip={handleComplete} />
              <h2 className="font-pixel text-2xl md:text-3xl text-white leading-relaxed text-shadow-title mt-6 text-center">
                Your Kingdom Awaits.
              </h2>
              <p className="font-sans text-slate-300 text-sm md:text-base leading-relaxed text-center max-w-md mx-auto">
                {name || 'My Kingdom'} is ready. The treasury is stocked, the monsters are on the island, and your hero is waiting for payday.
              </p>
              <div className="panel-card" style={{ padding: '1.25rem 1.5rem' }}>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="panel-label text-shadow-label block mb-1" style={{ fontSize: '0.6rem' }}>Kingdom</span>
                    <p className="font-sans text-white font-bold text-base text-shadow-label">{name || 'My Kingdom'}</p>
                  </div>
                  <div>
                    <span className="panel-label text-shadow-label block mb-1" style={{ fontSize: '0.6rem' }}>Income</span>
                    <p className="font-sans text-white font-bold text-base text-shadow-label">{formatCurrency(Number(income) || 0)}</p>
                  </div>
                  <div>
                    <span className="panel-label text-shadow-label block mb-1" style={{ fontSize: '0.6rem' }}>Monsters</span>
                    <p className="font-sans text-white font-bold text-base text-shadow-label">{validBillCount}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleComplete}
                  className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-pixel text-xs px-10 py-4 rounded-2xl transition-all shadow-lg shadow-yellow-500/20 active:scale-[0.98] text-shadow-label"
                >
                  Ready for Payday
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
