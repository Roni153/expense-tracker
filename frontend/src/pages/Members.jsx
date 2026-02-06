// frontend/src/pages/Members.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import MemberCard from '../components/MemberCard';

const Members = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '', photo: '' });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/users');
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', newMember);
      setNewMember({ name: '', email: '', password: '', photo: '' });
      setShowForm(false);
      fetchMembers();
    } catch (err) {
      alert('Failed to add member: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchMembers();
    } catch (err) {
      alert('Cannot delete: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  if (loading) return <div className="p-8 text-center">Loading members...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Members</h1>
        {user.isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add Member'}
          </button>
        )}
      </div>

      {showForm && user.isAdmin && (
        <form onSubmit={handleAddMember} className="bg-white rounded-lg shadow p-6 mb-8 space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            required
            className="w-full px-4 py-3 border rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            value={newMember.email}
            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            required
            className="w-full px-4 py-3 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={newMember.password}
            onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
            required
            className="w-full px-4 py-3 border rounded-lg"
          />
          <input
            type="url"
            placeholder="Photo URL (optional)"
            value={newMember.photo}
            onChange={(e) => setNewMember({ ...newMember, photo: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg"
          />
          <button
            type="submit"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Add Member
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {members.map((member) => (
          <div key={member._id} className="relative">
            <MemberCard member={member} />
            {user.isAdmin && member._id !== user.id && (
              <button
                onClick={() => handleDelete(member._id)}
                className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm hover:bg-red-700"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Members;
