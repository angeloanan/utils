import {
  createInfiniteQuery,
  createQuery,
  type QueryFunction,
  type QueryKey
} from '@tanstack/solid-query'
import { createEffect, For, Show, type Accessor, type Component } from 'solid-js'
import { VideoEntry } from './VideoEntry'
import { FetchMoreEntry } from './FetchMoreEntry'
import { EndOfPlaylistLine } from './EndOfPlaylist'
import { createVisibilityObserver } from '@solid-primitives/intersection-observer'
import { formatDistanceToNow } from 'date-fns'

// Partial
export interface YoutubePlaylistItemListResponse {
  kind: string
  etag: string
  nextPageToken?: string
  items: YoutubePlaylistItem[]
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
}

export interface YoutubePlaylistItem {
  kind: string
  etag: string
  id: string
  snippet: {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: {
      maxres?: { url: string }
      high?: { url: string }
      medium?: { url: string }
      standard?: { url: string }
      default?: { url: string }
    }
    channelTitle: string
    playlistId: string
    position: number
    resourceId: { videoId: string }
    videoOwnerChannelTitle: string
  }
  contentDetails: { videoId: string; videoPublishedAt?: string }
  status: { privacyStatus: string }
}

export interface YoutubePlaylistDetailResponse {
  items: YoutubePlaylistDetail[]
}
export interface YoutubePlaylistDetail {
  snippet: {
    publishedAt: string
    title: string
    description: string

    channelId: string
    channelTitle: string
  }
  status: { privacyStatus: string }
  contentDetails: { itemCount: number }
}

const BASE_API_PLAYLIST_ITEMS_URL = 'https://www.googleapis.com/youtube/v3/playlistItems'
const BASE_API_PLAYLIST_DETAIL_URL = 'https://www.googleapis.com/youtube/v3/playlists'

const fetchPlaylistEntries: QueryFunction<
  YoutubePlaylistItemListResponse,
  QueryKey,
  string | undefined
> = async (ctx) => {
  const params = new URLSearchParams()
  params.append('key', import.meta.env.PUBLIC_YT_API_KEY)
  params.append('part', 'id,snippet,status,contentDetails')
  params.append('maxResults', '50')
  params.append('playlistId', ctx.queryKey[1] as string)

  // Next page token will be passed via page param
  if (typeof ctx.pageParam === 'string') {
    params.append('pageToken', ctx.pageParam)
  }

  const req = await fetch(BASE_API_PLAYLIST_ITEMS_URL + '?' + params.toString())
  const res = await req.json()
  if ('error' in res) {
    throw 'Playlist not found'
  }

  return res satisfies YoutubePlaylistItemListResponse
}

interface PlaylistViewProps {
  playlistId: Accessor<string>
}
export const PlaylistView = ({ playlistId }: PlaylistViewProps) => {
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
            <FetchMoreEntry ref={fetchMoreEntryElement} />
          </Show>
        </ol>

        <Show when={!query.hasNextPage && !query.isLoading}>
          <EndOfPlaylistLine />
        </Show>

        <pre class='mt-8 max-h-96 overflow-scroll'>{JSON.stringify(query.data, null, 2)}</pre>
      </section>
    </>
  )
}

const fetchPlaylistDetail: QueryFunction<YoutubePlaylistDetail> = async (ctx) => {
  const params = new URLSearchParams()
  params.append('key', import.meta.env.PUBLIC_YT_API_KEY)
  params.append('part', 'contentDetails,snippet,status')
  params.append('maxResults', '1')
  params.append('id', ctx.queryKey[1] as string)

  const req = await fetch(BASE_API_PLAYLIST_DETAIL_URL + '?' + params.toString())
  const res: YoutubePlaylistDetailResponse = await req.json()
  if (res.items.length == 0) {
    throw 'Playlist not found'
  }

  return res.items[0]!
}

const PlaylistHeader: Component<{ playlistId: Accessor<string> }> = ({ playlistId }) => {
  const query = createQuery(() => ({
    queryKey: ['playlist', playlistId()],
    queryFn: fetchPlaylistDetail,
    staleTime: Infinity
  }))

  return (
    <section class='mx-auto mt-8 min-h-48 w-full max-w-2xl rounded bg-stone-700 px-4 py-2'>
      <div class='line-clamp-1 text-xs'>
        Playlist ID: <span class='font-mono text-base'>{playlistId()}</span>
      </div>

      <div class='mt-6 text-sm'>
        Playlist by {query.data?.snippet.channelTitle} &#183; Created{' '}
        {!query.isLoading &&
          formatDistanceToNow(query.data?.snippet.publishedAt!, { addSuffix: true })}
      </div>
      <div class='text-4xl'>
        <Show when={!query.isLoading} fallback='...'>
          {query.data?.snippet.title}
        </Show>
      </div>
      <div class='mt-2'>
        <Show when={!query.isLoading} fallback='...'>
          {query.data?.snippet.description}
        </Show>
      </div>
    </section>
  )
}
