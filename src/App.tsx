import { useMemo, useState, useEffect } from "react";

/* ---------- Tipos ---------- */
type Pregunta = { id: number; texto: string };

type Rango = {
  badge: "Muy pobre" | "Regular" | "Sólido";
  tono: string;
  bg: string;
  heading: string;
  detail: string;
};

/* ---------- Preguntas (KOP) ---------- */
const preguntas: Pregunta[] = [
  { id: 1, texto: "¿Tienes un proceso documentado de contención inicial (< 60 min) con segregación y etiquetado de producto sospechoso?" },
  { id: 2, texto: "¿Cuentas con personal de inspección/residentes disponible 24/7 para picos, lanzamientos o eventos no planificados?" },
  { id: 3, texto: "¿Tu proveedor garantiza asistencia y puntualidad mediante transporte propio o esquemas de respaldo?" },
  { id: 4, texto: "¿Operas sorting 100% y retrabajos con instrucciones aprobadas, muestras/fotos y trazabilidad por lote/turno?" },
  { id: 5, texto: "¿Tienes residente de calidad con reporte diario (hallazgos, PPM, scrap/horas, costos) y comunicación con áreas clave?" },
  { id: 6, texto: "¿Gestionas envío controlado (CSL1/CSL2) con criterios claros de entrada/salida y evidencia de cumplimiento?" },
  { id: 7, texto: "¿Tu tiempo de reacción desde el aviso hasta presencia en línea es < 60 minutos en promedio?" },
  { id: 8, texto: "¿El personal cuenta con entrenamiento y validación de habilidades (gages, ESD, seguridad, poka-yokes)?" },
  { id: 9, texto: "¿Los retrabajos/ensamble controlado se realizan con herramientas/jigs validados, registros de torque/calibración y FTQ antes de liberar?" },
  { id: 10, texto: "¿Existe escalamiento 24/7 con niveles (operativo, supervisor, gerencia) y SLAs/SLTs de respuesta definidos?" },
  { id: 11, texto: "¿Tu proveedor propone mejoras (reducción de PPM/costos) y da seguimiento hasta validar la efectividad?" },
  { id: 12, texto: "¿Cuentas con REPSE vigente, ISO 9001 y cumplimiento de requisitos del cliente (inducción, EHS, NDA, acceso)?" },
];

/* ---------- Textos por rango ---------- */
const textos: Record<"bajo" | "medio" | "alto", Rango> = {
  bajo: {
    badge: "Muy pobre",
    tono: "text-red-700",
    bg: "bg-red-50",
    heading: "Necesitas estabilizar tu soporte de calidad.",
    detail:
      "La evaluación evidencia brechas críticas en contención, tiempos de reacción y gobierno operativo. " +
      "Recomendado: célula de contención 24/7, residente en planta, estándar de sorting/retrabajo con trazabilidad y escalamiento efectivo.",
  },
  medio: {
    badge: "Regular",
    tono: "text-amber-700",
    bg: "bg-amber-50",
    heading: "Hay brechas relevantes por cerrar.",
    detail:
      "Tienes práctica parcial. Formaliza tiempos de reacción, evidencia, trazabilidad y escalamiento; " +
      "agrega propuesta de mejora con impacto en PPM/costos y valida efectividad.",
  },
  alto: {
    badge: "Sólido",
    tono: "text-emerald-700",
    bg: "bg-emerald-50",
    heading: "Soporte de calidad bien controlado.",
    detail:
      "Mantén auditorías de proceso, revisa SLAs periódicamente y renueva entrenamientos/validaciones para sostener el nivel.",
  },
} as const;

/* ---------- Reglas de rango ---------- */
function rango(total: number): Rango {
  if (total <= 11) return textos.bajo;
  if (total <= 18) return textos.medio;
  return textos.alto;
}

/* ---------- Utilidades ---------- */
function ResultadoPanel({ data, total }: { data: Rango; total: number }) {
  return (
    <section className={`mt-4 rounded-2xl p-5 ${data.bg}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold tracking-wide">
          RESULTADO:{" "}
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${data.tono}`}
          >
            {data.badge}
          </span>
        </p>
        <p className="text-xs text-neutral-500">| Total: {total} / 24</p>
      </div>

      <p className={`mt-3 font-bold ${data.tono}`}>{data.heading}</p>
      <p className="mt-2">{data.detail}</p>
    </section>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [respuestas, setRespuestas] = useState<Record<number, number | null>>({});
  const [showModal, setShowModal] = useState(false);

  const total = useMemo(
    () => preguntas.reduce((acc, p) => acc + (respuestas[p.id] ?? 0), 0),
    [respuestas]
  );

  const faltantes = useMemo(
    () => preguntas.filter((p) => respuestas[p.id] === undefined || respuestas[p.id] === null).length,
    [respuestas]
  );

  const data = rango(total);

  const setValor = (id: number, val: number) => {
    setRespuestas((prev) => ({ ...prev, [id]: val }));
  };

  const reiniciar = () => setRespuestas({});

  const imprimir = () => window.print();

  const exportarCSV = () => {
    const encabezados = ["Pregunta", "Respuesta (2=Sí,1=Parcial,0=No)"];
    const filas = preguntas.map((p) => [
      p.texto.replace(/;/g, ","),
      String(respuestas[p.id] ?? 0),
    ]);
    filas.push(["TOTAL", String(total)]);
    const csv = [encabezados, ...filas].map((arr) => arr.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cuestionario_KOP.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Abre modal automáticamente cuando terminas
  useEffect(() => {
    if (faltantes === 0) setShowModal(true);
  }, [faltantes]);

  // Formulario de contacto (modal)
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function enviarContacto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setSending(true);

    const form = new FormData(e.currentTarget);
    const nombre = String(form.get("nombre") || "");
    const puesto = String(form.get("puesto") || "");
    const empresa = String(form.get("empresa") || "");
    const correo = String(form.get("correo") || "");
    const celular = String(form.get("celular") || "");

    try {
      const body = {
        servicio: "KOP - Diagnóstico de soporte de calidad",
        total,
        nombre, puesto, empresa, correo, celular,
        respuestas: preguntas.map((p) => ({
          id: p.id, texto: p.texto, val: respuestas[p.id] ?? 0,
        })),
      };

      const r = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        throw new Error(`Error ${r.status} ${txt}`);
      }

      setMsg("¡Enviado! Te contactaremos muy pronto.");
      e.currentTarget.reset();
    } catch (err: any) {
      setMsg("No se pudo enviar. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Fondo + velo */}
      <div
        className="fixed inset-0 -z-10 bg-[url('/fondo_kop.png')] bg-cover bg-center bg-no-repeat"
        aria-hidden="true"
      />
      <div className="fixed inset-0 -z-10 bg-white/60" aria-hidden="true" />

      <main className="mx-auto max-w-3xl p-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/KOP_logo.png"
                alt="KOP Company"
                className="h-12 sm:h-14"
              />
            </div>

            <div className="flex gap-2 print:hidden">
              <button onClick={reiniciar} className="rounded-xl bg-white px-3 py-2 shadow hover:bg-neutral-50">
                Reiniciar
              </button>
              <button onClick={exportarCSV} className="rounded-xl bg-white px-3 py-2 shadow hover:bg-neutral-50">
                Exportar CSV
              </button>
              <button onClick={imprimir} className="rounded-xl bg-black px-3 py-2 text-white shadow hover:opacity-90">
                Imprimir / PDF
              </button>
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-bold">
            ¿Qué tan robusto es tu soporte de calidad en planta?
          </h1>
          <p className="text-sm text-neutral-600">
            Diagnóstico express para detectar brechas en contención, residentes/inspectores, retrabajos y gobierno 24/7.
          </p>
        </header>

        {/* Estado superior */}
        <div className="mb-3 text-sm text-neutral-600">
          Total: <span className="font-semibold">{total}</span> / 24 ·{" "}
          Faltantes: <span className="font-semibold">{faltantes}</span>
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

        {/* Modal de resultado */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden">
            <div className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Resultado del diagnóstico</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>

              <ResultadoPanel data={data} total={total} />

              <form onSubmit={enviarContacto} className="mt-5 grid gap-3">
                <p className="text-sm text-neutral-600">
                  ¿Quieres que te ayudemos a cerrar las brechas? Déjanos tus datos:
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <input name="nombre" required placeholder="Nombre*" className="rounded-xl border p-2" />
                  <input name="puesto" placeholder="Puesto" className="rounded-xl border p-2" />
                  <input name="empresa" placeholder="Empresa" className="rounded-xl border p-2" />
                  <input name="correo" type="email" required placeholder="Correo*" className="rounded-xl border p-2" />
                  <input name="celular" placeholder="Celular" className="rounded-xl border p-2 sm:col-span-2" />
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    disabled={sending}
                    className="rounded-xl bg-black px-4 py-2 text-white shadow hover:opacity-90 disabled:opacity-50"
                  >
                    {sending ? "Enviando..." : "Enviar"}
                  </button>
                  <button
                    type="button"
                    onClick={imprimir}
                    className="rounded-xl bg-white px-3 py-2 shadow hover:bg-neutral-50"
                  >
                    Imprimir / PDF
                  </button>
                  <button
                    type="button"
                    onClick={reiniciar}
                    className="rounded-xl bg-white px-3 py-2 shadow hover:bg-neutral-50"
                  >
                    Reiniciar cuestionario
                  </button>
                </div>

                {msg && <p className="text-sm">{msg}</p>}
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

