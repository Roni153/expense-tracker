// frontend/src/pages/Expenses.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const Expenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    payerId: user.id || '',
    itemId: '',
    newItemName: '',
    newItemUnit: '',
    quantity: 1,
    amount: '',
    splitType: 'equal',
    splits: {}, // for custom: { userId: amount }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, itemRes, memRes] = await Promise.all([
          api.get('/expenses'),
          api.get('/items'),
          api.get('/users'),
        ]);
        setExpenses(expRes.data);
        setItems(itemRes.data);
        setMembers(memRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        date: form.date,
        payerId: form.payerId,
        amount: Number(form.amount),
        quantity: Number(form.quantity),
        splitType: form.splitType,
      };

      if (form.itemId) {
        payload.itemId = form.itemId;
      } else if (form.newItemName) {
        payload.newItemName = form.newItemName;
        payload.newItemUnit = form.newItemUnit;
      } else {
        alert('Select or add an item');
        return;
      }

      if (form.splitType === 'custom') {
        payload.splits = form.splits;
      }

      await api.post('/expenses', payload);
      // Refresh list
      const res = await api.get('/expenses');
      setExpenses(res.data);
      // Reset form
      setForm({
        ...form,
        itemId: '',
        newItemName: '',
        newItemUnit: '',
        amount: '',
        quantity: 1,
        splits: {},
      });
    } catch (err) {
      alert('Error adding expense: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCustomSplitChange = (memberId, value) => {
    setForm({
      ...form,
      splits: { ...form.splits, [memberId]: Number(value) || 0 },
    });
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Expenses</h1>

      {/* Add Expense Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payer</label>
            <select
              value={form.payerId}
              onChange={(e) => setForm({ ...form, payerId: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Item</label>
            <select
              value={form.itemId}
              onChange={(e) => setForm({ ...form, itemId: e.target.value, newItemName: '' })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">-- Select or add new --</option>
              {items.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} {item.unit ? `(${item.unit})` : ''}
                </option>
              ))}
            </select>
          </div>

          {!form.itemId && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">New Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Milk"
                  value={form.newItemName}
                  onChange={(e) => setForm({ ...form, newItemName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. liter, kg"
                  value={form.newItemUnit}
                  onChange={(e) => setForm({ ...form, newItemUnit: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Total Amount</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Split Type</label>
            <select
              value={form.splitType}
              onChange={(e) => setForm({ ...form, splitType: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="equal">Equal Split</option>
              <option value="custom">Custom Split</option>
            </select>
          </div>
        </div>

        {form.splitType === 'custom' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Custom Shares</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((m) => (
                <div key={m._id} className="flex items-center gap-3">
                  <span className="flex-1">{m.name}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.splits[m._id] || ''}
                    onChange={(e) => handleCustomSplitChange(m._id, e.target.value)}
                    className="w-32 px-3 py-2 border rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Add Expense
        </button>
      </form>

      {/* Expense List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((exp) => (
                <tr key={exp._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{format(new Date(exp.date), 'dd/MM/yyyy')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{exp.payer?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{exp.item?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{exp.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">₹{exp.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
