import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-p py-24 text-center">
      <div className="text-7xl font-extrabold text-brand-600 mb-2">404</div>
      <p className="text-slate-600 mb-6">الصفحة غير موجودة.</p>
      <Link to="/" className="btn-primary">العودة للرئيسية</Link>
    </div>
  );
}
