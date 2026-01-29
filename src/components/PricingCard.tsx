import { Check } from 'lucide-react';

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  onSelect?: () => void; // Add this line to the interface
}

export function PricingCard({ 
  name, 
  price, 
  period, 
  features, 
  popular, 
  onSelect // Destructure onSelect here
}: PricingCardProps) {
  return (
    <div className={`relative bg-white rounded-2xl shadow-lg p-8 ${popular ? 'ring-2 ring-blue-600' : 'border border-gray-200'}`}>
      {popular && (
        <div className="absolute top-0 right-8 -translate-y-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gray-900">${price}</span>
          <span className="text-gray-600">/ {period}</span>
        </div>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <button 
        onClick={onSelect} 
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          popular 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        Get Started
      </button>
    </div>
  );
}