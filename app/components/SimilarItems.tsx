'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Product = {
  id: number
  title: string
  price: number
  image_url: string
}

export default function SimilarItems({ category, currentId }: { category: string, currentId: number }) {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSimilar = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('products')
        .select('id, title, price, image_url')
        .eq('category', category)
        .neq('id', currentId)
        .limit(4)
      
      if (data) setItems(data)
      setLoading(false)
    }
    fetchSimilar()
  }, [category, currentId])

  if (loading) return <div className="text-sm text-gray-500 px-5 py-4">Loading similar items...</div>
  if (items.length === 0) return null

  return (
    <div className="mt-8 border-t pt-6 px-5">
      <h3 className="text-lg font-semibold mb-4">Similar Items</h3>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <Link key={item.id} href={`/product/${item.id}`}>
            <div className="border rounded-lg overflow-hidden hover:shadow-md transition">
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-2xl">
                  📦
                </div>
              )}
              <div className="p-2">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-green-600 font-semibold">KSh {item.price.toLocaleString()}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}