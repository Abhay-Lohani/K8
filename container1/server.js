const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const STORAGE_PATH = '/yourname_PV_dir';

if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

// API to Store a File
app.post('/store-file', (req, res) => {
    const { file, data } = req.body;

    if (!file || !data) {
        return res.status(400).json({ file: null, error: "Invalid JSON input." });
    }

    const filePath = path.join(STORAGE_PATH, file);

    fs.writeFile(filePath, data, (err) => {
        if (err) {
            return res.status(500).json({ file, error: "Error storing the file." });
        }
        return res.status(200).json({ file, message: "Success." });
    });
});

// API to Send File Data to Container 2//this is test by abhay
app.post('/calculate', async (req, res) => {
    const { file, product } = req.body;
    if (!file || !product) {
      return res.status(400).json({ file: null, error: "Invalid JSON input." });
    }
    const filePath = path.join(STORAGE_PATH, file);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ file, error: "File not found." });
    }
    
    try {
      // Use an environment variable to set the URL of container2.
      // For local testing you might use 'http://localhost:8080/process-file'
      // In Kubernetes, container1 can reach container2 via its service name.
      const container2URL = process.env.CONTAINER2_URL || 'http://localhost:8080/process-file';
      const response = await axios.post(container2URL, { file, product });
      return res.status(response.status).json(response.data);
    } catch (error) {
      // If container2 returns an error, forward that exact error response.
      if (error.response && error.response.data && error.response.data.error) {
        return res.status(error.response.status).json(error.response.data);
      }
      return res.status(500).json({ file, error: "Error processing file." });
    }
  });


const PORT = 80;
app.listen(PORT, () => console.log(`Container 1 running on port ${PORT}`));
