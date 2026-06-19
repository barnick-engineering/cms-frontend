import { createRoot } from 'react-dom/client'
import { BillingDocumentPreview } from '@/components/billing/BillingDocumentPreview'
import type { BillingDocumentFormPayload } from '@/interface/billingInterface'
import { printBillingPreview } from '@/lib/billing/billingPrint'

/** Render a billing document off-screen and open the print / PDF dialog. */
export async function printBillingDocument(data: BillingDocumentFormPayload) {
  const mount = document.createElement('div')
  mount.setAttribute('aria-hidden', 'true')
  mount.style.cssText =
    'position:fixed;left:-10000px;top:0;width:210mm;pointer-events:none;visibility:hidden;'
  document.body.appendChild(mount)

  const root = createRoot(mount)
  root.render(<BillingDocumentPreview data={data} />)

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        try {
          await printBillingPreview(mount)
        } finally {
          root.unmount()
          mount.remove()
          resolve()
        }
      })
    })
  })
}
