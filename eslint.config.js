import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    // Batch #12 R7-Nachfix (Lint gate-fähig, Operator 2026-07-19):
    // Die EXPERIMENTELLEN react-hooks-v6-Compiler-Lints (set-state-in-effect,
    // immutability, purity, globals) laufen als WARNUNG statt Fehler — sie
    // flaggen etablierte, test-gedeckte Muster (localStorage-Init in
    // Providern) und die GESCHÜTZTE Fläche InkWave.tsx, deren Umbau explizite
    // Operator-Review bräuchte. Sichtbar bleiben sie; neue Runden sollen
    // keine neuen Warnungen einführen. Die KLASSISCHE rules-of-hooks-Regel
    // (bedingte Hooks) bleibt FEHLER.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/globals': 'warn',
    },
  },
  // shadcn/ui-Dateien + Provider exportieren neben der Komponente bewusst
  // Varianten/Hooks/Konstanten (Bibliotheks-Muster). Die Fast-Refresh-DX-Regel
  // ist dort kein Laufzeit-/Korrektheitsrisiko — aus, nur für diese Pfade.
  {
    files: ['src/components/ui/**', 'src/store/*.tsx', 'src/i18n/I18nProvider.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
