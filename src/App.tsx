import { useMemo, useState } from "react";

/* ---------- Tipos ---------- */
type Pregunta = { id: number; texto: string };

type Rango = {
  badge: "Muy pobre" | "Regular" | "Sólido";
  tono: string;
  bg: string;
  heading: string;
  detail: string;
};

/* ---------- Preguntas ---------- */
const preguntas: Pregunta[] = [
  { id: 1, texto: "¿Recibes reportes de puntualidad por ruta y unidad con indicadores claros?" },
  { id: 2, texto: "¿Tu proveedor garantiza al menos un 95% de cumplimiento en horarios?" },
  { id: 3, texto: "¿Tus empleados viajan en unidades recientes, con clima y mantenimiento preventivo al día?" },
  { id: 4, texto: "¿Los choferes cuentan con capacitación en manejo defensivo y protocolos de seguridad?" },
  { id: 5, texto: "¿Las unidades ofrecen comodidad suficiente para llegadas con buen ánimo y energía?" },
  { id: 6, texto: "¿El proveedor entiende que el transporte influye en la rotación y el compromiso del personal?" },
  { id: 7, texto: "Si falla una unidad, ¿recibes reposición inmediata?" },
  { id: 8, texto: "¿Existen protocolos probados para incidentes en ruta o bloqueos?" },
  { id: 9, texto: "¿Puedes contactar a más de una persona responsable en caso de incidencia?" },
  { id: 10, texto: "¿Hay tres niveles de escalación (operador, coordinador, dirección) para resolver rápido?" },
  { id: 11, texto: "¿Cuentas con acceso a monitoreo en tiempo real de tus unidades?" },
  { id: 12, texto: "¿Puedes saber quién subió y quién no al inicio del turno?" },
];

/* ---------- Textos por rango ---------- */
const textos: Record<"bajo" | "medio" | "alto", Rango> = {
  bajo: {
    badge: "Muy pobre",
    tono: "text-red-700",
    bg: "bg-red-50",
    heading: "❌ Necesitas revisar tu servicio de transporte.",
    detail:
      "Definitivamente hay incumplimientos recurrentes en puntualidad por ruta/unidad, cobertura de turnos, protocolos de contingencia y control operativo. " +
      "Persistir con este nivel de servicio impacta el estado de ánimo desde el abordaje, reduce el desempeño en turno, eleva costos (horas extra, reprocesos) " +
      "y expone a la empresa a riesgos de seguridad y reputacionales. Se requiere un plan inmediato de estabilización con responsables, métricas y fechas de cierre.",
  },
  medio: {
    badge: "Regular",
    tono: "text-amber-700",
    bg: "bg-amber-50",
    heading: "⚠️ Hay cosas que mejorar.",
    detail:
      "Hay evidentes brechas en confiabilidad operativa y control del servicio: puntualidad por ruta/unidad variable, cobertura incompleta y protocolos " +
      "de contingencia poco robustos. Mantener estas brechas incrementa tardanzas y ausentismo, afecta el estado de ánimo desde el abordaje, reduce desempeño y eleva costos. " +
      "Corregir de inmediato estabiliza el servicio y mejora la experiencia laboral desde el primer contacto del día.",
  },
  alto: {
    badge: "Sólido",
    tono: "text-emerald-700",
    bg: "bg-emerald-50",
    heading: "🚍 Tienes un transporte de personal sólido.",
    detail:
      "¡Felicidades! Tienes un nivel alto de cumplimiento en puntualidad por ruta, cobertura de turnos, protocolos de contingencia, " +
      "mantenimiento y seguridad de unidades, además de esquemas claros de escalación y atención ejecutiva. La operación cuenta con trazabilidad y reportes " +
      "suficientes para asegurar continuidad y mejora continua.",
  },
} as const;

function rango(total: number): Rango {
  if (total <= 11) return textos.bajo;
  if (total <= 18) return textos.medio;
  return textos.alto;
}

/* ---------- Panel del resultado (lo usamos dentro del modal) ---------- */
function ResultadoPanel({ data, total }: { data: Rango; total: number }) {
  return (
    <section className={`rounded-2xl p-5 ${data.bg}`}>
      <p className="text-sm font-semibold tracking-wide">
        RESULTADO: <span className="ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold">{data.badge}</span>
        <span className="ml-2 text-neutral-500">| Total: {total} / 24</span>
      </p>
      <p className={`mt-3 font-bold ${data.tono}`}>{data.heading}</p>
      <p className="mt-2">{data.detail}</p>
    </section>
  );
}

/* ---------- Modal de contacto + resultado ---------- */
function ModalContacto({
  abierto,
  onClose,
  total,
}: {
  abierto: boolean;
  onClose: () => void;
  total: number;
}) {
  const datos = rango(total);
  const [nombre, setNombre] = useState("");
  const [puesto, setPuesto] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [correo, setCorreo] = useState("");
  const [celular, setCelular] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!abierto) return null;

  async function enviar() {
    if (!nombre.trim() || !correo.trim()) {
      alert("Nombre y correo son obligatorios.");
      return;
    }
    setEnviando(true);
    try {
      const resp = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          puesto: puesto.trim(),
          empresa: empresa.trim(),
          correo: correo.trim(),
          celular: celular.trim(),
          total,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        alert("No se pudo enviar. Intenta de nuevo.\n" + (data?.error || ""));
        setEnviando(false);
        return;
      }
      alert("¡Enviado! Gracias.");
      onClose();
    } catch (e) {
      alert("No se pudo enviar. Intenta de nuevo.");
      setEnviando(false);
    }
  }

  return (
    <>
      {/* fondo oscuro */}
      <div className="fixed inset-0 z-40 bg-black/50" />
      {/* modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Resultado del diagnóstico</h3>
            <button className="rounded p-2 hover:bg-neutral-100" onClick={onClose}>✕</button>
          </div>

          <ResultadoPanel data={datos} total={total} />

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm">Nombre*</label>
              <input value={nombre} onChange={(e)=>setNombre(e.target.value)} className="mt-1 w-full rounded-lg border p-2" />
            </div>
            <div>
              <label className="text-sm">Puesto</label>
              <input value={puesto} onChange={(e)=>setPuesto(e.target.value)} className="mt-1 w-full rounded-lg border p-2" />
            </div>
            <div>
              <label className="text-sm">Empresa</label>
              <input value={empresa} onChange={(e)=>setEmpresa(e.target.value)} className="mt-1 w-full rounded-lg border p-2" />
            </div>
            <div>
              <label className="text-sm">Correo*</label>
              <input value={correo} onChange={(e)=>setCorreo(e.target.value)} type="email" className="mt-1 w-full rounded-lg border p-2" />
            </div>
            <div>
              <label className="text-sm">Celular</label>
              <input value={celular} onChange={(e)=>setCelular(e.target.value)} className="mt-1 w-full rounded-lg border p-2" />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button className="rounded-xl bg-neutral-100 px-3 py-2" onClick={onClose}>Cerrar</button>
            <button
              className="rounded-xl bg-black px-3 py-2 text-white disabled:opacity-60"
              onClick={enviar}
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Enviar y cerrar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [respuestas, setRespuestas] = useState<Record<number, number | null>>({});
  const [abrirModal, setAbrirModal] = useState(false);

  const total = useMemo(
    () => preguntas.reduce((acc, p) => acc + (respuestas[p.id] ?? 0), 0),
    [respuestas]
  );
  const faltantes = useMemo(
    () => preguntas.filter((p) => respuestas[p.id] === undefined || respuestas[p.id] === null).length,
    [respuestas]
  );

  const setValor = (id: number, val: number) => {
    setRespuestas((prev) => ({ ...prev, [id]: val }));
  };

  const reiniciar = () => setRespuestas({});
  const imprimir = () => window.print();

  const verResultado = () => {
    if (faltantes > 0) {
      alert(`Te faltan ${faltantes} preguntas por contestar.`);
      return;
    }
    setAbrirModal(true);
  };

  return (
    <>
      {/* Fondo con imagen */}
      <div className="fixed inset-0 -z-10 bg-[url('/Fondo.png')] bg-cover bg-center bg-no-repeat" aria-hidden="true" />
      {/* Velo (transparente) */}
      <div className="fixed inset-0 -z-10 bg-white/40" aria-hidden="true" />

      <main className="mx-auto max-w-3xl p-6">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/quokka-logo.png" alt="Grupo Quokka" className="h-10 sm:h-12" />
            </div>

            <div className="flex gap-2 print:hidden">
              <button onClick={reiniciar} className="rounded-xl bg-white px-3 py-2 shadow hover:bg-neutral-50">
                Reiniciar
              </button>
              <button onClick={imprimir} className="rounded-xl bg-black px-3 py-2 text-white shadow hover:opacity-90">
                Imprimir / PDF
              </button>
              <button
                onClick={verResultado}
                className="rounded-xl bg-emerald-600 px-3 py-2 text-white shadow hover:opacity-90 disabled:opacity-60"
                disabled={faltantes > 0}
              >
                Ver resultado
              </button>
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-bold">¿Qué tan bueno es tu proveedor de transporte?</h1>
          <p className="text-sm text-neutral-600">
            ¡Encuentra las debilidades y fortalezas de tu servicio de transporte con este sencillo test!
          </p>
        </header>

        <div className="mb-3 text-sm text-neutral-600">
          Total: <span className="font-semibold">{total}</span> / 24 · Faltantes:{" "}
          <span className="font-semibold">{faltantes}</span>
        </div>

        {/* Preguntas */}
        <div className="space-y-4">
          {preguntas.map((p) => (
            <div key={p.id} className="rounded-xl border bg-white/90 p-4 shadow">
              <p className="font-medium">
                {p.id}. {p.texto}
              </p>
              <div className="mt-2 flex gap-6">
                {[{ label: "Sí", val: 2 }, { label: "Parcial", val: 1 }, { label: "No", val: 0 }].map((opt) => (
                  <label key={opt.val} className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name={`q_${p.id}`}
                      value={opt.val}
                      checked={respuestas[p.id] === opt.val}
                      onChange={() => setValor(p.id, opt.val)}
                      className="h-4 w-4"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal (resultado + formulario) */}
      <ModalContacto abierto={abrirModal} onClose={() => setAbrirModal(false)} total={total} />
    </>
  );
}
