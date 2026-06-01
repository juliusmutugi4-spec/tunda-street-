"use client"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import { X, Trophy, Link, Plus, Trash2, Shield, Calendar, DollarSign, Activity, Percent, Target, TrendingUp, CheckCircle2, Copy, Edit2, Settings } from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Match = { home: string; away: string; tip: string; odds: string }
type BettingCompany = "SportPesa" | "Betika" | "Odibets" | "Betway Kenya" | "1XBet Kenya" | "MozzartBet" | "22Bet" | "BangBet" | "MeridianBet" | "Lucky2U" | "BetLion" | "PremierBet" | "Other"
type RiskLevel = "Safe / Banker" | "Moderate Risk" | "High Risk / Longshot"

export default function Broadcast({ onClose }: { onClose?: () => void }) {
  const [company, setCompany] = useState<BettingCompany>("SportPesa")
  const [price, setPrice] = useState("")
  const [link, setLink] = useState("")
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("Moderate Risk")
  const [matches, setMatches] = useState<Match[]>([{ home: "", away: "", tip: "", odds: "1.85" }])
  const [expiryHours, setExpiryHours] = useState(6)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null, text: string }>({ type: null, text: "" })
  const [showSettingsPopup, setShowSettingsPopup] = useState(false)

  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

  const totalOdds = matches.reduce((acc, m) => {
    const numericOdds = parseFloat(m.odds)
    return acc * (isNaN(numericOdds) || numericOdds <= 0? 1 : numericOdds)
  }, 1).toFixed(2)

  const addMatch = () => {
    if (matches.length >= 10) {
      setStatusMessage({ type: 'error', text: "Max 10 games per slip" })
      return
    }
    setMatches([...matches, { home: "", away: "", tip: "", odds: "1.85" }])
  }

  const removeMatch = (i: number) => setMatches(matches.filter((_, idx) => idx!== i))

  const updateMatch = (i: number, field: keyof Match, val: string) => {
    const newMatches = [...matches]
    newMatches[i][field] = val
    setMatches(newMatches)
    const errorKey = `match-${i}-${field}`
    if (errors[errorKey]) {
      setErrors(prev => ({...prev, [errorKey]: "" }))
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    matches.forEach((m, i) => {
      if (!m.home.trim()) newErrors[`match-${i}-home`] = "Home team required"
      if (!m.away.trim()) newErrors[`match-${i}-away`] = "Away team required"
      if (!m.tip.trim()) newErrors[`match-${i}-tip`] = "Pick required"
      if (!m.odds || parseFloat(m.odds) < 1.01) newErrors[`match-${i}-odds`] = "Odds must be ≥ 1.01"
    })
    if (!price || parseFloat(price) <= 0) newErrors.price = "Price must be > KSh 0"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadTip = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage({ type: null, text: "" })
    if (!validate()) {
      setStatusMessage({ type: 'error', text: "Fix errors above" })
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.from("betting_tips").insert({
        seller_name: "Verified Tipster",
        match_name: matches.map(m => `${m.home} vs ${m.away}`).join(" | "),
        tip_text: matches.map(m => m.tip).join(", "),
        odds: Number(totalOdds),
        price: Number(price),
        duration_hours: expiryHours,
        company,
        slip_link: link.trim() || null,
        risk_classification: riskLevel,
        slip_details: matches,
        is_verified: true,
        created_at: new Date().toISOString()
      })
      if (error) throw error
      setStatusMessage({ type: 'success', text: `✓ Live! ${matches.length} game${matches.length > 1? 's' : ''} published` })
      setTimeout(() => {
        setMatches([{ home: "", away: "", tip: "", odds: "1.85" }])
        setPrice(""); setLink("")
        onClose?.()
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || "Broadcast failed" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80">
      <div className="w-full max-w-2xl h- sm:h- flex-col bg-gray-950 border-gray-800 rounded-2xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">Broadcast Premium Slip</h2>
              <p className="text-xs text-gray-400">KSh Market</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMessage.text && (
          <div className={`px-6 py-3 text-xs font-medium flex items-center gap-2 shrink-0 ${
            statusMessage.type === 'error'? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
          }`}>
            <Activity className="w-4 h-4" />
            {statusMessage.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={uploadTip} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Matches - Dark Red Cards */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-black tracking-widest text-red-500 uppercase font-mono flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600 shadow-[0_0_8px_#dc2626]"></span>
                </span>
                Matches <span className="text-white text- bg-red-900/40 px-2 py-0.5 rounded-full">{matches.length}/10</span>
              </label>
              <button type="button" onClick={addMatch} disabled={matches.length >= 10}
                className="group text-xs font-black tracking-wider text-white flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 rounded-xl shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:shadow-[0_0_35px_rgba(220,38,38,0.6)] disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all duration-200 active:scale-95">
                <Plus className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                <span>Add Game</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
              {matches.map((m, i) => (
                <div key={i} className="bg-red-950/40 border-red-900/50 rounded-2xl p-4 space-y-3 mr-2 hover:bg-red-950/50 transition">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-red-300 uppercase">Event {i + 1}</span>
                    {matches.length > 1 && (
                      <button type="button" onClick={() => removeMatch(i)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input ref={i === 0? firstInputRef : null} placeholder="Home Team e.g. Man United" value={m.home}
                        onChange={e => updateMatch(i, 'home', e.target.value)}
                        className={`w-full bg-gray-950 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-red-500 outline-none ${errors[`match-${i}-home`]? 'border-red-500' : 'border-red-900/30'}`} />
                      {errors[`match-${i}-home`] && <p className="text-red-400 text- mt-1">{errors[`match-${i}-home`]}</p>}
                    </div>
                    <div>
                      <input placeholder="Away Team e.g. Arsenal" value={m.away}
                        onChange={e => updateMatch(i, 'away', e.target.value)}
                        className={`w-full bg-gray-950 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-red-500 outline-none ${errors[`match-${i}-away`]? 'border-red-500' : 'border-red-900/30'}`} />
                      {errors[`match-${i}-away`] && <p className="text-red-400 text- mt-1">{errors[`match-${i}-away`]}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="relative">
                        <TrendingUp className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input placeholder="Pick: Over 2.5, BTTS, 1X2" value={m.tip}
                          onChange={e => updateMatch(i, 'tip', e.target.value)}
                          className={`w-full bg-gray-950 border rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:border-red-500 outline-none ${errors[`match-${i}-tip`]? 'border-red-500' : 'border-red-900/30'}`} />
                      </div>
                      {errors[`match-${i}-tip`] && <p className="text-red-400 text- mt-1">{errors[`match-${i}-tip`]}</p>}
                    </div>
                    <div>
                      <div className="relative">
                        <Percent className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="number" step="0.01" min="1.01" max="40" placeholder="1.85" value={m.odds}
                          onChange={e => updateMatch(i, 'odds', e.target.value)}
                          className={`w-full bg-gray-950 border rounded-lg pl-10 pr-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:border-red-500 outline-none ${errors[`match-${i}-odds`]? 'border-red-500' : 'border-red-900/30'}`} />
                      </div>
                      {errors[`match-${i}-odds`] && <p className="text-red-400 text- mt-1">{errors[`match-${i}-odds`]}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification - Only Slip Link */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verification Asset
            </label>
            <div>
              <label className="block text-xs text-gray-500 mb-2">Slip Link</label>
              <div className="relative">
                <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="url" placeholder="https://sportpesa.com/slip/..." value={link}
                  onChange={e => setLink(e.target.value)}
                  className="w-full bg-gray-900 border-gray-800 rounded-lg pl-10 pr-12 py-2.5 text-sm text-white placeholder-gray-600 focus:border-emerald-500 outline-none" />
                {link && (
                  <button type="button" onClick={() => copyToClipboard(link, 'link')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-emerald-400">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {copiedField === 'link' && <p className="text-emerald-400 text- mt-1">Copied!</p>}
            </div>
          </div>

          {/* Risk */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Risk Level</label>
            <select value={riskLevel} onChange={e => setRiskLevel(e.target.value as RiskLevel)}
              className="w-full bg-gray-900 border-gray-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none">
              <option>Safe / Banker</option>
              <option>Moderate Risk</option>
              <option>High Risk / Longshot</option>
            </select>
          </div>
        </form>

        {/* Submit - Sticky with editable Price + Red Dot Button */}
        <div className="sticky bottom-0 pt-4 border-t border-gray-800 bg-gray-950/95 backdrop-blur-md px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex justify-between items-center mb-4 p-3 bg-gray-900 rounded-lg">
            <div>
              <p className="text-xs text-gray-400">Total Odds</p>
              <p className="text-xl font-bold text-emerald-400 font-mono">{totalOdds}</p>
            </div>

            {/* Red Dot Button */}
            <button type="button" onClick={() => setShowSettingsPopup(true)}
              className="relative p-3 rounded-full bg-red-600 hover:bg-red-700 transition shadow-lg shadow-red-600/40">
              <Settings className="w-4 h-4 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </button>

            <div className="text-right">
              <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
                Price KSh <span className="text-red-400">*</span>
                <Edit2 className="w-3 h-3" />
              </p>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={price}
                  onChange={e => { setPrice(e.target.value); if (errors.price) setErrors(prev => ({...prev, price: "" })) }}
                  className={`text-xl font-bold text-white bg-transparent text-right w-24 outline-none border-b-2 ${
                    errors.price? 'border-red-500' : 'border-gray-700 focus:border-emerald-500'
                  }`}
                />
              </div>
              {errors.price && <p className="text-red-400 text- mt-1 text-right">{errors.price}</p>}
            </div>
          </div>

          <button type="submit" onClick={uploadTip} disabled={loading}
            className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base uppercase tracking-wide transition ${
              loading? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
            }`}>
            {loading? "Broadcasting..." : "Publish Premium Slip"}
          </button>
        </div>
      </div>

      {/* Popup Modal for Bookmaker + Expire */}
      {showSettingsPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-900 border-gray-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-white">Quick Settings</h3>
              <button onClick={() => setShowSettingsPopup(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Bookmaker</label>
                <div className="relative">
                  <Trophy className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <select value={company} onChange={e => setCompany(e.target.value as BettingCompany)}
                    className="w-full bg-gray-800 border-gray-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:border-red-500 outline-none">
                    {["SportPesa","Betika","Odibets","Betway Kenya","1XBet Kenya","MozzartBet","22Bet","BangBet","MeridianBet","Lucky2U","BetLion","PremierBet","Other"].map(c =>
                      <option key={c} value={c}>{c}</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Expires In</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <select value={expiryHours} onChange={e => setExpiryHours(Number(e.target.value))}
                    className="w-full bg-gray-800 border-gray-700 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white focus:border-red-500 outline-none appearance-none cursor-pointer">
                    <option value={2}>2 Hours - Flash</option>
                    <option value={4}>4 Hours - Quick</option>
                    <option value={6}>6 Hours - Standard</option>
                    <option value={12}>12 Hours - Extended</option>
                    <option value={24}>24 Hours - Full Day</option>
                    <option value={48}>48 Hours - 2 Days</option>
                    <option value={72}>72 Hours - Empire Time</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Two Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button type="button" onClick={() => setShowSettingsPopup(false)}
                  className="py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm transition">
                  Cancel
                </button>
                <button type="button" onClick={() => setShowSettingsPopup(false)}
                  className="py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition shadow-lg shadow-red-600/30">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}