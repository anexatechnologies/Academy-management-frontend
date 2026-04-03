export type DateFormatOptions = 'readable' | 'medium' | 'numeric' | 'relative'

/**
 * Gets the ordinal suffix for an English number (st, nd, rd, th)
 */
const getOrdinalSuffix = (d: number): string => {
  if (d > 3 && d < 21) return 'th'
  switch (d % 10) {
    case 1:  return 'st'
    case 2:  return 'nd'
    case 3:  return 'rd'
    default: return 'th'
  }
}

/**
 * Formats a Date object or ISO string into a friendly readable string.
 * Native Intl implementation to avoid heavy moment.js/date-fns dependencies.
 * 
 * @param date Value to format (string or Date object)
 * @param format Format type ('readable' = 25th Feb, 2026, 'medium' = Feb 25, 2026, 'numeric' = 2/25/2026)
 * @returns Formatted date string, or empty string if invalid
 */
export const formatDate = (date: Date | string | null | undefined, format: DateFormatOptions = 'readable'): string => {
  if (!date) return ''
  
  const d = typeof date === 'string' ? new Date(date) : date
  
  // Check for Invalid Date
  if (isNaN(d.getTime())) return ''

  if (format === 'numeric') {
    return d.toLocaleDateString()
  }

  const day = d.getDate()
  const year = d.getFullYear()
  
  if (format === 'readable') {
    // Ex: "25th Feb, 2026"
    const month = d.toLocaleDateString('en-US', { month: 'short' })
    const suffix = getOrdinalSuffix(day)
    return `${day}${suffix} ${month}, ${year}`
  }

  if (format === 'medium') {
    // Ex: "Feb 25, 2026"
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return d.toLocaleDateString()
}
