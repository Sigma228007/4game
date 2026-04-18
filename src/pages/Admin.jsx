import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Gamepad2, Package, MessageCircle, DollarSign, Shield, UserCog, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { PageTransition, Reveal } from '../components/Motion';
import { games as allGames, GENRES } from '../data/games';

const ROLES = { user: 'Пользователь', support: 'Поддержка', admin: 'Администратор' };
const ROLE_COLORS = { user: 'var(--text-faint)', support: '#10B981', admin: '#E8102E' };

// Цветовая палитра для диаграмм
const CHART_COLORS = ['#E8102E', '#9333EA', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];

export default function Admin() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('analytics');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/'); return; }
    Promise.all([
      api.getStats().then(setStats).catch(() => {}),
      api.getUsers().then(setUsers).catch(() => {}),
      api.getAdminOrders().then(setOrders).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [user]);

  async function changeRole(userId, role) {
    try {
      await api.setUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      toast(`Роль изменена на ${ROLES[role]}`, 'success');
    } catch (err) { toast(err.message, 'error'); }
  }

  // ─── Производные данные для графиков ───

  // 1. Выручка по дням (за последние 14 дней, считается из реальных orders)
  const salesByDay = useMemo(() => {
    const days = {};
    const now = new Date();
    // Инициализируем последние 14 дней нулями
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = { date: key, label: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }), revenue: 0, orders: 0 };
    }
    orders.forEach(o => {
      const key = (o.created_at || '').slice(0, 10);
      if (days[key]) {
        days[key].revenue += (o.total || 0);
        days[key].orders += 1;
      }
    });
    return Object.values(days);
  }, [orders]);

  // 2. Продажи по жанрам (какой жанр заказывают чаще)
  const genreSales = useMemo(() => {
    const counts = Object.fromEntries(GENRES.map(g => [g.id, 0]));
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        const g = allGames.find(g => g.id === item.game_id || g.id === item.gameId);
        if (g && counts[g.genre] !== undefined) counts[g.genre] += 1;
      });
    });
    return GENRES.map(g => ({ name: g.name, value: counts[g.id], id: g.id })).filter(x => x.value > 0);
  }, [orders]);

  // 3. Распределение пользователей по ролям
  const userRoles = useMemo(() => {
    const roleCount = { user: 0, support: 0, admin: 0 };
    users.forEach(u => { if (roleCount[u.role] !== undefined) roleCount[u.role]++; });
    return [
      { name: 'Пользователи', value: roleCount.user,    fill: '#6B7280' },
      { name: 'Поддержка',    value: roleCount.support, fill: '#10B981' },
      { name: 'Админы',       value: roleCount.admin,   fill: '#E8102E' },
    ];
  }, [users]);

  // 4. Рост пользовательской базы (накопительный график регистраций по дням)
  const userGrowth = useMemo(() => {
    const sorted = [...users].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    let total = 0;
    return sorted.map(u => {
      total++;
      return {
        date: u.created_at?.slice(0, 10),
        total,
      };
    });
  }, [users]);

  const totalSales = salesByDay.reduce((s, d) => s + d.revenue, 0);
  const avgOrder = orders.length > 0 ? Math.round((stats?.revenue || 0) / orders.length) : 0;

  if (user?.role !== 'admin') return null;
  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <PageTransition>
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14">
          <Reveal>
            <div className="mb-8">
              <span className="label block mb-3">Панель управления</span>
              <h1 className="section-title text-4xl">Администрирование</h1>
            </div>
          </Reveal>

          {/* Stats */}
          {stats && (
            <Reveal delay={0.05}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                {[
                  { icon: Users,         label: 'Пользователи', value: stats.users,                                    color: 'text-blue-400 bg-blue-400/10' },
                  { icon: Gamepad2,      label: 'Игры',         value: stats.games,                                    color: 'text-secondary bg-secondary/10' },
                  { icon: Package,       label: 'Заказы',       value: stats.orders,                                   color: 'text-accent bg-accent/10' },
                  { icon: DollarSign,    label: 'Выручка',      value: `${((stats.revenue || 0) / 1000).toFixed(0)}K ₽`, color: 'text-amber-400 bg-amber-400/10' },
                  { icon: MessageCircle, label: 'Тикеты',       value: stats.tickets,                                  color: 'text-pink-400 bg-pink-400/10' },
                  { icon: Shield,        label: 'Открытые',     value: stats.openTickets,                              color: 'text-primary bg-primary/10' },
                ].map(s => (
                  <div key={s.label} className="glass-static p-4 text-center">
                    <div className={`w-9 h-9 rounded-lg mx-auto mb-2 flex items-center justify-center ${s.color}`}><s.icon size={16} /></div>
                    <p className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
                    <p className="font-body text-[10px]" style={{ color: 'var(--text-faint)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--surface)' }}>
            {[
              { id: 'analytics', label: 'Аналитика',    icon: BarChart3 },
              { id: 'users',     label: 'Пользователи', icon: UserCog   },
              { id: 'orders',    label: 'Заказы',       icon: Package   },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-display font-semibold transition-all"
                style={{
                  background: tab === t.id ? 'var(--bg-elevated)' : 'transparent',
                  color:      tab === t.id ? 'var(--text)'        : 'var(--text-faint)',
                }}
              >
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>

          {/* ═══ ANALYTICS ═══ */}
          {tab === 'analytics' && (
            <div className="space-y-5">

              {/* Revenue chart */}
              <div className="glass-static p-6">
                <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <span className="label block mb-2">За последние 14 дней</span>
                    <h3 className="font-display text-xl font-bold" style={{ color: 'var(--text)' }}>Выручка по дням</h3>
                  </div>
                  <div className="text-right">
                    <p className="price text-2xl">{totalSales.toLocaleString('ru-RU')}&nbsp;₽</p>
                    <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>Всего за период</p>
                  </div>
                </div>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <LineChart data={salesByDay}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E8102E" stopOpacity={0.35}/>
                          <stop offset="100%" stopColor="#E8102E" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#141424', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
                        formatter={(v, name) => [`${Number(v).toLocaleString('ru-RU')} ${name === 'revenue' ? '₽' : ''}`, name === 'revenue' ? 'Выручка' : 'Заказы']}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#E8102E" strokeWidth={2.5} dot={{ fill: '#E8102E', r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Genre sales pie */}
                <div className="glass-static p-6">
                  <span className="label block mb-2">Популярность жанров</span>
                  <h3 className="font-display text-xl font-bold mb-5" style={{ color: 'var(--text)' }}>Продажи по жанрам</h3>
                  {genreSales.length > 0 ? (
                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={genreSales}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            innerRadius={50}
                            paddingAngle={2}
                          >
                            {genreSales.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="rgba(255,255,255,0.04)" />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: '#141424', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
                            formatter={(v) => [`${v} продаж`, '']}
                          />
                          <Legend
                            iconType="circle"
                            wrapperStyle={{ fontSize: 11, fontFamily: 'Exo 2, sans-serif', color: 'rgba(255,255,255,0.6)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center">
                      <p className="font-body text-[13px]" style={{ color: 'var(--text-faint)' }}>Нет данных о продажах</p>
                    </div>
                  )}
                </div>

                {/* User roles */}
                <div className="glass-static p-6">
                  <span className="label block mb-2">База пользователей</span>
                  <h3 className="font-display text-xl font-bold mb-5" style={{ color: 'var(--text)' }}>Роли в системе</h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={userRoles} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                        <Tooltip
                          contentStyle={{ background: '#141424', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
                          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                          formatter={(v) => [`${v} чел.`, '']}
                        />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                          {userRoles.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* User growth */}
              {userGrowth.length > 0 && (
                <div className="glass-static p-6">
                  <span className="label block mb-2">Динамика регистраций</span>
                  <h3 className="font-display text-xl font-bold mb-5" style={{ color: 'var(--text)' }}>Рост базы пользователей</h3>
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <LineChart data={userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: '#141424', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
                          formatter={(v) => [`${v} пользователей`, 'Всего']}
                        />
                        <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 3 }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ USERS ═══ */}
          {tab === 'users' && (
            <div className="glass-static overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      <th className="text-left px-5 py-3 font-display font-semibold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-faint)' }}>ID</th>
                      <th className="text-left px-5 py-3 font-display font-semibold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-faint)' }}>Логин</th>
                      <th className="text-left px-5 py-3 font-display font-semibold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-faint)' }}>Email</th>
                      <th className="text-left px-5 py-3 font-display font-semibold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-faint)' }}>Роль</th>
                      <th className="text-left px-5 py-3 font-display font-semibold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-faint)' }}>Заказы</th>
                      <th className="text-left px-5 py-3 font-display font-semibold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-faint)' }}>Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                        <td className="px-5 py-3 font-mono" style={{ color: 'var(--text-faint)' }}>#{u.id}</td>
                        <td className="px-5 py-3 font-display font-bold" style={{ color: 'var(--text-secondary)' }}>{u.username}</td>
                        <td className="px-5 py-3 font-body" style={{ color: 'var(--text-faint)' }}>{u.email || '—'}</td>
                        <td className="px-5 py-3">
                          <select
                            value={u.role}
                            onChange={e => changeRole(u.id, e.target.value)}
                            className="px-2 py-1 rounded-lg text-[12px] font-display font-semibold cursor-pointer border-none outline-none"
                            style={{ background: 'var(--surface)', color: ROLE_COLORS[u.role] }}
                          >
                            <option value="user">Пользователь</option>
                            <option value="support">Поддержка</option>
                            <option value="admin">Администратор</option>
                          </select>
                        </td>
                        <td className="px-5 py-3 font-display font-semibold" style={{ color: 'var(--text-muted)' }}>{u.order_count}</td>
                        <td className="px-5 py-3 font-body text-[12px]" style={{ color: 'var(--text-faint)' }}>
                          {new Date(u.created_at).toLocaleDateString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ ORDERS ═══ */}
          {tab === 'orders' && (
            <div className="space-y-3">
              {orders.map(o => (
                <div key={o.id} className="glass-static p-5 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Package size={16} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[13px] font-bold" style={{ color: 'var(--text-secondary)' }}>
                      Заказ #{o.id} · <span className="text-primary">@{o.username}</span>
                    </p>
                    <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>
                      {o.items?.map(i => i.name).join(', ')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="price text-[15px]">{o.total?.toLocaleString('ru-RU')}&nbsp;₽</p>
                    <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>
                      {new Date(o.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center py-8 font-body" style={{ color: 'var(--text-faint)' }}>Нет заказов</p>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
