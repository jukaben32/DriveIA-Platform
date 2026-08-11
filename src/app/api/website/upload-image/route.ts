import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiError } from '@/lib/api'

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => null)
    const imageUrl = body?.imageUrl || body?.url
    if (!imageUrl) {
      return apiError('imageUrl is required', 400)
    }
    return NextResponse.json({ uploaded: false, url: imageUrl })
  }

  if (!contentType.includes('multipart/form-data')) {
    return apiError('Unsupported content type', 415)
  }

  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return apiError('file is required', 400)
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'website-assets'
  const admin = createAdminClient()
  const path = `${form.get('folder') || 'uploads'}/${randomUUID()}-${file.name}`.replace(/\s+/g, '-')
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await admin.storage.from(bucket).upload(path, buffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  })

  if (uploadError) {
    return apiError(uploadError.message, 400)
  }

  const { data } = admin.storage.from(bucket).getPublicUrl(path)
  return NextResponse.json({
    uploaded: true,
    bucket,
    path,
    url: data.publicUrl,
  })
}
