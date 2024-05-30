import { kv } from "@vercel/kv";
import crypto from "crypto";
import { decode } from "jwt-js-decode";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const zkpRequest = req.body;

    if (!zkpRequest) {
      return res.status(422).json({ code: 422, message: "Wrong Body Format!" });
    }

    const decodedJwt = decode(zkpRequest.zkpPayload?.jwt);

    const subject = decodedJwt?.payload?.sub;

    const savedProof = await kv.hget(subject, "zkp");

    if (savedProof && !zkpRequest.forceUpdate) {
      console.log("ZK Proof found in database.");
      return res.status(200).json({ code: 200, zkp: savedProof });
    } else {
      try {
        const proverResponse = await getZKPFromProver(zkpRequest.zkpPayload);

        if (proverResponse.status !== 200 || !proverResponse.data) {
          return res.status(proverResponse.status).json({
            code: proverResponse.status,
            message: proverResponse.statusText,
          });
        }

        const zkpProof = proverResponse.data;
        console.log("ZK Proof created from prover ", zkpProof);

        // Proof is created for first time. We should store it in database before returning it.
        storeProofInDatabase(zkpProof, subject);

        return res.status(200).json({ code: 200, zkp: zkpProof });
      } catch (error) {
        console.error("Error getting ZK Proof from prover:", error);
        return res
          .status(500)
          .json({ code: 500, message: "Internal Server Error" });
      }
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getZKPFromProver(zkpPayload) {
  console.log("ZK Proof not found in database. Creating proof...");

  const Proof = {
    proof: crypto.randomBytes(32).toString("hex"),
    extendedEphemeralPublicKey: zkpPayload.extendedEphemeralPublicKey,
    jwtRandomness: zkpPayload.jwtRandomness,
    maxEpoch: zkpPayload.maxEpoch,
    salt: zkpPayload.salt,
    keyClaimName: zkpPayload.keyClaimName,
    proofGeneratedAt: new Date().toISOString(),
  };

  return {
    status: 200,
    data: Proof,
  };
}

function storeProofInDatabase(zkpProof, subject) {
  kv.hset(subject, { zkp: zkpProof });
  console.log("Proof stored in database.");
}
