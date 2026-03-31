"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, isValid, parseISO } from "date-fns"
import { Matcher } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type DatePickerProps = {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  minDate,
  maxDate,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    const parsed = parseISO(value)
    return isValid(parsed) ? parsed : undefined
  }, [value])

  const disabledDays = React.useMemo<Matcher | Matcher[] | undefined>(() => {
    if (minDate && maxDate) {
      return [{ before: minDate }, { after: maxDate }]
    }
    if (minDate) return { before: minDate }
    if (maxDate) return { after: maxDate }
    return undefined
  }, [minDate, maxDate])

  const currentYear = new Date().getFullYear()
  const fromYear = minDate?.getFullYear() ?? currentYear - 100
  const toYear = maxDate?.getFullYear() ?? currentYear + 10

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between rounded-lg border-input bg-background px-3 text-left font-normal text-foreground shadow-none hover:bg-accent/50",
            !selectedDate && "text-muted-foreground",
            className,
          )}
        >
          <span>{selectedDate ? format(selectedDate, "PPP") : placeholder}</span>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) {
              onChange("")
              return
            }

            onChange(format(date, "yyyy-MM-dd"))
            setOpen(false)
          }}
          disabled={disabledDays}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          className="rounded-md border-0 p-3"
        />
      </PopoverContent>
    </Popover>
  )
}
