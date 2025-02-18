import { toDataURL } from 'qrcode'
import { createEffect, createSignal, onMount } from 'solid-js'
import { debounce } from '@solid-primitives/scheduled'

const whitePixel =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEElEQVR4AQEFAPr/AP////8J+wP9o9FJCgAAAABJRU5ErkJggg=='

export const QRCodeGenerator = () => {
  const [content, setContent] = createSignal('empty')
  const [eccLevel, setEccLevel] = createSignal<'low' | 'medium' | 'quartile' | 'high'>('low')
  const [fg, setFg] = createSignal('#000000')
  const [bg, setBg] = createSignal('#FFFFFF')

  const updateContent = debounce((e) => {
    // @ts-expect-error: Incorrect typings
    setContent(e.target.value)
  }, 500)

  const [dataUrl, setDataUrl] = createSignal<string>()
  const imageBlob = () => {
    const byteString = atob(dataUrl()!.split(',')[1]!)
    const buffer = new ArrayBuffer(byteString.length)
    const intArray = new Uint8Array(buffer)
    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i)
    }

    return buffer
  }

  const updateDataUrl = async () => {
    setDataUrl(
      await toDataURL(content() == '' ? 'empty' : content(), {
        type: 'image/png',
        errorCorrectionLevel: eccLevel(),
        color: {
          dark: fg(),
          light: bg()
        },
        scale: 8
      })
    )
  }

  const copyPng = async () => {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': new Blob([imageBlob()], { type: 'image/png' }) })
    ])
  }
  const savePng = async () => {
    window.open(dataUrl(), '_blank')
  }

  onMount(updateDataUrl)
  createEffect(updateDataUrl)

  return (
    <div class='flex w-full flex-col-reverse gap-4 sm:grid sm:grid-cols-3'>
      <div class='col-span-2'>
        <label for='content' class='text-lg font-medium'>
          QR Code Content
        </label>
        <textarea
          name='content'
          id='content'
          onInput={updateContent}
          placeholder='Your QR code content...'
          class='w-full rounded-lg border-2 border-stone-600 bg-white p-2 text-stone-900'
        />

        {/* @ts-expect-error: Incorrect typings */}
        <fieldset class='mt-2' onchange={(e) => setEccLevel(e.target.value)}>
          <legend class='text-lg font-medium'>Error Correction Level</legend>
          <div class='flex items-center gap-2'>
            <label for='low'>
              <input type='radio' class='mr-1' name='ECC' id='low' value='low' checked />
              Low
            </label>
            <label for='med'>
              <input type='radio' class='mr-1' name='ECC' id='med' value='medium' />
              Medium
            </label>
            <label for='quartile'>
              <input type='radio' class='mr-1' name='ECC' id='quartile' value='medium' />
              Quartile
            </label>
            <label for='high'>
              <input type='radio' class='mr-1' name='ECC' id='high' value='medium' />
              High
            </label>
          </div>
        </fieldset>

        <fieldset class='mt-4'>
          <legend class='text-lg font-medium'>Colors</legend>
          <div class='flex gap-2'>
            <label for='bg'>Background</label>
            <input
              type='color'
              id='bg'
              name='bg'
              value='#FFFFFF'
              oninput={(e) => setBg(e.target.value)}
            />

            <label for='fg'>Foreground</label>
            <input
              type='color'
              id='fg'
              name='fg'
              value='#000000'
              oninput={(e) => setFg(e.target.value)}
            />
          </div>
        </fieldset>
      </div>

      <div class='mx-auto flex-col'>
        <img src={dataUrl() ?? whitePixel} class='h-52 w-52 bg-white' alt='' />

        <div class='mt-2'>
          <button
            class='mr-3 rounded-full bg-sky-600 px-4 py-2 text-sky-100 active:bg-sky-700'
            onClick={copyPng}
          >
            Copy
          </button>

          <button
            class='rounded-full bg-red-600 px-4 py-2 text-red-100 active:bg-red-700'
            onClick={savePng}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
