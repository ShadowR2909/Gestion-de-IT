import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getTiposEquipo, createTipoEquipo, updateTipoEquipo, deleteTipoEquipo } from '../services/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const Configuracion = () => {
  const [tiposEquipo, setTiposEquipo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTipo, setEditingTipo] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true,
  });

  useEffect(() => {
    loadTiposEquipo();
  }, []);

  const loadTiposEquipo = async () => {
    try {
      const response = await getTiposEquipo();
      setTiposEquipo(response.data.results || response.data);
    } catch (error) {
      console.error('Error cargando tipos de equipo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tipo = null) => {
    if (tipo) {
      setEditingTipo(tipo);
      setFormData(tipo);
    } else {
      setEditingTipo(null);
      setFormData({
        nombre: '',
        descripcion: '',
        activo: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTipo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTipo) {
        await updateTipoEquipo(editingTipo.id, formData);
      } else {
        await createTipoEquipo(formData);
      }
      handleCloseModal();
      loadTiposEquipo();
    } catch (error) {
      console.error('Error guardando tipo de equipo:', error);
      alert('Error al guardar el tipo de equipo');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este tipo de equipo?')) {
      try {
        await deleteTipoEquipo(id);
        loadTiposEquipo();
      } catch (error) {
        console.error('Error eliminando tipo de equipo:', error);
        alert('Error al eliminar el tipo de equipo. Puede que tenga equipos asociados.');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Configuración</h1>

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Tipos de Equipos</h2>
          <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Agregar Tipo
          </button>
        </div>

        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tiposEquipo.map((tipo) => (
                <tr key={tipo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{tipo.nombre}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{tipo.descripcion || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`badge ${
                        tipo.activo ? 'badge-finished' : 'badge-cancelled'
                      }`}
                    >
                      {tipo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(tipo)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tipo.id)}
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
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingTipo ? 'Editar Tipo de Equipo' : 'Nuevo Tipo de Equipo'}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="input"
                rows="3"
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Activo</span>
              </label>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTipo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Configuracion;