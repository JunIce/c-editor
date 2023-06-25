import Editor from "../editor"

export enum NativeEventType {
  MOUSE_DOWN = "mousedown",
}

export enum EventType {
  RENDER = "RENDER",
  TEXT_DELETE = "TEXT_DELETE",
  INSERT_PARAGRAPH = "INSERT_PARAGRAPH",
  DIRECTION_KEY = "DIRECTION_KEY",
  MOVE_CURSOR = "MOVE_CURSOR",
  SELECTION_RANGE = "SELECTION_RANGE",
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

  emit(eventName: string, ...args: any[]): void {
    this.eventMap[eventName].forEach((f: Function) => f.call(null, ...args))
  }
}
