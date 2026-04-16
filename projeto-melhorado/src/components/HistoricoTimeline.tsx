import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HistoricoItem, STATUS_CORES } from '@/types/fornecedor';
import { ArrowRight, User } from 'lucide-react';

interface HistoricoTimelineProps {
  historico: HistoricoItem[];
}

function StatusPill({ status }: { status: string }) {
  const cls = STATUS_CORES[status] ?? 'badge-pendente';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export function HistoricoTimeline({ historico }: HistoricoTimelineProps) {
  if (!historico.length) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        Nenhuma alteração registrada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {historico.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          {/* Linha do tempo */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-brand-navy/10 border-2 border-brand-navy/20 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-brand-navy" />
            </div>
            {index < historico.length - 1 && (
              <div className="w-px flex-1 bg-border my-1" />
            )}
          </div>

          {/* Conteúdo */}
          <div className="pb-6 flex-1 min-w-0">
            {/* Status change */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {item.status_anterior ? (
                <>
                  <StatusPill status={item.status_anterior} />
                  <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <StatusPill status={item.status_novo} />
                </>
              ) : (
                <>
                  <span className="text-xs text-muted-foreground italic">cadastro criado</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <StatusPill status={item.status_novo} />
                </>
              )}
            </div>

            {/* Motivo */}
            {item.motivo && (
              <p className="text-sm text-foreground bg-muted/50 rounded-lg px-3 py-2 mt-1.5 border border-border/60">
                "{item.motivo}"
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-muted-foreground">
                {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {item.admin_email}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
