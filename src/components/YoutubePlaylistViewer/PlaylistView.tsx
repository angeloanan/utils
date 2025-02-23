import { createInfiniteQuery, type QueryFunction, type QueryKey } from '@tanstack/solid-query'
import { createEffect, For, Show, useContext, type Accessor, type Component } from 'solid-js'
import { VideoEntry } from './VideoEntry'
import { FetchMoreEntry } from './FetchMoreEntry'
import { EndOfPlaylistLine } from './EndOfPlaylist'
import { createVisibilityObserver } from '@solid-primitives/intersection-observer'
import { SettingsContext } from './ViewerSettings'
import type { YoutubePlaylistItemListResponse } from './types'
import { PlaylistHeader } from './PlaylistHeader'

const BASE_API_PLAYLIST_ITEMS_URL = 'https://www.googleapis.com/youtube/v3/playlistItems'

const fetchPlaylistEntries: QueryFunction<
  YoutubePlaylistItemListResponse,
  QueryKey,
  string | undefined
> = async (ctx) => {
  const { settings } = useContext(SettingsContext)!

  const params = new URLSearchParams()
  params.append('key', import.meta.env.PUBLIC_YT_API_KEY)
  params.append('part', 'id,snippet,status,contentDetails')
  params.append('maxResults', '50')
  params.append('playlistId', ctx.queryKey[1] as string)

  // Next page token will be passed via page param
  if (typeof ctx.pageParam === 'string') {
    params.append('pageToken', ctx.pageParam)
  }

  const headers =
    settings.accessToken != null
      ? {
          Authorization: `Bearer ${settings.accessToken}`
        }
      : {}

  const req = await fetch(BASE_API_PLAYLIST_ITEMS_URL + '?' + params.toString(), {
    headers
  })
  const res = await req.json()
  if ('error' in res) {
    throw 'Playlist not found'
  }

  return res satisfies YoutubePlaylistItemListResponse
}

interface PlaylistViewProps {
  playlistId: Accessor<string>
}
export const PlaylistView: Component<PlaylistViewProps> = ({ playlistId }) => {
  let fetchMoreEntryElement!: HTMLButtonElement

  const query = createInfiniteQuery(() => ({
    queryKey: ['playlistItems', playlistId()],
    queryFn: fetchPlaylistEntries,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextPageToken,
    staleTime: Infinity
  }))

  const allVideos = () => query.data?.pages?.flatMap((cb) => cb.items)

  // Autofetch next page
  const isNextPageIndicatorVisible = createVisibilityObserver()(() => fetchMoreEntryElement)
  createEffect(() => {
    if (isNextPageIndicatorVisible() && query.hasNextPage && !query.isFetchingNextPage) {
      console.log('Fetching more videos')
      query.fetchNextPage()
    }
  })

  return (
    <>
      <PlaylistHeader playlistId={playlistId} />

      <section class='mt-4 md:px-8'>
        <ol class='mx-auto grid max-w-7xl grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6'>
          <For each={allVideos()}>{(item) => <VideoEntry video={item} />}</For>
          <Show when={query.hasNextPage}>
            <FetchMoreEntry
              ref={fetchMoreEntryElement}
              cb={() => {
                query.fetchNextPage()
              }}
              isFetching={() => query.isFetchingNextPage}
            />
          </Show>
        </ol>

        <Show when={!query.hasNextPage && !query.isLoading}>
          <EndOfPlaylistLine />
        </Show>
      </section>
    </>
  )
}
