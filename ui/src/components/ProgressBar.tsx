interface ProgressBarProps {
  percentage: number;
  label?: string;
  votes?: number;
}

export default function ProgressBar({ percentage, label, votes }: ProgressBarProps) {
  return (
    <div className="space-y-1">
      {(label || votes !== undefined) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium">{label}</span>}
          {votes !== undefined && (
            <span className="text-muted-foreground">
              {votes} votes ({percentage}%)
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}