const MemberCard = ({ member }) => (
  <div className="bg-white rounded-lg shadow p-6 text-center">
    <img
      src={member.photo || 'https://via.placeholder.com/80'}
      alt={member.name}
      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
    />
    <h3 className="font-bold text-lg">{member.name}</h3>
    <p className="text-gray-600 mt-2">Paid: ₹{member.totalPaid?.toFixed(2) || '0.00'}</p>
    <p className={`mt-2 font-semibold ${member.balance > 0 ? 'text-green-600' : member.balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
      {member.balance > 0 ? `+₹${member.balance.toFixed(2)}` : member.balance < 0 ? `-₹${Math.abs(member.balance).toFixed(2)}` : '₹0.00'}
    </p>
  </div>
);

export default MemberCard;
