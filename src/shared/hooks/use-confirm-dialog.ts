import { useState } from 'react'

interface ConfirmDialogState {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
}

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setState({
      isOpen: true,
      title,
      message,
      onConfirm,
    })
  }

  const hideConfirm = () => {
    setState((prev) => ({ ...prev, isOpen: false }))
  }

  const handleConfirm = () => {
    state.onConfirm()
    hideConfirm()
  }

  return {
    ...state,
    showConfirm,
    hideConfirm,
    handleConfirm,
  }
}
