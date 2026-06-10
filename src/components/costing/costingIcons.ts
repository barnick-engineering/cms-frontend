import {
  Calculator,
  CreditCard,
  FileText,
  Package,
  Receipt,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Receipt,
  Package,
  Calculator,
  CreditCard,
}

export function getCostingIcon(name: string): LucideIcon {
  return iconMap[name] ?? Calculator
}
