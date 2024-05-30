"use client";

import { WalletKitProvider } from "@mysten/wallet-kit";

import { Toaster } from "react-hot-toast";

export default function GlobalContexts({ children }) {
  return (
    <WalletKitProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            border: "1px solid #713200",
            color: "#713200",
          },
        }}
      />

      <main className="flex flex-col justify-between items-center p-24 min-h-screen">
        {children}
      </main>
    </WalletKitProvider>
  );
}
