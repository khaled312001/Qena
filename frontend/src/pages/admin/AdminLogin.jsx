import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import api from '../../lib/api.js';

export default function AdminLogin() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.post('/auth/login', form);
      localStorage.setItem('qena_token', r.data.token);
      nav('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل تسجيل الدخول');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-brand-100 via-white to-brand-50 p-4">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="card p-6 md:p-8 w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 mb-6">
          <img src="/logo.svg" className="w-10 h-10" alt="" />
          <div>
            <div className="font-extrabold text-lg">قناوي</div>
            <div className="text-xs text-slate-500">لوحة الإدارة · دليل قنا</div>
          </div>
        </Link>
        <h1 className="text-xl font-bold mb-1">تسجيل الدخول</h1>
        <p className="text-sm text-slate-500 mb-6">أدخل بيانات الإدارة للمتابعة</p>
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="block text-sm mb-1">اسم المستخدم</span>
            <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </label>
          <label className="block">
            <span className="block text-sm mb-1">كلمة السر</span>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          <button disabled={loading} className="btn-primary w-full justify-center">
            <LogIn className="w-4 h-4" /> {loading ? 'جارٍ الدخول...' : 'دخول'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
