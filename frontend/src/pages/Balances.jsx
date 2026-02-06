// frontend/src/pages/Balances.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';
import MemberCard from '../components/MemberCard';

const Balances = () => {
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balRes, setRes] = await Promise.all([
          api.get('/expenses/balances'),
          api.get('/expenses/settlements'),
        ]);
        setBalances(balRes.data);
        setSettlements(setRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading balances...</div>;

  const totalOwed = balances.reduce((sum, b) => sum + (b.balance > 0 ? b.balance : 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Balances & Settlements</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Member Balances */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Member Balances</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {balances.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* Settlement Suggestions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Who Owes Whom</h2>
          {settlements.length === 0 ? (
            <p className="text-green-600 text-lg font-medium">Everything is settled! 🎉</p>
          ) : (
            <div className="space-y-4">
              {settlements.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-semibold">{s.fromName}</span>
                    <span className="mx-2">→</span>
                    <span className="font-semibold">{s.toName}</span>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    ₹{s.amount.toFixed(2)}
                  </span>
                </div>
              ))}
              <p className="text-sm text-gray-500 mt-4">
                Total to be transferred: ₹{totalOwed.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Balances;
