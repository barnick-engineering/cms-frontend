import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type ComboboxOption = { value: string; label: string }

interface ComboboxProps {
  options?: ComboboxOption[]
  placeholder?: string
  emptyMessage?: string
  onSelect?: (value: string) => void
  onSearch?: (query: string) => void
  loading?: boolean
  className?: string
  disabled?: boolean
  value?: string
  onSearchClear?: () => void
  // allow custom values that don't exist in options
  allowCustomValue?: boolean
}

export function Combobox({
  options = [],
  placeholder = "Select option...",
  emptyMessage = "No results found.",
  onSelect,
  onSearch,
  loading = false,
  className,
  disabled = false,
  value: controlledValue,
  onSearchClear,
  allowCustomValue = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)

  const currentValue = controlledValue || ""

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)

    // if allowing custom values, update the parent value immediately as user types
    if (allowCustomValue) {
      onSelect?.(query)
    }
  }

  const handleSelect = (selectedValue: string) => {
    setOpen(false)
    // clear search after selection
    setSearchQuery("")
    onSelect?.(selectedValue)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)

    if (!isOpen) {
      // When closing, clear the search query immediately
      setSearchQuery("")

      // If there was a search query and custom values are allowed, ensure it's set as the value
      if (allowCustomValue && searchQuery && searchQuery !== currentValue) {
        onSelect?.(searchQuery)
      }

      // Notify parent that search should be cleared
      if (onSearchClear) {
        onSearchClear()
      }
    } else {
      // When opening, if there's a current value that's not in options (custom value),
      // set it as the search query to show what's selected
      const valueExistsInOptions = options.some(opt => opt.value === currentValue)
      if (allowCustomValue && currentValue && !valueExistsInOptions) {
        setSearchQuery(currentValue)
      }
    }
  }

  // Get display label for selected value
  const selectedOption = options.find((option) => option.value === currentValue)
  const displayLabel = selectedOption?.label || currentValue || placeholder

  // Check if current search query could be a new custom value
  const isCustomValue = allowCustomValue && searchQuery && !options.some(opt =>
    opt.value.toLowerCase() === searchQuery.toLowerCase() ||
    opt.label.toLowerCase() === searchQuery.toLowerCase()
  )

  return (
    <div ref={containerRef}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("justify-between h-8", className)}
            disabled={disabled}
          >
            <span className="truncate">{displayLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <Command
            filter={() => 1}
            shouldFilter={false}
          >
            <CommandInput
              placeholder="Search..."
              value={searchQuery}
              onValueChange={handleSearch}
            />
            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Searching...</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Show "Create new" option when custom values are allowed and search doesn't match */}
                  {isCustomValue && (
                    <CommandGroup>
                      <CommandItem
                        value={searchQuery}
                        onSelect={() => handleSelect(searchQuery)}
                        className="cursor-pointer text-blue-600 font-medium"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            currentValue === searchQuery ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="truncate">Create "{searchQuery}"</span>
                      </CommandItem>
                    </CommandGroup>
                  )}

                  {options.length === 0 && !isCustomValue ? (
                    <CommandEmpty>{emptyMessage}</CommandEmpty>
                  ) : options.length > 0 ? (
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => handleSelect(option.value)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              currentValue === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="truncate">{option.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : null}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}