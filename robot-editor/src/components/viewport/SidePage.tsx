import './SidePane.css'
import { useEditorStore } from '../../store/editorStore'

export function SidePane() {
  const addBase = useEditorStore((state) => state.addBase)

  return (
    <aside
      className="viewer-side-pane"
      aria-label="Skeleton tools"
    >
      <button type="button" className="side-pane-button" onClick={addBase}>
        Add base
      </button>
    </aside>
  )
}
