"use client"
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, X, Upload, Search, MapPin, ArrowLeft, Phone, Wallet, Grid3X3, Megaphone,ShoppingBag,  User, Heart, Eye, EyeOff, Trash2, ArrowDownToLine, ArrowUpFromLine, Send,Shield } from "lucide-react"
import SimilarItems from '@/app/components/SimilarItems'
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
  category: string
  location: string
  youtube_url?: string
  created_at: string
  user_id?: string
  views: number
   digital_type?: string  
  download_url?: string 
}

type UserType = {
  id: string
  email?: string
}
type WalletType = {
  balance: number
  escrow_balance: number
  phone: string | null
}
type Order = {
  id: string
  amount: number
  status: string
  buyer_id: string
  seller_id: string
  youtube_url?: string
  product_id: number
  created_at: string
  products?: {
    title: string
    image_url?: string
  }
}


type DriverLocation = {   // <-- NEW CODE STARTS HERE
  driver_id: string
  lat: number
  lng: number
  rating: number
  acceptance_rate: number
  is_online: boolean
}

type RidePing = {
  id: string
  customer_id: string
  area_name: string
  lat: number
  lng: number
  status: string
  created_at: string
}
type RideRequest = {
  id: string
  customer_id: string
  area_name: string
  destination?: string
  lat: number
  lng: number
  status: string
  created_at: string
}
type Ride = {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  status: string;
}


const CATEGORIES = [
  { name: 'All', value: '', emoji: '🏪' },
   { name: 'Digital', value: 'digital', emoji: '💾' },
  { name: 'Phones', value: 'phones', emoji: '📱' },
  { name: 'Fashion', value: 'fashion', emoji: '👕' },
  { name: 'Laptops', value: 'laptops', emoji: '💻' },
  { name: 'Home', value: 'home', emoji: '🏠' },
  { name: 'Cars', value: 'cars', emoji: '🚗' },
  { name: 'Services', value: 'services', emoji: '🛠️' },
]
const DIGITAL_TYPES = [
  { name: 'Blender Character', value: 'blender', emoji: '🧊' },
  { name: 'eBook', value: 'ebook', emoji: '📚' },
  { name: 'Video Course', value: 'video', emoji: '🎬' },
  { name: 'Betting Tips', value: 'betting', emoji: '⚽' },
]


const LOCATIONS = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Other']

const CARD_COLORS = [
  'bg-green-50', 'bg-purple-50', 'bg-orange-50',
  'bg-blue-50', 'bg-pink-50', 'bg-teal-50'
]

function TimerPopup({ 
  activeRide, 
  handleAcceptRide, 
  handleRejectRide, 
  handleStartRide, 
  handleCompleteRide, 
  openNavigation, 
  loading 
}: { 
  activeRide: any, 
  handleAcceptRide: () => void, 
  handleRejectRide: () => void, 
  handleStartRide: () => void, 
  handleCompleteRide: () => void, 
  openNavigation: () => void, 
  loading: boolean 
}) {
  const [rides, setRides] = useState<any[]>([]);

  useEffect(() => {
    async function loadRides() {
      const { data } = await supabase
       .from('streetpay_rides')
       .select('*')
       .eq('status', 'requesting');
      setRides(data || []);
    }
    loadRides();

    const channel = supabase
     .channel('new-rides')
     .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'streetpay_rides', 
        filter: 'status=eq.requesting' 
      }, (payload) => {
        setRides(currentRides => [payload.new as any,...currentRides]);
      })
     .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="px-1 py-1">
      <div className="text-[10px] font-bold text-gray-500 mb-1">Requests ({rides.length})</div>
      {rides.length === 0? (
        <div className="text-[10px] text-gray-400 text-center py-1">No requests</div>
      ) : (
        <div className="space-y-0.5">
          {rides.map((ride) => (
            <div key={ride.id} className="bg-white rounded px-1.5 py-1 flex justify-between items-center shadow-sm">
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-gray-900">
                  {ride.area_name || ride.pickup_location || '?'} → {ride.destination || ride.dropoff_location || '?'}
                </span>
                <span className="text-gray-600 ml-1">
                  Ksh{ride.estimated_fare || ride.fare_estimate || 0}
                </span>
              </div>
              <button
                onClick={async () => {
                  await supabase.from('streetpay_rides').update({ status: 'accepted' }).eq('id', ride.id);
                  setRides(rides.filter(r => r.id!== ride.id));
                }}
                className="bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded hover:bg-pink-600"
              >
                Accept Ride
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export default function StreetMarket() {
  const [bellCount, setBellCount] = useState(0);
const [showBoxes, setShowBoxes] = useState(false);
  const [rides, setRides] = useState<any[]>([]);
 const [pickup, setPickup] = useState(''); 
const [dropoff, setDropoff] = useState('');
   const [isDriverOnline, setIsDriverOnline] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [toasts, setToasts] = useState<{id: number, message: string}[]>([]);
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [showPostModal, setShowPostModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
 
    const [receiverTag, setReceiverTag] = useState('')
  const [sendAmount, setSendAmount] = useState('')
const [sendPhone, setSendPhone] = useState('');

const [activeTab, setActiveTab] = useState<'wallet' | 'categories' | 'broadcast' | 'profile' | 'orders'>('wallet')
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [activeLocation, setActiveLocation] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState<UserType | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])
  const [wallet, setWallet] = useState<WalletType>({ balance: 0, escrow_balance: 0, phone: null })
  const [orders, setOrders] = useState<Order[]>([])
  const [showDepositModal, setShowDepositModal] = useState(false)
const [showWithdrawModal, setShowWithdrawModal] = useState(false)
const [showSendModal, setShowSendModal] = useState(false)
const [depositAmount, setDepositAmount] = useState('')
const [depositPhone, setDepositPhone] = useState('')
const [withdrawAmount, setWithdrawAmount] = useState('')
const [withdrawPhone, setWithdrawPhone] = useState('')
const [otpCode, setOtpCode] = useState('')
const [awaitingOtp, setAwaitingOtp] = useState(false)
const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
const [hasPaidForThisItem, setHasPaidForThisItem] = useState(false)
const [showBalance, setShowBalance] = useState(true)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(true)

const [drawerOpen, setDrawerOpen] = useState(false)
const [touchStartX, setTouchStartX] = useState(0)
const [currentX, setCurrentX] = useState(0)
const [isDragging, setIsDragging] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '', price: '', phone: '', description: '',
    category: '', location: 'Nairobi', digital_type: '', // ADD THIS
    download_url: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

function showToast(message: string) {
  const id = Date.now();
  setToasts(current => [...current, { id, message }]);
  setTimeout(() => {
    setToasts(current => current.filter(t => t.id!== id));
  }, 4000);
}

  useEffect(() => {
    checkUser()
    fetchProducts()
  }, [])

useEffect(() => {
  if (user) {
    fetchFavorites()
    fetchWallet()
    fetchOrders()
  } else {
    setWallet({ balance: 0, escrow_balance: 0, phone: null })
    setFavorites([])
    setOrders([])
  }
}, [user])

useEffect(() => {
  // 1. Load existing rides on page load
  async function loadRides() {
    const { data } = await supabase
     .from('streetpay_rides')
     .select('*')
     .eq('status', 'requesting');
    setRides(data || []);
  }
  loadRides();

  // 2. Listen for new rides in real-time
  const channel = supabase
   .channel('new-rides')
   .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'streetpay_rides',
        filter: 'status=eq.requesting'
      },
      (payload) => {
        showToast(`🔥 New ride: ${payload.new.pickup_location} → ${payload.new.dropoff_location}`);
        setRides(currentRides => [payload.new as Ride,...currentRides]);
      }
    )
   .subscribe();

  // 3. Cleanup
  return () => {
    supabase.removeChannel(channel);
  };
}, []);

const handleRelease = async (orderId: string) => {
  if (!user) return
  const { error } = await supabase.rpc('release_escrow', { order_id: orderId })
  if (error) {
    alert('Error: ' + error.message)
  } else {
    alert('Payment released to seller!')
    fetchOrders()
    fetchWallet()
  }
}

const handleRefund = async (orderId: string) => {
  if (!user) return
  const { error } = await supabase.rpc('refund_escrow', { order_id: orderId })
  if (error) {
    alert('Error: ' + error.message)
  } else {
    alert('Refund sent to buyer!')
    fetchOrders()
    fetchWallet()
  }
}
useEffect(() => {
  if (!user || !isDriverOnline) return;
  
  const channel = supabase
    .channel('ride-requests')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'ride_pings',
      filter: 'status=eq.active'
    }, (payload) => {
      // BELL SOUND
      const audio = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3');
      audio.play().catch(() => {});
      // SHOW POPUP
      setActiveRide(payload.new);
    })
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
}, [user, isDriverOnline]);

const handleSend = async () => {
  if (!user) {
    alert('Please log in first'); 
    return;
  }
  if (!sendPhone || !sendAmount) {
    alert('Enter phone and amount'); 
    return;
  }
  
  const amount = parseFloat(sendAmount);
  if (isNaN(amount) || amount <= 0) {
    alert('Enter a valid amount'); 
    return;
  }
  if (amount > wallet.balance) {
    alert('Insufficient wallet balance'); 
    return;
  }

  // Find recipient by phone
  const { data: recipient, error: recipientError } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone', sendPhone)
    .single();
    
  if (recipientError || !recipient) {
    alert('User not found with phone number: ' + sendPhone); 
    return;
  }
  if (recipient.id === user.id) {
    alert('You cannot send money to yourself'); 
    return;
  }

  // Deduct from your wallet
  const { error: deductError } = await supabase
    .from('wallets')
    .update({ balance: wallet.balance - amount })
    .eq('user_id', user.id);
    
  if (deductError) {
    alert('Failed to send: ' + deductError.message); 
    return;
  }

  // Add to recipient wallet using RPC
  const { error: addError } = await supabase.rpc('increment_wallet', {
    user_id_param: recipient.id,
    amount_param: amount
  });
  
  if (addError) {
    alert('Failed to credit recipient: ' + addError.message); 
    return;
  }

  alert('Money sent successfully!');
  setSendAmount('');
  setSendPhone('');
  fetchWallet(); // Refresh your balance
};
const handleAcceptRide = async () => {
  if (!activeRide ||!user) return
  setLoading(true)
  
  const { error } = await supabase
   .from('ride_pings')
   .update({ 
      status: 'accepted',
      driver_id: user.id,
      accepted_at: new Date().toISOString()
    })
   .eq('id', activeRide.id)
  
  if (error) {
    alert('Failed: ' + error.message)
  } else {
    // Update driver location when accepting ride
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        await supabase
         .from('driver_locations')
         .update({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            is_online: true,
            updated_at: new Date().toISOString()
          })
         .eq('driver_id', user.id)
      })
    }
    setActiveRide({...activeRide, status: 'accepted' }) // Keep popup open
  }
  
  setLoading(false)
}

const handleRejectRide = async () => {
  if (!activeRide) return
  setLoading(true)
  await supabase.from('ride_pings').update({ status: 'rejected' }).eq('id', activeRide.id)
  setActiveRide(null)
  setLoading(false)
}

const handleStartRide = async () => {
  if (!activeRide) return
  setLoading(true)
  await supabase.from('ride_pings').update({ 
    status: 'in_progress', 
    started_at: new Date().toISOString() 
  }).eq('id', activeRide.id)
  setActiveRide({...activeRide, status: 'in_progress' })
  setLoading(false)
}

const handleCompleteRide = async () => {
  if (!activeRide || !user) return;
  
  console.log('1. Starting complete ride for user:', user.id);
  console.log('2. Active ride:', activeRide);
  
  try {
    // Update ride status
    const { error: rideError } = await supabase
      .from('rides')
      .update({ status: 'completed' })
      .eq('id', activeRide.id);
    
    if (rideError) {
      console.log('3. Ride update FAILED:', rideError);
      return;
    }
    console.log('3. Ride update SUCCESS');

    // Add money to wallet
    const { data, error: walletError } = await supabase
      .rpc('increment_wallet', { 
        user_id_param: user.id, 
        amount_param: activeRide.fare 
      });
    
    if (walletError) {
      console.log('4. Wallet RPC FAILED:', walletError);
      alert('Payment failed: ' + walletError.message);
      return;
    }
    console.log('4. Wallet RPC SUCCESS:', data);
    
    alert(`Ride completed! Earned KSh ${activeRide.fare}`);
    
  } catch (error) {
    console.log('5. CATCH ERROR:', error);
  }
}

const openNavigation = () => {
  if (!activeRide?.pickup_lat) return alert('No pickup location')
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeRide.pickup_lat},${activeRide.pickup_lng}`, '_blank')
}

const toggleDriverOnline = async () => {
  if (!user) return setShowAuthModal(true)
  
  const newStatus = !isDriverOnline
  setIsDriverOnline(newStatus)
  
  if (newStatus && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await supabase.from('driver_locations').upsert({
        driver_id: user.id,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        is_online: true,
        updated_at: new Date().toISOString()
      })
    })
  } else {
    await supabase.from('driver_locations')
      .update({ is_online: false })
      .eq('driver_id', user.id)
  }
}


const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11)? match[2] : ''
}
  useEffect(() => {
    filterProducts()
  }, [products, activeCategory, activeLocation, searchTerm, activeTab, favorites])

useEffect(() => {
  if (wallet.phone && !depositPhone) {
    setDepositPhone(wallet.phone)
  }
}, [wallet.phone])

const handleTouchStart = (e: React.TouchEvent) => {
  if (e.touches[0].clientX < 20) {
    setTouchStartX(e.touches[0].clientX)
    setIsDragging(true)
  }
}

const handleTouchMove = (e: React.TouchEvent) => {
  if (!isDragging) return
  const x = e.touches[0].clientX
  setCurrentX(x - touchStartX)
  if (x - touchStartX > 50) setDrawerOpen(true)
}

const handleTouchEnd = () => {
  setIsDragging(false)
  if (currentX < 50) setDrawerOpen(false)
  setCurrentX(0)
}

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }
const fetchWallet = async () => {
  if (!user) return
  const { data } = await supabase
   .from('wallets')
   .select('balance, escrow_balance, phone')
   .eq('user_id', user.id)
   .single()
  if (data) setWallet(data)
}
  const fetchProducts = async () => {
    const { data } = await supabase
   .from('products')
   .select('*')
   .order('created_at', { ascending: false })
    if (data) setProducts(data)
  }

  const fetchFavorites = async () => {
    if (!user) return
    const { data } = await supabase
   .from('favorites')
   .select('product_id')
   .eq('user_id', user.id)
    if (data) setFavorites(data.map(f => f.product_id))
  }
const fetchOrders = async () => {
  if (!user) return
  const { data, error } = await supabase
   .from('orders')
   .select(`
     *,
     products(title, image_url)
   `)
   .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
   .order('created_at', { ascending: false })

  if (!error && data) setOrders(data)
}

  const filterProducts = () => {
    let filtered = products

    if (activeTab === 'profile' && user) {
      filtered = filtered.filter(p => p.user_id === user.id)
    } else {
      if (activeCategory) filtered = filtered.filter(p => p.category === activeCategory)
      if (activeLocation) filtered = filtered.filter(p => p.location === activeLocation)
      if (searchTerm) {
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
    }
    setFilteredProducts(filtered)
  }

const handleEmailAuth = async () => {
  setLoading(true)
  try {
    if (!awaitingOtp) {
      // Step 1: Send the code
      const { error } = await supabase.auth.signInWithOtp({
        email: authEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined // ← This line is the fix
        }
      })
      if (error) throw error
      setAwaitingOtp(true)
      alert('Code sent! Check your email')
    } else {
      // Step 2: Verify the code  
      const { data, error } = await supabase.auth.verifyOtp({
        email: authEmail,
        token: otpCode,
        type: 'email'
      })
      if (error) throw error
      setUser(data.user)
      setShowAuthModal(false)
      setAwaitingOtp(false)
      setOtpCode('')
      setAuthEmail('')
    }
  } catch (error: any) {
    alert(error.message)
  } finally {
    setLoading(false)
  }
}


const handleSendMoney = async () => {
  if (!user) return setShowAuthModal(true)
  
  const amount = parseInt(sendAmount)
  
  if (!receiverTag.trim()) return alert("Enter receiver wallet tag")
  if (!receiverTag.startsWith('%!')) return alert("Tag must start with %!")
  if (!amount || amount <= 0) return alert("Enter valid amount")
  if (wallet.balance < amount) return alert("Insufficient balance")
  
  setLoading(true)
  
  const { data: receiver, error } = await supabase
    .from('profiles')
    .select('id, wallet_tag')
    .eq('wallet_tag', receiverTag.trim())
    .single()
    
  if (error || !receiver) {
    alert("Wallet tag not found")
    setLoading(false)
    return
  }
  
  if (receiver.id === user.id) {
    alert("Can't send to yourself")
    setLoading(false)
    return
  }
  
  const { data: receiverWallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', receiver.id)
    .single()
    
  if (!receiverWallet) {
    alert("Receiver wallet not found")
    setLoading(false)
    return
  }
  
  await supabase.from('wallets')
    .update({ balance: wallet.balance - amount })
    .eq('user_id', user.id)
    
  await supabase.from('wallets')
    .update({ balance: receiverWallet.balance + amount })
    .eq('user_id', receiver.id)
  
  await supabase.from('transactions').insert({
    sender_id: user.id,
    receiver_id: receiver.id,
    amount: amount,
    type: 'send',
    status: 'completed'
  })
  
  alert(`Sent KSh ${amount} to ${receiverTag}`)
  setSendAmount('')
  setReceiverTag('')
  setShowSendModal(false)
  setLoading(false)
  fetchWallet()
}
  
  const handleCreateEscrowOrder = async () => {
  if (!user) return setShowAuthModal(true)
  if (!sendAmount || !selectedProduct) return
  if (parseInt(sendAmount) > wallet.balance) return alert('Insufficient balance')
  if (!selectedProduct.user_id) return alert('Seller not found')
  if (user.id === selectedProduct.user_id) return alert('Cannot buy your own item')

  setLoading(true)
  const amount = parseInt(sendAmount)

  const { error: walletError } = await supabase
    .from('wallets')
    .update({ 
      balance: wallet.balance - amount,
      escrow_balance: wallet.escrow_balance + amount 
    })
    .eq('user_id', user.id)

  if (walletError) {
    alert('Failed to lock funds: ' + walletError.message)
    setLoading(false)
    return
  }

  const { error: orderError } = await supabase.from('orders').insert({
    buyer_id: user.id,
    seller_id: selectedProduct.user_id,
    product_id: selectedProduct.id,
    amount: amount,
    status: 'pending'
  })

  if (!orderError) {
    alert('Order placed! Money held safely until you confirm delivery.')
    setShowSendModal(false)
    setSendAmount('')
    fetchWallet()
  } else {
    alert('Order failed: ' + orderError.message)
    await supabase.from('wallets').update({ 
      balance: wallet.balance,
      escrow_balance: wallet.escrow_balance 
    }).eq('user_id', user.id)
  }
  setLoading(false)
}

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setFavorites([])
    setActiveTab('wallet')
  }

  const toggleFavorite = async (productId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return setShowAuthModal(true)

    if (favorites.includes(productId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId)
      setFavorites(favorites.filter(id => id!== productId))
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, product_id: productId })
      setFavorites([...favorites, productId])
    }
  }

  const incrementViews = async (productId: number) => {
    await supabase.rpc('increment_views', { row_id: productId })
  }

  const handleDelete = async (productId: number) => {
    if (!confirm('Delete this listing?')) return
    await supabase.from('products').delete().eq('id', productId)
    setSelectedProduct(null)
    fetchProducts()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 14 * 1024 * 1024) return alert('Image too large. Max 14MB')
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const { error } = await supabase.storage.from('uploads').upload(fileName, file)
    if (error) return null
    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName)
    return publicUrl
  }

  const handlePost = async () => {
    if (!user) return setShowAuthModal(true)
    if (!newItem.title ||!newItem.price ||!newItem.phone ||!newItem.category) return
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
      category: newItem.category,
      location: newItem.location,
      image_url,
      youtube_url: youtubeUrl,
      user_id: user.id,
      digital_type: newItem.category === 'digital' ? newItem.digital_type : null,
      download_url: newItem.category === 'digital' ? newItem.download_url : null
    })

    if (!error) {
      setNewItem({ title: '', price: '', phone: '', description: '', category: '', location: 'Nairobi', digital_type: '', download_url: '' })
      setImageFile(null)
      setImagePreview(null)
      setYoutubeUrl('')
      setShowPostModal(false)
      fetchProducts()
    } else {
      alert('Post failed: ' + error.message)
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // DETAIL VIEW
  if (selectedProduct) {
    incrementViews(selectedProduct.id)
    return (
      <div 
  className="min-h-screen bg-white font-sans"
 
 
>
  {/* Left Swipe Drawer */}
<div className={`fixed inset-y-0 left-0 z- w-64 bg-white shadow-2xl transform transition-transform duration-300 ${drawerOpen? 'translate-x-0' : '-translate-x-full'}`}>
  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
    <h2 className="font-bold text-lg text-gray-900">Menu</h2>
    <button 
      onClick={() => setDrawerOpen(false)} 
      className="p-2 hover:bg-gray-100 rounded-lg"
    >
      <X className="w-5 h-5 text-gray-900" />
    </button>
  </div>
  <div className="flex flex-col gap-1 p-4">
    <button onClick={() => {setActiveTab('wallet'); setDrawerOpen(false)}} className={`flex items-center gap-3 p-3 rounded-lg text-gray-900 ${activeTab === 'wallet'? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`} >
      <Wallet className="w-5 h-5" /> Wallet 
    </button>
    <button onClick={() => {setActiveTab('categories'); setDrawerOpen(false)}} className={`flex items-center gap-3 p-3 rounded-lg text-gray-900 ${activeTab === 'categories'? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`} >
      <Grid3X3 className="w-5 h-5" /> Grid 
    </button>
    <button onClick={() => {setActiveTab('orders'); setDrawerOpen(false)}} className={`flex items-center gap-3 p-3 rounded-lg text-gray-900 ${activeTab === 'orders'? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`} >
      <ShoppingBag className="w-5 h-5" /> Orders 
    </button>
    <button onClick={() => {setActiveTab('profile'); setDrawerOpen(false)}} className={`flex items-center gap-3 p-3 rounded-lg text-gray-900 ${activeTab === 'profile'? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`} >
      <User className="w-5 h-5" /> Profile 
    </button>
    <button onClick={() => {setShowPostModal(true); setDrawerOpen(false)}} className="flex items-center gap-3 p-3 rounded-lg bg-green-500 text-white hover:bg-green-600 mt-4" >
      <Plus className="w-5 h-5" /> Sell 
    </button>
  </div>
</div>
{/* Backdrop */}
{drawerOpen && (
  <div 
    className="fixed inset-0 bg-black/40 z-" 
    onClick={() => setDrawerOpen(false)} 
  />
)}
        <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
          <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedProduct(null)} className="p-2">
                <ArrowLeft className="h-5 w-5 text-gray-900" />
              </button>
              <h1 className="text-lg font-bold text-gray-900">Item Details</h1>
            </div>
            <div onClick={(e) => toggleFavorite(selectedProduct.id, e)} className="p-2 cursor-pointer">
              <Heart className={`h-6 w-6 ${favorites.includes(selectedProduct.id)? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </div>
          </div>

          {selectedProduct.image_url? (
            <img src={selectedProduct.image_url} alt={selectedProduct.title} className="w-full h-80 object-cover" />
          ) : (
            <div className="w-full h-80 bg-gray-100 flex items-center justify-center text-6xl">
              {CATEGORIES.find(c => c.value === selectedProduct.category)?.emoji || '📦'}
            </div>
          )}
{selectedProduct.youtube_url && selectedProduct.youtube_url.trim() !== '' && (
  <div className="p-4 relative">
    <div className="absolute top-6 left-6 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center z-10">
      📹 Video
    </div>
    <iframe 
      src={`https://www.youtube.com/embed/${getYouTubeId(selectedProduct.youtube_url)}`} 
      className="w-full h-48 rounded-xl" 
      allowFullScreen 
    />
  </div>
)}
          <div className="p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm">{selectedProduct.views} views</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.title}</h2>
            <p className="text-3xl font-bold text-green-600 mb-4">KSh {selectedProduct.price.toLocaleString()}</p>

            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{selectedProduct.location}</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm">Posted {formatDate(selectedProduct.created_at)}</span>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Category</p>
              <p className="text-gray-900">
                {CATEGORIES.find(c => c.value === selectedProduct.category)?.emoji} {CATEGORIES.find(c => c.value === selectedProduct.category)?.name}
              </p>
            </div>

            {selectedProduct.description && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedProduct.description}</p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Seller Contact</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">+{selectedProduct.phone}</p>
                  <p className="text-xs text-gray-500">Usually replies instantly</p>
                </div>
              </div>

              <a
                href={`https://wa.me/${selectedProduct.phone}?text=Niaje, niko interested na ${encodeURIComponent(selectedProduct.title)}`}
                target="_blank"
                className="w-full bg-green-500 text-white rounded-xl p-4 font-semibold flex items-center justify-center gap-2 mb-3"
              >
                <Phone className="h-5 w-5" />
                Chat on WhatsApp
              </a>
 {user && user.id !== selectedProduct.user_id && ( 
  <>
    {!hasPaidForThisItem ? (
      <button 
        onClick={async () => {
          if (!user) return setShowAuthModal(true)
          
          const totalCost = selectedProduct.price + 10
          
          if (!wallet || wallet.balance < totalCost) {
            return alert(`Insufficient balance. Please deposit KSh ${totalCost} first.`)
          }
          
          setLoading(true)
          const { data, error } = await supabase.rpc('buy_with_escrow', {
            p_product_id: selectedProduct.id,
            p_seller_id: selectedProduct.user_id,
            p_amount: selectedProduct.price,
            p_fee: 10
          })
          
          if (error) {
            alert('Error: ' + error.message)
          } else {
            setCurrentOrderId(data)
            setHasPaidForThisItem(true)
            alert(`Paid! KSh ${totalCost} held safely in escrow.`)
            fetchWallet()
            fetchOrders()
          }
          setLoading(false)
        }}
        disabled={loading}
        style={{
          width: '100%', backgroundColor: 'white', color: 'black',
          border: '2px solid #000000', borderRadius: '12px', padding: '16px',
          marginBottom: '12px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '16px'
        }}
      >
        <Shield style={{height: '20px', width: '20px'}} />
        <span>Buy Safely - KSh {(selectedProduct.price + 10).toLocaleString()}</span>
        <span style={{fontSize: '12px', opacity: 0.7}}>
          KSh {selectedProduct.price.toLocaleString()} + KSh 10 protection
        </span>
      </button>
    ) : (
      <button 
        onClick={() => handleRelease(currentOrderId!)}
        disabled={loading || !currentOrderId}
        style={{
          width: '100%', backgroundColor: 'white', color: 'black',
          border: '2px solid #16a34a', borderRadius: '12px', padding: '16px',
          marginBottom: '12px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '16px'
        }}
      >
        <Shield style={{height: '20px', width: '20px', color: '#16a34a'}} />
        <span>Release Payment to Seller</span>
        <span style={{fontSize: '12px', opacity: 0.7}}>
          Click after you receive the item
        </span>
      </button>
    )}
  </>


       )} 
                     <SimilarItems category={selectedProduct.category} currentId={selectedProduct.id} />
       
             {user?.id === selectedProduct.user_id && (
                <button
                  onClick={() => handleDelete(selectedProduct.id)}
                  className="w-full bg-red-50 text-red-600 rounded-xl p-4 font-semibold flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-5 w-5" />
                  Delete Listing
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }


  
  // MAIN VIEW
  return (
    
    <div 
  className="min-h-screen bg-gray-50 font-sans"
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
    {/* TOAST NOTIFICATIONS */}
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl min-w-[250px]"
        >
          {toast.message}
        </div>
      ))}
    </div>

{/* Left Swipe Drawer */}
<div 
  onClick={(e) => e.stopPropagation()}
  onTouchEnd={(e) => e.stopPropagation()}
  className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 pointer-events-auto ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
>
  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
    <h2 className="font-bold text-lg text-gray-900">Menu</h2>
    <button 
      type="button"
      onClick={() => setDrawerOpen(false)} 
      className="p-2 hover:bg-gray-100 rounded-lg active:bg-gray-200"
    >
      <X className="w-5 h-5 text-gray-900 pointer-events-none" />
    </button>
  </div>
  <div className="flex flex-col gap-1 p-4">
    <button onClick={() => {setActiveTab('wallet'); setDrawerOpen(false)}} className={`flex items-center gap-3 p-3 rounded-lg text-gray-900 ${activeTab === 'wallet' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}>
      <Wallet className="w-5 h-5" /> Wallet
    </button>
    <button onClick={() => {setActiveTab('categories'); setDrawerOpen(false)}} className={`flex items-center gap-3 p-3 rounded-lg text-gray-900 ${activeTab === 'categories' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}>
      <Grid3X3 className="w-5 h-5" /> Grid
    </button>
    <button onClick={() => {setActiveTab('orders'); setDrawerOpen(false)}} className={`flex items-center gap-3 p-3 rounded-lg text-gray-900 ${activeTab === 'orders' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}>
      <ShoppingBag className="w-5 h-5" /> Orders
    </button>
    <button onClick={() => {setActiveTab('profile'); setDrawerOpen(false)}} className={`flex items-center gap-3 p-3 rounded-lg text-gray-900 ${activeTab === 'profile' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}>
      <User className="w-5 h-5" /> Profile
    </button>
    <button onClick={() => {setShowPostModal(true); setDrawerOpen(false)}} className="flex items-center gap-3 p-3 rounded-lg bg-green-500 text-white hover:bg-green-600 mt-4">
      <Plus className="w-5 h-5" /> Sell
    </button>
  </div>
</div>
{/* Backdrop */}
{drawerOpen && (
  <div 
    className="fixed inset-0 bg-black/40 z-40" 
    onClick={() => setDrawerOpen(false)} 
  />
)}
      <div className="max-w-md mx-auto bg-white min-h-screen pb-24">
        <div className="sticky top-0 bg-white z-10 p-5 pb-3">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-900">Street Market</h1>
            {user? (
              <button onClick={handleSignOut} className="text-sm text-gray-600">Sign out</button>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="text-sm text-green-600 font-medium">Sign in</button>
            )}
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-600"
            />
          </div>

          {(activeTab === 'categories' || activeTab === 'wallet') && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${
                    activeCategory === cat.value? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveLocation('')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${
                activeLocation === ''? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              All Kenya
            </button>
            {LOCATIONS.map(loc => (
              <button
                key={loc}
                onClick={() => setActiveLocation(loc)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  activeLocation === loc? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <MapPin className="inline h-3 w-3 mr-1" />{loc}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5">
          {activeTab === 'wallet' || activeTab === 'categories' || activeTab === 'profile'? (
            <>




{activeTab === 'wallet' && (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-3">
<h2 
  className="text-lg font-semibold text-gray-900" 
  onClick={() => setBellCount(bellCount + 1)}
  style={{ cursor: 'pointer' }}
>
  Street Ride 🔔
  {bellCount > 0 && (
    <span style={{
      backgroundColor: 'red', 
      color: 'white', 
      borderRadius: '10px', 
      padding: '2px 6px', 
      fontSize: '12px',
      marginLeft: '5px'
    }}>
      {bellCount}
    </span>
  )}
</h2>
<button 
  onClick={() => setShowBoxes(true)} 
  style={{ 
    backgroundColor: '#29AB87', 
    color: 'white', 
    padding: '10px 20px', 
    border: 'none', 
    borderRadius: '20px', 
    fontSize: '14px',
    fontWeight: '600',
    marginLeft: '10px'
  }}
>
  Find Driver
</button>

      <button className="text-green-600 text-sm font-medium">History</button>
    </div>
{showBoxes && (
  <div style={{ 
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)', 
    padding: '24px', 
    margin: '16px 0', 
    borderRadius: '20px',
    border: '2px solid #29AB87',
    boxShadow: '0 8px 32px rgba(41, 171, 135, 0.25), 0 0 0 1px rgba(41, 171, 135, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Glowing corner accent */}
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '100px',
      height: '100px',
      background: 'radial-gradient(circle, rgba(41, 171, 135, 0.15) 0%, transparent 70%)',
      borderRadius: '0 20px 0 100%'
    }}></div>

    <div style={{ marginBottom: '24px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{
          width: '12px',
          height: '12px',
          backgroundColor: '#29AB87',
          borderRadius: '50%',
          marginRight: '10px',
          boxShadow: '0 0 0 4px rgba(41, 171, 135, 0.2)'
        }}></div>
        <p style={{ 
          fontSize: '15px', 
          fontWeight: '700', 
          margin: 0,
          color: '#1a1a1a',
          letterSpacing: '0.3px'
        }}>
          PICKUP LOCATION
        </p>
      </div>
      <input 
        placeholder="Where should we pick you up?" 
        value={pickup}
        onChange={(e) => setPickup(e.target.value)}
        spellCheck={false}
        style={{ 
          width: '100%', 
          padding: '18px 20px', 
          borderRadius: '14px', 
          border: '2px solid #29AB87',
          fontSize: '17px',
          color: 'black',
          fontWeight: '500',
          boxSizing: 'border-box',
          outline: 'none',
          backgroundColor: '#fafffe'
        }}
      />
    </div>
    
    <div style={{ marginBottom: '24px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{
          width: '12px',
          height: '12px',
          backgroundColor: '#000',
          borderRadius: '2px',
          marginRight: '10px',
          transform: 'rotate(45deg)',
          boxShadow: '0 0 0 4px rgba(0, 0, 0, 0.1)'
        }}></div>
        <p style={{ 
          fontSize: '15px', 
          fontWeight: '700', 
          margin: 0,
          color: '#1a1a1a',
          letterSpacing: '0.3px'
        }}>
          DROP-OFF LOCATION
        </p>
      </div>
      <input 
        placeholder="Where are you going?" 
        value={dropoff}
        onChange={(e) => setDropoff(e.target.value)}
        spellCheck={false}
        style={{ 
          width: '100%', 
          padding: '18px 20px', 
          borderRadius: '14px', 
          border: '2px solid #29AB87',
          fontSize: '17px',
          color: 'black',
          fontWeight: '500',
          boxSizing: 'border-box',
          outline: 'none',
          backgroundColor: '#fafffe'
        }}
      />
    </div>
    
<button 
  onClick={async () => {
    if(!pickup || !dropoff) {
      alert('Please enter pickup and drop-off');
      return;
    }
    
    const { error } = await supabase
      .from('streetpay_rides')
      .insert([{ 
        pickup_location: pickup, 
        dropoff_location: dropoff,
        status: 'requesting'
      }]);
    
    if(error) {
      alert('Error: ' + error.message);
    } else {
      alert('Finding you a driver... 🚗');
      setShowBoxes(false);
      setPickup('');
      setDropoff('');
    }
  }}
  style={{ 
    width: '100%', 
    background: 'linear-gradient(135deg, #29AB87 0%, #1f8a6d 100%)', 
    color: 'white', 
    padding: '18px', 
    borderRadius: '14px', 
    border: 'none',
    fontWeight: '700',
    fontSize: '18px',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 16px rgba(41, 171, 135, 0.4)',
    cursor: 'pointer'
  }}
>
  Confirm Ride
</button>
  </div>
)}
    <div className="bg-green-50 rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Available Balance</p>
          <p className="text-2xl font-bold text-green-600">
            {showBalance ? `KSh ${wallet.balance.toFixed(2)}` : 'KSh ••••••'}
          </p>
        </div>
        <button onClick={() => setShowBalance(!showBalance)} className="p-2 rounded-full hover:bg-green-100">
          {showBalance ? <Eye className="h-5 w-5 text-gray-600" /> : <EyeOff className="h-5 w-5 text-gray-600" />}
        </button>
      </div>
    </div>

{/* DRIVER TOGGLE */}
<div className="bg-black rounded-xl p-4 mb-4">
  <div className="flex justify-between items-center">
    <div>
      <p className="text-sm text-gray-300">Driver Mode</p>
      <p className="text-xl font-bold text-white">
        {isDriverOnline ? 'You are ONLINE' : 'You are OFFLINE'}
      </p>
    </div>
    <button 
      onClick={toggleDriverOnline}
      style={{
        backgroundColor: isDriverOnline ? '#22c55e' : '#6b7280',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 20px',
        fontWeight: '600'
      }}
    >
      {isDriverOnline ? 'Go Offline' : 'Go Online'}
    </button>
  </div>
</div>

{activeRide && <TimerPopup 
  activeRide={activeRide} 
  handleAcceptRide={handleAcceptRide}
  handleRejectRide={handleRejectRide}
  handleStartRide={handleStartRide}
  handleCompleteRide={handleCompleteRide}
  openNavigation={openNavigation}
  loading={loading} 
/>}
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px'}}>
      <button onClick={() => setShowDepositModal(true)} style={{backgroundColor: 'white', color: 'black', border: '2px solid #22c55e', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
        <ArrowDownToLine style={{height: '20px', width: '20px', color: '#22c55e'}} />
        <span style={{fontSize: '14px', fontWeight: '600'}}>Deposit</span>
      </button>
      <button onClick={() => setShowWithdrawModal(true)} style={{backgroundColor: 'white', color: 'black', border: '2px solid #3b82f6', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
        <ArrowUpFromLine style={{height: '20px', width: '20px', color: '#3b82f6'}} />
        <span style={{fontSize: '14px', fontWeight: '600'}}>Withdraw</span>
      </button>
      <button onClick={() => setShowSendModal(true)} style={{backgroundColor: 'white', color: 'black', border: '2px solid #1A1A1A', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
        <Send style={{height: '20px', width: '20px', color: '#1A1A1A'}} />
        <span style={{fontSize: '14px', fontWeight: '600'}}>Send</span>
      </button>
    </div>
  </div>
)}

        {/* DEPOSIT MODAL */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-gray-900">Deposit Money</h2>
                <X onClick={() => setShowDepositModal(false)} className="cursor-pointer text-gray-500" />
              </div>
              <input
                type="number"
                placeholder="Amount (KSh)"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm text-gray-900 mb-3"
              />
<input
  type="text"
  placeholder="M-Pesa Phone 254..."
  value={depositPhone}
  onChange={e => setDepositPhone(e.target.value)}
  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm text-gray-900 mb-4"
/>
<button
onClick={async () => {
  if (!user) return setShowAuthModal(true)
  if (!depositAmount || !depositPhone) return alert('Enter amount and phone')
  
  setLoading(true)
     const res = await fetch('/api/mpesa/stkpush', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: parseInt(depositAmount),
      phone: depositPhone
    })
  })

  const result = await res.json()
  setLoading(false)

  if (result.ResponseCode === '0') {
    alert('Check your phone for M-Pesa PIN prompt.')
    setShowDepositModal(false)
    setDepositAmount('')
    setTimeout(() => {
      fetchWallet()
      alert('Wallet updated! Check your balance.')
    }, 10000)
  } else {
    alert('Deposit failed. Try again.')
  }
}}
disabled={loading || !depositAmount || !depositPhone}
style={{
  width: '100%',
  backgroundColor: 'white',
  color: 'black',
  border: '2px solid #10b981',
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  fontWeight: '600',
  fontSize: '14px',
  opacity: (loading || !depositAmount || !depositPhone) ? '0.6' : '1',
  cursor: (loading || !depositAmount || !depositPhone) ? 'not-allowed' : 'pointer'
}}
>
  <ArrowDownToLine style={{height: '20px', width: '20px', color: '#10b981'}} />
  <span>{loading ? 'Sending STK Push...' : 'Deposit via M-Pesa'}</span>
</button>
            </div>
          </div>
        )}

        {/* WITHDRAW MODAL */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-gray-900">Withdraw Money</h2>
                <X onClick={() => setShowWithdrawModal(false)} className="cursor-pointer text-gray-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">Available: KSh {wallet.balance.toFixed(2)}</p>
              <input
                type="number"
                placeholder="Amount (KSh)"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm text-gray-900 mb-3"
              />
              <input
                type="text"
                placeholder="M-Pesa Phone 254..."
                value={withdrawPhone}
                onChange={e => setWithdrawPhone(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm text-gray-900 mb-4"
              />
<button
  onClick={() => {
    alert('Withdrawal request sent. You will receive M-Pesa in 5 minutes.')
    setShowWithdrawModal(false)
  }}
  disabled={!withdrawAmount || !withdrawPhone || parseInt(withdrawAmount) > wallet.balance}
  style={{
    width: '100%',
    backgroundColor: 'white',
    color: 'black',
    border: '2px solid #3b82f6',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    fontSize: '14px',
    opacity: (!withdrawAmount || !withdrawPhone || parseInt(withdrawAmount) > wallet.balance) ? '0.6' : '1',
    cursor: (!withdrawAmount || !withdrawPhone || parseInt(withdrawAmount) > wallet.balance) ? 'not-allowed' : 'pointer'
  }}
>
  <ArrowUpFromLine style={{height: '20px', width: '20px', color: '#3b82f6'}} />
  <span>Withdraw to M-Pesa</span>
</button>
            </div>
          </div>
        )}

        {/* SEND/ESCROW MODAL */}
        {showSendModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedProduct ? 'Buy with Escrow' : 'Send Money'}
                </h2>
                <X onClick={() => setShowSendModal(false)} className="cursor-pointer text-gray-500" />
              </div>
              {selectedProduct && (
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-sm text-gray-600">Buying: {(selectedProduct as Product).title}</p>
                  <p className="font-bold text-gray-900">KSh {(selectedProduct as Product).price.toLocaleString()}</p>
                </div>
              )}
              <p className="text-sm text-gray-600 mb-3">Wallet: KSh {wallet.balance.toFixed(2)}</p>
              <input
                type="tel"
                placeholder="Recipient Phone (0712345678)"
                value={sendPhone}
                onChange={(e) => setSendPhone(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm text-gray-900 mb-4"
              />
              
              <input
                type="number"
                placeholder="Amount (KSh)"
                value={sendAmount}
                onChange={e => setSendAmount(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm text-gray-900 mb-4"
              />
              <button

onClick={handleSend}
  disabled={!sendAmount || parseInt(sendAmount) > wallet.balance}
  style={{
    width: '100%',
    backgroundColor: 'white',
    color: 'black',
    border: '2px solid #000000',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    fontSize: '14px',
    opacity: (!sendAmount || parseInt(sendAmount) > wallet.balance) ? '0.6' : '1',
    cursor: (!sendAmount || parseInt(sendAmount) > wallet.balance) ? 'not-allowed' : 'pointer'
  }}
>
  <Send style={{height: '20px', width: '20px', color: '#000000'}} />
  <span>{selectedProduct ? 'Buy with Escrow' : 'Send Money'}</span>
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Money held safely until you confirm delivery
              </p>
            </div>
          </div>
        )}

              {activeTab === 'profile' && (
                <div className="bg-green-50 rounded-xl p-4 mb-4">
                  <p className="font-medium text-gray-900">My Listings</p>
                  <p className="text-sm text-gray-600">{filteredProducts.length} items posted</p>
                  <p className="text-xs text-gray-500 mt-1">Logged in as: {user?.email}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`rounded-2xl p-4 flex flex-col justify-between min-h-[180px] text-left relative cursor-pointer ${CARD_COLORS[index % 6]}`}
                  >
                    <div
                    
                      onClick={(e) => toggleFavorite(product.id, e)}
                      className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full z-10"
                    >
                      <Heart className={`h-4 w-4 ${favorites.includes(product.id)? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 pr-6">{product.title}</h3>
                      <p className="font-bold text-gray-900">KSh {product.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <MapPin className="h-3 w-3 mr-0.5" />{product.location}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center">
                        <Eye className="h-3 w-3 mr-0.5" />{product.views}
                      </p>
                    </div>
                    <div className="flex justify-between items-end mt-3">
                      <span className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg font-medium">
                        View
                      </span>
                      {product.image_url? (
                        <img src={product.image_url} alt={product.title} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xl">
                          {CATEGORIES.find(c => c.value === product.category)?.emoji || '📦'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>

          ) : activeTab === 'orders' ? (
            <div className="p-4 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
              
              {orders.length === 0 ? (
                <p className="text-gray-500">No orders yet</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-2">
<div className="flex gap-3">
  {order.products?.image_url ? (
    <img 
      src={order.products.image_url} 
      alt={order.products.title}
      className="w-16 h-16 object-cover rounded-lg"
    />
  ) : (
    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
      📦
    </div>
  )}
  
  <div className="flex-1">
    <div className="flex justify-between items-start">
      <span className="font-semibold text-sm line-clamp-1">
        {order.products?.title || 'Unknown Product'}
      </span>
      <span className={`px-2 py-1 rounded text-xs ${
        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        order.status === 'completed' ? 'bg-green-100 text-green-800' :
        'bg-red-100 text-red-800'
      }`}>
        {order.status}
      </span>
    </div>
    
    <p className="font-bold text-gray-900 mt-1">KSh {order.amount.toLocaleString()}</p>
    <p className="text-xs text-gray-500">Order #{order.id.slice(0, 8)}</p>
  </div>
</div>
                    
                    <p>Amount: <span className="font-bold">KES {order.amount}</span></p>
                    <p className="text-sm text-gray-600">
                      {user?.id === order.buyer_id ? 'You are the Buyer' : 'You are the Seller'}
                    </p>

                    {order.status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        {user?.id === order.buyer_id && (
                          <button 
                            onClick={() => handleRelease(order.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded flex-1"
                          >
                            Release Payment
                          </button>
                        )}
                        {user?.id === order.seller_id && (
                          <button 
                            onClick={() => handleRefund(order.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded flex-1"
                          >
                            Refund Buyer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          ) : activeTab === 'broadcast'? (
            <div className="text-center py-20">
              <Megaphone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-bold text-gray-900 mb-2">Boost Your Items</p>
              <p className="text-sm text-gray-500 mb-6">Get 10x more views for KSh 100</p>
              <button className="bg-green-500 text-white px-6 py-3 rounded-xl font-medium">
                Coming Next Week
              </button>
            </div>
          ) : null}

          {filteredProducts.length === 0 && (activeTab === 'wallet' || activeTab === 'categories' || activeTab === 'profile') && (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-2">🔍</p>
              <p className="font-medium">{activeTab === 'profile'? 'No listings yet' : 'No items found'}</p>
              <p className="text-sm">{activeTab === 'profile'? 'Tap + to post your first item' : 'Try another category or be the first to post'}</p>
            </div>
          )}
        </div>

  

        
        
 {/* AUTH MODAL */}
{showAuthModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
    <div className="bg-white w-full max-w-sm rounded-3xl p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold text-gray-900">
          {awaitingOtp ? 'Enter Code' : 'Sign In'}
        </h2>
        <X onClick={() => {
          setShowAuthModal(false)
          setAwaitingOtp(false)
          setOtpCode('')
          setAuthEmail('')
        }} className="cursor-pointer text-gray-500" />
      </div>

      {!awaitingOtp ? (
        <>
          <p className="text-sm text-gray-600 mb-4">We'll email you a 6-digit code</p>
          <input 
            type="email" 
            placeholder="your@email.com" 
            value={authEmail} 
            onChange={e => setAuthEmail(e.target.value)} 
            className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm text-gray-900 mb-4" 
          />
          <button 
            onClick={handleEmailAuth} 
            disabled={loading || !authEmail} 
            className="bg-green-500 text-white rounded-xl p-4 w-full font-semibold disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Code'}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4">Code sent to {authEmail}</p>
          <input 
            type="text" 
            placeholder="123456" 
            value={otpCode} 
            onChange={e => setOtpCode(e.target.value)} 
            maxLength={6}
            className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm text-gray-900 mb-4 text-center tracking-widest" 
          />
          <button 
            onClick={handleEmailAuth} 
            disabled={loading || otpCode.length !== 6} 
            className="bg-green-500 text-white rounded-xl p-4 w-full font-semibold disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
          <button 
            onClick={() => {setAwaitingOtp(false); setOtpCode('')}} 
            className="w-full text-center text-sm text-gray-600 mt-4"
          >
            Use different email
          </button>
        </>
      )}
    </div>
  </div>
)}


        {/* POST MODAL */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-t-3xl p-5 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-gray-900">Sell Item</h2>
                <X onClick={() => setShowPostModal(false)} className="cursor-pointer text-gray-500" />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value})}
                  className="w-full bg-gray-100 border border-gray-300 rounded-xl p-3 text-sm text-gray-900"
                  required
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.slice(1).map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.emoji} {cat.name}</option>
                  ))}
                </select>
              </div>

tsx
{newItem.category === 'digital' && (
  <div>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Digital Type *</label>
      <select 
        value={newItem.digital_type} 
        onChange={e => setNewItem({...newItem, digital_type: e.target.value})} 
        className="w-full bg-gray-100 border border-gray-300 rounded-xl p-3 text-sm text-gray-900"
        required
      >
        <option value="">Select Type</option>
        <option value="blender">🧊 Blender Character</option>
        <option value="ebook">📚 eBook</option>
        <option value="video">🎬 Video Course</option>
        <option value="betting">⚽ Betting Tips</option>
      </select>
    </div>
    
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Download Link *</label>
      <input 
        type="url"
        placeholder="https://drive.google.com/..." 
        value={newItem.download_url} 
        onChange={e => setNewItem({...newItem, download_url: e.target.value})} 
        className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm text-gray-900 placeholder:text-gray-500"
        required 
      />
    </div>
  </div>
)}

<div className="mb-3">
  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video URL</label>
  <input 
    placeholder="https://youtube.com/watch?v=..." 
    value={youtubeUrl}
    onChange={e => setYoutubeUrl(e.target.value)}
    className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm text-gray-900 placeholder:text-gray-500"
  />
</div>

<input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={newItem.location}
                  onChange={e => setNewItem({...newItem, location: e.target.value})}
                  className="w-full bg-gray-100 border border-gray-300 rounded-xl p-3 text-sm text-gray-900"
                >
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  placeholder="e.g. iPhone 12 Pro"
                  value={newItem.title}
                  onChange={e => setNewItem({...newItem, title: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (KSh) *</label>
                <input
                  placeholder="e.g. 45000"
                  type="number"
                  value={newItem.price}
                  onChange={e => setNewItem({...newItem, price: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
                <input
                  placeholder="254712345678"
                  value={newItem.phone}
                  onChange={e => setNewItem({...newItem, phone: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="e.g. Used 6 months, good condition, comes with charger"
                  value={newItem.description}
                  onChange={e => setNewItem({...newItem, description: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm h-20 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="border border-gray-300 rounded-xl p-3 mb-3 w-full text-sm text-gray-700 flex items-center justify-center gap-2 bg-white"
              >
                <Upload className="h-4 w-4" /> {imageFile? 'Change Image' : 'Upload Image'}
              </button>
              {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-xl mb-3" />}

              <button
                onClick={handlePost}
                disabled={loading ||!newItem.category ||!newItem.title ||!newItem.price ||!newItem.phone}
                className="bg-green-500 text-white rounded-xl p-4 w-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading? 'Posting...' : 'Post to Market'}
              </button>
            </div>
          </div>
        )}
{/* DRIVER TABS */}
<div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
  <button 
    onClick={() => setActiveTab('orders')}
    style={{
      flex: 1,
      padding: '6px',
      fontSize: '12px',
      background: activeTab === 'orders' ? '#29AB87' : '#eee',
      color: activeTab === 'orders' ? '#fff' : '#000',
      border: 'none',
      borderRadius: '4px'
    }}
  >
    Orders
  </button>
  <button 
    onClick={() => setActiveTab('wallet')}
    style={{
      flex: 1,
      padding: '6px',
      fontSize: '12px',
      background: activeTab === 'wallet' ? '#29AB87' : '#eee',
      color: activeTab === 'wallet' ? '#fff' : '#000',
      border: 'none',
      borderRadius: '4px'
    }}
  >
    Wallet
  </button>
  <button 
    onClick={() => setActiveTab('profile')}
    style={{
      flex: 1,
      padding: '6px',
      fontSize: '12px',
      background: activeTab === 'profile' ? '#29AB87' : '#eee',
      color: activeTab === 'profile' ? '#fff' : '#000',
      border: 'none',
      borderRadius: '4px'
    }}
  >
    Profile
  </button>
</div>

{/* ORDERS TAB - INCOMING REQUESTS ONLY */}
{activeTab === 'orders' && (
  <div>
    <h2 style={{ color: '#29AB87', fontSize: '14px', margin: '8px 0' }}>
      Incoming Requests ({rides.length})
    </h2>
    
    {rides.length === 0 ? (
      <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', padding: '8px' }}>
        No ride requests yet
      </p>
    ) : (
      rides.map(ride => (
        <div key={ride.id} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '3px 8px',
          margin: '1px 0',
          height: '28px',
          background: '#fff',
          border: '1px solid #eee',
          borderRadius: '4px',
          fontSize: '11px'
        }}>
          <span style={{ color: '#000', fontWeight: 600 }}>
            {ride.area_name || ride.pickup_location || '?'} → {ride.destination || ride.dropoff_location || '?'} Ksh{ride.estimated_fare || ride.fare_estimate || 0}
          </span>
          
          <button
            onClick={async () => {
              await supabase.from('streetpay_rides').update({ status: 'accepted' }).eq('id', ride.id);
              setRides(rides.filter(r => r.id !== ride.id));
            }}
            style={{
              background: '#ec4899',
              color: '#fff',
              fontSize: '10px',
              padding: '2px 8px',
              border: 'none',
              borderRadius: '3px',
              height: '20px',
              cursor: 'pointer'
            }}
          >
            Accept Ride
          </button>
        </div>
      ))
    )}
  </div>
)}

{/* WALLET TAB */}
{activeTab === 'wallet' && (
  <div>
    {/* Put your existing Wallet code here */}
    <p style={{ fontSize: '12px' }}>Wallet content</p>
  </div>
)}

{/* PROFILE TAB */}
{activeTab === 'profile' && (
  <div>
    {/* Put your existing Profile code here */}
    <p style={{ fontSize: '12px' }}>Profile content</p>
  </div>
)}
      </div>
    </div>
  )
}