export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<string | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  const rotRad = getRadianAngle(rotation)

  const { width: bBoxWidth, height: bBoxHeight } = {
    width:
      Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height),
    height:
      Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height),
  }

  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  ctx.drawImage(image, 0, 0)

  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  )

  const maxWidth = 1200
  let targetWidth = pixelCrop.width
  let targetHeight = pixelCrop.height

  if (targetWidth > maxWidth) {
    const ratio = maxWidth / targetWidth
    targetWidth = maxWidth
    targetHeight = Math.round(targetHeight * ratio)
  }

  // First put full crop into temp canvas, then scale down onto final canvas if needed
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = pixelCrop.width
  tempCanvas.height = pixelCrop.height
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) return null
  tempCtx.putImageData(data, 0, 0)

  canvas.width = targetWidth
  canvas.height = targetHeight
  ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight)

  return canvas.toDataURL('image/jpeg', 0.8)
}
