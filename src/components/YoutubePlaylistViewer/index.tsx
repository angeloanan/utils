import { QueryClientProvider } from '@tanstack/solid-query'
import { queryClient } from '../../lib/solid-query'
import { createSignal, ErrorBoundary, Match, onMount, Show, Switch, useContext } from 'solid-js'
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools'
import { PlaylistView } from './PlaylistView'
import { SettingsContext, Provider as ViewerSettings } from './ViewerSettings'
import { LoggedInUserIndicator } from './LoggedInUserIndicator'
import { loginWithGoogle, parseGoogleToken, parseYoutubePlaylistId } from './utils'

const Inner = () => {
  let playlistIdInput!: HTMLInputElement

  const { settings, updateSettings } = useContext(SettingsContext)!
  const [playlistId, setPlaylistId] = createSignal<string>('')

  const refetchPlaylistData = () => {
    const id = parseYoutubePlaylistId(playlistIdInput.value)
    console.log('Parsed PlaylistID', id)

    if (id != null) {
      setPlaylistId(id)
    }
  }

  // Parse Google Access Token
  onMount(() => {
    let token = parseGoogleToken()
    if (token != null) {
      updateSettings('accessToken', token)
    }
  })

  return (
    <div>
      <section class='mx-auto max-w-prose'>
        <div class='flex justify-end gap-2'>
          <Switch>
            <Match when={settings.accessToken == null}>
              <button
                class='cursor-pointer rounded-md bg-blue-900 px-3 py-1.5 text-xs text-white'
                onClick={loginWithGoogle}
              >
                Log in
              </button>
            </Match>
            <Match when={settings.accessToken != null}>
              <LoggedInUserIndicator />
            </Match>
          </Switch>
        </div>

        <div class='mt-2 flex gap-2'>
          <input
            ref={playlistIdInput}
            onSubmit={refetchPlaylistData}
            type='text'
            class='w-full rounded-md bg-white px-2 py-1 text-neutral-800'
            placeholder='YouTube Watch + Playlist URL / Playlist URL / Playlist ID'
          />
          <Show when={settings.accessToken != null}>
            <button
              title='Search Liked Videos'
              class='cursor-pointer rounded-md bg-green-700 px-2 py-1 text-white'
              onClick={() => {
                playlistIdInput.value = 'LL'
                refetchPlaylistData()
              }}
            >
              👍
            </button>
          </Show>
          <button
            class='cursor-pointer rounded-md bg-pink-500 px-2 py-1 text-white'
            onClick={refetchPlaylistData}
          >
            &rarr;
          </button>
        </div>
      </section>

      <ErrorBoundary fallback={(err, reset) => <div onClick={reset}>Error: {err.toString()}</div>}>
        <Show when={playlistId() != ''}>
          <PlaylistView playlistId={playlistId} />
        </Show>
      </ErrorBoundary>
    </div>
  )
}

export const YoutubePlaylistViewer = () => {
  return (
    <ViewerSettings>
      <QueryClientProvider client={queryClient}>
        <Inner />

        {import.meta.env.DEV && <SolidQueryDevtools />}
      </QueryClientProvider>
    </ViewerSettings>
  )
}
