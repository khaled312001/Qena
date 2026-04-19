import {
  Hospital, Pill, Stethoscope, BedDouble, Utensils, Coffee,
  ShoppingBag, Bus, Landmark, GraduationCap, Fuel, MapPin,
  Scissors, School,
} from 'lucide-react';

export const ICON_MAP = {
  Hospital, Pill, Stethoscope, BedDouble, Utensils, Coffee,
  ShoppingBag, Bus, Landmark, GraduationCap, Fuel, MapPin,
  Scissors, School,
};

export function Icon({ name, className = 'w-5 h-5', ...rest }) {
  const C = ICON_MAP[name] || MapPin;
  return <C className={className} {...rest} />;
}
