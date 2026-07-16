import { Sun, Moon } from 'lucide-react'

const ThemeToggle = ({ theme, onToggle }) => (
  <button
    onClick={onToggle}
    aria-label="Toggle theme"
    className="btn-ghost p-2"
    style={{ padding: '7px' }}
  >
    {theme === 'dark'
      ? <Sun size={16} />
      : <Moon size={16} />
    }
  </button>
)

export default ThemeToggle
