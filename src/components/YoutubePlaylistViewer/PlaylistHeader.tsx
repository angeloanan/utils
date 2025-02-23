import { createQuery, type QueryFunction } from '@tanstack/solid-query'
import type { YoutubePlaylistDetail, YoutubePlaylistDetailResponse } from './types'
import { Show, useContext, type Accessor, type Component } from 'solid-js'
import { SettingsContext } from './ViewerSettings'
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'

const BASE_API_PLAYLIST_DETAIL_URL = 'https://www.googleapis.com/youtube/v3/playlists'

export const PlaylistHeader: Component<{ playlistId: Accessor<string> }> = ({ playlistId }) => {
  const { settings } = useContext(SettingsContext)!

  const query = createQuery(() => ({
    queryKey: ['playlist', playlistId()],
    queryFn: async (ctx) => {
      const params = new URLSearchParams()
      params.append('key', import.meta.env.PUBLIC_YT_API_KEY)
      params.append('part', 'contentDetails,snippet,status')
      params.append('maxResults', '1')
      params.append('id', ctx.queryKey[1] as string)

      const headers =
        settings.accessToken != null
          ? {
              Authorization: `Bearer ${settings.accessToken}`
            }
          : {}

      const req = await fetch(BASE_API_PLAYLIST_DETAIL_URL + '?' + params.toString(), { headers })
      const res: YoutubePlaylistDetailResponse = await req.json()
      if (res.items.length == 0) {
        throw 'Playlist not found'
      }

      return res.items[0]!
    },
    staleTime: Infinity
  }))

  const thumbnails = query.data?.snippet.thumbnails
  const thumbnail =
    thumbnails?.maxres?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.default?.url ??
    null

  return (
    <section class='mx-auto mt-8 min-h-48 w-full max-w-2xl rounded bg-stone-700 px-4 py-2'>
      <div class='line-clamp-1 text-xs'>
        Playlist ID: <span class='font-mono text-base'>{playlistId()}</span>
      </div>

      <div class='mt-6 flex'>
        <div class='flex-1'>
          <div class='text-sm'>
            Playlist by {query.data?.snippet.channelTitle} &#183; Created{' '}
            {!query.isLoading &&
              formatDistanceToNow(query.data?.snippet.publishedAt!, { addSuffix: true })}
          </div>
          <div class='text-4xl'>
            <Show when={!query.isLoading} fallback='...'>
              <a
                class='hover:underline'
                href={`https://youtube.com/playlist?list=${playlistId()}`}
                target='_blank'
              >
                {query.data?.snippet.title}
              </a>
            </Show>
          </div>
          <div class='mt-2'>
            <Show when={!query.isLoading} fallback='...'>
              {query.data?.snippet.description}
            </Show>
          </div>
        </div>

        <div class='aspect-video max-h-28 rounded bg-black'>
          <Show when={thumbnail != null}>
            <img src={thumbnail!} class='max-h-28 rounded' />
          </Show>
        </div>
      </div>
    </section>
  )
}
