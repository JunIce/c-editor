import Editor from "../../editor"

export const onMouseUp = (editor: Editor) => {
  return (e: MouseEvent) => {
    editor.isPointerDown = false
  }
}
