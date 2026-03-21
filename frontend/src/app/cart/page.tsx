'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const { token, user, mounted } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [ordered, setOrdered] = useState(false);

  // Redirect to login if not authenticated (after mount)
  useEffect(() => {
    if (mounted && !user) router.push('/login');
  }, [mounted, user, router]);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchCart = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
      headers: authHeader,
    })
      .then(r => r.json())
      .then(data => { setItems(data.items); setTotal(data.total); });
  };

  useEffect(() => {
    if (mounted && user) fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, user]);

  const removeItem = async (productId: number) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${productId}`, {
      method: 'DELETE',
      headers: authHeader,
    });
    fetchCart();
  };

  const placeOrder = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        customerName: user?.email ?? 'Guest',
        customerEmail: user?.email ?? 'guest@example.com',
      }),
    });
    setOrdered(true);
    setItems([]);
    setTotal(0);
  };

  // Show nothing while checking auth
  if (!mounted) return null;
  if (!user) return null;

  if (ordered) return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>✅ Order Placed!</h1>
      <p>Thanks for your order, {user.email}.</p>
      <button onClick={() => router.push('/')}
        style={{ padding: '0.5rem 1.5rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Continue Shopping
      </button>
    </main>
  );

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={() => router.back()} style={{ marginBottom: '1rem', cursor: 'pointer' }}>← Back</button>
      <h1>🛒 Your Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {items.map(item => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{item.name}</p>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Qty: {item.quantity} × ${item.price}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeItem(item.productId)}
                  style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button onClick={placeOrder}
            style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>
            Place Order
          </button>
        </>
      )}
    </main>
  );
}
