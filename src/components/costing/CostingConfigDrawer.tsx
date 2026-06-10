import { useEffect, useRef, useState } from 'react'
import { Settings2, Upload } from 'lucide-react'
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import type { CostingItem, CalculatorType } from '@/interface/costingInterface'
import { useCostingConfigStore } from '@/stores/costingConfigStore'

type CostingConfigDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
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

  const selectedItem = config.items.find((i) => i.id === selectedItemId)

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
        <SheetHeader className="border-b pb-4 text-start">
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Costing Config
          </SheetTitle>
          <SheetDescription>
            Manage categories, products, and rate overrides. Changes are saved
            locally.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto py-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handleExport}>
              Export JSON
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="mr-1 h-4 w-4" />
              Import JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportFile}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                resetToDefaults()
                toast.success('Reset to defaults')
              }}
            >
              Reset defaults
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Add category</Label>
            <div className="flex gap-2">
              <Input
                value={newCategoryTitle}
                onChange={(e) => setNewCategoryTitle(e.target.value)}
                placeholder="Category name"
              />
              <Button onClick={handleAddCategory}>Add</Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Add product item</Label>
            <Input
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="Product name"
            />
            <Select
              value={newItemType}
              onValueChange={(v) => setNewItemType(v as CalculatorType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visiting-card">Visiting Card template</SelectItem>
                <SelectItem value="offset-memo">Offset Memo template</SelectItem>
                <SelectItem value="custom">Custom formula</SelectItem>
                <SelectItem value="stub">Coming soon stub</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={newItemCategoryId}
              onValueChange={setNewItemCategoryId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {config.categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddItem}>Add item</Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Edit item rates</Label>
            <Select value={selectedItemId} onValueChange={handleSelectItem}>
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {config.items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedItem && (
              <>
                <Textarea
                  rows={8}
                  value={ratesJson}
                  onChange={(e) => setRatesJson(e.target.value)}
                  placeholder='{"sheetUnitPrice": 12}'
                  className="font-mono text-xs"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveRates}>
                    Save rates
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
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
          </div>
        </div>

        <SheetFooter className="border-t pt-4">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
