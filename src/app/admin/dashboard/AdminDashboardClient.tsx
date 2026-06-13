'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  FileText, 
  ShoppingBag, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Brain, 
  BookOpen, 
  TrendingUp, 
  BarChart2, 
  Users, 
  ArrowUpRight 
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  sizes: string;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  size: string;
  product: Product;
}

interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: string;
  total: number;
  status: string;
  createdAt: Date | string;
  stripeSessionId: string | null;
  adminNotes: string | null;
  trackingNumber: string | null;
  items: OrderItem[];
  user?: { name: string; email: string } | null;
}

interface Stats {
  totalRevenue: number;
  totalOrdersCount: number;
  productsCount: number;
  outOfStockCount: number;
}

interface AdminDashboardClientProps {
  initialProducts: Product[];
  initialOrders: Order[];
  stats: Stats;
  adminName: string;
}

export default function AdminDashboardClient({
  initialProducts,
  initialOrders,
  stats,
  adminName,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'sales' | 'ai-roi'>('orders');
  
  // Estados para productos
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('camisas');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('10');
  const [newProductSizes, setNewProductSizes] = useState('S,M,L,XL');
  const [newProductImage, setNewProductImage] = useState('/products/veneco_black_shirt.png'); // Default asset
  const [imageSourceType, setImageSourceType] = useState<'preset' | 'upload'>('preset');
  const [uploadedImageBase64, setUploadedImageBase64] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [actionError, setActionError] = useState('');
  
  // Estados para pedidos
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  
  // Estados de edición temporal de envío y notas
  const [tempTracking, setTempTracking] = useState<Record<string, string>>({});
  const [tempNotes, setTempNotes] = useState<Record<string, string>>({});

  // Manejar el toggle del dropdown de detalles de pedido
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // 1. Cambiar estado de una orden
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updatedOrder.status } : o));
      } else {
        const data = await res.json();
        alert(data.error || 'Error al actualizar el estado del pedido');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    }
  };

  // 2. Modificar stock de un producto
  const handleUpdateStock = async (productId: string, newStockVal: string) => {
    const stockInt = parseInt(newStockVal);
    if (isNaN(stockInt) || stockInt < 0) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: stockInt }),
      });

      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: stockInt } : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Crear nuevo producto
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');

    const imageToSend = imageSourceType === 'upload' ? uploadedImageBase64 : newProductImage;

    if (!newProductName || !newProductPrice || !newProductSizes || !newProductDescription || !imageToSend) {
      setActionError('Todos los campos son obligatorios (incluyendo la imagen)');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName,
          description: newProductDescription,
          price: parseFloat(newProductPrice),
          image: imageToSend,
          category: newProductCategory,
          stock: parseInt(newProductStock),
          sizes: newProductSizes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setProducts(prev => [data, ...prev]);
        // Limpiar campos
        setNewProductName('');
        setNewProductPrice('');
        setNewProductStock('10');
        setNewProductSizes(newProductCategory === 'gorras' ? 'Ajustable' : 'S,M,L,XL');
        setNewProductDescription('');
        setUploadedImageBase64('');
        setImageSourceType('preset');
        setShowAddProduct(false);
      } else {
        setActionError(data.error || 'Error al crear producto');
      }
    } catch (err) {
      console.error(err);
      setActionError('Error de conexión al servidor');
    }
  };

  // 4. Eliminar producto
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar producto');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

  // 5. Actualizar Número de Seguimiento
  const handleUpdateTracking = async (orderId: string) => {
    const val = tempTracking[orderId] ?? '';
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: val }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, trackingNumber: updated.trackingNumber } : o));
        alert('Número de seguimiento actualizado correctamente');
      } else {
        const data = await res.json();
        alert(data.error || 'Error al actualizar el seguimiento');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    }
  };

  // 6. Actualizar Nota al Cliente
  const handleUpdateNotes = async (orderId: string) => {
    const val = tempNotes[orderId] ?? '';
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: val }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, adminNotes: updated.adminNotes } : o));
        alert('Nota de la tienda al cliente guardada correctamente');
      } else {
        const data = await res.json();
        alert(data.error || 'Error al guardar la nota');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    }
  };

  // Estadísticas avanzadas del panel de ventas
  const avgOrderValue = stats.totalOrdersCount > 0 ? stats.totalRevenue / stats.totalOrdersCount : 0;
  
  // Ventas por categoría
  const salesByProduct = orders.filter(o => o.status !== 'cancelled').reduce((acc, order) => {
    order.items.forEach(item => {
      const category = item.product.category === 'camisas' ? 'Camisas/Guayaberas' : 'Gorras';
      acc[category] = (acc[category] || 0) + (item.price * item.quantity);
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="font-sans text-black dark:text-white space-y-12 transition-colors duration-300">
      
      {/* Welcome & Title */}
      <div className="border-b border-neutral-200 dark:border-neutral-900 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500 mb-2">
            Panel de Administración
          </p>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight">
            Control de Tienda
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-450 font-mono mt-1">
            Administrador activo: {adminName}
          </p>
        </div>
      </div>

      {/* Stats Cards Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
        {/* Total revenue */}
        <div className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-6 flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500">Ingresos Totales</p>
            <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Total orders */}
        <div className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-6 flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500">Pedidos Totales</p>
            <p className="text-2xl font-bold">{stats.totalOrdersCount}</p>
          </div>
          <div className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded">
            <FileText size={20} />
          </div>
        </div>

        {/* Active Products count */}
        <div className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-6 flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500">Productos Activos</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded">
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Out of Stock count */}
        <div className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-6 flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500">Agotados / Sin Stock</p>
            <p className={`text-2xl font-bold ${stats.outOfStockCount > 0 ? 'text-yellow-600 dark:text-yellow-500' : ''}`}>
              {stats.outOfStockCount}
            </p>
          </div>
          <div className={`p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded ${stats.outOfStockCount > 0 ? 'text-yellow-600 dark:text-yellow-500' : ''}`}>
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Tabs Selector Navigation */}
      <div className="flex gap-4 border-b border-neutral-200 dark:border-neutral-900 pb-1 font-mono text-xs uppercase tracking-wider overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 px-2 border-b-2 font-bold cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'orders' ? 'border-black text-black dark:border-white dark:text-white' : 'border-transparent text-neutral-450 dark:text-neutral-550 hover:text-black dark:hover:text-neutral-300'
          }`}
        >
          Pedidos ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-4 px-2 border-b-2 font-bold cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'products' ? 'border-black text-black dark:border-white dark:text-white' : 'border-transparent text-neutral-450 dark:text-neutral-550 hover:text-black dark:hover:text-neutral-300'
          }`}
        >
          Catálogo ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-4 px-2 border-b-2 font-bold cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'sales' ? 'border-black text-black dark:border-white dark:text-white' : 'border-transparent text-neutral-450 dark:text-neutral-550 hover:text-black dark:hover:text-neutral-300'
          }`}
        >
          Métricas de Ventas & ROI
        </button>
        <button
          onClick={() => setActiveTab('ai-roi')}
          className={`pb-4 px-2 border-b-2 font-bold cursor-pointer whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'ai-roi' ? 'border-black text-black dark:border-white dark:text-white' : 'border-transparent text-neutral-450 dark:text-neutral-550 hover:text-black dark:hover:text-neutral-300'
          }`}
        >
          <Brain size={13} />
          ROI de la IA en 2026
        </button>
      </div>

      {/* Tab Contents: Orders (Pedidos) */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/20 rounded">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-900 font-mono text-[10px] uppercase tracking-widest text-neutral-550 dark:text-neutral-500">
                <tr>
                  <th className="p-4">Pedido ID</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Dirección</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Total</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-right">Detalles / Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-900/40">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-550 font-serif italic">
                      No se han registrado pedidos en la tienda aún.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const isExpanded = !!expandedOrders[order.id];
                    return (
                      <React.Fragment key={order.id}>
                        <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20 transition-colors">
                          <td className="p-4 font-mono text-xs text-neutral-600 dark:text-neutral-300 font-semibold">{order.id}</td>
                          <td className="p-4">
                            <div className="font-semibold">{order.customerName}</div>
                            <div className="text-xs text-neutral-500 font-mono">{order.customerEmail}</div>
                          </td>
                          <td className="p-4 max-w-xs truncate text-neutral-600 dark:text-neutral-400 text-xs" title={order.shippingAddress}>
                            {order.shippingAddress}
                          </td>
                          <td className="p-4 font-mono text-xs text-neutral-500 dark:text-neutral-450">
                            {new Date(order.createdAt).toLocaleDateString('es-VE')}
                          </td>
                          <td className="p-4 font-mono font-bold text-black dark:text-white">${order.total.toFixed(2)}</td>
                          <td className="p-4 text-center">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className={`text-xs font-mono border rounded px-2.5 py-1.5 focus:outline-none uppercase bg-white dark:bg-black text-black dark:text-white ${
                                order.status === 'paid' 
                                  ? 'border-green-600 dark:border-green-900 text-green-650 dark:text-green-500' 
                                  : order.status === 'shipped' 
                                    ? 'border-blue-600 dark:border-blue-900 text-blue-650 dark:text-blue-400' 
                                    : order.status === 'completed'
                                      ? 'border-neutral-400 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300'
                                      : order.status === 'cancelled'
                                        ? 'border-red-600 dark:border-red-900 text-red-650 dark:text-red-400'
                                        : 'border-yellow-600 dark:border-yellow-900 text-yellow-650 dark:text-yellow-500'
                              }`}
                            >
                              <option value="pending">Pendiente</option>
                              <option value="paid">Pagado</option>
                              <option value="shipped">Enviado</option>
                              <option value="completed">Entregado</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => toggleOrderDetails(order.id)}
                              className="p-1 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-850 hover:text-black dark:hover:text-white transition-colors cursor-pointer text-xs font-mono uppercase px-2 py-1 flex items-center gap-1.5 ml-auto text-neutral-500 dark:text-neutral-400"
                            >
                              Gestionar
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded details row */}
                        {isExpanded && (
                          <tr className="bg-white dark:bg-neutral-950/40">
                            <td colSpan={7} className="p-6 border-t border-b border-neutral-200 dark:border-neutral-900">
                              <div className="space-y-6">
                                {/* Product Items list */}
                                <div className="space-y-4 max-w-3xl">
                                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold">
                                    Artículos en el pedido
                                  </h4>
                                  <div className="space-y-3">
                                    {order.items.map((item) => (
                                      <div key={item.id} className="flex justify-between items-center text-xs font-mono">
                                        <div className="flex items-center gap-3">
                                          <div className="h-10 w-9 overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850">
                                            <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                                          </div>
                                          <div>
                                            <p className="font-bold text-neutral-800 dark:text-neutral-200">{item.product.name}</p>
                                            <p className="text-[10px] text-neutral-500">Talla: {item.size} • Cantidad: {item.quantity}</p>
                                          </div>
                                        </div>
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                          {item.quantity} x ${item.price.toFixed(2)} = ${(item.price * item.quantity).toFixed(2)} USD
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-900/60 flex justify-between items-center text-xs font-mono">
                                    <span className="text-neutral-550">ID Stripe / Sesión: {order.stripeSessionId || 'Sin Registro'}</span>
                                    <span className="font-bold text-black dark:text-white text-sm">Total: ${order.total.toFixed(2)} USD</span>
                                  </div>
                                </div>

                                {/* Order notes and shipment management */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-200 dark:border-neutral-900/60 text-xs font-mono">
                                  {/* Update Shipment tracking */}
                                  <div className="space-y-3">
                                    <h5 className="font-bold text-neutral-600 dark:text-neutral-350 uppercase tracking-wide">Gestión de Envío</h5>
                                    <div className="space-y-1.5">
                                      <label className="block text-neutral-500">Número de Seguimiento</label>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={tempTracking[order.id] ?? order.trackingNumber ?? ''}
                                          onChange={(e) => setTempTracking(prev => ({ ...prev, [order.id]: e.target.value }))}
                                          placeholder="ej: DHL-983648"
                                          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-3 py-2 focus:outline-none rounded w-full text-black dark:text-white"
                                        />
                                        <button
                                          onClick={() => handleUpdateTracking(order.id)}
                                          className="bg-black text-white dark:bg-white dark:text-black font-bold px-4 py-2 uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors rounded cursor-pointer border border-neutral-200 dark:border-transparent"
                                        >
                                          Guardar
                                        </button>
                                      </div>
                                      <p className="text-[10px] text-neutral-500 leading-normal">
                                        El cliente verá este número en tiempo real en su panel para rastrear su paquete.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Update Order notes */}
                                  <div className="space-y-3">
                                    <h5 className="font-bold text-neutral-600 dark:text-neutral-350 uppercase tracking-wide">Notas del Pedido al Cliente</h5>
                                    <div className="space-y-1.5">
                                      <label className="block text-neutral-500">Mensaje / Nota para el Cliente</label>
                                      <div className="flex gap-2">
                                        <textarea
                                          value={tempNotes[order.id] ?? order.adminNotes ?? ''}
                                          onChange={(e) => setTempNotes(prev => ({ ...prev, [order.id]: e.target.value }))}
                                          placeholder="ej: Su pedido ha sido empaquetado y saldrá a primera hora..."
                                          rows={2}
                                          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-3 py-2 focus:outline-none rounded w-full text-black dark:text-white resize-none font-sans"
                                        />
                                        <button
                                          onClick={() => handleUpdateNotes(order.id)}
                                          className="bg-black text-white dark:bg-white dark:text-black font-bold px-4 py-2 uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors rounded cursor-pointer self-end border border-neutral-200 dark:border-transparent"
                                        >
                                          Guardar
                                        </button>
                                      </div>
                                      <p className="text-[10px] text-neutral-500 leading-normal">
                                        Escribe detalles sobre la entrega, agradecimientos o notas de personalización.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Contents: Products (Productos) */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          
          {/* Header Action */}
          <div className="flex justify-between items-center">
            <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-semibold">
              Productos Disponibles
            </h3>
            <button
              onClick={() => setShowAddProduct(!showAddProduct)}
              className="flex items-center gap-1.5 bg-black text-white dark:bg-white dark:text-black text-xs font-mono uppercase tracking-widest font-bold px-4 py-2.5 hover:bg-neutral-850 dark:hover:bg-neutral-200 transition-all cursor-pointer border border-neutral-200 dark:border-transparent"
            >
              <Plus size={14} />
              Agregar Producto
            </button>
          </div>

          {/* Add Product Panel Form */}
          {showAddProduct && (
            <div className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-6 sm:p-8 space-y-6 max-w-2xl rounded">
              <h3 className="text-sm font-mono uppercase tracking-widest font-semibold border-b border-neutral-200 dark:border-neutral-900 pb-3">
                Nuevo Producto
              </h3>
              
              <form onSubmit={handleAddProductSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                
                <div className="sm:col-span-2">
                  <label className="block text-neutral-500 mb-1">Nombre del Producto</label>
                  <input 
                    type="text" 
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="ej: Franela Minimalista Avila"
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-3 py-2 text-sm text-black dark:text-white focus:outline-none transition-colors rounded"
                  />
                </div>

                <div>
                  <label className="block text-neutral-500 mb-1">Categoría</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => {
                      setNewProductCategory(e.target.value);
                      setNewProductSizes(e.target.value === 'gorras' ? 'Ajustable' : 'S,M,L,XL');
                    }}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-3 py-2 text-sm text-black dark:text-white focus:outline-none transition-colors uppercase rounded"
                  >
                    <option value="camisas">Franelas / Camisas</option>
                    <option value="gorras">Gorras</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-500 mb-1">Precio ($ USD)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="35.00"
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-3 py-2 text-sm text-black dark:text-white focus:outline-none transition-colors rounded"
                  />
                </div>

                <div>
                  <label className="block text-neutral-500 mb-1">Stock Inicial</label>
                  <input 
                    type="number" 
                    min="0"
                    required
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    placeholder="10"
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-3 py-2 text-sm text-black dark:text-white focus:outline-none transition-colors rounded"
                  />
                </div>

                <div>
                  <label className="block text-neutral-500 mb-1">Tallas (separadas por comas)</label>
                  <input 
                    type="text" 
                    required
                    value={newProductSizes}
                    onChange={(e) => setNewProductSizes(e.target.value)}
                    placeholder="ej: S,M,L,XL"
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-3 py-2 text-sm text-black dark:text-white focus:outline-none transition-colors rounded"
                  />
                </div>

                <div className="sm:col-span-2 space-y-3">
                  <label className="block text-neutral-500 mb-1">Imagen del Producto</label>
                  
                  {/* Selector de tipo de imagen */}
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                      <input 
                        type="radio" 
                        name="imageSourceType" 
                        checked={imageSourceType === 'preset'}
                        onChange={() => setImageSourceType('preset')}
                        className="accent-black dark:accent-white"
                      />
                      Imágenes por Defecto
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                      <input 
                        type="radio" 
                        name="imageSourceType" 
                        checked={imageSourceType === 'upload'}
                        onChange={() => setImageSourceType('upload')}
                        className="accent-black dark:accent-white"
                      />
                      Subir Foto Personalizada
                    </label>
                  </div>

                  {imageSourceType === 'preset' ? (
                    <select
                      value={newProductImage}
                      onChange={(e) => setNewProductImage(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-3 py-2 text-sm text-black dark:text-white focus:outline-none transition-colors rounded"
                    >
                      <option value="/products/veneco_black_shirt.png">Franela Negra Veneco (Generada)</option>
                      <option value="/products/veneco_white_shirt.png">Franela Blanca Veneco (Generada)</option>
                      <option value="/products/veneco_black_cap.png">Gorra Negra Veneco (Generada)</option>
                      <option value="/products/veneco_white_cap.png">Gorra Blanca Veneco (Generada)</option>
                      <option value="/products/veneco_guayabera.png">Guayabera "La Custodia" (Generada)</option>
                    </select>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white rounded cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-900/10">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Plus className="w-8 h-8 text-neutral-400 mb-1" />
                            <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider">
                              Haz clic para seleccionar imagen
                            </p>
                            <p className="text-[10px] text-neutral-400 font-mono mt-1">
                              PNG, JPG o WEBP
                            </p>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setUploadedImageBase64(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                      
                      {uploadedImageBase64 && (
                        <div className="flex items-center gap-4 p-3 border border-neutral-200 dark:border-neutral-850 rounded">
                          <div className="h-16 w-14 overflow-hidden border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900 flex-shrink-0">
                            <img src={uploadedImageBase64} alt="Vista previa" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-[10px] uppercase text-green-650 dark:text-green-500 font-mono">✓ Imagen cargada correctamente</p>
                            <button
                              type="button"
                              onClick={() => setUploadedImageBase64('')}
                              className="text-[10px] font-mono text-red-500 hover:underline uppercase mt-1"
                            >
                              Eliminar foto
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-neutral-500 mb-1">Descripción</label>
                  <textarea 
                    required
                    rows={3}
                    value={newProductDescription}
                    onChange={(e) => setNewProductDescription(e.target.value)}
                    placeholder="Escribe la descripción de la prenda..."
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-3 py-2 text-sm text-black dark:text-white focus:outline-none transition-colors resize-none rounded"
                  />
                </div>

                {actionError && (
                  <p className="sm:col-span-2 text-red-500 font-mono text-xs">{actionError}</p>
                )}

                <div className="sm:col-span-2 flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="border border-neutral-350 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white px-4 py-2 hover:border-black dark:hover:border-neutral-500 uppercase cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-black text-white dark:bg-white dark:text-black font-bold px-6 py-2 hover:bg-neutral-850 dark:hover:bg-neutral-200 uppercase cursor-pointer"
                  >
                    Crear Producto
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* Products Table */}
          <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/20 rounded">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-900 font-mono text-[10px] uppercase tracking-widest text-neutral-550 dark:text-neutral-500">
                <tr>
                  <th className="p-4">Miniatura</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Tallas</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4 text-center">Stock</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-900/40">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-550 font-serif italic">
                      No hay productos registrados en el catálogo.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20 transition-colors">
                      
                      {/* Image Thumbnail */}
                      <td className="p-4">
                        <div className="h-12 w-10 overflow-hidden border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900">
                          <img src={product.image} alt="" className="h-full w-full object-cover" />
                        </div>
                      </td>

                      {/* Name */}
                      <td className="p-4 font-semibold text-neutral-800 dark:text-neutral-200">{product.name}</td>
                      
                      {/* Category */}
                      <td className="p-4 font-mono text-xs uppercase text-neutral-550 dark:text-neutral-450">{product.category}</td>
                      
                      {/* Sizes */}
                      <td className="p-4 font-mono text-xs text-neutral-605 dark:text-neutral-400">{product.sizes}</td>
                      
                      {/* Price */}
                      <td className="p-4 font-mono font-semibold text-black dark:text-white">${product.price.toFixed(2)}</td>
                      
                      {/* Stock input editor */}
                      <td className="p-4 text-center">
                        <input
                          type="number"
                          min="0"
                          value={product.stock}
                          onChange={(e) => handleUpdateStock(product.id, e.target.value)}
                          className="w-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-2 py-1 text-xs text-center focus:outline-none font-mono rounded text-black dark:text-white"
                        />
                        {product.stock === 0 && (
                          <span className="block text-[8px] font-mono text-red-500 uppercase tracking-wider font-bold mt-1">
                            Agotado
                          </span>
                        )}
                      </td>

                      {/* Delete Action */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-400 hover:text-red-500 dark:text-neutral-550 border border-neutral-200 dark:border-neutral-850 hover:border-red-950/80 rounded transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Contents: Sales Metrics (Métricas de Ventas) */}
      {activeTab === 'sales' && (
        <div className="space-y-8 animate-fade-in">
          <div className="border-b border-neutral-200 dark:border-neutral-900 pb-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-semibold">
              Rendimiento Financiero & Estadísticas
            </h3>
          </div>

          {/* Sales KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
            {/* Avg order value */}
            <div className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-6 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">Ticket Promedio de Venta</span>
              <p className="text-3xl font-black text-black dark:text-white">${avgOrderValue.toFixed(2)} USD</p>
              <p className="text-[10px] text-neutral-400">Calculado sobre pedidos completados y pagados</p>
            </div>

            {/* AI conversion lift */}
            <div className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-6 space-y-2 border-l-4 border-l-black dark:border-l-white">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Brain size={12} className="text-black dark:text-white" />
                  AI Conversion Lift
                </span>
                <span className="text-[9px] font-bold text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-950/20 px-1.5 py-0.5 rounded font-mono">ACTIVO</span>
              </div>
              <p className="text-3xl font-black text-green-600 dark:text-green-500">+12.4%</p>
              <p className="text-[10px] text-neutral-400">Atribuido a motores de recomendación y checkout agéntico</p>
            </div>

            {/* AI Cost-to-Value Index */}
            <div className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-6 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">Índice ROI de la IA</span>
              <p className="text-3xl font-black text-black dark:text-white">4.8x</p>
              <p className="text-[10px] text-neutral-400">Relación de ganancia neta vs. coste operativo de tokens</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales by Category chart simulation */}
            <div className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-6 space-y-6 font-mono">
              <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-900 pb-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-2">
                  <BarChart2 size={14} /> Distribución de Ventas por Categoría
                </h4>
                <span className="text-[9px] text-neutral-400">Total Neto</span>
              </div>

              <div className="space-y-5 pt-2">
                {/* Camisas / Guayaberas */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Camisas & Guayaberas</span>
                    <span>${(salesByProduct['Camisas/Guayaberas'] || 0).toFixed(2)} USD</span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-black dark:bg-white h-full transition-all duration-500" 
                      style={{ 
                        width: stats.totalRevenue > 0 
                          ? `${((salesByProduct['Camisas/Guayaberas'] || 0) / stats.totalRevenue) * 100}%` 
                          : '0%' 
                      }} 
                    />
                  </div>
                  <p className="text-[9px] text-neutral-400 text-right">
                    {stats.totalRevenue > 0 ? (((salesByProduct['Camisas/Guayaberas'] || 0) / stats.totalRevenue) * 100).toFixed(1) : 0}% de los ingresos
                  </p>
                </div>

                {/* Gorras */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Gorras Snapback</span>
                    <span>${(salesByProduct['Gorras'] || 0).toFixed(2)} USD</span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-neutral-450 dark:bg-neutral-500 h-full transition-all duration-500" 
                      style={{ 
                        width: stats.totalRevenue > 0 
                          ? `${((salesByProduct['Gorras'] || 0) / stats.totalRevenue) * 100}%` 
                          : '0%' 
                      }} 
                    />
                  </div>
                  <p className="text-[9px] text-neutral-400 text-right">
                    {stats.totalRevenue > 0 ? (((salesByProduct['Gorras'] || 0) / stats.totalRevenue) * 100).toFixed(1) : 0}% de los ingresos
                  </p>
                </div>
              </div>
            </div>

            {/* AI ROI Performance indices list */}
            <div className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-6 space-y-6 font-mono">
              <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-900 pb-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-2">
                  <TrendingUp size={14} /> Índices Clave de IA (Impacto 2026)
                </h4>
                <ArrowUpRight size={14} className="text-green-600" />
              </div>

              <div className="divide-y divide-neutral-200 dark:divide-neutral-900/40 text-xs space-y-3 pt-2">
                <div className="flex justify-between pb-3">
                  <span className="text-neutral-500">Automatización de Soporte:</span>
                  <span className="font-bold text-green-600 dark:text-green-500">+82% de eficiencia ($350 ahorrados)</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-neutral-500">Optimización de Carrito:</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">-15% abandonos mediante IA</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-neutral-500">Recomendación Personalizada:</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">+22% de ticket promedio</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-neutral-500">Ahorro en Operaciones:</span>
                  <span className="font-bold text-green-600 dark:text-green-500">12 hrs de trabajo admin/mes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Contents: AI ROI Article (Artículo ROI IA) */}
      {activeTab === 'ai-roi' && (
        <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 p-8 sm:p-12 space-y-8 font-sans leading-relaxed transition-colors duration-300">
          
          {/* Article Header */}
          <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-900 pb-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-bold bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 rounded inline-block">
              Informe Especial & Guía Práctica 2026
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
              Cómo maximizar el ROI de la IA en 2026
            </h1>
            <div className="flex justify-between items-center text-xs font-mono text-neutral-500 pt-2">
              <p>Por: <span className="font-bold text-black dark:text-white">Ivan Belcic, Cole Stryker</span></p>
              <p>Publicación: Think / IBM & MIT Reports</p>
            </div>
          </div>

          {/* Intro quote */}
          <div className="border-l-4 border-black dark:border-l-white pl-4 font-serif italic text-lg text-neutral-700 dark:text-neutral-350">
            "Según un informe del MIT del verano de 2025, el 95 % de los pilotos de IA generativa están fracasando. Es una cifra que da que pensar, teniendo en cuenta los miles de millones de dólares que se han invertido. Las apuestas son astronómicamente altas."
          </div>

          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Entonces, ¿por qué la mayoría de las empresas tienen dificultades para obtener beneficios de las soluciones de IA? ¿Y cómo pueden reducir el bombo publicitario para alcanzar los objetivos empresariales en 2026?
          </p>

          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Resulta que tener capacidades tecnológicas de IA no es suficiente. Algunos líderes empresariales se sumaron a la IA por miedo a quedarse fuera (FOMO) y con una visión a corto plazo para mantenerse por delante de sus competidores. Otros imaginaron que la IA empresarial era la estrategia comercial definitiva para todo. Lograr un ROI positivo en una transformación de la IA requiere un enfoque más reflexivo.
          </p>

          {/* Promotional Banner Callout */}
          <div className="border border-neutral-200 dark:border-neutral-900 p-6 flex flex-col md:flex-row justify-between items-center gap-6 bg-neutral-50 dark:bg-neutral-900/30 rounded">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 font-bold">RECURSO DISPONIBLE</span>
              <h4 className="text-sm font-bold uppercase tracking-tight">Comience a obtener ROI: una guía práctica para la IA agéntica</h4>
              <p className="text-xs text-neutral-500 max-w-lg">Descubra formas de avanzar y ampliar con éxito la IA en su empresa con resultados reales.</p>
            </div>
            <button className="whitespace-nowrap font-mono text-[10px] uppercase font-bold bg-black text-white dark:bg-white dark:text-black px-4 py-2.5 tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors border border-transparent rounded cursor-pointer">
              Lea el ebook
            </button>
          </div>

          {/* Section: Por qué es difícil */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight border-b border-neutral-100 dark:border-neutral-900 pb-2 flex items-center gap-2">
              <span className="font-mono text-sm text-neutral-400">01 /</span> Por qué es difícil obtener el ROI de la IA
            </h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Desde que estalló el auge de la IA generativa a finales de 2022, las organizaciones se han apresurado a implementar iniciativas de IA. Los líderes empresariales han estado buscando estrategias de IA escalables que optimicen las operaciones, faciliten la toma de decisiones basada en datos, reduzcan los costes y aceleren el desarrollo de productos. Pero la recompensa económica por tales soluciones sigue siendo esquiva. He aquí por qué:
            </p>

            <ul className="space-y-4 text-sm text-neutral-700 dark:text-neutral-300 pl-4 list-disc marker:text-neutral-400">
              <li>
                <strong className="text-black dark:text-white">No es la tecnología, es la realidad organizativa:</strong> Según los debates del Think Circle de IBM, el principal reto no es tecnológico, sino organizativo. La cultura, el gobierno, el diseño de flujos de trabajo y la estrategia de datos son las principales limitaciones. Las ambiciones chocan con las realidades internas.
              </li>
              <li>
                <strong className="text-black dark:text-white">Es difícil de medir:</strong> Aunque muchos ejecutivos están invirtiendo, solo alrededor del 29 % afirman que pueden medir el ROI de la IA con confianza. Un 79 % ve aumentos de productividad, pero traducirla a impacto financiero a corto plazo sigue siendo sumamente complejo.
              </li>
              <li>
                <strong className="text-black dark:text-white">La inversión supera la madurez del ROI:</strong> Solo alrededor del 25 % de las iniciativas de IA ofrecen el ROI esperado, y apenas el 16 % se han ampliado a toda la empresa. Los CEO equilibran la presión a corto plazo con la visión estratégica de innovación a largo plazo.
              </li>
              <li>
                <strong className="text-black dark:text-white">Depende de la integración en los flujos principales:</strong> Los proyectos piloto puntuales o aislados no generarán un retorno significativo. El valor real está en una integración más profunda en los flujos de trabajo principales de toda la organización.
              </li>
              <li>
                <strong className="text-black dark:text-white">La deuda técnica heredada:</strong> El pago de la deuda técnica de los sistemas heredados puede mejorar el ROI de la IA hasta en un 29 % porque reduce la fricción operativa y evita repetición de trabajo en la integración digital.
              </li>
            </ul>
          </div>

          {/* Section: Medición del ROI */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight border-b border-neutral-100 dark:border-neutral-900 pb-2 flex items-center gap-2">
              <span className="font-mono text-sm text-neutral-400">02 /</span> Medición del ROI de la IA
            </h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Los cálculos del ROI pueden ser difíciles porque muchos de los impactos beneficiosos de la IA son abstractos, indirectos y no se materializan de inmediato. Por ejemplo, optimizar el análisis de datos para tomar mejores decisiones estratégicas puede demorar años en reflejar su impacto neto. 
            </p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              El ROI en tiempo real suele ser difícil de detectar y los beneficios inmediatos pueden ser engañosos (como recortes rápidos que afectan a largo plazo la satisfacción del cliente o la moral del equipo).
            </p>

            {/* Table: Tangible vs Intangible ROI */}
            <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-900 rounded my-6">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-900">
                  <tr>
                    <th className="p-3 uppercase">Tipo de ROI</th>
                    <th className="p-3 uppercase">Definición</th>
                    <th className="p-3 uppercase">Ejemplos Prácticos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-900">
                  <tr>
                    <td className="p-3 font-bold">ROI Duro (Tangible)</td>
                    <td className="p-3">Efectos financieros directamente medibles y vinculados a la rentabilidad.</td>
                    <td className="p-3">Ahorro en horas laborales, automatización de sistemas IT, aumento de tasas de conversión web.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">ROI Blando (Intangible)</td>
                    <td className="p-3">Beneficios abstractos que mejoran la salud organizativa y competitiva.</td>
                    <td className="p-3">Aumento de la moral del personal, mayor satisfacción del cliente, adopción ética de la tecnología.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Métricas clave */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight border-b border-neutral-100 dark:border-neutral-900 pb-2 flex items-center gap-2">
              <span className="font-mono text-sm text-neutral-400">03 /</span> Métricas clave para el ROI de la IA
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="border border-neutral-200 dark:border-neutral-900 p-5 rounded space-y-3 bg-neutral-50/40 dark:bg-neutral-950/40">
                <h4 className="font-mono text-[11px] uppercase tracking-wider font-bold text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-900 pb-1.5">
                  KPIs Duros (Tangibles)
                </h4>
                <ul className="list-disc pl-4 text-xs space-y-2 text-neutral-700 dark:text-neutral-350 leading-relaxed">
                  <li><strong>Reducción de costes laborales:</strong> Ahorro en horas de operación humana gracias a automatizaciones inteligentes.</li>
                  <li><strong>Eficiencia de recursos:</strong> Menor consumo de infraestructura y optimización del flujo logístico.</li>
                  <li><strong>Conversiones mejoradas:</strong> Incremento en ventas y tráfico derivado de motores de recomendación personalizados.</li>
                </ul>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-900 p-5 rounded space-y-3 bg-neutral-50/40 dark:bg-neutral-950/40">
                <h4 className="font-mono text-[11px] uppercase tracking-wider font-bold text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-900 pb-1.5">
                  KPIs Blandos (Intangibles)
                </h4>
                <ul className="list-disc pl-4 text-xs space-y-2 text-neutral-700 dark:text-neutral-350 leading-relaxed">
                  <li><strong>Satisfacción del empleado:</strong> Disminución del estrés operativo al delegar tareas monótonas a asistentes.</li>
                  <li><strong>Precisión de decisión:</strong> Velocidad y solidez en la toma de decisiones basada en reportes de IA.</li>
                  <li><strong>Fidelización de usuarios:</strong> Reducción de la tasa de cancelación (Churn Rate) por una mejor atención al usuario.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section: Estrategias para optimizar */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight border-b border-neutral-100 dark:border-neutral-900 pb-2 flex items-center gap-2">
              <span className="font-mono text-sm text-neutral-400">04 /</span> Estrategias para optimizar el ROI de la IA
            </h2>
            
            <h3 className="font-mono text-xs uppercase font-bold text-neutral-600 dark:text-neutral-450 pt-2">
              A. Desarrollo de Productos (55% de ROI Promedio)
            </h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Los equipos altamente exitosos que logran retornos notables implementan las siguientes 4 prácticas iterativas:
            </p>
            <ul className="list-decimal pl-5 text-sm space-y-2 text-neutral-700 dark:text-neutral-300">
              <li><strong>Celebrar el feedback:</strong> Fomentar una cultura donde el feedback constante guíe la optimización en curso.</li>
              <li><strong>Trabajar de forma iterativa:</strong> Desplegar la IA por etapas para mitigar riesgos y aprender paso a paso.</li>
              <li><strong>Aprender de datos de usuarios:</strong> Recolectar datos de alta calidad para ajustar el rumbo de la tecnología.</li>
              <li><strong>Crear equipos multidisciplinarios:</strong> Evitar silos aislando ingenieros; colaborar con negocio y diseño.</li>
            </ul>

            <h3 className="font-mono text-xs uppercase font-bold text-neutral-600 dark:text-neutral-450 pt-4">
              B. Cadena de Suministro de Contenidos (CSC)
            </h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Las empresas obtienen hasta un 30% más de ROI integrando IA generativa con estas pautas:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-2 text-neutral-700 dark:text-neutral-300">
              <li><strong>Perspectiva holística global:</strong> Evaluar cómo afecta el cambio a todos los departamentos interconectados.</li>
              <li><strong>Gestión proactiva del cambio:</strong> Promover el entusiasmo de los empleados reduciendo la resistencia cultural.</li>
              <li><strong>Mitigación activa de riesgos:</strong> Poner salvaguardas técnicas para liberar la creatividad libre de errores graves.</li>
            </ul>
          </div>

          {/* Section: Pensar más allá */}
          <div className="space-y-4 pb-8">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight border-b border-neutral-100 dark:border-neutral-900 pb-2 flex items-center gap-2">
              <span className="font-mono text-sm text-neutral-400">05 /</span> Pensar más allá del ROI
            </h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              El CEO de Nvidia, Jensen Huang, sugirió considerar esta etapa temprana como de "experimentación desordenada". Comparar la exigencia inmediata de un ROI tangible para proyectos de IA en fase inicial con pedirle a un niño un plan de negocios formal para su hobby puede sofocar la verdadera innovación.
            </p>
            <blockquote className="border-l-2 border-neutral-300 dark:border-neutral-700 pl-4 py-1 text-sm italic text-neutral-600 dark:text-neutral-400">
              “Cuando sus hijos le digan que quieren probar algo, debe decirles que sí. En casa nunca nos hacemos preguntas como ¿Cuál es el retorno de la inversión aquí?”
            </blockquote>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Huang aconseja desarrollar capacidades de infraestructura propias en lugar de externalizar todo. Fomentar que "florezcan mil flores" y priorizar el aprendizaje práctico e iterativo colocará a la empresa en posición de liderar en la era de los agentes autónomos de 2026.
            </p>
          </div>

          {/* Ebook footer promo */}
          <div className="pt-8 border-t border-neutral-200 dark:border-neutral-900 flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-neutral-500 gap-4">
            <p>AI Academy Episode: Driving ROI with genAI</p>
            <a href="#academy" className="text-black dark:text-white font-bold hover:underline flex items-center gap-1">
              Ver episodio de la Academia <ArrowUpRight size={12} />
            </a>
          </div>

        </div>
      )}

    </div>
  );
}
