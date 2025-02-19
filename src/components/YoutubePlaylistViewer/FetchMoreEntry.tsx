import type { Component } from 'solid-js'

interface FetchMoreEntryProps {
  ref?: HTMLButtonElement
  cb?: VoidFunction
  isFetching?: boolean
}
export const FetchMoreEntry: Component<FetchMoreEntryProps> = ({ ref, cb, isFetching = false }) => {
  return (
    <button
      class='flex min-h-52 w-full cursor-pointer flex-col rounded bg-stone-700 px-4 py-2 text-left text-5xl hover:bg-stone-600'
      ref={ref}
      onClick={cb}
    >
      <div
        classList={{
          'aspect-square self-end rounded-full p-2 text-center': true,
          'bg-green-700': !isFetching,
          'bg-yellow-700': isFetching
        }}
      >
        &rarr;
      </div>
      <div class='self-center'>{!isFetching ? 'Load more' : 'Loading...'}</div>
    </button>
  )
}
