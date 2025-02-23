// Watching a playlist
// https://www.youtube.com/watch?v=X67NqIR5wpE&list=PLhyHc3W8oSov-ucuA2YzzFMTJPZ6GNXJy
// Direct URL copy
// https://www.youtube.com/playlist?           list=PLB13753FB0FD0B8A5
// Shared - Desktop

import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'

// https://youtube.com/playlist?               list=PLhyHc3W8oSov-ucuA2YzzFMTJPZ6GNXJy&si=pI8P0n2dtH_YzeVt
export const parseYoutubePlaylistId = (rawInput: string) => {
  if (!rawInput.includes('/')) {
    return rawInput.trim()
  }
  const url = new URL(rawInput.trim())
  const params = url.searchParams

  return params.get('list')
}

export const formatTimeDistance = (time?: string | null | undefined) => {
  return formatDistanceToNow(time ?? '0', {
    addSuffix: true
  })
    .replaceAll('about ', '')
    .replaceAll('almost ', '~')
    .replaceAll('over ', '>')
    .replaceAll(' months', 'mo')
    .replaceAll(' year', 'yr')
    .replaceAll(' years', 'yr')
}

// -----------

export const loginWithGoogle = () => {
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

export const parseGoogleToken: () => string | null = () => {
  let hash = window.location.hash
  if (hash.length < 2) return null

  const params = new URLSearchParams(hash.substring(1))
  const token = params.get('access_token')
  return token
}
