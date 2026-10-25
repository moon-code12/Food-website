import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)
export const useLocalDemo = import.meta.env.DEV && !isSupabaseConfigured

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function mapDatabaseOrder(order) {
  return {
    id: order.order_number,
    name: order.customer_name,
    phone: order.customer_phone,
    address: order.delivery_address,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    items: (order.order_items ?? order.items ?? []).map((item) => ({
      id: item.menu_item_id,
      name: item.name,
      quantity: item.quantity,
      price: item.unit_price,
    })),
    subtotal: order.subtotal,
    deliveryFee: order.delivery_fee,
    total: order.total,
    status: order.status,
    createdAt: order.created_at,
  }
}
