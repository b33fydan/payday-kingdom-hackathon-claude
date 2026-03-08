export default function LandingPage({ onStart }) {
  return (
    <div className="fixed inset-0 z-40 bg-slate-950 overflow-y-auto">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="px-8 md:px-16 lg:px-24 py-8 flex items-center justify-between">
          <h2 className="font-pixel text-emerald-400 uppercase tracking-widest text-shadow-heading text-lg md:text-xl">
            Payday Kingdom
          </h2>
        </div>

        {/* Hero content */}
        <div className="flex-1 flex flex-col md:flex-row items-center px-8 md:px-16 lg:px-24 pb-16 gap-10 md:gap-16">
          {/* Left: text */}
          <div className="flex-1 max-w-xl">
            <h1 className="font-pixel text-3xl md:text-4xl lg:text-5xl text-white leading-relaxed text-shadow-title" style={{ lineHeight: '1.6' }}>
              Your Budget. Your Kingdom.
            </h1>
            <p className="font-sans text-slate-400 text-sm md:text-base mt-8 leading-relaxed max-w-md">
              Turn boring bills into tiny bosses, let payday summon your champion, and grow a voxel island that proves discipline can look legendary.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mt-10">
              <div className="panel-card flex items-center gap-2" style={{ padding: '0.6rem 1rem' }}>
                <span className="text-emerald-400 text-sm">🔒</span>
                <div>
                  <p className="font-sans text-white text-xs font-bold">No Bank Sync</p>
                  <p className="font-sans text-slate-500 text-xs">Your data stays in the browser.</p>
                </div>
              </div>
              <div className="panel-card flex items-center gap-2" style={{ padding: '0.6rem 1rem' }}>
                <span className="text-amber-400 text-sm">🎮</span>
                <div>
                  <p className="font-sans text-white text-xs font-bold">Retro Feedback</p>
                  <p className="font-sans text-slate-500 text-xs">Synth sounds, battle FX.</p>
                </div>
              </div>
              <div className="panel-card flex items-center gap-2" style={{ padding: '0.6rem 1rem' }}>
                <span className="text-blue-400 text-sm">📸</span>
                <div>
                  <p className="font-sans text-white text-xs font-bold">Share-First</p>
                  <p className="font-sans text-slate-500 text-xs">Made to look good as a screenshot.</p>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 mt-12">
              <button
                onClick={onStart}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-pixel text-xs px-8 py-4 rounded-2xl transition-all shadow-lg shadow-yellow-500/20 active:scale-[0.98] text-shadow-label"
              >
                Start Your Kingdom
              </button>
              <a
                href="#how-it-works"
                className="font-pixel text-xs text-slate-400 border border-slate-600 rounded-2xl px-8 py-4 hover:text-white hover:border-slate-400 transition-all text-shadow-label inline-flex items-center"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Right: visual placeholder — decorative voxel-style illustration */}
          <div className="flex-1 max-w-md w-full">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
              {/* Decorative grid of colored blocks to represent the game */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-7 gap-1 transform rotate-12 scale-90 opacity-80">
                  {Array.from({ length: 49 }, (_, i) => {
                    const row = Math.floor(i / 7)
                    const col = i % 7
                    const isCenter = row >= 1 && row <= 5 && col >= 1 && col <= 5
                    const isInner = row >= 2 && row <= 4 && col >= 2 && col <= 4
                    const grassColors = ['#4ade80', '#22c55e', '#16a34a']
                    const color = isCenter
                      ? grassColors[Math.floor((row * 7 + col) % 3)]
                      : 'transparent'
                    const hasTree = isInner && (i === 16 || i === 18 || i === 30)
                    const hasBuilding = i === 24
                    return (
                      <div key={i} className="relative">
                        <div
                          className="w-8 h-8 md:w-10 md:h-10 rounded-sm"
                          style={{ backgroundColor: color, boxShadow: isCenter ? '0 2px 4px rgba(0,0,0,0.3)' : 'none' }}
                        />
                        {hasTree && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <div className="w-3 h-3 rounded-sm bg-green-700" />
                            <div className="w-1.5 h-2 bg-amber-800 mx-auto" />
                          </div>
                        )}
                        {hasBuilding && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <div className="w-4 h-5 rounded-sm bg-stone-400" />
                            <div className="w-5 h-1 bg-amber-700 -mt-0.5 -ml-0.5" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Floating label */}
              <div className="absolute top-3 right-3 font-pixel text-slate-500/50" style={{ fontSize: '0.4rem' }}>
                PURELY PROCEDURAL VOXELS
              </div>
              <div className="absolute bottom-3 left-3 font-pixel text-emerald-400/50" style={{ fontSize: '0.4rem' }}>
                NO EXTERNAL 3D ASSETS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="px-8 md:px-16 lg:px-24 py-20 border-t border-white/5">
        <p className="font-pixel text-emerald-400 uppercase tracking-widest text-shadow-label" style={{ fontSize: '0.55rem' }}>
          How It Works
        </p>
        <h2 className="font-pixel text-xl md:text-2xl text-white mt-3 text-shadow-heading" style={{ lineHeight: '1.6' }}>
          Budgeting becomes a tiny fantasy loop.
        </h2>
        <p className="font-sans text-slate-400 text-sm mt-4 leading-relaxed max-w-2xl">
          The core premise is simple: every useful financial action gives you an immediate visual payoff. You are never staring at a spreadsheet with no reward.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-12">
          {[
            { step: '1', title: 'Enter income and bills', desc: 'Type your monthly income, add recurring bills. Each bill spawns a monster on your island.' },
            { step: '2', title: 'Trigger payday', desc: 'Hit the button, and the hero drops in to battle every monster one by one.' },
            { step: '3', title: 'Grow and share', desc: 'Earn XP, level up, capture screenshots. Your island evolves the more months you survive.' },
            { step: '4', title: 'Repeat monthly', desc: 'Reset bills, add new ones, and watch your kingdom grow with every payday.' },
          ].map(item => (
            <div key={item.step} className="panel-card" style={{ padding: '1.5rem' }}>
              <span className="font-pixel text-emerald-400 text-shadow-label" style={{ fontSize: '0.55rem' }}>Step {item.step}</span>
              <h3 className="font-sans text-white font-bold text-sm mt-3 text-shadow-label">{item.title}</h3>
              <p className="font-sans text-slate-500 text-xs mt-3 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-8 md:px-16 lg:px-24 py-20 border-t border-white/5 text-center">
        <h2 className="font-pixel text-lg md:text-xl text-white text-shadow-heading" style={{ lineHeight: '1.6' }}>
          Ready to build your kingdom?
        </h2>
        <p className="font-sans text-slate-400 text-sm mt-3">No sign-up. No data leaves your browser. Just you and your budget.</p>
        <button
          onClick={onStart}
          className="mt-8 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-pixel text-xs px-10 py-4 rounded-2xl transition-all shadow-lg shadow-yellow-500/20 active:scale-[0.98] text-shadow-label"
        >
          Start Your Kingdom
        </button>
        <p className="font-sans text-slate-600 text-xs mt-6">
          Built for a 48-hour hackathon. Judged on creativity.
        </p>
      </div>
    </div>
  )
}
