// components/Home.js
"use client";

import { useEffect, useLayoutEffect, useState } from "react";
// import decode from "jwt-decode";
import * as jwtJsDecode from "jwt-js-decode";
import { decode } from "jwt-js-decode";

import axios from "axios";
import { toBigIntBE } from "bigint-buffer";
import { fromB64 } from "@mysten/bcs";
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

  async function getSalt(subject, jwtEncoded) {
    const getSaltRequest = { subject, jwt: jwtEncoded };
    console.log("Sending request to get salt:", getSaltRequest); // Add this line
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

  async function executeTransactionWithZKP() {
    setError(null);
    setTransactionInProgress(true);
    const decodedJwt = decode(jwtEncoded);
    const { userKeyData, ephemeralKeyPair } = getEphemeralKeyPair();
    const partialZkSignature = zkProof;

    if (!partialZkSignature || !ephemeralKeyPair || !userKeyData) {
      createRuntimeError("Transaction cannot proceed. Missing critical data.");
      return;
    }

    const txb = new TransactionBlock();

    txb.moveCall({
      target: `0xf8294cd69d69d867c5a187a60e7095711ba237fad6718ea371bf4fbafbc5bb4b::teotest::create_weapon`,
      arguments: [txb.pure("Zero Knowledge Proof Axe 9000"), txb.pure(66)],
    });
    txb.setSender(userAddress);

    const signatureWithBytes = await txb.sign({
      client: suiClient,
      signer: ephemeralKeyPair,
    });

    const addressSeed = genAddressSeed(
      BigInt(userSalt),
      "sub",
      decodedJwt.sub,
      decodedJwt.aud
    );

    const zkSignature = getZkLoginSignature({
      inputs: {
        ...partialZkSignature,
        addressSeed: addressSeed.toString(),
      },
      maxEpoch: userKeyData.maxEpoch,
      userSignature: signatureWithBytes.signature,
    });

    suiClient
      .executeTransactionBlock({
        transactionBlock: signatureWithBytes.bytes,
        signature: zkSignature,
        options: {
          showEffects: true,
        },
      })
      .then((response) => {
        if (response.effects?.status.status == "success") {
          setTxDigest(response.digest);
          setTransactionInProgress(false);
        } else {
          setTransactionInProgress(false);
        }
      })
      .catch((error) => {
        if (error.toString().includes("Signature is not valid")) {
          createRuntimeError(
            "Signature is not valid. Please generate a new one by clicking on 'Get new ZK Proof'"
          );
        }
        setTransactionInProgress(false);
      });
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

  function getEphemeralKeyPair() {
    const userKeyData = JSON.parse(localStorage.getItem("userKeyData"));
    let ephemeralKeyPairArray = Uint8Array.from(
      Array.from(fromB64(userKeyData.ephemeralPrivateKey))
    );
    const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(
      ephemeralKeyPairArray
    );
    return { userKeyData, ephemeralKeyPair };
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
    const subjectId = decodedJwt.payload.sub; // Access the sub field from the payload

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
      toast.success(
        "We've fetched some coins for you, so you can get started with Sui!",
        { duration: 8000 }
      );
    }
  }

  useIsomorphicLayoutEffect(() => {
    setError(null);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const jwt_token_encoded = hash.get("id_token");

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
    <div id="cb" className="space-y-12">
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">
          Authenticated Area
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          Login with External Provider Completed
        </p>
      </div>
      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          {userAddress ? (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                User Address
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <span className="mr-5">{userAddress}</span>
                <span className="ml-0">
                  <button
                    type="button"
                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    onClick={() => navigator.clipboard.writeText(userAddress)}
                  >
                    Copy
                  </button>
                </span>
              </dd>
            </div>
          ) : null}
          {userAddress ? (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Balance
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <span className="mr-5">{userBalance.toFixed(4)} SUI</span>
                <span className="ml-5">
                  <button
                    type="button"
                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    disabled={!userAddress}
                    onClick={() => giveSomeTestCoins(userAddress)}
                  >
                    Get Testnet Coins
                  </button>
                </span>
              </dd>
            </div>
          ) : null}
          {userSalt ? (
            <div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  User Salt
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <span className="mr-5">{userSalt}</span>
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Subject ID
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <span className="mr-5">{subjectID}</span>
                </dd>
              </div>
            </div>
          ) : null}
          {zkProof ? (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                ZK Proof (point A)
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <span className="mr-5">
                  {zkProof?.proofPoints?.a.toString().slice(0, 30)}...
                </span>
                <span className="ml-5">
                  <button
                    type="button"
                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    onClick={() => getZkProof(true)}
                  >
                    Get new ZK Proof
                  </button>
                </span>
              </dd>
            </div>
          ) : null}
        </dl>
        {zkProof && enoughBalance(userBalance) ? (
          <div className="pt-5">
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              disabled={!userAddress}
              onClick={() => executeTransactionWithZKP()}
            >
              Execute Transaction
            </button>
          </div>
        ) : null}
      </div>
      {txDigest ? (
        <div className="flex flex-col items-center mt-5">
          <h3>Transaction Completed!</h3>
          <div id="contents" className="font-medium pb-6 pt-6">
            <p>TxDigest = {txDigest}</p>
          </div>
          <div id="contents" className="font-medium pb-6">
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded-md"
              disabled={!userAddress}
              onClick={() =>
                window.open(
                  `https://testnet.suivision.xyz/txblock/${txDigest}`,
                  "_blank"
                )
              }
            >
              See it on Explorer
            </button>
          </div>
        </div>
      ) : null}
      {transactionInProgress ? (
        <div className="flex space-x-4 justify-center">
          <Blocks
            visible={true}
            height="80"
            width="80"
            ariaLabel="blocks-loading"
            wrapperStyle={{}}
            wrapperClass="blocks-wrapper"
          />
        </div>
      ) : null}
      {error ? (
        <div id="header" className="pb-5 pt-6 text-red-500 text-xl">
          <h2>{error}</h2>
        </div>
      ) : null}
    </div>
  );
};

export default Home;
