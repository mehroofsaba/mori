// Optional on-device AI through Transformers.js. Loaded lazily, so the app works fully without it.
let generator = null
let loading = null

export const aiReady = () => !!generator

export async function loadBrowserAI(onProgress) {
  if (generator) return true
  if (!loading) {
    loading = (async () => {
      const { pipeline, env } = await import('@huggingface/transformers')
      env.allowLocalModels = false
      generator = await pipeline('text2text-generation', 'Xenova/flan-t5-small', { progress_callback: onProgress })
      return true
    })().catch((e) => {
      loading = null
      throw e
    })
  }
  return loading
}

export async function askBrowserAI(prompt) {
  if (!generator) throw new Error('Browser AI is not loaded yet')
  const out = await generator(prompt, { max_new_tokens: 90 })
  return (out?.[0]?.generated_text || '').trim()
}
