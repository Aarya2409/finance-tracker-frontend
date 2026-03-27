import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../lib/api';
import type { Stats, PaginatedTransactions } from '../types/index';

function StatCard({ label, amount, color }: { label: string; amount: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>
        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/transactions/stats').then(r => r.data.data as Stats),
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => api.get('/transactions?limit=5').then(r => r.data.data as PaginatedTransactions),
  });

  const chartData = statsData ? [
    { name: 'Income', amount: statsData.totalIncome, color: '#6366f1' },
    { name: 'Expenses', amount: statsData.totalExpense, color: '#f43f5e' },
    { name: 'Balance', amount: statsData.balance, color: '#10b981' },
  ] : [];

  if (statsLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Your financial overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Income" amount={statsData?.totalIncome ?? 0} color="text-indigo-600" />
        <StatCard label="Total Expenses" amount={statsData?.totalExpense ?? 0} color="text-rose-500" />
        <StatCard
          label="Balance"
          amount={statsData?.balance ?? 0}
          color={(statsData?.balance ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-500'}
        />
      </div>

      {/* Chart + Recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Overview</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 13 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(v) => `$${v.toLocaleString()}`} />
              {/* <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
              /> */}
              <Tooltip
  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
/>
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          {txLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
            </div>
          ) : txData?.transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <span className="text-4xl mb-2">💸</span>
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {txData?.transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      tx.type === 'INCOME' ? 'bg-indigo-50' : 'bg-rose-50'
                    }`}>
                      {tx.type === 'INCOME' ? '📈' : '📉'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                      <p className="text-xs text-gray-400">{tx.category.name}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${
                    tx.type === 'INCOME' ? 'text-indigo-600' : 'text-rose-500'
                  }`}>
                    {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Transactions', value: statsData?.transactionCount ?? 0, suffix: '' },
          { label: 'Income Entries', value: statsData?.incomeCount ?? 0, suffix: '' },
          { label: 'Expense Entries', value: statsData?.expenseCount ?? 0, suffix: '' },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <p className="text-3xl font-bold text-gray-900">{item.value}{item.suffix}</p>
            <p className="text-sm text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}