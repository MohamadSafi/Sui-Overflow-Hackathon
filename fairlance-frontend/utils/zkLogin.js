import {
  generateEphemeralKeyPair,
  getExtendedEphemeralPublicKey,
  getZKProof,
  jwtToAddress,
  getZkLoginSignature,
} from "@mysten/zklogin";
import jwt_decode from "jwt-decode";

const fetchDWalletAddress = async (userSalt) => {
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

export const handleZkLoginAndDWallet = async (jwtToken) => {
  try {
    const { privateKey, publicKey } = generateEphemeralKeyPair();
    const decodedJwt = jwt_decode(jwtToken);
    let userSalt = localStorage.getItem("userSalt");

    if (!userSalt) {
      userSalt = crypto.randomUUID(); // Generate a unique salt
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

    console.log("User Sui Address:", zkLoginUserAddress);
    console.log("zkLogin Signature:", zkLoginSignature);
    console.log("dWallet Address:", dWalletAddress);

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
