'use client'
import { useState } from 'react'
import { VoiceWidget } from '@/components/voice/VoiceWidget'

export default function VoiceWidgetTestPage() {
  const [businessSlug, setBusinessSlug] = useState('')
  const [activeSlug, setActiveSlug] = useState('')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl p-8">
        <h1 className="mb-6 text-2xl font-bold">Voice Widget Test</h1>
        <p className="mb-4 text-sm text-gray-600">
          Enter the slug of one of your businesses (the same slug used in its public site URL), then start a call to test the live voice widget.
        </p>
        <form
          className="mb-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setActiveSlug(businessSlug.trim())
          }}
        >
          <input
            value={businessSlug}
            onChange={(e) => setBusinessSlug(e.target.value)}
            placeholder="e.g. downtown-motors"
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#5b0f21]"
          />
          <button type="submit" className="rounded-full bg-[#5b0f21] px-5 py-2 text-sm font-semibold text-white">
            Load widget
          </button>
        </form>
        {activeSlug ? (
          <p className="text-sm text-gray-600">
            Business slug: <span className="font-semibold">{activeSlug}</span> — click the launcher in the corner to start a call.
          </p>
        ) : null}
      </div>
      {activeSlug ? (
        <VoiceWidget businessSlug={activeSlug} position="bottom-right" theme="light" />
      ) : null}
    </div>
  )
}
