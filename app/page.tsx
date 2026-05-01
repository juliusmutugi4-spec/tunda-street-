
"use client"
import {
  Zap, Orbit, Cpu, Atom, Fingerprint, Telescope, Radio,
  Infinity, ShoppingCart, Search, Plus, LayoutDashboard, X, Activity, ScanFace, Mic, Globe2, Check, Trash2, Upload, MessageCircle, Mail
} from "lucide-react"
import React, { useState, useEffect } from "react"
import { openDB, DBSchema, IDBPDatabase } from 'idb'

type Item = {
  id: number;
  name: string;
  price: number;
  discount?: number;
  image?: string;
  desc?: string;
  seller_whatsapp?: string;
  seller_email?: string;
}

interface GetuyaDB extends DBSchema {
  products: { key: number; value: Item }
  images: { key: number; value: Blob | File }
  cart: { key: number; value: { id: number; name: string; price: number; discount?: number } }
}

let dbPromise: Promise<IDBPDatabase<GetuyaDB>>

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<GetuyaDB>('getuya2090_clean', 1, {
      upgrade(db) {
        db.createObjectStore('products')
        db.createObjectStore('images')
        db.createObjectStore('cart')
      }
    })
  }
  return dbPromise
}

const saveProductToDB = async (product: Item, imageFile: File) => {
  const db = await getDB()
  await db.put('products', product, product.id)
  await db.put('images', imageFile, product.id)
}

const loadProductsFromDB = async (): Promise<Item[]> => {
  const db = await getDB()
  const products = await db.getAll('products')
  const productsWithImages = await Promise.all(
    products.map(async (p) => {
      const imageBlob = await db.get('images', p.id)
      return {
 ...p,
        image: imageBlob? URL.createObjectURL(imageBlob) : ""
      }
    })
  )
  return productsWithImages
}

const saveCartToDB = async (cart: Item[]) => {
  const db = await getDB()
  const tx = db.transaction('cart', 'readwrite')
  const store = tx.objectStore('cart')
  await store.clear()
  for (const item of cart) {
    await store.put({ id: item.id, name: item.name, price: item.price, discount: item.discount }, item.id)
  }
  await tx.done
}

const loadCartFromDB = async (products: Item[]): Promise<Item[]> => {
  const db = await getDB()
  const cartItems = await db.getAll('cart')
  return cartItems.map((savedItem) =>
    products.find(p => p.id === savedItem.id) || (savedItem as Item)
  ).filter(Boolean)
}

export default function Getuya2090() {
  const [products, setProducts] = useState<Item[]>([
    { id: 1, name: "Pulse-Drive v1.0", price: 1200, discount: 20, image: "", seller_whatsapp: "254712345678", seller_email: "seller@mars.com" },
    { id: 2, name: "Pulse-Drive v2.0", price: 2400, image: "", seller_whatsapp: "254712345678" },
    { id: 3, name: "Pulse-Drive v3.0", price: 3600, discount: 50, image: "", seller_email: "flash@mars.com" },
  ])
  const [cart, setCart] = useState<Item[]>([])
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [hologramItem, setHologramItem] = useState<Item | null>(null)
  const [marsTradeData, setMarsTradeData] = useState({ volume: "45.2T", status: "STABLE" })
  const [toast, setToast] = useState<string | null>(null)
  const [showCart, setShowCart] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)
  const [pName, setPName] = useState("")
  const [pPrice, setPPrice] = useState("")
  const [pDiscount, setPDiscount] = useState("")
  const [pImage, setPImage] = useState<string>("")
  const [pDesc, setPDesc] = useState("")
  const [pImageFile, setPImageFile] = useState<File | null>(null)
  const [pWhatsapp, setPWhatsapp] = useState("")
  const [pEmail, setPEmail] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)

  useEffect(() => {
    loadProductsFromDB().then(async (dbProducts) => {
      if (dbProducts.length > 0) {
        setProducts(dbProducts)
        const dbCart = await loadCartFromDB(dbProducts)
        setCart(dbCart)
      } else {
        const db = await getDB()
        for (const p of products) {
          await db.put('products', p, p.id)
        }
      }
    })
  }, [])

  useEffect(() => {
    saveCartToDB(cart)
  }, )

  useEffect(() => {
    const interval = setInterval(() => {
      setMarsTradeData({
        volume: (Math.random() * 100).toFixed(1) + "T",
        status: Math.random() > 0.1? "STABLE" : "FLUCTUATING"
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const getFinalPrice = (item: Item) => {
    if (!item.discount) return item.price
    return (item.price * (1 - item.discount / 100))
  }

  const handleoOrbitClick = () => {
    setActiveFilter("ALL")
    setSearchQuery("")
    window.scrollTo({ top: 0, behavior: "smooth" })
    setToast("Grid reset to origin")
  }

  const toggleVoiceSearch = () => {
    setIsVoiceActive(true)
    setTimeout(() => {
      setIsVoiceActive(false)
      setToast("Neural Query Resolved: 'Neuro-Core' found in Sector 7")
    }, 2500)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 14 * 1024 * 1024) {
      setToast("Image too large. Max 14MB")
      return
    }
    setPImageFile(file)
    setPImage(URL.createObjectURL(file))
  }

  const handlePostProduct = async () => {
    if (!pName ||!pPrice ||!pImageFile || (!pWhatsapp &&!pEmail)) {
      setToast("Name, price, image & WhatsApp OR Email required")
      return
    }
    const newProduct: Item = {
      id: Date.now(),
      name: pName,
      price: parseFloat(pPrice),
      discount: pDiscount? parseFloat(pDiscount) : undefined,
      image: "",
      desc: pDesc,
      seller_whatsapp: pWhatsapp? pWhatsapp.replace(/\D/g, '') : undefined,
      seller_email: pEmail || undefined
    }

    await saveProductToDB(newProduct, pImageFile)
    const updated = await loadProductsFromDB()
    setProducts(updated)

    setToast(`${pName} stored in neural vault`)
    setPName(""); setPPrice(""); setPDiscount(""); setPImage(""); setPImageFile(null); setPDesc(""); setPWhatsapp(""); setPEmail(""); setShowPostModal(false)
  }

  const confirmAddToCart = (item: Item) => {
    if (cart.find(i => i.id === item.id)) {
      setToast(`${item.name} already synced`)
    } else {
      setCart(prev => [...prev, item])
      setToast(`${item.name} added to cargo bay`)
    }
    setHologramItem(null)
  }

  const contactSeller = (item: Item) => {
    const subject = `Interest in ${item.name} on Getuya 2090`
    const body = `I'm interested in ${item.name} - ${getFinalPrice(item)} CR. Is it still available?`

    if (item.seller_whatsapp) {
      window.open(`https://wa.me/${item.seller_whatsapp}?text=${encodeURIComponent(body)}`, '_blank')
    } else if (item.seller_email) {
      window.open(`mailto:${item.seller_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
    } else {
      setToast("Seller has no contact linked")
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.desc?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-[#00ffcc] font-mono p-6 pb-32">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-[#00ffcc] text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 animate-bounce">
          <Check size={16} /> {toast}
        </div>
      )}

      <div className="fixed top-0 left-0 w-full bg-[#00ffcc]/5 border-b border-[#00ffcc]/20 py-2 px-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Globe2 size={12}/> MARS_COLONY_7:</span>
          <span className="text-white font-bold">{marsTradeData.volume}</span>
          <span className={marsTradeData.status === "STABLE"? "text-green-500" : "text-red-500 animate-pulse"}>[{marsTradeData.status}]</span>
        </div>
      </div>

      <header className="flex justify-between items-center mt-12 mb-10">
        <h1 className="text-3xl font-black italic text-white tracking-tighter uppercase">Getuya 2090</h1>
        <button onClick={() => setShowCart(true)} className="bg-white/5 border border-[#00ffcc]/30 p-4 rounded-2xl relative hover:bg-white/10 transition">
          <ShoppingCart size={24} />
          {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-[#00ffcc] text-black text-xs font-bold px-2 rounded-full">{cart.length}</span>}
        </button>
      </header>

      <div className="max-w-2xl mx-auto mb-16 relative group">
        <div className="absolute -inset-1 bg-[#00ffcc] rounded-2xl blur-lg opacity-10 group-hover:opacity-20 transition"></div>
        <div className="relative flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#00ffcc]/30" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080808] border border-[#00ffcc]/20 p-5 pl-14 rounded-2xl outline-none focus:border-[#00ffcc] text-white"
              placeholder="Search the void..."
            />
          </div>
          <button onClick={toggleVoiceSearch} className={`p-5 rounded-2xl transition-all border ${isVoiceActive? 'bg-[#00ffcc] text-black' : 'bg-white/5 border-[#00ffcc]/20'}`}>
            <Mic size={24} className={isVoiceActive? "animate-pulse" : ""} />
          </button>
        </div>
      </div>

      {products.some(p => p.discount && p.discount > 0) && (
        <div className="mb-8 bg-gradient-to-r from-red-500/10 to-[#00ffcc]/10 border border-red-500/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="text-red-500" size={24} />
              <h3 className="text-xl font-black text-white italic">FLASH DEALS</h3>
            </div>
            <span className="text-xs text-red-400 animate-pulse">LIMITED TIME</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {products.filter(p => p.discount).slice(0, 4).map(item => (
              <button
                key={item.id}
                onClick={() => setHologramItem(item)}
                className="bg-black/50 border border-red-500/20 p-3 rounded-xl text-left hover:border-red-500/60 transition-all"
              >
                <p className="text-white text-xs font-bold truncate">{item.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-[#00ffcc] text-sm font-black">{getFinalPrice(item)} CR</span>
                  <span className="text-gray-600 text-xs line-through">{item.price}</span>
                </div>
                <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">-{item.discount}%</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map(item => (
          <div key={item.id} className="relative bg-[#050505] border border-[#00ffcc]/10 p-6 rounded-[2.5rem] hover:border-[#00ffcc]/60 transition-all group overflow-hidden">
            <div className="h-56 bg-gray-900 rounded-3xl mb-6 flex items-center justify-center overflow-hidden">
              {item.image? <img src={item.image} className="w-full h-full object-cover" /> : <Atom size={56} className="opacity-20" />}
            </div>
            <h3 className="text-xl font-bold text-white uppercase italic mb-2">{item.name}</h3>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#00ffcc] font-bold underline-offset-4">⭓ {getFinalPrice(item)}</span>
              <button onClick={() => setHologramItem(item)} className="bg-[#00ffcc] text-black px-6 py-2 rounded-xl font-black active:scale-90 transition">SYNC</button>
            </div>
            {(item.seller_whatsapp || item.seller_email) && (
              <button
                onClick={() => contactSeller(item)}
                className="w-full bg-green-600/20 border border-green-500/30 text-green-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600/30 transition"
              >
                {item.seller_whatsapp? <MessageCircle size={18}/> : <Mail size={18}/>} CONTACT SELLER
              </button>
            )}
          </div>
        ))}
      </div>

      {showPostModal && (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#050505] border-2 border-[#00ffcc] w-full max-w-lg p-8 rounded-3xl relative">
            <button onClick={() => setShowPostModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X /></button>
            <h2 className="text-2xl font-black text-white italic mb-6">UPLOAD MATTER</h2>
            <div className="space-y-4">
              <input value={pName} onChange={(e) => setPName(e.target.value)} placeholder="Item Name" className="w-full bg-black border border-[#00ffcc]/20 p-4 rounded-xl text-white outline-none" />
              <input value={pPrice} onChange={(e) => setPPrice(e.target.value)} type="number" placeholder="Price (Credits)" className="w-full bg-black border border-[#00ffcc]/20 p-4 rounded-xl text-white outline-none" />
              <input value={pDiscount} onChange={(e) => setPDiscount(e.target.value)} type="number" placeholder="Discount % (Optional)" className="w-full bg-black border border-[#00ffcc]/20 p-4 rounded-xl text-white outline-none" />
              <input
                value={pWhatsapp}
                onChange={(e) => setPWhatsapp(e.target.value)}
                placeholder="WhatsApp: 254712345678 (optional if email set)"
                className="w-full bg-black border border-[#00ffcc]/20 p-4 rounded-xl text-white outline-none"
              />
              <input
                value={pEmail}
                onChange={(e) => setPEmail(e.target.value)}
                type="email"
                placeholder="Email: seller@mars.com (optional if WhatsApp set)"
                className="w-full bg-black border border-[#00ffcc]/20 p-4 rounded-xl text-white outline-none"
              />
              <textarea value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="Description" className="w-full bg-black border border-[#00ffcc]/20 p-4 rounded-xl text-white outline-none h-20" />
              <div className="flex items-center justify-center border-2 border-dashed border-[#00ffcc]/20 p-8 rounded-xl relative group">
                <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                {pImage? <img src={pImage} className="h-20 w-20 object-cover rounded-lg" /> : <div className="text-center text-xs text-gray-500"><Upload className="mx-auto mb-2" /> UPLOAD TEXTURE</div>}
              </div>
              <button onClick={handlePostProduct} className="w-full bg-[#00ffcc] text-black font-black py-5 rounded-2xl shadow-[0_0_20px_rgba(0,255,204,0.3)]">BROADCAST TO GRID</button>
            </div>
          </div>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex justify-end">
          <div className="w-full max-w-md bg-[#050505] border-l border-[#00ffcc]/20 h-full p-8 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white italic">CARGO BAY</h2>
              <button onClick={() => setShowCart(false)} className="text-[#00ffcc]"><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {cart.length === 0? (
                <p className="text-gray-500 text-center mt-20">Cargo bay empty</p>
              ) : cart.map(item => (
                <div key={item.id} className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="h-12 w-12 bg-gray-800 rounded-lg overflow-hidden">{item.image && <img src={item.image} className="w-full h-full object-cover" />}</div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">{item.name}</div>
                    <div className="text-[#00ffcc]">⭓ {getFinalPrice(item)}</div>
                  </div>
                  <button onClick={() => setCart(cart.filter(i => i.id!== item.id))} className="text-red-500/50 hover:text-red-500"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-[#00ffcc]/20 pt-4 mt-4">
                <div className="flex justify-between text-white mb-4">
                  <span className="font-bold">TOTAL:</span>
                  <span className="text-[#00ffcc] font-black">⭓ {cart.reduce((sum, item) => sum + getFinalPrice(item), 0)}</span>
                </div>
                <button
                  onClick={() => {
                    setToast("Message sellers directly to complete purchase")
                    setShowCart(false)
                  }}
                  className="w-full bg-[#00ffcc] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2"
                >
                  CONTACT SELLERS
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showSearchModal && (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#050505] border-2 border-[#00ffcc] w-full max-w-lg p-8 rounded-3xl relative">
            <button onClick={() => setShowSearchModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X /></button>
            <h2 className="text-2xl font-black text-white italic mb-6">NEURAL SCAN</h2>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#00ffcc]/30" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-[#00ffcc]/20 p-5 pl-14 rounded-2xl outline-none focus:border-[#00ffcc] text-white"
                placeholder="Search the void..."
                autoFocus
              />
            </div>
            <button
              onClick={() => {
                setShowSearchModal(false)
                setToast(`Scanning for: ${searchQuery || 'everything'}`)
              }}
              className="w-full bg-[#00ffcc] text-black font-black py-4 rounded-2xl mt-6"
            >
              INITIATE SCAN
            </button>
          </div>
        </div>
      )}

      {showAboutModal && (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#050505] border-2 border-[#00ffcc] w-full max-w-lg p-8 rounded-3xl relative">
            <button onClick={() => setShowAboutModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X /></button>
            <h2 className="text-2xl font-black text-white italic mb-6 flex items-center gap-3">
              <Infinity className="text-[#00ffcc]" /> GETUYA 2090
            </h2>
            <div className="space-y-4 text-gray-400">
              <p className="text-white font-bold">MARS COLONY TRADING POST</p>
              <p>Version: 2090.1.0</p>
              <p>Total Items: {products.length}</p>
              <p>Cargo Synced: {cart.length}</p>
              <p className="pt-4 border-t border-[#00ffcc]/20">Built on neural blockchain. All matter transactions encrypted via quantum entanglement.</p>
            </div>
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full bg-[#00ffcc] text-black font-black py-4 rounded-2xl mt-6"
            >
              ACKNOWLEDGED
            </button>
          </div>
        </div>
      )}

      {hologramItem && (
        <div className="fixed inset-0 z-[150] bg-black/90 flex items-center justify-center p-4">
          <div className="text-center bg-[#050505] border border-[#00ffcc]/30 p-8 rounded-3xl max-w-md">
            <Atom size={80} className="text-[#00ffcc] mx-auto mb-6 animate-spin" />
            <h2 className="text-white text-2xl font-bold mb-2 italic uppercase">{hologramItem.name}</h2>
            <p className="text-[#00ffcc] text-xl mb-6">⭓ {getFinalPrice(hologramItem)}</p>
            {hologramItem.desc && <p className="text-gray-400 mb-6 text-sm">{hologramItem.desc}</p>}
            <div className="space-y-3">
              <button onClick={() => confirmAddToCart(hologramItem)} className="w-full bg-[#00ffcc] text-black px-10 py-4 rounded-2xl font-black">ADD TO CARGO</button>
              {(hologramItem.seller_whatsapp || hologramItem.seller_email) && (
                <button
                  onClick={() => contactSeller(hologramItem)}
                  className="w-full bg-green-600 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-2"
                >
                  {hologramItem.seller_whatsapp? <MessageCircle size={20}/> : <Mail size={20}/>} CONTACT SELLER
                </button>
              )}
              <button onClick={() => setHologramItem(null)} className="w-full text-gray-500 hover:text-white py-2">ABORT</button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black/60 backdrop-blur-3xl border border-[#00ffcc]/20 rounded-full p-2 flex justify-between items-center shadow-2xl z-[100]">
        <button
          onClick={handleoOrbitClick}
          className="p-4 text-[#00ffcc] hover:scale-110 active:scale-90 transition"
          title="Reset / Home"
        >
          <Orbit/>
        </button>

        <button
          onClick={() => {
            setActiveFilter("ALL")
            setSearchQuery("")
            window.scrollTo({ top: 0, behavior: "smooth" })
            setToast("Dashboard: Showing all items")
          }}
          className="p-4 text-white/30 hover:text-[#00ffcc] hover:scale-110 active:scale-90 transition"
          title="Dashboard"
        >
          <LayoutDashboard/>
        </button>

        <button
          onClick={() => setShowPostModal(true)}
          className="bg-[#00ffcc] p-6 rounded-full text-black -translate-y-6 shadow-[0_10px_30px_rgba(0,255,204,0.4)] active:scale-90 transition-all hover:scale-105"
          title="Upload Product"
        >
          <Plus size={32}/>
        </button>

        <button
          onClick={() => setShowSearchModal(true)}
          className="p-4 text-white/30 hover:text-[#00ffcc] hover:scale-110 active:scale-90 transition"
          title="Search"
        >
          <Telescope/>
        </button>

        <button
          onClick={() => setShowAboutModal(true)}
          className="p-4 text-white/30 hover:text-[#00ffcc] hover:scale-110 active:scale-90 transition"
          title="About Getuya 2090"
        >
          <Infinity/>
        </button>
      </nav>
    </div>
  )
}