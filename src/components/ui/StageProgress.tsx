interface StageProgressProps {
  label: string
  /** Arquivos baixados e total. Sem total, a régua fica indeterminada. */
  done?: number
  total?: number
  /**
   * `center` cobre o palco na primeira carga; `corner` fica num canto sem
   * cobrir a arte, para trocas de modelo, cenário ou arte. No celular o canto
   * é o de cima, já que a folha de ajustes cobre a parte de baixo do palco.
   */
  placement: 'center' | 'corner'
  /** Esconde com transição, para a cena aparecer por baixo. */
  hidden?: boolean
}

function Ruler({ fraction, tickStep }: { fraction: number | null; tickStep: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      {/* Marcações de régua, como nas tiras de controle de uma prova de gráfica */}
      <div
        aria-hidden
        className="h-1.5 border-r border-line-strong"
        style={{
          backgroundImage: `repeating-linear-gradient(to right, var(--line-strong) 0 1px, transparent 1px ${tickStep}%)`,
        }}
      />
      <div aria-hidden className="relative h-[3px] overflow-hidden bg-line">
        {fraction === null ? (
          <div className="absolute inset-y-0 left-0 w-3/10 animate-ruler-scan bg-ink motion-reduce:w-full motion-reduce:animate-none motion-reduce:opacity-35" />
        ) : (
          <div
            className="absolute inset-0 origin-left bg-ink transition-transform duration-300 ease-snappy"
            style={{ transform: `scaleX(${fraction})` }}
          />
        )}
      </div>
    </div>
  )
}

/**
 * Progresso de carregamento da cena em forma de régua, dentro do palco. O
 * elemento pai precisa ser `relative` (ou `absolute`).
 */
export function StageProgress({ label, done = 0, total = 0, placement, hidden = false }: StageProgressProps) {
  const isDeterminate = total > 0
  const fraction = isDeterminate ? Math.min(done / total, 1) : null
  const ariaProps = {
    role: 'progressbar',
    'aria-label': label,
    'aria-valuemin': 0,
    'aria-valuemax': isDeterminate ? total : undefined,
    'aria-valuenow': isDeterminate ? done : undefined,
    'aria-valuetext': isDeterminate ? `${done} de ${total} arquivos` : undefined,
  } as const

  if (placement === 'corner') {
    return (
      <div
        {...ariaProps}
        // O atraso evita piscar em trocas que terminam rápido
        className="pointer-events-none absolute top-3 left-3 flex items-center gap-3 rounded-control border border-line bg-surface py-1.5 pr-2.5 pl-3 text-xs text-ink transition-opacity delay-300 duration-150 starting:opacity-0 sm:top-auto sm:bottom-3"
      >
        <span aria-hidden className="font-medium">
          {label}
        </span>
        <div className="w-14">
          <Ruler fraction={fraction} tickStep={25} />
        </div>
        {isDeterminate && (
          <span aria-hidden className="min-w-6 text-right text-ink-muted tabular-nums">
            {done}/{total}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 grid place-items-center bg-sunken transition-[opacity,visibility] duration-300 ${
        hidden ? 'invisible opacity-0' : ''
      }`}
    >
      <div {...ariaProps} aria-hidden={hidden || undefined} className="flex w-52 flex-col gap-2 text-xs">
        <div aria-hidden className="flex items-baseline justify-between gap-3">
          <span className="font-medium text-ink">{label}</span>
          {isDeterminate && (
            <span className="text-ink-muted tabular-nums">
              {done} de {total}
            </span>
          )}
        </div>
        <Ruler fraction={fraction} tickStep={10} />
      </div>
    </div>
  )
}
