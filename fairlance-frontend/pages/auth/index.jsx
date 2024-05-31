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
import { Box, Flex, border } from "@chakra-ui/react";
import Navbar from "../../components/Navbars/navbar";

const Home = () => {
  const [error, setError] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [txDigest, setTxDigest] = useState(null);
  const [jwtEncoded, setJwtEncoded] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [subjectID, setSubjectID] = useState(null);
  const [zkProof, setZkProof] = useState(null);
  const [userSalt, setUserSalt] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
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

  return (
    <>
      <Navbar />
      <Flex id="cb" className=" justify-center ">
        <Box>
          <div className="px-4 sm:px-0">
            <h3 className="text-base font-semibold leading-7 text-white">
              Profile overview
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-white">
              Login with zkLogin completed!
            </p>
          </div>
          <div className="mt-6 border-t border-gray-100">
            <dl className="divide-y divide-gray-100">
              {userAddress ? (
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-white">
                    User Address
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-white sm:col-span-2 sm:mt-0">
                    <span className="mr-5">{userAddress}</span>
                    <span className="ml-0">
                      <button
                        type="button"
                        className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-black shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        onClick={() =>
                          navigator.clipboard.writeText(userAddress)
                        }
                      >
                        Copy
                      </button>
                    </span>
                  </dd>
                </div>
              ) : null}
              {userAddress ? (
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-white">
                    Balance
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-white sm:col-span-2 sm:mt-0">
                    <span className="mr-5">{userBalance.toFixed(4)} SUI</span>
                  </dd>
                </div>
              ) : null}
              {userSalt ? (
                <div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-white">
                      User Salt
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-white sm:col-span-2 sm:mt-0">
                      <span className="mr-5">{userSalt}</span>
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-white">
                      Subject ID
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-white sm:col-span-2 sm:mt-0">
                      <span className="mr-5">{subjectID}</span>
                    </dd>
                  </div>
                </div>
              ) : null}
            </dl>
          </div>
        </Box>
      </Flex>
    </>
  );
};

export default Home;
