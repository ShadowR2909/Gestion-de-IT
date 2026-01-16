import { useEffect, useState } from 'react';
import { Users, Wrench, Laptop, ClipboardList, TrendingUp, Calendar } from 'lucide-react';
import { getEstadisticas, getClientes, getTecnicos, getEquipos } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [counts, setCounts] = useState({ clientes: 0, tecnicos: 0, equipos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, clientesRes, tecnicosRes, equiposRes] = await Promise.all([
        getEstadisticas(),
        getClientes(),
        getTecnicos(),
        getEquipos(),
      ]);

      setStats(statsRes.data);
      setCounts({
        clientes: clientesRes.data.count || clientesRes.data.length,
        tecnicos: tecnicosRes.data.count || tecnicosRes.data.length,
        equipos: equiposRes.data.count || equiposRes.data.length,
      });
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const mainStats = [
    { title: 'Clientes', value: counts.clientes, icon: Users, color: 'from-blue-600 to-blue-400', label: 'Registrados' },
    { title: 'Técnicos', value: counts.tecnicos, icon: Wrench, color: 'from-emerald-600 to-emerald-400', label: 'En el equipo' },
    { title: 'Equipos', value: counts.equipos, icon: Laptop, color: 'from-violet-600 to-violet-400', label: 'Bajo mantenimiento' },
    { title: 'Órdenes', value: stats?.total_ordenes || 0, icon: ClipboardList, color: 'from-amber-600 to-amber-400', label: 'Historial total' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Lics <span className="text-blue-600">Soluciones</span>
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Panel de Gestión General
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg text-green-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Servicio Activo</p>
            <p className="text-sm font-semibold text-gray-800">Sistema Operativo</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="relative group overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                </div>
                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              {/* Decorative circle */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50 rounded-full group-hover:bg-blue-50 transition-colors duration-300" />
            </div>
          );
        })}
      </div>

      {/* Order Status Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1 bg-blue-600 rounded-full" />
          <h2 className="text-xl font-bold text-gray-800">Estado de Órdenes de Trabajo</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pendientes */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <span className="text-xl font-bold">{stats?.pendientes || 0}</span>
            </div>
            <div>
              <p className="font-bold text-amber-900">Pendientes</p>
              <p className="text-sm text-amber-700">Esperando revisión</p>
            </div>
          </div>

          {/* En Proceso */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <span className="text-xl font-bold">{stats?.en_proceso || 0}</span>
            </div>
            <div>
              <p className="font-bold text-blue-900">En Proceso</p>
              <p className="text-sm text-blue-700">Técnicos trabajando</p>
            </div>
          </div>

          {/* Finalizadas */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <span className="text-xl font-bold">{stats?.finalizadas || 0}</span>
            </div>
            <div>
              <p className="font-bold text-emerald-900">Finalizadas</p>
              <p className="text-sm text-emerald-700">Listas para entrega</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;