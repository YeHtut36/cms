const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatDate(dateText: string | null): string {
  if (!dateText) {
    return '-'
  }

  // Handle naive timestamps (no timezone) by displaying as-entered (no shift).
  const naive = dateText.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?$/)
  if (naive) {
    const [, y, m, d, hh, mm] = naive
    const hours = Number(hh)
    const minutes = mm
    const meridiem = hours >= 12 ? 'PM' : 'AM'
    const hour12 = hours % 12 === 0 ? 12 : hours % 12
    const monthName = monthNames[Number(m) - 1] || m
    return `${monthName} ${Number(d)}, ${y}, ${hour12}:${minutes} ${meridiem}`
  }

  // Otherwise, respect timezone and render in Myanmar time.
  const date = new Date(dateText)
  if (Number.isNaN(date.getTime())) {
    return dateText
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Yangon',
  }).format(date)
}

// Convert ISO/local date string to input[type=datetime-local] value without timezone shift
export function toInputDateTimeValue(value: string | null): string {
  if (!value) {
    return ''
  }
  // If value already looks like datetime-local, return as is
  if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 16)
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const pad = (num: number) => num.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

