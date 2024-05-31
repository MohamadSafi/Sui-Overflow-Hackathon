// components/Home.js
"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import * as jwtJsDecode from "jwt-js-decode";
import { decode } from "jwt-js-decode";
import axios from "axios";
import { toBigIntBE } from "bigint-buffer";
import { fromB64, toB64 } from "@mysten/bcs";
import {
  genAddressSeed,
  getZkLoginSignature,
  jwtToAddress,
} from "@mysten/zklogin";
import { useSui } from "../../hooks/useSui";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Blocks } from "react-loader-spinner";
import { toast } from "react-hot-toast";
import { Buffer } from "buffer";
import { Box, Flex, Text, Button, Select, VStack } from "@chakra-ui/react";
import Navbar from "../../components/Navbars/navbar";
import RoleSelectionModal from "../../components/Custom/RoleModal";

const Home = () => {
  const [error, setError] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [txDigest, setTxDigest] = useState(null);
  const [jwtEncoded, setJwtEncoded] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [subjectID, setSubjectID] = useState(null);
  const [zkProof, setZkProof] = useState(null);
  const [userSalt, setUserSalt] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  const { suiClient } = useSui();
  const MINIMUM_BALANCE = 0.003;

  function generateAndStoreEphemeralKeyPair() {
    const keypair = Ed25519Keypair.generate();
    const ephemeralPrivateKey = keypair.secretKey;
    const ephemeralPublicKey = keypair.publicKey;

    // Store only the first 32 bytes of the private key
    const truncatedPrivateKey = ephemeralPrivateKey.slice(0, 32);

    const ephemeralPrivateKeyBase64 =
      Buffer.from(truncatedPrivateKey).toString("base64");
    const ephemeralPublicKeyBase64 =
      Buffer.from(ephemeralPublicKey).toString("base64");

    localStorage.setItem(
      "userKeyData",
      JSON.stringify({
        ephemeralPrivateKey: ephemeralPrivateKeyBase64,
        ephemeralPublicKey: ephemeralPublicKeyBase64,
      })
    );
  }

  function ensureEphemeralKeyPair() {
    const userKeyData = localStorage.getItem("userKeyData");
    if (!userKeyData) {
      console.log(
        "No userKeyData found in localStorage. Generating new keypair."
      );
      generateAndStoreEphemeralKeyPair();
    }
  }

  function getEphemeralKeyPair() {
    const userKeyData = JSON.parse(localStorage.getItem("userKeyData"));

    if (!userKeyData) {
      throw new Error("userKeyData is missing from localStorage");
    }

    const ephemeralPrivateKeyBase64 = userKeyData.ephemeralPrivateKey;

    // Log the retrieved base64 key

    // Convert the base64 key back to a Uint8Array
    let ephemeralKeyPairArray = Uint8Array.from(
      Buffer.from(ephemeralPrivateKeyBase64, "base64")
    );

    // Ensure the secret key is 32 bytes
    if (ephemeralKeyPairArray.length !== 32) {
      ephemeralKeyPairArray = ephemeralKeyPairArray.slice(0, 32);
    }

    const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(
      ephemeralKeyPairArray
    );
    return { userKeyData, ephemeralKeyPair };
  }

  async function getSalt(subject, jwtEncoded) {
    const getSaltRequest = { subject, jwt: jwtEncoded };

    const response = await axios.post("/api/userinfo/get/salt", getSaltRequest);
    if (response?.data.status == 200) {
      return response.data.salt;
    } else {
      return null;
    }
  }

  function printUsefulInfo(decodedJwt, userKeyData) {
    console.log("iat  = " + decodedJwt.iat);
    console.log("iss  = " + decodedJwt.iss);
    console.log("sub = " + decodedJwt.sub);
    console.log("aud = " + decodedJwt.aud);
    console.log("exp = " + decodedJwt.exp);
    console.log("nonce = " + decodedJwt.nonce);
    console.log("ephemeralPublicKey b64 =", userKeyData.ephemeralPublicKey);
  }

  async function getZkProof(forceUpdate = false) {
    setError(null);
    setTransactionInProgress(true);
    const decodedJwt = decode(jwtEncoded);
    const { userKeyData, ephemeralKeyPair } = getEphemeralKeyPair();

    printUsefulInfo(decodedJwt, userKeyData);

    const ephemeralPublicKeyArray = fromB64(userKeyData.ephemeralPublicKey);

    const zkpPayload = {
      jwt: jwtEncoded,
      extendedEphemeralPublicKey: toBigIntBE(
        Buffer.from(ephemeralPublicKeyArray)
      ).toString(),
      jwtRandomness: userKeyData.randomness,
      maxEpoch: userKeyData.maxEpoch,
      salt: userSalt,
      keyClaimName: "sub",
    };
    const ZKPRequest = {
      zkpPayload,
      forceUpdate,
    };
    setPublicKey(zkpPayload.extendedEphemeralPublicKey);

    const proofResponse = await axios.post("/api/zkp/get", ZKPRequest);

    if (!proofResponse?.data?.zkp) {
      createRuntimeError(
        "Error getting Zero Knowledge Proof. Please check that Prover Service is running."
      );
      return;
    }

    setZkProof(proofResponse.data.zkp);
    setTransactionInProgress(false);
  }

  async function checkIfAddressHasBalance(address) {
    const coins = await suiClient.getCoins({
      owner: address,
    });
    let totalBalance = 0;
    for (const coin of coins.data) {
      totalBalance += parseInt(coin.balance);
    }
    totalBalance = totalBalance / 1000000000;
    setUserBalance(totalBalance);
    return enoughBalance(totalBalance);
  }

  function enoughBalance(userBalance) {
    return userBalance > MINIMUM_BALANCE;
  }

  function getTestnetAdminSecretKey() {
    return process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY;
  }

  async function giveSomeTestCoins(address) {
    setError(null);
    setTransactionInProgress(true);
    const adminPrivateKey = getTestnetAdminSecretKey();
    if (!adminPrivateKey) {
      createRuntimeError(
        "Admin Secret Key not found. Please set NEXT_PUBLIC_ADMIN_SECRET_KEY environment variable."
      );
      return;
    }
    let adminPrivateKeyArray = Uint8Array.from(
      Array.from(fromB64(adminPrivateKey))
    );
    const adminKeypair = Ed25519Keypair.fromSecretKey(
      adminPrivateKeyArray.slice(1)
    );
    const tx = new TransactionBlock();
    const giftCoin = tx.splitCoins(tx.gas, [tx.pure(30000000)]);

    tx.transferObjects([giftCoin], tx.pure(address));

    const res = await suiClient.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      signer: adminKeypair,
      requestType: "WaitForLocalExecution",
      options: {
        showEffects: true,
      },
    });
    const status = res?.effects?.status?.status;
    if (status === "success") {
      checkIfAddressHasBalance(address);
      setTransactionInProgress(false);
    }
    if (status == "failure") {
      createRuntimeError("Gift Coin transfer Failed. Error = " + res?.effects);
    }
  }

  async function loadRequiredData(encodedJwt) {
    const decodedJwt = decode(encodedJwt);
    const subjectId = decodedJwt.payload.sub;

    setUserProfile({
      name: decodedJwt.payload.name,
      email: decodedJwt.payload.email,
      picture: decodedJwt.payload.picture,
    });

    setSubjectID(subjectId);
    const userSalt = await getSalt(subjectId, encodedJwt);
    if (!userSalt) {
      createRuntimeError("Error getting userSalt");
      return;
    }

    const address = jwtToAddress(encodedJwt, BigInt(userSalt));

    setUserAddress(address);
    setUserSalt(userSalt);
    const hasEnoughBalance = await checkIfAddressHasBalance(address);
    if (!hasEnoughBalance) {
      await giveSomeTestCoins(address);
      // toast("As simple as that, You are now a part of us!", {
      //   icon: "🥳",
      //   duration: 3000,
      //   style: {
      //     borderRadius: "20px",
      //     background: "#5046e4",
      //     color: "#fff",
      //     border: 0,
      //   },
      // });
    }
    const storedRole = localStorage.getItem("userRole");
    if (!storedRole) {
      setIsModalOpen(true);
    } else {
      setUserRole(storedRole);
    }
  }

  useIsomorphicLayoutEffect(() => {
    setError(null);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const jwt_token_encoded = hash.get("id_token");

    ensureEphemeralKeyPair();

    const userKeyData = JSON.parse(localStorage.getItem("userKeyData"));

    if (!jwt_token_encoded) {
      createRuntimeError("Could not retrieve a valid JWT Token!");
      return;
    }

    if (!userKeyData) {
      createRuntimeError("user Data is null");
      return;
    }

    setJwtEncoded(jwt_token_encoded);

    if (window.opener) {
      console.log("jwt", jwt_token_encoded);
      window.opener.postMessage(
        { token: jwt_token_encoded, type: "google-token" },
        window.location.origin
      );
      // window.close();
    }

    localStorage.setItem("jwtToken", jwt_token_encoded);
    localStorage.setItem("isLoggedIn", "true");

    loadRequiredData(jwt_token_encoded);
  }, []);

  useEffect(() => {
    if (jwtEncoded && userSalt) {
      getZkProof();
    }
  }, [jwtEncoded, userSalt]);

  function createRuntimeError(message) {
    setError(message);
    setTransactionInProgress(false);
  }

  const handleLogout = () => {
    localStorage.removeItem("userKeyData");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("isLoggedIn");
    setUserProfile(null);
    setUserAddress(null);
    setSubjectID(null);
    setJwtEncoded(null);
    setZkProof(null);
    setUserSalt(null);
    setUserBalance(0);
    window.location.href = "/";
  };

  const handleRoleSave = (role) => {
    localStorage.setItem("userRole", role);
    setUserRole(role);
    setIsModalOpen(false);
  };
  return (
    <>
      <Navbar />
      <Flex className=" justify-center bg-[#061e30] py-10">
        <Box className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-4xl h-auto">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-semibold leading-7 text-white mb-4">
              Profile Overview
            </h3>
            <p className="text-sm leading-6 text-gray-300 mb-6">
              Login with zkLogin completed!
            </p>
          </div>
          <VStack spacing={4} align="stretch">
            {userProfile && (
              <>
                <Text className="text-sm leading-6 text-white">
                  Name: {userProfile.name}
                </Text>
                <Text className="text-sm leading-6 text-white">
                  Email: {userProfile.email}
                </Text>
              </>
            )}
            {userAddress && (
              <div className="flex justify-between items-center">
                <Text className="text-sm leading-6 text-white">
                  User Address
                </Text>
                <div className="flex items-center">
                  <Text className="text-sm leading-6 text-white mr-4">
                    {userAddress}
                  </Text>
                  <Button
                    size="sm"
                    bg={"#3a82d0"}
                    colorScheme="teal"
                    onClick={() => navigator.clipboard.writeText(userAddress)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
            {userAddress && (
              <Text className="text-sm leading-6 text-white">
                Balance: {userBalance.toFixed(4)} SUI
              </Text>
            )}
            {userSalt && (
              <>
                <Text className="text-sm leading-6 text-white">
                  User Salt: {userSalt}
                </Text>
                <Text className="text-sm leading-6 text-white">
                  Subject ID: {subjectID}
                </Text>
              </>
            )}

            {userRole && (
              <>
                <Text className="text-sm leading-6 text-white">
                  User Role: {userRole}
                </Text>
              </>
            )}
            {/* <Select
              placeholder="Select your role"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="text-sm leading-6 text-white bg-gray-700 border-gray-600"
            >
              <option value="client">Client</option>
              <option value="freelancer">Freelancer</option>
            </Select> */}
            <Button colorScheme="red" onClick={handleLogout}>
              Logout
            </Button>
          </VStack>
        </Box>
      </Flex>
      <RoleSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleRoleSave}
      />
    </>
  );
};

export default Home;
