import { Check } from 'lucide-react';
import React from 'react';

export const VerifiedBadge:React.FC = () => (
  <div className="relative group inline-block ml-1">
    {/* Badge */}
    <span
      className="inline-flex items-center justify-center w-5 h-5 text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"
    >
      <Check className="w-3 h-3 text-white" strokeWidth={3} />
    </span>

    {/* Tooltip */}
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
      Verified User
    </div>
  </div>
);
