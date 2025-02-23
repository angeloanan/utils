import { createEffect, Match, Show, Switch, useContext } from 'solid-js'
import { SettingsContext } from './ViewerSettings'
import { createQuery, type QueryFunction } from '@tanstack/solid-query'

export const LoggedInUserIndicator = () => {
  const { settings, updateSettings } = useContext(SettingsContext)!

  const query = createQuery(() => ({
    enabled: settings.accessToken != null,
    queryKey: ['channel', 'mine'],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('part', 'snippet')
      params.append('mine', 'true')

      const req = await fetch(
        'https://www.googleapis.com/youtube/v3/channels' + '?' + params.toString(),
        {
          headers: { Authorization: 'Bearer ' + settings.accessToken }
        }
      )
      let res = await req.json()
      if (res.code === 401) throw 'TOKEN_EXPIRED'
      return res
    },
    select: (data) => data.items[0].snippet,
    staleTime: Infinity
  }))

  createEffect(() => {
    if (query.isError) {
      updateSettings('accessToken', undefined)
      window.location.hash = ''
    }
  })

  return (
    <div class='text-sm'>
      Logged in as{' '}
      <Switch>
        <Match when={query.isLoading}>...</Match>
        <Match when={query.isSuccess}>
          <a
            href={'https://youtube.com/' + query.data.customUrl}
            target='_blank'
            class='text-slate-200 hover:text-slate-300'
          >
            {query.data.title} ({query.data.customUrl})
          </a>
        </Match>
        <Match when={query.isError}>Error</Match>
      </Switch>
    </div>
  )
}
