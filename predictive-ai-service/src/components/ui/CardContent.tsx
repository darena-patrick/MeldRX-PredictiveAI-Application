import { ReactNode } from "react";

export const Card = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`card bg-base-100 shadow-xl p-4 rounded-2xl ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children }: { children: ReactNode }) => (
  <div className="card-body">{children}</div>
);
