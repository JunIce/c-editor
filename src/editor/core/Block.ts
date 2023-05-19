import Text from "./Text";

export interface BlockContext {
  texts: Text[];
  push: (text: Text) => void;
  delete: () => void;
}

export const createBlockContext = (): BlockContext => {
  const block: BlockContext = {
    texts: [],
    push: (text: Text) => {
      block.texts.push(text);
    },
    delete: () => {
      block.texts.pop();
    },
  };

  return block;
};
