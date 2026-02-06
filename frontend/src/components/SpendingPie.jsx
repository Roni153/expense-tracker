import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#2563EB', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const SpendingPie = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        dataKey="totalSpent"
        nameKey="item"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label={({ item, totalSpent }) => `${item}: ₹${totalSpent.toFixed(0)}`}
      >
        {data.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
      </Pie>
      <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);

export default SpendingPie;
