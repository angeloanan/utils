import { createInfiniteQuery } from '@tanstack/solid-query'
import { createEffect, For, Show, useContext, type Accessor, type Component } from 'solid-js'
import { VideoEntry } from './VideoEntry'
import { EndOfPlaylist } from './EndOfPlaylist'
import { createVisibilityObserver } from '@solid-primitives/intersection-observer'
import { SettingsContext } from './ViewerSettings'
import type { YoutubePlaylistItemListResponse } from './types'
import { PlaylistHeader } from './PlaylistHeader'

const BASE_API_PLAYLIST_ITEMS_URL = 'https://www.googleapis.com/youtube/v3/playlistItems'

interface PlaylistViewProps {
  playlistId: Accessor<string>
}
export const PlaylistView: Component<PlaylistViewProps> = ({ playlistId }) => {
  const { settings, updateSettings } = useContext(SettingsContext)!
  let fetchMoreEntryElement!: HTMLDivElement

  const query = createInfiniteQuery<YoutubePlaylistItemListResponse>(() => ({
    queryKey: ['playlistItems', playlistId()],
    queryFn: async (ctx) => {
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
      const res: YoutubePlaylistItemListResponse = await req.json()
      if ('error' in res) {
        throw 'Playlist not found'
      }

      return res
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextPageToken,
    staleTime: Infinity
  }))

  const allVideos = () => query.data?.pages?.flatMap((cb) => cb.items)

  // Autofetch next page
  const isNextPageIndicatorVisible = createVisibilityObserver()(() => fetchMoreEntryElement)
  createEffect(() => {
    if (
      settings.fetchOnScroll &&
      isNextPageIndicatorVisible() &&
      query.hasNextPage &&
      !query.isFetchingNextPage
    ) {
      console.log('Fetching more videos')
      query.fetchNextPage({ cancelRefetch: false })
    }
  })

  // Infinite query fetch everything
  createEffect(() => {
    if (settings.shouldFetchAllVideos) {
      if (!query.hasNextPage) {
        updateSettings('shouldFetchAllVideos', false)
      } else if (!query.isFetchingNextPage) {
        query.fetchNextPage({ cancelRefetch: false })
      }
    }
  })

  const pageCount = () => {
    if (query.data?.pages[0] != null) {
      return Math.ceil(
        query.data.pages[0].pageInfo.totalResults / query.data.pages[0].pageInfo.resultsPerPage
      )
    } else {
      return 0
    }
  }
  return (
    <>
      <PlaylistHeader playlistId={playlistId} />

      <Show when={query.isFetched}>
        <div class='mx-auto mt-4 flex max-w-7xl items-end text-sm'>
          {query.data?.pages.length}{' '}
          <span class='ml-1 align-text-bottom text-xs'>/ {pageCount()}</span>
        </div>
      </Show>

      <section class='mt-2 md:px-8'>
        <ol class='mx-auto grid max-w-7xl grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6'>
          <For each={allVideos()}>{(item) => <VideoEntry video={item} />}</For>
        </ol>

        <EndOfPlaylist ref={fetchMoreEntryElement} query={query} />
      </section>
    </>
  )
}
