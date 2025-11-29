"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  disabled,
  placeholder = "Selecciona fecha y hora",
  className,
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  const [time, setTime] = React.useState<string>(
    value
      ? format(new Date(value), "HH:mm")
      : format(new Date(), "HH:mm")
  )

  React.useEffect(() => {
    if (value) {
      const dateValue = new Date(value)
      setDate(dateValue)
      setTime(format(dateValue, "HH:mm"))
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined)
      onChange?.("")
      return
    }

    const [hours, minutes] = time.split(":").map(Number)
    const newDateTime = new Date(selectedDate)
    newDateTime.setHours(hours || 0, minutes || 0, 0, 0)
    
    setDate(newDateTime)
    
    // Format as datetime-local string (YYYY-MM-DDTHH:mm)
    const formatted = format(newDateTime, "yyyy-MM-dd'T'HH:mm")
    onChange?.(formatted)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)

    if (date) {
      const [hours, minutes] = newTime.split(":").map(Number)
      const newDateTime = new Date(date)
      newDateTime.setHours(hours || 0, minutes || 0, 0, 0)
      
      // Format as datetime-local string (YYYY-MM-DDTHH:mm)
      const formatted = format(newDateTime, "yyyy-MM-dd'T'HH:mm")
      onChange?.(formatted)
    }
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, "PPP", { locale: es })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <div className="relative flex items-center">
        <Clock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="time"
          value={time}
          onChange={handleTimeChange}
          disabled={disabled || !date}
          className="w-[120px] pl-9"
        />
      </div>
    </div>
  )
}

