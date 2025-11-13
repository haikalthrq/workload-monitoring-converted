export const Badge = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-700 border border-green-200',
    warning: 'bg-orange-100 text-orange-700 border border-orange-200',
    danger: 'bg-red-100 text-red-700 border border-red-200',
    info: 'bg-blue-100 text-blue-700 border border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border border-purple-200',
    pink: 'bg-pink-100 text-pink-700 border border-pink-200',
    cyan: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
    indigo: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
