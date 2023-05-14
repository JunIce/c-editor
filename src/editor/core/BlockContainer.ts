import Editor from "../editor";
import Base from "./Base";
import Text from "./Text";

export interface RenderText {
  s: string;
  x: number;
  y: number;
}

export default class BlockContainer extends Base {
  blocks: Text[];

  constructor(parent: Editor) {
    super(parent);
    this.blocks = [];
  }

  push(data: string) {
    (data || "").split("").forEach((char) => {
      const text = new Text(char, this.ctx);
      this.blocks.push(text);
    });
  }

  get renderBlocks(): RenderText[] {
    const renderData: RenderText[] = [];

    const ctxRenderWidth = this.config.width - 2 * this.config.paddingX;
    let currentWidth = 0;
    let currentHeight = this.config.paddingY;
    let line = 0;

    this.blocks.forEach((text, idx) => {
      if (currentWidth < ctxRenderWidth) {
        currentWidth += text.metrics.width;
      } else {
        line++;
        currentWidth = 0;
      }

      renderData.push({
        s: text.char,
        x: this.config.paddingX + currentWidth,
        y: currentHeight + line * 30,
      });
    });

    return renderData;
  }
}
