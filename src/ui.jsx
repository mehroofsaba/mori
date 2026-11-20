import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import TaskModal from './components/TaskModal'

const Ctx = createContext(null)
export const useUI = () => useContext(Ctx)

export function UIProvider({ children }) {
  const [toast, setToast] = useState(null)
  const [modal, setModal] = useState(null)
  const notify = useCallback((msg) => setToast({ msg, id: Date.now() }), [])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])
  return (
    <Ctx.Provider value={{ notify, openTask: (task = null) => setModal({ task }) }}>
      {children}
      <AnimatePresence>{modal && <TaskModal key="modal" task={modal.task} onClose={() => setModal(null)} onSaved={notify} />}</AnimatePresence>
      <div className="toast-wrap" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.div className="toast" key={toast.id} initial={{ y: 30, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}
