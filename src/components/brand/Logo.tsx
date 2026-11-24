interface LogoProps {
  className?: string
}

/**
 * Slot do logo. Enquanto a marca não existe, mostra só uma moldura vazia com
 * marcas de corte, um espaço reservado sem cara de logo definitivo.
 *
 * Para trocar: substitua o SVG abaixo pelo logo (ou por um <img> apontando
 * para public/). Mantenha aria-hidden, porque o nome do app já é lido ao lado.
 */
export function Logo({ className = '' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      aria-hidden
      className={className}
    >
      <path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5" />
    </svg>
  )
}
