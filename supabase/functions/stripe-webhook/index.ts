import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') as string,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') as string
    )

    switch (event.type) {
      // 1. Initial Signup (Trial Starts)
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.client_reference_id
        
        await supabaseClient
          .from('profiles')
          .update({ 
            subscription_status: 'active',
            stripe_customer_id: session.customer,
            // Store interval to show "Weekly" or "Monthly" in UI
          })
          .eq('id', userId)
        break
      }

      // 2. Cancellation (Trial Ends or User Unsubscribes)
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        
        await supabaseClient
          .from('profiles')
          .update({ subscription_status: 'inactive' })
          .eq('stripe_customer_id', subscription.customer)
        break
      }

      // 3. Payment Fails (Subscription lapses)
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        
        await supabaseClient
          .from('profiles')
          .update({ subscription_status: 'inactive' })
          .eq('stripe_customer_id', invoice.customer)
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})