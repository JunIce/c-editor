import { RenderElementText } from "./core/CanvasCtx"

type EventListener = (args: any) => void

export const addEventListener = (
  el: HTMLElement,
  event: string,
  listener: EventListener,
  options?: boolean | AddEventListenerOptions
) => {
  el.addEventListener(event, listener, options)
}

export const removeEventListener = (
  el: HTMLElement,
  event: string,
  listener: EventListener,
  options?: EventListenerOptions
) => {
  el.removeEventListener(event, listener, options)
}

export const frameRender = (fn: any) => {
  requestAnimationFrame(fn)
}

export const computedTextMetries = (text: RenderElementText) => {
  const leftTop = [text.x, text.y - text.height]
  const leftBottom = [text.x, text.y]
  const rightTop = [text.x + text.width, text.y - text.height]
  const rightBottom = [text.x + text.width, text.y]

  return {
    leftTop,
    leftBottom,
    rightTop,
    rightBottom,
  }
}

export const insertStrFromIdx = (s = "", idx: number, insert = "") => {
  return s.substring(0, idx) + insert + s.substring(idx)
}
