// pages/api/saveJob.js
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method === "POST") {
    const jobData = req.body;

    // Define the path to the JSON file
    const filePath = path.join(process.cwd(), "data", "jobs.json");

    // Read the existing jobs from the JSON file
    let jobs = [];
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath);
      jobs = JSON.parse(fileContents);
    }

    // Add the new job to the array
    jobs.push(jobData);

    // Write the updated jobs back to the JSON file
    fs.writeFileSync(filePath, JSON.stringify(jobs, null, 2));

    res.status(200).json({ message: "Job saved successfully" });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
