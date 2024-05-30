import { SuiClient } from "@mysten/sui.js/client";

export const useSui = () => {
  const FULL_NODE = process.env.NEXT_PUBLIC_SUI_NETWORK;

  const suiClient = new SuiClient({ url: FULL_NODE });

  const executeSignedTransactionBlock = async ({
    signedTx,
    requestType,
    options,
  }) => {
    return suiClient.executeTransactionBlock({
      transactionBlock: signedTx.transactionBlockBytes,
      signature: signedTx.signature,
      requestType,
      ...(options && { options }),
    });
  };

  return { executeSignedTransactionBlock, suiClient };
};