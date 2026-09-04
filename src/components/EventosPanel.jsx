import { useState } from 'react'
import { CalendarDays, MapPin, Users, X, Phone, ClipboardList, Store } from 'lucide-react'
import { formatarNumero, formatarData, mascararNome, mascararContato, capitalizarNome } from '../utils/helpers'

function SummaryCard({ icon, label, valor, sub, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-institucional-border shadow-card p-4 flex items-center gap-3.5">
      <div className={`shrink-0 rounded-xl p-3 ${accent}`}>{icon}</div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-institucional-deep">{formatarNumero(valor)}</p>
        <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

function EventoCard({ evento, onAbrir }) {
  const local = [evento.bairro, evento.municipioNome].filter(Boolean).join(' — ') || evento.local

  return (
    <button
      onClick={() => onAbrir(evento.id)}
      className="text-left rounded-2xl border border-institucional-border bg-white shadow-card hover:shadow-cardHover transition-shadow p-4 flex flex-col gap-2.5"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-extrabold text-institucional-deep leading-snug">{evento.evento}</h3>
        <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold bg-institucional-soft text-institucional-vibrant rounded-full px-2.5 py-1">
          <Users size={12} /> {evento.totalParticipantes}
        </span>
      </div>
      {evento.atividade && evento.atividade !== evento.evento && (
        <p className="text-xs text-gray-500 line-clamp-2">{evento.atividade}</p>
      )}
      <div className="mt-auto flex flex-col gap-1 pt-1.5 border-t border-institucional-border">
        {evento.data && (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
            <CalendarDays size={13} className="text-institucional-textAlt" /> {formatarData(evento.data)}
          </span>
        )}
        {local && (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
            <MapPin size={13} className="text-institucional-textAlt" /> {local}
          </span>
        )}
      </div>
    </button>
  )
}

function AtaModal({ evento, lgpdOn, onClose }) {
  const local = [evento.bairro, evento.municipioNome].filter(Boolean).join(' — ')

  return (
    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-institucional-border">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-institucional-border">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-institucional-vibrant font-semibold">Ata de Presença</p>
            <h3 className="text-base font-extrabold text-institucional-deep leading-snug">{evento.evento}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 shrink-0 rounded-lg hover:bg-institucional-soft flex items-center justify-center text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3 border-b border-institucional-border bg-institucional-soft/40">
          {evento.atividade && (
            <p className="text-xs text-gray-600"><span className="font-semibold text-institucional-text">Atividade:</span> {evento.atividade}</p>
          )}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-600">
            {evento.data && (
              <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} className="text-institucional-textAlt" /> {formatarData(evento.data)}</span>
            )}
            {(local || evento.local) && (
              <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="text-institucional-textAlt" /> {local || evento.local}</span>
            )}
            {evento.responsaveis && (
              <span className="inline-flex items-center gap-1.5"><ClipboardList size={13} className="text-institucional-textAlt" /> Responsável: {evento.responsaveis}</span>
            )}
            <span className="inline-flex items-center gap-1.5 font-semibold text-institucional-vibrant"><Users size={13} /> {evento.totalParticipantes} participante(s)</span>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0">
              <tr className="bg-institucional-soft text-institucional-text text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2 font-bold w-10">Nº</th>
                <th className="text-left px-3 py-2 font-bold">Nome</th>
                <th className="text-left px-3 py-2 font-bold">Telefone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-institucional-border">
              {evento.participantes.map((p, i) => (
                <tr key={i} className="hover:bg-institucional-bg transition-colors">
                  <td className="px-4 py-1.5 text-gray-400">{p.numero}</td>
                  <td className="px-3 py-1.5 font-medium text-gray-800">{lgpdOn ? mascararNome(p.nome) : capitalizarNome(p.nome)}</td>
                  <td className="px-3 py-1.5 text-gray-600">
                    {p.telefone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone size={11} className="text-institucional-textAlt" />
                        {lgpdOn ? mascararContato(p.telefone) : p.telefone}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function EventosPanel({ eventos, totalParticipacoes, totalEmpreendedoras, lgpdOn }) {
  const [eventoAbertoId, setEventoAbertoId] = useState(null)
  const eventoAberto = eventos.find((e) => e.id === eventoAbertoId) ?? null

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-3.5">
        <SummaryCard
          icon={<Users size={24} className="text-institucional-vibrant" />}
          label="Total de Participações em Eventos"
          valor={totalParticipacoes}
          sub={`Somatório de assinaturas nas ${eventos.length} atas de presença carregadas`}
          accent="bg-institucional-soft"
        />
        <SummaryCard
          icon={<Store size={24} className="text-institucional-amber" />}
          label="Mulheres Empreendedoras"
          valor={totalEmpreendedoras}
          sub="Cadastradas no programa Empreende Mulher"
          accent="bg-amber-50"
        />
      </div>

      <div>
        <h2 className="text-base font-extrabold text-institucional-deep mb-3">Eventos — Atas de Presença</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {eventos.map((evento) => (
            <EventoCard key={evento.id} evento={evento} onAbrir={setEventoAbertoId} />
          ))}
        </div>
      </div>

      {eventoAberto && <AtaModal evento={eventoAberto} lgpdOn={lgpdOn} onClose={() => setEventoAbertoId(null)} />}
    </div>
  )
}
