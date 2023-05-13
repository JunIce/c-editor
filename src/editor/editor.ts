import { addEventListener } from "./utils";

const fontSizeMap = new Map<string, TextMetrics>();

interface BlockItem {
  s: string;
  textMetrics: TextMetrics;
}
export default class Editor {
  container: HTMLDivElement;
  ctx: CanvasRenderingContext2D;
  input: HTMLTextAreaElement;
  font: string;
  dpr: number;

  config: any = {};

  blocks: BlockItem[];

  constructor(options: any) {
    this.container = document.querySelector(options.selector);
    this.font = "normal 16px Aria";
    this.dpr = window.devicePixelRatio;
    this.blocks = [];

    this.config.width = options.width || 1000;
    this.config.height = options.height || 400;
  }

  init() {
    this.createPageCtx();
    this.inputAgent();
  }

  createPageCtx() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = this.config.width * this.dpr;
    canvas.height = this.config.height * this.dpr;
    canvas.style.width = this.config.width + "px";
    canvas.style.height = this.config.height + "px";
    ctx?.scale(this.dpr, this.dpr);
    canvas.style.border = "1px solid #ccc";

    addEventListener(canvas, "click", this._drawClick.bind(this));

    this.container.appendChild(canvas);

    this.ctx = ctx!;
  }

  _drawClick(e: MouseEvent) {
    console.log("", e);

    const { clientX, clientY } = e;

    this.input.style.top = clientY + "px";
    this.input.style.left = clientX + "px";

    this.input.focus();
  }

  inputAgent() {
    const textarea: HTMLTextAreaElement = document.createElement("textarea");
    textarea.className = "mock-input";

    addEventListener(textarea, "input", this._inputEvent.bind(this));

    this.input = textarea;
    this.container.appendChild(textarea);
  }

  _inputEvent(e: InputEvent) {
    // console.log/("", e);
    const { data } = e;

    console.log("", data);

    (data || "").split("").forEach((char) => {
      const textMetrics = this.measureText(char);
      this.blocks.push({ s: char, textMetrics });
    });

    this.render();
  }

  measureText(char: string) {
    this.ctx.font = this.font;
    let textMetrics!: TextMetrics;
    const TEXT_KEY = `${this.font}_${char}`;
    const cache = fontSizeMap.get(TEXT_KEY);
    if (cache) {
      textMetrics = cache;
    } else {
      textMetrics = this.ctx.measureText(char);
      fontSizeMap.set(TEXT_KEY, textMetrics);
    }

    return textMetrics;
  }

  render() {
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);
    this.ctx.save();

    let x = 30;
    let y = 30;

    this.blocks.forEach((block, idx) => {
      this.ctx.fillText(block.s, x, y);

      x += block.textMetrics.width;
    });

    this.ctx.restore();
  }
}
