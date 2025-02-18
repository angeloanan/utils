import type { Component } from 'solid-js'

export const FetchMoreEntry: Component<{ ref?: HTMLButtonElement }> = ({ ref }) => {
  return (
    <button
      class='flex min-h-52 w-full flex-col rounded bg-stone-700 px-4 py-2 text-left text-5xl'
      ref={ref}
    >
      <div class='aspect-square self-end rounded-full bg-green-700 p-2 text-center'>&rarr;</div>
      <div class='self-center'>Load more</div>
    </button>
  )
}
