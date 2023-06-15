const fontSizeMap = new Map<string, TextMetrics>();

export default class Text {
  char: string
  metrics: TextMetrics
  width: number
  height: number

  constructor(char: string, ctx: CanvasRenderingContext2D) {
    this.char = char
    ctx.font = "normal 16px Aria"

    let textMetrics!: TextMetrics
    const TEXT_KEY = `${ctx.font}_${char}`
    const cache = fontSizeMap.get(TEXT_KEY)
    if (cache) {
      textMetrics = cache
    } else {
      textMetrics = ctx.measureText(char)
      fontSizeMap.set(TEXT_KEY, textMetrics)
    }

    this.metrics = textMetrics
    const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } =
      textMetrics
    this.width = Number(width.toFixed(2))
    this.height = Number(
      (actualBoundingBoxAscent + actualBoundingBoxDescent).toFixed(2)
    )
    if (this.height < 10) {
      this.height = 14
    }
  }
}
