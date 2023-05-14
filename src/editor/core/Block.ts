import Text from "./Text";

export interface BlockContext {
  texts: Text[];
  push: (text: Text) => void;
}

export const createBlockContext = (): BlockContext => {
  const block: any = {
    texts: [],
    push: (text: Text) => {
      block.texts.push(text);
    },
  };

  return block;
};
