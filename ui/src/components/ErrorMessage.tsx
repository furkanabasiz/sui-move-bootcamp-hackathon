import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  retry?: () => void;
}

export default function ErrorMessage({ title, message, retry }: ErrorMessageProps) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {title && <h4 className="font-semibold text-red-900 mb-1">{title}</h4>}
          <p className="text-sm text-red-700">{message}</p>
          {retry && (
            <button
              onClick={retry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}