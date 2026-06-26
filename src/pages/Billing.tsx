import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { BillingDocumentForm } from '@/components/billing/BillingDocumentForm'
import { BillingDocumentList } from '@/components/billing/BillingDocumentList'
import { BillingDocumentPreview } from '@/components/billing/BillingDocumentPreview'
import {
  useBillingDocumentById,
  useBillingDocumentList,
  useCreateBillingDocument,
  useDeleteBillingDocument,
  useFinalizeBillingDocument,
  usePrefillBillingDocument,
  useUpdateBillingDocument,
} from '@/hooks/useBilling'
import type {
  BillingDocumentFormPayload,
  BillingDocumentListParams,
  BillingDocumentType,
} from '@/interface/billingInterface'
import { emptyBillingDocument, getDefaultBillingListFilters } from '@/interface/billingInterface'
import { exportBillingPreview } from '@/lib/billing/billingPdfExport'
import { isMobileExport } from '@/lib/billing/billingExportUtils'
import { ArrowLeft, Printer, Save, Trash2 } from 'lucide-react'

const Billing = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const previewRef = useRef<HTMLDivElement>(null)

  const docIdParam = searchParams.get('id')
  const customerIdParam = searchParams.get('customer_id')
  const workOrderIdParam = searchParams.get('work_order_id')
  const typeParam = searchParams.get('type') as BillingDocumentType | null

  const [mode, setMode] = useState<'list' | 'edit'>(docIdParam ? 'edit' : 'list')
  const [editingId, setEditingId] = useState<number | null>(
    docIdParam ? Number(docIdParam) : null
  )
  const [form, setForm] = useState<BillingDocumentFormPayload>(
    emptyBillingDocument(typeParam ?? 'invoice')
  )
  const [listFilters, setListFilters] = useState<BillingDocumentListParams>(
    getDefaultBillingListFilters
  )

  const { data: listData, isLoading: listLoading } = useBillingDocumentList(listFilters, {
    enabled: mode === 'list',
  })
  const { data: existingDoc } = useBillingDocumentById(editingId ?? 0, {
    enabled: !!editingId,
  })

  const createMutation = useCreateBillingDocument()
  const updateMutation = useUpdateBillingDocument()
  const deleteMutation = useDeleteBillingDocument()
  const finalizeMutation = useFinalizeBillingDocument()
  const prefillMutation = usePrefillBillingDocument()

  useEffect(() => {
    if (existingDoc && editingId) {
      setForm({
        document_type: existingDoc.document_type,
        document_status: existingDoc.document_status,
        document_number: existingDoc.document_number,
        recipient: existingDoc.recipient,
        subject: existingDoc.subject,
        address: existingDoc.address,
        phone: existingDoc.phone,
        document_date: existingDoc.document_date,
        customer_id: existingDoc.customer_id,
        work_order_id: existingDoc.work_order_id,
        delivery_cost: existingDoc.delivery_cost,
        discount: existingDoc.discount,
        advance_payment: existingDoc.advance_payment,
        show_totals: existingDoc.show_totals,
        show_bank_details: existingDoc.show_bank_details ?? false,
        bank_name: existingDoc.bank_name ?? undefined,
        bank_account_name: existingDoc.bank_account_name ?? undefined,
        bank_account_number: existingDoc.bank_account_number ?? undefined,
        bank_branch: existingDoc.bank_branch ?? undefined,
        bank_routing_number: existingDoc.bank_routing_number ?? undefined,
        show_mfs_details: existingDoc.show_mfs_details ?? false,
        mfs_provider: existingDoc.mfs_provider ?? undefined,
        mfs_number: existingDoc.mfs_number ?? undefined,
        terms: existingDoc.terms,
        line_items: existingDoc.line_items.map(({ product, description, quantity, rate }) => ({
          product,
          description,
          quantity: Number(quantity),
          rate: Number(rate),
        })),
      })
    }
  }, [existingDoc, editingId])

  const runDeepLinkPrefill = useCallback(async () => {
    if (docIdParam) return
    const documentType = typeParam ?? 'invoice'
    const customerId = customerIdParam ? Number(customerIdParam) : null
    const workOrderId = workOrderIdParam ? Number(workOrderIdParam) : null
    if (!customerId && !workOrderId) return

    setMode('edit')
    try {
      const data = await prefillMutation.mutateAsync({
        document_type: documentType,
        customer_id: customerId,
        work_order_id: workOrderId,
      })
      setForm(data)
    } catch {
      setForm(emptyBillingDocument(documentType))
    }
  }, [
    customerIdParam,
    docIdParam,
    prefillMutation,
    typeParam,
    workOrderIdParam,
  ])

  useEffect(() => {
    if (customerIdParam || workOrderIdParam) {
      void runDeepLinkPrefill()
    }
  }, [customerIdParam, workOrderIdParam, runDeepLinkPrefill])

  const handlePrefill = async (
    customerId?: number | null,
    workOrderId?: number | null
  ) => {
    if (!customerId && !workOrderId) return
    const data = await prefillMutation.mutateAsync({
      document_type: form.document_type,
      customer_id: customerId ?? form.customer_id,
      work_order_id: workOrderId ?? null,
    })
    setForm((prev) => ({ ...data, document_type: prev.document_type }))
  }

  const handleSaveDraft = async () => {
    const payload = { ...form, document_status: 'draft' as const }
    if (editingId) {
      const updated = await updateMutation.mutateAsync({ id: editingId, data: payload })
      setEditingId(updated.id)
    } else {
      const created = await createMutation.mutateAsync(payload)
      setEditingId(created.id)
      setSearchParams({ id: String(created.id) })
    }
  }

  const handleFinalize = async () => {
    if (!editingId) {
      const created = await createMutation.mutateAsync({
        ...form,
        document_status: 'draft',
      })
      setEditingId(created.id)
      await finalizeMutation.mutateAsync(created.id)
      setSearchParams({ id: String(created.id) })
      return
    }
    await updateMutation.mutateAsync({ id: editingId, data: form })
    await finalizeMutation.mutateAsync(editingId)
  }

  const handlePrint = async () => {
    await exportBillingPreview(previewRef.current, form)
  }

  const handleDelete = async () => {
    if (!editingId) return
    if (!window.confirm('Delete this document?')) return
    await deleteMutation.mutateAsync(editingId)
    handleBackToList()
  }

  const handleBackToList = () => {
    setMode('list')
    setEditingId(null)
    setForm(emptyBillingDocument('invoice'))
    setSearchParams({})
  }

  const handleCreateNew = () => {
    setEditingId(null)
    setForm(emptyBillingDocument('invoice'))
    setMode('edit')
    setSearchParams({})
  }

  const handleSelectDocument = (doc: { id: number }) => {
    setEditingId(doc.id)
    setMode('edit')
    setSearchParams({ id: String(doc.id) })
  }

  const generateLabel =
    form.document_type === 'invoice'
      ? 'Invoice'
      : form.document_type === 'delivery_challan'
        ? 'Challan'
        : 'Quotation'

  return (
    <Main fluid className="min-w-0">
      <div className="mb-4 billing-no-print">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Create invoices, quotations, and delivery challans
        </p>
      </div>

      {mode === 'list' ? (
        <BillingDocumentList
          documents={listData?.data ?? []}
          total={listData?.total ?? 0}
          filters={listFilters}
          onFiltersChange={setListFilters}
          onSelect={handleSelectDocument}
          onCreate={handleCreateNew}
          isLoading={listLoading}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2 billing-no-print">
            <Button variant="ghost" size="sm" onClick={handleBackToList}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to list
            </Button>
            <div className="flex-1" />
            {editingId && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Save className="mr-1 h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFinalize}
              disabled={finalizeMutation.isPending}
            >
              Finalize {generateLabel}
            </Button>
            <Button size="sm" onClick={handlePrint}>
              <Printer className="mr-1 h-4 w-4" />
              {isMobileExport() ? `Download ${generateLabel}` : `Generate ${generateLabel}`}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 print:grid-cols-1 print:gap-0">
            <BillingDocumentForm
              form={form}
              onChange={setForm}
              onPrefill={handlePrefill}
              prefillLoading={prefillMutation.isPending}
            />
            <div ref={previewRef} className="min-w-0 w-full print:w-full">
              <BillingDocumentPreview data={form} />
            </div>
          </div>
        </>
      )}
    </Main>
  )
}

export default Billing
