'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
}

interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AddForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  image: string;
  category: string;
}

const CATEGORY_OPTIONS = [
  'Electronics',
  'Audio',
  'Gaming',
  'Office',
  'Mobile Accessories',
  'Networking',
  'Photography',
  'Smart Home',
  'Wearables',
  'Storage',
];

const CATEGORIES = ['All', ...CATEGORY_OPTIONS];
const LIMIT = 10;
const EMPTY_FORM: AddForm = { name: '', description: '', price: '', stock: '', image: '', category: 'Electronics' };

export default function HomePage() {
  const router = useRouter();
  const { token, user, isAdmin, mounted, logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Add product modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AddForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<AddForm>>({});
  const [submitting, setSubmitting] = useState(false);

  // Delete error
  const [deleteError, setDeleteError] = useState('');

  // Debounce search input by 500ms
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 500);
  };

  // Clear any pending debounce timer when the component unmounts
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Fetch products whenever page, category, or debounced search changes
  useEffect(() => {
    setLoading(true);
    setFetchError('');
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (category !== 'All') params.set('category', category);
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params}`)
      .then(r => r.json())
      .then((res: ProductsResponse) => {
        setProducts(res.data);
        setTotalPages(res.totalPages);
        setTotal(res.total);
        setLoading(false);
      })
      .catch(() => {
        setFetchError('Could not load products. Check that the backend is running.');
        setLoading(false);
      });
  }, [page, category, debouncedSearch]);

  const handleCategory = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    setDeleteError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok && res.status !== 204) {
        setDeleteError(`Failed to delete "${name}". It may be in an active cart or order.`);
        return;
      }
    } catch {
      setDeleteError(`Failed to delete "${name}". Check that the backend is running.`);
      return;
    }
    // Always re-fetch from the server so pagination reflects the true count
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (category !== 'All') params.set('category', category);
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params}`)
      .then(r => r.json())
      .then((res: ProductsResponse) => {
        // If deleting the last item on this page pushed us past the last page, step back one
        const safePage = page > res.totalPages && res.totalPages > 0 ? res.totalPages : page;
        if (safePage !== page) {
          setPage(safePage);
        } else {
          setProducts(res.data);
          setTotalPages(res.totalPages);
          setTotal(res.total);
          setLoading(false);
        }
      })
      .catch(() => {
        setFetchError('Could not reload products after deletion.');
        setLoading(false);
      });
  };

  // ── Add product form ──────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const errors: Partial<AddForm> = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.description.trim()) errors.description = 'Description is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      errors.price = 'Enter a positive price';
    if (form.stock === '' || isNaN(Number(form.stock)) || Number(form.stock) < 0 || !Number.isInteger(Number(form.stock)))
      errors.stock = 'Enter a non-negative whole number';
    if (!form.image.trim()) errors.image = 'Image URL is required';
    if (!form.category) errors.category = 'Select a category';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    let res: Response;
    try {
      res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          stock: Number(form.stock),
          image: form.image.trim(),
          category: form.category,
        }),
      });
    } catch {
      setSubmitting(false);
      setFetchError('Could not reach the server. Check that the backend is running.');
      return;
    }
    setSubmitting(false);
    if (!res.ok) {
      setFetchError('Failed to add product. The server rejected the request.');
      return;
    }
    setShowModal(false);
    setForm(EMPTY_FORM);
    setFormErrors({});
    // Jump to page 1 to see the new product
    setPage(1);
    setCategory('All');
    setSearch('');
    setDebouncedSearch('');
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  // ── Pagination helpers ────────────────────────────────────────────────────
  const getPageNumbers = (): number[] => {
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i);
    }
    return range;
  };
  const pageNums = getPageNumbers();

  const resultLabel = loading
    ? 'Loading…'
    : `${total} product${total !== 1 ? 's' : ''}${category !== 'All' ? ` in ${category}` : ''}${debouncedSearch ? ` matching "${debouncedSearch}"` : ''}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>🛍️ Shop</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              style={{ padding: '0.45rem 1rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
            >
              + Add Product
            </button>
          )}
          <Link href="/cart" style={{ fontSize: '1.2rem', textDecoration: 'none' }}>🛒 Cart</Link>
          {mounted && (
            user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#555' }}>{user.email}</span>
                <button
                  onClick={handleLogout}
                  style={{ padding: '0.4rem 0.8rem', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href="/login">
                  <button style={{ padding: '0.4rem 0.8rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button style={{ padding: '0.4rem 0.8rem', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Register
                  </button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '1rem', pointerEvents: 'none' }}>🔍</span>
        <input
          type="text"
          placeholder="Search by name or description…"
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 0.75rem 0.6rem 2.25rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '0.95rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {search && (
          <button
            onClick={() => { setSearch(''); setDebouncedSearch(''); setPage(1); }}
            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '1.1rem', lineHeight: 1 }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '999px',
              border: '1px solid',
              borderColor: category === cat ? '#0070f3' : '#ddd',
              background: category === cat ? '#0070f3' : '#fff',
              color: category === cat ? '#fff' : '#333',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: category === cat ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Result count + error banners */}
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>{resultLabel}</p>
      {fetchError && (
        <p style={{ color: '#c0392b', background: '#fdecea', padding: '0.6rem 0.9rem', borderRadius: '6px', fontSize: '0.88rem', marginBottom: '1rem' }}>
          {fetchError}
          <button onClick={() => setFetchError('')} style={{ marginLeft: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontWeight: 700 }}>✕</button>
        </p>
      )}
      {deleteError && (
        <p style={{ color: '#c0392b', background: '#fdecea', padding: '0.6rem 0.9rem', borderRadius: '6px', fontSize: '0.88rem', marginBottom: '1rem' }}>
          {deleteError}
          <button onClick={() => setDeleteError('')} style={{ marginLeft: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontWeight: 700 }}>✕</button>
        </p>
      )}

      {/* Product grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '160px', background: '#f0f0f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ padding: '1rem' }}>
                <div style={{ height: '0.75rem', background: '#f0f0f0', borderRadius: '4px', marginBottom: '0.5rem', width: '35%' }} />
                <div style={{ height: '1rem', background: '#f0f0f0', borderRadius: '4px', marginBottom: '0.5rem' }} />
                <div style={{ height: '0.8rem', background: '#f0f0f0', borderRadius: '4px', marginBottom: '0.5rem', width: '80%' }} />
                <div style={{ height: '1rem', background: '#f0f0f0', borderRadius: '4px', width: '30%', marginBottom: '0.8rem' }} />
                <div style={{ height: '2rem', background: '#f0f0f0', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#999' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#555' }}>No products found</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
            {debouncedSearch ? `No results for "${debouncedSearch}"` : 'Try a different category'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {products.map(p => (
            <div key={p.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {/* Delete button — admin only */}
              {isAdmin && (
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  title="Delete product"
                  style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    width: '1.75rem', height: '1.75rem',
                    background: 'rgba(255,255,255,0.9)', border: '1px solid #f5c6cb',
                    borderRadius: '50%', cursor: 'pointer', color: '#c0392b',
                    fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1, zIndex: 1,
                  }}
                >
                  🗑
                </button>
              )}

              <img src={p.image} alt={p.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0070f3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                  {p.category}
                </span>
                <h3 style={{ margin: '0 0 0.4rem', fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.3 }}>{p.name}</h3>
                <p style={{ margin: '0 0 0.6rem', color: '#666', fontSize: '0.82rem', lineHeight: 1.4, flex: 1 }}>{p.description}</p>
                <p style={{ margin: '0 0 0.8rem', fontWeight: 700, fontSize: '1.05rem' }}>${p.price.toFixed(2)}</p>
                <Link href={`/product/${p.id}`}>
                  <button style={{ width: '100%', padding: '0.5rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    View Product
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={navButtonStyle(page === 1)}>
            ← Previous
          </button>

          {pageNums[0] > 1 && (
            <>
              <button onClick={() => setPage(1)} style={pageButtonStyle(false)}>1</button>
              {pageNums[0] > 2 && <span style={{ color: '#999', padding: '0 0.2rem' }}>…</span>}
            </>
          )}

          {pageNums.map(n => (
            <button key={n} onClick={() => setPage(n)} style={pageButtonStyle(n === page)}>{n}</button>
          ))}

          {pageNums[pageNums.length - 1] < totalPages && (
            <>
              {pageNums[pageNums.length - 1] < totalPages - 1 && (
                <span style={{ color: '#999', padding: '0 0.2rem' }}>…</span>
              )}
              <button onClick={() => setPage(totalPages)} style={pageButtonStyle(false)}>{totalPages}</button>
            </>
          )}

          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={navButtonStyle(page === totalPages)}>
            Next →
          </button>
        </div>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}
        >
          <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Add Product</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#666', lineHeight: 1 }}>✕</button>
            </div>

            <form onSubmit={handleAddSubmit} noValidate>
              {(
                [
                  { key: 'name', label: 'Name', type: 'text', placeholder: 'e.g. Wireless Headphones' },
                  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief product description' },
                  { key: 'price', label: 'Price ($)', type: 'number', placeholder: '0.00' },
                  { key: 'stock', label: 'Stock', type: 'number', placeholder: '0' },
                  { key: 'image', label: 'Image URL', type: 'url', placeholder: 'https://…' },
                ] as const
              ).map(({ key, label, type, placeholder }) => (
                <div key={key} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>{label}</label>
                  {type === 'textarea' ? (
                    <textarea
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      rows={2}
                      style={{ ...inputStyle, resize: 'vertical', borderColor: formErrors[key] ? '#e74c3c' : '#ddd' }}
                    />
                  ) : (
                    <input
                      type={type}
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      step={key === 'price' ? '0.01' : '1'}
                      min={key === 'stock' ? '0' : key === 'price' ? '0.01' : undefined}
                      style={{ ...inputStyle, borderColor: formErrors[key] ? '#e74c3c' : '#ddd' }}
                    />
                  )}
                  {formErrors[key] && <p style={{ color: '#e74c3c', fontSize: '0.78rem', margin: '0.2rem 0 0' }}>{formErrors[key]}</p>}
                </div>
              ))}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ ...inputStyle, borderColor: formErrors.category ? '#e74c3c' : '#ddd' }}
                >
                  {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {formErrors.category && <p style={{ color: '#e74c3c', fontSize: '0.78rem', margin: '0.2rem 0 0' }}>{formErrors.category}</p>}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '6px', background: submitting ? '#888' : '#28a745', color: '#fff', cursor: submitting ? 'default' : 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                  {submitting ? 'Adding…' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.65rem',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  fontFamily: 'sans-serif',
};

function pageButtonStyle(active: boolean): React.CSSProperties {
  return {
    minWidth: '2.2rem',
    padding: '0.45rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid',
    borderColor: active ? '#0070f3' : '#ddd',
    background: active ? '#0070f3' : '#fff',
    color: active ? '#fff' : '#333',
    cursor: active ? 'default' : 'pointer',
    fontWeight: active ? 600 : 400,
    fontSize: '0.9rem',
  };
}

function navButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '0.45rem 0.9rem',
    borderRadius: '6px',
    border: '1px solid #ddd',
    background: disabled ? '#f5f5f5' : '#fff',
    color: disabled ? '#bbb' : '#333',
    cursor: disabled ? 'default' : 'pointer',
    fontSize: '0.9rem',
  };
}
