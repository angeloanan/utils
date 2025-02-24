import { QueryClientProvider, useQueryClient, type InfiniteData } from '@tanstack/solid-query'
import { queryClient } from '../../lib/solid-query'
import { createSignal, ErrorBoundary, Match, onMount, Show, Switch, useContext } from 'solid-js'
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools'
import { PlaylistView } from './PlaylistView'
import { SettingsContext, Provider as ViewerSettings } from './ViewerSettings'
import { LoggedInUserIndicator } from './LoggedInUserIndicator'
import { loginWithGoogle, parseGoogleToken, parseYoutubePlaylistId } from './utils'
import type { YoutubePlaylistItemListResponse } from './types'
import { writeClipboard } from '@solid-primitives/clipboard'

const Inner = () => {
  let playlistIdInput!: HTMLInputElement

  const qc = useQueryClient()
  const { settings, updateSettings } = useContext(SettingsContext)!
  const [isSettingsOpen, setSettingsOpen] = createSignal<boolean>(false)
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
        <div class='flex justify-between gap-2'>
          <button
            class='cursor-pointer rounded-md bg-neutral-600 px-2 py-1 text-xs text-stone-50'
            onClick={() => {
              setSettingsOpen((v) => !v)
            }}
          >
            ⚙️ {isSettingsOpen() ? 'Advanced' : 'Simple'}
          </button>

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

        <Show when={isSettingsOpen()}>
          <div class='mt-2 rounded-md bg-neutral-900 px-4 py-2'>
            <div class='flex gap-2'>
              <button
                class='cursor-pointer rounded-md bg-red-900 px-2 py-1 text-xs hover:bg-red-800'
                onClick={() => {
                  updateSettings('shouldFetchAllVideos', true)
                }}
              >
                {!settings.shouldFetchAllVideos ? 'Fetch all videos' : 'Fetching...'}
              </button>
              <button
                class='cursor-pointer rounded-md bg-neutral-700 px-2 py-1 text-xs hover:bg-neutral-600'
                onClick={qc.clear}
              >
                🗑️ Clear cache
              </button>
              <button
                class='cursor-pointer rounded-md bg-neutral-700 px-2 py-1 text-xs hover:bg-neutral-600'
                onClick={() => {
                  let data = qc.getQueryData<InfiniteData<YoutubePlaylistItemListResponse>>([
                    'playlistItems',
                    playlistId()
                  ])
                  let videos = data?.pages.flatMap((cb) => cb.items)
                  if (videos != null) {
                    writeClipboard(JSON.stringify(videos))
                  }
                }}
              >
                📋 Export data
              </button>
            </div>

            <span class='mt-2 flex gap-1'>
              <input
                type='checkbox'
                id='fetchOnScroll'
                checked={settings.fetchOnScroll}
                onChange={(v) => {
                  updateSettings('fetchOnScroll', v.currentTarget.checked)
                }}
              />
              <label for='fetchOnScroll' title='Loads in new videos when scrolling'>
                Fetch on Scroll
              </label>
            </span>
          </div>
        </Show>
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
