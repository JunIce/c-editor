import Editor from "../editor";
import Base from "./Base";
import { BlockContext, createBlockContext } from "./Block";
import Text from "./Text";

export interface RenderText {
  s: string;
  x: number;
  y: number;
  metrics: TextMetrics;
}

export default class BlockContainer extends Base {
  blocks: BlockContext[];

  constructor(parent: Editor) {
    super(parent);
    this.blocks = [];
  }

  push(data: string) {
    let currentBlock = createBlockContext();
    this.blocks.push(currentBlock);

    (data || "").split("").forEach((char) => {
      if (/\n/.test(char)) {
        currentBlock = createBlockContext();
        this.blocks.push(currentBlock);
      } else {
        const text = new Text(char, this.ctx);
        currentBlock.push(text);
      }
    });
  }

  get renderBlocks(): RenderText[][] {
    const renderData: RenderText[][] = [];

    const ctxRenderWidth = this.config.width - 2 * this.config.paddingX;
    let currentWidth = 0;
    let currentHeight = this.config.paddingY;
    let line = 0;

    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      const texts = block.texts;
      renderData[i] = [];

      for (let j = 0; j < texts.length; j++) {
        const text = texts[j];

        renderData[i].push({
          s: text.char,
          x: Math.ceil(this.config.paddingX + currentWidth),
          y: currentHeight + line * 30,
          metrics: text.metrics,
        });

        if (currentWidth < ctxRenderWidth) {
          currentWidth += text.metrics.width;
        } else {
          line++;
          currentWidth = 0;
        }
      }
      line += 1;
      currentWidth = 0;
    }

    return renderData;
  }
}
