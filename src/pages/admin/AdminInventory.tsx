import { useEffect, useState } from 'react';
import { Plus, ArrowDown, ArrowUp, AlertTriangle } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { supabase } from '../../lib/supabase';
import { Button, Badge, DataTable, Modal, Input, Select, ProgressBar, useToast, ToastContainer } from '../../components/ui';
import AdminSidebar from '../../components/AdminSidebar';

interface StockItem { id: string; variantId?: string; product: string; brand: string; category: string; stock: number; reorderLevel: number; image: string; }
interface Movement { id: string; product: string; type: 'Stock In' | 'Stock Out'; qty: number; date: string; ref: string; }

const toStockItem = (p: any): StockItem => ({
  id: p.id, variantId: p.variantId, product: p.name, brand: p.brand, category: p.category, stock: p.stock, reorderLevel: 20, image: p.image,
});

const getStatus = (stock: number) => {
  if (stock === 0) return { label: 'Out of Stock', variant: 'danger' as const };
  if (stock < 10) return { label: 'Low Stock', variant: 'warning' as const };
  return { label: 'In Stock', variant: 'success' as const };
};

const initMovements: Movement[] = [
  { id: 'SM-001', product: 'Regenerist Cream', type: 'Stock In', qty: 200, date: 'Sept 20, 2026', ref: 'PO-2026-0091' },
  { id: 'SM-002', product: 'Pro-V Shampoo', type: 'Stock Out', qty: 45, date: 'Sept 19, 2026', ref: 'SO-2026-1234' },
  { id: 'SM-003', product: 'Classic Cleanser', type: 'Stock Out', qty: 22, date: 'Sept 18, 2026', ref: 'SO-2026-1190' },
];

export default function AdminInventory() {
  const { products, loading, error, refresh } = useCatalog();
  const [inventory, setInventory] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'in' | 'out'>('in');
  const [form, setForm] = useState({ productId: '', qty: '', ref: '', notes: '' });
  const { toasts, add: addToast, remove } = useToast();

  useEffect(() => { setInventory(products.map(toStockItem)); }, [products]);
  useEffect(() => {
    void supabase.from('inventory_movements').select('id, variant_id, movement_type, quantity, reference, created_at, product_variants(products(name))').order('created_at', { ascending: false }).limit(30).then(({ data }) => {
      setMovements((data || []).map((row: any) => ({ id: row.id, product: row.product_variants?.products?.name || row.variant_id, type: row.movement_type, qty: row.quantity, date: new Date(row.created_at).toLocaleDateString(), ref: row.reference || '' })));
    });
  }, []);

  const openModal = (type: 'in' | 'out') => {
    setModalType(type);
    setForm({ productId: '', qty: '', ref: '', notes: '' });
    setModalOpen(true);
  };

  const submit = () => {
    const qty = parseInt(form.qty);
    if (!form.productId) { addToast('error', 'Select a product.'); return; }
    if (!qty || qty <= 0) { addToast('error', 'Enter a valid quantity.'); return; }

    const item = inventory.find(i => i.id === form.productId);
    if (!item) return;

    if (modalType === 'out' && qty > item.stock) {
      addToast('error', `Cannot remove ${qty} units. Only ${item.stock} in stock.`); return;
    }

    void (async () => {
      const nextStock = modalType === 'in' ? item.stock + qty : item.stock - qty;
      if (!item.variantId) { addToast('error', 'This product has no inventory variant configured.'); return; }
      const { error: stockError } = await supabase.from('inventory').update({ stock_quantity: nextStock }).eq('variant_id', item.variantId);
      if (stockError) { addToast('error', stockError.message); return; }
      const { error: movementError } = await supabase.from('inventory_movements').insert({ variant_id: item.variantId, movement_type: modalType === 'in' ? 'Stock In' : 'Stock Out', quantity: qty, reference: form.ref || null, notes: form.notes || null });
      if (movementError) { addToast('error', movementError.message); return; }
      addToast('success', `${modalType === 'in' ? 'Stock added' : 'Stock removed'}: ${qty} units of ${item.product}`);
      setModalOpen(false);
      await refresh();
    })();
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const lowStockCount = inventory.filter(i => i.stock > 0 && i.stock < 10).length;
  const outCount = inventory.filter(i => i.stock === 0).length;

  return (
    <AdminSidebar>
      <ToastContainer toasts={toasts} onRemove={remove} />
      <div className="flex flex-col gap-6 animate-fade-in">
        {loading && <p className="text-sm text-[var(--muted-foreground)]">Loading inventory...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Inventory</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Track and manage product stock levels</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => openModal('out')}><ArrowUp size={14} /> Stock Out</Button>
            <Button onClick={() => openModal('in')}><ArrowDown size={14} /> Stock In</Button>
          </div>
        </div>

        {(lowStockCount > 0 || outCount > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-[var(--radius-lg)] p-4 flex items-center gap-3">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              {lowStockCount > 0 && <><strong>{lowStockCount} product{lowStockCount > 1 ? 's' : ''}</strong> running low. </>}
              {outCount > 0 && <><strong>{outCount} product{outCount > 1 ? 's' : ''}</strong> out of stock.</>}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'In Stock', count: inventory.filter(i => i.stock >= 10).length, color: 'text-emerald-600' },
            { label: 'Low Stock', count: lowStockCount, color: 'text-amber-600' },
            { label: 'Out of Stock', count: outCount, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-4 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
          <DataTable
            data={inventory.map(i => ({ ...i, _status: getStatus(i.stock) })) as any}
            columns={[
              { key: 'product', label: 'Product', render: (row: any) => (
                <div className="flex items-center gap-2">
                  <img src={row.image} alt="" className="w-8 h-8 object-cover rounded bg-[var(--secondary)]" />
                  <div>
                    <div className="text-sm font-medium">{row.product}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{row.brand}</div>
                  </div>
                </div>
              )},
              { key: 'category', label: 'Category' },
              { key: 'stock', label: 'Current Stock', render: (row: any) => (
                <div className="flex flex-col gap-1 min-w-24">
                  <span className="font-mono text-sm font-medium">{row.stock} units</span>
                  <ProgressBar value={row.stock} max={400} />
                </div>
              )},
              { key: 'reorderLevel', label: 'Reorder At', render: () => <span className="font-mono text-sm text-[var(--muted-foreground)]">20 units</span> },
              { key: '_status', label: 'Status', render: (row: any) => <Badge variant={row._status.variant}>{row._status.label}</Badge> },
            ]}
          />
        </div>

        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
          <h2 className="font-semibold text-sm mb-4">Movement History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['Reference', 'Product', 'Type', 'Quantity', 'Date', 'Document'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.map(m => (
                  <tr key={m.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] transition-colors">
                    <td className="px-3 py-3 font-mono text-xs text-[var(--muted-foreground)]">{m.id}</td>
                    <td className="px-3 py-3 font-medium">{m.product}</td>
                    <td className="px-3 py-3">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${m.type === 'Stock In' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {m.type === 'Stock In' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}{m.type}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono">{m.type === 'Stock Out' ? '-' : '+'}{m.qty}</td>
                    <td className="px-3 py-3 text-[var(--muted-foreground)] text-xs">{m.date}</td>
                    <td className="px-3 py-3 text-xs text-[var(--primary)] font-mono">{m.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={modalType === 'in' ? 'Record Stock In' : 'Record Stock Out'}>
          <div className="flex flex-col gap-4">
            <Select
              label="Product *"
              value={form.productId}
              onChange={set('productId')}
              options={[{ value: '', label: 'Select product…' }, ...inventory.map(i => ({ value: i.id, label: `${i.product} (${i.stock} in stock)` }))]}
            />
            <Input label="Quantity *" type="number" value={form.qty} onChange={set('qty')} placeholder="0" />
            <Input label={modalType === 'in' ? 'Purchase Order Ref.' : 'Sales Order Ref.'} value={form.ref} onChange={set('ref')} placeholder={modalType === 'in' ? 'PO-2026-XXXX' : 'SO-2026-XXXX'} />
            <Input label="Notes (optional)" value={form.notes} onChange={set('notes')} placeholder="Any additional notes…" />
            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
              <Button className="flex-1" onClick={submit}>Record {modalType === 'in' ? 'Stock In' : 'Stock Out'}</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminSidebar>
  );
}
