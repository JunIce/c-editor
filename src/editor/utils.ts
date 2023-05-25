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
  const fontWidth =
    text.metrics!.actualBoundingBoxLeft + text.metrics!.actualBoundingBoxRight
  const leftTop = [text.pos.x, text.pos.y - 16]
  const leftBottom = [text.pos.x, text.pos.y]
  const rightTop = [text.pos.x + fontWidth, text.pos.y - 16]
  const rightBottom = [text.pos.x + fontWidth, text.pos.y]

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
