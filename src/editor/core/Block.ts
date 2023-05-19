import Text from "./Text"

export interface BlockContext {
  texts: Text[]
  height: number // current block height
  push: (text: Text) => void
  delete: () => void
}

export const createBlockContext = (): BlockContext => {
  const block: BlockContext = {
    texts: [],
    height: 0,
    push: (text: Text) => {
      block.texts.push(text)
    },
    delete: () => {
      block.texts.pop()
    },
  }

  return block
}
