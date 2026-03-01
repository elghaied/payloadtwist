import type { Payload } from 'payload'

interface ImageDef {
  name: string
  alt: string
  url: string
}

const images: ImageDef[] = [
  { name: 'hero-office.jpg', alt: 'Modern office workspace', url: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'hero-team.jpg', alt: 'Team collaboration', url: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'hero-code.jpg', alt: 'Code on screen', url: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'product-headphones.jpg', alt: 'Wireless headphones', url: 'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'product-laptop.jpg', alt: 'Laptop on desk', url: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'product-camera.jpg', alt: 'Camera equipment', url: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'product-watch.jpg', alt: 'Smart watch', url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'person-1.jpg', alt: 'Professional headshot', url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'person-2.jpg', alt: 'Professional headshot', url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'person-3.jpg', alt: 'Professional headshot', url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'blog-design.jpg', alt: 'Design tools', url: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'blog-tech.jpg', alt: 'Technology workspace', url: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800' },
]

export async function seedImages(payload: Payload): Promise<Record<string, number>> {
  const map: Record<string, number> = {}

  const results = await Promise.allSettled(
    images.map(async (img) => {
      try {
        const res = await fetch(img.url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buffer = Buffer.from(await res.arrayBuffer())
        const doc = await payload.create({
          collection: 'media',
          data: { alt: img.alt },
          file: {
            data: buffer,
            mimetype: 'image/jpeg',
            name: img.name,
            size: buffer.length,
          },
        })
        return { name: img.name, id: doc.id as number }
      } catch (e) {
        console.warn(`Failed to download ${img.name}:`, e)
        return null
      }
    }),
  )

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      map[result.value.name] = result.value.id
    }
  }

  return map
}
