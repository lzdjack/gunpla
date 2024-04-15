import * as React from 'react'
import BasicInfiniteViewer from 'react-infinite-viewer'
import { usePrefix } from '../../hooks'

export interface InfiniteViewerManagerProps {
  children: React.ReactNode
}
export const InfiniteViewer = React.forwardRef<
  BasicInfiniteViewer,
  InfiniteViewerManagerProps
>((props, ref) => {
  const prefix = usePrefix('infinite-viewer')

  return (
    <BasicInfiniteViewer
      ref={ref}
      className={prefix}
      usePinch={true}
      useAutoZoom={false}
      useWheelScroll={true}
      useForceWheel={true}
      useResizeObserver={true}
      pinchThreshold={50}
      maxPinchWheel={3}
    >
      {props.children}
    </BasicInfiniteViewer>
  )
})

InfiniteViewer.displayName = 'InfiniteViewer'
