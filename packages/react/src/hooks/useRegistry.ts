import { GlobalRegistry, IDesignerRegistry } from '@gunpla/core'
import { globalThisPolyfill } from '@gunpla/shared'

export const useRegistry = (): IDesignerRegistry => {
  return globalThisPolyfill['__DESIGNER_REGISTRY__'] || GlobalRegistry
}
