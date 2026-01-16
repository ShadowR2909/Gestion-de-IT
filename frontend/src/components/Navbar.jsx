import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Wrench, Laptop, ClipboardList, Settings, Menu, X, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/clientes', label: 'Clientes', icon: Users },
    { path: '/tecnicos', label: 'Técnicos', icon: Wrench },
    { path: '/equipos', label: 'Equipos', icon: Laptop },
    { path: '/ordenes', label: 'Órdenes', icon: ClipboardList },
    { path: '/configuracion', label: 'Configuración', icon: Settings },
  ];

  const toggleDrawer = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Barra Superior Fija */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            {/* Botón Hamburguesa */}
            <button
              onClick={toggleDrawer}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors mr-3"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <Link to="/" className="flex items-center">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Laptop className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold tracking-tight text-gray-900">
                Lics <span className="text-blue-600">Soluciones</span>
              </span>
            </Link>
          </div>

          {/* Avatar / Usuario */}
          <div className="flex items-center gap-3">
             <div className="hidden md:block text-right mr-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin</p>
                <p className="text-sm font-medium text-gray-700">Rosario</p>
             </div>
             <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold shadow-sm">
                R
             </div>
          </div>
        </div>
      </nav>

      {/* Overlay (Fondo oscuro al abrir el drawer) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={toggleDrawer}
        />
      )}

      {/* Menú Lateral (Drawer) */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header del Drawer */}
          <div className="p-6 flex items-center justify-between border-b border-gray-50">
            <span className="font-bold text-gray-800">Navegación</span>
            <button 
              onClick={toggleDrawer} 
              className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Enlaces del Menú */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleDrawer}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all group
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer del Drawer */}
          <div className="p-4 border-t border-gray-100">
            <button className="flex items-center gap-4 w-full px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium">
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;