import Editor from "../editor"

export interface RangeCtx {
  startNode: any
  endNode: any
  collapsed: boolean
}

export const createRangeCtx = (editor: Editor) => {
  return () => {
    const range: RangeCtx = {
      startNode: null,
      endNode: null,
      collapsed: true,
    }
    return range
  }
}
