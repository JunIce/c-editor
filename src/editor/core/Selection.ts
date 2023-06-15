import Editor from "../editor"
import Base from "./Base"
import { RangeCtx } from "./Range"

export class Selection extends Base {
  startNode: RangeCtx | null
  endNode: RangeCtx | null
  _range: RangeCtx | null

  constructor(editor: Editor) {
    super(editor)
    this.startNode = null
    this.endNode = null
    this._range = null
  }

  getRange() {
    return this._range
  }

  setRange(range: RangeCtx) {
    this._range = range
  }
}
