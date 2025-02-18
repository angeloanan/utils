import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'
import type { YoutubePlaylistItem } from './PlaylistView'
import { Show } from 'solid-js'

interface VideoEntryProps {
  video: YoutubePlaylistItem
}
export const VideoEntry = ({ video }: VideoEntryProps) => {
  const thumbnails = video.snippet.thumbnails
  const highestThumbnail =
    thumbnails.maxres?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.standard?.url ??
    thumbnails.default?.url ??
    null

  const timePosted = formatDistanceToNow(video.contentDetails?.videoPublishedAt ?? '0', {
    addSuffix: true
  })
    .replaceAll('about ', '')
    .replaceAll('almost ', '~')
    .replaceAll('over ', '>')
    .replaceAll(' months', 'mo')
    .replaceAll(' year', 'yr')
    .replaceAll(' years', 'yr')

  const timeAdded = formatDistanceToNow(video.snippet.publishedAt ?? '0', { addSuffix: true })
    .replaceAll('about ', '')
    .replaceAll('almost ', '~')
    .replaceAll('over ', '>')
    .replaceAll(' months', 'mo')
    .replaceAll(' year', 'yr')
    .replaceAll(' years', 'yr')

  return (
    <li class='block rounded bg-stone-700'>
      <a href={'https://youtube.com/watch?v=' + video.contentDetails.videoId} target='_blank'>
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

      <div class='px-1 text-xs font-light'>
        by {video.snippet.videoOwnerChannelTitle ?? '(Unknown)'}
      </div>
      <div class='mt-2 px-1 text-[0.6rem] font-light'>
        {video.contentDetails.videoPublishedAt != null
          ? `Published ${timePosted}`
          : 'Unknown publish time'}{' '}
        &#183; Added {timeAdded}
      </div>
    </li>
  )
}
