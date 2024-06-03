import { SuiClient } from "@mysten/sui.js/client";

export const useSui = () => {
  const FULL_NODE = process.env.NEXT_PUBLIC_SUI_NETWORK;

  console.log("Connecting to Sui full node at:", FULL_NODE);

  const suiClient = new SuiClient({ url: FULL_NODE });

  const executeSignedTransactionBlock = async ({
    signedTx,
    requestType,
    options,
  }) => {
    try {
      return await suiClient.executeTransactionBlock({
        transactionBlock: signedTx.transactionBlockBytes,
        signature: signedTx.signature,
        requestType,
        ...(options && { options }),
      });
    } catch (error) {
      console.error("Failed to execute signed transaction block:", error);
      throw error;
    }
  };

  const getEpoch = async () => {
    try {
      const response = await fetch(FULL_NODE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "sui_getEpoch",
          params: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.result.epoch;
    } catch (error) {
      console.error("Failed to fetch epoch, using mock epoch:", error);
      return "12345";
    }
  };

  return { executeSignedTransactionBlock, getEpoch, suiClient };
};
