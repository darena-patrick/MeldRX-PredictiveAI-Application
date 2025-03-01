"use client";

import { store } from "@/app/redux/store";
import { ReactNode } from "react";
import { Provider } from "react-redux";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return <Provider store={store}>{children}</Provider>;
}
