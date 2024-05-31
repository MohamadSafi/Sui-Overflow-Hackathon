import fs from "fs";
import path from "path";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing to handle it ourselves with formidable
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const form = formidable({
      uploadDir: path.join(process.cwd(), "public/img/jobs"),
      keepExtensions: true, // Preserve file extensions
      filename: (name, ext, part, form) => {
        return `${Date.now()}_${part.originalFilename}`; // Custom filename
      },
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("Error parsing the files", err);
        res.status(500).json({ message: "Error parsing the files" });
        return;
      }

      console.log("Fields:", fields);
      console.log("Files:", files);

      // Check if files.image is an array and take the first element
      const imageFile = Array.isArray(files.image)
        ? files.image[0]
        : files.image;

      const jobData = {
        jobTitle: fields.jobTitle[0],
        skillsRequired: fields.skillsRequired[0],
        jobDescription: fields.jobDescription[0],
        budget: fields.budget[0],
        deadline: fields.deadline[0],
        image: imageFile ? path.basename(imageFile.filepath) : "",
      };

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
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
