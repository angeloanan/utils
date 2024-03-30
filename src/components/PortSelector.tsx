import { createSignal, onMount } from 'solid-js'
import { writeClipboard } from '@solid-primitives/clipboard'
import { ClipboardIcon } from './icons/Clipboard.tsx'
import { ArrowPathIcon } from './icons/ArrowPath.tsx'

const MINIMUM_PORT = 1024
const MAXIMUM_PORT = 65535

const selectRandomPort = (from = MINIMUM_PORT, to = MAXIMUM_PORT) => {
  return Math.floor(Math.random() * (to - from + 1) + from)
}

export const PortSelector = () => {
  const [port, setPort] = createSignal<number>()

  const copyPort = () => {
    writeClipboard(port()!.toString())
  }

  const reroll = () => {
    setPort(selectRandomPort())
  }

  onMount(reroll)

  return (
    <div class='text-center'>
      <p class='text-xl font-medium'>Your random port</p>
      <span class='mt-2 block font-mono text-5xl tabular-nums text-stone-100'>{port()}</span>

      <div class='mx-auto mt-2 flex justify-center'>
        <button
          class='mx-2 flex items-center rounded-full bg-sky-600 px-4 py-2 text-sky-100 active:bg-sky-700'
          onClick={copyPort}
        >
          <ClipboardIcon />
          <span class='ml-1'>Copy</span>
        </button>
        <button
          class='mx-2 flex items-center rounded-full bg-red-600 px-4 py-2 text-red-100'
          onClick={reroll}
        >
          <ArrowPathIcon />
          <span class='ml-1'>Re-roll</span>
        </button>
      </div>
    </div>
  )
}
