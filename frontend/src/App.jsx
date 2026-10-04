/* eslint-disable */
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'customer', city:'Kohima' });
  const [msg, setMsg] = useState('');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [vendors, setVendors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [vForm, setVForm] = useState({ business_name:'', category:'Electrician', area:'Kohima Town', price_per_hour:300, description:'' });
  const [bookingDate, setBookingDate] = useState('2026-10-06');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  const fetchVendors = async () => {
    const res = await axios.get('http://localhost:5000/api/vendors');
    setVendors(res.data);
  };
  const fetchMyBookings = async () => {
    const token = localStorage.getItem('token');
    if(!token) return;
    try {
      const res = await axios.get('http://localhost:5000/api/bookings/my', { headers: { 'x-auth-token': token }});
      setBookings(res.data);
    } catch(e){}
  };
  useEffect(()=>{ fetchVendors(); fetchMyBookings(); }, []);

  const filteredVendors = vendors.filter(v => {
    const matchSearch = (v.business_name + v.category + v.area + v.owner_name).toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'All' || v.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const url = isLogin? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
      const res = await axios.post(url, form);
      if (isLogin) {
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setTimeout(()=>{ fetchMyBookings(); }, 500);
      } else { setIsLogin(true); setMsg('Registered! Login now'); }
    } catch (err) { setMsg(err.response?.data?.msg); }
  };
  const handleCreateVendor = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/vendors', vForm, { headers: { 'x-auth-token': token }});
      setMsg('Service Added!'); fetchVendors(); setVForm({...vForm, business_name:'', description:''});
    } catch (err) { setMsg(err.response?.data?.error || 'Error'); }
  };
  const handleBook = async () => {
    if(!selectedVendor) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/bookings', { vendor_id: selectedVendor, service_date: bookingDate }, { headers: { 'x-auth-token': token }});
      setSelectedVendor(null); fetchMyBookings();
    } catch(err){ alert('Booking failed'); }
  };
  const logout = () => { localStorage.clear(); setUser(null); setBookings([]); };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl grid md:grid-cols-2 overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-10 text-white hidden md:flex flex-col justify-center">
            <h1 className="text-4xl font-bold mb-4">Naga Services</h1>
            <p className="text-indigo-100 text-lg">Nagaland's #1 Local Service Marketplace.</p>
            <div className="mt-8 bg-white/20 p-4 rounded-xl">
              <p className="text-sm">⚡ {vendors.length}+ Trusted Vendors</p>
            </div>
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">{isLogin? 'Welcome Back' : 'Create Account'}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && <input className="w-full border p-3 rounded-lg" placeholder="Full Name" onChange={e=>setForm({...form, name:e.target.value})} required />}
              <input className="w-full border p-3 rounded-lg" placeholder="Email" type="email" onChange={e=>setForm({...form, email:e.target.value})} required />
              <input className="w-full border p-3 rounded-lg" placeholder="Password" type="password" onChange={e=>setForm({...form, password:e.target.value})} required />
              {!isLogin && <select className="w-full border p-3 rounded-lg" onChange={e=>setForm({...form, role:e.target.value})}><option value="customer">Customer</option><option value="vendor">Vendor</option></select>}
              <button className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold">{isLogin? 'Login' : 'Register'}</button>
            </form>
            <p className="text-red-500 text-sm mt-2">{msg}</p>
            <p onClick={()=>setIsLogin(!isLogin)} className="text-indigo-600 text-center mt-4 cursor-pointer text-sm">{isLogin? "Don't have account? Register" : 'Already have account? Login'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600">Naga Services 🔧</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{user.name} • {user.role}</span>
            <button onClick={logout} className="text-sm bg-gray-100 px-3 py-1 rounded">Logout</button>
          </div>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {selectedVendor && (
          <div className="bg-indigo-600 text-white p-5 rounded-xl mb-6 flex gap-3 items-center">
            <span>📅</span><input type="date" value={bookingDate} onChange={e=>setBookingDate(e.target.value)} className="text-black p-2 rounded-lg" />
            <button onClick={handleBook} className="bg-white text-indigo-600 px-5 py-2 rounded-lg font-bold">Confirm</button>
            <button onClick={()=>setSelectedVendor(null)} className="bg-indigo-700 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        )}
        {user.role === 'vendor' && (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h3 className="font-bold text-lg mb-4">Add Service</h3>
            <form onSubmit={handleCreateVendor} className="grid md:grid-cols-2 gap-3">
              <input className="border p-3 rounded-lg" placeholder="Business Name" value={vForm.business_name} onChange={e=>setVForm({...vForm, business_name:e.target.value})} required />
              <select className="border p-3 rounded-lg" value={vForm.category} onChange={e=>setVForm({...vForm, category:e.target.value})}>
                <option>Electrician</option><option>Plumber</option><option>Carpenter</option><option>Tutor</option><option>Mechanic</option><option>Cleaning</option>
              </select>
              <input className="border p-3 rounded-lg" placeholder="Area" value={vForm.area} onChange={e=>setVForm({...vForm, area:e.target.value})} />
              <input className="border p-3 rounded-lg" type="number" value={vForm.price_per_hour} onChange={e=>setVForm({...vForm, price_per_hour:e.target.value})} />
              <input className="border p-3 rounded-lg md:col-span-2" placeholder="Description" value={vForm.description} onChange={e=>setVForm({...vForm, description:e.target.value})} />
              <button className="md:col-span-2 bg-green-600 text-white p-3 rounded-lg">+ Add</button>
            </form>
            <h4 className="font-bold mt-6 mb-2">Bookings ({bookings.length})</h4>
            {bookings.map(b=> <div key={b.id} className="bg-orange-50 border p-2 rounded text-sm mb-1">{b.customer_name} booked {b.business_name} on {new Date(b.service_date).toLocaleDateString()}</div>)}
          </div>
        )}

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-3">
          <input placeholder="🔍 Search Electrician, Plumber..." className="border p-2.5 rounded-lg flex-1 min-w-[200px]" value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="border p-2.5 rounded-lg" value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
            <option>All</option><option>Electrician</option><option>Plumber</option><option>Carpenter</option><option>Tutor</option><option>Mechanic</option><option>Cleaning</option>
          </select>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Services in Kohima ({filteredVendors.length})</h3>
          <span className="text-sm text-gray-500">⭐ 4.8 rating</span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map(v=>(
            <div key={v.id} className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-lg transition">
              <div className="flex justify-between mb-2">
                <h4 className="font-bold">{v.business_name}</h4>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{v.category}</span>
              </div>
              <p className="text-sm text-gray-600">👤 {v.owner_name} • 📍 {v.area}</p>
              <p className="text-yellow-500 text-sm mt-1">⭐⭐⭐⭐⭐ (5.0)</p>
              <p className="text-sm text-gray-500 mt-2">{v.description || 'Professional service'}</p>
              <div className="flex justify-between items-center mt-4">
                <p className="font-bold text-indigo-600">₹{v.price_per_hour}/hr</p>
                <div className="flex gap-2">
                  <a href={`https://wa.me/?text=Hi ${v.business_name}`} target="_blank" className="bg-green-500 text-white px-3 py-2 rounded-lg text-xs">WhatsApp</a>
                  {user.role==='customer' && <button onClick={()=>setSelectedVendor(v.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Book</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default App;