import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- PARA VERCEL (PRODUÇÃO): DESCOMENTE A LINHA ABAIXO ---
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

// --- OPÇÃO A: MODO PRODUÇÃO (Para Vercel/Supabase Real) ---
// 1. Descomente a linha do 'createClient' abaixo.
// 2. Comente ou apague todo o bloco da OPÇÃO B (Mock).

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
        // 1. Verifica se é o Admin (Hardcoded)
        if (cleanUser === 'gustavo_benvindo80@hotmail.com' && cleanPass === 'Gustavor80') {
            onLogin({ id: 'admin-id', email: cleanUser, role: 'admin', name: 'Gustavo Admin' });
            return;
        }

        // --- ADMIN 2 (Novo) ---
        // Basta duplicar o bloco e alterar os dados entre as aspas
        if (cleanUser === 'bruno@gmail.com' && cleanPass === 'bruno123') {
            onLogin({ id: 'admin-2', email: cleanUser, role: 'admin', name: 'Bruno' });
            return;
        }
      
        // 2. Verifica Representantes (Tenta via Auth ou Tabela dependendo do modo)
        // No modo real, descomentar a lógica abaixo se usar tabela 'users' ao invés de auth nativo
        
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', cleanUser) 
            .eq('password', cleanPass)
            .maybeSingle ? await supabase.from('users').select('*').eq('username', cleanUser).eq('password', cleanPass).maybeSingle() : { data: null }; // Mock fallback

        // Mock Adapter Logic (remover em produção se usar Auth real)
        let userFound = data;
        if(!userFound && supabase.auth) {
             // Fallback para Mock Auth se a tabela falhar ou for mock
             const authRes = await supabase.auth.signInWithPassword({ email: cleanUser, password: cleanPass });
             if(authRes.user) userFound = authRes.user;
        }

        if (userFound) {
             onLogin({ id: userFound.id, email: userFound.username || userFound.email, role: 'rep', name: userFound.name });
        } else {
             setError('Usuário ou senha incorretos.');
        }

    } catch (e) {
        setError('Erro inesperado. Verifique sua conexão.');
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
          <Input 
            label="Usuário / Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Ex: joao (Usuário cadastrado pelo Admin)"
          />
          <Input 
            label="Senha" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Sua senha"
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verificando...' : 'Entrar'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

// =========================================================
// --- 5. COMPONENTE DE ESTATÍSTICAS ---
// =========================================================

const DashboardStats = ({ orders, title }) => {
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    let totalItems = 0;
    const refSales = {};
    const refColors = {}; 

    orders.forEach(order => {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

      if(Array.isArray(items)){
          items.forEach(item => {
            const itemTotal = Object.values(item.qtd).reduce((a, b) => a + Number(b), 0);
            totalItems += itemTotal;
            
            if (!refSales[item.ref]) refSales[item.ref] = 0;
            refSales[item.ref] += itemTotal;

            const key = `${item.ref} - ${item.color}`;
            if (!refColors[key]) refColors[key] = 0;
            refColors[key] += itemTotal;
          });
      }
    });

    const topRefs = Object.entries(refSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    const topItems = Object.entries(refColors)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return { totalOrders, totalItems, topRefs, topItems };
  }, [orders]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
                <h3 className="text-gray-500 text-sm font-semibold">Peças Vendidas</h3>
                <p className="text-3xl font-bold text-blue-700">{stats.totalItems}</p>
            </div>
            <Package className="text-blue-300" size={24}/>
          </div>
        </Card>
        <Card className="bg-green-50 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
             <div>
                <h3 className="text-gray-500 text-sm font-semibold">Total Pedidos</h3>
                <p className="text-3xl font-bold text-green-700">{stats.totalOrders}</p>
             </div>
             <FileText className="text-green-300" size={24}/>
          </div>
        </Card>
        <Card className="bg-purple-50 border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
             <div>
                <h3 className="text-gray-500 text-sm font-semibold">Top Referência</h3>
                <p className="text-xl font-bold text-purple-700 truncate w-full">
                    {stats.topRefs[0] ? `#${stats.topRefs[0][0]}` : '-'}
                </p>
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
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Ref: {ref}</span>
                                <span className="text-sm text-gray-600">{qtd} un</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(qtd / (stats.totalItems || 1)) * 100}%` }}></div>
                            </div>
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
                     <div key={idx} className="py-2 flex justify-between text-sm">
                         <span className="text-gray-700">{key}</span>
                         <span className="font-bold text-gray-900">{qtd} un</span>
                     </div>
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
    // Converte o JSONB de items para objeto JS
    const parsedOrders = (ordersData || []).map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    }));
    setOrders(parsedOrders);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData, view]);


  // --- Ações do Admin ---
  const addUser = async () => {
    if (!newUser.name || !newUser.username || !newUser.password) return alert('Preencha todos os campos');
    
    const { data: existing } = await supabase.from('users').select('id').eq('username', newUser.username).maybeSingle ? await supabase.from('users').select('id').eq('username', newUser.username).maybeSingle() : {data: null}; // Mock safe
    if (existing) return alert('Erro: Este nome de usuário já existe.');

    const { error } = await supabase.from('users').insert(newUser);
    
    if (error) {
        alert('Erro ao cadastrar: ' + error.message);
    } else {
        alert('Representante cadastrado com sucesso!');
        fetchAllData(); 
        setNewUser({ name: '', username: '', password: '' });
    }
  };

  const removeUser = async (id) => {
    if (confirm('Tem certeza? Isso apagará o representante.')) {
      const { error } = await supabase.from('users').delete().eq('id', id); 
      if (error) alert('Erro ao deletar: ' + error.message);
      else fetchAllData(); 
    }
  };

  const addProduct = async () => {
    if (!newProd.ref || !newProd.color) return alert('Preencha referência e cor');
    
    const { error } = await supabase.from('products').insert(newProd);
    if (error) {
        alert('Erro: Produto já existe ou falha na conexão.');
    } else {
        alert('Produto adicionado!');
        fetchAllData();
        setNewProd({ ...newProd, color: '' }); 
    }
  };

  const removeProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id); 
    if (error) alert('Erro ao deletar produto.');
    else fetchAllData();
  };

  const toggleOrderSelection = (orderId) => {
    if (selectedOrdersForReport.includes(orderId)) {
      setSelectedOrdersForReport(selectedOrdersForReport.filter(id => id !== orderId));
    } else {
      setSelectedOrdersForReport([...selectedOrdersForReport, orderId]);
    }
  };

  const markAsPrinted = async (orderIds) => {
    const promises = orderIds.map(id => 
        supabase.from('orders').update({ status: 'Impresso' }).eq('id', id)
    );
    await Promise.all(promises);
    fetchAllData();
  };

  // --- Relatórios ---
  const refAnalysis = useMemo(() => {
      if(!reportRef) return [];
      const stats = {};
      orders.forEach(o => {
          if(Array.isArray(o.items)) {
              o.items.forEach(i => {
                  if(i.ref === reportRef) {
                      if(!stats[i.color]) stats[i.color] = 0;
                      stats[i.color] += Object.values(i.qtd).reduce((a,b)=>a+Number(b),0);
                  }
              });
          }
      });
      return Object.entries(stats).sort(([,a], [,b]) => b - a);
  }, [orders, reportRef]);
  
// --- FIX: Relatório por Data (Ignora horários e fuso) ---
  const dateRangeConsolidated = useMemo(() => {
      // 1. Se não tiver data selecionada, não faz nada
      if(!dateRange.start || !dateRange.end) return null;
      
      // 2. As datas do input já vêm no formato "AAAA-MM-DD"
      const startStr = dateRange.start; 
      const endStr = dateRange.end;
      
      const filteredOrders = orders.filter(o => {
          // Proteção: Se o pedido não tiver data de criação, ignora
          if (!o.createdAt) return false;

          // 3. O TRUQUE: Pega apenas os 10 primeiros caracteres da data do banco
          // Ex: transforma "2023-11-25T15:30:00.000Z" em "2023-11-25"
          const orderDate = o.createdAt.substring(0, 10);

          // Compara se a data do pedido está entre o início e o fim
          return orderDate >= startStr && orderDate <= endStr;
      });

      // --- Daqui para baixo é a lógica de somar as peças (igual antes) ---
      const consolidation = {}; 
      filteredOrders.forEach(order => {
        // Garante que items é um array antes de tentar ler
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
        <Button variant={view === 'dashboard' ? 'primary' : 'secondary'} onClick={() => setView('dashboard')}>Dashboard</Button>
        <Button variant={view === 'users' ? 'primary' : 'secondary'} onClick={() => setView('users')}>Representantes</Button>
        <Button variant={view === 'products' ? 'primary' : 'secondary'} onClick={() => setView('products')}>Catálogo</Button>
        <Button variant={view === 'orders' ? 'primary' : 'secondary'} onClick={() => setView('orders')}>Gestão de Pedidos</Button>
        <Button variant={view === 'reports' ? 'primary' : 'secondary'} onClick={() => setView('reports')}>Relatórios</Button>
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
                  <div>
                    <p className="font-bold">{u.name}</p>
                    <p className="text-sm text-gray-500">User: {u.username}</p>
                  </div>
                  <button onClick={() => removeUser(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {users.length === 0 && <p className="text-gray-400">Nenhum representante.</p>}
            </div>
          </Card>
        </div>
      )}

      {view === 'products' && (
        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-lg mb-4">Adicionar ao Catálogo</h3>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <Input label="Referência" value={newProd.ref} onChange={e => setNewProd({...newProd, ref: e.target.value})} placeholder="Ex: 1050" />
              </div>
              <div className="flex-1 w-full">
                <Input label="Cor" value={newProd.color} onChange={e => setNewProd({...newProd, color: e.target.value})} placeholder="Ex: Azul Marinho" />
              </div>
              <div className="w-full md:w-40 mb-3">
                <label className="text-sm font-semibold text-gray-700 block mb-1">Grade</label>
                <select 
                  className="w-full border p-2 rounded-md h-[42px] bg-white" 
                  value={newProd.grade} 
                  onChange={e => setNewProd({...newProd, grade: e.target.value})}
                >
                  <option value="STD">P ao GG</option>
                  <option value="PLUS">G1 ao G3</option>
                </select>
              </div>
              <div className="mb-3">
                <Button onClick={addProduct}><Plus size={20}/></Button>
              </div>
            </div>
          </Card>

          <Card>
             <h3 className="font-bold text-lg mb-4">Produtos Cadastrados</h3>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 border-b">
                   <tr>
                     <th className="p-3">Ref</th>
                     <th className="p-3">Cor</th>
                     <th className="p-3">Grade</th>
                     <th className="p-3 text-right">Ação</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y">
                   {products.map(p => (
                     <tr key={p.id} className="hover:bg-gray-50">
                       <td className="p-3 font-medium">{p.ref}</td>
                       <td className="p-3">{p.color}</td>
                       <td className="p-3">{p.grade === 'STD' ? 'P-GG' : 'G1-G3'}</td>
                       <td className="p-3 text-right">
                         <button onClick={() => removeProduct(p.id)} className="text-red-500 hover:text-red-700">
                           <Trash2 size={16}/>
                         </button>
                       </td>
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
                <Button variant="outline" onClick={() => {
                    window.print(); 
                    if(selectedOrdersForReport.length > 0) markAsPrinted(selectedOrdersForReport);
                }}>
                    <Printer size={18} className="mr-2 inline"/>
                    Imprimir Selecionados
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
                 {orders.slice().reverse().map(order => (
                   <div 
                    key={order.id} 
                    className={`p-3 border rounded mb-2 cursor-pointer transition-colors ${selectedOrdersForReport.includes(order.id) ? 'bg-blue-50 border-blue-500' : 'bg-white hover:bg-gray-50'}`}
                    onClick={() => toggleOrderSelection(order.id)}
                   >
                     <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-sm">#{order.id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-gray-500">{order.clientName}</p>
                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                           <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'Impresso' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                               {order.status}
                           </span>
                           <p className="text-xs font-bold mt-1 text-gray-600">{order.repName}</p>
                        </div>
                     </div>
                   </div>
                 ))}
              </Card>
            </div>

            <div className="lg:col-span-2">
                <Card className="print:shadow-none print:border-none print:p-0">
                    <div className="hidden print:block mb-4 border-b pb-2">
                        <h1 className="text-xl font-bold">Relatório de Separação de Pedidos</h1>
                        <p className="text-sm text-gray-600">Impresso em: {new Date().toLocaleString()}</p>
                    </div>

                    {selectedOrdersForReport.length === 0 ? (
                        <div className="text-center text-gray-400 py-10 print:hidden">
                            Selecione pedidos ao lado para ver e imprimir.
                        </div>
                    ) : (
                        <div className="print:w-full">
                            {orders.filter(o => selectedOrdersForReport.includes(o.id)).map((order, orderIdx) => (
                                <div key={order.id} className={`mb-8 border-2 border-black p-4 break-inside-avoid ${orderIdx > 0 ? 'print:break-before-page' : ''}`}>
                                    <div className="flex justify-between border-b border-black pb-2 mb-2 text-sm">
                                        <div className="w-2/3">
                                            <p><span className="font-bold">Cliente:</span> {order.clientName}</p>
                                            <p><span className="font-bold">Cidade/UF:</span> {order.clientCity} - {order.clientState}</p>
                                        </div>
                                        <div className="text-right w-1/3">
                                            <p><span className="font-bold">Pedido:</span> #{order.id.slice(-6).toUpperCase()}</p>
                                            <p><span className="font-bold">Rep:</span> {order.repName}</p>
                                            <p><span className="font-bold">Entrega:</span> {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '-'}</p>
                                        </div>
                                    </div>
                                    
                                    <table className="w-full text-xs text-center border-collapse border border-black table-fixed">
                                        <thead className="bg-gray-200">
                                            <tr>
                                                <th className="border border-black p-1 w-16">Ref</th>
                                                <th className="border border-black p-1 text-left w-auto">Cor</th>
                                                {ALL_SIZES.map(s => <th key={s} className="border border-black p-1 w-8">{s}</th>)}
                                                <th className="border border-black p-1 w-10 font-bold">Qtd</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map((item, idx) => {
                                                 const rowTotal = Object.values(item.qtd).reduce((a,b)=>a+Number(b),0);
                                                return (
                                                    <tr key={idx}>
                                                        <td className="border border-black p-1 font-bold">{item.ref}</td>
                                                        <td className="border border-black p-1 text-left truncate">{item.color}</td>
                                                        {ALL_SIZES.map(s => (
                                                            <td key={s} className="border border-black p-1">
                                                                {item.qtd[s] ? <span className="font-bold">{item.qtd[s]}</span> : <span className="text-gray-300">-</span>}
                                                            </td>
                                                        ))}
                                                        <td className="border border-black p-1 font-bold bg-gray-100">{rowTotal}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                    
                                    <div className="mt-2 flex gap-4 text-xs">
                                        <div className="flex-1 border border-black p-1 h-12"><strong>Obs:</strong> {order.notes}</div>
                                        <div className="w-32 border border-black p-1 flex flex-col justify-center text-center">
                                            <span className="font-bold text-lg">{order.items.reduce((acc, i) => acc + Object.values(i.qtd).reduce((a,b)=>a+b,0), 0)}</span>
                                            <span>Peças Totais</span>
                                        </div>
                                    </div>
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
                      <div className="flex-1">
                          <label className="text-sm font-semibold text-gray-700">Digite a Referência</label>
                          <input className="border p-2 rounded w-full" placeholder="Ex: 1050" value={reportRef} onChange={e => setReportRef(e.target.value)} />
                      </div>
                  </div>
                  {reportRef && refAnalysis.length > 0 && (
                      <div className="space-y-2">
                          <h4 className="font-bold text-sm text-gray-600">Ranking de Cores:</h4>
                          {refAnalysis.map(([color, total], idx) => (
                              <div key={color} className="flex items-center gap-4 bg-gray-50 p-2 rounded">
                                  <span className="font-bold text-lg text-blue-600 w-8">#{idx+1}</span>
                                  <div className="flex-1">
                                      <p className="font-bold">{color}</p>
                                      <div className="w-full bg-gray-200 h-2 rounded mt-1"><div className="bg-blue-500 h-2 rounded" style={{ width: `${(total / refAnalysis[0][1]) * 100}%` }}></div></div>
                                  </div>
                                  <span className="font-bold text-gray-800">{total} pçs</span>
                              </div>
                          ))}
                      </div>
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
                          <div className="print:block hidden mb-4">
                              <h1 className="text-xl font-bold">Relatório Consolidado</h1>
                              <p>Período: {new Date(dateRange.start).toLocaleDateString()} até {new Date(dateRange.end).toLocaleDateString()}</p>
                          </div>
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
  
  const [currentOrder, setCurrentOrder] = useState({
    clientId: '',
    clientName: '',
    clientCity: '',
    clientState: '',
    clientNeighborhood: '',
    deliveryDate: '',
    payment: '',
    items: [], 
    notes: ''
  });

  const [inputLine, setInputLine] = useState({ ref: '', grade: null, color: '', qtds: { P: '', M: '', G: '', GG: '', G1: '', G2: 'r', G3: '' } });
  const [availableColors, setAvailableColors] = useState([]);
  const [newClient, setNewClient] = useState({ name: '', city: '', neighborhood: '', state: '' });
  const [showClientModal, setShowClientModal] = useState(false);
  
  const fetchRepData = useCallback(async () => {
    const { data: ordersData } = await supabase.from('orders').select('*').eq('repId', user.id);
    const parsedOrders = (ordersData || []).map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    }));
    setOrders(parsedOrders);

    const { data: clientsData } = await supabase.from('clients').select('*').eq('repId', user.id);
    setClients(clientsData || []);
    
    const { data: productsData } = await supabase.from('products').select('*');
    setProducts(productsData || []);
  }, [user.id]);

  useEffect(() => { fetchRepData(); }, [fetchRepData, view]);

  const filteredOrders = useMemo(() => {
      if(!clientFilter) return orders;
      return orders.filter(o => o.clientName.toLowerCase().includes(clientFilter.toLowerCase()));
  }, [orders, clientFilter]);

  // Lógica de Pedidos do Representante
  const handleRefChange = (val) => {
    let detectedGrade = null;
    let colors = [];
    if(val) {
        const matchingProds = products.filter(p => p.ref === val);
        if (matchingProds.length > 0) detectedGrade = matchingProds[0].grade;
        colors = [...new Set(matchingProds.map(p => p.color))];
    }
    setAvailableColors(colors);
    setInputLine(prev => ({ ...prev, ref: val, grade: detectedGrade }));
  };

  const handleAddClient = async () => {
    if (!newClient.name) return alert('Nome obrigatório');
    const clientData = { ...newClient, repId: user.id };
    const { data, error } = await supabase.from('clients').insert(clientData).select().single();
    if (error) { alert('Erro ao salvar cliente: ' + error.message); } 
    else {
        fetchRepData(); 
        setCurrentOrder({ ...currentOrder, clientId: data.id, clientName: data.name, clientCity: data.city, clientState: data.state, clientNeighborhood: data.neighborhood });
        setShowClientModal(false);
        setNewClient({ name: '', city: '', neighborhood: '', state: '' });
    }
  };

  const handleAddItem = (e) => {
    if (e && e.key !== 'Enter') return; 
    if (!inputLine.ref || !inputLine.color) return alert('Preencha Ref e Cor');
    const quantities = {};
    let hasQtd = false;
    ALL_SIZES.forEach(size => {
        let isValidSize = true;
        if (inputLine.grade === 'STD' && SIZES_PLUS.includes(size)) isValidSize = false;
        if (inputLine.grade === 'PLUS' && SIZES_STD.includes(size)) isValidSize = false;
        if(isValidSize && inputLine.qtds[size]) {
            quantities[size] = Number(inputLine.qtds[size]);
            hasQtd = true;
        }
    });
    if (!hasQtd) return alert('Informe ao menos uma quantidade válida');
    const newItem = { ref: inputLine.ref, color: inputLine.color, qtd: quantities, id: Date.now() };
    setCurrentOrder({ ...currentOrder, items: [...currentOrder.items, newItem] });
    setInputLine(prev => ({ ...prev, color: '', qtds: { P: '', M: '', G: '', GG: '', G1: '', G2: '', G3: '' } }));
    document.getElementById('input-color')?.focus();
  };

  const removeItem = (itemId) => { setCurrentOrder({ ...currentOrder, items: currentOrder.items.filter(i => i.id !== itemId) }); };

  const editItem = (item) => {
      const newQtds = { P: '', M: '', G: '', GG: '', G1: '', G2: '', G3: '' };
      Object.keys(item.qtd).forEach(k => newQtds[k] = item.qtd[k]);
      setInputLine({ ref: item.ref, color: item.color, grade: null, qtds: newQtds });
      handleRefChange(item.ref);
      removeItem(item.id);
      setTimeout(() => document.getElementById('input-ref')?.focus(), 100);
  };

  const saveOrder = async () => {
    if (!currentOrder.clientId || currentOrder.items.length === 0) return alert('Selecione cliente e adicione itens');
    
    const finalOrder = {
      repId: user.id,
      repName: user.name,
      clientId: currentOrder.clientId,
      clientName: currentOrder.clientName,
      clientCity: currentOrder.clientCity,
      clientState: currentOrder.clientState,
      deliveryDate: currentOrder.deliveryDate,
      payment: currentOrder.payment,
      notes: currentOrder.notes,
      status: 'Pendente',
      items: JSON.stringify(currentOrder.items) 
    };
    
    const { error } = await supabase.from('orders').insert(finalOrder); 

    if (error) {
        alert('Erro ao salvar pedido: ' + error.message);
    } else {
        alert('Pedido Salvo com Sucesso!');
        fetchRepData();
        setView('list');
        setCurrentOrder({ clientId: '', clientName: '', clientCity: '', clientState: '', deliveryDate: '', payment: '', items: [], notes: '' });
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
       <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            <Button variant={view === 'dashboard' ? 'primary' : 'secondary'} onClick={() => setView('dashboard')}>Dashboard</Button>
            <Button variant={view === 'list' ? 'primary' : 'secondary'} onClick={() => setView('list')}>Meus Pedidos</Button>
            <Button variant={view === 'new' ? 'success' : 'secondary'} onClick={() => setView('new')}>+ Novo Pedido</Button>
      </div>

      {view === 'dashboard' && <DashboardStats orders={orders} title={`Dashboard - ${user.name}`} />}

      {view === 'list' && (
        <Card>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-bold">Histórico de Pedidos</h2>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={18} className="text-gray-500"/>
                    <input className="border p-2 rounded text-sm w-full md:w-64" placeholder="Filtrar por cliente..." value={clientFilter} onChange={e => setClientFilter(e.target.value)} />
                </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50"><tr><th className="p-3">Data</th><th className="p-3">Pedido ID</th><th className="p-3">Cliente</th><th className="p-3 text-center">Itens</th><th className="p-3">Status</th></tr></thead>
                <tbody className="divide-y">
                  {filteredOrders.slice().reverse().map(o => (
                    <tr key={o.id}>
                      <td className="p-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 font-mono text-xs">...{o.id.slice(-6)}</td>
                      <td className="p-3 font-bold">{o.clientName}</td>
                      <td className="p-3 text-center">{o.items.length} refs</td>
                      <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${o.status === 'Impresso' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{o.status}</span></td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">Nenhum pedido encontrado.</td></tr>}
                </tbody>
              </table>
            </div>
        </Card>
      )}

      {view === 'new' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
             <button onClick={() => setView('list')} className="text-gray-500 hover:text-gray-700"><ChevronRight className="rotate-180"/></button>
             <h2 className="text-xl font-bold">Novo Pedido</h2>
          </div>

          <Card className="border-l-4 border-blue-500">
             <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold">Dados do Cliente</h3>
                <button onClick={() => setShowClientModal(true)} className="text-sm text-blue-600 underline">+ Novo Cliente</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Selecione o Cliente</label>
                    <select className="w-full border p-2 rounded" value={currentOrder.clientId} onChange={(e) => {
                            const c = clients.find(cl => cl.id == e.target.value);
                            if(c) setCurrentOrder({ ...currentOrder, clientId: c.id, clientName: c.name, clientCity: c.city, clientState: c.state, clientNeighborhood: c.neighborhood });
                        }}>
                        <option value="">-- Selecione --</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div><label className="block text-sm text-gray-600 mb-1">Data de Entrega</label><input type="date" className="w-full border p-2 rounded" value={currentOrder.deliveryDate} onChange={e => setCurrentOrder({...currentOrder, deliveryDate: e.target.value})} /></div>
                <div className="md:col-span-2"><label className="block text-sm text-gray-600 mb-1">Forma de Pagamento</label><input className="w-full border p-2 rounded" placeholder="Ex: 30/60 dias" value={currentOrder.payment} onChange={e => setCurrentOrder({...currentOrder, payment: e.target.value})} /></div>
             </div>
             {showClientModal && (
                 <div className="mt-4 p-4 bg-gray-50 rounded border animate-in fade-in">
                     <h4 className="font-bold text-sm mb-2">Novo Cliente Rápido</h4>
                     <div className="grid grid-cols-2 gap-2 mb-2">
                        <input className="border p-1 rounded" placeholder="Nome" value={newClient.name} onChange={e=>setNewClient({...newClient, name: e.target.value})}/>
                        <input className="border p-1 rounded" placeholder="Cidade" value={newClient.city} onChange={e=>setNewClient({...newClient, city: e.target.value})}/>
                        <input className="border p-1 rounded" placeholder="Bairro" value={newClient.neighborhood} onChange={e=>setNewClient({...newClient, neighborhood: e.target.value})}/>
                        <input className="border p-1 rounded" placeholder="Estado (UF)" value={newClient.state} onChange={e=>setNewClient({...newClient, state: e.target.value})}/>
                     </div>
                     <Button onClick={handleAddClient} size="sm">Salvar Cliente</Button>
                 </div>
             )}
          </Card>

          <Card className="border-l-4 border-green-500">
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2"><h3 className="font-bold">Adicionar Itens</h3>{inputLine.grade && (<span className={`text-xs px-2 py-1 rounded font-bold ${inputLine.grade === 'STD' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{inputLine.grade === 'STD' ? 'Grade Normal' : 'Grade Plus'}</span>)}</div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{inputLine.grade ? 'Grade bloqueada automaticamente' : 'Digite a Ref para bloquear a grade'}</span>
             </div>
             
             <div className="bg-gray-100 p-2 rounded-t flex gap-2 text-sm font-bold text-gray-700">
                <div className="w-24">Ref</div><div className="w-40">Cor</div>{ALL_SIZES.map(s => <div key={s} className="flex-1 text-center">{s}</div>)}<div className="w-10"></div>
             </div>

             <div className="flex gap-2 mb-2 p-2 border border-t-0 rounded-b bg-white shadow-sm" onKeyDown={(e) => { if(e.key === 'Enter') handleAddItem(); }}>
                <div className="w-24"><input id="input-ref" className="w-full border p-1 rounded h-9 font-bold" placeholder="Ref" value={inputLine.ref} onChange={e => handleRefChange(e.target.value)} /></div>
                <div className="w-40 relative">
                    <input id="input-color" list="colors-list" className="w-full border p-1 rounded h-9" placeholder="Cor" value={inputLine.color} onChange={e => setInputLine({...inputLine, color: e.target.value})} />
                    {availableColors.length > 0 && <datalist id="colors-list">{availableColors.map(c => <option key={c} value={c} />)}</datalist>}
                </div>
                {ALL_SIZES.map(size => {
                    let isDisabled = false;
                    if (inputLine.grade === 'STD' && SIZES_PLUS.includes(size)) isDisabled = true;
                    if (inputLine.grade === 'PLUS' && SIZES_STD.includes(size)) isDisabled = true;
                    return (<div key={size} className="flex-1"><input type="number" disabled={isDisabled} className={`w-full border p-1 rounded text-center h-9 focus:bg-blue-50 focus:border-blue-500 ${isDisabled ? 'bg-gray-200 cursor-not-allowed' : ''}`} value={isDisabled ? '' : inputLine.qtds[size]} onChange={e => setInputLine({...inputLine, qtds: {...inputLine.qtds, [size]: e.target.value}})} /></div>);
                })}
                <div className="w-10 flex justify-center items-center"><button onClick={handleAddItem} className="bg-green-600 text-white rounded-full p-1 hover:bg-green-700 shadow"><Check size={16}/></button></div>
             </div>

             <div className="overflow-x-auto border rounded mt-4">
                <table className="w-full text-sm text-center table-fixed">
                    <thead className="bg-gray-50"><tr><th className="p-2 text-left w-24">Ref</th><th className="p-2 text-left w-40">Cor</th>{ALL_SIZES.map(s => <th key={s} className="p-2">{s}</th>)}<th className="p-2 w-16">Total</th><th className="p-2 w-16">Ações</th></tr></thead>
                    <tbody className="divide-y">
                        {currentOrder.items.map(item => {
                             const total = Object.values(item.qtd).reduce((a,b) => a+b, 0);
                             return (<tr key={item.id} className="hover:bg-gray-50 group"><td className="p-2 text-left font-bold truncate">{item.ref}</td><td className="p-2 text-left truncate">{item.color}</td>{ALL_SIZES.map(s => <td key={s} className="p-2 text-gray-600">{item.qtd[s] || '-'}</td>)}<td className="p-2 font-bold bg-blue-50 text-blue-800">{total}</td><td className="p-2 flex justify-center gap-2"><button onClick={() => editItem(item)} className="text-blue-500 hover:bg-blue-100 p-1 rounded"><Pencil size={16}/></button><button onClick={() => removeItem(item.id)} className="text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={16}/></button></td></tr>)
                        })}
                        {currentOrder.items.length === 0 && <tr><td colSpan="12" className="p-4 text-gray-400 text-sm">Nenhum item adicionado ao pedido ainda.</td></tr>}
                    </tbody>
                </table>
             </div>
          </Card>
          <div className="flex gap-4"><Button onClick={saveOrder} className="flex-1 py-3 text-lg shadow-lg bg-green-600 hover:bg-green-700">Finalizar Pedido</Button></div>
        </div>
      )}
    </div>
  );
};

// =========================================================
// --- 8. COMPONENTE PRINCIPAL (APP) ---
// =========================================================

const App = () => {
  const [user, setUser] = useState(null);
  const handleLogout = () => setUser(null);

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <div className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center print:hidden sticky top-0 z-50">
        <div className="flex items-center gap-2"><Package className="text-blue-400"/><h1 className="font-bold text-xl tracking-tight hidden md:block">Confecção Manager</h1></div>
        <div className="flex items-center gap-4"><span className="text-sm text-gray-300">Olá, <strong className="text-white">{user.name}</strong></span><button onClick={handleLogout} className="p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors" title="Sair"><LogOut size={18}/></button></div>
      </div>
      <main className="pb-20 pt-6">
        {user.role === 'admin' ? <AdminDashboard /> : <RepDashboard user={user} />}
      </main>
    </div>
  );
};

export default App;


