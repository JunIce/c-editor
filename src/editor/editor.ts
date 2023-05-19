import BlockContainer from "./core/BlockContainer";
import { addEventListener } from "./utils";
import Text from "./core/Text";
import { handleKeyboardEvent } from "./core/KeyboardEvent";
import { EventManager, EventType } from "./core/EventManager";

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
  events: EventManager;
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
    this.events = new EventManager(this);

    this.config.width = options.width || 1000;
    this.config.height = options.height || 500;
  }

  init() {
    this.createPageCtx();
    this.inputAgent();
    this.drawBorder();
    this._bindEvents();
  }

  _bindEvents() {
    this.events.on(EventType.RENDER, this.render.bind(this));
    this.events.on(EventType.TEXT_DELETE, this._deleteText.bind(this));
  }

  _deleteText() {
    const lastBlock = this.blocksContainer.lastBlock;
    lastBlock.delete();
    this.events.emit(EventType.RENDER);
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

  drawBorder() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#333";
    this.ctx.strokeRect(
      this.config.paddingX,
      this.config.paddingY,
      this.config.width - 2 * this.config.paddingX,
      this.config.height - 2 * this.config.paddingY
    );
  }

  _drawClick(e: MouseEvent) {
    const { clientX, clientY } = e;
    const { height } = this.input.getBoundingClientRect();

    this.input.style.top = clientY - height / 2 + "px";
    this.input.style.left = clientX + "px";

    this.input.focus();
  }

  inputAgent() {
    const textarea: HTMLTextAreaElement = document.createElement("textarea");
    textarea.className = "mock-input";
    addEventListener(textarea, "keydown", (e) =>
      handleKeyboardEvent.call(null, e, this)
    );
    addEventListener(textarea, "input", this._inputEvent.bind(this));

    this.input = textarea;
    this.container.appendChild(textarea);
  }

  _inputEvent(e: InputEvent) {
    const { data } = e;
    const lastBlock = this.blocksContainer.lastBlock;
    data?.split("").forEach((char) => {
      const text = new Text(char, this.ctx);
      lastBlock.push(text);
    });
    this.events.emit(EventType.RENDER);
  }

  render() {
    this.ctx.clearRect(
      this.config.paddingX,
      this.config.paddingY,
      this.config.width - 2 * this.config.paddingX,
      this.config.height - 2 * this.config.paddingY
    );
    const data = this.blocksContainer.renderBlocks;

    data.forEach((texts) => {
      texts.forEach((text) => this.ctx.fillText(text.s, text.x, text.y));
    });
  }

  renderText(s: string) {
    this.blocksContainer.push(s);
    this.events.emit(EventType.RENDER);
  }
}
