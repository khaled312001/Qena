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
import NearbyPage from './pages/NearbyPage.jsx';
import DriverSubmit from './pages/DriverSubmit.jsx';
import RentalSubmit from './pages/RentalSubmit.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import Contact from './pages/Contact.jsx';
import Guides from './pages/Guides.jsx';
import HospitalsGuide from './pages/guides/HospitalsGuide.jsx';
import PharmaciesGuide from './pages/guides/PharmaciesGuide.jsx';
import DenderaTempleGuide from './pages/guides/DenderaTempleGuide.jsx';
import QenaCairoTransportGuide from './pages/guides/QenaCairoTransportGuide.jsx';
import RestaurantsGuide from './pages/guides/RestaurantsGuide.jsx';
import HotelsGuide from './pages/guides/HotelsGuide.jsx';
import BanksGuide from './pages/guides/BanksGuide.jsx';
import LandmarksGuide from './pages/guides/LandmarksGuide.jsx';
import EmergencyNumbersGuide from './pages/guides/EmergencyNumbersGuide.jsx';
import QenaHistoryGuide from './pages/guides/QenaHistoryGuide.jsx';
import QenaEducationGuide from './pages/guides/QenaEducationGuide.jsx';
import QenaEconomyGuide from './pages/guides/QenaEconomyGuide.jsx';
import ArticleViewer from './pages/guides/ArticleViewer.jsx';
import Team from './pages/Team.jsx';
import Author from './pages/Author.jsx';
import EditorialPolicy from './pages/EditorialPolicy.jsx';
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
        <Route path="/nearby" element={<NearbyPage />} />
        <Route path="/submit/driver" element={<DriverSubmit />} />
        <Route path="/submit/rental" element={<RentalSubmit />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/guides/hospitals-qena" element={<HospitalsGuide />} />
        <Route path="/guides/pharmacies-24h-qena" element={<PharmaciesGuide />} />
        <Route path="/guides/dendera-temple-guide" element={<DenderaTempleGuide />} />
        <Route path="/guides/qena-to-cairo-transport" element={<QenaCairoTransportGuide />} />
        <Route path="/guides/restaurants-qena" element={<RestaurantsGuide />} />
        <Route path="/guides/hotels-qena" element={<HotelsGuide />} />
        <Route path="/guides/banks-atm-qena" element={<BanksGuide />} />
        <Route path="/guides/qena-landmarks" element={<LandmarksGuide />} />
        <Route path="/guides/qena-emergency-numbers" element={<EmergencyNumbersGuide />} />
        <Route path="/guides/qena-history" element={<QenaHistoryGuide />} />
        <Route path="/guides/qena-education" element={<QenaEducationGuide />} />
        <Route path="/guides/qena-economy" element={<QenaEconomyGuide />} />
        {/* Generic viewer for the 7 new long-form articles whose content
            lives in frontend/src/data/articles.json. ArticleViewer reads
            the slug from useParams and renders from JSON — same source the
            backend SSR uses. */}
        <Route path="/guides/:slug" element={<ArticleViewer />} />
        {/* E-E-A-T trust pages */}
        <Route path="/team" element={<Team />} />
        <Route path="/author/:slug" element={<Author />} />
        <Route path="/editorial-policy" element={<EditorialPolicy />} />
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
