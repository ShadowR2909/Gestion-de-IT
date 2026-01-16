import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Tecnicos from './pages/Tecnicos';
import Equipos from './pages/Equipos';
import Ordenes from './pages/Ordenes';
import Configuracion from './pages/Configuracion';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/tecnicos" element={<Tecnicos />} />
          <Route path="/equipos" element={<Equipos />} />
          <Route path="/ordenes" element={<Ordenes />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;