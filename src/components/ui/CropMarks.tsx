const CORNERS = [
  '-top-3 -left-3',
  '-top-3 -right-3 -scale-x-100',
  '-bottom-3 -left-3 -scale-y-100',
  '-right-3 -bottom-3 -scale-100',
]

/**
 * Marcas de corte de gráfica nos quatro cantos do elemento pai, que precisa
 * ser `relative` e ter ao menos 12px livres em volta.
 */
export function CropMarks() {
  return CORNERS.map((corner) => (
    <svg
      key={corner}
      viewBox="0 0 12 12"
      aria-hidden
      className={`pointer-events-none absolute size-3 text-line-strong ${corner}`}
    >
      <path d="M0 11.5H8M11.5 0V8" stroke="currentColor" fill="none" />
    </svg>
  ))
}
