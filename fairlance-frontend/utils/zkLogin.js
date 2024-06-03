import {
  generateEphemeralKeyPair,
  getExtendedEphemeralPublicKey,
  getZKProof,
  jwtToAddress,
  getZkLoginSignature,
} from "@mysten/zklogin";
import { decode } from "jwt-js-decode";
import axios from "axios";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { Buffer } from "buffer";

// Generate and store an ephemeral key pair
export function generateAndStoreEphemeralKeyPair() {
  const keypair = generateEphemeralKeyPair();
  const truncatedPrivateKey = keypair.privateKey.slice(0, 32);
  const ephemeralPrivateKeyBase64 =
    Buffer.from(truncatedPrivateKey).toString("base64");
  const ephemeralPublicKeyBase64 = Buffer.from(keypair.publicKey).toString(
    "base64"
  );

  localStorage.setItem(
    "userKeyData",
    JSON.stringify({
      ephemeralPrivateKey: ephemeralPrivateKeyBase64,
      ephemeralPublicKey: ephemeralPublicKeyBase64,
    })
  );
}

// Ensure that an ephemeral key pair exists
export function ensureEphemeralKeyPair() {
  const userKeyData = localStorage.getItem("userKeyData");
  if (!userKeyData) {
    generateAndStoreEphemeralKeyPair();
  }
}

// Retrieve the ephemeral key pair from localStorage
export function getEphemeralKeyPair() {
  const userKeyData = JSON.parse(localStorage.getItem("userKeyData"));
  if (!userKeyData) {
    throw new Error("userKeyData is missing from localStorage");
  }

  const ephemeralPrivateKeyBase64 = userKeyData.ephemeralPrivateKey;
  let ephemeralKeyPairArray = Uint8Array.from(
    Buffer.from(ephemeralPrivateKeyBase64, "base64")
  );
  if (ephemeralKeyPairArray.length !== 32) {
    ephemeralKeyPairArray = ephemeralKeyPairArray.slice(0, 32);
  }

  return Ed25519Keypair.fromSecretKey(ephemeralKeyPairArray);
}

// Get the salt for a given subject
export async function getSalt(subject, jwtEncoded) {
  const getSaltRequest = { subject, jwt: jwtEncoded };
  const response = await axios.post("/api/userinfo/get/salt", getSaltRequest);
  if (response?.data.status === 200) {
    return response.data.salt;
  } else {
    throw new Error("Failed to get salt");
  }
}

// Fetch the zk proof
export async function getZkProof(jwtEncoded, userSalt) {
  const decodedJwt = decode(jwtEncoded);
  const { userKeyData, ephemeralKeyPair } = getEphemeralKeyPair();
  const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(
    ephemeralKeyPair.publicKey
  );

  const zkProof = await getZKProof(
    jwtEncoded,
    extendedEphemeralPublicKey,
    userSalt
  );

  const zkLoginSignature = getZkLoginSignature({
    jwt: jwtEncoded,
    ephemeralKeyPair: {
      privateKey: ephemeralKeyPair.privateKey,
      publicKey: ephemeralKeyPair.publicKey,
    },
    zkProof,
    userSalt,
  });

  return { zkProof, zkLoginSignature };
}
