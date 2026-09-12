import { useBeforeUnload, useBlocker } from 'react-router-dom'
import { useCallback } from 'react'

export function useUnsavedChanges(when: boolean) {
  useBeforeUnload(useCallback((event) => {
    if (!when) return
    event.preventDefault()
    event.returnValue = true
  }, [when]))

  const blocker = useBlocker(when)

  return {
    blocked: blocker.state === 'blocked',
    proceed: () => {
      if (blocker.state === 'blocked') blocker.proceed()
    },
    reset: () => {
      if (blocker.state === 'blocked') blocker.reset()
    },
  }
}
