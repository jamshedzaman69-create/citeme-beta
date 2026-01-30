import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

// SubtleCrypto is required for Deno environment signature verification
const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  // Switch back to Env variable for production, or keep hardcoded if Env is failing
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  try {
    const body = await req.text()
    
    // Verify the event came from Stripe
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )

    console.log(`🔔 Event Received: ${event.type}`)

    // Handle successful payments and trials
    if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
      const session = event.data.object as any
      const userId = session.client_reference_id || session.metadata?.supabase_user_id

      if (!userId) {
        console.error("❌ No userId found in metadata or client_reference_id")
        return new Response('No User ID', { status: 200 })
      }

      // Retrieve subscription to get Price ID and Expiry Date
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      const priceId = subscription.items.data[0].price.id
      
      const weeklyId = Deno.env.get('VITE_STRIPE_WEEKLY_PRICE_ID')
      const monthlyId = Deno.env.get('VITE_STRIPE_MONTHLY_PRICE_ID')

      // Determine Interval
      let interval = 'month' 
      if (priceId === weeklyId) {
        interval = 'week'
      } else if (priceId === monthlyId) {
        interval = 'month'
      }

      console.log(`✅ User ${userId} paid for ${interval}ly plan. Price ID: ${priceId}`)

      // Update Database
      const { error } = await supabaseClient
        .from('profiles')
        .update({ 
          subscription_status: 'active',
          subscription_interval: interval,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_customer_id: session.customer,
          subscription_id: session.subscription,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (error) {
        console.error("❌ Database Error:", error.message)
        throw error
      }
      
      console.log(`🎉 Successfully updated profile for ${userId}`)
    }

    // Handle Cancellations
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any
      await supabaseClient
        .from('profiles')
        .update({ subscription_status: 'canceled' })
        .eq('subscription_id', subscription.id)
      console.log(`🚫 Subscription ${subscription.id} canceled.`)
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    })

  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})