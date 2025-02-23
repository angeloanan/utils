import type { YoutubePlaylistItem } from './types'
import { Match, Show, Switch, type Component } from 'solid-js'
import { formatTimeDistance } from './utils'

interface VideoEntryProps {
  video: YoutubePlaylistItem
}
export const VideoEntry: Component<VideoEntryProps> = ({ video }) => {
  const thumbnails = video.snippet.thumbnails
  const highestThumbnail =
    thumbnails.maxres?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.standard?.url ??
    thumbnails.default?.url ??
    null

  const timePosted = formatTimeDistance(video.contentDetails.videoPublishedAt)
  const timeAdded = formatTimeDistance(video.snippet.publishedAt)

  return (
    <li class='block rounded bg-stone-700'>
      <div class='flex px-1 text-[0.6rem] font-light'>
        <div class='flex-1'>Added {timeAdded}</div>
        <span>{video.snippet.position + 1}</span>
      </div>
      <a
        href={'https://youtube.com/watch?v=' + video.contentDetails.videoId}
        target='_blank'
        class='mt-2 visited:text-slate-300 visited:italic hover:underline'
      >
        <Show
          when={highestThumbnail != null}
          fallback={<div class='aspect-video w-full rounded-t bg-black' />}
        >
          <img src={highestThumbnail!} class='aspect-video w-full rounded-t' />
        </Show>
        <div
          class='line-clamp-2 px-1 pt-1 text-sm font-medium visited:italic'
          title={video.snippet.title}
        >
          {video.snippet.title}
        </div>
      </a>
      <Switch>
        <Match when={video.snippet.videoOwnerChannelTitle != null}>
          <a
            href={`https://youtube.com/channel/${video.snippet.videoOwnerChannelId}`}
            class='my-2 block w-full px-1 text-xs font-light hover:underline'
            target='_blank'
          >
            by {video.snippet.videoOwnerChannelTitle} &#183;{' '}
            {video.contentDetails.videoPublishedAt != null
              ? `${timePosted}`
              : 'Unknown publish time'}
          </a>
        </Match>
        <Match when={video.snippet.videoOwnerChannelTitle == null}>
          <span class='my-2 block px-1 text-xs font-light'>by an unknown channel</span>
        </Match>
      </Switch>
    </li>
  )
}
