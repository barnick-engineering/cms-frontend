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

/** Logo-aligned palette for exportable billing documents */
export const BRAND_COLORS = {
  primary: '#074581',
  primaryDark: '#1e4e6c',
  accent: '#ff8c42',
  primaryLight: '#e8f3f8',
  accentLight: '#fff4eb',
} as const
