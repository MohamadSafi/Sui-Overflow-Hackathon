import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const body = req.body;
  console.log("Received request body:", body); // Add this line

  try {
    let dataRequest = body;
    if (dataRequest && dataRequest.subject && dataRequest.jwt) {
      console.log(
        "Received request for FETCHING Salt for subject ",
        dataRequest.subject
      );
      let response = await getExisting(dataRequest);
      if (!response?.salt) {
        console.log(
          "Salt not found in KV store. Fetching from Mysten API. jwt = ",
          dataRequest.jwt,
          "subject = ",
          dataRequest.subject
        );
        const saltFromMysten = await getSaltFromMystenAPI(dataRequest.jwt);

        //storing new salt in DB
        await kv.hset(dataRequest.subject, { salt: saltFromMysten });

        //returning response
        response = { subject: dataRequest.subject, salt: saltFromMysten };
        console.log("response from mysten = ", response);
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

async function getSaltFromMystenAPI(jwtEncoded) {
  const url =
    process.env.NEXT_PUBLIC_SALT_API ||
    "https://salt.api.mystenlabs.com/get_salt";
  const payload = { token: jwtEncoded };

  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    referrerPolicy: "no-referrer",
    body: JSON.stringify(payload),
  });
  const responseJson = await response.json();
  return responseJson.salt;
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
