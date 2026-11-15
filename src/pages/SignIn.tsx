import SignInForm from '@/components/signIn/SignInForm'

/** Printer's crop marks: four L-shaped corner ticks, as on a press sheet. */
const CropMarks = ({ className = '' }: { className?: string }) => (
  <div aria-hidden className={`pointer-events-none absolute ${className}`}>
    <span className='absolute -top-px -left-px h-4 w-4 border-t border-l border-current' />
    <span className='absolute -top-px -right-px h-4 w-4 border-t border-r border-current' />
    <span className='absolute -bottom-px -left-px h-4 w-4 border-b border-l border-current' />
    <span className='absolute -right-px -bottom-px h-4 w-4 border-r border-b border-current' />
  </div>
)

const BrandMark = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <span className='flex h-10 w-10 bg-[hsl(42_50%_96.1%)] shrink-0 items-center justify-center'>
      <img src='/images/favicon.svg' alt='' className='h-7 w-7' />
    </span>
    <span className='leading-tight'>
      <span className='font-display block text-lg font-semibold'>Barnick Pracharani</span>
      <span className='block text-xs tracking-[0.18em] uppercase opacity-70'>
        Operations Console
      </span>
    </span>
  </div>
)

// Same facts the public website states.
const highlights = [
  { value: '১৯৮৯', label: 'থেকে পুরান ঢাকায়' },
  { value: '১–৩ দিন', label: 'ডেলিভারি' },
  { value: 'সারা দেশে', label: 'কুরিয়ার' },
]

const SignIn = () => {
  const year = new Date().getFullYear()

  return (
    <div className='bg-background grid min-h-svh lg:grid-cols-[1.1fr_1fr]'>
      {/* Brand panel: always ink, in both themes; ink surface with editorial headline (desktop only) */}
      <aside className='relative border-border bg-[hsl(0_0%_6.7%)] text-[hsl(41_40%_92.2%)] dark:border-r hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16'>
        {/* Halftone dot texture */}
        <div
          aria-hidden
          className='absolute inset-0 opacity-[0.07]'
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />
        {/* Orange registration bar */}
        <div aria-hidden className='bg-primary absolute top-0 left-0 h-1.5 w-1/3' />

        <BrandMark className='relative' />

        <div className='relative max-w-xl'>
          <p className='text-primary-hover mb-6 flex items-center gap-3 text-sm font-medium tracking-wide'>
            <span className='bg-primary-hover h-px w-10' />
            এনালগ ১৯৮৯ থেকে AI যুগে
          </p>
          <h2 className='text-4xl leading-[1.15] font-semibold [text-wrap:balance] xl:text-5xl'>
            প্রিন্টিং, প্যাকেজিং ও ব্র্যান্ডিং{' '}
            <span className='text-primary-hover'>সহজ, দ্রুত, নির্ভরযোগ্য।</span>
          </h2>
          <p className='mt-6 max-w-md text-base leading-relaxed opacity-70'>
            Work orders, billing, inventory and reports for the press floor, all
            in one place.
          </p>
        </div>

        <dl className='relative grid grid-cols-3 gap-6 border-t border-current/15 pt-8'>
          {highlights.map((item) => (
            <div key={item.value}>
              <dt className='font-display text-2xl font-semibold'>{item.value}</dt>
              <dd className='mt-1 text-sm opacity-60'>{item.label}</dd>
            </div>
          ))}
        </dl>
      </aside>

      {/* Form panel */}
      <main className='relative flex flex-col px-4 py-8 sm:px-8 lg:px-12'>
        <BrandMark className='text-foreground lg:hidden' />

        <div className='flex flex-1 items-center justify-center py-10'>
          <div className='relative w-full max-w-sm p-6 sm:p-8'>
            <CropMarks className='text-muted-foreground/50 inset-0' />

            <p className='text-primary mb-3 text-xs font-semibold tracking-[0.2em] uppercase'>
              Staff sign in
            </p>
            <h1 className='text-3xl tracking-tight'>Welcome back</h1>
            <p className='text-muted-foreground mt-2 mb-8 text-sm'>
              Sign in with your work email to continue.
            </p>

            <SignInForm />
          </div>
        </div>

        <footer className='text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs'>
          <span>© {year} Barnick Pracharani</span>
          <a
            href='https://barnickpracharani.com'
            target='_blank'
            rel='noreferrer'
            className='hover:text-foreground underline-offset-4 hover:underline'
          >
            barnickpracharani.com
          </a>
        </footer>
      </main>
    </div>
  )
}

export default SignIn
