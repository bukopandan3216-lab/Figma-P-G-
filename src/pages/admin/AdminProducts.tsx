import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { supabase } from '../../lib/supabase';
import { Button, Badge, DataTable, Modal, Input, Select, useToast, ToastContainer } from '../../components/ui';
import AdminSidebar from '../../components/AdminSidebar';

type ProductStatus = 'Active' | 'Archived' | 'Draft';

interface AdminProduct {
  id: string;
  image: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
}

const toAdminProduct = (p: any): AdminProduct => ({
  id: p.id, image: p.image, name: p.name, brand: p.brand, category: p.category,
  price: p.price, stock: p.stock, status: p.inStock ? 'Active' : 'Archived',
});

const BRANDS = ['Olay', 'Pantene', 'Head & Shoulders', 'Secret', 'Ivory'];
const CATEGORIES = ['Skin Care', 'Hair Care', 'Body Care', 'Personal Care'];

export default function AdminProducts() {
  const { products, loading, error, refresh } = useCatalog();
  const [productList, setProductList] = useState<AdminProduct[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', brand: BRANDS[0], category: CATEGORIES[0], price: '', stock: '', status: 'Active' as ProductStatus });
  const { toasts, add: addToast, remove } = useToast();

  useEffect(() => { setProductList(products.map(toAdminProduct)); }, [products]);

  const openAdd = () => {
    setEditId(null);
    setForm({ name: '', brand: BRANDS[0], category: CATEGORIES[0], price: '', stock: '', status: 'Active' });
    setModalOpen(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditId(p.id);
    setForm({ name: p.name, brand: p.brand, category: p.category, price: String(p.price), stock: String(p.stock), status: p.status });
    setModalOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) { addToast('error', 'Product name is required.'); return; }
    if (!form.price || isNaN(+form.price)) { addToast('error', 'Enter a valid price.'); return; }
    if (editId) {
      void supabase.from('products').update({ name: form.name, price: +form.price, status: form.status }).eq('id', editId).then(({ error }) => {
        if (error) addToast('error', error.message);
        else { setProductList(prev => prev.map(p => p.id === editId ? { ...p, ...form, price: +form.price, stock: +form.stock || p.stock } : p)); void refresh(); }
      });
      addToast('success', 'Product updated successfully!');
    } else {
      void (async () => {
        const { data: brand } = await supabase.from('brands').select('id').eq('name', form.brand).single();
        const { data: category } = await supabase.from('categories').select('id').eq('name', form.category).single();
        const { data: product, error } = await supabase.from('products').insert({ name: form.name, brand_id: brand?.id, category_id: category?.id, price: +form.price, image: '', description: '', tags: [], status: form.status }).select('id').single();
        if (error) { addToast('error', error.message); return; }
        const { data: variant, error: variantError } = await supabase.from('product_variants').insert({ product_id: product.id, sku: `SKU-${crypto.randomUUID()}` }).select('id').single();
        if (variantError) { addToast('error', variantError.message); return; }
        await supabase.from('inventory').insert({ variant_id: variant.id, stock_quantity: +form.stock || 0 });
        addToast('success', 'Product added successfully!');
        await refresh();
      })();
    }
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    void supabase.from('products').update({ status: 'Archived' }).eq('id', deleteId).then(({ error }) => {
      if (error) addToast('error', error.message);
      else { addToast('info', 'Product archived.'); void refresh(); }
    });
    setDeleteId(null);
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <AdminSidebar>
      <ToastContainer toasts={toasts} onRemove={remove} />
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Products</h1>
            <p className="text-sm text-[var(--muted-foreground)]">{productList.length} total products</p>
          </div>
          <Button onClick={openAdd}><Plus size={15} /> Add Product</Button>
        </div>

        {loading && <p className="text-sm text-[var(--muted-foreground)]">Loading products...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
          <DataTable
            data={productList as any}
            columns={[
              { key: 'image', label: '', sortable: false, render: (row: any) => <img src={row.image} alt="" className="w-10 h-10 object-cover rounded-[var(--radius)] bg-[var(--secondary)]" /> },
              { key: 'name', label: 'Product Name', render: (row: any) => <span className="font-medium text-sm">{row.name}</span> },
              { key: 'brand', label: 'Brand' },
              { key: 'category', label: 'Category' },
              { key: 'price', label: 'Price', render: (row: any) => `₱${(+row.price).toFixed(2)}` },
              { key: 'stock', label: 'Stock', render: (row: any) => (
                <span className={`font-mono text-sm ${row.stock === 0 ? 'text-red-500' : row.stock < 10 ? 'text-amber-600' : 'text-[var(--foreground)]'}`}>{row.stock}</span>
              )},
              { key: 'status', label: 'Status', render: (row: any) => (
                <Badge variant={row.status === 'Active' ? 'success' : row.status === 'Draft' ? 'warning' : 'muted'}>{row.status}</Badge>
              )},
              { key: 'actions', label: '', sortable: false, render: (row: any) => (
                <div className="flex gap-1">
                  <button onClick={() => openEdit(row as AdminProduct)} className="p-1.5 hover:bg-[var(--secondary)] rounded transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]" title="Edit"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteId(row.id)} className="p-1.5 hover:bg-red-50 rounded transition-colors text-[var(--muted-foreground)] hover:text-red-500" title="Delete"><Trash2 size={14} /></button>
                </div>
              )},
            ]}
          />
        </div>

        {/* Add/Edit Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Product' : 'Add Product'} size="lg">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Product Name *" value={form.name} onChange={set('name')} placeholder="e.g. Regenerist Cream" className="col-span-2" />
            <Select label="Brand" value={form.brand} onChange={set('brand')} options={BRANDS.map(b => ({ value: b, label: b }))} />
            <Select label="Category" value={form.category} onChange={set('category')} options={CATEGORIES.map(c => ({ value: c, label: c }))} />
            <Input label="Price (₱) *" type="number" value={form.price} onChange={set('price')} placeholder="0.00" />
            <Input label="Stock Quantity" type="number" value={form.stock} onChange={set('stock')} placeholder="0" />
            <Select label="Status" value={form.status} onChange={set('status')} options={[{ value: 'Active', label: 'Active' }, { value: 'Archived', label: 'Archived' }, { value: 'Draft', label: 'Draft' }]} className="col-span-2" />
            <div className="col-span-2">
              <label className="text-sm font-medium block mb-1">Description</label>
              <textarea rows={3} className="w-full rounded-[var(--radius)] border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none" placeholder="Product description…" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium block mb-2">Product Image</label>
              <div className="border-2 border-dashed border-[var(--border)] rounded-[var(--radius-lg)] p-8 text-center text-sm text-[var(--muted-foreground)] hover:border-[var(--primary)] transition-colors cursor-pointer">
                <div className="text-2xl mb-2">📁</div>
                <div>Click to upload or drag and drop</div>
                <div className="text-xs mt-1">PNG, JPG up to 10MB</div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button className="flex-1" onClick={save}>{editId ? 'Save Changes' : 'Add Product'}</Button>
          </div>
        </Modal>

        {/* Delete confirmation */}
        <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Product" size="sm">
          <p className="text-sm text-[var(--muted-foreground)] mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} className="flex-1">Delete Product</Button>
          </div>
        </Modal>
      </div>
    </AdminSidebar>
  );
}
