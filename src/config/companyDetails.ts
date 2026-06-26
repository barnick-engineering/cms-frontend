export const COMPANY_DETAILS = {
  name: import.meta.env.VITE_COMPANY_NAME || 'Barnick Pracharani',
  tagline: 'Where Ideas Come to Print Perfection!',
  phone: import.meta.env.VITE_COMPANY_PHONE || '+8801712347097',
  phoneSecondary:
    import.meta.env.VITE_COMPANY_PHONE_SECONDARY || '+88 018 4156 8145',
  email: import.meta.env.VITE_COMPANY_EMAIL || 'pracharanibarnick@gmail.com',
  address:
    import.meta.env.VITE_COMPANY_ADDRESS ||
    'Dhaka, Bangladesh',
}

export const DEFAULT_BANK_DETAILS = {
  bank_name: import.meta.env.VITE_BANK_NAME || 'Bank Asia',
  account_name: import.meta.env.VITE_BANK_ACCOUNT_NAME || 'Barnick Pracharani',
  account_number: import.meta.env.VITE_BANK_ACCOUNT_NUMBER || '63133000181',
  branch: import.meta.env.VITE_BANK_BRANCH || 'Rampura branch, dhaka',
  routing_number: import.meta.env.VITE_BANK_ROUTING_NUMBER || '070263914',
} as const

export const DEFAULT_MFS_DETAILS = {
  mfs_provider: import.meta.env.VITE_MFS_PROVIDER || 'Bkash',
  mfs_number: import.meta.env.VITE_MFS_NUMBER || '+8801671737258',
} as const

/** Logo-aligned palette for exportable billing documents */
export const BRAND_COLORS = {
  primary: '#074581',
  primaryDark: '#1e4e6c',
  accent: '#ff8c42',
  primaryLight: '#e8f3f8',
  accentLight: '#fff4eb',
} as const
