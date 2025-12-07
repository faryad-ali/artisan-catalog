import React, { useState, useEffect } from 'react';
import { ShoppingBag, Mail, Plus, Trash2, Lock, User, Search, Menu, X, ChevronRight, Package, Loader2, Hammer } from 'lucide-react';
import { supabase } from './supabase';

export default function App() {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState('home'); 
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA FROM SUPABASE ---
  const fetchData = async () => {
    setLoading(true);
    
    // 1. Get Products (Sorted by newest first)
    const { data: productData, error: prodError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (prodError) {
      console.error('Error fetching products:', prodError.message);
    } else {
      setProducts(productData || []);
    }

    // 2. Get Inquiries
    const { data: inquiryData, error: inqError } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (inqError) {
      console.error('Error fetching inquiries:', inqError.message);
    } else {
      setInquiries(inquiryData || []);
    }

    setLoading(false);
  };

  // Run this once when the app starts
  useEffect(() => {
    fetchData();
  }, []);

  const navigate = (page) => setView(page);

  // --- DATABASE ACTIONS ---
  
  const addProduct = async (product) => {
    try {
      // Insert into 'products' table
      const { error } = await supabase
        .from('products')
        .insert([product]);
        
      if (error) throw error;
      
      alert("Product Added Successfully!");
      fetchData(); // Refresh the list
    } catch (e) {
      alert("Error adding product: " + e.message);
    }
  };

  const deleteProduct = async (id) => {
    if(window.confirm("Are you sure you want to delete this item?")) {
      // Delete from 'products' table where id matches
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Error deleting: " + error.message);
      } else {
        fetchData(); // Refresh the list
      }
    }
  };

  const addInquiry = async (inquiry) => {
    try {
      // Insert into 'inquiries' table
      const { error } = await supabase
        .from('inquiries')
        .insert([{ ...inquiry, status: 'New' }]);

      if (error) throw error;
      
      alert("Inquiry Sent! The artisan will contact you shortly.");
    } catch (e) {
      alert("Error sending inquiry: " + e.message);
    }
  };

  // --- RENDERER ---
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('home')}>
            <div className="bg-orange-600 text-white p-1.5 rounded">
              <Hammer size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">Dastkar<span className="text-orange-600">Digital</span></h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6 font-medium text-sm">
            <button onClick={() => navigate('home')} className={`hover:text-orange-600 ${view === 'home' ? 'text-orange-600' : ''}`}>Home</button>
            <button onClick={() => navigate('catalog')} className={`hover:text-orange-600 ${view === 'catalog' ? 'text-orange-600' : ''}`}>Catalog</button>
            <button onClick={() => navigate(isAdmin ? 'admin-dashboard' : 'admin-login')} className={`flex items-center gap-1 hover:text-orange-600 ${view.includes('admin') ? 'text-orange-600' : ''}`}>
              {isAdmin ? <User size={16} /> : <Lock size={16} />}
              {isAdmin ? 'Dashboard' : 'Admin'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Switcher */}
      <main className="min-h-[calc(100vh-80px)]">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin text-orange-600" size={48} />
          </div>
        ) : (
          <>
            {view === 'home' && <HomeView navigate={navigate} products={products} />}
            {view === 'catalog' && <CatalogView products={products} onSubmitInquiry={addInquiry} />}
            {view === 'admin-login' && <AdminLogin onLogin={() => { setIsAdmin(true); navigate('admin-dashboard'); }} />}
            {view === 'admin-dashboard' && <AdminDashboard
              products={products}
              inquiries={inquiries}
              onAddProduct={addProduct}
              onDeleteProduct={deleteProduct}
              // New: Pass the logout logic
              onLogout={() => {
                setIsAdmin(false);
                setView('home');
                alert("Logged out successfully")
              }}
            />}
          </>
        )}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function HomeView({ navigate, products }) {
  return (
    <div>
      <div className="bg-stone-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold serif">Handcrafted with Soul.</h1>
          <p className="text-lg text-stone-300 max-w-2xl mx-auto">
            Bridging the gap between local master artisans and the digital world. 
          </p>
          <button 
            onClick={() => navigate('catalog')}
            className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition flex items-center gap-2 mx-auto"
          >
            Browse Collection <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <div className="h-8 w-1 bg-orange-600 rounded-full"></div>
          Featured Items
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.length > 0 ? products.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} readOnly />
          )) : (
            <div className="col-span-full text-center py-10 bg-stone-100 rounded-lg">
              <p className="text-stone-500">No products yet. Go to Admin &gt; Dashboard to add some!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CatalogView({ products, onSubmitInquiry }) {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-stone-800">Our Catalog</h2>
        
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filter === cat 
                ? 'bg-stone-900 text-white' 
                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} onInquire={onSubmitInquiry} />
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 text-stone-500 bg-stone-50 rounded-xl">
          <p>No products found. Add some in the Admin Dashboard!</p>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onInquire, readOnly = false }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
        <div className="h-64 overflow-hidden bg-stone-100 relative">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {e.target.src = 'https://via.placeholder.com/400x300?text=Artisan+Item'}}
          />
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
            {product.category}
          </div>
        </div>
        <div className="p-5 flex-grow flex flex-col">
          <h3 className="font-bold text-lg mb-1 text-stone-900">{product.name}</h3>
          <p className="text-stone-500 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
            <span className="text-xl font-bold text-orange-700">Rs. {Number(product.price).toLocaleString()}</span>
            {!readOnly && (
              <button 
                onClick={() => setIsOpen(true)}
                className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition flex items-center gap-2"
              >
                <Mail size={16} /> Inquire
              </button>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 bg-stone-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Send Inquiry</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-stone-200 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-6 bg-stone-50 p-3 rounded-lg border border-stone-200">
                <img src={product.image} className="w-16 h-16 object-cover rounded-md bg-stone-200" alt="" />
                <div>
                  <p className="text-xs text-stone-500 uppercase">Inquiring about</p>
                  <p className="font-bold text-stone-800">{product.name}</p>
                </div>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                onInquire({
                  product: product.name,
                  customer: formData.get('name'),
                  contact: formData.get('contact'),
                  message: formData.get('message')
                });
                setIsOpen(false);
              }} className="space-y-4">
                <input required name="name" type="text" className="w-full p-2 border rounded-lg" placeholder="Your Name" />
                <input required name="contact" type="tel" className="w-full p-2 border rounded-lg" placeholder="Contact Number" />
                <textarea name="message" rows="2" className="w-full p-2 border rounded-lg" placeholder="Message..."></textarea>
                <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold">Send Inquiry</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AdminLogin({ onLogin }) {
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (pass === 'sk234f90') {
      onLogin();
    } else {
      setError('Invalid Password (Hint: admin)');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-stone-100 text-center">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-600">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Artisan Access</h2>
        <form onSubmit={handleLogin} className="space-y-4 mt-6">
          <input 
            type="password" 
            value={pass} 
            onChange={(e) => setPass(e.target.value)} 
            className="w-full p-3 border border-stone-300 rounded-lg text-center" 
            placeholder="Password" 
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button className="w-full bg-stone-900 text-white py-3 rounded-lg font-bold">Access Dashboard</button>
        </form>
        {/* <p className="text-xs text-stone-400 mt-4">Demo Password: admin123</p> */}
      </div>
    </div>
  );
}

function AdminDashboard({ products, inquiries, onAddProduct, onDeleteProduct, onLogout }) {
  const [tab, setTab] = useState('products');
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Dashboard</h2>

        {/* NEW: Logout Button added to the top right */}
        <div className='flex items-center gap-4'>
          <button onClick={onLogout} className='text-red-600 hover:text-red-800 text-sm font-bold underline'>
            Logout
          </button>

          <div className="flex bg-stone-200 p-1 rounded-lg">
          <button onClick={() => setTab('products')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === 'products' ? 'bg-white shadow text-stone-900' : 'text-stone-600'}`}>Products</button>
          <button onClick={() => setTab('inquiries')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === 'inquiries' ? 'bg-white shadow text-stone-900' : 'text-stone-600'}`}>Inquiries</button>
          </div>
        </div>
      </div>

      {tab === 'products' ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-stone-700">Inventory</h3>
            <button onClick={() => setIsAddOpen(true)} className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus size={16} /> Add Item</button>
          </div>
          <div className="bg-white rounded-xl shadow overflow-hidden border border-stone-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b text-stone-500 uppercase text-xs">
                <tr><th className="p-4">Product</th><th className="p-4">Price</th><th className="p-4 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="p-4 font-medium">{p.name} <span className="text-stone-400 font-normal ml-2">({p.category})</span></td>
                    <td className="p-4">Rs. {Number(p.price).toLocaleString()}</td>
                    <td className="p-4 text-right"><button onClick={() => onDeleteProduct(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && <div className="p-8 text-center text-stone-500">Inventory is empty.</div>}
          </div>
        </div>
      ) : (
        <div>
          <h3 className="font-bold text-stone-700 mb-4">Inquiries</h3>
          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div key={inq.id} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <div className="flex justify-between mb-2">
                  <div><h4 className="font-bold">{inq.customer}</h4><p className="text-sm text-stone-500">{inq.contact}</p></div>
                  <div className="text-right"><p className="text-xs text-stone-400">Interested in</p><p className="font-medium text-orange-600">{inq.product}</p></div>
                </div>
                {inq.message && <div className="bg-stone-50 p-3 rounded text-sm italic">"{inq.message}"</div>}
                <p className="text-xs text-stone-400 mt-2">{inq.created_at ? new Date(inq.created_at).toLocaleString() : 'Recent'}</p>
              </div>
            ))}
            {inquiries.length === 0 && <div className="text-center py-10 text-stone-500 bg-white rounded-xl border">No inquiries yet.</div>}
          </div>
        </div>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">Add Product</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              // UPDATED LOGIC: Uses the typed filename or a default placeholder
              const imageFile = formData.get('image');
              onAddProduct({
                name: formData.get('name'),
                category: formData.get('category'),
                price: Number(formData.get('price')),
                description: formData.get('description'),
                // If they typed "bowl.jpg", use it. If empty, use the placeholder.
                image: imageFile ? `/${imageFile}` : 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=500'
              });
              setIsAddOpen(false);
            }} className="space-y-4">
              <input required name="name" placeholder="Product Name" className="w-full p-2 border rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <input required name="category" placeholder="Category" className="w-full p-2 border rounded-lg" />
                <input required name="price" type="number" placeholder="Price" className="w-full p-2 border rounded-lg" />
              </div>
              {/* NEW INPUT FIELD FOR IMAGE */}
              <input name="image" placeholder="Image Filename (e.g. bowl.jpg)" className="w-full p-2 border rounded-lg" />
              <p className="text-xs text-stone-500">Paste your image in the "public" folder first.</p>
              
              <textarea required name="description" placeholder="Description" className="w-full p-2 border rounded-lg" rows="3"></textarea>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 bg-stone-200 py-3 rounded-lg font-bold">Cancel</button>
                <button className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-bold">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}