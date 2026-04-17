import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Home from './pages/Home.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ServiceDetail from './pages/ServiceDetail.jsx';
import SubmitService from './pages/SubmitService.jsx';
import PublicNumbersPage from './pages/PublicNumbersPage.jsx';
import About from './pages/About.jsx';
import QenaAbout from './pages/QenaAbout.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminServices from './pages/admin/AdminServices.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminNumbers from './pages/admin/AdminNumbers.jsx';
import AdminSuggestions from './pages/admin/AdminSuggestions.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/service/:id" element={<ServiceDetail />} />
        <Route path="/submit" element={<SubmitService />} />
        <Route path="/numbers" element={<PublicNumbersPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/qena" element={<QenaAbout />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="numbers" element={<AdminNumbers />} />
        <Route path="suggestions" element={<AdminSuggestions />} />
      </Route>
    </Routes>
  );
}
