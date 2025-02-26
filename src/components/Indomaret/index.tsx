import { makePersisted } from '@solid-primitives/storage'
import { createQuery, QueryClientProvider } from '@tanstack/solid-query'
import { createEffect, createMemo, createResource, Show, type Component } from 'solid-js'
import { createStore } from 'solid-js/store'
import { queryClient } from '../../lib/solid-query'
import { refreshJwtToken, viewQR } from './lib'
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools'
import { toDataURL } from 'qrcode'
import { createPolled } from '@solid-primitives/timer'

const EMPTY_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEElEQVR4AQEFAPr/AP////8J+wP9o9FJCgAAAABJRU5ErkJggg=='

type IndomaretStore = {
  refreshToken: string | null
  accessToken: string | null
  signature: string | null

  autoStart: boolean
}

const Inner: Component = () => {
  const [store, setStore] = makePersisted(
    createStore<IndomaretStore>({
      refreshToken: null,
      accessToken: null,
      signature: null,

      autoStart: false
    }),
    {
      name: 'IndomaretConfig',
      storage: localStorage
    }
  )

  const isNewTokensQueryEnabled = createMemo(
    () =>
      store.refreshToken != null &&
      store.accessToken != null &&
      store.signature != null &&
      store.autoStart
  )
  const newTokensQuery = createQuery(() => ({
    queryKey: ['indomaret', 'tokens'],
    queryFn: () => refreshJwtToken(store.refreshToken!, store.accessToken!, store.signature!),
    enabled: isNewTokensQueryEnabled(),
    select: (d) => d.data.accessToken,
    refetchInterval: 3600_000, // 1 Hour
    retry: 0,
    staleTime: 3500_000 // Less than 1 hour
  }))

  const isQrDataQueryEnabled = createMemo(
    () => newTokensQuery.data != null && newTokensQuery.isSuccess && store.autoStart
  )
  const qrDataQuery = createQuery(() => ({
    queryKey: ['indomaret', 'qr'],
    queryFn: () => viewQR(newTokensQuery.data),
    enabled: isQrDataQueryEnabled(),
    select: (d) => d.data.encodedData,
    refetchIntervalInBackground: true,
    refetchInterval: 10_000,
    retry: 0,
    staleTime: 10_000
  }))

  createEffect(() => {
    qrDataQuery.data && refetch()
    console.log('Refetching...')
  })

  const [qrDataUrl, { refetch }] = createResource<string>(
    () => {
      if (qrDataQuery?.data == null) return EMPTY_IMAGE

      return toDataURL(qrDataQuery?.data, {
        type: 'image/png',
        errorCorrectionLevel: 'high',
        scale: 16
      })
    },
    { initialValue: EMPTY_IMAGE }
  )

  const credentialsStatus = (): string => {
    if (newTokensQuery.isFetching) return 'Fetching...'
    if (newTokensQuery.isSuccess) return 'Valid'
    if (newTokensQuery.isError) return 'Invalid ‼️'

    return 'Pending'
  }
  const qrCodeStatus = (): string => {
    if (qrDataQuery.isFetching) return 'Updating...'
    if (qrDataQuery.isStale && store.autoStart) return 'Refreshing soon'
    if (qrDataQuery.isStale) return 'Out of date ‼️'
    if (qrDataQuery.isSuccess) return 'Up to date'

    return 'Pending'
  }

  const freshTime = createPolled(() => {
    return Math.floor((qrDataQuery.dataUpdatedAt - Date.now()) / 1000) + 10
  }, 1000)

  return (
    <div class='mx-auto max-w-xl'>
      <img src={qrDataUrl()} class='mx-auto h-64 w-64 bg-white' />

      <hr class='my-4' />

      <div class='mt-4'>
        <div class='text-lg'>
          <span class='text-xs font-light'>Credentials: </span>
          {credentialsStatus()}
        </div>
        <div class='text-lg'>
          <span class='text-xs font-light'>QR Code: </span>
          {qrCodeStatus()}{' '}
          <Show when={qrDataQuery.isSuccess && !qrDataQuery.isFetching && !qrDataQuery.isStale}>
            <span class='text-sm'>({freshTime()}s)</span>
          </Show>
        </div>

        <div class='text-lg'>
          <span class='text-xs font-light'>Auto refresh: </span>
          {store.autoStart ? 'On' : 'Off'}
        </div>

        <div class='mt-2 grid min-h-40 grid-cols-2 gap-2'>
          <div>
            <div>Refresh Token</div>
            <textarea
              rows={8}
              id='refreshToken'
              placeholder='Refresh token'
              class='w-full flex-1 rounded-sm bg-white px-2 py-1 font-mono text-sm whitespace-pre-line text-black placeholder:text-neutral-400'
              value={store.refreshToken ?? ''}
              onChange={(v) => setStore('refreshToken', v.currentTarget.value)}
            />
          </div>

          <div class=''>
            <div>Access Token</div>
            <textarea
              rows={8}
              id='accessToken'
              placeholder='Access token'
              class='w-full flex-1 rounded-sm bg-white px-2 py-1 font-mono text-sm whitespace-pre-line text-black placeholder:text-neutral-400'
              value={store.accessToken ?? ''}
              onChange={(v) => setStore('accessToken', v.currentTarget.value)}
            />
          </div>
        </div>

        <div class=''>
          <label for='signature' class='block'>
            Signature
          </label>
          <input
            type='text'
            id='signature'
            placeholder='Signature'
            class='w-full flex-1 rounded-sm bg-white px-2 py-1 font-mono text-sm whitespace-pre-line text-black placeholder:text-neutral-400'
            value={store.signature ?? ''}
            onChange={(v) => setStore('signature', v.currentTarget.value)}
          />
        </div>

        <div class='mt-4 flex gap-4'>
          <button
            class='rounded-md bg-blue-700 px-4 py-2 text-sm text-blue-50 hover:bg-blue-600 active:bg-blue-800'
            onClick={() => newTokensQuery.refetch()}
          >
            Check credentials
          </button>
          <button
            class='rounded-md bg-red-700 px-4 py-2 text-sm text-red-50'
            onClick={() => setStore('autoStart', !store.autoStart)}
          >
            Toggle Autofetch &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}

export const IndomaretHelper: Component = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Inner />
      {import.meta.env.DEV && <SolidQueryDevtools position='bottom' />}
    </QueryClientProvider>
  )
}
