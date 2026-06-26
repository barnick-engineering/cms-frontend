import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Combobox } from '@/components/ui/combobox'
import { DatePicker } from '@/components/date-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCustomerList } from '@/hooks/useCustomer'
import { useWorkOrderList } from '@/hooks/useWorkOrder'
import type {
  BillingDocumentFormPayload,
  BillingDocumentType,
  BillingLineItem,
} from '@/interface/billingInterface'
import {
  BILLING_DOCUMENT_TYPE_LABELS,
  DEFAULT_QUOTATION_TERMS,
  defaultBillingBankFields,
  defaultBillingMfsFields,
  emptyBillingLineItem,
} from '@/interface/billingInterface'
import { formatDateToString, parseDateString } from '@/lib/loanDateUtils'

type BillingDocumentFormProps = {
  form: BillingDocumentFormPayload
  onChange: (next: BillingDocumentFormPayload) => void
  onPrefill: (customerId?: number | null, workOrderId?: number | null) => void
  prefillLoading?: boolean
}

export function BillingDocumentForm({
  form,
  onChange,
  onPrefill,
  prefillLoading,
}: BillingDocumentFormProps) {
  const [customerSearch, setCustomerSearch] = useState('')
  const { data: customersData, isLoading: customersLoading } = useCustomerList(
    customerSearch || undefined,
    100,
    0
  )
  const customerOptions = useMemo(
    () =>
      (customersData?.data || []).map((c) => ({
        value: String(c.id),
        label: c.name,
      })),
    [customersData]
  )

  const { data: workOrdersData, isLoading: workOrdersLoading } = useWorkOrderList(
    {
      customer_id: form.customer_id ?? undefined,
      limit: 100,
      offset: 0,
    },
    { enabled: !!form.customer_id }
  )
  const workOrderOptions = useMemo(
    () =>
      (workOrdersData?.data || []).map((wo) => ({
        value: String(wo.id),
        label: wo.no,
      })),
    [workOrdersData]
  )

  const update = (patch: Partial<BillingDocumentFormPayload>) => {
    onChange({ ...form, ...patch })
  }

  const updateLineItem = (index: number, patch: Partial<BillingLineItem>) => {
    const lineItems = [...(form.line_items ?? [])]
    lineItems[index] = { ...lineItems[index], ...patch }
    update({ line_items: lineItems })
  }

  const addLineItem = () => {
    update({
      line_items: [...(form.line_items ?? []), emptyBillingLineItem()],
    })
  }

  const removeLineItem = (index: number) => {
    const lineItems = [...(form.line_items ?? [])]
    if (lineItems.length <= 1) return
    lineItems.splice(index, 1)
    update({ line_items: lineItems })
  }

  const handleTypeChange = (type: BillingDocumentType) => {
    update({
      document_type: type,
      terms: type === 'quotation' ? DEFAULT_QUOTATION_TERMS : null,
    })
  }

  const showPricing = form.document_type !== 'delivery_challan'

  return (
    <Card className="billing-no-print">
      <CardHeader>
        <CardTitle>Document Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select
              value={form.document_type}
              onValueChange={(v) => handleTypeChange(v as BillingDocumentType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(BILLING_DOCUMENT_TYPE_LABELS) as BillingDocumentType[]).map(
                  (type) => (
                    <SelectItem key={type} value={type}>
                      {BILLING_DOCUMENT_TYPE_LABELS[type]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Document Number</Label>
            <Input
              value={form.document_number ?? ''}
              onChange={(e) => update({ document_number: e.target.value })}
              placeholder="Auto-generated if empty"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Customer (optional)</Label>
            <Combobox
              options={customerOptions}
              value={form.customer_id ? String(form.customer_id) : ''}
              onSelect={(v) => {
                const customerId = v ? Number(v) : null
                update({ customer_id: customerId, work_order_id: null })
                if (customerId) onPrefill(customerId, null)
              }}
              onSearch={setCustomerSearch}
              placeholder="Select customer..."
              emptyMessage="No customers found"
              loading={customersLoading || prefillLoading}
            />
          </div>
          <div className="space-y-2">
            <Label>Work Order (optional)</Label>
            <Combobox
              options={workOrderOptions}
              value={form.work_order_id ? String(form.work_order_id) : ''}
              onSelect={(v) => {
                const workOrderId = v ? Number(v) : null
                update({ work_order_id: workOrderId })
                if (workOrderId) onPrefill(form.customer_id, workOrderId)
              }}
              placeholder={
                form.customer_id ? 'Select work order...' : 'Select customer first'
              }
              emptyMessage="No work orders found"
              loading={workOrdersLoading || prefillLoading}
              disabled={!form.customer_id}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Recipient</Label>
          <Input
            value={form.recipient ?? ''}
            onChange={(e) => update({ recipient: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input
            value={form.subject ?? ''}
            onChange={(e) => update({ subject: e.target.value })}
            placeholder="Invoice subject"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea
              value={form.address ?? ''}
              onChange={(e) => update({ address: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={form.phone ?? ''}
              onChange={(e) => update({ phone: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Date</Label>
            <DatePicker
              selected={
                form.document_date
                  ? parseDateString(form.document_date)
                  : undefined
              }
              onSelect={(d) =>
                update({
                  document_date: d ? formatDateToString(d) : null,
                })
              }
              allowFuture
            />
          </div>
          {form.document_type === 'invoice' && (
            <div className="space-y-2">
              <Label>Advance Payment</Label>
              <Input
                type="number"
                value={form.advance_payment ?? 0}
                onChange={(e) =>
                  update({ advance_payment: Number(e.target.value) || 0 })
                }
              />
            </div>
          )}
        </div>

        <div>
          <Label className="mb-2 block">
            Line Items{' '}
            <span className="text-sm font-normal text-muted-foreground">
              (For best results, limit to 5 items per page)
            </span>
          </Label>
          <div className="space-y-4">
            {(form.line_items ?? []).map((item, index) => (
              <div
                key={index}
                className="grid gap-3 border-b pb-4 sm:grid-cols-12 items-end"
              >
                <div className="sm:col-span-3 space-y-1">
                  <Label className="text-xs">Product</Label>
                  <Input
                    value={item.product}
                    onChange={(e) =>
                      updateLineItem(index, { product: e.target.value })
                    }
                    placeholder="Product name"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateLineItem(index, { description: e.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) =>
                      updateLineItem(index, {
                        quantity: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                {showPricing && (
                  <>
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs">Rate</Label>
                      <Input
                        type="number"
                        value={item.rate || ''}
                        onChange={(e) =>
                          updateLineItem(index, {
                            rate: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="sm:col-span-1 flex items-end pb-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLineItem(index)}
                        disabled={(form.line_items?.length ?? 0) <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
                {!showPricing && (
                  <div className="sm:col-span-1 flex items-end pb-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(index)}
                      disabled={(form.line_items?.length ?? 0) <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addLineItem}>
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {showPricing && (
          <>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="show-totals">Show subtotal &amp; total</Label>
                <p className="text-xs text-muted-foreground">
                  Turn off to hide the totals block on the exported document
                </p>
              </div>
              <Switch
                id="show-totals"
                checked={form.show_totals !== false}
                onCheckedChange={(checked) => update({ show_totals: checked })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Delivery Cost</Label>
              <Input
                type="number"
                value={form.delivery_cost ?? 0}
                onChange={(e) =>
                  update({ delivery_cost: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Discount</Label>
              <Input
                type="number"
                value={form.discount ?? 0}
                onChange={(e) => update({ discount: Number(e.target.value) || 0 })}
              />
            </div>
            </div>
          </>
        )}

        {form.document_type === 'invoice' && (
          <>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="show-bank-details">Show bank details</Label>
                <p className="text-xs text-muted-foreground">
                  Display payment bank information on the invoice
                </p>
              </div>
              <Switch
                id="show-bank-details"
                checked={form.show_bank_details === true}
                onCheckedChange={(checked) => {
                  const patch: Partial<BillingDocumentFormPayload> = {
                    show_bank_details: checked,
                  }
                  if (checked && !form.bank_name) {
                    Object.assign(patch, defaultBillingBankFields())
                  }
                  update(patch)
                }}
              />
            </div>
            {form.show_bank_details && (
              <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Bank</Label>
                  <Input
                    value={form.bank_name ?? ''}
                    onChange={(e) => update({ bank_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input
                    value={form.bank_account_name ?? ''}
                    onChange={(e) => update({ bank_account_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    value={form.bank_account_number ?? ''}
                    onChange={(e) => update({ bank_account_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Input
                    value={form.bank_branch ?? ''}
                    onChange={(e) => update({ bank_branch: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Routing Number</Label>
                  <Input
                    value={form.bank_routing_number ?? ''}
                    onChange={(e) => update({ bank_routing_number: e.target.value })}
                  />
                </div>
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="show-mfs-details">Show MFS (Bkash) details</Label>
                <p className="text-xs text-muted-foreground">
                  Display mobile financial service payment info on the invoice
                </p>
              </div>
              <Switch
                id="show-mfs-details"
                checked={form.show_mfs_details === true}
                onCheckedChange={(checked) => {
                  const patch: Partial<BillingDocumentFormPayload> = {
                    show_mfs_details: checked,
                  }
                  if (checked && !form.mfs_number) {
                    Object.assign(patch, defaultBillingMfsFields())
                  }
                  update(patch)
                }}
              />
            </div>
            {form.show_mfs_details && (
              <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>MFS Provider</Label>
                  <Input
                    value={form.mfs_provider ?? ''}
                    onChange={(e) => update({ mfs_provider: e.target.value })}
                    placeholder="Bkash"
                  />
                </div>
                <div className="space-y-2">
                  <Label>MFS Number</Label>
                  <Input
                    value={form.mfs_number ?? ''}
                    onChange={(e) => update({ mfs_number: e.target.value })}
                    placeholder="+8801671737258"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {form.document_type === 'quotation' && (
          <div className="space-y-2">
            <Label>Terms & Conditions</Label>
            <Textarea
              value={form.terms ?? ''}
              onChange={(e) => update({ terms: e.target.value })}
              rows={4}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
