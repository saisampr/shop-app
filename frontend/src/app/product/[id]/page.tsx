'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`)
      .then(r => r.json())
      .then(setProduct);
  }, [id]);

  const addToCart = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ productId: Number(id), quantity: qty }),
    });
    setAdded(true);
  };

  if (!product) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={() => router.back()} style={{ marginBottom: '1rem', cursor: 'pointer' }}>← Back</button>
      <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: '8px' }} />
      <h1>{product.name}</h1>
      <p style={{ color: '#666' }}>{product.description}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${product.price}</p>
      <p style={{ color: product.stock > 0 ? 'green' : 'red' }}>
        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <input type="number" min={1} max={product.stock} value={qty}
          onChange={e => setQty(Number(e.target.value))}
          style={{ width: '60px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }} />
        <button onClick={addToCart} disabled={added || product.stock === 0}
          style={{ padding: '0.5rem 1.5rem', background: added || product.stock === 0 ? '#888' : '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {added ? '✅ Added!' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
      {added && (
        <button onClick={() => router.push('/cart')}
          style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Go to Cart →
        </button>
      )}
    </main>
  );
}
