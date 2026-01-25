import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PricingCard } from './PricingCard';
import { Zap, Shield, Crown } from 'lucide-react';

export function PricingSection() {
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (priceId: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, userId: user.id, userEmail: user.email }
      });
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Mini Feature List */}
      <div className="flex flex-wrap justify-center gap-4 text-slate-600">
        {[
          { icon: Zap, label: "Unlimited AI Assist" },
          { icon: Shield, label: "Academic Citations" },
          { icon: Crown, label: "Cloud Syncing" }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 text-xs font-medium shadow-sm">
            <item.icon className="w-3 h-3 text-blue-500" />
            {item.label}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="transform transition-all hover:scale-[1.01]">
          <PricingCard 
            name="Weekly" 
            price="2.50" 
            period="week" 
            features={["3-Day Free Trial", "Full AI Access", "Academic Citations"]} 
            onSelect={() => handleUnlock('price_1Rps0cL8ugzqmcpsuB2b156s')} 
          />
        </div>
        <div className="transform transition-all hover:scale-[1.01]">
          <PricingCard 
            name="Monthly" 
            price="7.00" 
            period="month" 
            popular 
            features={["3-Day Free Trial", "Best Student Value", "Priority Support"]} 
            onSelect={() => handleUnlock('price_1Rps11L8ugzqmcpsJsXf1PB2')} 
          />
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-[100]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-[10px] font-bold text-slate-900 uppercase tracking-tighter">Initializing Secure Checkout...</p>
        </div>
      )}
    </div>
  );
}