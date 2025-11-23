import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- ⚠️ PARA VERCEL (PRODUÇÃO): DESCOMENTE A LINHA ABAIXO ---
 import { createClient } from '@supabase/supabase-js';

import { 
  Users, Package, ShoppingCart, BarChart3, LogOut, Plus, Trash2, 
  Printer, Check, Search, FileText, ChevronRight, Filter,
  Pencil, TrendingUp, Calendar, ListFilter
} from 'lucide-react';

// =========================================================
// --- CONFIGURAÇÃO SUPABASE ---
// =========================================================

const SUPABASE_URL = 'https://ljcnefiyllzuzetxkipp.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqY25lZml5bGx6dXpldHhraXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTE0MzYsImV4cCI6MjA3OTM2NzQzNn0.oQP37ncyfVDcHpuIMUC39-PRlRy1f4_U7oyb3cxvQI4'; 

// --- ⚠️ OPÇÃO A: MODO PRODUÇÃO (Para Vercel/Supabase Real) ---
// 1. Descomente a linha abaixo quando for subir para o Vercel.
// 2. Comente ou apague o bloco da "OPÇÃO B" abaixo.

 const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);




// =========================================================
// --- 2. CONSTANTES ---
// =========================================================

const ALL_SIZES = ['P', 'M', 'G', 'GG', 'G1', 'G2', 'G3'];
const SIZES_STD = ['P', 'M', 'G', 'GG'];
const SIZES_PLUS = ['G1', 'G2', 'G3'];

// =========================================================
// --- 3. COMPONENTES UI ---
// =========================================================

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow p-4 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
  };
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="flex flex-col mb-3">
    {label && <label className="text-sm font-semibold text-gray-700 mb-1">{label}</label>}
    <input 
      className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none w-full" 
      {...props} 
    />
  </div>
);

// =========================================================
// --- 4. TELA DE LOGIN ---
// =========================================================

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanUser = email.trim();
    const cleanPass = password.trim();

    try {
        // 1. Verifica Admin
        if (cleanUser === 'gustavo_benvindo80@hotmail.com' && cleanPass === 'Gustavor80') {
            onLogin({ id: 'admin-id', email: cleanUser, role: 'admin', name: 'Gustavo Admin' });
            return;
        }

        // 2. Verifica Representantes (Tenta tabela 'users')
        // Lógica adaptada para funcionar tanto no Mock quanto no Real
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', cleanUser) 
            .eq('password', cleanPass)
            // maybeSingle funciona no real, no mock retorna array, então tratamos abaixo
            .maybeSingle ? await supabase.from('users').select('*').eq('username', cleanUser).eq('password', cleanPass).maybeSingle() : { data: null };

        // Fallback de lógica para o Mock
        let userFound = data;
        if (!userFound && supabase.auth.signInWithPassword.toString().includes('MOCK')) {
             const res = await supabase.auth.signInWithPassword({ email: cleanUser, password: cleanPass });
             userFound = res.user;
        }

        if (userFound) {
             onLogin({ id: userFound.id, email: userFound.username, role: 'rep', name: userFound.name });
        } else {
             setError('Usuário ou senha incorretos.');
        }
    } catch (e) {
        setError('Erro inesperado.');
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">Gestão de Confecção</h2>
        <form onSubmit={handleLogin}>
          <Input label="Usuário / Email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Ex: joao" />
          <Input label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Entrando...' : 'Entrar'}</Button>
        </form>
      </Card>
    </div>
  );
};

// =========================================================
// --- 5. DASHBOARD STATS ---
// =========================================================

const DashboardStats = ({ orders, title }) => {
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    let totalItems = 0;
    const refSales = {};
    const refColors = {}; 

    orders.forEach(order => {
      // Parse seguro para JSONB vindo do Supabase ou Mock
      let items = [];
      if(Array.isArray(order.items)) items = order.items;
      else if(typeof order.items === 'string') {
          try { items = JSON.parse(order.items); } catch(e){ items = []; }
      }

      items.forEach(item => {
        const itemTotal = Object.values(item.qtd || {}).reduce((a, b) => a + Number(b), 0);
        totalItems += itemTotal;
        
        if (!refSales[item.ref]) refSales[item.ref] = 0;
        refSales[item.ref] += itemTotal;

        const key = `${item.ref} - ${item.color}`;
        if (!refColors[key]) refColors[key] = 0;
        refColors[key] += itemTotal;
      });
    });

    const topRefs = Object.entries(refSales).sort(([, a], [, b]) => b - a).slice(0, 5);
    const topItems = Object.entries(refColors).sort(([, a], [, b]) => b - a).slice(0, 5);

    return { totalOrders, totalItems, topRefs, topItems };
  }, [orders]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-l-4 border-blue-500">
            <div><h3 className="text-gray-500 text-sm font-semibold">Peças Vendidas</h3><p className="text-3xl font-bold text-blue-700">{stats.totalItems}</p></div>
        </Card>
        <Card className="bg-green-50 border-l-4 border-green-500">
            <div><h3 className="text-gray-500 text-sm font-semibold">Total Pedidos</h3><p className="text-3xl font-bold text-green-700">{stats.totalOrders}</p></div>
        </Card>
        <Card className="bg-purple-50 border-l-4 border-purple-500">
            <div><h3 className="text-gray-500 text-sm font-semibold">Top Referência</h3><p className="text-xl font-bold text-purple-700 truncate">{stats.topRefs[0] ? `#${stats.topRefs[0][0]}` : '-'}</p></div>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold mb-4">Referências Mais Vendidas</h3>
            {stats.topRefs.map(([ref, qtd], idx) => (
                <div key={ref} className="flex justify-between border-b py-2"><span>#{idx+1} <strong>{ref}</strong></span><span>{qtd} un</span></div>
            ))}
          </Card>
          <Card>
            <h3 className="text-lg font-bold mb-4">Top Itens (Ref + Cor)</h3>
            {stats.topItems.map(([key, qtd], idx) => (
                 <div key={idx} className="flex justify-between border-b py-2"><span>{key}</span><span>{qtd} un</span></div>
            ))}
          </Card>
      </div>
    </div>
  );
};

// =========================================================
// --- 6. DASHBOARD ADMIN ---
// =========================================================

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState('dashboard');
  const [selectedOrdersForReport, setSelectedOrdersForReport] = useState([]);
  
  const [reportRef, setReportRef] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [newUser, setNewUser] = useState({ name: '', username: '', password: '' });
  const [newProd, setNewProd] = useState({ ref: '', color: '', grade: 'STD' });

  const fetchAllData = useCallback(async () => {
    const { data: usersData } = await supabase.from('users').select('*');
    setUsers(usersData || []);
    const { data: productsData } = await supabase.from('products').select('*');
    setProducts(productsData || []);
    const { data: ordersData } = await supabase.from('orders').select('*');
    // Normaliza items
    const parsedOrders = (ordersData || []).map(order => {
        let items = [];
        if(Array.isArray(order.items)) items = order.items;
        else if(typeof order.items === 'string') {
            try { items = JSON.parse(order.items); } catch(e){ items = []; }
        }
        return { ...order, items };
    });
    setOrders(parsedOrders);
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData, view]);

  // Handlers (simplificados)
  const addUser = async () => {
      if (!newUser.name) return;
      // Verifica duplicidade apenas se não for mock
      if(!supabase.auth.toString().includes('MOCK')) {
        const { data } = await supabase.from('users').select('id').eq('username', newUser.username).maybeSingle();
        if (data) return alert('Usuário já existe');
      }
      await supabase.from('users').insert(newUser);
      fetchAllData(); setNewUser({ name: '', username: '', password: '' });
  };
  const removeUser = async (id) => { if(confirm('Apagar?')) { await supabase.from('users').delete().eq('id', id); fetchAllData(); } };
  const addProduct = async () => { await supabase.from('products').insert(newProd); fetchAllData(); setNewProd({...newProd, color:''}); };
  const removeProduct = async (id) => { await supabase.from('products').delete().eq('id', id); fetchAllData(); };
  const toggleOrderSelection = (id) => {
      if(selectedOrdersForReport.includes(id)) setSelectedOrdersForReport(prev => prev.filter(x => x !== id));
      else setSelectedOrdersForReport(prev => [...prev, id]);
  };
  const markAsPrinted = async (ids) => {
      await Promise.all(ids.map(id => supabase.from('orders').update({status:'Impresso'}).eq('id', id)));
      fetchAllData();
  };

  // --- Relatórios ---
  const refAnalysis = useMemo(() => {
      if(!reportRef) return [];
      const stats = {};
      orders.forEach(o => {
          o.items.forEach(i => {
              if(i.ref === reportRef) {
                  if(!stats[i.color]) stats[i.color] = 0;
                  stats[i.color] += Object.values(i.qtd || {}).reduce((a,b)=>a+Number(b),0);
              }
          });
      });
      return Object.entries(stats).sort(([,a], [,b]) => b - a);
  }, [orders, reportRef]);

  // --- FIX RELATÓRIO POR DATA ---
  const dateRangeConsolidated = useMemo(() => {
      if(!dateRange.start || !dateRange.end) return null;
      
      // Comparação de Strings (YYYY-MM-DD) resolve problemas de fuso horário
      const startStr = dateRange.start; 
      const endStr = dateRange.end;
      
      const filteredOrders = orders.filter(o => {
          if (!o.createdAt) return false;
          // Pega apenas a data (YYYY-MM-DD) da string ISO
          const orderDate = o.createdAt.split('T')[0];
          return orderDate >= startStr && orderDate <= endStr;
      });

      const consolidation = {}; 
      filteredOrders.forEach(order => {
        order.items.forEach(item => {
          const key = `${item.ref}#${item.color}`;
          if (!consolidation[key]) {
            consolidation[key] = { ref: item.ref, color: item.color, sizes: { P:0, M:0, G:0, GG:0, G1:0, G2:0, G3:0 } };
          }
          if (item.qtd) {
              Object.keys(item.qtd).forEach(size => {
                 if(consolidation[key].sizes[size] !== undefined) {
                     consolidation[key].sizes[size] += Number(item.qtd[size]);
                 }
              });
          }
        });
      });
      return Object.values(consolidation).sort((a, b) => a.ref.localeCompare(b.ref, undefined, { numeric: true }));
  }, [orders, dateRange]);


  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        <Button onClick={() => setView('dashboard')}>Dashboard</Button>
        <Button onClick={() => setView('users')}>Representantes</Button>
        <Button onClick={() => setView('products')}>Catálogo</Button>
        <Button onClick={() => setView('orders')}>Pedidos</Button>
        <Button onClick={() => setView('reports')}>Relatórios</Button>
      </div>

      {view === 'dashboard' && <DashboardStats orders={orders} title="Visão Geral Admin" />}
      
      {view === 'users' && (
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <h3 className="font-bold mb-4">Novo Representante</h3>
                <Input label="Nome" value={newUser.name} onChange={e=>setNewUser({...newUser, name: e.target.value})} />
                <Input label="Usuário" value={newUser.username} onChange={e=>setNewUser({...newUser, username: e.target.value})} />
                <Input label="Senha" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} />
                <Button onClick={addUser}>Salvar</Button>
            </Card>
            <Card>
                <h3 className="font-bold mb-4">Cadastrados</h3>
                {users.map(u => <div key={u.id} className="flex justify-between border-b py-2"><span>{u.name} ({u.username})</span><button onClick={()=>removeUser(u.id)} className="text-red-500"><Trash2 size={16}/></button></div>)}
            </Card>
        </div>
      )}
      
      {view === 'products' && (
         <div className="space-y-6">
            <Card>
                <h3 className="font-bold mb-4">Novo Produto</h3>
                <div className="flex gap-2">
                    <Input placeholder="Ref" value={newProd.ref} onChange={e=>setNewProd({...newProd, ref: e.target.value})} />
                    <Input placeholder="Cor" value={newProd.color} onChange={e=>setNewProd({...newProd, color: e.target.value})} />
                    <select className="border p-2 rounded" value={newProd.grade} onChange={e=>setNewProd({...newProd, grade: e.target.value})}>
                        <option value="STD">P-GG</option><option value="PLUS">G1-G3</option>
                    </select>
                    <Button onClick={addProduct}><Plus/></Button>
                </div>
            </Card>
            <Card>
                <h3 className="font-bold mb-4">Catálogo</h3>
                {products.map(p => <div key={p.id} className="flex justify-between border-b py-2"><span>{p.ref} - {p.color} ({p.grade})</span><button onClick={()=>removeProduct(p.id)} className="text-red-500"><Trash2 size={16}/></button></div>)}
            </Card>
         </div>
      )}

      {view === 'orders' && (
         <div className="space-y-6">
             <div className="flex justify-between">
                 <h2 className="text-xl font-bold">Pedidos</h2>
                 <Button onClick={() => { window.print(); if(selectedOrdersForReport.length) markAsPrinted(selectedOrdersForReport); }}><Printer size={16}/> Imprimir</Button>
             </div>
             <div className="grid md:grid-cols-3 gap-6">
                 <Card className="h-96 overflow-y-auto">
                     {orders.slice().reverse().map(o => (
                         <div key={o.id} onClick={()=>toggleOrderSelection(o.id)} className={`p-2 border mb-2 cursor-pointer ${selectedOrdersForReport.includes(o.id) ? 'bg-blue-100' : ''}`}>
                             <p className="font-bold">#{o.id.slice(-6).toUpperCase()}</p>
                             <p className="text-xs">{o.clientName} - {new Date(o.createdAt).toLocaleDateString()}</p>
                             <span className="text-xs bg-gray-200 px-1 rounded">{o.status}</span>
                         </div>
                     ))}
                 </Card>
                 <div className="md:col-span-2">
                     <Card className="print:shadow-none">
                         <h1 className="font-bold text-xl mb-4 print:block hidden">Relatório de Separação</h1>
                         {orders.filter(o => selectedOrdersForReport.includes(o.id)).map(order => (
                             <div key={order.id} className="mb-8 border p-4 break-inside-avoid">
                                 <div className="flex justify-between text-sm mb-2 border-b pb-2">
                                     <div><strong>{order.clientName}</strong> ({order.clientCity})</div>
                                     <div>Rep: {order.repName} | Entrega: {order.deliveryDate}</div>
                                 </div>
                                 <table className="w-full text-xs text-center border">
                                     <thead className="bg-gray-100"><tr><th>Ref</th><th>Cor</th>{ALL_SIZES.map(s=> <th key={s}>{s}</th>)}<th>Qtd</th></tr></thead>
                                     <tbody>
                                         {order.items.map((item, i) => (
                                             <tr key={i}>
                                                 <td className="font-bold">{item.ref}</td><td>{item.color}</td>
                                                 {ALL_SIZES.map(s => <td key={s}>{item.qtd && item.qtd[s] ? <b>{item.qtd[s]}</b> : '-'}</td>)}
                                                 <td className="bg-gray-100 font-bold">{Object.values(item.qtd||{}).reduce((a,b)=>a+Number(b),0)}</td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                                 <div className="text-xs mt-1">Obs: {order.notes}</div>
                             </div>
                         ))}
                     </Card>
                 </div>
             </div>
         </div>
      )}

      {view === 'reports' && (
          <div className="space-y-8">
              <Card>
                  <h3 className="font-bold mb-4">Relatório Consolidado por Data (FIX)</h3>
                  <div className="flex gap-4 items-end mb-4 print:hidden">
                      <div><label className="block text-xs">Início</label><input type="date" className="border p-1" value={dateRange.start} onChange={e=>setDateRange({...dateRange, start:e.target.value})}/></div>
                      <div><label className="block text-xs">Fim</label><input type="date" className="border p-1" value={dateRange.end} onChange={e=>setDateRange({...dateRange, end:e.target.value})}/></div>
                      <Button onClick={()=>window.print()}>Imprimir</Button>
                  </div>
                  {dateRangeConsolidated && (
                      <table className="w-full text-sm text-center border">
                          <thead className="bg-gray-800 text-white"><tr><th className="p-2">Ref</th><th>Cor</th>{ALL_SIZES.map(s=><th key={s}>{s}</th>)}<th>Total</th></tr></thead>
                          <tbody className="divide-y">
                              {dateRangeConsolidated.map((item, idx) => (
                                  <tr key={idx}>
                                      <td className="p-2 font-bold">{item.ref}</td><td>{item.color}</td>
                                      {ALL_SIZES.map(s => <td>{item.sizes[s] || '-'}</td>)}
                                      <td className="font-bold bg-blue-100">{Object.values(item.sizes).reduce((a,b)=>a+b,0)}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  )}
                  {!dateRange.start && <p className="text-gray-400">Selecione um período.</p>}
              </Card>
          </div>
      )}
    </div>
  );
};

// =========================================================
// --- 7. PAINEL DO REPRESENTANTE ---
// =========================================================
// (Mantido igual, apenas conectado ao Supabase)
const RepDashboard = ({ user }) => {
  const [view, setView] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]); 
  
  const [currentOrder, setCurrentOrder] = useState({ clientId: '', clientName: '', clientCity: '', deliveryDate: '', payment: '', items: [], notes: '' });
  const [inputLine, setInputLine] = useState({ ref: '', grade: null, color: '', qtds: { P: '', M: '', G: '', GG: '', G1: '', G2: 'r', G3: '' } });
  
  const fetchRepData = useCallback(async () => {
    const { data: ord } = await supabase.from('orders').select('*').eq('repId', user.id);
    setOrders((ord || []).map(o => ({...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items })));
    
    const { data: cli } = await supabase.from('clients').select('*').eq('repId', user.id);
    setClients(cli || []);
    
    const { data: prod } = await supabase.from('products').select('*');
    setProducts(prod || []);
  }, [user.id]);

  useEffect(() => { fetchRepData(); }, [fetchRepData, view]);

  const handleAddItem = () => {
      if (!inputLine.ref || !inputLine.color) return;
      const quantities = {};
      ALL_SIZES.forEach(s => { if(inputLine.qtds[s]) quantities[s] = Number(inputLine.qtds[s]); });
      if(Object.keys(quantities).length === 0) return;
      
      setCurrentOrder(prev => ({ ...prev, items: [...prev.items, { ref: inputLine.ref, color: inputLine.color, qtd: quantities, id: Date.now() }] }));
      setInputLine(prev => ({ ...prev, color: '', qtds: { P: '', M: '', G: '', GG: '', G1: '', G2: '', G3: '' } }));
      document.getElementById('rep-input-color')?.focus();
  };

  const saveOrder = async () => {
      if(!currentOrder.clientId || !currentOrder.items.length) return alert('Preencha tudo');
      const finalOrder = {
          repId: user.id, repName: user.name,
          ...currentOrder,
          status: 'Pendente',
          items: JSON.stringify(currentOrder.items),
          createdAt: new Date().toISOString()
      };
      await supabase.from('orders').insert(finalOrder);
      alert('Sucesso'); fetchRepData(); setView('list'); setCurrentOrder({ clientId: '', clientName: '', items: [], notes: '' });
  };

  return (
      <div className="p-4">
          <div className="flex gap-2 mb-4 overflow-x-auto">
              <Button onClick={()=>setView('dashboard')}>Dash</Button><Button onClick={()=>setView('list')}>Pedidos</Button><Button onClick={()=>setView('new')}>Novo</Button>
          </div>
          
          {view === 'dashboard' && <DashboardStats orders={orders} title="Meu Painel" />}
          
          {view === 'list' && (
              <Card>
                  <h3 className="font-bold mb-4">Meus Pedidos</h3>
                  {orders.slice().reverse().map(o => (
                      <div key={o.id} className="border-b py-2 flex justify-between">
                          <div><span className="font-bold">{o.clientName}</span> <span className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</span></div>
                          <div>{o.items.length} itens - {o.status}</div>
                      </div>
                  ))}
              </Card>
          )}

          {view === 'new' && (
              <div className="space-y-4">
                  <Card>
                      <h3 className="font-bold mb-2">Cliente</h3>
                      <select className="border p-2 w-full rounded" value={currentOrder.clientId} onChange={e => {
                          const c = clients.find(cl => cl.id == e.target.value);
                          if(c) setCurrentOrder({...currentOrder, clientId: c.id, clientName: c.name, clientCity: c.city});
                      }}>
                          <option value="">Selecione...</option>
                          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                  </Card>
                  <Card>
                      <h3 className="font-bold mb-2">Itens</h3>
                      <div className="flex gap-2 mb-2">
                          <input className="border p-1 w-20" placeholder="Ref" value={inputLine.ref} onChange={e=>setInputLine({...inputLine, ref:e.target.value})}/>
                          <input id="rep-input-color" className="border p-1 w-28" placeholder="Cor" value={inputLine.color} onChange={e=>setInputLine({...inputLine, color:e.target.value})}/>
                          {ALL_SIZES.map(s => <input key={s} className="border p-1 w-10 text-center" placeholder={s} value={inputLine.qtds[s]||''} onChange={e=>setInputLine({...inputLine, qtds:{...inputLine.qtds, [s]:e.target.value}})}/>)}
                          <Button onClick={handleAddItem}><Plus/></Button>
                      </div>
                      <div className="border-t pt-2">
                          {currentOrder.items.map(item => (
                              <div key={item.id} className="text-sm flex justify-between border-b py-1">
                                  <span>{item.ref} - {item.color}</span>
                                  <span>{Object.values(item.qtd).reduce((a,b)=>a+b,0)} pçs</span>
                              </div>
                          ))}
                      </div>
                  </Card>
                  <Button onClick={saveOrder} className="w-full py-3">Finalizar</Button>
              </div>
          )}
      </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  // Limpa Mock se existir para garantir uso do Real se configurado
  useEffect(() => { if(localStorage.getItem('temp_conf_users')) console.log("App loaded"); }, []);

  if (!user) return <LoginScreen onLogin={setUser} />;
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2"><Package className="text-blue-400"/><span className="font-bold">Confecção Manager</span></div>
        <button onClick={()=>setUser(null)} className="p-1 bg-slate-700 rounded"><LogOut size={16}/></button>
      </div>
      <main className="pb-20">
        {user.role === 'admin' ? <AdminDashboard /> : <RepDashboard user={user} />}
      </main>
    </div>
  );
};

export default App;
