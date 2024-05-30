import { kv } from "@vercel/kv";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const body = req.body;

  try {
    let dataRequest = body;
    if (dataRequest && dataRequest.subject && dataRequest.jwt) {
      let response = await getExisting(dataRequest);
      if (!response?.salt) {
        const saltFromMysten = generateNumericSalt();

        //storing new salt in DB
        // await kv.hset(dataRequest.subject, { salt: saltFromMysten });

        //returning response
        response = { subject: dataRequest.subject, salt: saltFromMysten };
      }
      res
        .status(200)
        .json({ status: 200, statusText: "OK", salt: response.salt });
    } else {
      res.status(400).json({ status: 400, statusText: "Bad Request" });
    }
  } catch (e) {
    console.log("Wrong Request Body Format!. Inner error= ", e);
    res.status(422).json({
      status: 422,
      statusText: "Wrong Body Format!. Inner Error= " + e,
      data: "",
    });
  }
}

function generateNumericSalt() {
  let salt = "";
  while (salt.length < 32) {
    salt += Math.floor(Math.random() * 10); // generate a random digit between 0 and 9
  }
  return salt;
}
async function getExisting(dataRequest) {
  let salt = null;
  try {
    salt = await kv.hget(dataRequest.subject, "salt");
  } catch (error) {
    const errorMessage = error.message;
    if (errorMessage.includes("WRONGTYPE")) {
      // We recently refactored KV store to use hash set instead of set.
      // This error means that the key is an old entry and not a hash set. We should delete it from KV store.
      console.log("WRONGTYPE error. Deleting key from KV store.");
      await kv.del(dataRequest.subject);
      return null;
    }
  }
  return { subject: dataRequest.subject, salt: salt };
}
