import { useState, useEffect } from 'react';
import { Plus, Eye, DollarSign, FileText, MessageCircle, Laptop, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  getOrdenes, createOrden, cambiarEstadoOrden,
  registrarPago, obtenerEnlaceMP, getEquipos, getTecnicos
} from '../services/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const Ordenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState(null);
  
  const [pagoData, setPagoData] = useState({ monto: '', tipo_pago: 'EFECTIVO' });
  const [formData, setFormData] = useState({
    equipo: '', tecnico: '', problema_reportado: '', costo_mano_obra: 0, estado: 'PENDIENTE',
  });

  const estadoLabels = { PENDIENTE: 'Pendiente', EN_PROCESO: 'En Proceso', FINALIZADO: 'Finalizado', ENTREGADO: 'Entregado' };
  const estadoColors = { PENDIENTE: 'badge-pending', EN_PROCESO: 'badge-process', FINALIZADO: 'badge-finished', ENTREGADO: 'badge-delivered' };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [o, e, t] = await Promise.all([getOrdenes(), getEquipos(), getTecnicos()]);
      setOrdenes(o.data.results || o.data);
      setEquipos(e.data.results || e.data);
      setTecnicos(t.data.results || t.data);
    } catch (error) {
      console.error('Error de conexión:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const generarPDF = (orden) => {
    const doc = new jsPDF();
    doc.setFillColor(37, 99, 235); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text('LICS SOLUCIONES', 15, 25);
    doc.autoTable({
      startY: 50,
      head: [['Descripción', 'Detalle']],
      body: [
        ['N° Orden', orden.numero_orden],
        ['Cliente', orden.cliente_nombre],
        ['Estado', estadoLabels[orden.estado]],
        ['Saldo Pendiente', `$${orden.saldo_pendiente}`]
      ],
      headStyles: { fillColor: [37, 99, 235] }
    });
    doc.save(`Orden_${orden.numero_orden}.pdf`);
    toast.success('Comprobante PDF listo');
  };

  const handlePagarMP = async (id) => {
    if (!id) {
      toast.error('Error: Orden no encontrada');
      return;
    }
    try {
      const toastId = toast.loading('Abriendo Mercado Pago...');
      const res = await obtenerEnlaceMP(id);
      toast.dismiss(toastId);
      
      if (res.data && res.data.init_point) {
        window.location.href = res.data.init_point;
      } else {
        toast.error('No se pudo obtener el enlace de pago');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error en Mercado Pago:', error);
      toast.error('Error al generar enlace de pago. Intente nuevamente.');
    }
  };

  const onRegistrarCobro = async (e) => {
    e.preventDefault();
    if (!pagoData.monto || parseFloat(pagoData.monto) <= 0) {
      toast.error('Ingrese un monto válido');
      return;
    }
    try {
      await registrarPago(selectedOrden.id, pagoData.monto, pagoData.tipo_pago);
      toast.success('Pago registrado con éxito');
      setPagoData({ monto: '', tipo_pago: 'EFECTIVO' });
      setShowPagoModal(false);
      loadData();
    } catch (error) {
      console.error('Error al procesar el cobro:', error);
      toast.error('Error al procesar el cobro');
    }
  };

  const handleCrearOrden = async (e) => {
    e.preventDefault();
    if (!formData.equipo || !formData.tecnico) {
      toast.error('Complete los campos requeridos (Equipo y Técnico)');
      return;
    }
    try {
      await createOrden(formData);
      toast.success('Orden creada con éxito');
      setFormData({
        equipo: '', tecnico: '', problema_reportado: '', costo_mano_obra: 0, estado: 'PENDIENTE',
      });
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error al crear orden:', error);
      toast.error('Error al crear la orden');
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await cambiarEstadoOrden(id, nuevoEstado);
      toast.success('Estado actualizado');
      loadData();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar el estado');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Órdenes</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> Nueva Orden
        </button>
      </div>

      <div className="card overflow-hidden border-none shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">Orden</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">Cliente</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">Estado</th>
              <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ordenes.map(orden => (
              <tr key={orden.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="p-4 font-bold text-blue-600">{orden.numero_orden}</td>
                <td className="p-4 text-gray-700">{orden.cliente_nombre}</td>
                <td className="p-4"><span className={`badge ${estadoColors[orden.estado]}`}>{estadoLabels[orden.estado]}</span></td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => { setSelectedOrden(orden); setShowDetalleModal(true); }} className="p-2 text-gray-400 hover:text-blue-600"><Eye size={20} /></button>
                  <button onClick={() => generarPDF(orden)} className="p-2 text-gray-400 hover:text-red-500"><FileText size={20} /></button>
                  <button onClick={() => { setSelectedOrden(orden); setShowPagoModal(true); }} className="p-2 text-gray-400 hover:text-green-600"><DollarSign size={20} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR ORDEN */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Orden de Trabajo" size="lg">
        <form onSubmit={handleCrearOrden} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipo *</label>
              <select
                required
                value={formData.equipo}
                onChange={(e) => setFormData({ ...formData, equipo: e.target.value })}
                className="input"
              >
                <option value="">Seleccionar equipo...</option>
                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.marca} {equipo.modelo} - {equipo.cliente_nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Técnico *</label>
              <select
                required
                value={formData.tecnico}
                onChange={(e) => setFormData({ ...formData, tecnico: e.target.value })}
                className="input"
              >
                <option value="">Seleccionar técnico...</option>
                {tecnicos.map((tecnico) => (
                  <option key={tecnico.id} value={tecnico.id}>
                    {tecnico.apellido}, {tecnico.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problema Reportado</label>
            <textarea
              value={formData.problema_reportado}
              onChange={(e) => setFormData({ ...formData, problema_reportado: e.target.value })}
              className="input"
              rows="3"
              placeholder="Descripción del problema..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Costo Mano de Obra</label>
            <input
              type="number"
              step="0.01"
              value={formData.costo_mano_obra}
              onChange={(e) => setFormData({ ...formData, costo_mano_obra: parseFloat(e.target.value) || 0 })}
              className="input"
              placeholder="0.00"
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Crear Orden
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL DETALLE ORDEN */}
      <Modal isOpen={showDetalleModal} onClose={() => setShowDetalleModal(false)} title="Detalles de la Orden" size="lg">
        {selectedOrden && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Orden #</p>
                <p className="text-lg font-bold text-gray-900">{selectedOrden.numero_orden}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Estado</p>
                <p className={`badge ${estadoColors[selectedOrden.estado]}`}>{estadoLabels[selectedOrden.estado]}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Cliente</p>
                <p className="text-lg font-semibold text-gray-900">{selectedOrden.cliente_nombre}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Técnico</p>
                <p className="text-lg font-semibold text-gray-900">{selectedOrden.tecnico_nombre || 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Problema Reportado</p>
              <p className="text-gray-700 mt-1">{selectedOrden.problema_reportado || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Costo Mano de Obra</p>
                <p className="text-lg font-semibold text-gray-900">${selectedOrden.costo_mano_obra || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Saldo Pendiente</p>
                <p className="text-lg font-semibold text-red-600">${selectedOrden.saldo_pendiente || 0}</p>
              </div>
            </div>
            
            {/* Cambiar estado */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-2">Cambiar Estado</p>
              <div className="flex gap-2">
                {Object.entries(estadoLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleCambiarEstado(selectedOrden.id, key)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                      selectedOrden.estado === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetalleModal(false)}
                className="btn btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
      <Modal isOpen={showPagoModal} onClose={() => setShowPagoModal(false)} title="Registrar Pago">
        <form onSubmit={onRegistrarCobro} className="space-y-4">
          <div className="bg-red-50 p-3 rounded-xl text-red-700 text-sm font-bold flex justify-between">
            <span>Saldo Pendiente:</span>
            <span>${selectedOrden?.saldo_pendiente || 0}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Cobrar *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              placeholder="0.00"
              value={pagoData.monto}
              required
              onChange={(e) => setPagoData({ ...pagoData, monto: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pago</label>
            <select
              value={pagoData.tipo_pago}
              onChange={(e) => setPagoData({ ...pagoData, tipo_pago: e.target.value })}
              className="input"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 shadow-lg shadow-emerald-100 transition-all">
            Confirmar Pago Manual
          </button>
          
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-[10px] font-bold text-gray-400 uppercase"><span className="bg-white px-2">O cobrar digitalmente</span></div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!selectedOrden?.id) {
                toast.error('Error: Orden no encontrada');
                return;
              }
              handlePagarMP(selectedOrden.id);
            }}
            className="w-full bg-[#009EE3] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 hover:bg-[#0088CC]"
          >
            <img src="https://http2.mlstatic.com/static/org-img/mkt/msite-v2/mercadopago-logo.png" className="h-4" alt="MP" />
            Mercado Pago
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Ordenes;