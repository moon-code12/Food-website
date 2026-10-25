import { useEffect, useState } from 'react'
import { isSupabaseConfigured, mapDatabaseOrder, supabase, useLocalDemo } from './lib/supabase.js'
import './App.css'

const categories = ['All', 'Rice', 'Swallow', 'Snacks', 'Drinks', 'Fast Food']
const orderStatuses = [
  'Order received',
  'Confirmed',
  'Preparing',
  'Out for delivery',
  'Delivered',
]
const paymentMethods = ['Bank transfer', 'Payment on delivery']
const paymentStatuses = ['Awaiting verification', 'Due on delivery', 'Paid']
const savedOrdersKey = 'zeetummylab.orders'
const savedMenuKey = 'zeetummylab.menu'
const legacySavedOrderKey = 'zeetummylab.active-order'
const latestOrderSessionKey = 'zeetummylab.latest-order'
const adminEmail = 'sultanabdulwaheed382@gmail.com'
const paymentAccount = {
  method: 'Bank transfer',
  bank: 'OPay',
  accountNumber: '8055628954',
  accountName: 'Sultan Abdulwaheed',
}

const menuItems = [
  {
    id: 'party-jollof',
    name: 'Smoky Party Jollof',
    detail: 'Smoky tomato-pepper rice, grilled chicken and sweet plantain',
    category: 'Rice',
    price: 8500,
    tag: 'BESTSELLER',
    available: true,
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Nigerian_jollof.jpg?width=900',
    alt: 'Nigerian jollof rice',
  },
  {
    id: 'small-chops',
    name: 'Small Chops Box',
    detail: 'Puff-puff, samosas, spring rolls and spicy chicken kebab',
    category: 'Snacks',
    price: 12000,
    tag: 'PARTY FAVE',
    available: true,
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/SmallChops.jpg?width=900',
    alt: 'Nigerian small chops with puff-puff, samosas and spring rolls',
  },
  {
    id: 'asun',
    name: 'Barbecue Asun',
    detail: 'Smoky, spicy grilled goat with onions and peppers',
    category: 'Fast Food',
    price: 15500,
    tag: 'NICE & SPICY',
    available: true,
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Goat_meat_Asun.jpg?width=900',
    alt: 'Nigerian asun goat meat in pepper mix',
  },
  {
    id: 'doughnut-bites',
    name: 'Zee Doughnut Bites',
    detail: 'Soft, fluffy, sugar-dusted Nigerian-style doughnuts',
    category: 'Snacks',
    price: 5000,
    tag: 'SWEET TREAT',
    available: true,
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Nigerian-puff-puff-recipe_cropped.jpg?width=900',
    alt: 'Nigerian puff-puff, a soft fried dough snack',
  },
  {
    id: 'fried-rice',
    name: 'Naija Fried Rice',
    detail: 'Colorful veg-packed fried rice with golden fried chicken',
    category: 'Rice',
    price: 8000,
    tag: 'LUNCH FAVE',
    available: true,
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/A_plate_of_rice_with_beef.jpg?width=900',
    alt: 'Nigerian fried rice served with spiced beef',
  },
  {
    id: 'ofada-rice',
    name: 'Ofada & Ayamase',
    detail: 'Local ofada rice with rich, spicy green pepper sauce',
    category: 'Rice',
    price: 11000,
    tag: 'LOCAL LOVE',
    available: false,
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Nigeria_ofada.jpg?width=900',
    alt: 'Nigerian ofada rice and stew',
  },
  {
    id: 'egusi-pounded-yam',
    name: 'Egusi & Pounded Yam',
    detail: 'Melon-seed soup with assorted meat and smooth pounded yam',
    category: 'Swallow',
    price: 12500,
    tag: 'SOUL FOOD',
    available: true,
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/EGUSI_SOUP.JPG?width=900',
    alt: 'Nigerian egusi soup',
  },
  {
    id: 'efo-eba',
    name: 'Efo Riro & Eba',
    detail: 'Spinach and pepper stew with assorted meat and soft eba',
    category: 'Swallow',
    price: 11500,       
    tag: 'HOME STYLE',
    available: true,
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Efo_riro.jpg?width=900',
    alt: 'Nigerian efo riro',
  },
  {
    id: 'puff-puff',
    name: 'Fresh Puff-Puff',
    detail: 'A warm dozen of soft, golden Nigerian puff-puff',
    category: 'Snacks',
    price: 3500,
    tag: 'MADE FRESH',
    available: true,
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Nigerian-puff-puff-recipe_cropped.jpg?width=900',
    alt: 'Golden Nigerian puff-puff',
  },
  {
    id: 'zobo',
    name: 'Chilled Zobo',
    detail: 'Hibiscus drink brewed with ginger, pineapple and a little spice',
    category: 'Drinks',
    price: 2500,
    tag: 'ICE COLD',
    available: true,
    image:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Zobo_drink.jpg/960px-Zobo_drink.jpg',
    alt: 'A glass of chilled zobo drink made from roselle flowers',
  },
  {
    id: 'yoghurt',
    name: 'Chilled Yoghurt',
    detail: 'A smooth, creamy yoghurt drink served cold',
    category: 'Drinks',
    price: 2500,
    tag: 'CHILLED',
    available: true,
    image:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Yogurt_drink.jpg/960px-Yogurt_drink.jpg',
    alt: 'A chilled yoghurt drink served in a calabash',
  },
  {
    id: 'chapman',
    name: 'Classic Chapman',
    detail: 'Our fizzy Nigerian party classic with citrus and bitters',
    category: 'Drinks',
    price: 3000,
    tag: 'PARTY CLASSIC',
    available: true,
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Chapman_drink.jpg?width=900',
    alt: 'Chapman, a Nigerian non-alcoholic cocktail',
  },
  {
    id: 'suya-wrap',
    name: 'Chicken Suya Wrap',
    detail: 'Suya-spiced grilled chicken, crunchy veg and yaji mayo',
    category: 'Fast Food',
    price: 7500,
    tag: 'STREET FOOD',
    available: true,
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Suya_with_pepper_sauce.jpg?width=900',
    alt: 'Nigerian suya with pepper sauce and onions',
  },
  {
    id: 'asun-fries',
    name: 'Asun Loaded Fries',
    detail: 'Crispy fries topped with spicy asun, peppers and onions',
    category: 'Fast Food',
    price: 9500,
    tag: 'NICE & SPICY',
    available: true,
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Goat_meat_Asun.jpg?width=900',
    alt: 'Nigerian asun goat meat in pepper mix',
  },
]
const defaultMenuImage = menuItems[0].image

const formatPrice = (price) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price)

function loadSavedMenu() {
  try {
    const savedMenu = window.localStorage.getItem(savedMenuKey)
    if (!savedMenu) return { items: menuItems, error: '' }
    const parsedMenu = JSON.parse(savedMenu)
    const isValidMenu = Array.isArray(parsedMenu) && parsedMenu.every((item) =>
      item &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.detail === 'string' &&
      categories.includes(item.category) &&
      Number.isFinite(item.price) &&
      typeof item.available === 'boolean' &&
      typeof item.image === 'string',
    )
    const defaultItemsById = new Map(menuItems.map((item) => [item.id, item]))
    const items = isValidMenu
      ? parsedMenu.map((item) => {
          const defaultItem = defaultItemsById.get(item.id)
          const hasOldZoboPhoto = item.id === 'zobo' && item.image.includes('Zobo_(local_drink_in_northern_Nigeria).jpg')
          return (item.image.includes('images.unsplash.com') || hasOldZoboPhoto) && defaultItem
            ? { ...item, image: defaultItem.image, alt: defaultItem.alt }
            : item
        })
      : menuItems
    if (isValidMenu && !items.some((item) => item.id === 'yoghurt')) {
      items.push(defaultItemsById.get('yoghurt'))
    }
    return isValidMenu
      ? { items, error: '' }
      : { items: menuItems, error: 'Saved menu data is invalid. The starter menu is shown instead.' }
  } catch (error) {
    return {
      items: menuItems,
      error:
        error instanceof Error
          ? `Unable to load the saved menu: ${error.message}`
          : 'Unable to load the saved menu.',
    }
  }
}

function loadSavedOrders() {
  try {
    const savedOrders = window.localStorage.getItem(savedOrdersKey)
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders)
      const isValidOrders = Array.isArray(parsedOrders) && parsedOrders.every((order) =>
        order &&
        typeof order.id === 'string' &&
        typeof order.name === 'string' &&
        orderStatuses.includes(order.status) &&
        Array.isArray(order.items),
      )
      return isValidOrders
        ? { orders: parsedOrders, error: '' }
        : { orders: [], error: 'Saved orders are invalid and could not be loaded.' }
    }

    const legacyOrder = window.localStorage.getItem(legacySavedOrderKey)
    if (!legacyOrder) return { orders: [], error: '' }
    const parsedOrder = JSON.parse(legacyOrder)
    if (
      !parsedOrder ||
      typeof parsedOrder.id !== 'string' ||
      !orderStatuses.includes(parsedOrder.status) ||
      !Array.isArray(parsedOrder.items) ||
      typeof parsedOrder.name !== 'string'
    ) {
      return { orders: [], error: 'The saved tracking order is incomplete.' }
    }
    return { orders: [parsedOrder], error: '' }
  } catch (error) {
    return {
      orders: [],
      error:
        error instanceof Error
          ? `Unable to load saved orders: ${error.message}`
          : 'Unable to load saved orders.',
    }
  }
}

function loadLatestOrderFromSession() {
  try {
    const savedOrder = window.sessionStorage.getItem(latestOrderSessionKey)
    return savedOrder ? JSON.parse(savedOrder) : null
  } catch {
    return null
  }
}

function createOrderId() {
  return `ZEE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

const reviews = [
  {
    quote: 'That jollof and plantain combo is the real deal. I’m already planning my next order.',
    name: 'Maya R.',
    detail: 'Regular since 2022',
    initials: 'MR',
  },
  {
    quote: 'Finally, food that feels like someone actually cares about making it. Five stars, every time.',
    name: 'Jordan T.',
    detail: 'Local food lover',
    initials: 'JT',
  },
  {
    quote: 'Ordered for the whole office. Everyone asked where it came from. That tells you everything.',
    name: 'Sam K.',
    detail: 'Verified customer',
    initials: 'SK',
  },
]

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4.167 10h11.666M10 4.167 15.833 10 10 15.833" />
    </svg>
  )
}

function Brand({ footer = false }) {
  return (
    <a className={`brand${footer ? ' brand-footer' : ''}`} href="#home" aria-label="ZeeTummyLab home">
      <span className="brand-mark" aria-hidden="true">
        z<span>.</span>
      </span>
      <span className="brand-name">ZeeTummy<span>Lab</span></span>
    </a>
  )
}

function App() {
  const [savedMenu] = useState(loadSavedMenu)
  const [savedOrders] = useState(loadSavedOrders)
  const [page, setPage] = useState(() => {
    const route = window.location.hash.slice(1)
    return ['about', 'admin', 'cart', 'checkout', 'contact', 'order-confirmation', 'tracking'].includes(route)
      ? route
      : 'home'
  })
  const [activeCategory, setActiveCategory] = useState('All')
  const [menuItems, setMenuItems] = useState(useLocalDemo ? savedMenu.items : [])
  const [orders, setOrders] = useState(useLocalDemo ? savedOrders.orders : [])
  const [adminSession, setAdminSession] = useState(null)
  const [adminAuthLoading, setAdminAuthLoading] = useState(isSupabaseConfigured)
  const [menuLoadMessage, setMenuLoadMessage] = useState('')
  const [orderSubmitMessage, setOrderSubmitMessage] = useState('')
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [maxPrice, setMaxPrice] = useState(20000)
  const [cart, setCart] = useState({})
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0])
  const [cartMessage, setCartMessage] = useState('')
  const [checkoutDetails, setCheckoutDetails] = useState(useLocalDemo ? savedOrders.orders[0] ?? null : loadLatestOrderFromSession)
  const [activeOrder, setActiveOrder] = useState(useLocalDemo ? savedOrders.orders[0] ?? null : loadLatestOrderFromSession)
  const [trackingError, setTrackingError] = useState(useLocalDemo ? savedOrders.error : '')
  const [adminMessage, setAdminMessage] = useState(savedMenu.error || savedOrders.error)
  const [adminAuthMode, setAdminAuthMode] = useState('sign-in')
  const [editingItem, setEditingItem] = useState(null)
  const [adminForm, setAdminForm] = useState({
    name: '',
    detail: '',
    category: 'Rice',
    price: '',
    tag: '',
    image: '',
    alt: '',
    available: true,
  })
  const isStoreAdmin = adminSession?.user?.email?.toLowerCase() === 'sultanabdulwaheed382@gmail.com'

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      activeCategory === 'All' || item.category === activeCategory
    const searchText = `${item.name} ${item.detail} ${item.category}`.toLowerCase()
    return (
      matchesCategory &&
      searchText.includes(searchQuery.trim().toLowerCase()) &&
      item.price <= maxPrice
    )
  })
  const cartItems = menuItems.filter((item) => cart[item.id])
  const cartCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0)
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * cart[item.id],
    0,
  )
  const deliveryFee = cartCount > 0 && cartTotal < 30000 ? 1500 : 0
  const deliveryFeeLabel = deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)
  const totalSales = orders.reduce((total, order) => total + (Number(order.total) || 0), 0)
  const deliveredOrders = orders.filter((order) => order.status === 'Delivered').length

  useEffect(() => {
    const syncPageWithHash = () => {
      const route = window.location.hash.slice(1)
      setPage(['about', 'admin', 'cart', 'checkout', 'contact', 'order-confirmation', 'tracking'].includes(route) ? route : 'home')
    }
    window.addEventListener('popstate', syncPageWithHash)
    window.addEventListener('hashchange', syncPageWithHash)
    return () => {
      window.removeEventListener('popstate', syncPageWithHash)
      window.removeEventListener('hashchange', syncPageWithHash)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return undefined
    let isMounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return
      if (error) setAdminMessage(`Unable to check admin session: ${error.message}`)
      setAdminSession(data?.session ?? null)
      setAdminAuthLoading(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminSession(session)
      setAdminAuthLoading(false)
    })

    supabase.from('menu_items').select('*').order('name').then(({ data, error }) => {
      if (!isMounted) return
      if (error) {
        setMenuLoadMessage(`The menu could not be loaded: ${error.message}`)
        return
      }
      setMenuItems(data ?? [])
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !isStoreAdmin) return undefined
    let isMounted = true

    const loadOrders = async () => {
      const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
      if (!isMounted) return
      if (error) {
        setAdminMessage(`Unable to load orders. Check the admin account and database policies: ${error.message}`)
        return
      }
      setOrders((data ?? []).map(mapDatabaseOrder))
    }
    loadOrders()
    const timer = window.setInterval(loadOrders, 30000)

    return () => {
      isMounted = false
      window.clearInterval(timer)
    }
  }, [isStoreAdmin])

  useEffect(() => {
    if (!supabase || page !== 'tracking' || !activeOrder?.id || !activeOrder?.phone) return undefined
    const refreshOrder = async () => {
      const { data, error } = await supabase.rpc('track_order', {
        p_order_number: activeOrder.id,
        p_customer_phone: activeOrder.phone,
      })
      if (!error && data) setActiveOrder(data)
    }
    const timer = window.setInterval(refreshOrder, 30000)
    return () => window.clearInterval(timer)
  }, [page, activeOrder?.id, activeOrder?.phone])

  async function lookupTrackingOrder(event) {
    event.preventDefault()
    if (!supabase) return
    const formData = new FormData(event.currentTarget)
    setTrackingError('')
    const { data, error } = await supabase.rpc('track_order', {
      p_order_number: String(formData.get('orderNumber')).trim(),
      p_customer_phone: String(formData.get('phone')).trim(),
    })
    if (error) {
      setTrackingError(`Unable to look up this order: ${error.message}`)
      return
    }
    if (!data) {
      setTrackingError('We couldn’t find an order with that number and phone number.')
      return
    }
    setActiveOrder(data)
  }

  function navigateTo(nextPage) {
    const nextHash = nextPage === 'home' ? '' : `#${nextPage}`
    window.history.pushState({ page: nextPage }, '', `${window.location.pathname}${nextHash}`)
    setPage(nextPage)
    setCartOpen(false)
    setMobileMenuOpen(false)
    window.scrollTo(0, 0)
  }

  function navigateToHomeSection(sectionId) {
    setMobileMenuOpen(false)
    if (page !== 'home') {
      navigateTo('home')
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
      }, 0)
      return
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  async function persistMenu(nextMenu) {
    if (supabase) {
      const { error } = await supabase.from('menu_items').upsert(nextMenu, { onConflict: 'id' })
      if (error) {
        setAdminMessage(`Unable to save menu changes: ${error.message}`)
        return false
      }
      setMenuItems(nextMenu)
      setAdminMessage('Menu changes saved to the shared database.')
      return true
    }

    try {
      window.localStorage.setItem(savedMenuKey, JSON.stringify(nextMenu))
      setMenuItems(nextMenu)
      setAdminMessage('Menu changes saved in this browser.')
      return true
    } catch (error) {
      setAdminMessage(
        error instanceof Error
          ? `Unable to save menu changes: ${error.message}`
          : 'Unable to save menu changes.',
      )
      return false
    }
  }

  async function handleSaveMenuItem(event) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const formData = new FormData(form)
    const name = String(formData.get('name')).trim()
    const image = String(formData.get('image')).trim()
    const item = {
      id: editingItem?.id ?? `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${createOrderId().slice(-5).toLowerCase()}`,
      name,
      detail: String(formData.get('detail')).trim(),
      category: String(formData.get('category')),
      price: Number(formData.get('price')),
      tag: String(formData.get('tag')).trim() || 'MADE FRESH',
      available: formData.get('available') === 'on',
      image: image || defaultMenuImage,
      alt: String(formData.get('alt')).trim() || name,
    }
    const nextMenu = editingItem
      ? menuItems.map((menuItem) => menuItem.id === editingItem.id ? item : menuItem)
      : [item, ...menuItems]
    if (!(await persistMenu(nextMenu))) return
    setEditingItem(null)
    setAdminForm({
      name: '',
      detail: '',
      category: 'Rice',
      price: '',
      tag: '',
      image: '',
      alt: '',
      available: true,
    })
  }

  function startEditingMenuItem(item) {
    setEditingItem(item)
    setAdminForm({ ...item })
    window.scrollTo(0, 0)
  }

  async function deleteMenuItem(item) {
    const nextMenu = menuItems.filter((menuItem) => menuItem.id !== item.id)
    if (supabase) {
      const { error } = await supabase.from('menu_items').delete().eq('id', item.id)
      if (error) {
        setAdminMessage(`Unable to delete menu item: ${error.message}`)
        return
      }
      setMenuItems(nextMenu)
      setAdminMessage('Menu item removed from the shared database.')
    } else if (!(await persistMenu(nextMenu))) return
    setCart((currentCart) => {
      const nextCart = { ...currentCart }
      delete nextCart[item.id]
      return nextCart
    })
    if (editingItem?.id === item.id) {
      setEditingItem(null)
      setAdminForm({
        name: '',
        detail: '',
        category: 'Rice',
        price: '',
        tag: '',
        image: '',
        alt: '',
        available: true,
      })
    }
  }

  async function toggleAvailability(item) {
    await persistMenu(menuItems.map((menuItem) =>
      menuItem.id === item.id ? { ...menuItem, available: !menuItem.available } : menuItem,
    ))
  }

  async function updateSavedOrderStatus(orderId, status) {
    if (!orderStatuses.includes(status)) return
    if (supabase) {
      const { data, error } = await supabase.from('orders').update({ status }).eq('order_number', orderId).select('order_number').maybeSingle()
      if (error || !data) {
        setAdminMessage(`Unable to update order status: ${error?.message || 'Order was not updated. Check admin permissions.'}`)
        return
      }
    }
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, status } : order,
    )
    try {
      if (useLocalDemo) window.localStorage.setItem(savedOrdersKey, JSON.stringify(updatedOrders))
      const updatedOrder = updatedOrders.find((order) => order.id === orderId)
      setOrders(updatedOrders)
      if (activeOrder?.id === orderId) setActiveOrder(updatedOrder)
      if (checkoutDetails?.id === orderId) setCheckoutDetails(updatedOrder)
      setTrackingError('')
      setAdminMessage(`Order ${orderId} status updated to ${status}.`)
    } catch (error) {
      const message = error instanceof Error
        ? `Unable to save order status: ${error.message}`
        : 'Unable to save order status.'
      setTrackingError(message)
      setAdminMessage(
        message,
      )
    }
  }

  async function updateSavedPaymentStatus(orderId, paymentStatus) {
    if (!paymentStatuses.includes(paymentStatus)) return
    if (supabase) {
      const { data, error } = await supabase.from('orders').update({ payment_status: paymentStatus }).eq('order_number', orderId).select('order_number').maybeSingle()
      if (error || !data) {
        setAdminMessage(`Unable to update payment status: ${error?.message || 'Order was not updated. Check admin permissions.'}`)
        return
      }
    }
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, paymentStatus } : order,
    )
    try {
      if (useLocalDemo) window.localStorage.setItem(savedOrdersKey, JSON.stringify(updatedOrders))
      const updatedOrder = updatedOrders.find((order) => order.id === orderId)
      setOrders(updatedOrders)
      if (activeOrder?.id === orderId) setActiveOrder(updatedOrder)
      if (checkoutDetails?.id === orderId) setCheckoutDetails(updatedOrder)
      setAdminMessage(`Payment for ${orderId} marked ${paymentStatus.toLowerCase()}.`)
    } catch (error) {
      setAdminMessage(error instanceof Error
        ? `Unable to save payment status: ${error.message}`
        : 'Unable to save payment status.')
    }
  }

  function addToCart(item) {
    setCart((currentCart) => ({
      ...currentCart,
      [item.id]: (currentCart[item.id] ?? 0) + 1,
    }))
    setCartMessage(`${item.name} added to your cart`)
  }

  function changeQuantity(itemId, amount) {
    setCart((currentCart) => {
      const nextQuantity = (currentCart[itemId] ?? 0) + amount
      if (nextQuantity <= 0) {
        const nextCart = { ...currentCart }
        delete nextCart[itemId]
        return nextCart
      }
      return { ...currentCart, [itemId]: nextQuantity }
    })
  }

  function removeFromCart(itemId) {
    setCart((currentCart) => {
      const nextCart = { ...currentCart }
      delete nextCart[itemId]
      return nextCart
    })
  }

  async function signInAdmin(event) {
    event.preventDefault()
    if (!supabase) return
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email')).trim()
    if (email.toLowerCase() !== adminEmail) {
      setAdminMessage('You can’t sign in here. This page is for the store admin only.')
      return
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: String(formData.get('password')),
    })
    if (error) setAdminMessage(`Sign-in failed: ${error.message}`)
    else setAdminMessage('')
  }

  async function signUpAdmin(event) {
    event.preventDefault()
    if (!supabase) return
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email')).trim().toLowerCase()
    const password = String(formData.get('password'))
    if (email !== adminEmail) {
      setAdminMessage('You can’t sign up here. Only the store admin can create an account.')
      return
    }
    if (password.length < 8) {
      setAdminMessage('Choose a password with at least 8 characters.')
      return
    }
    if (password !== String(formData.get('confirmPassword'))) {
      setAdminMessage('The two passwords do not match.')
      return
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/#admin` },
    })
    if (error) {
      setAdminMessage(`Sign-up failed: ${error.message}`)
      return
    }
    if (data.session) {
      setAdminMessage('')
      return
    }
    setAdminAuthMode('sign-in')
    setAdminMessage('Account created. Open the confirmation email we sent, then sign in here.')
  }

  async function signOutAdmin() {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) setAdminMessage(`Unable to sign out: ${error.message}`)
    else {
      setOrders([])
      setAdminMessage('You have signed out.')
    }
  }

  async function submitOrder(event) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    if (import.meta.env.PROD && !supabase) {
      setOrderSubmitMessage('Online ordering is not configured yet. Please contact us by email or phone.')
      return
    }
    const formData = new FormData(form)
    const orderDetails = {
      id: createOrderId(),
      name: formData.get('name'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      paymentMethod: String(formData.get('paymentMethod')),
      paymentStatus: formData.get('paymentMethod') === 'Bank transfer'
        ? 'Awaiting verification'
        : 'Due on delivery',
      items: cartItems.map((item) => ({
        ...item,
        quantity: cart[item.id],
      })),
      subtotal: cartTotal,
      deliveryFee,
      total: cartTotal + deliveryFee,
      status: orderStatuses[0],
      createdAt: new Date().toISOString(),
    }
    let order = orderDetails
    setOrderSubmitMessage('')
    setIsSubmittingOrder(true)
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('create_order', {
          p_customer_name: orderDetails.name,
          p_customer_phone: orderDetails.phone,
          p_delivery_address: orderDetails.address,
          p_payment_method: orderDetails.paymentMethod,
          p_items: orderDetails.items.map((item) => ({ id: item.id, quantity: item.quantity })),
        })
        if (error) {
          setOrderSubmitMessage(`Your order could not be placed: ${error.message}`)
          setIsSubmittingOrder(false)
          return
        }
        if (!data) {
          setOrderSubmitMessage('The server did not return an order confirmation. Please contact the restaurant before trying again.')
          setIsSubmittingOrder(false)
          return
        }
        order = data
      } catch (error) {
        setOrderSubmitMessage(error instanceof Error
          ? `Your order could not be placed: ${error.message}`
          : 'Your order could not be placed. Please try again or contact the restaurant.')
        setIsSubmittingOrder(false)
        return
      }
    }
    setActiveOrder(order)
    setCheckoutDetails(order)
    setTrackingError('')
    try {
      window.sessionStorage.setItem(latestOrderSessionKey, JSON.stringify(order))
    } catch {
      // Keep the order visible for this page even when session storage is unavailable.
    }
    if (useLocalDemo) {
      const updatedOrders = [order, ...orders]
      try {
        window.localStorage.setItem(savedOrdersKey, JSON.stringify(updatedOrders))
        setOrders(updatedOrders)
      } catch (error) {
        setTrackingError(
          error instanceof Error
            ? `Order is available in this session, but could not be saved for tracking: ${error.message}`
            : 'Order is available in this session, but could not be saved for tracking.',
        )
      }
    }
    setIsSubmittingOrder(false)
    navigateTo('order-confirmation')
  }

  function submitContactMessage(event) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const formData = new FormData(form)
    const name = String(formData.get('name')).trim()
    const email = String(formData.get('email')).trim()
    const topic = String(formData.get('topic'))
    const message = String(formData.get('message')).trim()
    const subject = `${topic} — ${name}`
    const body = `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`
    window.location.href = `mailto:sultanabdulwaheed382@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  function updateOrderStatus(status) {
    if (!activeOrder || !orderStatuses.includes(status)) return
    updateSavedOrderStatus(activeOrder.id, status)
    setTrackingError('')
  }

  return (
    <>
      <div className="announcement">
        <span className="announcement-sparkle" aria-hidden="true">✳</span>
        Good food, good mood. Free delivery on your first order over ₦30,000.
        <a href="#menu">Get yours <ArrowIcon /></a>
      </div>

      <header className="site-header" id="home">
        <div className="header-inner">
          <Brand />
          <nav className={`main-nav${mobileMenuOpen ? ' is-open' : ''}`} id="main-navigation" aria-label="Main navigation">
            <button type="button" onClick={() => navigateToHomeSection('menu')}>The menu</button>
            <button type="button" onClick={() => navigateTo('about')}>About us</button>
            <button type="button" onClick={() => navigateTo('contact')}>Contact</button>
            <button type="button" onClick={() => navigateToHomeSection('reviews')}>Kind words</button>
            <button type="button" onClick={() => navigateTo('tracking')}>Track order</button>
            <button type="button" onClick={() => navigateTo('admin')}>{useLocalDemo ? 'Admin demo' : 'Admin sign in'}</button>
          </nav>
          <button
            className="mobile-menu-toggle"
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="main-navigation"
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <button
            className="header-cart"
            type="button"
            onClick={() => navigateTo('cart')}
            aria-label={`Open cart with ${cartCount} items`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 9H6" />
              <circle cx="10" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
            </svg>
            Cart <span>{cartCount}</span>
          </button>
          <a
            className="header-order"
            href="#menu"
            onClick={(event) => {
              if (page !== 'home') {
                event.preventDefault()
                navigateTo('home')
                window.setTimeout(() => {
                  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })
                }, 0)
              }
            }}
          >
            Order now <ArrowIcon />
          </a>
        </div>
      </header>

      <main>
        {import.meta.env.PROD && !isSupabaseConfigured && page === 'home' && (
          <p className="backend-config-banner" role="alert">This website is not accepting online orders yet. The database still needs to be connected.</p>
        )}
        {page === 'home' ? (
          <>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><span /> MADE WITH LOVE. SERVED WITH A SIDE OF JOY.</div>
            <h1 id="hero-title">Big flavor.<br />Zero <span>fuss.</span></h1>
            <p className="hero-description">
              Really good food, made from scratch and brought right to your door.
              Your cravings called. We picked up.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#menu">Explore the menu <ArrowIcon /></a>
              <a className="text-link" href="#story">A little about us <span aria-hidden="true">↗</span></a>
            </div>
            <div className="hero-social-proof">
              <div className="avatar-stack" aria-hidden="true">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80" alt="" />
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80" alt="" />
                <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=80&h=80&q=80" alt="" />
              </div>
              <div><span className="stars">★★★★★</span><br /><strong>Loved by 2,000+ hungry humans</strong></div>
            </div>
            <span className="hero-doodle" aria-hidden="true">✳</span>
          </div>
          <div className="hero-visual">
            <img
              className="hero-image"
              src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1500&q=90"
              alt="A delicious spread of grilled food fresh from the kitchen"
            />
            <div className="hero-image-shade" />
            <div className="image-note"><span>✳</span> GOOD THINGS<br />ARE COOKING</div>
            <div className="delivery-stamp">
              <span className="stamp-top">MADE FRESH</span>
              <span className="stamp-icon">✳</span>
              <span className="stamp-bottom">DELIVERED HAPPY</span>
            </div>
          </div>
          <a className="scroll-note" href="#menu"><span /> SCROLL FOR THE GOOD STUFF</a>
        </section>

        <section className="benefit-strip" aria-label="Our promises">
          <div><span aria-hidden="true">✳</span> REAL FOOD, ALWAYS</div>
          <i aria-hidden="true" />
          <div><span aria-hidden="true">↗</span> AT YOUR DOOR IN 30</div>
          <i aria-hidden="true" />
          <div><span aria-hidden="true">♡</span> MADE WITH A LOT OF LOVE</div>
        </section>

        <section className="menu-section section-wrap" id="menu">
          <div className="section-heading menu-heading">
            <div>
              <div className="eyebrow"><span /> FRESH FROM OUR KITCHEN</div>
              <h2>Find your <em>favourite.</em></h2>
              <p className="menu-intro">Nigerian comfort food, made with love. Pick a plate, we’ll bring it to you. Photos are illustrative and may not show the exact meal.</p>
            </div>
            <button
              className="cart-toggle"
              type="button"
              aria-expanded={cartOpen}
              aria-controls="cart-summary"
              onClick={() => setCartOpen((open) => !open)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 9H6" />
                <circle cx="10" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
              </svg>
              Your cart <span>{cartCount}</span>
            </button>
          </div>
          {menuLoadMessage && <p className="menu-load-message" role="alert">{menuLoadMessage}</p>}
          <aside
            className="cart-summary"
            id="cart-summary"
            aria-label="Your cart"
            hidden={!cartOpen}
          >
              <div className="cart-summary-heading">
                <div><strong>Your order</strong><span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span></div>
                <button type="button" onClick={() => setCartOpen(false)} aria-label="Close cart">×</button>
              </div>
              {cartItems.length === 0 ? (
                <p className="cart-empty">Your cart is empty. Add something delicious!</p>
              ) : (
                <>
                  <ul>
                    {cartItems.map((item) => (
                      <li key={item.id}>
                        <span>{item.name} <b>× {cart[item.id]}</b></span>
                        <strong>{formatPrice(item.price * cart[item.id])}</strong>
                      </li>
                    ))}
                  </ul>
                  <div className="cart-total"><span>Subtotal</span><strong>{formatPrice(cartTotal)}</strong></div>
                  <div className="cart-total"><span>Delivery</span><strong>{deliveryFeeLabel}</strong></div>
                  <button
                    className="cart-summary-checkout"
                    type="button"
                    onClick={() => navigateTo('cart')}
                  >
                    View cart & checkout <ArrowIcon />
                  </button>
                </>
              )}
          </aside>
          <div className="menu-controls">
            <label className="menu-search">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.5 4.5" />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search jollof, suya, drinks..."
                aria-label="Search menu"
              />
            </label>
            <label className="price-filter">
              <span>Max price <strong>{formatPrice(maxPrice)}</strong></span>
              <input
                type="range"
                min="2500"
                max="20000"
                step="500"
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                aria-label={`Maximum price ${formatPrice(maxPrice)}`}
              />
            </label>
          </div>
          <div className="category-tabs" role="group" aria-label="Filter menu by category">
            {categories.map((category) => (
              <button
                className={activeCategory === category ? 'category-tab active' : 'category-tab'}
                key={category}
                type="button"
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="menu-results" aria-live="polite">
            <span>{filteredItems.length} {filteredItems.length === 1 ? 'dish' : 'dishes'} to make your day</span>
            {(activeCategory !== 'All' || searchQuery || maxPrice < 20000) && (
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All')
                  setSearchQuery('')
                  setMaxPrice(20000)
                }}
              >
                Clear filters
              </button>
            )}
          </div>
          {filteredItems.length > 0 ? (
            <div className="meal-grid">
              {filteredItems.map((item, index) => (
                <article className="meal-card" key={item.id}>
                  <div className={`meal-image-link${item.available ? '' : ' unavailable'}`}>
                    <img src={item.image} alt={item.alt} loading="lazy" />
                    <span className="meal-tag">{item.tag}</span>
                    <span className="meal-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className={`availability-label${item.available ? '' : ' sold-out'}`}>
                      {item.available ? 'Available now' : 'Sold out today'}
                    </span>
                  </div>
                  <div className="meal-info">
                    <div><h3>{item.name}</h3><p>{item.detail}</p></div>
                    <span className="meal-price">{formatPrice(item.price)}</span>
                  </div>
                  <button
                    className="add-to-cart"
                    type="button"
                    disabled={!item.available}
                    onClick={() => addToCart(item)}
                  >
                    {item.available ? <><span aria-hidden="true">+</span> Add to cart</> : 'Unavailable'}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="menu-empty">
              <span aria-hidden="true">✳</span>
              <h3>No dishes found just yet.</h3>
              <p>Try another search or raise your max price to see more of the good stuff.</p>
            </div>
          )}
          <p className="cart-feedback" aria-live="polite">{cartMessage}</p>
        </section>

        <section className="offer-section" id="story">
          <div className="offer-image">
            <img
              src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1400&q=85"
              alt="Golden small chops ready to share"
              loading="lazy"
            />
            <span className="offer-image-label">A LITTLE EXTRA, ON US.</span>
          </div>
          <div className="offer-copy">
            <div className="eyebrow"><span /> A FIRST BITE ON US</div>
            <h2>First time?<br />Make it <em>extra.</em></h2>
            <p>Get 15% off your first order. No secret handshake, no weird catch. Just really good food for a little less.</p>
            <a className="button button-dark" href="#order">Claim your 15% off <ArrowIcon /></a>
            <span className="offer-code">USE CODE <strong>FIRSTBITE</strong> AT CHECKOUT</span>
            <span className="offer-sparkle" aria-hidden="true">✳</span>
          </div>
        </section>

        <section className="reviews-section section-wrap" id="reviews">
          <div className="reviews-heading">
            <div className="eyebrow"><span /> DON'T JUST TAKE OUR WORD</div>
            <h2>Full hearts, <em>full bellies.</em></h2>
            <p>Some very kind things from some very hungry people.</p>
          </div>
          <div className="review-grid">
            {reviews.map((review) => (
              <figure className="review-card" key={review.name}>
                <div className="stars" aria-label="5 out of 5 stars">★★★★★</div>
                <blockquote>“{review.quote}”</blockquote>
                <figcaption><span className="review-avatar">{review.initials}</span><span><strong>{review.name}</strong><small>{review.detail}</small></span><span className="quote-mark" aria-hidden="true">“</span></figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="delivery-section" id="order">
          <div className="delivery-inner">
            <div className="delivery-copy">
              <div className="eyebrow eyebrow-light"><span /> GOOD FOOD. RIGHT ON TIME.</div>
              <h2>Your couch called.<br /><em>It wants Zee.</em></h2>
              <p>We bring the good stuff straight to your door, fresh and fast. Most orders land in about 30 minutes. You stay comfy; we’ll handle dinner.</p>
              <a className="button button-light" href="#menu">Let’s get you fed <ArrowIcon /></a>
            </div>
            <div className="delivery-graphic" aria-hidden="true">
              <div className="delivery-circle">FRESH<br />TO YOUR<br /><span>DOOR.</span></div>
              <span className="delivery-star delivery-star-one">✳</span>
              <span className="delivery-star delivery-star-two">✳</span>
              <span className="delivery-route">ZEE ON THE WAY <b>→</b></span>
            </div>
          </div>
        </section>
          </>
        ) : page === 'admin' && import.meta.env.PROD && !isSupabaseConfigured ? (
          <section className="admin-page section-wrap" aria-labelledby="admin-setup-title">
            <div className="admin-demo-notice" role="alert">The server and admin account are not configured yet. This page is unavailable in the production site.</div>
            <h1 id="admin-setup-title">Admin setup required</h1>
          </section>
        ) : page === 'admin' && isSupabaseConfigured && adminAuthLoading ? (
          <section className="admin-page section-wrap" aria-live="polite"><p>Checking admin session…</p></section>
        ) : page === 'admin' && isSupabaseConfigured && !isStoreAdmin ? (
          <section className="admin-page section-wrap admin-login-page" aria-labelledby="admin-login-title">
            <div className="eyebrow"><span /> ZEE TUMMY LAB / STAFF</div>
            <h1 id="admin-login-title">Admin <em>{adminAuthMode === 'sign-in' ? 'sign in.' : 'sign up.'}</em></h1>
            <p>
              {adminAuthMode === 'sign-in'
                ? 'Staff area. Only the store admin can sign in to manage orders and the menu.'
                : 'Staff area. Only the store admin can create an account here. Everyone else is turned away.'}
            </p>
            <div className="admin-auth-tabs" role="group" aria-label="Admin account">
              <button type="button" aria-pressed={adminAuthMode === 'sign-in'} onClick={() => { setAdminAuthMode('sign-in'); setAdminMessage('') }}>Sign in</button>
              <button type="button" aria-pressed={adminAuthMode === 'sign-up'} onClick={() => { setAdminAuthMode('sign-up'); setAdminMessage('') }}>Sign up</button>
            </div>
            {adminMessage && <p className="admin-message" role="alert">{adminMessage}</p>}
            {adminAuthMode === 'sign-in' ? (
              <form className="admin-panel admin-login-form" onSubmit={signInAdmin}>
                <label>Email address<input name="email" type="email" autoComplete="username" required /></label>
                <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
                <button className="button button-primary" type="submit">Sign in <ArrowIcon /></button>
              </form>
            ) : (
              <form className="admin-panel admin-login-form" onSubmit={signUpAdmin}>
                <label>Email address<input name="email" type="email" autoComplete="username" required /></label>
                <label>Password<input name="password" type="password" autoComplete="new-password" minLength="8" required /></label>
                <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" minLength="8" required /></label>
                <button className="button button-primary" type="submit">Create account <ArrowIcon /></button>
              </form>
            )}
          </section>
        ) : page === 'admin' ? (
          <section className="admin-page section-wrap" aria-labelledby="admin-title">
            {useLocalDemo && <div className="admin-demo-notice" role="note">
              Browser-local admin demo. There is no staff login, server, or shared data; do not use this dashboard for real customer information.
            </div>}
            <div className="admin-heading">
              <div>
                <div className="eyebrow"><span /> ZEE TUMMY LAB / STAFF</div>
                <h1 id="admin-title">Good morning, <em>boss.</em></h1>
                <p>Manage your menu, keep an eye on orders and see how the kitchen is doing.</p>
              </div>
              <button type="button" className="admin-return-link" onClick={() => navigateTo('home')}>
                View customer site <ArrowIcon />
              </button>
              {supabase && isStoreAdmin && <button type="button" className="admin-return-link" onClick={signOutAdmin}>Sign out</button>}
            </div>
            {adminMessage && <p className="admin-message" role="status">{adminMessage}</p>}

            <div className="sales-summary" aria-label="Sales summary">
              <article><span>ORDERS RECEIVED</span><strong>{orders.length}</strong><small>{supabase ? 'Saved in the database' : 'Saved in this browser'}</small></article>
              <article><span>GROSS ORDER VALUE</span><strong>{formatPrice(totalSales)}</strong><small>Orders available to this dashboard</small></article>
              <article><span>DELIVERED</span><strong>{deliveredOrders}</strong><small>Orders marked delivered</small></article>
              <article><span>MENU ITEMS</span><strong>{menuItems.length}</strong><small>{menuItems.filter((item) => item.available).length} currently available</small></article>
            </div>

            <div className="admin-menu-management">
              <section className="admin-panel" aria-labelledby="menu-management-title">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-panel-eyebrow">YOUR FOOD, YOUR WAY</span>
                    <h2 id="menu-management-title">Menu items</h2>
                  </div>
                  <span className="admin-item-count">{menuItems.length} items</span>
                </div>
                <div className="admin-menu-list">
                  {menuItems.length === 0 ? (
                    <p className="admin-empty">No dishes yet. Add the first item using the form.</p>
                  ) : menuItems.map((item) => (
                    <article className="admin-menu-row" key={item.id}>
                      <img src={item.image} alt="" />
                      <div className="admin-menu-row-copy">
                        <strong>{item.name}</strong>
                        <span>{item.category} · {formatPrice(item.price)}</span>
                      </div>
                      <button
                        type="button"
                        className={`availability-toggle${item.available ? ' is-available' : ''}`}
                        aria-pressed={item.available}
                        onClick={() => toggleAvailability(item)}
                      >
                        {item.available ? 'Available' : 'Sold out'}
                      </button>
                      <button type="button" className="admin-row-action" onClick={() => startEditingMenuItem(item)}>Edit</button>
                      <button type="button" className="admin-row-action delete-action" onClick={() => deleteMenuItem(item)}>Delete</button>
                    </article>
                  ))}
                </div>
              </section>

              <form className="admin-panel admin-item-form" onSubmit={handleSaveMenuItem}>
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-panel-eyebrow">{editingItem ? 'UPDATE THE DETAILS' : 'ADD SOMETHING DELICIOUS'}</span>
                    <h2>{editingItem ? 'Edit food item' : 'New food item'}</h2>
                  </div>
                  {editingItem && (
                    <button
                      type="button"
                      className="admin-cancel-edit"
                      onClick={() => {
                        setEditingItem(null)
                        setAdminForm({ name: '', detail: '', category: 'Rice', price: '', tag: '', image: '', alt: '', available: true })
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <label>Item name
                  <input name="name" value={adminForm.name} onChange={(event) => setAdminForm((current) => ({ ...current, name: event.target.value }))} required />
                </label>
                <label>Description
                  <textarea name="detail" rows="2" value={adminForm.detail} onChange={(event) => setAdminForm((current) => ({ ...current, detail: event.target.value }))} required />
                </label>
                <div className="admin-form-pair">
                  <label>Category
                    <select name="category" value={adminForm.category} onChange={(event) => setAdminForm((current) => ({ ...current, category: event.target.value }))}>
                      {categories.filter((category) => category !== 'All').map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </label>
                  <label>Price (₦)
                    <input name="price" type="number" min="0" step="50" value={adminForm.price} onChange={(event) => setAdminForm((current) => ({ ...current, price: event.target.value }))} required />
                  </label>
                </div>
                <label>Photo URL
                  <input name="image" type="url" value={adminForm.image} onChange={(event) => setAdminForm((current) => ({ ...current, image: event.target.value }))} placeholder="https://..." />
                </label>
                <div className="admin-form-pair">
                  <label>Photo description
                    <input name="alt" value={adminForm.alt} onChange={(event) => setAdminForm((current) => ({ ...current, alt: event.target.value }))} />
                  </label>
                  <label>Menu label
                    <input name="tag" value={adminForm.tag} onChange={(event) => setAdminForm((current) => ({ ...current, tag: event.target.value }))} placeholder="MADE FRESH" />
                  </label>
                </div>
                <label className="availability-checkbox">
                  <input name="available" type="checkbox" checked={adminForm.available} onChange={(event) => setAdminForm((current) => ({ ...current, available: event.target.checked }))} />
                  Available to order
                </label>
                <button className="button button-primary admin-save-button" type="submit">
                  {editingItem ? 'Save changes' : 'Add food item'} <ArrowIcon />
                </button>
              </form>
            </div>

            <section className="admin-panel admin-orders-panel" aria-labelledby="incoming-orders-title">
              <div className="admin-panel-heading">
                <div>
                  <span className="admin-panel-eyebrow">WHAT’S COOKING</span>
                  <h2 id="incoming-orders-title">Incoming orders</h2>
                </div>
                <span className="admin-item-count">{orders.length} total</span>
              </div>
              {orders.length === 0 ? (
                <div className="admin-empty">No orders yet. Customer orders will appear here when submitted.</div>
              ) : (
                <div className="admin-orders-list">
                  {orders.map((order) => (
                    <article className="admin-order-row" key={order.id}>
                      <div className="admin-order-main">
                        <strong>{order.id}</strong>
                        <span>{order.name} · {order.phone}</span>
                        <span>{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</span>
                        <span>Payment: {order.paymentMethod || 'Bank transfer'} · {order.paymentStatus || 'Status unavailable'}</span>
                        <small>{order.address}</small>
                      </div>
                      <div className="admin-order-total">
                        <span>ORDER TOTAL</span>
                        <strong>{formatPrice(Number(order.total) || 0)}</strong>
                      </div>
                      <div className="admin-order-controls">
                        <label className="admin-order-status">Order status
                          <select value={order.status} onChange={(event) => updateSavedOrderStatus(order.id, event.target.value)}>
                            {orderStatuses.map((status) => <option key={status}>{status}</option>)}
                          </select>
                        </label>
                        <label className="admin-order-status">Payment status
                          <select
                            value={order.paymentStatus || (order.paymentMethod === 'Payment on delivery' ? 'Due on delivery' : 'Awaiting verification')}
                            onChange={(event) => updateSavedPaymentStatus(order.id, event.target.value)}
                          >
                            {paymentStatuses.map((status) => <option key={status}>{status}</option>)}
                          </select>
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </section>
        ) : page === 'about' ? (
          <section className="about-page" aria-labelledby="about-title">
            <div className="about-hero">
              <div className="about-hero-copy">
                <button className="back-to-menu" type="button" onClick={() => navigateTo('home')}>
                  ← Back to the menu
                </button>
                <div className="eyebrow"><span /> A LITTLE TASTE OF WHO WE ARE</div>
                <h1 id="about-title">Nigerian roots.<br />Made with <em>heart.</em></h1>
                <p>At ZeeTummyLab, good food is more than a meal. It’s the familiar comfort of a proper plate of jollof, the happy noise around a box of small chops, and the feeling of being well looked after.</p>
                <p>We bring those everyday moments to your table with generous portions, bright flavours and a whole lot of care.</p>
                <a className="button button-primary" href="#about-story">Our story <ArrowIcon /></a>
              </div>
              <div className="about-hero-photos">
                <figure className="about-photo-main">
                  <img
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1100&q=85"
                    alt="Warm, welcoming restaurant dining room"
                  />
                  <figcaption>A seat at our table is always waiting.</figcaption>
                </figure>
                <figure className="about-photo-small">
                  <img
                    src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=650&q=85"
                    alt="A chef preparing a meal in a working kitchen"
                  />
                </figure>
                <span className="about-photo-stamp" aria-hidden="true">GOOD FOOD<br />GOOD PEOPLE</span>
              </div>
            </div>

            <div className="about-story section-wrap" id="about-story">
              <div className="about-story-image">
                <img
                  src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=85"
                  alt="Restaurant set up ready to welcome guests"
                  loading="lazy"
                />
              </div>
              <div className="about-story-copy">
                <div className="eyebrow"><span /> OUR STORY</div>
                <h2>Good food brings us <em>together.</em></h2>
                <p>ZeeTummyLab grew from a love of the dishes that make a gathering feel like home. We wanted everyday favourites and celebration bites to be just as joyful when enjoyed around your own table.</p>
                <p>So we bring Nigerian flavours to the centre of the plate: party-style rice, comforting soups, lively small chops and the treats that make everyone reach for one more.</p>
                <p>We’re here for family dinners, workday lunches and all the little reasons to share a good meal.</p>
                <span className="about-signoff">Cooked with care, served with joy.</span>
              </div>
            </div>

            <div className="standards-section">
              <div className="section-wrap">
                <div className="standards-heading">
                  <div className="eyebrow"><span /> CARE IN EVERY STEP</div>
                  <h2>Good food starts <em>before the first bite.</em></h2>
                  <p>We treat preparation with the same care we put into flavour.</p>
                </div>
                <div className="standards-grid">
                  <article className="standard-card">
                    <span className="standard-number">01</span>
                    <span className="standard-icon" aria-hidden="true">✳</span>
                    <h3>A clean start</h3>
                    <p>We keep food-preparation surfaces and tools clean, and wash hands between ingredients and tasks.</p>
                  </article>
                  <article className="standard-card">
                    <span className="standard-number">02</span>
                    <span className="standard-icon" aria-hidden="true">↗</span>
                    <h3>Handled with care</h3>
                    <p>Raw ingredients and ready-to-eat food are kept separate during prep to help prevent cross-contamination.</p>
                  </article>
                  <article className="standard-card">
                    <span className="standard-number">03</span>
                    <span className="standard-icon" aria-hidden="true">♡</span>
                    <h3>Freshly prepared</h3>
                    <p>We prepare dishes in small batches and pack hot meals promptly to help them arrive at their best.</p>
                  </article>
                  <article className="standard-card">
                    <span className="standard-number">04</span>
                    <span className="standard-icon" aria-hidden="true">✓</span>
                    <h3>Checked before it leaves</h3>
                    <p>Every order gets a final check for the right dishes, careful packing and any notes you shared.</p>
                  </article>
                </div>
                <p className="standards-note">These are our kitchen commitments; update this section to reflect your restaurant’s documented procedures and certifications.</p>
              </div>
            </div>

            <div className="different-section section-wrap">
              <div className="different-photo">
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1100&q=85"
                  alt="Fresh ingredients being prepared in a restaurant kitchen"
                  loading="lazy"
                />
                <span>THOUGHTFUL FROM PREP TO PACKING</span>
              </div>
              <div className="different-copy">
                <div className="eyebrow"><span /> WHY ZEE</div>
                <h2>A little more <em>meaning</em> in every meal.</h2>
                <ul>
                  <li><span>01</span><div><strong>Rooted in Nigerian flavour</strong><p>Familiar favourites and bold, feel-good seasoning.</p></div></li>
                  <li><span>02</span><div><strong>Generous, shareable plates</strong><p>Made for the table, whether it’s two people or the whole crew.</p></div></li>
                  <li><span>03</span><div><strong>Care beyond the kitchen</strong><p>Thoughtful packing and helpful service are part of the meal.</p></div></li>
                  <li><span>04</span><div><strong>Comfort without the occasion</strong><p>Good food for ordinary Tuesdays and the days worth celebrating.</p></div></li>
                </ul>
              </div>
            </div>

            <div className="visit-section">
              <div className="visit-inner section-wrap">
                <div className="visit-copy">
                  <div className="eyebrow eyebrow-light"><span /> COME SAY HELLO</div>
                  <h2>From Ilorin,<br />with <em>love.</em></h2>
                  <p>Serving Ilorin, Kwara State with freshly prepared meals.</p>
                  <div className="visit-address">
                    <span>OUR NEIGHBOURHOOD</span>
                    <strong>Ilorin, Kwara State, Nigeria</strong>
                    <small>Delivery service in Ilorin. Confirm delivery availability when ordering.</small>
                  </div>
                </div>
                <div className="hours-card">
                  <span className="hours-eyebrow">WHEN WE’RE COOKING</span>
                  <h3>Opening hours</h3>
                  <dl>
                    <div><dt>Every day</dt><dd>8:00 am – 10:00 pm</dd></div>
                  </dl>
                  <p>Hours can change on public holidays. Check before you make a special trip.</p>
                </div>
              </div>
            </div>
            <p className="about-disclaimer">
              Location and opening hours are provided by the business. Restaurant photos are illustrative; replace them with original food and restaurant photos when available.
            </p>
          </section>
        ) : page === 'contact' ? (
          <section className="contact-page section-wrap" aria-labelledby="contact-title">
            <button className="back-to-menu" type="button" onClick={() => navigateTo('home')}>
              ← Back to the menu
            </button>
            <div className="contact-heading">
              <div className="eyebrow"><span /> WE’RE ALL EARS</div>
              <h1 id="contact-title">Let’s talk <em>food.</em></h1>
              <p>Questions about an order, a menu item, or a celebration? Send us a note and we’ll get back to you.</p>
            </div>
            <div className="contact-layout">
              <aside className="contact-note">
                <span className="contact-note-mark" aria-hidden="true">z.</span>
                <h2>Good things start with a hello.</h2>
                <p>For order updates, include your order number so we can help faster.</p>
                <div className="contact-detail">
                  <span>EMAIL US</span>
                  <a href="mailto:sultanabdulwaheed382@gmail.com">sultanabdulwaheed382@gmail.com</a>
                </div>
                <div className="contact-detail">
                  <span>CALL US</span>
                  <a href="tel:+2349065974857">09065974857</a>
                </div>
                <div className="contact-detail">
                  <span>ALREADY ORDERED?</span>
                  <button type="button" onClick={() => navigateTo('tracking')}>Track your order <ArrowIcon /></button>
                </div>
              </aside>
              <form className="contact-form" onSubmit={submitContactMessage}>
                <div className="contact-form-heading">
                  <span>DROP US A LINE</span>
                  <h2>How can we help?</h2>
                </div>
                <div className="contact-form-row">
                  <label htmlFor="contact-name">Your name</label>
                  <input id="contact-name" name="name" autoComplete="name" required maxLength="100" placeholder="e.g. Ada Okafor" />
                </div>
                <div className="contact-form-row">
                  <label htmlFor="contact-email">Email address</label>
                  <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength="254" placeholder="you@example.com" />
                </div>
                <div className="contact-form-row">
                  <label htmlFor="contact-topic">What’s this about?</label>
                  <select id="contact-topic" name="topic" defaultValue="General question">
                    <option>General question</option>
                    <option>Order support</option>
                    <option>Menu feedback</option>
                    <option>Catering and events</option>
                  </select>
                </div>
                <div className="contact-form-row">
                  <label htmlFor="contact-message">Your message</label>
                  <textarea id="contact-message" name="message" rows="5" required minLength="10" maxLength="3000" placeholder="Tell us a little more…" />
                  <small>Please don’t include payment details or other sensitive information.</small>
                </div>
                <button className="button button-primary contact-submit" type="submit">Prepare email <ArrowIcon /></button>
                <p className="contact-form-note">Submitting opens your email app with the message ready to send.</p>
              </form>
            </div>
          </section>
        ) : page === 'cart' ? (
          <section className="checkout-page section-wrap" aria-labelledby="cart-title">
            <button className="back-to-menu" type="button" onClick={() => navigateTo('home')}>
              ← Back to the menu
            </button>
            <div className="checkout-page-heading">
              <div className="eyebrow"><span /> YOUR GOOD STUFF</div>
              <h1 id="cart-title">Your <em>cart.</em></h1>
              <p>Give everything one last look. You can change quantities or remove dishes here.</p>
            </div>
            {cartItems.length === 0 ? (
              <div className="checkout-empty">
                <span aria-hidden="true">✳</span>
                <h2>Your cart is looking a little hungry.</h2>
                <p>Add a few favourites from the menu and they’ll show up here.</p>
                <button className="button button-primary" type="button" onClick={() => navigateTo('home')}>
                  Browse the menu <ArrowIcon />
                </button>
              </div>
            ) : (
              <div className="cart-page-layout">
                <div className="cart-page-items">
                  {cartItems.map((item) => (
                    <article className="cart-line-item" key={item.id}>
                      <img src={item.image} alt={item.alt} />
                      <div className="cart-line-details">
                        <span className="cart-line-category">{item.category}</span>
                        <h2>{item.name}</h2>
                        <p>{item.detail}</p>
                        <button
                          className="remove-item"
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="cart-line-controls">
                        <strong>{formatPrice(item.price * cart[item.id])}</strong>
                        <div className="quantity-control" aria-label={`Quantity of ${item.name}`}>
                          <button
                            type="button"
                            aria-label={`Decrease ${item.name} quantity`}
                            onClick={() => changeQuantity(item.id, -1)}
                          >
                            −
                          </button>
                          <span aria-live="polite">{cart[item.id]}</span>
                          <button
                            type="button"
                            aria-label={`Increase ${item.name} quantity`}
                            onClick={() => changeQuantity(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <aside className="order-summary">
                  <h2>Order summary</h2>
                  <div><span>Subtotal</span><strong>{formatPrice(cartTotal)}</strong></div>
                  <div><span>Delivery fee</span><strong>{deliveryFeeLabel}</strong></div>
                  <p>Current starter fee: ₦1,500, or free when your subtotal is ₦30,000 or more. Fees may change; confirm the total before payment.</p>
                  <div className="order-summary-total"><span>Total</span><strong>{formatPrice(cartTotal + deliveryFee)}</strong></div>
                  <button className="button button-primary" type="button" onClick={() => navigateTo('checkout')}>
                    Continue to checkout <ArrowIcon />
                  </button>
                  <button className="summary-back-link" type="button" onClick={() => navigateTo('home')}>
                    Keep exploring the menu
                  </button>
                </aside>
              </div>
            )}
          </section>
        ) : page === 'checkout' ? (
          <section className="checkout-page section-wrap" aria-labelledby="checkout-title">
            <button className="back-to-menu" type="button" onClick={() => navigateTo('cart')}>
              ← Back to your cart
            </button>
            {cartItems.length === 0 ? (
              <div className="checkout-empty">
                <span aria-hidden="true">✳</span>
                <h2>Your cart is empty.</h2>
                <p>Add something from the menu before heading to checkout.</p>
                <button className="button button-primary" type="button" onClick={() => navigateTo('home')}>
                  Browse the menu <ArrowIcon />
                </button>
              </div>
            ) : (
              <>
                <div className="checkout-page-heading">
                  <div className="eyebrow"><span /> ALMOST THERE</div>
                  <h1 id="checkout-title">Let’s get it <em>to you.</em></h1>
                  <p>Add your delivery details and review your order before submitting.</p>
                </div>
                <form className="checkout-layout" onSubmit={submitOrder}>
                  <div className="customer-details">
                    <h2>Delivery details</h2>
                    <label>
                      Full name
                      <input name="name" type="text" autoComplete="name" placeholder="e.g. Ada Okafor" required />
                    </label>
                    <label>
                      Phone number
                      <input name="phone" type="tel" autoComplete="tel" placeholder="e.g. 080 1234 5678" required />
                    </label>
                    <label>
                      Delivery address
                      <textarea name="address" autoComplete="street-address" rows="4" placeholder="Street address, area, city and any helpful directions" required />
                    </label>
                    <section className="payment-method-card" aria-labelledby="payment-method-title">
                      <span className="payment-method-eyebrow">PAYMENT METHOD</span>
                      <h3 id="payment-method-title">Choose how to pay</h3>
                      <fieldset className="payment-method-options">
                        <legend className="visually-hidden">Choose a payment method</legend>
                        {paymentMethods.map((method) => (
                          <label key={method}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method}
                              checked={paymentMethod === method}
                              onChange={() => setPaymentMethod(method)}
                              required
                            />
                            {method}
                          </label>
                        ))}
                      </fieldset>
                      {paymentMethod === 'Bank transfer' ? (
                        <>
                          <dl>
                            <div><dt>Bank</dt><dd>{paymentAccount.bank}</dd></div>
                            <div><dt>Account number</dt><dd>{paymentAccount.accountNumber}</dd></div>
                            <div><dt>Account name</dt><dd>{paymentAccount.accountName}</dd></div>
                          </dl>
                          <p>After your order is confirmed, transfer the total and use your order number as the reference. The restaurant will verify the transfer manually.</p>
                        </>
                      ) : (
                        <p>Pay the delivery agent when your order arrives.</p>
                      )}
                    </section>
                    <p className="checkout-demo-note">{supabase ? 'Orders are saved to the restaurant database.' : useLocalDemo ? 'This local demo does not send orders to the restaurant.' : 'Online ordering is unavailable until the database is configured.'}</p>
                  </div>
                  <aside className="checkout-review">
                    <h2>Review your order</h2>
                    <ul>
                      {cartItems.map((item) => (
                        <li key={item.id}>
                          <span>{item.name}<small>Qty {cart[item.id]}</small></span>
                          <strong>{formatPrice(item.price * cart[item.id])}</strong>
                        </li>
                      ))}
                    </ul>
                    <div><span>Subtotal</span><strong>{formatPrice(cartTotal)}</strong></div>
                    <div><span>Delivery fee</span><strong>{deliveryFeeLabel}</strong></div>
                    <div className="order-summary-total"><span>Total</span><strong>{formatPrice(cartTotal + deliveryFee)}</strong></div>
                    {orderSubmitMessage && <p className="order-submit-message" role="alert">{orderSubmitMessage}</p>}
                    <button className="button button-primary" type="submit" disabled={isSubmittingOrder}>
                      {isSubmittingOrder ? 'Submitting…' : supabase ? 'Place order' : useLocalDemo ? 'Submit order details' : 'Order online'} <ArrowIcon />
                    </button>
                    <button className="summary-back-link" type="button" onClick={() => navigateTo('cart')}>
                      Edit cart
                    </button>
                  </aside>
                </form>
              </>
            )}
          </section>
        ) : page === 'order-confirmation' ? (
          <section className="checkout-page section-wrap order-confirmation" aria-labelledby="confirmation-title">
            <div className="confirmation-mark" aria-hidden="true">✓</div>
            <div className="eyebrow"><span /> DETAILS REVIEWED</div>
            <h1 id="confirmation-title">Thanks, {checkoutDetails?.name || 'friend'}.</h1>
            <p className="confirmation-intro">{supabase ? 'Your order has been saved. Bank transfers are checked manually by the restaurant.' : 'Your order details are ready. This local demo does not send an order to the restaurant or process payment.'}</p>
            {checkoutDetails && (
              <div className="confirmation-card">
                <h2>Order summary</h2>
                <p><strong>Phone</strong><span>{checkoutDetails.phone}</span></p>
                <p><strong>Delivery to</strong><span>{checkoutDetails.address}</span></p>
                {(checkoutDetails.paymentMethod || paymentAccount.method) === 'Bank transfer' ? (
                  <section className="confirmation-payment" aria-labelledby="confirmation-payment-title">
                    <h3 id="confirmation-payment-title">Pay by bank transfer</h3>
                    <p><strong>Bank</strong><span>{paymentAccount.bank}</span></p>
                    <p><strong>Account number</strong><span>{paymentAccount.accountNumber}</span></p>
                    <p><strong>Account name</strong><span>{paymentAccount.accountName}</span></p>
                    <p><strong>Transfer reference</strong><span>{checkoutDetails.id}</span></p>
                    <p className="payment-instructions">Transfer {formatPrice(checkoutDetails.total)} and use your order number as the reference. The restaurant will verify the transfer manually.</p>
                  </section>
                ) : (
                  <section className="confirmation-payment" aria-labelledby="confirmation-payment-title">
                    <h3 id="confirmation-payment-title">Payment on delivery</h3>
                    <p className="payment-instructions">Pay {formatPrice(checkoutDetails.total)} to the delivery agent when your order arrives.</p>
                  </section>
                )}
                <ul>
                  {checkoutDetails.items.map((item) => (
                    <li key={item.id}>
                      <span>{item.name} × {item.quantity}</span>
                      <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </li>
                  ))}
                </ul>
                <p><strong>Subtotal</strong><span>{formatPrice(checkoutDetails.subtotal)}</span></p>
                <p><strong>Delivery fee</strong><span>{checkoutDetails.deliveryFee === 0 ? 'Free' : formatPrice(checkoutDetails.deliveryFee)}</span></p>
                <p className="confirmation-total"><strong>Total</strong><span>{formatPrice(checkoutDetails.total)}</span></p>
              </div>
            )}
            <button className="button button-primary" type="button" onClick={() => navigateTo('home')}>
              Back to the menu <ArrowIcon />
            </button>
            {activeOrder && (
              <button className="button tracking-link-button" type="button" onClick={() => navigateTo('tracking')}>
                Track this order <ArrowIcon />
              </button>
            )}
          </section>
        ) : (
          <section className="checkout-page section-wrap tracking-page" aria-labelledby="tracking-title">
            <button className="back-to-menu" type="button" onClick={() => navigateTo('home')}>
              ← Back to the menu
            </button>
            <div className="checkout-page-heading">
              <div className="eyebrow"><span /> YOUR ORDER, YOUR UPDATE</div>
              <h1 id="tracking-title">The good stuff is <em>on its way.</em></h1>
              <p>Follow each step from our kitchen to your door.</p>
            </div>
            {trackingError && <p className="tracking-error" role="alert">{trackingError}</p>}
            {activeOrder ? (
              <>
                <div className="tracking-order-card">
                  <div className="tracking-order-header">
                    <div>
                      <span>ORDER NUMBER</span>
                      <strong>{activeOrder.id}</strong>
                    </div>
                    <div className="tracking-current-status" role="status" aria-live="polite">
                      <span>CURRENT STATUS</span>
                      <strong>{activeOrder.status}</strong>
                    </div>
                  </div>
                  <ol className="tracking-timeline">
                    {orderStatuses.map((status, index) => {
                      const currentIndex = orderStatuses.indexOf(activeOrder.status)
                      const isComplete = index < currentIndex
                      const isCurrent = index === currentIndex
                      return (
                        <li
                          className={`tracking-step${isComplete ? ' complete' : ''}${isCurrent ? ' current' : ''}`}
                          key={status}
                          aria-current={isCurrent ? 'step' : undefined}
                        >
                          <span className="tracking-step-marker" aria-hidden="true">
                            {isComplete ? '✓' : String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="tracking-step-copy">
                            <strong>{status}</strong>
                            <small>
                              {isCurrent
                                ? 'Your order is at this stage.'
                                : isComplete
                                  ? 'Completed'
                                  : 'Up next'}
                            </small>
                          </span>
                        </li>
                      )
                    })}
                  </ol>
                  <div className="tracking-delivery-details">
                    <span>DELIVERING TO</span>
                    <strong>{activeOrder.name}</strong>
                    <p>{activeOrder.address}</p>
                    <span>{activeOrder.phone}</span>
                  </div>
                </div>
                {(useLocalDemo || isStoreAdmin) && <aside className="staff-status-panel">
                  <div>
                    <span className="staff-panel-eyebrow">RESTAURANT STAFF</span>
                    <h2>Update order status</h2>
                    <p>Choose the latest step. The customer tracking timeline updates right away on this device.</p>
                  </div>
                  <label>
                    Order status
                    <select
                      value={activeOrder.status}
                      onChange={(event) => updateOrderStatus(event.target.value)}
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                </aside>}
              </>
            ) : (
              <div className="checkout-empty">
                <span aria-hidden="true">✳</span>
                {supabase ? (
                  <>
                    <h2>Track an order.</h2>
                    <p>Enter your order number and the phone number used at checkout.</p>
                    <form className="track-lookup-form" onSubmit={lookupTrackingOrder}>
                      <label>Order number<input name="orderNumber" autoComplete="off" placeholder="ZEE-…" required /></label>
                      <label>Phone number<input name="phone" type="tel" autoComplete="tel" required /></label>
                      <button className="button button-primary" type="submit">Find my order <ArrowIcon /></button>
                    </form>
                  </>
                ) : (
                  <>
                    <h2>No order to track yet.</h2>
                    <p>Once you place an order, its progress will appear here.</p>
                    <button className="button button-primary" type="button" onClick={() => navigateTo('home')}>
                      Browse the menu <ArrowIcon />
                    </button>
                  </>
                )}
              </div>
            )}
            {useLocalDemo && <p className="tracking-demo-note">Tracking updates are saved in this browser for this demo. Shared live updates require a restaurant ordering system.</p>}
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand-block">
            <Brand footer />
            <p>Good food for good days.<br />And the days that need a little help.</p>
          </div>
          <div className="footer-links">
            <div><strong>COME ON IN</strong><a href="#menu">The menu</a><button type="button" onClick={() => navigateTo('about')}>About us</button><button type="button" onClick={() => navigateTo('contact')}>Contact</button><a href="#order">Delivery info</a><button type="button" onClick={() => navigateTo('tracking')}>Track order</button><button type="button" onClick={() => navigateTo('admin')}>{useLocalDemo ? 'Admin demo' : 'Admin sign in'}</button></div>
            <div><strong>FIND US</strong><span>Everywhere good food is needed.</span><a href="mailto:sultanabdulwaheed382@gmail.com">Email us ↗</a><a href="tel:+2349065974857">09065974857</a></div>
          </div>
          <div className="footer-cta"><span>Hungry yet?</span><a href="#menu">Order something lovely <ArrowIcon /></a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 ZeeTummyLab. Made with extra love.</span><a href="/image-credits.html">Food photo credits</a><span>GOOD FOOD. GOOD MOOD. NO BAD DAYS.</span></div>
      </footer>
    </>
  )
}

export default App
