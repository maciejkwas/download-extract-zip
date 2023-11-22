#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
// const fetch = require("node-fetch");
const { promisify } = require("util");
const { pipeline } = require("stream");
const decompress = require("decompress");
const { program } = require("commander");

const readFileAsync = promisify(fs.readFile);
const streamPipeline = promisify(pipeline);

function isURL(str) {
  return /^https?:\/\//.test(str);
}

async function downloadFile(url, destination, fileName) {
  try {
    const response = await fetch(url);

    const filePath = path.join(destination, fileName);

    // Check if the file already exists
    if (fs.existsSync(filePath)) {
      console.log(`File ${fileName} already exists. Skipping download.`);
      return;
    }

    return await streamPipeline(response.body, fs.createWriteStream(filePath));
  } catch (error) {
    console.error(`Error downloading ${url}: ${error.message}`);
    throw error; // Rethrow the error to indicate failure
  }
}

async function unzipFile(zipPath, fileName, extractPath) {
  try {
    return await decompress(
      path.join(zipPath, fileName),
      path.join(extractPath, fileName.replaceAll(".", "_"))
    );
  } catch (error) {
    console.error(`Error during extraction: ${error.message}`);
    throw error; // Rethrow the error to indicate failure
  }
}

async function processFileList(source, downloadPath, startPointer) {
  try {
    console.log(`Getting list from: ${source}`);
    let fileContent = "";

    if (isURL(source)) {
      const sourceResponse = await fetch(source);
      fileContent = await sourceResponse.text();
    } else {
      fileContent = await readFileAsync(source, "utf-8");
    }

    const fileUrls = fileContent.split("\n").filter(Boolean);

    let processedCount = 0;

    if (fileUrls.length - startPointer < 0) {
      throw "startPointer is bigger than total number of files";
    }

    console.log(
      `Preparing ${fileUrls.length - startPointer} files to download...`
    );

    const zipFilePath = path.join(process.cwd(), downloadPath, "savedFiles");
    const extractedFilesPath = path.join(
      process.cwd(),
      downloadPath,
      "extractedFiles"
    );

    fs.mkdirSync(zipFilePath, { recursive: true });
    fs.mkdirSync(extractedFilesPath, { recursive: true });

    for (let i = startPointer; i < fileUrls.length; i++) {
      const url = fileUrls[i];
      const fileName = `${String(i + 1).padStart(4, "0")}__${url.substring(
        url.lastIndexOf("/") + 1
      )}`;

      try {
        console.log(
          `[${i + 1}/${fileUrls.length}] Processing file: ${fileName}`
        );

        await downloadFile(url, zipFilePath, fileName);

        if (!fs.existsSync(path.join(zipFilePath, fileName))) {
          console.error(
            `[${i + 1}/${
              fileUrls.length
            }] Error: File does not exist after download: ${fileName}`
          );
          continue; // Skip to the next file
        }

        await unzipFile(zipFilePath, fileName, extractedFilesPath);

        processedCount++;
      } catch (error) {
        // Log the error and continue to the next file
        console.error(`Error processing ${url}: ${error.message}`);
      }
    }

    return processedCount;
  } catch (error) {
    console.error(`Error fetching file list from ${source}: ${error.message}`);
    throw error; // Rethrow the error to indicate failure
  }
}

program
  .option("-s, --source <source>", "Link to the file containing file URLs")
  .option("-d, --destination <destination>", "Destination on disk")
  .option(
    "-p, --pointer <pointer>",
    "Pointer to the starting line in the file (optional)"
  );

program.parse(process.argv);
const options = program.opts();

if (!options.source || !options.destination) {
  console.error("Error: Source and destination options are required.");
  process.exit(1);
}

const startPointer = Number(options.pointer) || 0;

processFileList(options.source, options.destination, startPointer)
  .then((processedCount) => {
    console.log(`Processing completed. ${processedCount} files processed.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });
