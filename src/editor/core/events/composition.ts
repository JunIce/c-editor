import Editor from "../../editor"

export const onCompositionStart =
  (editor: Editor) => (event: KeyboardEvent) => {
    editor.cursor.composing = true
  }

export const onCompositionEnd = (editor: Editor) => (event: KeyboardEvent) => {
  editor.cursor.composing = false
}
