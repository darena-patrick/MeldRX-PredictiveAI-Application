type ProgressProps = {
  value: number; // 0 to 100
  className?: string;
};

export const Progress = ({ value, className = "" }: ProgressProps) => (
  <progress
    className={`progress progress-primary w-full h-4 ${className}`}
    value={value}
    max={100}
  ></progress>
);
