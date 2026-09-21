import { supabase } from './supabase';

export async function fetchSuppliers() {
  const { data, error } = await supabase.from('suppliers').select('*, supplier_products(product_id), purchase_orders(id, created_at)').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any) => ({ id: row.id, name: row.name, contact: row.contact_email || '', email: row.contact_email || '', phone: row.phone || '', products: row.supplier_products?.length || 0, status: 'Active', lastOrder: row.purchase_orders?.[0]?.created_at ? new Date(row.purchase_orders[0].created_at).toLocaleDateString() : 'N/A', purchaseOrders: (row.purchase_orders || []).map((purchase: any) => ({ po: purchase.id, date: new Date(purchase.created_at).toLocaleDateString(), amount: 'See order total', status: purchase.status, items: 0 })) }));
}

export async function fetchPurchases() {
  const { data, error } = await supabase.from('purchase_orders').select('id, created_by, created_at, total_cost, status, suppliers(name), profiles(full_name, email), purchase_order_items(quantity)').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any) => ({ id: row.id, createdBy: row.profiles?.full_name || row.profiles?.email || 'System', supplier: row.suppliers?.name || 'Unassigned', date: new Date(row.created_at).toLocaleDateString(), items: (row.purchase_order_items || []).reduce((sum: number, item: any) => sum + item.quantity, 0), total: `₱${Number(row.total_cost || 0).toFixed(2)}`, status: row.status }));
}

export async function fetchCustomers() {
  const { data, error } = await supabase.from('profiles').select('id, full_name, email, phone, created_at, orders(total_amount)').eq('role', 'Customer').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any) => ({ id: row.id, name: row.full_name, email: row.email, phone: row.phone || '', joined: new Date(row.created_at).toLocaleDateString(), orders: row.orders?.length || 0, total: `₱${(row.orders || []).reduce((sum: number, order: any) => sum + Number(order.total_amount || 0), 0).toFixed(2)}`, segment: (row.orders?.length || 0) > 10 ? 'VIP' : (row.orders?.length || 0) > 2 ? 'Regular' : 'New' }));
}

export async function fetchTransactions() {
  const { data, error } = await supabase.from('orders').select('id, created_at, total_amount, payment_method, status, profiles(full_name), order_items(quantity)').order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return (data || []).map((row: any) => ({ id: row.id, customer: row.profiles?.full_name || '', date: new Date(row.created_at).toLocaleDateString(), items: (row.order_items || []).reduce((sum: number, item: any) => sum + item.quantity, 0), total: `₱${Number(row.total_amount || 0).toFixed(2)}`, payment: row.payment_method, status: row.status }));
}

export async function fetchProductSales() {
  const { data, error } = await supabase.from('product_sales').select('*').order('revenue', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAdminUsers() {
  const { data, error } = await supabase.from('profiles').select('id, full_name, email, role, created_at').neq('role', 'Customer').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({ id: row.id, name: row.full_name, email: row.email, role: row.role, status: 'Active', lastLogin: new Date(row.created_at).toLocaleDateString() }));
}

export async function fetchRecommendationRules() {
  const { data, error } = await supabase.from('recommendation_rules').select('*').order('weight_modifier', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({ id: row.id, name: row.rule_name, desc: `Skin triggers: ${(row.trigger_skin_type || []).join(', ')}`, priority: Number(row.weight_modifier) >= 1.5 ? 'High' : Number(row.weight_modifier) >= 1 ? 'Medium' : 'Low', active: row.is_active }));
}

export async function fetchDashboardData() {
  const [{ data: monthly, error: monthlyError }, { data: productSales, error: productsError }, { count: customerCount, error: customersError }, { count: lowStock, error: inventoryError }] = await Promise.all([
    supabase.from('sales_by_month').select('*').order('month_date'),
    supabase.from('product_sales').select('id, name, category_id, revenue, units_sold, stock').order('revenue', { ascending: false }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'Customer'),
    supabase.from('inventory').select('variant_id', { count: 'exact', head: true }).lt('stock_quantity', 10),
  ]);
  if (monthlyError || productsError || customersError || inventoryError) throw monthlyError || productsError || customersError || inventoryError;
  const rows = productSales || [];
  const totalSales = rows.reduce((sum, row) => sum + Number(row.revenue || 0), 0);
  return {
    salesData: monthly || [],
    topProducts: rows.slice(0, 5).map(row => ({ name: row.name, sales: Number(row.revenue || 0) })),
    categoryData: Object.values(rows.reduce((groups: Record<string, { name: string; value: number }>, row: any) => {
      const group = groups[row.category_id] || { name: row.category_id, value: 0 };
      group.value += Number(row.revenue || 0);
      groups[row.category_id] = group;
      return groups;
    }, {})),
    totalSales,
    customerCount: customerCount || 0,
    lowStock: lowStock || 0,
  };
}

export async function saveRecommendationRule(rule: { name: string; desc: string; priority: string }) {
  const priority = rule.priority === 'High' ? 1.5 : rule.priority === 'Medium' ? 1 : 0.7;
  const { error } = await supabase.from('recommendation_rules').insert({ rule_name: rule.name, trigger_skin_type: [], weight_modifier: priority });
  if (error) throw error;
}
