import { Engine, CursorDragType, TreeNode } from '../models'
import { DragStartEvent, DragMoveEvent, DragStopEvent } from '../events'
import { Point, calcElementTranslate } from '@gunpla/shared'
import { TransformHelper } from '../models/TransformHelper'

export const useTranslateEffect = (engine: Engine) => {
  const setTranslatable = (node: TreeNode, helper: TransformHelper) => {
    const element = node.getElement()
    const rect = calcElementTranslate(element)

    const x = rect.x + helper.deltaX,
      y = rect.y + helper.deltaY

    const point = new Point(x, y)

    const horizontal = node?.designerProps?.translatable?.x(node, element, x)
    const vertical = node?.designerProps?.translatable?.y(node, element, y)
    horizontal.translate(point)
    vertical.translate(point)
  }

  engine.subscribeTo(DragStartEvent, (event) => {
    const target = event.data.target as HTMLElement
    const currentWorkspace =
      event.context?.workspace ?? engine.workbench.activeWorkspace
    const handler = target?.closest(`*[${engine.props.nodeTranslateAttrName}]`)
    if (!currentWorkspace) return
    const helper = currentWorkspace.operation.transformHelper
    if (handler) {
      const type = handler.getAttribute(engine.props.nodeTranslateAttrName)
      if (type) {
        const selectionElement = handler.closest(
          `*[${engine.props.nodeSelectionIdAttrName}]`
        ) as HTMLElement
        if (selectionElement) {
          const nodeId = selectionElement.getAttribute(
            engine.props.nodeSelectionIdAttrName
          )
          if (nodeId) {
            const node = engine.findNodeById(nodeId)
            if (node) {
              helper.dragStart({ dragNodes: [node], type: 'translate' })
              setTranslatable(node, helper)
            }
          }
        }
      }
    }
  })
  engine.subscribeTo(DragMoveEvent, (event) => {
    if (engine.cursor.dragType !== CursorDragType.Translate) return
    const currentWorkspace =
      event.context?.workspace ?? engine.workbench.activeWorkspace
    const helper = currentWorkspace?.operation.transformHelper
    const dragNodes = helper.dragNodes
    if (!dragNodes.length) return
    helper.dragMove()
    dragNodes.forEach((node) => {
      const element = node.getElement()
      helper.translate(node, (translate) => {
        element.style.position = 'absolute'
        element.style.left = '0px'
        element.style.top = '0px'
        element.style.transform = `translate3d(${translate.x}px,${translate.y}px,0)`
      })
    })
  })
  engine.subscribeTo(DragStopEvent, (event) => {
    if (engine.cursor.dragType !== CursorDragType.Translate) return
    const currentWorkspace =
      event.context?.workspace ?? engine.workbench.activeWorkspace
    const helper = currentWorkspace?.operation.transformHelper
    const dragNodes = helper.dragNodes
    if (!dragNodes.length) return
    dragNodes.forEach((node) => setTranslatable(node, helper))
    if (helper) helper.dragEnd()
  })
}
