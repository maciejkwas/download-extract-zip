# Download and Unzip Script

This script downloads and extracts files from a list of URLs.

## Prerequisites

- If just want to use it: none

- If you are developer: Node.js installed on your machine. You can download it [here](https://nodejs.org/).

## Usage

1. Clone or download this repository.

2. Open a terminal or command prompt.

3. Navigate to the directory where downloaded/cloned - script is located in `dist`.

4. Run the script:

```bash
dezipp -s [link to files] -d [destination on disk] -p [starting line pointer]
```

Replace [link to files] with the link to the file containing file URLs, [destination on disk] with the destination directory, and [starting line pointer] with the starting line pointer (optional) to skip lines if needed.

## Example

```bash
dezipp -s https://example.com/file_urls.txt -d /path/to/destination -p 0
```

## Options

`-s, --source`: Link to the file containing file URLs.
`-d, --destination`: Destination on disk.
`-p, --pointer`: Pointer to the starting line in the file (optional).

## Notes

The script will create a directory as passed in destination.
If the destination directory does not exist, the script will create it.

## For developers

Install dependencies:

```bash
npm ci
```

and then test with

```bash
npm run test -- -s https://raw.githubusercontent.com/maciejkwas/download-extract-zip/main/test-file.txt -d test-destination -p 0
```

## License

This project is licensed under the WTFPL License - see the [link](https://en.wikipedia.org/wiki/WTFPL) for details.
