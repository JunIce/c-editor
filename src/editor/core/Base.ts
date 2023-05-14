import Editor, { ConfigProps } from "../editor";

export default class Base {
  editor!: Editor;
  constructor(editor: Editor) {
    this.editor = editor;
  }

  get container() {
    return this.editor.container;
  }
  get ctx(): CanvasRenderingContext2D {
    return this.editor.ctx;
  }

  get config(): ConfigProps {
    return this.editor.config;
  }
}
