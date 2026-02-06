import { useEffect, useState } from 'react';
import api from '../utils/api';
import MemberCard from '../components/MemberCard';
import SpendingPie from '../components/SpendingPie';
import { format } from 'date-fns';

const Dashboard = () => {
  const [balances, setBalances] = useState([]);
  const [itemStats, setItemStats] = useState([]);
  const [recent, setRecent] = useState([]);
  const [settlements, setSettlements] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const [b, i, e, s] = await Promise.all([
        api.get('/expenses/balances'),
        api.get('/expenses/itemstats'),
        api.get('/expenses'),
        api.get('/expenses/settlements')
      ]);
      setBalances(b.data);
      setItemStats(i.data);
      setRecent(e.data.slice(0, 10));
      setSettlements(s.data);
    };
    fetch();
  }, []);

  const totalSpent = balances.reduce((sum, b) => sum + b.totalPaid, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700">Total Spent</h2>
          <p className="text-4xl font-bold text-primary mt-4">₹{totalSpent.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Spending by Item</h2>
          {itemStats.length ? <SpendingPie data={itemStats} /> : <p>No data yet</p>}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Member Balances</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {balances.map(m => <MemberCard key={m.id} member={m} />)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Settlement Suggestions</h2>
        {settlements.length === 0 ? <p className="text-green-600">All settled up! 🎉</p> :
          <ul className="space-y-2">
            {settlements.map((s, i) => (
              <li key={i} className="text-lg">
                <strong>{s.fromName}</strong> → <strong>{s.toName}</strong>: ₹{s.amount.toFixed(2)}
              </li>
            ))}
          </ul>
        }
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Recent Expenses</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b">
              <tr>
                <th className="py-2">Date</th>
                <th>Payer</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(exp => (
                <tr key={exp._id} className="border-b">
                  <td>{format(new Date(exp.date), 'dd/MM/yyyy')}</td>
                  <td>{exp.payer.name}</td>
                  <td>{exp.item.name}</td>
                  <td>{exp.quantity}</td>
                  <td>₹{exp.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
