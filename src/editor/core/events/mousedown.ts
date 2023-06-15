import Editor from "../../editor"

export function onMouseDown(editor: Editor) {
  return (e: MouseEvent): void => {
    const { clientX, clientY } = e
    let { offsetTop, offsetLeft, clientWidth, clientHeight } = editor.container
    const { paddingY, paddingX } = editor.config

    const scrollTop = editor.scrollTop
    // editor.testPoint(clientX - offsetLeft, clientY + scrollTop - offsetTop)
    // 判断是否是点击区域
    if (
      clientX >= offsetLeft + paddingX &&
      clientY + scrollTop >= offsetTop + paddingY &&
      clientX <= clientWidth + offsetLeft - paddingX &&
      clientY + scrollTop <= clientHeight + offsetTop - paddingY
    ) {
      const position = editor.blocksContainer.computedPositionElementByXY(
        clientX - offsetLeft - paddingX,
        clientY + scrollTop - offsetTop - paddingY
      )
      console.log("", position)

      editor.cursor.setPosition(position)
      editor.cursor.move()
      e.preventDefault()
    } else {
      editor.cursor.blur()
    }
  }
}
