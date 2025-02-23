import type { CreateInfiniteQueryResult, InfiniteData } from '@tanstack/solid-query'
import { Match, Switch, type Component } from 'solid-js'
import type { YoutubePlaylistItemListResponse } from './types'

interface EndOfPlaylistProps {
  ref?: HTMLDivElement
  query: CreateInfiniteQueryResult<InfiniteData<YoutubePlaylistItemListResponse, unknown>, Error>
}
export const EndOfPlaylist: Component<EndOfPlaylistProps> = ({ ref, query }) => {
  return (
    <div class='my-8 flex w-full items-center gap-4' ref={ref}>
      <Switch>
        <Match when={query.hasNextPage}>
          <button
            class='mx-auto flex w-full max-w-prose cursor-pointer flex-col rounded bg-stone-700 px-4 py-2 hover:bg-stone-600'
            onclick={() => query.fetchNextPage({ cancelRefetch: false })}
          >
            <div class='self-center'>{!query.isFetchingNextPage ? 'Load more' : 'Loading...'}</div>
          </button>
        </Match>

        <Match when={!query.hasNextPage}>
          <div class='h-px w-full bg-white' />
          <p class='shrink-0'>End of Playlist</p>
          <div class='h-px w-full bg-white' />
        </Match>
      </Switch>
    </div>
  )
}
