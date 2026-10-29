/* KeyAuth v4 modal + tooltip primitives shared by dashboard pages */
import { Info } from 'lucide-react';

export const KA_INPUT =
  'block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-custom-back-1 rounded-lg border border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors';

export const KA_SELECT =
  'px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-custom-back-1 rounded-lg border border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors';

export const KA_FILTER_SELECT =
  'px-3 py-2 rounded-md bg-custom-back-1 text-white text-sm border border-custom-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors';

export const KA_CHECK =
  'appearance-none w-4 h-4 rounded border border-custom bg-custom-back-1 checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer';

export const KA_UNITS = [
  { value: 1, label: 'Seconds' },
  { value: 60, label: 'Minutes' },
  { value: 3600, label: 'Hours' },
  { value: 86400, label: 'Days' },
  { value: 604800, label: 'Weeks' },
  { value: 2629743, label: 'Months' },
  { value: 31556926, label: 'Years' },
  { value: 315569260, label: 'Lifetime' }
];

export const unitToDays = (duration, unit) => {
  const d = Number(duration) || 0;
  if (!d) return 0;
  if (Number(unit) === 315569260) return 36500;
  return Math.max(1, Math.round((d * Number(unit)) / 86400));
};

export function Tip({ children, side = 'bottom' }) {
  const pos = side === 'left'
    ? 'right-full mr-2 top-1/2 -translate-y-1/2'
    : 'top-full mt-2 left-1/2 -translate-x-1/2';
  return (
    <span
      role="tooltip"
      className={`pointer-events-none absolute ${pos} whitespace-nowrap px-2 py-1 text-xs font-medium text-white bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999]`}
    >
      {children}
    </span>
  );
}

export function InfoTip({ text }) {
  return (
    <div className="relative group shrink-0 ml-2">
      <Info size={16} className="text-blue-500 group-hover:text-blue-400 cursor-pointer transition-colors" />
      <div className="absolute z-20 bottom-full right-0 mb-1 hidden group-hover:block w-max max-w-xs">
        <div className="relative bg-custom-back-1 text-white text-xs rounded px-2 py-1 shadow-lg">
          {text}
          <div className="absolute -bottom-1 right-2 w-2 h-2 bg-custom-back-1 rotate-45" />
        </div>
      </div>
    </div>
  );
}

export function KaModal({ title, icon, onClose, children, maxWidth = 'max-w-md' }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className={`relative w-full ${maxWidth} transform overflow-hidden rounded-lg bg-custom-back shadow-xl`}>
          <div className="flex items-center justify-between p-6 pb-4 -ml-3">
            <div className="flex items-center space-x-3">
              {icon}
              <h3 className="text-lg font-semibold text-gray-300">{title}</h3>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function ModalFooter({ onCancel, submitLabel, danger = false, warning = false, success = false, disabled = false }) {
  const color = danger
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    : warning
      ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
      : success
        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
  return (
    <div className="bg-custom-back-1 px-6 py-4">
      <div className="flex space-x-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={disabled}
          className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
