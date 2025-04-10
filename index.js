#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

// Set up yargs to handle command-line arguments
const argv = yargs(hideBin(process.argv))
	.option("help", {
		alias: "h",
		description: "Show help",
		type: "boolean",
	})
	.option("pretty", {
		alias: "p",
		description: "Show output with pretty formatting",
		type: "boolean",
	}).argv;

// Function to list files recursively
const listFilesRecursively = (directory, indent = "", isLast = false, isRoot = true) => {
	let items;
	try {
		items = fs.readdirSync(directory);
	} catch (err) {
		if (argv.pretty) {
			console.warn(`${indent}⚠️  [Permission denied]: ${directory}`);
		} else {
			console.warn(`[Permission denied]: ${directory}`);
		}
		return; // Skip this directory
	}

	// Print the current directory name
	if (argv.pretty) {
		const prefix = isRoot ? "" : isLast ? "└" : "";
		const connector = isRoot ? "" : isLast ? "" : "";
		console.log(`${indent}${prefix}${connector} ${path.basename(directory)}:`);
	} else {
		console.log(`${indent}${path.basename(directory)}:`);
	}

	items.forEach((item, index) => {
		const fullPath = path.join(directory, item);
		const isDirectory = fs.statSync(fullPath).isDirectory();
		const isItemLast = index === items.length - 1;
		const newIndent = argv.pretty ? `${indent}${isLast ? " " : "│ "}` : `${indent}  `;

		if (item === "node_modules" || item === ".git" || item === ".svn") {
			// Skip node_modules directory
			return;
		}

		if (isDirectory) {
			// Recursively list contents of the directory
			const hasChildren = fs.readdirSync(fullPath).length > 0;
			const dirPrefix = isItemLast ? "└" : "├";
			const dirConnector = hasChildren ? "┬" : "";

			if (argv.pretty) {
				console.log(`${indent}${dirPrefix}${dirConnector} ${item}:`);
			}

			listFilesRecursively(fullPath, newIndent, isItemLast, false);
		} else {
			// Print the file name
			if (argv.pretty) {
				const filePrefix = isItemLast ? "└" : "│";
				console.log(`${indent}${filePrefix} ${item}`);
			} else {
				console.log(`${indent}   ${item}`);
			}
		}
	});
};

// Show help message
if (argv.help) {
	console.log("Usage: list-files-recursive [options]");
	console.log();
	console.log("Options:");
	console.log("  --help, -h     Show help");
	console.log("  --pretty, -p   Show output with pretty formatting");
	process.exit(0);
}

// Get the directory to start listing from
const directory = process.cwd();

// List files recursively starting from the current directory
listFilesRecursively(directory);
