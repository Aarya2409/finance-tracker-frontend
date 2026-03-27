import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { PaginatedTransactions, Category } from '../types/index';

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [form, setForm] = useState({
    amount: '',
    type: 'INCOME',
    description: '',
    categoryId: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', typeFilter],
    queryFn: () => api.get(`/transactions${typeFilter ? `?type=${typeFilter}` : ''}`)
      .then(r => r.data.data as PaginatedTransactions),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data as Category[]),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/transactions', {
      ...data,
      amount: parseFloat(data.amount),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setShowForm(false);
      setForm({ amount: '', type: 'INCOME', description: '', categoryId: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 mt-1">Manage your income and expenses</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition"
        >
          {showForm ? 'Cancel' : '+ Add Transaction'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Transaction</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Monthly salary"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              >
                <option value="">Select category</option>
                {categoriesData?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => createMutation.mutate(form)}
            disabled={createMutation.isPending || !form.description || !form.amount || !form.categoryId}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition"
          >
            {createMutation.isPending ? 'Adding...' : 'Add Transaction'}
          </button>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {['', 'INCOME', 'EXPENSE'].map(f => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              typeFilter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === '' ? 'All' : f === 'INCOME' ? 'Income' : 'Expenses'}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
          </div>
        ) : data?.transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <span className="text-4xl mb-2">💸</span>
            <p className="text-sm">No transactions found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Description', 'Category', 'Type', 'Amount', 'Date', ''].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        tx.type === 'INCOME' ? 'bg-indigo-50' : 'bg-rose-50'
                      }`}>
                        {tx.type === 'INCOME' ? '📈' : '📉'}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{tx.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{tx.category.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                      tx.type === 'INCOME'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${
                      tx.type === 'INCOME' ? 'text-indigo-600' : 'text-rose-500'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-400">
                      {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteMutation.mutate(tx.id)}
                      className="text-gray-400 hover:text-rose-500 transition text-lg"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Total count */}
      {data && (
        <p className="text-sm text-gray-400 text-right">
          Showing {data.transactions.length} of {data.total} transactions
        </p>
      )}
    </div>
  );
}