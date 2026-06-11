import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  Download,
  Plus,
  RotateCcw,
  Settings2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { CostingItem, CalculatorType } from '@/interface/costingInterface'
import { cn } from '@/lib/utils'
import { useCostingConfigStore } from '@/stores/costingConfigStore'

type CostingConfigDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ConfigSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-3', className)}>
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4 rounded-lg border bg-muted/30 p-4">{children}</div>
    </section>
  )
}

function ConfigField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {hint && (
        <p className="text-xs text-muted-foreground leading-relaxed">{hint}</p>
      )}
      {children}
    </div>
  )
}

export function CostingConfigDrawer({
  open,
  onOpenChange,
}: CostingConfigDrawerProps) {
  const {
    config,
    updateItem,
    addItem,
    removeItem,
    addCategory,
    exportConfigJson,
    importConfigJson,
    resetToDefaults,
  } = useCostingConfigStore()

  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedItemId, setSelectedItemId] = useState(
    config.items[0]?.id ?? ''
  )
  const [newCategoryTitle, setNewCategoryTitle] = useState('')
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemType, setNewItemType] = useState<CalculatorType>('custom')
  const [newItemCategoryId, setNewItemCategoryId] = useState(
    config.categories[0]?.id ?? ''
  )
  const [ratesJson, setRatesJson] = useState('')
  const [addSectionsOpen, setAddSectionsOpen] = useState(false)

  const selectedItem = config.items.find((i) => i.id === selectedItemId)
  const itemsById = new Map(config.items.map((i) => [i.id, i]))

  useEffect(() => {
    if (open && selectedItem) {
      setRatesJson(JSON.stringify(selectedItem.rates ?? {}, null, 2))
    }
  }, [open, selectedItemId, selectedItem?.rates])

  const handleSelectItem = (id: string) => {
    setSelectedItemId(id)
  }

  const handleSaveRates = () => {
    if (!selectedItem) return
    try {
      const parsed = JSON.parse(ratesJson || '{}')
      if (typeof parsed !== 'object') throw new Error('Rates must be an object')
      updateItem(selectedItem.id, { rates: parsed })
      toast.success('Rates updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invalid rates JSON')
    }
  }

  const handleExport = () => {
    const blob = new Blob([exportConfigJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `costing-config-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Config exported')
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = importConfigJson(String(reader.result))
      if (result.ok) toast.success('Config imported')
      else toast.error(result.error)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleAddCategory = () => {
    if (!newCategoryTitle.trim()) return
    const id = newCategoryTitle.toLowerCase().replace(/\s+/g, '-')
    addCategory({
      id,
      title: newCategoryTitle.trim(),
      icon: 'Calculator',
      itemIds: [],
    })
    setNewCategoryTitle('')
    toast.success('Category added')
  }

  const handleAddItem = () => {
    if (!newItemTitle.trim() || !newItemCategoryId) return
    const id = newItemTitle.toLowerCase().replace(/\s+/g, '-')
    const item: CostingItem = {
      id,
      title: newItemTitle.trim(),
      calculatorType: newItemType,
      currency: 'BDT',
      rates: newItemType === 'custom' ? {} : undefined,
      fields:
        newItemType === 'custom'
          ? [
              {
                key: 'quantity',
                label: 'Quantity',
                type: 'number',
                defaultValue: 1000,
              },
              {
                key: 'profitMargin',
                label: 'Profit Margin %',
                type: 'number',
                defaultValue: 0,
              },
            ]
          : undefined,
      steps:
        newItemType === 'custom'
          ? [
              { key: 'baseCost', expression: 'inputs.quantity * rates.unitPrice' },
              {
                key: 'finalPrice',
                expression:
                  'steps.baseCost + (steps.baseCost * inputs.profitMargin) / 100',
              },
            ]
          : undefined,
      breakdown:
        newItemType === 'custom'
          ? [
              { key: 'baseCost', label: 'Base Cost' },
              { key: 'finalPrice', label: 'Final Price' },
            ]
          : undefined,
    }
    addItem(item, newItemCategoryId)
    setNewItemTitle('')
    toast.success('Item added')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-lg">
        <SheetHeader className="border-b px-4 pb-4 text-start sm:px-6">
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 shrink-0" />
            Costing Config
          </SheetTitle>
          <SheetDescription>
            Manage categories, products, and rate overrides. Changes are saved
            locally on this device.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4 sm:space-y-8 sm:px-6 sm:py-6">
          <ConfigSection
            title="Backup & restore"
            description="Export your config or import a saved JSON file."
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                className="w-full gap-2 bg-transparent"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 shrink-0" />
                Export JSON
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 bg-transparent"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-4 w-4 shrink-0" />
                Import JSON
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportFile}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-muted-foreground"
              onClick={() => {
                resetToDefaults()
                toast.success('Reset to defaults')
              }}
            >
              <RotateCcw className="h-4 w-4 shrink-0" />
              Reset to factory defaults
            </Button>
          </ConfigSection>

          <ConfigSection
            title="Edit item rates"
            description="Select a product and override its rate values as JSON."
          >
            <ConfigField label="Product">
              <Select value={selectedItemId} onValueChange={handleSelectItem}>
                <SelectTrigger className="h-10 w-full bg-background">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {config.categories.map((category) => (
                    <SelectGroup key={category.id}>
                      <SelectLabel>{category.title}</SelectLabel>
                      {category.itemIds.map((itemId) => {
                        const item = itemsById.get(itemId)
                        if (!item) return null
                        return (
                          <SelectItem key={itemId} value={itemId}>
                            {item.title}
                          </SelectItem>
                        )
                      })}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </ConfigField>

            {selectedItem && (
              <>
                <ConfigField
                  label="Rates JSON"
                  hint='Key-value overrides, e.g. {"sheetUnitPrice": 12}'
                >
                  <Textarea
                    rows={10}
                    value={ratesJson}
                    onChange={(e) => setRatesJson(e.target.value)}
                    placeholder='{"sheetUnitPrice": 12}'
                    className="min-h-40 w-full font-mono text-xs bg-background"
                  />
                </ConfigField>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    className="w-full sm:w-auto"
                    onClick={handleSaveRates}
                  >
                    Save rates
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      removeItem(selectedItem.id)
                      toast.success('Item removed')
                    }}
                  >
                    Delete item
                  </Button>
                </div>
              </>
            )}
          </ConfigSection>

          <Collapsible open={addSectionsOpen} onOpenChange={setAddSectionsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between gap-2 bg-transparent"
              >
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4 shrink-0" />
                  Add category or product
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 transition-transform',
                    addSectionsOpen && 'rotate-180'
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 pt-4">
              <ConfigSection
                title="New category"
                description="Group related products under a sidebar heading."
              >
                <ConfigField label="Category name">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={newCategoryTitle}
                      onChange={(e) => setNewCategoryTitle(e.target.value)}
                      placeholder="e.g. Visiting Cards"
                      className="h-10 w-full bg-background"
                    />
                    <Button
                      className="w-full shrink-0 sm:w-auto"
                      onClick={handleAddCategory}
                    >
                      Add category
                    </Button>
                  </div>
                </ConfigField>
              </ConfigSection>

              <ConfigSection
                title="New product"
                description="Add a calculator template to a category."
              >
                <div className="space-y-4">
                  <ConfigField label="Product name">
                    <Input
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      placeholder="e.g. Premium Visiting Card"
                      className="h-10 w-full bg-background"
                    />
                  </ConfigField>
                  <ConfigField label="Calculator template">
                    <Select
                      value={newItemType}
                      onValueChange={(v) => setNewItemType(v as CalculatorType)}
                    >
                      <SelectTrigger className="h-10 w-full bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visiting-card">
                          Visiting Card template
                        </SelectItem>
                        <SelectItem value="offset-memo">
                          Offset Memo template
                        </SelectItem>
                        <SelectItem value="custom">Custom formula</SelectItem>
                        <SelectItem value="stub">Coming soon stub</SelectItem>
                      </SelectContent>
                    </Select>
                  </ConfigField>
                  <ConfigField label="Category">
                    <Select
                      value={newItemCategoryId}
                      onValueChange={setNewItemCategoryId}
                    >
                      <SelectTrigger className="h-10 w-full bg-background">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {config.categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </ConfigField>
                  <Button className="w-full" onClick={handleAddItem}>
                    Add product
                  </Button>
                </div>
              </ConfigSection>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <SheetFooter className="border-t px-4 pt-4 sm:px-6">
          <SheetClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
