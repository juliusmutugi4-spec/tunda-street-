'use client'
import { useState } from 'react'
import { Dialog, Listbox } from '@headlessui/react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Trash2, X, ChevronDown, Check } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const categories = [
  { name: 'Digital', value: 'digital' },
  { name: 'Phones', value: 'phones' },
  { name: 'Laptops', value: 'laptops' },
  { name: 'Fashion', value: 'fashion' },
  { name: 'Home', value: 'home' },
  { name: 'Cars', value: 'cars' },
  { name: 'Services', value: 'services' },
]

const digitalTypes = [
  { name: 'Street Tips - Betting', value: 'betting' },
  { name: 'eBook / Course', value: 'ebook' },
]

type Leg = {
  home_team: string
  away_team: string
  prediction: string
  odds: string
  match_date: string
}

function GeometricPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      <svg
        className="absolute bottom-0 right-0 w-72 h-72 opacity-20"
        viewBox="0 0 256 256"
        fill="none"
      >
        <path d="M40 200 L80 120 L120 180 L160 100 L200 160 L240 80" stroke="#22c55e" strokeWidth="0.6"/>
        <path d="M20 180 L60 100 L100 160 L140 80 L180 140 L220 60 L256 120" stroke="#22c55e" strokeWidth="0.6"/>
        <path d="M0 220 L40 140 L80 200 L120 120 L160 180 L200 100 L240 160" stroke="#22c55e" strokeWidth="0.6"/>
        <path d="M60 256 L100 176 L140 236 L180 156 L220 216 L256 136" stroke="#22c55e" strokeWidth="0.6"/>
        <path d="M256 200 L200 256" stroke="#22c55e" strokeWidth="0.6"/>
        <path d="M256 160 L160 256" stroke="#22c55e" strokeWidth="0.6"/>
        <path d="M256 120 L120 256" stroke="#22c55e" strokeWidth="0.6"/>
        <path d="M256 80 L80 256" stroke="#22c55e" strokeWidth="0.6"/>
        <path d="M200 0 L256 56" stroke="#22c55e" strokeWidth="0.6"/>
        <path d="M160 0 L256 96" stroke="#22c55e" strokeWidth="0.6"/>
        <path d="M120 0 L256 136" stroke="#22c55e" strokeWidth="0.6"/>
      </svg>
    </div>
  )
}

export default function SellModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [category, setCategory] = useState(categories[0])
  const [digitalType, setDigitalType] = useState(digitalTypes[0])
  const [legs, setLegs] = useState<Leg[]>([{ home_team: '', away_team: '', prediction: '', odds: '', match_date: '' }])
  const [price, setPrice] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const isBetting = category.value === 'digital' && digitalType.value === 'betting'
  const totalOdds = legs.reduce((acc, leg) => acc * (parseFloat(leg.odds) || 1), 1).toFixed(2)
  const lastMatchDate = legs.reduce((latest, leg) =>
!latest || new Date(leg.match_date) > new Date(latest)? leg.match_date : latest, ''
  )

  const addLeg = () => setLegs([...legs, { home_team: '', away_team: '', prediction: '', odds: '', match_date: '' }])
  const removeLeg = (i: number) => setLegs(legs.filter((_, idx) => idx!== i))
  const updateLeg = (i: number, field: keyof Leg, value: any) => {
    const newLegs = [...legs]
    newLegs[i] = {...newLegs[i], [field]: value }
    setLegs(newLegs)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Login required')
      setLoading(false)
      return
    }

    if (isBetting) {
      const { data: product, error: productError } = await supabase
  .from('products')
  .insert({
          user_id: user.id,
          title: `${legs.length}-Game Multi @ ${totalOdds}`,
          price: parseInt(price),
          category: 'digital',
          digital_type: 'betting',
          status: 'active',
          is_multi: legs.length > 1,
          legs_count: legs.length,
          total_odds: parseFloat(totalOdds),
          last_match_date: new Date(lastMatchDate).toISOString(),
          analysis,
          description: analysis
        })
  .select()
  .single()

      if (!productError && product) {
        await supabase.from('tip_legs').insert(legs.map(leg => ({
          product_id: product.id,
     ...leg,
          odds: parseFloat(leg.odds),
          match_date: new Date(leg.match_date).toISOString()
        })))
      } else {
        alert(productError?.message)
        setLoading(false)
        return
      }
    } else {
      await supabase.from('products').insert({
        user_id: user.id,
        title,
        price: parseInt(price),
        category: category.value,
        digital_type: category.value === 'digital'? digitalType.value : null,
        status: 'active',
        description
      })
    }

    setLoading(false)
    onClose()
  }

  const Select = ({ value, onChange, options, label }: any) => (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Label className="text-xs text-zinc-400 mb-1.5 block">{label}</Listbox.Label>
        <Listbox.Button className="relative w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 pl-3 pr-10 text-left text-white focus:outline-none focus:ring-2 focus:ring-green-500">
          <span className="block truncate">{value.name}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          </span>
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-zinc-800 border border-zinc-700 py-1 shadow-lg focus:outline-none">
          {options.map((option: any) => (
            <Listbox.Option key={option.value} value={option}
              className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active? 'bg-zinc-700 text-white' : 'text-zinc-300'}`}>
              {({ selected }) => (
                <>
                  <span className={`block truncate ${selected? 'font-medium' : 'font-normal'}`}>{option.name}</span>
                  {selected? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500"><Check className="h-4 w-4" /></span> : null}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  )

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl relative">
            <GeometricPattern />
            <div className="relative z-10">
              <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
                <Dialog.Title className="text-lg font-semibold text-white">Sell Item</Dialog.Title>
                <button onClick={onClose}><X className="w-5 h-5 text-zinc-500 hover:text-white" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-96 overflow-y-auto">
                <Select value={category} onChange={setCategory} options={categories} label="Category *" />

                {category.value === 'digital' && (
                  <Select value={digitalType} onChange={setDigitalType} options={digitalTypes} label="Digital Type *" />
                )}

                {isBetting? (
                  <>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-green-400 text-xs font-medium">Total Odds: {totalOdds} • Expires when last game starts</p>
                    </div>

                    {legs.map((leg, i) => (
                      <div key={i} className="bg-zinc-800/50 rounded-xl p-3 space-y-2 border border-zinc-700/50">
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-zinc-400 font-medium">Game {i + 1}</p>
                          {legs.length > 1 && (
                            <button type="button" onClick={() => removeLeg(i)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="Home Team" required value={leg.home_team}
                            onChange={e => updateLeg(i, 'home_team', e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
                          <input placeholder="Away Team" required value={leg.away_team}
                            onChange={e => updateLeg(i, 'away_team', e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
                        </div>
                        <input placeholder="Prediction: Over 2.5" required value={leg.prediction}
                          onChange={e => updateLeg(i, 'prediction', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" step="0.01" placeholder="Odds: 1.85" required value={leg.odds}
                            onChange={e => updateLeg(i, 'odds', e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
                          <input type="datetime-local" required value={leg.match_date}
                            onChange={e => updateLeg(i, 'match_date', e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
                        </div>
                      </div>
                    ))}

                    <button type="button" onClick={addLeg}
                      className="w-full border border-dashed border-zinc-700 hover:border-zinc-600 text-zinc-400 rounded-lg p-2.5 text-sm flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Add Game
                    </button>

                    <textarea placeholder="Your analysis & reasoning..." rows={3} required value={analysis}
                      onChange={e => setAnalysis(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
                  </>
                ) : (
                  <>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. iPhone 12 Pro" required
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Used 6 months, good condition..."
                      rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
                  </>
                )}

                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">Price (KSh) *</label>
                  <input type="number" required value={price} onChange={e => setPrice(e.target.value)}
                    placeholder="e.g. 200" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
                </div>

                <button disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg p-3 font-medium transition">
                  {loading? 'Posting...' : isBetting? `Post ${legs.length}-Game Tip` : 'Post Item'}
                </button>

                {isBetting && (
                  <p className="text-xs text-zinc-500 text-center">
                    ⚠️ 18+ only. Betting involves risk. Tips auto-expire when games start.
                  </p>
                )}
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  )
}