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
    videoOwnerChannelTitle?: string
    videoOwnerChannelId?: string
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
    thumbnails: {
      maxres?: { url: string }
      high?: { url: string }
      medium?: { url: string }
      standard?: { url: string }
      default?: { url: string }
    }

    channelId: string
    channelTitle: string
  }
  status: { privacyStatus: string }
  contentDetails: { itemCount: number }
}
