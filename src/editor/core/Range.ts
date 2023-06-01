import Editor from "../editor"
import Base from "./Base"

export class Range extends Base {
  collapsed: boolean
  commonAncestorContainer: any
  endContainer: any
  endOffset: number | null
  startContainer: any
  startOffset: number | null

  constructor(editor: Editor) {
    super(editor)
    this.collapsed = false
    this.endOffset = null
    this.startOffset = null
  }
}
