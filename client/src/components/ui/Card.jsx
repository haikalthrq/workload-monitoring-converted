export const Card = ({ 
  children, 
  className = '', 
  title,
  ...props 
}) => {
  // Determine if custom background is provided
  const hasCustomBg = className.includes('bg-');
  const baseClasses = hasCustomBg ? '' : 'bg-white';
  
  return (
    <div 
      className={`${baseClasses} rounded-lg shadow-sm border border-gray-200 ${className}`}
      {...props}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
