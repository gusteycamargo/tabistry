interface Props {
  pathname: string
  params?: Record<string, unknown>
  query?: Record<string, string>
}

export const generateRouteUrl = ({ pathname, params = {}, query }: Props) => {
  const routeWithPath = pathname
    .replace(
      /:([\w]+)(\?)?/g,
      (match: string, key: string, optional: string) => {
        if (!params[key] && optional) return ''
        if (!params[key]) return match

        return String(params[key])
      },
    )
    .replace(/\/+/g, '/')

  if (!query || !Object.keys(query).length) return routeWithPath

  const search = new URLSearchParams(query)

  return `${routeWithPath}?${search.toString()}`
}
