import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Stripe with the Fetch API for Deno compatibility
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

// Initialize the SubtleCryptoProvider to fix the synchronous context error
const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  try {
    const body = await req.text()
    
    // Use constructEventAsync with the cryptoProvider
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )

    console.log(`🔔 Webhook received: ${event.type}`)

    // Handle both checkout.session.completed and invoice.paid for trials
    if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
      const session = event.data.object
      
      // Get the userId from client_reference_id (set during checkout creation)
      // If invoice.paid, the ID might be in customer_details or metadata
      const userId = session.client_reference_id || session.metadata?.supabase_user_id

      if (!userId) {
        console.error("❌ No userId found in session metadata or client_reference_id")
        return new Response('No User ID found', { status: 200 }) // Return 200 to stop Stripe retries if logic error
      }

      console.log(`✅ Updating subscription for User: ${userId}`)

      const { error } = await supabaseClient
        .from('profiles')
        .update({ 
          subscription_status: 'active',
          stripe_customer_id: session.customer,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (error) {
        console.error(`❌ Database Update Error: ${error.message}`)
        throw error
      }
      
      console.log(`🎉 Profile successfully updated for ${userId}`)
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