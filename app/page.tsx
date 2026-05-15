"use client"
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Loader2, Menu, Plus, X,ChevronRight,  Upload, Search, MapPin, ArrowLeft, Phone,MessageCircle, Calendar, Wallet, Grid3X3, Megaphone,ShoppingBag,  User, Heart, Eye, EyeOff, Trash2, ArrowDownToLine, ArrowUpFromLine, Send,Shield } from "lucide-react"
import SimilarItems from '@/app/components/SimilarItems'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}

type Product = {
  id: number
  title: string
  price: number
  phone: string
  description?: string
  image_url?: string
  images?: string[]
  category: string
  location: string
  youtube_url?: string
  created_at: string
  user_id?: string
  seller_phone?: string
  views: number
   digital_type?: string  
  download_url?: string 
  product_images?: { id: number; image_url: string; position: number }[]
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
    images?: string[];
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
    const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('streetpay_rides')
      .select('*')
      .eq('status', 'requesting')
      .gte('created_at', twoMinsAgo) // only rides from last 2 mins
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
      const createdAt = new Date(payload.new.created_at).getTime()
      const diffMinutes = (Date.now() - createdAt) / 1000 / 60
      if (diffMinutes < 2) { // only show if fresh
        setRides(currentRides => [payload.new as any, ...currentRides]);
      }
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

function ImageCarousel({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [screenWidth, setScreenWidth] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const goNext = () => {
    if (activeIndex < images.length - 1) {
      scrollToIndex(activeIndex + 1);
    }
  };

  const scrollToIndex = (index: number) => {
    scrollRef.current?.scrollTo({ left: index * screenWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateWidth = () => setScreenWidth(window.innerWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (screenWidth === 0) return;
    setActiveIndex(Math.round(e.currentTarget.scrollLeft / screenWidth));
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full">
      
      {/* Image scroll area */}
      <div 
        ref={scrollRef}
        className="overflow-x-auto snap-x snap-mandatory flex scroll-smooth"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((img, i) => (
          <img 
            key={i} 
            src={img} 
            alt={`product-${i}`}
            onClick={() => setFullscreenImage(img)}
            className="w-full h-auto object-cover max-h-[50vh] flex-shrink-0 snap-start cursor-pointer"
            style={{ width: '100vw' }}
          />
        ))}
      </div>

      {/* Next button - centered on main carousel */}
      {images.length > 1 && activeIndex < images.length - 1 && (
        <button
          onClick={goNext}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 
                     flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white 
                     text-base font-semibold px-5 py-2.5 rounded-full shadow-lg 
                     hover:bg-black/75 active:scale-95 transition-all"
        >
          Next
          <ChevronRight size={18} />
        </button>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full z-20">
          {activeIndex + 1}/{images.length}
        </div>
      )}

      {/* Fullscreen modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black z-50 flex items-center justify-center" 
          onClick={() => setFullscreenImage(null)}
        >
          <img 
            src={fullscreenImage} 
            alt="fullscreen" 
            className="max-w-full max-h-full object-contain" 
            onClick={(e) => e.stopPropagation()} 
          />
          
          {/* Top-left controls in fullscreen */}
          <div className="absolute top-5 left-5 z-50 flex gap-2">
            {images.length > 1 && activeIndex < images.length - 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }} 
                className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white 
                           text-sm font-semibold px-4 py-2 rounded-full shadow-lg 
                           hover:bg-black/75 active:scale-95 transition-all"
              >
                Next
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Close button */}
          <button 
            onClick={() => setFullscreenImage(null)} 
            className="absolute top-5 right-5 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
}


export default function StreetMarket() {
 const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
const [showChatModal, setShowChatModal] = useState(false); 
  const [showProductDetails, setShowProductDetails] = useState(false);
const [editingProduct, setEditingProduct] = useState<Product | null>(null);
const [imageFile, setImageFile] = useState(null)
const [imageUrl, setImageUrl] = useState('')
const [editTitle, setEditTitle] = useState('');
const [editDesc, setEditDesc] = useState('');
const [editFiles, setEditFiles] = useState([]);
  const [viewImage, setViewImage] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState(null)
const [showModal, setShowModal] = useState(false)
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
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  
  const [newItem, setNewItem] = useState({ 
  
    title: '', 
    price: '', 
    phone: '', 
    description: '', 
    category: '', 
    location: 'Nairobi', 
    digital_type: '',
    download_url: '', 
   image_url: '' 
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [, forceUpdate] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
const openChat = (sellerId: string, productId: string) => {
  // Close the image modal
  setViewImage(null);
  
  // Open your chat modal/page - change this to match your code
  setSelectedSellerId(sellerId);
  setSelectedProductId(productId);
  setShowChatModal(true);
};
useEffect(() => {
  const timer = setInterval(() => forceUpdate(n => n + 1), 1000)
  return () => clearInterval(timer)
}, [])
const [uploading, setUploading] = useState(false)

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  setUploading(true)
  const fileName = `${Date.now()}-${file.name}`

  const { error } = await supabase.storage.from('uploads').upload(fileName, file)
  if (error) {
    alert(error.message)
    setUploading(false)
    return
  }

  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName)
  setNewItem(prev => ({...prev, image_url: urlData.publicUrl }))
  setUploading(false)
}

function showToast(message: string) {
  const id = Date.now();
  setToasts(current => [...current, { id, message }]);
  setTimeout(() => {
    setToasts(current => current.filter(t => t.id!== id));
  }, 4000);
}

  useEffect(() => {
    
    fetchProducts()
  }, [])
useEffect(() => {
  if (editingProduct) {
setEditTitle(editingProduct.title || '');
    setEditDesc(editingProduct.description || '');
    setEditFiles([]);
  }
}, [editingProduct]);
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
// Auto-expire rides after 2 minutes
useEffect(() => {
  const interval = setInterval(() => {
    const now = Date.now()
    setRides(currentRides => 
      currentRides.filter(ride => {
        const createdAt = new Date(ride.created_at).getTime()
        const diffMinutes = (now - createdAt) / 1000 / 60
        return diffMinutes < 2 // keep only rides < 2 min old
      })
    )
  }, 5000) // check every 5 seconds

  return () => clearInterval(interval)
}, [])

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11)? match[2] : ''
}

useEffect(() => {
  filterProducts()
}, [products, activeCategory, activeLocation, searchTerm, activeTab, favorites])

useEffect(() => {
  if (wallet.phone &&!depositPhone) {
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

useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchWallet()
      }
    }
  )

  // Check current session on first load
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null)
    if (session?.user) {
      fetchWallet()
    }
  })

  return () => subscription.unsubscribe()
}, [])

const fetchWallet = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  console.log("User:", user)
  
  if (!user) return
  const { data } = await supabase
    .from('wallets')
    .select('balance, escrow_balance, phone')
    .eq('user_id', user.id)
    .single()
  if (data) setWallet(data)
}
const fetchProducts = async () => {
  setLoading(true);
  try {
    const { data, error } = await supabase
    .from('products')
    .select(`
        *,
        product_images ( id, image_url, position )
      `)
    .order('created_at', { ascending: false });

    if (error) throw error;

 const productsWithSortedImages = data.map(product => ({
  ...product, // <-- you missed this spread
  product_images: (product.product_images || []).sort(
    (a: { position: number }, b: { position: number }) => a.position - b.position
  )
}))

    console.log('Products from DB:', productsWithSortedImages); // <-- add this
    setProducts(productsWithSortedImages);

  } catch (err: any) {
    console.error('FetchProducts error:', err.message || err);
  } finally {
    setLoading(false);
  }
};

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
   .select(`*, products(title, image_url)`)
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
  setAuthError('')
  setAuthSuccess('')

  try {
    if (!awaitingOtp) {
      // STEP 1: SEND EMAIL
      const { error } = await supabase.auth.signInWithOtp({
        email: authEmail,
        options: { shouldCreateUser: true }
      })
      if (error) throw error
      setAwaitingOtp(true)
      setAuthSuccess('Check your email for the code')
    } else {
      // STEP 2: CHECK CODE  
      const { error } = await supabase.auth.verifyOtp({
        email: authEmail,
        token: otpCode,
        type: 'email'
      })
      if (error) throw error
      setShowAuthModal(false)
      setAwaitingOtp(false)
      setOtpCode('')
      setAuthEmail('')
      
    }
  } catch (e: any) {
    setAuthError(e.message)
  } finally {
    setLoading(false)
  }
}

const closeAuthModal = () => {
  setShowAuthModal(false)
  setAwaitingOtp(false)
  setOtpCode('')
  setAuthEmail('')
  setAuthError('')
  setAuthSuccess('')
}

const handleSendMoney = async () => {
  if (!user) {
    setShowAuthModal(true)
    return
  }

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

  if (error ||!receiver) {
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
  if (!user) {
    setShowAuthModal(true)
    return
  }

  if (!sendAmount ||!selectedProduct) return
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

// DELETED THE FLOATING if (!user) BLOCK THAT CAUSED INFINITE LOOP

const toggleFavorite = async (productId: number, e: React.MouseEvent) => {
  e.stopPropagation()
  if (!user) {
    setShowAuthModal(true)
    return
  }

  if (favorites.includes(productId)) {
    await supabase.from('favorites').delete()
     .eq('user_id', user.id)
     .eq('product_id', productId)
    setFavorites(favorites.filter(id => id!== productId))
  } else {
    await supabase.from('favorites').insert({
      user_id: user.id,
      product_id: productId
    })
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
  const files = Array.from(e.target.files || [])
  
  // No limits at all
  setImageFiles(prev => [...prev,...files])
  const newPreviews = files.map(file => URL.createObjectURL(file))
  setImagePreviews(prev => [...prev,...newPreviews])
}

const removeImage = (index: number) => {
  URL.revokeObjectURL(imagePreviews[index])
  setImageFiles(prev => prev.filter((_, i) => i!== index))
  setImagePreviews(prev => prev.filter((_, i) => i!== index))
}

const uploadImages = async (): Promise<string[]> => {
  const urls: string[] = []
  for (const file of imageFiles) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
    const { data, error } = await supabase.storage.from('uploads').upload(fileName, file)
    if (error) {
      console.error('Upload error:', error)
      continue
    }
    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(data.path)
    urls.push(publicUrl)
  }
  return urls
}

const handlePost = async () => {
  console.log('imageFiles:', imageFiles);

  if (!user) {
    setShowAuthModal(true);
    return;
  }

  if (!newItem.title.trim()) {
    alert('Enter a title');
    return;
  }

  setLoading(true);

  try {
    // 1. Insert product first to get ID
    const { data: product, error: productError } = await supabase
     .from('products')
     .insert({
        title: newItem.title,
        price: parseInt(newItem.price) || 0,
        phone: newItem.phone,
        description: newItem.description,
        category: newItem.category,
        location: newItem.location || 'Nairobi',
        youtube_url: youtubeUrl,
        user_id: user.id
      })
     .select()
     .single();

    if (productError) throw productError;

    const productId = product.id;
    const imageUrls = [];

    // 2. Upload all images
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${i}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
       .from('uploads')
       .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage
       .from('uploads')
       .getPublicUrl(fileName);

      imageUrls.push(urlData.publicUrl);
    }

    // 3. Insert all image URLs into product_images
    if (imageUrls.length > 0) {
      const inserts = imageUrls.map((url, i) => ({
        product_id: productId,
        image_url: url,
        position: i
      }));

      const { error: imagesError } = await supabase
       .from('product_images')
       .insert(inserts);

      if (imagesError) throw imagesError;
    }

    alert('Posted!');
    // Reset form, refetch...
    setImageFiles([]);
    setImagePreviews([]);
    setYoutubeUrl('');
    setNewItem({ title: '', price: '', phone: '', description: '', category: '', location: 'Nairobi', digital_type: '', download_url: '', image_url: '' });
    setShowPostModal(false);
    fetchProducts();

  } catch (err: any) {
    console.error(err);
    alert('Post failed: ' + err.message);
  } finally {
    setLoading(false);
  }
};
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
        className="w-full bg-white border-gray-300 rounded-xl p-3 text-sm text-gray-900 mb-3" 
      />
      
      <input 
        type="text" 
        placeholder="M-Pesa Phone 254..." 
        value={depositPhone} 
        onChange={e => setDepositPhone(e.target.value)} 
        className="w-full bg-white border-gray-300 rounded-xl p-3 text-sm text-gray-900 mb-4" 
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
              'Accept': 'application/json',
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
          {selectedProduct? 'Buy with Escrow' : 'Send Money'}
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
      <input type="tel" placeholder="Recipient Phone (0712345678)" value={sendPhone} onChange={(e) => setSendPhone(e.target.value)} className="w-full bg-white border-gray-300 rounded-xl p-3 text-sm text-gray-900 mb-4" />
      <input type="number" placeholder="Amount (KSh)" value={sendAmount} onChange={e => setSendAmount(e.target.value)} className="w-full bg-white border-gray-300 rounded-xl p-3 text-sm text-gray-900 mb-4" />
      <button onClick={handleSend} disabled={!sendAmount || parseInt(sendAmount) > wallet.balance} style={{ width: '100%', backgroundColor: 'white', color: 'black', border: '2px solid #000', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px', opacity: (!sendAmount || parseInt(sendAmount) > wallet.balance)? '0.6' : '1', cursor: (!sendAmount || parseInt(sendAmount) > wallet.balance)? 'not-allowed' : 'pointer' }}>
        <Send style={{height: '20px', width: '20px', color: '#000'}} />
        <span>{selectedProduct? 'Buy with Escrow' : 'Send Money'}</span>
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
    <div key={product.id} onClick={() => {
      setSelectedProduct(product);
      incrementViews(product.id);
    }} className={`rounded-2xl p-4 flex-col justify-between min-h-[180px] text-left relative cursor-pointer ${CARD_COLORS[index % 6]}`}>
      <div onClick={(e) => toggleFavorite(product.id, e)} className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full z-10">
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
        <button onClick={(e) => {
          e.stopPropagation();
          setViewImage(product.images?.[0] || product.image_url || '/placeholder.png');
        }} className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg font-medium cursor-pointer hover:bg-black active:scale-95">
          View
        </button>
        {product.images?.[0]? (
          <img src={product.images[0]} alt={product.title} className="w-12 h-12 object-cover rounded-lg" />
        ) : product.image_url? (
       <img 
  src={product.product_images?.[0]?.image_url} 
  alt={product.title}
  className="w-full h-48 object-cover rounded-lg"
/>
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xl">
            {CATEGORIES.find(c => c.value === product.category)?.emoji || '📦'}
          </div>
        )}
      </div>
    </div>
  ))}
</div>

{/* PRODUCT DETAIL MODAL WITH CAROUSEL */}
{selectedProduct && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

      <ImageCarousel
        images={selectedProduct.product_images?.map(img => img.image_url) || []}
      />

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-gray-900">{selectedProduct.title}</h2>
          <X onClick={() => setSelectedProduct(null)} className="cursor-pointer text-gray-500" />
        </div>
        <p className="text-2xl font-bold text-green-600">KSh {selectedProduct.price.toLocaleString()}</p>
        <p className="text-sm text-gray-600 mt-1 flex items-center">
          <MapPin className="h-4 w-4 mr-1" />{selectedProduct.location}
        </p>
        <p className="mt-3 text-gray-700">{selectedProduct.description}</p>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setShowSendModal(true);
          }}
          className="mt-4 w-full bg-black text-white py-3 rounded-xl font-semibold"
        >
          Buy with Escrow
        </button>
      </div>
    </div>
  </div>
)}

{/* IMAGE FULLSCREEN MODAL */}
{viewImage && selectedProduct && (
  <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
    
    {/* 1. The image */}
    <img
      src={viewImage}
      className="max-w-full max-h-full object-contain"
      onClick={() => setViewImage(null)}
      alt=""
    />

    {/* 2. Close button */}
    <X
      className="absolute top-4 right-4 text-white cursor-pointer bg-black/50 rounded-full p-2"
      onClick={() => setViewImage(null)}
    />

    {/* 3. Bottom action bar */}
    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">

      {/* Chat button */}
      <button
        onClick={() => {
          setViewImage(null);
         openChat(selectedProduct.user_id ?? '', String(selectedProduct.id))
        }}
        className="bg-green-600 text-white px-5 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg"
      >
        💬 Chat Seller
      </button>

      {/* Details button */}
      <button
        onClick={() => setShowProductDetails(true)}
        className="bg-white text-black px-5 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg"
      >
        ℹ️ Details
      </button>
    </div>

    {/* 4. Product details popup */}
    {showProductDetails && (
      <div
        className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl p-4 shadow-2xl max-h- overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-900">{selectedProduct.title}</h3>
          <X
            className="cursor-pointer text-gray-500"
            onClick={() => setShowProductDetails(false)}
          />
        </div>

        <p className="text-2xl font-bold text-green-600 mb-2">
          KSh {selectedProduct.price?.toLocaleString()}
        </p>

        <p className="text-sm text-gray-600 flex items-center mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          {selectedProduct.location}
        </p>

        {/* Description */}
        <div className="border-t pt-3">
          <p className="text-sm font-semibold text-gray-900 mb-1">Description</p>
          <p className="text-sm text-gray-700">{selectedProduct.description}</p>
        </div>

        {/* YouTube Link - only shows if it exists */}
        {selectedProduct.youtube_url && (
          <div className="border-t mt-3 pt-3">
            <p className="text-sm font-semibold text-gray-900 mb-2">Video</p>
            <a
              href={selectedProduct.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-red-600 font-medium text-sm"
            >
              ▶️ Watch on YouTube
            </a>
          </div>
        )}

        {/* Download Link - only shows if it exists */}
        {selectedProduct.download_url && (
          <div className="border-t mt-3 pt-3">
            <p className="text-sm font-semibold text-gray-900 mb-2">Download</p>
            <a
              href={selectedProduct.download_url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium w-fit"
            >
              ⬇️ Download File
            </a>
          </div>
        )}

        {/* Seller Info */}
  
      </div>
    )}
  </div>
)}

</>
) : activeTab === 'orders'? (
<div className="p-4 space-y-4">
  <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
  {orders.length === 0? (
    <p className="text-gray-500">No orders yet</p>
  ) : (
    orders.map((order) => (
      <div key={order.id} className="border rounded-lg p-4 space-y-2">
        <div className="flex gap-3">
          {order.products?.images?.[0]? (
            <img src={order.products.images[0]} alt={order.products.title} className="w-16 h-16 object-cover rounded-lg" />
          ) : order.products?.image_url? (
            <img src={order.products.image_url} alt={order.products.title} className="w-16 h-16 object-cover rounded-lg" />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">📦</div>
          )}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <span className="font-semibold text-sm line-clamp-1">
                {order.products?.title || 'Unknown Product'}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                order.status === 'pending'? 'bg-yellow-100 text-yellow-800' :
                order.status === 'completed'? 'bg-green-100 text-green-800' :
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
          {user?.id === order.buyer_id? 'You are the Buyer' : 'You are the Seller'}
        </p>
        {order.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            {user?.id === order.buyer_id && (
              <button onClick={() => handleRelease(order.id)} className="bg-green-600 text-white px-4 py-2 rounded flex-1">
                Release Payment
              </button>
            )}
            {user?.id === order.seller_id && (
              <button onClick={() => handleRefund(order.id)} className="bg-red-600 text-white px-4 py-2 rounded flex-1">
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
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {awaitingOtp ? 'Enter Code' : 'Sign in'}
        </h2>
        <button onClick={closeAuthModal} className="p-1">
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {authError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
          {authError}
        </div>
      )}

      {authSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-4 text-sm">
          {authSuccess}
        </div>
      )}

      {!awaitingOtp ? (
        <input
          type="email"
          placeholder="you@example.com"
          value={authEmail}
          onChange={(e) => setAuthEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={loading}
          onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
          autoFocus
        />
      ) : (
        <>
          <p className="text-gray-600 text-sm mb-4">
            Code sent to <span className="font-medium">{authEmail}</span>
          </p>
          <input
            type="text"
            placeholder="000000"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-2 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={loading}
            maxLength={6}
            onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
            autoFocus
          />
          <button
            onClick={() => {
              setAwaitingOtp(false)
              setOtpCode('')
              setAuthError('')
              setAuthSuccess('')
            }}
            className="text-sm text-green-600 mb-4 hover:underline"
            disabled={loading}
          >
            Use different email
          </button>
        </>
      )}

      <button
        onClick={handleEmailAuth}
        disabled={loading}
        className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {awaitingOtp ? 'Verifying...' : 'Sending...'}
          </>
        ) : (
          awaitingOtp ? 'Verify Code' : 'Continue'
        )}
      </button>
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

<input
  type="file"
  ref={fileInputRef}
  onChange={handleImageChange}
  accept="image/*"
  multiple
  className="hidden"
  id="imageUpload"
  name="images"
/>

{imagePreviews.length > 0 && (
  <div className="grid grid-cols-3 gap-2 mt-2 mb-3">
    {imagePreviews.map((preview, index) => (
      <div key={index} className="relative">
        <img
          src={preview}
          alt={`Preview ${index + 1}`}
          className="w-full h-24 object-cover rounded"
        />
        
        <button
          type="button"
          onClick={() => setViewImage(preview)}
          className="absolute bottom-1 left-1 bg-black/60 text-white px-2 py-0.5 text-xs rounded z-10"
        >
          View
        </button>

        <button
          type="button"
          onClick={() => removeImage(index)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
        >
          ×
        </button>
      </div>
    ))}
  </div>
)}
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
<div className="mb-3">
  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
  <input 
    type="file" 
    accept="image/*" 
    onChange={handleImageUpload}
    className="w-full bg-white border-gray-300 rounded-xl p-3 text-sm text-gray-900"
  />
  {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
  {newItem.image_url && (
    <img src={newItem.image_url} alt="Preview" className="mt-2 w-full h-40 object-cover rounded-lg" />
  )}
</div>
              

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

{/* MAIN CONTENT AREA */}
<div className="px-4 mt-4 pb-24">  {/* pb-24 = space for bubbles */}
  
{/* ONLY SHOW IN ORDERS TAB */}
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
        <div key={ride.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 8px', margin: '1px 0', height: '28px', background: '#fff', border: '1px solid #eee', borderRadius: '4px', fontSize: '11px' }}>
          <span style={{ color: '#000', fontWeight: 600 }}>
            {ride.area_name || ride.pickup_location || '?'} → {ride.destination || ride.dropoff_location || '?'} Ksh{ride.estimated_fare || ride.fare_estimate || 0}
          </span>
          <button onClick={async () => {
            await supabase.from('streetpay_rides').update({ status: 'accepted' }).eq('id', ride.id);
            setRides(rides.filter(r => r.id !== ride.id));
          }} style={{ background: '#33f702', color: '#000', fontSize: '10px', padding: '2px 8px', border: 'none', borderRadius: '3px', height: '20px', cursor: 'pointer' }}>
            Accept Ride
          </button>
        </div>
      ))
    )}
  </div>
)}

</div> {/* This closes the main content div - fixes your error */}

{/* BOTTOM BUBBLE NAV */}
<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
  <div className="flex gap-3 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-2xl border border-gray-100">
    
    <button
      onClick={() => setActiveTab('wallet')}
      className={`p-3 rounded-full transition-all ${
        activeTab === 'wallet' 
          ? 'bg-green-500 text-white' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Wallet className="w-5 h-5" />
    </button>

    <button
      onClick={() => setActiveTab('orders')}
      className={`p-3 rounded-full transition-all ${
        activeTab === 'orders' 
          ? 'bg-green-500 text-white' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <ShoppingBag className="w-5 h-5" />
    </button>

    <button
      onClick={() => setShowPostModal(true)}
      className="p-3 rounded-full bg-gray-900 text-white hover:bg-black transition-all"
    >
      <Plus className="w-5 h-5" />
    </button>

    <button
      onClick={() => setActiveTab('profile')}
      className={`p-3 rounded-full transition-all ${
        activeTab === 'profile' 
          ? 'bg-green-500 text-white' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <User className="w-5 h-5" />
    </button>

  </div>
</div>
{/* Floating Menu Button */}
<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
  <button onClick={() => setDrawerOpen(true)} className="bg-gray-900 text-white p-4 rounded-full shadow-lg">
    <Menu className="w-6 h-6" />
  </button>
</div>
      </div>
            {viewImage && (
      <div
        onClick={() => setViewImage(null)}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      >
        <div onClick={(e) => e.stopPropagation()} className="relative">
          <img
            src={viewImage!}
            alt="Full view"
            className="max-w-full max-h-screen object-contain rounded"
          />
          <button
            onClick={() => setViewImage(null)}
            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      </div>
    )}
{/* PRODUCT DETAIL MODAL - FULL SCREEN */}
{selectedProduct && (
  <div className="fixed inset-0 bg-white z-[100] overflow-y-auto">
    {/* Top bar */}
    <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b z-10">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => setSelectedProduct(null)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={24} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(selectedProduct.id, e)
          }}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Heart className={`h-6 w-6 ${favorites.includes(selectedProduct.id)? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
        </button>
      </div>
    </div>

{/* Image */}
{selectedProduct.image_url? (
  <div className="w-full bg-gray-100">
    <img src={selectedProduct.image_url} alt={selectedProduct.title} className="w-full h-auto object-cover max-h-[50vh]" />
  </div>
) : (
  <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-6xl">📦</div>
)}
    {/* Content */}
    <div className="max-w-2xl mx-auto p-6 pb-32 space-y-6">
      <div>
        <h1 className="font-bold text-3xl text-gray-900 leading-tight">{selectedProduct.title}</h1>
        <p className="text-3xl font-bold text-green-600 mt-3">KSh {selectedProduct.price.toLocaleString()}</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-base text-gray-600">
        {selectedProduct.location && (
          <span className="flex items-center">
            <MapPin className="h-5 w-5 mr-1.5" />
            {selectedProduct.location}
          </span>
        )}
        <span className="flex items-center">
          <Eye className="h-5 w-5 mr-1.5" />
          {selectedProduct.views} views
        </span>
        <span className="flex items-center">
          <Calendar className="h-5 w-5 mr-1.5" />
          Posted 2 days ago
        </span>
      </div>

      {selectedProduct.description && selectedProduct.description.length > 3 && (
        <div className="pt-4 border-t">
          <h2 className="font-bold text-xl text-gray-900 mb-3">Description</h2>
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{selectedProduct.description}</p>
        </div>
      )}

      {/* Seller section - add later when you have seller data */}
      <div className="pt-4 border-t">
        <h2 className="font-bold text-xl text-gray-900 mb-3">Seller Information</h2>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl">
            👤
          </div>
          <div>
            <p className="font-semibold text-gray-900">Verified Seller</p>
            <p className="text-sm text-gray-500">Usually responds within 1 hour</p>
          </div>
        </div>
      </div>
    </div>

    {/* Fixed bottom CTA */}
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-inset-bottom">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => alert('Contact seller feature coming soon')}
          className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#20BA5A] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
        >
          <MessageCircle size={24} />
          WhatsApp Seller
        </button>
      </div>
    </div>
  </div>
)} 
 {selectedProduct && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
      <h3>{selectedProduct.title}</h3>
      
      <button 
        onClick={() => setEditingProduct(selectedProduct)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg mr-2"
      >
        Edit
      </button>
      
      <button onClick={() => setSelectedProduct(null)}>Close</button>
    </div>
  </div>
)}
{/* Pure Bubble Nav - Clustered */}
<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
  <div className="flex gap-3 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-2xl border border-gray-100">
    
    <button
      onClick={() => setActiveTab('wallet')}
      className={`p-3 rounded-full transition-all ${
        activeTab === 'wallet' 
          ? 'bg-green-500 text-white' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Wallet className="w-5 h-5" />
    </button>

    <button
      onClick={() => setActiveTab('orders')}
      className={`p-3 rounded-full transition-all ${
        activeTab === 'orders' 
          ? 'bg-green-500 text-white' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <ShoppingBag className="w-5 h-5" />
    </button>

    <button
      onClick={() => setShowPostModal(true)}
      className="p-3 rounded-full bg-gray-900 text-white hover:bg-black transition-all"
    >
      <Plus className="w-5 h-5" />
    </button>

    <button
      onClick={() => setActiveTab('profile')}
      className={`p-3 rounded-full transition-all ${
        activeTab === 'profile' 
          ? 'bg-green-500 text-white' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <User className="w-5 h-5" />
    </button>

  </div>
</div>


    </div>
    
  )

}