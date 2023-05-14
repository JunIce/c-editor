const fontSizeMap = new Map<string, TextMetrics>();

export default class Text {
  char: string;
  metrics: TextMetrics;
  constructor(char: string, ctx: CanvasRenderingContext2D) {
    this.char = char;
    ctx.font = "normal 16px Aria";

    let textMetrics!: TextMetrics;
    const TEXT_KEY = `${ctx.font}_${char}`;
    const cache = fontSizeMap.get(TEXT_KEY);
    if (cache) {
      textMetrics = cache;
    } else {
      textMetrics = ctx.measureText(char);
      fontSizeMap.set(TEXT_KEY, textMetrics);
    }

    this.metrics = textMetrics;
  }
}
