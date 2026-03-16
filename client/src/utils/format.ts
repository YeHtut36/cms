export function formatDate(dateText: string | null): string {
  if (!dateText) {
    return '-'
  }

  return new Date(dateText).toLocaleString()
}

