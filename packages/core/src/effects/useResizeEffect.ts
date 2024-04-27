import { Engine, CursorDragType } from '../models'
import { DragStartEvent, DragMoveEvent, DragStopEvent } from '../events'

export const useResizeEffect = (engine: Engine) => {
  const findStartNodeHandler = (target: HTMLElement) => {
    const handler = target?.closest(
      `*[${engine.props.nodeResizeHandlerAttrName}]`
    )
    if (handler) {
      const direction = handler.getAttribute(
        engine.props.nodeResizeHandlerAttrName
      )
      if (direction) {
        const element = handler.closest(
          `*[${engine.props.nodeSelectionIdAttrName}]`
        )
        if (element) {
          const nodeId = element.getAttribute(
            engine.props.nodeSelectionIdAttrName
          )
          if (nodeId) {
            const node = engine.findNodeById(nodeId)
            if (node) {
              return { direction, node, element }
            }
          }
        }
      }
    }
    return
  }

  const setResizable = (node) => {
    const element = node.getElement()
    const rect = node.getElementOffsetRect()

    node.props = node.props || {}
    node.props.style = node.props.style || {}
    node.props.style.width = rect.width + 'px'
    node.props.style.height = rect.height + 'px'

    const allowResize = node.allowResize()
    if (allowResize) {
      const allowX = allowResize.includes('x')
      if (allowX) {
        const width = node.designerProps.resizable?.width?.(
          node,
          element,
          rect.width
        )
        width?.minus()
        width?.minus()
      }

      const allowY = allowResize.includes('y')
      if (allowY) {
        const height = node.designerProps.resizable?.height?.(
          node,
          element,
          rect.height
        )
        height?.minus()
        height?.minus()
      }
    }
  }

  engine.subscribeTo(DragStartEvent, (event) => {
    const target = event.data.target as HTMLElement
    const currentWorkspace =
      event.context?.workspace ?? engine.workbench.activeWorkspace
    if (!currentWorkspace) return
    const handler = findStartNodeHandler(target)
    const helper = currentWorkspace.operation.transformHelper
    if (handler) {
      const selectionElement = handler.element.closest(
        `*[${engine.props.nodeSelectionIdAttrName}]`
      ) as HTMLElement
      if (selectionElement) {
        const nodeId = selectionElement.getAttribute(
          engine.props.nodeSelectionIdAttrName
        )
        if (nodeId) {
          const node = engine.findNodeById(nodeId)
          if (node) {
            helper.dragStart({
              dragNodes: [node],
              type: 'resize',
              direction: handler.direction,
            })

            setResizable(node)
          }
        }
      }
    }
  })

  engine.subscribeTo(DragMoveEvent, (event) => {
    if (engine.cursor.dragType !== CursorDragType.Resize) return
    const currentWorkspace =
      event.context?.workspace ?? engine.workbench.activeWorkspace
    const helper = currentWorkspace?.operation.transformHelper
    const dragNodes = helper.dragNodes
    if (!dragNodes.length) return
    helper.dragMove()
    dragNodes.forEach((node) => {
      const element = node.getElement()
      helper.resize(node, (rect) => {
        element.style.width = rect.width + 'px'
        element.style.height = rect.height + 'px'
        element.style.position = 'absolute'
        element.style.left = '0px'
        element.style.top = '0px'
        element.style.transform = `translate3d(${rect.x}px,${rect.y}px,0)`
      })
    })
  })

  engine.subscribeTo(DragStopEvent, (event) => {
    if (engine.cursor.dragType !== CursorDragType.Resize) return
    const currentWorkspace =
      event.context?.workspace ?? engine.workbench.activeWorkspace
    const helper = currentWorkspace?.operation.transformHelper
    const dragNodes = helper.dragNodes
    if (!dragNodes.length) return
    dragNodes.forEach((node) => setResizable(node))

    if (helper) helper.dragEnd()
  })
}
