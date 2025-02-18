import { QueryClientProvider } from '@tanstack/solid-query'
import { queryClient } from '../../lib/solid-query'
import { createSignal, ErrorBoundary, Show } from 'solid-js'
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools'
import { PlaylistView } from './PlaylistView'

// Watching a playlist
// https://www.youtube.com/watch?v=X67NqIR5wpE&list=PLhyHc3W8oSov-ucuA2YzzFMTJPZ6GNXJy
// Direct URL copy
// https://www.youtube.com/playlist?           list=PLB13753FB0FD0B8A5
// Shared - Desktop
// https://youtube.com/playlist?               list=PLhyHc3W8oSov-ucuA2YzzFMTJPZ6GNXJy&si=pI8P0n2dtH_YzeVt
const parseYoutubePlaylistId = (rawInput: string) => {
  if (!rawInput.includes('/')) {
    return rawInput
  }
  const url = new URL(rawInput)
  const params = url.searchParams

  return params.get('list')
}

const loginWithGoogle = () => {
  const googleOAuthBaseUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  const searchParams = new URLSearchParams()
  searchParams.append(
    'client_id',
    '344507265100-7bqbplrc3j13h9jbthquffsqs9mnfvev.apps.googleusercontent.com'
  )
  searchParams.append(
    'redirect_uri',
    (import.meta.env.DEV ? 'http://localhost:4321' : 'https://utils.angelo.fyi') +
      '/tools/yt-playlist-viewer'
  )
  searchParams.append('response_type', 'token')
  searchParams.append('scope', 'https://www.googleapis.com/auth/youtube.readonly')

  window.location.href = googleOAuthBaseUrl + '?' + searchParams.toString()
}

const Inner = () => {
  let playlistIdInput!: HTMLInputElement

  const [playlistId, setPlaylistId] = createSignal<string>('')
  const refetchPlaylistData = () => {
    const id = parseYoutubePlaylistId(playlistIdInput.value)
    console.log('Parsed PlaylistID', id)

    if (id != null) {
      setPlaylistId(id)
    }
  }

  return (
    <div>
      <section class='mx-auto flex max-w-prose gap-2'>
        <input
          ref={playlistIdInput}
          onSubmit={refetchPlaylistData}
          type='text'
          class='w-full rounded-md bg-white px-2 py-1 text-neutral-800'
          placeholder='YouTube Watch + Playlist URL / Playlist URL / Playlist ID'
        />
        <button class='rounded-md bg-pink-500 px-2 py-1 text-white' onClick={refetchPlaylistData}>
          &rarr;
        </button>
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
    <QueryClientProvider client={queryClient}>
      <Inner />

      {import.meta.env.DEV && <SolidQueryDevtools />}
    </QueryClientProvider>
  )
}
