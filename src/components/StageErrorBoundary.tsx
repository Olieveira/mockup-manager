import { Component } from 'react'
import type { ReactNode } from 'react'
import { PiWarningCircle } from 'react-icons/pi'

interface StageErrorBoundaryProps {
  children: ReactNode
}

interface StageErrorBoundaryState {
  hasError: boolean
}

/**
 * Segura falhas da cena dentro do palco, sem derrubar o resto da interface:
 * chunk da cena que não baixa (comum logo depois de um deploy) ou modelo e
 * cenário que não carregam (o HDRI vem de um CDN externo).
 *
 * Tentar de novo recarrega a página, porque tanto o lazy() quanto o cache de
 * loaders do drei guardam a falha, e só remontar a cena repetiria o erro.
 */
export class StageErrorBoundary extends Component<StageErrorBoundaryProps, StageErrorBoundaryState> {
  state: StageErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): StageErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div role="alert" className="absolute inset-0 grid place-items-center bg-sunken p-6">
        <div className="flex max-w-72 flex-col items-center gap-3 text-center">
          <PiWarningCircle aria-hidden className="size-6 text-danger" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">Não foi possível carregar a cena.</p>
            <p className="text-sm text-ink-muted">Confira a conexão e recarregue a página.</p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-1 h-9 cursor-pointer rounded-control border border-line bg-surface px-3.5 text-sm font-medium transition-colors hover:bg-fill-hover"
          >
            Recarregar
          </button>
        </div>
      </div>
    )
  }
}
