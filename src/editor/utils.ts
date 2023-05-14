type EventListener = (args: any) => void;

export const addEventListener = (
  el: HTMLElement,
  event: string,
  listener: EventListener,
  options?: boolean | AddEventListenerOptions
) => {
  el.addEventListener(event, listener, options);
};

export const removeEventListener = (
  el: HTMLElement,
  event: string,
  listener: EventListener,
  options?: EventListenerOptions
) => {
  el.removeEventListener(event, listener, options);
};

export const frameRender = (fn: any) => {
  requestAnimationFrame(fn);
};
