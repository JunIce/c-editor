export const enum KeyCode {
  BACKSPACE = 8,
  ENTER = 13,

  ARROW_LEFT = 37,
  ARROW_UP = 38,
  ARROW_RIGHT = 39,
  ARROW_DOWN = 40,
}

type NumberValues<T> = {
  [K in keyof T]: T[K] extends number ? T[K] : never
}[keyof T]

export type KeyCodeEnum = NumberValues<typeof KeyCode>
