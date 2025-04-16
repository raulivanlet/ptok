#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

// Set up yargs to handle command-line arguments
const argv = yargs(hideBin(process.argv))
	.option("help", {
		alias: "h",
		type: "boolean",
		description: "Show help",
	})
	.option("pretty", {
		alias: "p",
		type: "boolean",
		description: "Show output with pretty formatting",
	})
	.option("depth", {
		alias: "d",
		type: "number",
		description: "Max depth to recurse (0 = current dir only, 1 = current directory + immediate children , etc.)",
		default: 1000,
	})
	.option("ignore", {
		alias: "i",
		type: "array",
		description: "Directories to ignore",
		default: ["node_modules", ".git"],
	}).argv;

// Function to list files recursively
const listFilesRecursively = (directory, indent = "", isLast = false, isRoot = true, currentDepth = 0) => {
	let items;
	try {
		items = fs.readdirSync(directory);
	} catch (err) {
		if (argv.pretty) {
			console.warn(`${indent}⚠️  [Permission denied]: ${directory}`);
		} else {
			console.warn(`[Permission denied]: ${directory}`);
		}
		return;
	}

	// Print the current directory name
	if (argv.pretty) {
		const prefix = isRoot ? "" : isLast ? "└" : "";
		console.log(`${indent}${prefix} ${path.basename(directory)}:`);
	} else {
		console.log(`${indent}${path.basename(directory)}:`);
	}

	items.forEach((item, index) => {
		const fullPath = path.join(directory, item);
		const isDirectory = fs.statSync(fullPath).isDirectory();
		const isItemLast = index === items.length - 1;
		const newIndent = argv.pretty ? `${indent}${isLast ? " " : "│ "}` : `${indent}  `;

		if (argv.ignore.includes(item)) return;

		if (isDirectory) {
			let hasChildren = false;
			try {
				hasChildren = fs.readdirSync(fullPath).length > 0;
			} catch (err) {
				if (argv.pretty) {
					console.warn(`${indent}⚠️  [Permission denied]: ${fullPath}`);
				} else {
					console.warn(`[Permission denied]: ${fullPath}`);
				}
				return;
			}

			const dirPrefix = isItemLast ? "└" : "├";
			const dirConnector = argv.pretty && hasChildren && currentDepth + 1 < argv.depth ? "┬" : "";

			if (argv.pretty) {
				console.log(`${indent}${dirPrefix}${dirConnector} ${item}:`);
			} else {
				console.log(`${newIndent}${item}/`);
			}

			// Only recurse if we're not at max depth
			if (currentDepth + 1 < argv.depth) {
				listFilesRecursively(fullPath, newIndent, isItemLast, false, currentDepth + 1);
			}
		} else {
			if (argv.pretty) {
				const filePrefix = isItemLast ? "└" : "│";
				console.log(`${indent}${filePrefix} ${item}`);
			} else {
				console.log(`${newIndent}${item}`);
			}
		}
	});
};

// Get the directory to start listing from
const directory = process.cwd();

// List files recursively starting from the current directory
listFilesRecursively(directory, "", false, true, 0);
