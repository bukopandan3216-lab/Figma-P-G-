import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast, ToastContainer } from '../../components/ui';
import { Plus, Edit2, Eye, FileDown, BarChart2, Brain, Lightbulb, Users, ShoppingCart, Truck, TrendingUp, AlertTriangle, CheckCircle, XCircle, Settings } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button, Badge, DataTable, Modal, Input, Select, Card, EmptyState, Tabs } from '../../components/ui';
import AdminSidebar from '../../components/AdminSidebar';
import { fetchAdminUsers, fetchCustomers, fetchProductSales, fetchPurchases, fetchRecommendationRules, fetchSuppliers, fetchTransactions, saveRecommendationRule } from '../../lib/adminData';
import { supabase } from '../../lib/supabase';
import { recommendProducts } from '../../lib/recommendations';
import { useCatalog } from '../../context/CatalogContext';

// ─── Suppliers ────────────────────────────────────────────────────────────────
const suppliers: any[] = [];

export function AdminSuppliers() {
  const [view, setView] = useState<'list' | 'profile'>('list');
  const [selected, setSelected] = useState<any>(null);
  const [supplierList, setSupplierList] = useState(suppliers);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', contact: '', email: '', phone: '' });
  const { toasts, add: addToast, remove } = useToast();
  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setAddForm(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => { void fetchSuppliers().then(setSupplierList).catch(error => addToast('error', error.message)); }, []);

  const saveSupplier = () => {
    if (!addForm.name) { addToast('error', 'Supplier name is required.'); return; }
    void supabase.from('suppliers').insert({ name: addForm.name, contact_email: addForm.email, phone: addForm.phone }).select('*').single().then(({ data, error }) => {
      if (error) { addToast('error', error.message); return; }
      setSupplierList(prev => [...prev, { id: data.id, ...addForm, products: 0, status: 'Active', lastOrder: 'N/A' }]);
      addToast('success', 'Supplier added successfully!');
      setAddOpen(false); setAddForm({ name: '', contact: '', email: '', phone: '' });
    });
  };

  if (view === 'profile' && selected) return (
    <AdminSidebar>
      <div className="animate-fade-in">
        <button onClick={() => setView('list')} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4 flex items-center gap-1">← Back to Suppliers</button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-lg font-bold text-[var(--primary)]">{selected.name[0]}</div>
              <div>
                <h2 className="font-semibold">{selected.name}</h2>
                <Badge variant={selected.status === 'Active' ? 'success' : 'muted'}>{selected.status}</Badge>
              </div>
            </div>
            {[['Contact', selected.contact], ['Email', selected.email], ['Phone', selected.phone], ['Products', selected.products], ['Last Order', selected.lastOrder]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-[var(--border)] last:border-0 text-sm">
                <span className="text-[var(--muted-foreground)]">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
            <h3 className="font-semibold mb-4">Purchase Orders</h3>
            <DataTable
              data={(selected.purchaseOrders || []) as any}
              columns={[
                { key: 'po', label: 'PO Number' },
                { key: 'date', label: 'Date' },
                { key: 'items', label: 'Items' },
                { key: 'amount', label: 'Amount' },
                { key: 'status', label: 'Status', render: (row: any) => <Badge variant={row.status === 'Received' ? 'success' : 'info'}>{row.status}</Badge> },
              ]}
            />
          </div>
        </div>
      </div>
    </AdminSidebar>
  );

  return (
    <AdminSidebar>
      <ToastContainer toasts={toasts} onRemove={remove} />
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Suppliers</h1><p className="text-sm text-[var(--muted-foreground)]">{supplierList.length} registered suppliers</p></div>
          <Button onClick={() => setAddOpen(true)}><Plus size={15} /> Add Supplier</Button>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
          <DataTable
            data={supplierList as any}
            columns={[
              { key: 'name', label: 'Supplier', render: (row: any) => <span className="font-medium">{row.name}</span> },
              { key: 'contact', label: 'Contact' },
              { key: 'email', label: 'Email' },
              { key: 'products', label: 'Products' },
              { key: 'status', label: 'Status', render: (row: any) => <Badge variant={row.status === 'Active' ? 'success' : 'muted'}>{row.status}</Badge> },
              { key: 'lastOrder', label: 'Last Order' },
              { key: 'actions', label: '', sortable: false, render: (row: any) => (
                <button onClick={() => { setSelected(row as any); setView('profile'); }} className="p-1.5 hover:bg-[var(--secondary)] rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"><Eye size={14} /></button>
              )},
            ]}
          />
        </div>
      </div>
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Supplier">
        <div className="flex flex-col gap-4">
          <Input label="Supplier Name *" value={addForm.name} onChange={setF('name')} placeholder="e.g. P&G Distribution PH" />
          <Input label="Contact Person" value={addForm.contact} onChange={setF('contact')} placeholder="Ana Cruz" />
          <Input label="Email" type="email" value={addForm.email} onChange={setF('email')} placeholder="contact@supplier.com" />
          <Input label="Phone" value={addForm.phone} onChange={setF('phone')} placeholder="+63 2 8123 4567" />
          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={saveSupplier} className="flex-1">Add Supplier</Button>
          </div>
        </div>
      </Modal>
    </AdminSidebar>
  );
}

// ─── Purchases ────────────────────────────────────────────────────────────────
const purchases: any[] = [];
const statusSteps = ['Draft', 'Submitted', 'Approved', 'Ordered', 'In Transit', 'Received'];

export function AdminPurchases() {
  const [createOpen, setCreateOpen] = useState(false);
  const [purchaseList, setPurchaseList] = useState<any[]>([]);
  useEffect(() => { void fetchPurchases().then(setPurchaseList).catch(() => setPurchaseList([])); }, []);
  return (
    <AdminSidebar>
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Purchase Orders</h1><p className="text-sm text-[var(--muted-foreground)]">{purchaseList.length} purchase orders</p></div>
          <Button onClick={() => setCreateOpen(true)}><Plus size={15} /> Create PO</Button>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
          <DataTable
            data={purchaseList as any}
            columns={[
              { key: 'id', label: 'PO Number', render: (row: any) => <span className="font-mono text-sm">{row.id}</span> },
              { key: 'supplier', label: 'Supplier' },
              { key: 'createdBy', label: 'Created By' },
              { key: 'date', label: 'Date' },
              { key: 'items', label: 'Items' },
              { key: 'total', label: 'Total' },
              { key: 'status', label: 'Status', render: (row: any) => (
                <Badge variant={row.status === 'Received' ? 'success' : row.status === 'In Transit' ? 'info' : row.status === 'Pending' ? 'warning' : 'muted'}>{row.status}</Badge>
              )},
              { key: 'tracker', label: 'Progress', sortable: false, render: (row: any) => {
                const idx = statusSteps.indexOf(row.status);
                return (
                  <div className="flex gap-0.5">
                    {statusSteps.map((_, i) => <div key={i} className={`h-1.5 w-4 rounded-full ${i <= idx ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'}`} />)}
                  </div>
                );
              }},
            ]}
          />
        </div>
        <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Purchase Order" size="lg">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Supplier" options={[{ value: '', label: 'Select supplier…' }, ...suppliers.map(s => ({ value: s.id, label: s.name }))]} className="col-span-2" />
            <Input label="Expected Delivery" type="date" />
            <Input label="Payment Terms" placeholder="e.g. Net 30" />
            <div className="col-span-2">
              <h3 className="text-sm font-semibold mb-2">Order Items</h3>
              <div className="border border-[var(--border)] rounded-[var(--radius-lg)] p-3 text-sm text-[var(--muted-foreground)] text-center py-6">
                + Add product lines
              </div>
            </div>
            <Input label="Notes" placeholder="Optional notes…" className="col-span-2" />
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="flex-1">Cancel</Button>
            <Button className="flex-1" onClick={() => setCreateOpen(false)}>Create Purchase Order</Button>
          </div>
        </Modal>
      </div>
    </AdminSidebar>
  );
}

// ─── Customers ────────────────────────────────────────────────────────────────
const customers: any[] = [];

export function AdminCustomers() {
  const [view, setView] = useState<'list' | 'profile'>('list');
  const [selected, setSelected] = useState<any>(null);
  const [customerList, setCustomerList] = useState<any[]>([]);
  useEffect(() => { void fetchCustomers().then(setCustomerList).catch(() => setCustomerList([])); }, []);

  if (view === 'profile' && selected) return (
    <AdminSidebar>
      <div className="animate-fade-in">
        <button onClick={() => setView('list')} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4 flex items-center gap-1">← Back to Customers</button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-lg font-bold text-[var(--primary)]">{selected.name.split(' ').map((n: string) => n[0]).join('')}</div>
              <div>
                <h2 className="font-semibold">{selected.name}</h2>
                <Badge variant={selected.segment === 'VIP' ? 'rose' : selected.segment === 'New' ? 'info' : 'default'}>{selected.segment}</Badge>
              </div>
            </div>
            {[['Email', selected.email], ['Phone', selected.phone], ['Member Since', selected.joined], ['Total Orders', selected.orders], ['Total Spend', selected.total]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-[var(--border)] last:border-0 text-sm">
                <span className="text-[var(--muted-foreground)]">{k}</span><span className="font-medium">{v}</span>
              </div>
            ))}
            <div className="mt-4">
              <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase mb-2">Skin Profile</div>
              <div className="flex flex-wrap gap-1.5">
                {['Combination Skin', 'Anti-Aging', 'Dark Spots'].map(tag => <Badge key={tag} variant="muted">{tag}</Badge>)}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
            <h3 className="font-semibold mb-4">Purchase History</h3>
            <DataTable
              data={[
                { order: 'PGB-2026-08841', date: 'Sept 18, 2026', items: 3, total: '₱42.47', status: 'Delivered' },
                { order: 'PGB-2026-07203', date: 'Aug 30, 2026', items: 1, total: '₱28.99', status: 'Delivered' },
              ] as any}
              columns={[
                { key: 'order', label: 'Order ID' },
                { key: 'date', label: 'Date' },
                { key: 'items', label: 'Items' },
                { key: 'total', label: 'Total' },
                { key: 'status', label: 'Status', render: (row: any) => <Badge variant="success">{row.status}</Badge> },
              ]}
            />
          </div>
        </div>
      </div>
    </AdminSidebar>
  );

  return (
    <AdminSidebar>
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Customers</h1><p className="text-sm text-[var(--muted-foreground)]">{customerList.length} registered customers</p></div>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
          <DataTable
            data={customerList as any}
            columns={[
              { key: 'name', label: 'Customer', render: (row: any) => (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-xs font-bold text-[var(--primary)]">{row.name.split(' ').map((n: string) => n[0]).join('')}</div>
                  <span className="font-medium text-sm">{row.name}</span>
                </div>
              )},
              { key: 'email', label: 'Email' },
              { key: 'joined', label: 'Joined' },
              { key: 'orders', label: 'Orders' },
              { key: 'total', label: 'Total Spend' },
              { key: 'segment', label: 'Segment', render: (row: any) => <Badge variant={row.segment === 'VIP' ? 'rose' : row.segment === 'New' ? 'info' : 'default'}>{row.segment}</Badge> },
              { key: 'actions', label: '', sortable: false, render: (row: any) => (
                <button onClick={() => { setSelected(row as any); setView('profile'); }} className="p-1.5 hover:bg-[var(--secondary)] rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"><Eye size={14} /></button>
              )},
            ]}
          />
        </div>
      </div>
    </AdminSidebar>
  );
}

// ─── Sales ────────────────────────────────────────────────────────────────────
const transactions: any[] = [];

export function AdminSales() {
  const [detail, setDetail] = useState<any>(null);
  const [transactionList, setTransactionList] = useState<any[]>([]);
  useEffect(() => { void fetchTransactions().then(setTransactionList).catch(() => setTransactionList([])); }, []);
  return (
    <AdminSidebar>
      <div className="flex flex-col gap-6 animate-fade-in">
        <div><h1 className="text-xl font-bold">Sales Transactions</h1><p className="text-sm text-[var(--muted-foreground)]">All sales and transaction records</p></div>
        <div className="grid grid-cols-4 gap-4">
          {[{ l: 'Today\'s Sales', v: '₱8,491' }, { l: 'This Month', v: '₱68,900' }, { l: 'Avg. Order Value', v: '₱312' }, { l: 'Return Rate', v: '2.1%' }].map(k => (
            <div key={k.l} className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-4 text-center">
              <div className="text-2xl font-bold">{k.v}</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">{k.l}</div>
            </div>
          ))}
        </div>
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
          <DataTable
            data={transactionList as any}
            columns={[
              { key: 'id', label: 'Transaction ID', render: (row: any) => <span className="font-mono text-sm">{row.id}</span> },
              { key: 'customer', label: 'Customer' },
              { key: 'date', label: 'Date' },
              { key: 'items', label: 'Items' },
              { key: 'total', label: 'Total' },
              { key: 'payment', label: 'Payment' },
              { key: 'status', label: 'Status', render: (row: any) => <Badge variant={row.status === 'Completed' ? 'success' : row.status === 'Refunded' ? 'danger' : 'warning'}>{row.status}</Badge> },
              { key: 'view', label: '', sortable: false, render: (row: any) => <button onClick={() => setDetail(row as any)} className="p-1.5 hover:bg-[var(--secondary)] rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"><Eye size={14} /></button> },
            ]}
          />
        </div>
        <Modal open={!!detail} onClose={() => setDetail(null)} title={`Transaction ${detail?.id}`}>
          {detail && (
            <div className="flex flex-col gap-3 text-sm">
              {[['Customer', detail.customer], ['Date', detail.date], ['Items', detail.items], ['Total', detail.total], ['Payment Method', detail.payment], ['Status', detail.status]].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-[var(--border)] pb-2 last:border-0">
                  <span className="text-[var(--muted-foreground)]">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      </div>
    </AdminSidebar>
  );
}

// ─── Customer Insights ────────────────────────────────────────────────────────
const demandData: any[] = [];

const clusterData: any[] = [];

export function AdminInsights() {
  const [sales, setSales] = useState<any[]>([]);
  const [customerClusters, setCustomerClusters] = useState<any[]>([]);
  useEffect(() => {
    void fetchProductSales().then(rows => setSales(rows.map((row: any) => ({ product: row.name, demand: row.units_sold, stock: row.stock, gap: Math.max(0, row.units_sold - row.stock), sales: row.units_sold, action: row.units_sold === 0 ? 'Review pricing or discontinue' : 'Consider promotion or bundle', type: row.units_sold === 0 ? 'disc' : 'promo' })))).catch(() => setSales([]));
    void fetchCustomers().then(rows => setCustomerClusters([{ cluster: 'All Customers', size: rows.length, age: 'All', topProduct: sales[0]?.product || 'Pending', engagement: '0%' }])).catch(() => setCustomerClusters([]));
  }, []);
  const demand = sales.map(row => ({ ...row, demand: Math.min(100, row.demand) })).slice(0, 8);
  const underperforming = [...sales].sort((a, b) => a.units_sold - b.units_sold).slice(0, 3).map(product => ({
    ...product,
    type: product.units_sold === 0 ? 'disc' : 'promo',
    action: product.units_sold === 0 ? 'Review pricing or discontinue' : 'Consider promotion or bundle',
  }));
  return (
    <AdminSidebar>
      <div className="flex flex-col gap-6 animate-fade-in">
        <div><h1 className="text-xl font-bold">Customer Insights</h1><p className="text-sm text-[var(--muted-foreground)]">AI-powered demand signals and customer preference analysis</p></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Demand vs Stock */}
          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
            <h2 className="font-semibold text-sm mb-1">Most In-Demand Products</h2>
            <p className="text-xs text-[var(--muted-foreground)] mb-4">Demand score vs current stock levels</p>
            <div className="flex flex-col gap-3">
              {demand.map(d => (
                <div key={d.product} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{d.product}</span>
                    <div className="flex items-center gap-2">
                      {d.gap > 0 && <Badge variant="warning">Potential Stockout</Badge>}
                      <span className="text-[var(--muted-foreground)]">{d.stock} units</span>
                    </div>
                  </div>
                  <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${d.demand}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Underperforming */}
          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
            <h2 className="font-semibold text-sm mb-1">Underperforming Products</h2>
            <p className="text-xs text-[var(--muted-foreground)] mb-4">Products with low movement — suggested actions</p>
            <div className="flex flex-col gap-3">
              {underperforming.map((p: any) => (
                <div key={p.name} className="flex items-start gap-3 p-3 bg-[var(--secondary)] rounded-[var(--radius-lg)]">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${p.type === 'disc' ? 'bg-red-100 text-red-600' : p.type === 'promo' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-600'}`}>
                    {p.type === 'disc' ? <XCircle size={14} /> : p.type === 'promo' ? <Lightbulb size={14} /> : <TrendingUp size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{p.units_sold} units sold</div>
                    <div className="text-xs text-[var(--foreground)] mt-0.5 font-medium">{p.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer clusters */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
          <h2 className="font-semibold text-sm mb-4">Customer Preference Clusters</h2>
          <DataTable
            data={customerClusters as any}
            columns={[
              { key: 'cluster', label: 'Cluster Name', render: (row: any) => <span className="font-medium">{row.cluster}</span> },
              { key: 'size', label: 'Customers', render: (row: any) => <span className="font-mono">{row.size.toLocaleString()}</span> },
              { key: 'age', label: 'Age Range' },
              { key: 'topProduct', label: 'Top Product' },
              { key: 'engagement', label: 'Rec Engagement', render: (row: any) => (
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: row.engagement }} />
                  </div>
                  <span className="text-xs font-medium">{row.engagement}</span>
                </div>
              )},
            ]}
          />
        </div>
      </div>
    </AdminSidebar>
  );
}

// ─── Recommendations ──────────────────────────────────────────────────────────
export function AdminRecommendations() {
  const { toasts, add: addToast, remove } = useToast();
  const [endpointOpen, setEndpointOpen] = useState(false);
  const [endpoint, setEndpoint] = useState('https://api.pgbeauty.ai/v1/recommend');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [addRuleOpen, setAddRuleOpen] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
  const [newRule, setNewRule] = useState({ name: '', desc: '', priority: 'Medium' });
  const { products } = useCatalog();
  useEffect(() => { void fetchRecommendationRules().then(setRules).catch(error => addToast('error', error.message)); }, []);

  const testConnection = async () => {
    setTesting(true); setTestResult('idle');
    try {
      const recommendations = await recommendProducts(null, products);
      setTestResult('ok');
      addToast('success', `Recommendation engine returned ${recommendations.length} scored products.`);
    } catch (error) {
      setTestResult('fail');
      addToast('error', error instanceof Error ? error.message : 'Recommendation engine failed.');
    } finally { setTesting(false); }
  };

  const addRule = () => {
    if (!newRule.name) { addToast('error', 'Rule name is required.'); return; }
    void saveRecommendationRule(newRule).then(() => {
      setRules(prev => [...prev, { ...newRule, active: true }]);
      addToast('success', 'Recommendation rule added!');
      setAddRuleOpen(false); setNewRule({ name: '', desc: '', priority: 'Medium' });
    }).catch(error => addToast('error', error.message));
  };

  return (
    <AdminSidebar>
      <div className="flex flex-col gap-6 animate-fade-in">
        <div><h1 className="text-xl font-bold">Recommendation Engine</h1><p className="text-sm text-[var(--muted-foreground)]">Manage AI-powered personalization rules and model status</p></div>

        {/* Model status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Model Accuracy', value: '94.2%', status: 'Healthy', color: 'emerald' },
            { label: 'Last Retrained', value: 'Sept 19, 2026', status: '2 days ago', color: 'blue' },
            { label: 'Active Rules', value: '24', status: '3 pending', color: 'amber' },
          ].map(s => (
            <div key={s.label} className={`bg-white border rounded-[var(--radius-xl)] p-4 border-${s.color}-200`}>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm font-medium mt-0.5">{s.label}</div>
              <div className={`text-xs mt-1 text-${s.color}-600`}>{s.status}</div>
            </div>
          ))}
        </div>

        {/* AI Integration Point */}
        <div className="border-2 border-dashed border-[var(--primary)]/30 rounded-[var(--radius-xl)] p-6 bg-[var(--rose-light)]/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
              <Brain size={20} className="text-[var(--primary)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">AI API Integration Point</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                This panel connects to the external recommendation model API. Replace the placeholder endpoint below with your deployed model URL.
                The engine accepts a customer profile payload and returns a ranked list of product IDs with confidence scores.
              </p>
              <div className="mt-3 p-3 bg-[var(--slate-admin)] rounded-[var(--radius-lg)] font-mono text-xs text-emerald-400 overflow-x-auto">
                <div className="text-white/40">// AI Model API Endpoint</div>
                <div>POST https://api.pgbeauty.ai/v1/recommend</div>
                <div className="text-white/40 mt-1">// Request payload: customer_id, skin_type, concerns[], age_range</div>
                <div className="text-white/40">// Response: &#123; products: [&#123; id, score, reason &#125;] &#125;</div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="border-[var(--primary)] text-[var(--primary)]" onClick={() => setEndpointOpen(true)}>Configure Endpoint</Button>
                <Button size="sm" onClick={testConnection} loading={testing}>{testResult === 'ok' ? '✓ Connected' : 'Test Connection'}</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Active rules */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
          <ToastContainer toasts={toasts} onRemove={remove} />
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Active Recommendation Rules</h2>
            <Button size="sm" onClick={() => setAddRuleOpen(true)}><Plus size={13} /> Add Rule</Button>
          </div>
          <div className="flex flex-col gap-2">
            {rules.map((rule, i) => (
              <div key={rule.name + i} className="flex items-center gap-4 p-4 border border-[var(--border)] rounded-[var(--radius-lg)] hover:bg-[var(--secondary)] transition-colors">
                <button
                  onClick={() => {
                    const nextActive = !rule.active;
                    void supabase.from('recommendation_rules').update({ is_active: nextActive }).eq('id', rule.id);
                    setRules(prev => prev.map((r, j) => j === i ? { ...r, active: nextActive } : r));
                  }}
                  className={`w-8 h-4 rounded-full flex-shrink-0 cursor-pointer transition-colors relative ${rule.active ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${rule.active ? 'left-4' : 'left-0.5'}`} />
                </button>
                <div className="flex-1">
                  <div className="text-sm font-medium">{rule.name}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{rule.desc}</div>
                </div>
                <Badge variant={rule.priority === 'High' ? 'danger' : rule.priority === 'Medium' ? 'warning' : 'muted'}>{rule.priority}</Badge>
                <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1" onClick={() => addToast('info', `Editing rule: ${rule.name}`)}><Edit2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal open={endpointOpen} onClose={() => setEndpointOpen(false)} title="Configure AI Endpoint">
        <div className="flex flex-col gap-4">
          <Input label="API Endpoint URL" value={endpoint} onChange={e => setEndpoint(e.target.value)} />
          <Input label="API Key (Bearer Token)" type="password" placeholder="sk-••••••••••••••••" />
          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={() => setEndpointOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={() => { setEndpointOpen(false); addToast('success', 'Endpoint configuration saved!'); }} className="flex-1">Save Configuration</Button>
          </div>
        </div>
      </Modal>
      <Modal open={addRuleOpen} onClose={() => setAddRuleOpen(false)} title="Add Recommendation Rule">
        <div className="flex flex-col gap-4">
          <Input label="Rule Name *" value={newRule.name} onChange={e => setNewRule(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Brand Loyalty Boost" />
          <Input label="Description" value={newRule.desc} onChange={e => setNewRule(p => ({ ...p, desc: e.target.value }))} placeholder="Describe what this rule does…" />
          <Select label="Priority" value={newRule.priority} onChange={e => setNewRule(p => ({ ...p, priority: e.target.value }))} options={[{ value: 'High', label: 'High' }, { value: 'Medium', label: 'Medium' }, { value: 'Low', label: 'Low' }]} />
          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={() => setAddRuleOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={addRule} className="flex-1">Add Rule</Button>
          </div>
        </div>
      </Modal>
    </AdminSidebar>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────
const reportTypes = [
  { name: 'Product Report', desc: 'Full product catalog with prices and status', icon: '📦', color: 'bg-blue-50 text-blue-600' },
  { name: 'Inventory Report', desc: 'Current stock levels and movement summary', icon: '🏪', color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Low Stock Alert Report', desc: 'Products below reorder threshold', icon: '⚠️', color: 'bg-amber-50 text-amber-600' },
  { name: 'Sales Report', desc: 'Transaction history and revenue summary', icon: '📈', color: 'bg-[var(--rose-light)] text-[var(--primary)]' },
  { name: 'Purchase Report', desc: 'All purchase orders by supplier', icon: '🛒', color: 'bg-purple-50 text-purple-600' },
  { name: 'Supplier Report', desc: 'Supplier performance and spend summary', icon: '🚚', color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Customer Report', desc: 'Customer demographics and purchase behavior', icon: '👥', color: 'bg-teal-50 text-teal-600' },
  { name: 'User Activity Report', desc: 'Admin user login and action logs', icon: '🔐', color: 'bg-gray-50 text-gray-600' },
];

export function AdminReports() {
  const { toasts, add: addToast, remove } = useToast();
  return (
    <AdminSidebar>
      <ToastContainer toasts={toasts} onRemove={remove} />
      <div className="flex flex-col gap-6 animate-fade-in">
        <div><h1 className="text-xl font-bold">Reports Hub</h1><p className="text-sm text-[var(--muted-foreground)]">Generate and export business intelligence reports</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reportTypes.map(report => (
            <div key={report.name} className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-[var(--radius)] flex items-center justify-center text-xl ${report.color}`}>{report.icon}</div>
              <div>
                <div className="font-semibold text-sm">{report.name}</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{report.desc}</div>
              </div>
              <div className="flex gap-2 mt-auto">
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => addToast('info', `Opening preview: ${report.name}`)}>Preview</Button>
                <Button size="sm" className="flex-1 text-xs" onClick={() => addToast('success', `${report.name} exported as CSV!`)}><FileDown size={12} /> Export</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminSidebar>
  );
}

// ─── User Management ──────────────────────────────────────────────────────────
const adminUsers: any[] = [];

const activityLog = [
  { user: 'Super Admin', action: 'Added product: Vitamin E Serum', time: '10 min ago' },
  { user: 'Beauty Admin', action: 'Updated inventory for Classic Cleanser', time: '1 hr ago' },
  { user: 'Jane Staff', action: 'Created PO-2026-0091', time: '3 hr ago' },
  { user: 'Beauty Admin', action: 'Exported Sales Report', time: 'Sept 20, 2026' },
];

export function AdminUsers() {
  const [modalOpen, setModalOpen] = useState(false);
  const [userList, setUserList] = useState<any[]>([]);
  useEffect(() => { void fetchAdminUsers().then(setUserList).catch(() => setUserList([])); }, []);
  return (
    <AdminSidebar>
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Users & Access</h1><p className="text-sm text-[var(--muted-foreground)]">Manage admin accounts and role permissions</p></div>
          <Button onClick={() => setModalOpen(true)}><Plus size={15} /> Add User</Button>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
          <DataTable
            data={userList as any}
            columns={[
              { key: 'name', label: 'Name', render: (row: any) => (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-xs font-bold text-[var(--primary)]">{row.name.split(' ').map((n: string) => n[0]).join('')}</div>
                  <span className="font-medium text-sm">{row.name}</span>
                </div>
              )},
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role', render: (row: any) => (
                <Badge variant={row.role === 'Super Admin' ? 'rose' : row.role === 'Beauty Admin' ? 'info' : 'default'}>{row.role}</Badge>
              )},
              { key: 'status', label: 'Status', render: (row: any) => <Badge variant={row.status === 'Active' ? 'success' : 'muted'}>{row.status}</Badge> },
              { key: 'lastLogin', label: 'Last Login' },
              { key: 'edit', label: '', sortable: false, render: () => <button className="p-1.5 hover:bg-[var(--secondary)] rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"><Edit2 size={14} /></button> },
            ]}
          />
        </div>

        {/* Activity Log */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
          <h2 className="font-semibold text-sm mb-4">Activity Log</h2>
          <div className="flex flex-col gap-0">
            {activityLog.map((log, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-[var(--border)] last:border-0 text-sm">
                <div className="w-7 h-7 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-xs font-bold text-[var(--primary)] flex-shrink-0">{log.user.split(' ').map(n => n[0]).join('')}</div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{log.user}</span>
                  <span className="text-[var(--muted-foreground)]"> — {log.action}</span>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{log.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Admin User">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" placeholder="Jane" />
              <Input label="Last Name" placeholder="Doe" />
            </div>
            <Input label="Email" type="email" placeholder="jane@pgbeauty.com" />
            <Select label="Role" options={[{ value: '', label: 'Select role…' }, { value: 'super_admin', label: 'Super Admin' }, { value: 'beauty_admin', label: 'Beauty Admin' }, { value: 'beauty_staff', label: 'Beauty Staff' }]} />
            <Input label="Temporary Password" type="password" placeholder="••••••••" hint="User will be prompted to change on first login" />
            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
              <Button className="flex-1" onClick={() => setModalOpen(false)}>Create User</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminSidebar>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export function AdminSettings() {
  const [tab, setTab] = useState('General');
  const { toasts, add: addToast, remove } = useToast();
  return (
    <AdminSidebar>
      <ToastContainer toasts={toasts} onRemove={remove} />
      <div className="flex flex-col gap-6 animate-fade-in">
        <div><h1 className="text-xl font-bold">Settings</h1><p className="text-sm text-[var(--muted-foreground)]">System configuration and preferences</p></div>
        <Tabs tabs={['General', 'Notifications', 'Security', 'Integrations']} active={tab} onChange={setTab} />
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
          {tab === 'General' && (
            <div className="flex flex-col gap-5 max-w-lg">
              <Input label="Store Name" defaultValue="P&G Beauty PH" />
              <Input label="Store Email" type="email" defaultValue="store@pgbeauty.com" />
              <Select label="Currency" options={[{ value: 'PHP', label: '₱ Philippine Peso (PHP)' }, { value: 'USD', label: '$ US Dollar (USD)' }]} />
              <Select label="Time Zone" options={[{ value: 'Asia/Manila', label: 'Asia/Manila (UTC+8)' }]} />
              <Input label="Low Stock Threshold" type="number" defaultValue="20" hint="Alert when product stock falls below this number" />
              <Button onClick={() => addToast('success', 'Settings saved successfully!')}>Save Settings</Button>
            </div>
          )}
          {tab === 'Notifications' && (
            <div className="flex flex-col gap-4 max-w-lg">
              {[
                { label: 'Low stock alerts', desc: 'Get notified when products are running low' },
                { label: 'New order notifications', desc: 'Alert on every new customer order' },
                { label: 'AI model retraining', desc: 'Notify when recommendation model completes retraining' },
                { label: 'Weekly sales summary', desc: 'Receive weekly email digest of sales performance' },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-[var(--radius-lg)]">
                  <div>
                    <div className="text-sm font-medium">{n.label}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{n.desc}</div>
                  </div>
                  <div className="w-10 h-5 bg-[var(--primary)] rounded-full relative cursor-pointer flex-shrink-0">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab !== 'General' && tab !== 'Notifications' && (
            <div className="text-center py-12 text-[var(--muted-foreground)] text-sm">
              <Settings size={40} className="mx-auto opacity-20 mb-3" />
              <p>{tab} settings are available in the full implementation.</p>
            </div>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}

// ─── Admin Login ──────────────────────────────────────────────────────────────
export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setLoading(true); setError('');
    const result = await login(email, password, 'admin');
    setLoading(false);
    if (result.ok) navigate('/admin/dashboard');
    else setError(result.error || 'Login failed. Check your admin credentials.');
  };

  return (
    <div className="min-h-screen bg-[var(--slate-admin)] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-[var(--radius-xl)] shadow-2xl p-8">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center"><Brain size={16} className="text-white" /></div>
          <div>
            <div className="font-semibold text-sm text-[var(--foreground)]">P&G Beauty</div>
            <div className="text-[10px] text-[var(--muted-foreground)] font-mono">Admin MIS Portal</div>
          </div>
        </div>
        <h1 className="font-display text-2xl mb-1">Admin Sign In</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">Access restricted to authorized staff only.</p>
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-[var(--radius)] text-sm text-red-700">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@pgbeauty.com" />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>Sign In to MIS</Button>
        </form>
      </div>
    </div>
  );
}
