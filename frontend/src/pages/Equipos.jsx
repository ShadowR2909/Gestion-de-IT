import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  getEquipos,
  createEquipo,
  updateEquipo,
  deleteEquipo,
  getClientes,
  getTiposEquipo,
} from '../services/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const Equipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tiposEquipo, setTiposEquipo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState(null);
  const [formData, setFormData] = useState({
    cliente: '',
    tipo_equipo: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    descripcion: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [equiposRes, clientesRes, tiposRes] = await Promise.all([
        getEquipos(),
        getClientes(),
        getTiposEquipo(),
      ]);
      setEquipos(equiposRes.data.results || equiposRes.data);
      setClientes(clientesRes.data.results || clientesRes.data);
      setTiposEquipo(tiposRes.data.results || tiposRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (equipo = null) => {
    if (equipo) {
      setEditingEquipo(equipo);
      setFormData({
        cliente: equipo.cliente,
        tipo_equipo: equipo.tipo_equipo,
        marca: equipo.marca,
        modelo: equipo.modelo,
        numero_serie: equipo.numero_serie || '',
        descripcion: equipo.descripcion || '',
      });
    } else {
      setEditingEquipo(null);
      setFormData({
        cliente: '',
        tipo_equipo: '',
        marca: '',
        modelo: '',
        numero_serie: '',
        descripcion: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEquipo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEquipo) {
        await updateEquipo(editingEquipo.id, formData);
      } else {
        await createEquipo(formData);
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error guardando equipo:', error);
      alert('Error al guardar el equipo');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este equipo?')) {
      try {
        await deleteEquipo(id);
        loadData();
      } catch (error) {
        console.error('Error eliminando equipo:', error);
        alert('Error al eliminar el equipo');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Equipos</h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Equipo
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Marca/Modelo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Número de Serie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cliente
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {equipos.map((equipo) => (
              <tr key={equipo.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="badge badge-process">{equipo.tipo_equipo_nombre}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {equipo.marca} {equipo.modelo}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {equipo.numero_serie || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {equipo.cliente_nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(equipo)}
                    className="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(equipo.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingEquipo ? 'Editar Equipo' : 'Nuevo Equipo'}
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select
                required
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                className="input"
              >
                <option value="">Seleccionar cliente...</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.apellido}, {cliente.nombre} - DNI: {cliente.dni}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Equipo
              </label>
              <select
                required
                value={formData.tipo_equipo}
                onChange={(e) => setFormData({ ...formData, tipo_equipo: e.target.value })}
                className="input"
              >
                <option value="">Seleccionar tipo...</option>
                {tiposEquipo.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <input
                type="text"
                required
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <input
                type="text"
                required
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                className="input"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Serie (Opcional)
              </label>
              <input
                type="text"
                value={formData.numero_serie}
                onChange={(e) =>
                  setFormData({ ...formData, numero_serie: e.target.value })
                }
                className="input"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (Opcional)
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="input"
                rows="3"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingEquipo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Equipos;