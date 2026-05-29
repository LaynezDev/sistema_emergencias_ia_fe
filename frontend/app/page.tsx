'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [agentes, setAgentes] = useState([]);
  const [metricas, setMetricas] = useState(null);
  const [eventos, setEventos] = useState([]);

  // 1. Cargar el estado inicial de la ciudad
  useEffect(() => {
    cargarAgentes();
    cargarMetricas();
    cargarHistorialEventos(); 
  }, []);
  // <-- AÑADIMOS ESTA NUEVA FUNCIÓN -->
  const cargarHistorialEventos = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/eventos/activos');
      const data = await res.json();
      setEventos(data); // Llenamos la memoria de React con la base de datos
    } catch (error) {
      console.error("Error al cargar historial de eventos:", error);
    }
  };
  const cargarAgentes = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/agentes/estado');
      const data = await res.json();
      setAgentes(data);
    } catch (error) {
      console.error("Error al cargar agentes:", error);
    }
  };

  const cargarMetricas = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/analitica/dashboard');
      const data = await res.json();
      setMetricas(data);
    } catch (error) {
      console.error("Error al cargar métricas:", error);
    }
  };

  // 2. Función para simular el envío de una emergencia [cite: 92]
  const simularEmergencia = async () => {
    const tipos = ['incendio', 'robo', 'accidente', 'inundacion'];
    const zonas = ['zona 1', 'zona 3', 'zona 5', 'zona 8', 'zona 10'];
    const prioridades = ['alta', 'media', 'baja'];

    const eventoAleatorio = {
      tipo: tipos[Math.floor(Math.random() * tipos.length)],
      zona: zonas[Math.floor(Math.random() * zonas.length)],
      prioridad: prioridades[Math.floor(Math.random() * prioridades.length)]
    };

    try {
      // Evaluamos el evento y pedimos usar A* (usar_greedy=false) [cite: 93]
      const res = await fetch('http://localhost:8000/api/evento/evaluar?usar_greedy=false', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventoAleatorio)
      });
      const data = await res.json();
      
      setEventos(prev => [data, ...prev]);
      cargarAgentes(); // Actualizamos la tabla para ver qué agente cambió a "ocupado"
    } catch (error) {
      console.error("Error al reportar emergencia:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <header className="mb-8 border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-blue-400">Panel de Control: Ciudad Inteligente</h1>
        <p className="text-slate-400">Sistema Multi-Agente y Análisis Predictivo</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL IZQUIERDO: Analítica y Simulación */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-emerald-400">Generador de Eventos</h2>
            <button 
              onClick={simularEmergencia}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              🚨 Simular Nueva Emergencia
            </button>
          </div>

          {metricas && (
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 text-purple-400">Analítica Histórica (Pandas)</h2>
              <p>Total eventos históricos: <span className="font-bold">{metricas.estadisticas_generales.total_eventos_historicos}</span></p>
            </div>
          )}
        </div>

        {/* PANEL CENTRAL Y DERECHO: Mapa de Agentes y Log de Emergencias */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabla de Agentes [cite: 100] */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Estado de la Flota (Agentes)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-600 text-slate-400">
                    <th className="p-2">ID</th>
                    <th className="p-2">Tipo</th>
                    <th className="p-2">Ubicación</th>
                    <th className="p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {agentes.map((agente: any) => (
                    <tr key={agente.id} className="border-b border-slate-700/50">
                      <td className="p-2 font-mono text-sm">{agente.id}</td>
                      <td className="p-2 capitalize">{agente.tipo}</td>
                      <td className="p-2">{agente.ubicacion_actual}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          agente.estado === 'disponible' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {agente.estado.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registro de Eventos en Tiempo Real [cite: 99] */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-orange-400">Despachos Activos</h2>
            <div className="space-y-4">
              {eventos.map((ev: any, index) => (
                <div key={index} className="bg-slate-700/50 p-4 rounded-lg border-l-4 border-orange-500">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg capitalize">{ev.evento_recibido.tipo} - {ev.evento_recibido.zona}</h3>
                    <span className="text-xs bg-slate-600 px-2 py-1 rounded">Prioridad: {ev.evento_recibido.prioridad}</span>
                  </div>
                  <div className="text-sm text-slate-300">
                    <p><strong>Recursos requeridos:</strong> {ev.recursos_necesarios.join(', ')}</p>
                    <div className="mt-2">
                      <strong>Agentes Despachados:</strong>
                      <ul className="list-disc list-inside pl-2">
                        {ev.despacho_agentes.map((d: any, i: number) => (
                          <li key={i}>
                            {d.tipo} (ID: {d.id_agente}) - Tiempo est: {d.tiempo_estimado_min.toFixed(1)} min [cite: 102]
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
              {eventos.length === 0 && <p className="text-slate-500 italic">No hay emergencias activas en este momento.</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}