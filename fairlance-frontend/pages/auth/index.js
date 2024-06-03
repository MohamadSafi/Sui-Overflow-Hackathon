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
import { Buffer } from "buffer";
import { Box, Flex, Text, Button, Select, VStack } from "@chakra-ui/react";
import Navbar from "../../components/Navbars/navbar";
import RoleSelectionModal from "../../components/Custom/RoleModal";
import Terminal from "react-terminal-ui";
import { TerminalOutput, TerminalInput } from "react-terminal-ui";
import Footer from "../../components/Navbars/footer";
import EncryptButton from "../../components/Custom/EncryptButton";
import { FiLogOut, FiEdit } from "react-icons/fi";
import DashboardCards from "../../components/Custom/DashboardCards";
import {
  ensureEphemeralKeyPair,
  getEphemeralKeyPair,
  getSalt,
  getZkProof,
} from "../../utils/zkLogin";
import { handleZkLoginAndDWallet } from "../../utils/dWallet";

const Home = () => {
  const [error, setError] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
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
  const [dWalletAddress, setDWalletAddress] = useState(null);
  const [zkLoginSignature, setZkLoginSignature] = useState(null);

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  const { suiClient } = useSui();
  const MINIMUM_BALANCE = 0.003;

  function generateAndStoreEphemeralKeyPair() {
    const keypair = Ed25519Keypair.generate();
    const ephemeralPrivateKey = keypair.secretKey;
    const ephemeralPublicKey = keypair.publicKey;

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

    let ephemeralKeyPairArray = Uint8Array.from(
      Buffer.from(ephemeralPrivateKeyBase64, "base64")
    );

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

  async function getZkProof(forceUpdate = false) {
    setError(null);
    setTransactionInProgress(true);
    const decodedJwt = decode(jwtEncoded);
    const { userKeyData, ephemeralKeyPair } = getEphemeralKeyPair();

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
    let totalBalance = 0;

    totalBalance = totalBalance / 1000000000;
    setUserBalance(totalBalance);
    return false;
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
    }
    const storedRole = localStorage.getItem("userRole");
    if (!storedRole) {
      setIsModalOpen(true);
    } else {
      setUserRole(storedRole);
    }

    const { ephemeralKeyPair } = getEphemeralKeyPair();
    console.log("kwttoken:", encodedJwt);
    console.log("privateKey:", ephemeralKeyPair.keypair.secretKey);
    console.log("publicKey:", ephemeralKeyPair.keypair.publicKey);

    // const dWalletData = await handleZkLoginAndDWallet({
    //   jwtToken: encodedJwt,
    //   privateKey: ephemeralKeyPair.keypair.secretKey,
    //   publicKey: ephemeralKeyPair.keypair.publicKey,
    //   userSalt,
    // });
    // setDWalletAddress(dWalletData.dWalletAddress);
    // setZkLoginSignature(dWalletData.zkLoginSignature);
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

  const toggelModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  return (
    <>
      <Navbar />
      <Flex className=" justify-center bg-[#061e30] py-10 ">
        <Box
          position="absolute"
          top="4%"
          left="40%"
          width="300px"
          height="300px"
          bgGradient="radial(teal.500, transparent)"
          filter="blur(150px)"
          zIndex={1}
        ></Box>
        <Box
          position="absolute"
          top="20%"
          left="0"
          width="300px"
          height="300px"
          bgGradient="radial(blue.700, transparent)"
          filter="blur(200px)"
          zIndex={1}
        ></Box>
        <Box
          position="absolute"
          top="3%"
          right="0"
          zIndex={1}
          width="300px"
          height="300px"
          bgGradient="radial(blue.700, transparent)"
          filter="blur(200px)"
        ></Box>
        <Box
          className="bg-[#061e30] rounded-lg  w-full max-w-6xl h-auto"
          zIndex={2}
        >
          <Terminal name="User Profile" prompt="" height="400px">
            {userProfile && (
              <>
                <TerminalOutput>{`Name: ${userProfile.name}`}</TerminalOutput>
                <TerminalOutput>{`Email: ${userProfile.email}`}</TerminalOutput>
              </>
            )}
            {userAddress && (
              <TerminalOutput>{`User Address: ${userAddress}`}</TerminalOutput>
            )}
            {userAddress && (
              <TerminalOutput>{`Balance: ${userBalance.toFixed(
                4
              )} SUI`}</TerminalOutput>
            )}
            {userSalt && (
              <>
                <TerminalOutput>{`User Salt: ${userSalt}`}</TerminalOutput>
                <TerminalOutput>{`Subject ID: ${subjectID}`}</TerminalOutput>
              </>
            )}
            {dWalletAddress && (
              <TerminalOutput>{`dWallet Address: ${dWalletAddress}`}</TerminalOutput>
            )}
            {zkLoginSignature && (
              <TerminalOutput>{`zkLogin Signature: ${zkLoginSignature}`}</TerminalOutput>
            )}
            {userRole && (
              <TerminalOutput>{`Role: ${
                userRole.charAt(0).toUpperCase() + userRole.slice(1)
              }`}</TerminalOutput>
            )}
            <TerminalInput
              onInput={(input) => {
                if (input === "logout") handleLogout();
              }}
            />
          </Terminal>
          <Flex marginTop={8} justifyContent={"space-between"}>
            {/* <Button colorScheme="red" onClick={handleLogout} width={"100%"}>
              Logout
            </Button> */}
            <EncryptButton
              targetText="Edit Role"
              icon={FiEdit}
              onClick={toggelModal}
            />

            <EncryptButton
              targetText="Logout"
              icon={FiLogOut}
              onClick={handleLogout}
            />
          </Flex>
        </Box>
      </Flex>
      <RoleSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleRoleSave}
      />
      <DashboardCards />
      <Footer />
    </>
  );
};

export default Home;
