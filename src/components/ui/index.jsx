/* KeyAuth v4 shared primitives */

/* Stat Card */
export function StatCard({ icon: Icon, label, value, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-700/10 text-blue-400 border-blue-700/20',
    green: 'bg-green-800/30 text-green-300 border-green-700/30',
    yellow: 'bg-orange-800/30 text-orange-300 border-orange-700/30',
    red: 'bg-red-800/30 text-red-300 border-red-700/30',
  };
  return (
    <div className="bg-custom-back rounded-xl p-5 flex items-center gap-4 border border-[#1a1a1a]">
      <div className={`p-3 rounded-lg border ${colors[color] || colors.blue}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-semibold text-white mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  );
}

/* Badge */
export function Badge({ children, color = 'gray' }) {
  const map = {
    green: 'bg-green-800 text-green-100',
    red: 'bg-red-800 text-red-100',
    yellow: 'bg-orange-800 text-orange-100',
    blue: 'bg-blue-800 text-blue-100',
    gray: 'bg-gray-700 text-gray-100',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${map[color]}`}>
      {children}
    </span>
  );
}

/* Button */
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, className = '', type = 'button' }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };
  const variants = {
    primary: 'bg-blue-700 hover:opacity-50 text-white',
    secondary: 'bg-custom-back-1 hover:bg-[#1f1f1f] text-white border border-[#1a1a1a]',
    danger: 'bg-red-700 hover:opacity-50 text-white',
    warning: 'bg-orange-500 hover:opacity-50 text-white',
    success: 'bg-green-700 hover:opacity-50 text-white',
    ghost: 'text-gray-400 hover:text-white'
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

/* Input */
export function Input({ label, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm text-gray-400 mb-1.5">{label}</label>}
      <input
        {...props}
        className="w-full bg-custom-back-1 border border-[#1a1a1a] rounded-lg px-2.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-blue-600 transition-colors"
      />
    </div>
  );
}

/* Select */
export function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm text-gray-400 mb-1.5">{label}</label>}
      <select
        {...props}
        className="w-full bg-custom-back-1 border border-[#1a1a1a] rounded-lg px-2.5 py-2.5 text-sm text-white focus:outline-none focus:ring-0 focus:border-blue-600 transition-colors"
      >
        {children}
      </select>
    </div>
  );
}

/* Modal */
export function Modal({ title, children, onClose, open }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-custom-back-1 border border-[#1a1a1a] rounded-xl w-full max-w-lg shadow-lg">
        <div className="flex items-center justify-between px-6 pt-6">
          <h3 className="text-white text-xl font-medium">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:opacity-60 text-xl leading-none transition duration-200">&times;</button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

/* Table */
export function Table({ headers, children, empty = 'No records found.' }) {
  return (
    <div className="bg-custom-back rounded-xl overflow-x-auto">
      <table className="w-full text-sm text-left text-white">
        <thead>
          <tr className="text-blue-700 border-b border-[#121212]">
            {headers.map((h) => (
              <th key={h} className="px-6 py-3 font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1a1a1a]">
          {children}
        </tbody>
      </table>
    </div>
  );
}

/* Section Header — KeyAuth v4 page header card */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 p-8 bg-custom-back rounded-lg">
      <div>
        <h1 className="text-xl font-semibold text-white sm:text-2xl">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

/* Copy to clipboard helper */
export function CopyText({ text }) {
  const copy = () => { navigator.clipboard.writeText(text); };
  return (
    <span
      onClick={copy}
      className="font-mono text-xs bg-custom-back-1 px-2 py-1 rounded cursor-pointer hover:opacity-60 text-gray-300"
      title="Click to copy"
    >
      {text}
    </span>
  );
}
