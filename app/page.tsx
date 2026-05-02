"use client"
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, X, Upload } from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Product = {
  id: number
  title: string
  price: number
  phone: string
  description?: string
  image_url?: string
  created_at: string
}

export default function Getuya2090() {
  const [products, setProducts] = useState<Product[]>([])
  const [showPostModal, setShowPostModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', price: '', phone: '', description: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data) setProducts(data)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 14 * 1024 * 1024) {
        alert('Image too large. Max 14MB')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const { error } = await supabase.storage.from('uploads').upload(fileName, file)
    if (error) {
      console.error('Upload error:', error)
      return null
    }
    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName)
    return publicUrl
  }

  const handlePost = async () => {
    if (!newItem.title ||!newItem.price ||!newItem.phone) return
    setLoading(true)

    let image_url = null
    if (imageFile) {
      image_url = await uploadImage(imageFile)
      if (!image_url) {
        alert('Image upload failed')
        setLoading(false)
        return
      }
    }

    const { error } = await supabase.from('products').insert({
      title: newItem.title,
      price: parseInt(newItem.price),
      phone: newItem.phone,
      description: newItem.description,
      image_url
    })

    if (!error) {
      setNewItem({ title: '', price: '', phone: '', description: '' })
      setImageFile(null)
      setImagePreview(null)
      setShowPostModal(false)
      fetchProducts()
    } else {
      alert('Post failed: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <button onClick={() => setShowPostModal(true)} className="border border-green-400 p-2 mb-4">
        <Plus className="inline mr-2" /> BROADCAST TO GRID
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="border border-green-400 p-4">
            {product.image_url && <img src={product.image_url} alt={product.title} className="w-full h-48 object-cover mb-2" />}
            <h3>{product.title}</h3>
            <p>KSh {product.price.toLocaleString()}</p>
            <a href={`https://wa.me/${product.phone}`} target="_blank" className="block border border-green-400 p-2 mt-2 text-center">
              CONTACT SELLER
            </a>
          </div>
        ))}
      </div>

      {showPostModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="border border-green-400 p-4 w-full max-w-md bg-black">
            <div className="flex justify-between mb-4">
              <h2>NEW TRANSMISSION</h2>
              <X onClick={() => setShowPostModal(false)} className="cursor-pointer" />
            </div>

            <input placeholder="Item Name" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} className="w-full bg-black border border-green-400 p-2 mb-2" />
            <input placeholder="Price (KSh)" type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full bg-black border border-green-400 p-2 mb-2" />
            <input placeholder="WhatsApp: 254712345678" value={newItem.phone} onChange={e => setNewItem({...newItem, phone: e.target.value})} className="w-full bg-black border border-green-400 p-2 mb-2" />
            <textarea placeholder="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full bg-black border border-green-400 p-2 mb-2" />

            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="border border-green-400 p-2 mb-2 w-full">
              <Upload className="inline mr-2" /> {imageFile? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}
            </button>
            {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover mb-2" />}

            <button onClick={handlePost} disabled={loading} className="border border-green-400 p-2 w-full">
              {loading? 'BROADCASTING...' : 'BROADCAST TO GRID'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}