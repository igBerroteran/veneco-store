'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, Loader } from 'lucide-react';

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm('¿Estás seguro de que deseas cancelar este pedido pendiente?')) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al cancelar el pedido.');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isLoading}
      className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono border border-red-200 dark:border-red-900/60 text-red-650 hover:text-red-500 dark:text-red-400 dark:hover:text-red-350 hover:border-red-500 transition-colors uppercase cursor-pointer rounded disabled:opacity-50"
      title="Cancelar este pedido"
    >
      {isLoading ? (
        <>
          <Loader className="animate-spin" size={10} />
          Procesando
        </>
      ) : (
        <>
          <XCircle size={10} />
          Cancelar
        </>
      )}
    </button>
  );
}
