import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import productService from '../../services/productService';
import useNotificationStore from '../../store/notificationStore';

function ProductFormModal({ product, onClose, onSave, saving }) {
  const [form, setForm] = useState(product || {
    productName: '',
    category: 'FOOD',
    description: '',
    price: '',
    imageUrl: ''
  });

  const CATEGORY_OPTIONS = [
    { value: 'FOOD', label: '🍿 Đồ ăn' },
    { value: 'DRINK', label: '🥤 Đồ uống' },
    { value: 'COMBO', label: '🎉 Combo' },
    { value: 'VOUCHER', label: '🎫 Voucher' }
  ];

  const handleSubmit = () => {
    if (!form.productName || !form.price) return;
    onSave(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-cinema-card border border-cinema-border rounded-2xl p-6 max-w-lg w-full shadow-card-hover"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading font-bold text-white text-lg">
            {product ? '✏️ Chỉnh sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
          </h3>
          <button onClick={onClose} className="text-cinema-muted hover:text-white p-1">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-cinema-muted text-xs mb-1.5">Tên sản phẩm *</label>
            <input value={form.productName} onChange={e => setForm({...form, productName: e.target.value})}
              placeholder="Ví dụ: Bỏng ngô Phô mai (L)" className="input-field" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Danh mục</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field cursor-pointer">
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Giá tiền (VNĐ) *</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                placeholder="75000" className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-cinema-muted text-xs mb-1.5">Mô tả</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              rows={2} placeholder="Mô tả ngắn gọn về sản phẩm..." className="input-field resize-none" />
          </div>

          <div>
            <label className="block text-cinema-muted text-xs mb-1.5">Link hình ảnh (URL)</label>
            <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})}
              placeholder="https://example.com/popcorn.jpg" className="input-field" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Huỷ</button>
            <button 
              onClick={handleSubmit} 
              disabled={saving}
              className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-cinema-black border-t-transparent rounded-full animate-spin"></div>
                  Đang lưu...
                </>
              ) : (
                product ? 'Lưu thay đổi' : 'Thêm sản phẩm'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { addNotification } = useNotificationStore();

  const addToast = (msg, type = 'success') => {
    addNotification({
      title: type === 'success' ? 'Thành công' : 'Lỗi',
      message: msg,
      type: type,
      isAdmin: true
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('[AdminProducts] Fetching products...');
      const res = await productService.getAll({ size: 1000 });
      console.log('[AdminProducts] API Response:', res);
      
      let items = [];
      if (res?.content) items = res.content;
      else if (res?.data?.content) items = res.data.content;
      else if (res?.data && Array.isArray(res.data)) items = res.data;
      else if (Array.isArray(res)) items = res;
      
      setProducts(items);
    } catch (err) {
      console.error('[AdminProducts] Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal && modal !== 'add') {
        await productService.update(modal.id, form);
        addToast('Đã cập nhật sản phẩm', 'success');
      } else {
        await productService.create(form);
        addToast('Đã thêm sản phẩm mới', 'success');
      }
      setModal(null);
      fetchProducts();
    } catch (err) {
      if (err.response?.status === 401) {
        addToast('Phiên đăng nhập đã hết hạn hoặc không có quyền Admin. Đang chuyển hướng...', 'error');
        setTimeout(() => {
          localStorage.removeItem('cinema-auth');
          window.location.href = '/login';
        }, 2500);
        return;
      }
      const errMsg = err.response?.data?.detail || err.response?.data?.message || err.response?.data?.detailMessage || err.message || 'Lỗi khi lưu sản phẩm';
      addToast(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productService.remove(id);
      addToast('Đã xoá sản phẩm', 'success');
      fetchProducts();
    } catch (err) {
      if (err.response?.status === 401) {
        addToast('Phiên đăng nhập đã hết hạn hoặc không có quyền Admin. Đang chuyển hướng...', 'error');
        setTimeout(() => {
          localStorage.removeItem('cinema-auth');
          window.location.href = '/login';
        }, 2500);
        return;
      }
      const errMsg = err.response?.data?.detail || err.response?.data?.message || err.response?.data?.detailMessage || err.message || 'Lỗi khi xoá sản phẩm';
      addToast(errMsg, 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = products.filter(p => 
    p.productName?.toLowerCase().includes(search.toLowerCase())
  );

  // Đặt lại trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

  const getCategoryBadge = (cat) => {
    const c = (typeof cat === 'string' ? cat : (cat?.value || cat?.name || '')).toUpperCase();
    switch(c) {
      case 'FOOD': return <span className="badge bg-orange-500/10 border-orange-500/30 text-orange-400">🍿 Đồ ăn</span>;
      case 'DRINK': return <span className="badge bg-blue-500/10 border-blue-500/30 text-blue-400">🥤 Đồ uống</span>;
      case 'COMBO': return <span className="badge bg-primary/10 border-primary/30 text-primary">🎉 Combo</span>;
      default: return <span className="badge bg-cinema-border/30 text-cinema-muted">{c || 'KHÁC'}</span>;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Bỏng Nước</h2>
        <button onClick={() => setModal('add')} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
          <span>➕</span> Thêm sản phẩm
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Tìm kiếm sản phẩm..."
          className="input-field max-w-xs" />
        <span className="text-cinema-muted text-sm">{filtered.length} sản phẩm</span>
      </div>

      <div className="bg-cinema-surface rounded-xl border border-cinema-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cinema-border bg-cinema-dark text-cinema-muted text-xs font-medium">
                <th className="text-left px-4 py-3">Sản phẩm</th>
                <th className="text-left px-4 py-3">Danh mục</th>
                <th className="text-left px-4 py-3">Giá tiền</th>
                <th className="text-left px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border/50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-4 py-10 text-center text-cinema-muted">Đang tải dữ liệu...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-10 text-center text-cinema-muted">Không tìm thấy sản phẩm nào</td>
                </tr>
              ) : paginatedData.map(product => (
                <tr key={product.id} className="hover:bg-cinema-card/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-cinema-dark border border-cinema-border flex items-center justify-center overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">🍿</span>
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{product.productName}</p>
                        <p className="text-cinema-muted text-[10px] truncate max-w-[200px]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getCategoryBadge(product.category)}</td>
                  <td className="px-4 py-3 text-white font-bold text-sm">
                    {product.price?.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setModal(product)}
                        className="p-1.5 rounded-lg bg-cinema-card border border-cinema-border text-cinema-muted hover:text-primary hover:border-primary transition-all">
                        ✏️
                      </button>
                      <button onClick={() => setDeleteId(product.id)}
                        className="p-1.5 rounded-lg bg-cinema-card border border-cinema-border text-cinema-muted hover:text-red-400 hover:border-red-400 transition-all">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex justify-center items-center gap-2 p-5 border-t border-cinema-border">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-lg bg-cinema-surface border border-cinema-border text-cinema-muted hover:text-white disabled:opacity-50 transition-colors text-sm font-medium"
            >
              Trước
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === i + 1 ? 'bg-primary text-cinema-black' : 'bg-cinema-surface border border-cinema-border text-cinema-muted hover:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 rounded-lg bg-cinema-surface border border-cinema-border text-cinema-muted hover:text-white disabled:opacity-50 transition-colors text-sm font-medium"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <ProductFormModal
            product={modal === 'add' ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-cinema-card border border-cinema-border rounded-2xl p-6 max-w-sm w-full text-center"
            >
              <h3 className="font-heading font-bold text-white text-lg mb-2">Xác nhận xoá?</h3>
              <p className="text-cinema-muted text-sm mb-5">Thao tác này không thể hoàn tác.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 btn-outline text-sm py-2.5">Huỷ</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm">Xoá</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
