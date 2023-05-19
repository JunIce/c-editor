import Editor from "../editor"

export enum EventType {
  RENDER = "RENDER",
  TEXT_DELETE = "TEXT_DELETE",
}

export class EventManager {
  eventMap: Record<string, any>
  editor: Editor
  constructor(editor: Editor) {
    this.editor = editor
    this.eventMap = {}
  }

  on(eventName: string, handler: Function) {
    this.eventMap[eventName] = this.eventMap[eventName] || []
    this.eventMap[eventName].push(handler)
  }

  emit(eventName: string) {
    this.eventMap[eventName].forEach((f: Function) => f(this.editor))
  }
}
