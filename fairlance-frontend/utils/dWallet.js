import axios from "axios";

// Fetch dWallet address using user salt
export const fetchDWalletAddress = async (userSalt) => {
  const response = await fetch("https://api.dwallet.io/get-address", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ salt: userSalt }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dWallet address");
  }

  const data = await response.json();
  return data.address;
};

// Handle zkLogin and dWallet integration
export const handleZkLoginAndDWallet = async (jwtToken) => {
  try {
    const { privateKey, publicKey } = generateEphemeralKeyPair();
    const decodedJwt = jwt_decode(jwtToken);
    let userSalt = localStorage.getItem("userSalt");

    if (!userSalt) {
      userSalt = crypto.randomUUID();
      localStorage.setItem("userSalt", userSalt);
    }

    const zkLoginUserAddress = jwtToAddress(jwtToken, userSalt);
    const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(publicKey);
    const zkProof = await getZKProof(
      jwtToken,
      extendedEphemeralPublicKey,
      userSalt
    );
    const zkLoginSignature = getZkLoginSignature({
      jwt: jwtToken,
      ephemeralKeyPair: { privateKey, publicKey },
      zkProof,
      userSalt,
    });

    const dWalletAddress = await fetchDWalletAddress(userSalt);

    return {
      zkLoginUserAddress,
      dWalletAddress,
      decodedJwt,
    };
  } catch (error) {
    console.error("Error during zkLogin and dWallet integration:", error);
    throw error;
  }
};
