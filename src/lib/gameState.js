import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getLevelFromXP, getIslandStage } from './constants'

const useGameStore = create(
  persist(
    (set, get) => ({
      // Kingdom
      kingdomName: '',
      bannerColor: '#3b82f6',

      // Budget
      income: 0,
      bills: [],

      // Game progression
      xp: 0,
      level: 1,
      totalBillsSlain: 0,
      monthsCompleted: 0,
      islandStage: 0,

      // Scene state
      heroVisible: false,
      isBattling: false,
      lastBattleResult: null,

      // App state
      hasOnboarded: false,
      achievements: {},
      history: [],
      soundMuted: false,

      // Actions
      setKingdomName: (name) => set({ kingdomName: name }),
      setBannerColor: (color) => set({ bannerColor: color }),
      setIncome: (income) => set({ income: Number(income) || 0 }),

      addBill: (bill) => set((state) => ({
        bills: [...state.bills, {
          id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
          name: bill.name,
          amount: Number(bill.amount) || 0,
          category: bill.category || 'other',
          isPaid: false,
        }]
      })),

      removeBill: (id) => set((state) => ({
        bills: state.bills.filter(b => b.id !== id)
      })),

      triggerPayday: () => {
        const state = get()
        if (state.isBattling) return

        const unpaidBills = state.bills.filter(b => !b.isPaid)
        const totalBillAmount = unpaidBills.reduce((sum, b) => sum + b.amount, 0)
        const newXP = state.xp + totalBillAmount
        const newLevel = getLevelFromXP(newXP)
        const newMonths = state.monthsCompleted + 1
        const newStage = getIslandStage(newMonths)
        const surplus = state.income - totalBillAmount

        set({
          isBattling: true,
          heroVisible: true,
        })

        // Return data for the animation to use — actual state update happens after animation
        return {
          unpaidBills,
          totalBillAmount,
          newXP,
          newLevel,
          oldLevel: state.level,
          newMonths,
          newStage,
          oldStage: state.islandStage,
          surplus,
          leveledUp: newLevel > state.level,
          stageAdvanced: newStage > state.islandStage,
        }
      },

      completeBattle: (battleResult) => set((state) => ({
        bills: state.bills.map(b => ({ ...b, isPaid: true })),
        xp: battleResult.newXP,
        level: battleResult.newLevel,
        totalBillsSlain: state.totalBillsSlain + battleResult.unpaidBills.length,
        monthsCompleted: battleResult.newMonths,
        islandStage: battleResult.newStage,
        isBattling: false,
        lastBattleResult: battleResult,
        history: [...state.history, {
          month: battleResult.newMonths,
          income: state.income,
          totalBills: battleResult.totalBillAmount,
          surplus: battleResult.surplus,
          billsSlain: battleResult.unpaidBills.length,
          date: Date.now(),
        }],
      })),

      resetMonth: () => set((state) => ({
        bills: state.bills.map(b => ({ ...b, isPaid: false })),
        heroVisible: false,
      })),

      completeOnboarding: () => set({ hasOnboarded: true }),

      unlockAchievement: (id) => set((state) => ({
        achievements: { ...state.achievements, [id]: Date.now() }
      })),

      toggleMute: () => set((state) => ({ soundMuted: !state.soundMuted })),
    }),
    {
      name: 'payday-kingdom-storage',
      partialize: (state) => ({
        kingdomName: state.kingdomName,
        bannerColor: state.bannerColor,
        income: state.income,
        bills: state.bills,
        xp: state.xp,
        level: state.level,
        totalBillsSlain: state.totalBillsSlain,
        monthsCompleted: state.monthsCompleted,
        islandStage: state.islandStage,
        hasOnboarded: state.hasOnboarded,
        achievements: state.achievements,
        history: state.history,
        soundMuted: state.soundMuted,
      }),
      storage: {
        getItem: (name) => {
          try {
            return localStorage.getItem(name)
          } catch {
            return null
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, value)
          } catch {
            console.warn('Payday Kingdom: localStorage full — progress may not persist')
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name)
          } catch {
            // ignore
          }
        },
      },
    }
  )
)

export default useGameStore
