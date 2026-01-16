import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// --- CLIENTES ---
export const getClientes = (params) => api.get('/clientes/', { params });
export const getCliente = (id) => api.get(`/clientes/${id}/`);
export const createCliente = (data) => api.post('/clientes/', data);
export const updateCliente = (id, data) => api.put(`/clientes/${id}/`, data);
export const deleteCliente = (id) => api.delete(`/clientes/${id}/`);
export const getClienteDetalle = (id) => api.get(`/clientes/${id}/detalle/`);

// --- TÉCNICOS ---
export const getTecnicos = (params) => api.get('/tecnicos/', { params });
export const getTecnico = (id) => api.get(`/tecnicos/${id}/`);
export const createTecnico = (data) => api.post('/tecnicos/', data);
export const updateTecnico = (id, data) => api.put(`/tecnicos/${id}/`, data);
export const deleteTecnico = (id) => api.delete(`/tecnicos/${id}/`);

// --- EQUIPOS ---
export const getEquipos = (params) => api.get('/equipos/', { params });
export const getEquipo = (id) => api.get(`/equipos/${id}/`);
export const createEquipo = (data) => api.post('/equipos/', data);
export const updateEquipo = (id, data) => api.put(`/equipos/${id}/`, data);
export const deleteEquipo = (id) => api.delete(`/equipos/${id}/`);

// --- ÓRDENES DE TRABAJO ---
export const getOrdenes = (params) => api.get('/ordenes/', { params });
export const getOrden = (id) => api.get(`/ordenes/${id}/`);
export const createOrden = (data) => api.post('/ordenes/', data);
export const updateOrden = (id, data) => api.put(`/ordenes/${id}/`, data);
export const deleteOrden = (id) => api.delete(`/ordenes/${id}/`);
export const cambiarEstadoOrden = (id, estado) => api.post(`/ordenes/${id}/cambiar_estado/`, { estado });
export const registrarPago = (id, monto, tipo_pago) => api.post(`/ordenes/${id}/registrar_pago/`, { monto, tipo_pago });
export const obtenerEnlaceMP = (id) => api.post(`/ordenes/${id}/pagar_mp/`);
export const getEstadisticas = () => api.get('/ordenes/estadisticas/');

// --- TIPOS DE EQUIPO ---
export const getTiposEquipo = () => api.get('/tipos-equipo/');
export const createTipoEquipo = (data) => api.post('/tipos-equipo/', data);
export const updateTipoEquipo = (id, data) => api.put(`/tipos-equipo/${id}/`, data);
export const deleteTipoEquipo = (id) => api.delete(`/tipos-equipo/${id}/`);

export default api;