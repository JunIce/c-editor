import BlockContainer from "./core/BlockContainer";
import { addEventListener } from "./utils";

export interface ConfigProps {
  width: number;
  height: number;
  paddingX: number;
  paddingY: number;
}

export default class Editor {
  container: HTMLDivElement;
  ctx!: CanvasRenderingContext2D;
  input!: HTMLTextAreaElement;
  dpr: number;

  config: ConfigProps = {
    width: 1000,
    height: 500,
    paddingX: 30,
    paddingY: 30,
  };

  blocksContainer: BlockContainer;

  constructor(options: any) {
    this.container = document.querySelector(options.selector);
    this.dpr = window.devicePixelRatio;
    this.blocksContainer = new BlockContainer(this);

    this.config.width = options.width || 1000;
    this.config.height = options.height || 500;
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
    const { data } = e;

    this.blocksContainer.push(data || "");

    this.render();
  }

  render() {
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);

    const data = this.blocksContainer.renderBlocks;

    data.forEach((text) => {
      this.ctx.fillText(text.s, text.x, text.y);
    });
  }
}
