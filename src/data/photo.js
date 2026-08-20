/**
 * The profile photograph, prepared in the browser.
 *
 * Two reasons it is not kept as the raw file. A blob URL dies with the document
 * that made it, so it could never survive a refresh; and a 5MB upload has no
 * business being carried around to draw a 40px circle. So the picture is drawn
 * once onto a canvas at `PHOTO_PX`, cropped to a square, and kept as a data URL
 * — self-contained, small enough to hold, and readable after a reload.
 *
 * Nothing leaves the browser. There is no backend to send it to.
 */
export const PHOTO_PX = 256

/** JPEG rather than PNG: a photograph, and a tenth of the bytes. */
const QUALITY = 0.85

export function readPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('That file could not be read.'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('That does not look like an image.'))
      image.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = PHOTO_PX
        canvas.height = PHOTO_PX
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingQuality = 'high'

        /* cover, not contain: a portrait crop fills the circle rather than
           sitting letterboxed inside it */
        const scale = Math.max(PHOTO_PX / image.width, PHOTO_PX / image.height)
        const w = image.width * scale
        const h = image.height * scale
        ctx.drawImage(image, (PHOTO_PX - w) / 2, (PHOTO_PX - h) / 2, w, h)

        resolve({ url: canvas.toDataURL('image/jpeg', QUALITY), name: file.name })
      }
      image.src = reader.result
    }

    reader.readAsDataURL(file)
  })
}
