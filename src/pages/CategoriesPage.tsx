import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Category } from '../types/index';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data as Category[]),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => api.post('/categories', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewName('');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to create category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const handleCreate = () => {
    if (!newName.trim()) {
      setError('Category name is required');
      return;
    }
    createMutation.mutate(newName.trim());
  };

  const colors = [
    'bg-indigo-50 text-indigo-700',
    'bg-rose-50 text-rose-700',
    'bg-emerald-50 text-emerald-700',
    'bg-amber-50 text-amber-700',
    'bg-purple-50 text-purple-700',
    'bg-cyan-50 text-cyan-700',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-500 mt-1">Organise your transactions by category</p>
      </div>

      {/* Add Category */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Category</h2>
        <div className="flex gap-3">
          <input
            value={newName}
            onChange={e => { setNewName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="e.g. Groceries, Rent, Salary..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
          />
          <button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-6 py-3 rounded-xl font-medium text-sm transition whitespace-nowrap"
          >
            {createMutation.isPending ? 'Adding...' : '+ Add'}
          </button>
        </div>
        {error && (
          <p className="text-rose-500 text-sm mt-2">{error}</p>
        )}
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
        </div>
      ) : categories?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center h-40 text-gray-400">
          <span className="text-4xl mb-2">🏷️</span>
          <p className="text-sm">No categories yet — add one above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((cat, i) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm ${colors[i % colors.length]}`}>
                  {cat.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-900">{cat.name}</span>
              </div>
              <button
                onClick={() => deleteMutation.mutate(cat.id)}
                disabled={deleteMutation.isPending}
                className="text-gray-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100 text-lg"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Count */}
      {categories && categories.length > 0 && (
        <p className="text-sm text-gray-400">
          {categories.length} {categories.length === 1 ? 'category' : 'categories'} total
        </p>
      )}
    </div>
  );
}