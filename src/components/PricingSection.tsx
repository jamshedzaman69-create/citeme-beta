import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PricingCard } from './PricingCard';
import { Zap, Shield, Crown } from 'lucide-react';

export function PricingSection() {
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (priceId: string) => {
    setLoading(true);
    try {
      // Get session to ensure we are targeting the local instance
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Please sign in to upgrade.");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId, 
          userId: session.user.id, 
          userEmail: session.user.email 
        }
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      console.error("Checkout Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <PricingCard 
          name="Weekly" 
          price="2.50" 
          period="week" 
          features={["3-Day Free Trial", "AI Access", "Unlimited Documents", "Citations Generator"]} 
          onSelect={() => handleUnlock(import.meta.env.VITE_STRIPE_WEEKLY_PRICE_ID)} 
        />
        <PricingCard 
          name="Monthly" 
          price="7.99" 
          period="month" 
          popular
          features={["3-Day Free Trial", "Everything in Weekly", "Advanced AI features", "Priority Support"]} 
          onSelect={() => handleUnlock(import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID)} 
        />
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}