import { createSignal, onMount } from 'solid-js'
import { writeClipboard } from '@solid-primitives/clipboard'
import { ClipboardIcon } from './icons/Clipboard.tsx'
import { ArrowPathIcon } from './icons/ArrowPath.tsx'

const MINIMUM_PORT = 1024
const MAXIMUM_PORT = 65535
const COMMON_PORT = [
  5432, // Postgres
  3306, // MySQL
  6379, // Redis
  27017, // Mongo (mongod & mongos)

  // Utils
  1194, // OpenVPN
  4321, // Dev HTTP
  8008, // Dev HTTP
  8080, // Dev HTTP
  3000, // Dev HTTP
  5000, // Dev HTTP
  8000, // Dev HTTP
  8384, // Syncthing Web GUI
  22000, // Syncthing Protocol
  33434, // traceroute

  // Games
  25565, // Minecraft
  19132, // Minecraft Bedrock IPv4
  19133 // Minecraft Bedrock IPv6
]

const selectRandomPort = (from = MINIMUM_PORT, to = MAXIMUM_PORT) => {
  return Math.floor(Math.random() * (to - from + 1) + from)
}

export const PortSelector = () => {
  const [isExcludeCommonPort, setExcludeCommonPort] = createSignal<boolean>(false)
  const [port, setPort] = createSignal<number>()

  const copyPort = () => {
    writeClipboard(port()!.toString())
  }

  const reroll = () => {
    setPort(() => {
      let port = selectRandomPort()
      // Imagine if you're *that* unlucky
      while (isExcludeCommonPort() && COMMON_PORT.includes(port)) port = selectRandomPort()
      return port
    })
  }

  onMount(reroll)

  return (
    <div class='text-center'>
      <p class='text-xl font-medium'>Your random port</p>
      <span class='mt-2 block font-mono text-5xl text-stone-100 tabular-nums'>
        {port() ?? '.....'}
      </span>

      <div class='mx-auto mt-2 flex justify-center'>
        <button
          class='mx-2 flex items-center rounded-full bg-sky-600 px-4 py-2 text-sky-100 hover:bg-sky-500 active:bg-sky-700'
          onClick={copyPort}
          disabled={port() == null}
        >
          <ClipboardIcon />
          <span class='ml-1'>Copy</span>
        </button>
        <button
          class='mx-2 flex items-center rounded-full bg-red-600 px-4 py-2 text-red-100 hover:bg-red-500 active:bg-red-700'
          onClick={reroll}
        >
          <ArrowPathIcon />
          <span class='ml-1'>Re-roll</span>
        </button>
      </div>

      <section class='mt-2'>
        <div class='block'>
          <input
            type='checkbox'
            id='toggleCommon'
            checked={isExcludeCommonPort()}
            onToggle={() => {
              setExcludeCommonPort((p) => !p)
              if (COMMON_PORT.includes(port() ?? 0)) reroll()
            }}
          />
          <label for='toggleCommon' class='ml-2'>
            Exclude common port
          </label>
        </div>

        <hr class='mx-auto my-4 max-w-48'></hr>

        <div class='mt-4 font-light'>Docker port mapping:</div>
        <div class='font-mono'>outside:inside</div>
      </section>
    </div>
  )
}
