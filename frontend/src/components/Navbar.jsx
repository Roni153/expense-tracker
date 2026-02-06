import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">ExpenseTracker</Link>
        <div className="flex gap-6 items-center">
          <Link to="/" className="hover:text-primary">Dashboard</Link>
          <Link to="/members" className="hover:text-primary">Members</Link>
          <Link to="/expenses" className="hover:text-primary">Expenses</Link>
          <Link to="/balances" className="hover:text-primary">Balances</Link>
          <div className="flex items-center gap-3">
            <span>{user.name}</span>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-red-600">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
