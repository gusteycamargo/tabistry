import { useMemo } from 'react'
import { useLocation } from 'react-router'

export const useQuery = () => {
  const { search } = useLocation()

  return useMemo(() => {
    const query = new URLSearchParams(search)

    return Object.fromEntries(query.entries())
  }, [search])
}
