import { ClipboardIcon } from "./icons/Clipboard.jsx"
import { readClipboard } from '@solid-primitives/clipboard'

const STEAMID_REGEX = /STEAM_([0-4]):([0-1]):(0|[1-9][0-9]{0,9})/
const STEAMID3_REGEX = /\[([AGMPCgcLTIUai]):([0-4]):(0|[1-9][0-9]{0,9})(?:\:([0-9]+))?\]/

const VANITY_URL_PROFILE_REGEX = /https?:\/\/(?:my\.steamchina|steamcommunity)\.com\/(profiles|gid)\/(\w+)\/?/
const VANITY_URL_USER_REGEX = /https?:\/\/(?:(?:my\.steamchina|steamcommunity)\.com\/id|user|s\.team\/p)\/([\w-]+)/

const isNumeric = (str: any): boolean => { return !isNaN(str) && !isNaN(parseFloat(str)) }

export const SteamToLeetify = () => { 
  let inputRef!: HTMLInputElement

  const onUseClipboardLookup = async () => { 
    const clipboardValue = await readClipboard()
    if (clipboardValue.length === 0) return alert('No clipboard content')
    if (!clipboardValue[0]?.types.includes('text/plain')) return alert('Invalid clipboard content')
    // @ts-expect-error: Lazy typing
    inputRef.value = clipboardValue[0].text()
    await onLookup()
  }

  const onLookup = async () => {
    const input = inputRef.value
    console.log(input)

    // Figure out type of SteamID
    if (isNumeric(input)) {
      return window.open(`https://leetify.com/app/profile/${input}`, '_blank')
    }

    if (STEAMID_REGEX.test(input)) {
      const id = input.match(STEAMID_REGEX)![3]
      return window.open(`https://leetify.com/app/profile/${id}`, '_blank')
    }

    if (STEAMID3_REGEX.test(input)) {
      const id = input.match(STEAMID3_REGEX)![3]
      return window.open(`https://leetify.com/app/profile/${id}`, '_blank')
    }

    if (VANITY_URL_PROFILE_REGEX.test(input)) {
      const vanity = input.match(VANITY_URL_PROFILE_REGEX)![2]
      if (isNumeric(vanity)) {
        return window.open(`https://leetify.com/app/profile/${vanity}`, '_blank')
      }

      const req = await fetch('/api/steamvanity2id/' + vanity)
      if (req.status === 400) return alert('Steam vanity URL not found')
      const id = await req.text()
      return window.open(`https://leetify.com/app/profile/${id}`, '_blank')
    }

    if (VANITY_URL_USER_REGEX.test(input)) {
      const vanity = input.match(VANITY_URL_USER_REGEX)![1]
      if (isNumeric(vanity)) {
        return window.open(`https://leetify.com/app/profile/${vanity}`, '_blank')
      }

      const req = await fetch('/api/steamvanity2id/' + vanity)
      if (req.status === 400) return alert('Steam vanity URL not found')
      const id = await req.text()
      return window.open(`https://leetify.com/app/profile/${id}`, '_blank')
    }

    return alert('Invalid SteamID')
  }

  return (
    <div class=''>
      <div class="flex gap-2">
        <input class='flex-1 mt-2 block w-full rounded-md border-2 border-stone-600 p-2 text-neutral-800 order-2' placeholder="Steam ID / username / profile link" ref={inputRef} onsubmit={onLookup} />
        <button onclick={onLookup} class='mt-2 rounded-md bg-sky-600 px-4 py-2 text-sky-100 active:bg-sky-700 order-3'>Lookup &rarr;</button>
        <button onclick={onUseClipboardLookup} class='mt-2 rounded-md bg-pink-600 px-4 py-2 text-red-100 items-baseline gap-2 justify-center order-1'><ClipboardIcon /></button>
      </div>
      <div>
      </div>
    </div>
  )
}
