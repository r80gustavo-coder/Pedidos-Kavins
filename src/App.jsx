import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- PARA VERCEL (PRODUÇÃO): DESCOMENTE A LINHA ABAIXO ---
 //import { createClient } from '@supabase/supabase-js';

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

// --- OPÇÃO A: MODO PRODUÇÃO (Para Vercel/Supabase Real) ---
// 1. Descomente a linha abaixo.
// 2. Comente ou apague o bloco da "OPÇÃO B".

// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// --- OPÇÃO B: MODO SIMULAÇÃO (MOCK - Para o chat) ---
 const supabase = {
    from: (table) => ({
        select: async (query = '*') => {
            console.warn(`[MOCK] Select em ${table}`);
            return { data: JSON.parse(localStorage.getItem(`temp_conf_${table}`) || '[]'), error: null };
        },
        insert: async (records) => {
            console.warn(`[MOCK] Insert em ${table}`);
            const current = JSON.parse(localStorage.getItem(`temp_conf_${table}`) || '[]');
            const newRecords = Array.isArray(records) ? records : [records];
            const processed = newRecords.map(r => ({ ...r, id: r.id || crypto.randomUUID() }));
            localStorage.setItem(`temp_conf_${table}`, JSON.stringify([...current, ...processed]));
            return { data: processed, error: null };
        },
        update: async (changes) => {
             return {
                 eq: async (col, val) => {
                    console.warn(`[MOCK] Update em ${table}`);
                    const current = JSON.parse(localStorage.getItem(`temp_conf_${table}`) || '[]');
                    const updated = current.map(item => item[col] === val ? { ...item, ...changes } : item);
                    localStorage.setItem(`temp_conf_${table}`, JSON.stringify(updated));
                    return { data: updated, error: null };
                 }
             }
        },
        delete: async () => {
            return {
                eq: async (col, val) => {
                    console.warn(`[MOCK] Delete em ${table}`);
                    const current = JSON.parse(localStorage.getItem(`temp_conf_${table}`) || '[]');
                    const updated = current.filter(item => item[col] !== val);
                    localStorage.setItem(`temp_conf_${table}`, JSON.stringify(updated));
                    return { data: null, error: null };
                }
            }
        }
    }),
    auth: {
        signInWithPassword: async ({ email, password }) => {
            if (email === 'gustavo_benvindo80@hotmail.com' && password === 'Gustavor80') {
                return { user: { id: 'admin-id', email, role: 'admin', name: 'Gustavo Admin' }, error: null };
            }
            const allUsers = JSON.parse(localStorage.getItem('temp_conf_users') || '[]');
            const user = allUsers.find(u => u.username === email && u.password === password);
            if (user) return { user: { id: user.id, email: user.username, role: 'rep', name: user.name }, error: null };
            return { user: null, error: { message: 'Credenciais inválidas (MOCK)' } };
        }
    }
};
// --- FIM DO BLOCO MOCK ---


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

// Função auxiliar para formatar data com segurança
const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
};

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
        // 1. Verifica se é o Admin
        if (cleanUser === 'gustavo_benvindo80@hotmail.com' && cleanPass === 'Gustavor80') {
            onLogin({ id: 'admin-id', email: cleanUser, role: 'admin', name: 'Gustavo Admin' });
            return;
        }

        // 2. Verifica Representantes
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', cleanUser) 
            .eq('password', cleanPass)
            .maybeSingle ? await supabase.from('users').select('*').eq('username', cleanUser).eq('password', cleanPass).maybeSingle() : { data: null }; // Mock fallback
        
        // Fallback para o Mock
        let userFound = data;
        if (!userFound && supabase.auth.signInWithPassword.toString().includes('MOCK')) {
             const res = await supabase.auth.signInWithPassword({ email: cleanUser, password: cleanPass });
             if(res.user) userFound = res.user;
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
      let items = [];
      if (Array.isArray(order.items)) items = order.items;
      else if (typeof order.items === 'string') {
          try { items = JSON.parse(order.items); } catch(e) { items = []; }
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
          <div className="flex justify-between items-start">
            <div><h3 className="text-gray-500 text-sm font-semibold">Peças Vendidas</h3><p className="text-3xl font-bold text-blue-700">{stats.totalItems}</p></div>
            <Package className="text-blue-300" size={24}/>
          </div>
        </Card>
        <Card className="bg-green-50 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
             <div><h3 className="text-gray-500 text-sm font-semibold">Total Pedidos</h3><p className="text-3xl font-bold text-green-700">{stats.totalOrders}</p></div>
             <FileText className="text-green-300" size={24}/>
          </div>
        </Card>
        <Card className="bg-purple-50 border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
             <div><h3 className="text-gray-500 text-sm font-semibold">Top Referência</h3>
                <p className="text-xl font-bold text-purple-700 truncate w-full">{stats.topRefs[0] ? `#${stats.topRefs[0][0]}` : '-'}</p>
                <p className="text-xs text-purple-600">{stats.topRefs[0] ? `${stats.topRefs[0][1]} unidades` : ''}</p>
             </div>
             <TrendingUp className="text-purple-300" size={24}/>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><TrendingUp size={18}/> Referências Mais Vendidas</h3>
            <div className="space-y-3">
                {stats.topRefs.map(([ref, qtd], idx) => (
                    <div key={ref} className="flex items-center">
                        <span className="w-6 text-gray-400 font-bold text-sm">#{idx + 1}</span>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1"><span className="text-sm font-medium">Ref: {ref}</span><span className="text-sm text-gray-600">{qtd} un</span></div>
                            <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(qtd / (stats.totalItems || 1)) * 100}%` }}></div></div>
                        </div>
                    </div>
                ))}
                {stats.topRefs.length === 0 && <p className="text-gray-400 text-sm">Sem dados de vendas.</p>}
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-bold mb-4">Top Itens (Ref + Cor)</h3>
            <div className="divide-y">
                {stats.topItems.map(([key, qtd], idx) => (
                     <div key={idx} className="py-2 flex justify-between text-sm"><span className="text-gray-700">{key}</span><span className="font-bold text-gray-900">{qtd} un</span></div>
                ))}
                 {stats.topItems.length === 0 && <p className="text-gray-400 text-sm">Sem dados de vendas.</p>}
            </div>
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

  // --- Carregamento de Dados (SUPABASE) ---
  const fetchAllData = useCallback(async () => {
    const { data: usersData } = await supabase.from('users').select('*');
    setUsers(usersData || []);

    const { data: productsData } = await supabase.from('products').select('*');
    setProducts(productsData || []);

    const { data: ordersData } = await supabase.from('orders').select('*');
    
    // Mapeia dados e CORRIGE O NOME DA COLUNA DE DATA
    const parsedOrders = (ordersData || []).map(order => {
        let items = [];
        if(Array.isArray(order.items)) items = order.items;
        else if(typeof order.items === 'string') {
            try { items = JSON.parse(order.items); } catch(e){ items = []; }
        }
        // IMPORTANTE: Mapeia created_at (do banco) para createdAt (do app)
        // Se createdAt já existir (Mock), mantém.
        const createdAt = order.created_at || order.createdAt; 
        return { ...order, items, createdAt };
    });
    setOrders(parsedOrders);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData, view]);


  // --- Ações do Admin ---
  const addUser = async () => {
    if (!newUser.name || !newUser.username || !newUser.password) return alert('Preencha todos os campos');
    
    if(!supabase.auth.toString().includes('MOCK')) {
         const { data: existing } = await supabase.from('users').select('id').eq('username', newUser.username).maybeSingle();
         if (existing) return alert('Erro: Este nome de usuário já existe.');
    }

    const { error } = await supabase.from('users').insert(newUser);
    if (error) alert('Erro ao cadastrar: ' + error.message);
    else { alert('Cadastrado!'); fetchAllData(); setNewUser({ name: '', username: '', password: '' }); }
  };

  const removeUser = async (id) => {
    if (confirm('Tem certeza?')) {
      const { error } = await supabase.from('users').delete().eq('id', id); 
      if (error) alert('Erro: ' + error.message); else fetchAllData(); 
    }
  };

  const addProduct = async () => {
    if (!newProd.ref || !newProd.color) return alert('Preencha tudo');
    const { error } = await supabase.from('products').insert(newProd);
    if (error) alert('Erro ao adicionar.');
    else { alert('Produto adicionado!'); fetchAllData(); setNewProd({ ...newProd, color: '' }); }
  };

  const removeProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id); 
    if (error) alert('Erro ao deletar.'); else fetchAllData();
  };

  const toggleOrderSelection = (orderId) => {
    if (selectedOrdersForReport.includes(orderId)) setSelectedOrdersForReport(selectedOrdersForReport.filter(id => id !== orderId));
    else setSelectedOrdersForReport([...selectedOrdersForReport, orderId]);
  };

  const markAsPrinted = async (orderIds) => {
    const promises = orderIds.map(id => supabase.from('orders').update({ status: 'Impresso' }).eq('id', id));
    await Promise.all(promises);
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

  // --- FIX: Relatório por Data ---
  const dateRangeConsolidated = useMemo(() => {
      if(!dateRange.start || !dateRange.end) return null;
      
      const startStr = dateRange.start; 
      const endStr = dateRange.end;
      
      const filteredOrders = orders.filter(o => {
          // Usa createdAt mapeado
          if (!o.createdAt) return false; 
          const orderDate = o.createdAt.substring(0, 10);
          return orderDate >= startStr && orderDate <= endStr;
      });

      const consolidation = {}; 
      filteredOrders.forEach(order => {
        if(Array.isArray(order.items)) {
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
        }
      });
      return Object.values(consolidation).sort((a, b) => a.ref.localeCompare(b.ref, undefined, { numeric: true }));
  }, [orders, dateRange]);


  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6 print:hidden overflow-x-auto pb-2">
        <Button onClick={() => setView('dashboard')}>Dashboard</Button>
        <Button onClick={() => setView('users')}>Representantes</Button>
        <Button onClick={() => setView('products')}>Catálogo</Button>
        <Button onClick={() => setView('orders')}>Pedidos</Button>
        <Button onClick={() => setView('reports')}>Relatórios</Button>
      </div>

      {view === 'dashboard' && <DashboardStats orders={orders} title="Visão Geral do Admin" />}

      {view === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-bold text-lg mb-4">Cadastrar Representante</h3>
            <Input label="Nome Completo" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
            <Input label="Usuário de Acesso" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
            <Input label="Senha" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
            <Button onClick={addUser} className="w-full">Cadastrar</Button>
          </Card>
          <Card>
            <h3 className="font-bold text-lg mb-4">Representantes Ativos</h3>
            <div className="divide-y">
              {users.map(u => (
                <div key={u.id} className="py-3 flex justify-between items-center">
                  <div><p className="font-bold">{u.name}</p><p className="text-sm text-gray-500">User: {u.username}</p></div>
                  <button onClick={() => removeUser(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {view === 'products' && (
        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-lg mb-4">Adicionar ao Catálogo</h3>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full"><Input label="Referência" value={newProd.ref} onChange={e => setNewProd({...newProd, ref: e.target.value})} placeholder="Ex: 1050" /></div>
              <div className="flex-1 w-full"><Input label="Cor" value={newProd.color} onChange={e => setNewProd({...newProd, color: e.target.value})} placeholder="Ex: Azul Marinho" /></div>
              <div className="w-full md:w-40 mb-3">
                <label className="text-sm font-semibold text-gray-700 block mb-1">Grade</label>
                <select className="w-full border p-2 rounded-md h-[42px] bg-white" value={newProd.grade} onChange={e => setNewProd({...newProd, grade: e.target.value})}>
                  <option value="STD">P ao GG</option><option value="PLUS">G1 ao G3</option>
                </select>
              </div>
              <div className="mb-3"><Button onClick={addProduct}><Plus size={20}/></Button></div>
            </div>
          </Card>
          <Card>
             <h3 className="font-bold text-lg mb-4">Produtos Cadastrados</h3>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 border-b"><tr><th className="p-3">Ref</th><th className="p-3">Cor</th><th className="p-3">Grade</th><th className="p-3 text-right">Ação</th></tr></thead>
                 <tbody className="divide-y">
                   {products.map(p => (
                     <tr key={p.id} className="hover:bg-gray-50">
                       <td className="p-3 font-medium">{p.ref}</td><td className="p-3">{p.color}</td><td className="p-3">{p.grade === 'STD' ? 'P-GG' : 'G1-G3'}</td>
                       <td className="p-3 text-right"><button onClick={() => removeProduct(p.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </Card>
        </div>
      )}

      {view === 'orders' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center print:hidden">
            <h2 className="text-xl font-bold">Gestão de Pedidos (Seleção)</h2>
            <div className="space-x-2">
                <Button variant="outline" onClick={() => { window.print(); if(selectedOrdersForReport.length > 0) markAsPrinted(selectedOrdersForReport); }}>
                    <Printer size={18} className="mr-2 inline"/> Imprimir Selecionados
                </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4 print:hidden">
              <Card className="max-h-screen overflow-y-auto">
                 <div className="mb-2 flex justify-between items-center">
                    <span className="font-bold text-gray-700">Selecione para Imprimir</span>
                    <button className="text-xs text-blue-600 underline" onClick={() => setSelectedOrdersForReport([])}>Limpar</button>
                 </div>
                 {orders.slice().reverse().map(o => (
                   <div key={o.id} className={`p-3 border rounded mb-2 cursor-pointer transition-colors ${selectedOrdersForReport.includes(o.id) ? 'bg-blue-50 border-blue-500' : 'bg-white hover:bg-gray-50'}`} onClick={() => toggleOrderSelection(o.id)}>
                     <div className="flex justify-between items-start">
                        <div><p className="font-bold text-sm">#{o.id.slice(-6).toUpperCase()}</p><p className="text-xs text-gray-500">{o.clientName}</p><p className="text-xs text-gray-400">{formatDate(o.createdAt)}</p></div>
                        <div className="text-right"><span className={`text-xs px-2 py-1 rounded-full ${o.status === 'Impresso' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{o.status}</span><p className="text-xs font-bold mt-1 text-gray-600">{o.repName}</p></div>
                     </div>
                   </div>
                 ))}
              </Card>
            </div>
            <div className="lg:col-span-2">
                <Card className="print:shadow-none print:border-none print:p-0">
                    <div className="hidden print:block mb-4 border-b pb-2"><h1 className="text-xl font-bold">Relatório de Separação</h1><p className="text-sm text-gray-600">Impresso em: {new Date().toLocaleString()}</p></div>
                    {selectedOrdersForReport.length === 0 ? (
                        <div className="text-center text-gray-400 py-10 print:hidden">Selecione pedidos ao lado.</div>
                    ) : (
                        <div className="print:w-full">
                            {orders.filter(o => selectedOrdersForReport.includes(o.id)).map((order, orderIdx) => (
                                <div key={order.id} className={`mb-8 border-2 border-black p-4 break-inside-avoid ${orderIdx > 0 ? 'print:break-before-page' : ''}`}>
                                    <div className="flex justify-between border-b border-black pb-2 mb-2 text-sm">
                                        <div className="w-2/3"><p><span className="font-bold">Cliente:</span> {order.clientName}</p><p><span className="font-bold">Cidade/UF:</span> {order.clientCity} - {order.clientState}</p></div>
                                        <div className="text-right w-1/3"><p><span className="font-bold">Pedido:</span> #{order.id.slice(-6).toUpperCase()}</p><p><span className="font-bold">Rep:</span> {order.repName}</p><p><span className="font-bold">Entrega:</span> {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '-'}</p></div>
                                    </div>
                                    <table className="w-full text-xs text-center border-collapse border border-black table-fixed">
                                        <thead className="bg-gray-200"><tr><th className="border border-black p-1 w-16">Ref</th><th className="border border-black p-1 text-left w-auto">Cor</th>{ALL_SIZES.map(s => <th key={s} className="border border-black p-1 w-8">{s}</th>)}<th className="border border-black p-1 w-10 font-bold">Qtd</th></tr></thead>
                                        <tbody>
                                            {order.items.map((item, idx) => {
                                                 const rowTotal = Object.values(item.qtd || {}).reduce((a,b)=>a+Number(b),0);
                                                return (
                                                    <tr key={idx}>
                                                        <td className="border border-black p-1 font-bold">{item.ref}</td><td className="border border-black p-1 text-left truncate">{item.color}</td>
                                                        {ALL_SIZES.map(s => <td key={s} className="border border-black p-1">{item.qtd && item.qtd[s] ? <span className="font-bold">{item.qtd[s]}</span> : <span className="text-gray-300">-</span>}</td>)}
                                                        <td className="border border-black p-1 font-bold bg-gray-100">{rowTotal}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                    <div className="mt-2 flex gap-4 text-xs"><div className="flex-1 border border-black p-1 h-12"><strong>Obs:</strong> {order.notes}</div><div className="w-32 border border-black p-1 flex flex-col justify-center text-center"><span className="font-bold text-lg">{order.items.reduce((acc, i) => acc + Object.values(i.qtd || {}).reduce((a,b)=>a+b,0), 0)}</span><span>Peças Totais</span></div></div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
          </div>
        </div>
      )}

      {view === 'reports' && (
          <div className="space-y-8">
              <h2 className="text-2xl font-bold">Relatórios Avançados</h2>
              <Card className="border-t-4 border-blue-500">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Search size={20} className="text-blue-500"/> Análise de Cores por Referência</h3>
                  <div className="flex gap-4 items-end mb-6">
                      <div className="flex-1"><label className="text-sm font-semibold text-gray-700">Digite a Referência</label><input className="border p-2 rounded w-full" placeholder="Ex: 1050" value={reportRef} onChange={e => setReportRef(e.target.value)} /></div>
                  </div>
                  {reportRef && refAnalysis.length > 0 && (
                      <div className="space-y-2"><h4 className="font-bold text-sm text-gray-600">Ranking de Cores:</h4>{refAnalysis.map(([color, total], idx) => (<div key={color} className="flex items-center gap-4 bg-gray-50 p-2 rounded"><span className="font-bold text-lg text-blue-600 w-8">#{idx+1}</span><div className="flex-1"><p className="font-bold">{color}</p><div className="w-full bg-gray-200 h-2 rounded mt-1"><div className="bg-blue-500 h-2 rounded" style={{ width: `${(total / refAnalysis[0][1]) * 100}%` }}></div></div></div><span className="font-bold text-gray-800">{total} pçs</span></div>))}</div>
                  )}
              </Card>
              <Card className="border-t-4 border-green-500">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Calendar size={20} className="text-green-500"/> Relatório Total por Data</h3>
                  <div className="flex flex-wrap gap-4 items-end mb-4 print:hidden">
                      <div><label className="text-sm font-semibold text-gray-700 block">Início</label><input type="date" className="border p-2 rounded" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})}/></div>
                      <div><label className="text-sm font-semibold text-gray-700 block">Fim</label><input type="date" className="border p-2 rounded" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})}/></div>
                      <Button variant="outline" onClick={() => window.print()}><Printer size={18} className="mr-2"/> Imprimir</Button>
                  </div>
                  {dateRangeConsolidated && dateRangeConsolidated.length > 0 ? (
                      <div className="overflow-x-auto">
                          <div className="print:block hidden mb-4"><h1 className="text-xl font-bold">Relatório Consolidado</h1><p>Período: {new Date(dateRange.start).toLocaleDateString()} até {new Date(dateRange.end).toLocaleDateString()}</p></div>
                          <table className="w-full text-sm text-center border">
                              <thead className="bg-gray-800 text-white"><tr><th className="p-2 text-left">Ref</th><th className="p-2 text-left">Cor</th>{ALL_SIZES.map(s => <th key={s} className="p-2 w-10">{s}</th>)}<th className="p-2 font-bold bg-gray-900">Total</th></tr></thead>
                              <tbody className="divide-y">
                                  {dateRangeConsolidated.map((item, idx) => {
                                      const totalRow = Object.values(item.sizes).reduce((a,b)=>a+b,0);
                                      return (<tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}><td className="p-2 text-left font-bold">{item.ref}</td><td className="p-2 text-left">{item.color}</td>{ALL_SIZES.map(s => <td key={s} className="p-2 text-gray-700">{item.sizes[s] || '-'}</td>)}<td className="p-2 font-bold bg-blue-100">{totalRow}</td></tr>)
                                  })}
                              </tbody>
                          </table>
                      </div>
                  ) : <p className="text-gray-400 text-center py-4">Selecione as datas.</p>}
              </Card>
          </div>
      )}
    </div>
  );
};

// =========================================================
// --- 7. PAINEL DO REPRESENTANTE ---
// =========================================================

const RepDashboard = ({ user }) => {
  const [view, setView] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]); 
  const [clientFilter, setClientFilter] = useState(''); 
  
  const [currentOrder, setCurrentOrder] = useState({ clientId: '', clientName: '', clientCity: '', deliveryDate: '', payment: '', items: [], notes: '' });
  const [inputLine, setInputLine] = useState({ ref: '', grade: null, color: '', qtds: { P: '', M: '', G: '', GG: '', G1: '', G2: 'r', G3: '' } });
  
  const fetchRepData = useCallback(async () => {
    const { data: ord } = await supabase.from('orders').select('*').eq('repId', user.id);
    // Map created_at to createdAt
    setOrders((ord || []).map(o => ({...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items, createdAt: o.created_at || o.createdAt })));
    
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
          // USE created_at para compatibilidade com DB
          created_at: new Date().toISOString() 
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
                          <div><span className="font-bold">{o.clientName}</span> <span className="text-xs text-gray-500">{formatDate(o.createdAt)}</span></div>
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




