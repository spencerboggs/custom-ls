/**
 * @fileoverview CUSTOM LS
 * A custom ls command that allows you to add descriptions to your files and folders.
 * Copyright (c) 2023 Spencer Boggs
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to display the help menu
function help() {
    console.log('Usage: cls [options][paths...]');
    console.log('\nOptions:');
    console.log('\tList information about the FILEs (the current directory by default).');
    console.log('\t-h, --help\t\tDisplay this help menu');
    console.log('\t-a, --all\t\tDo not ignore entries starting with .');
    console.log('\t-i, --init\t\tCreate blank descriptions for subdirectories');
}

// Function to display the items in the current directory
// Function should display the name of the file or folder and the description from descriptions.json in the same folder as the file
function ls() {
    const descriptionsPath = path.join(__dirname, 'descriptions.json');

    // If descriptions.json doesn't exist, create an empty object
    if (!fs.existsSync(descriptionsPath)) {
        fs.writeFileSync(descriptionsPath, '{}');
    }

    // Read the descriptions from descriptions.json
    let descriptions = {};
    try {
        descriptions = JSON.parse(fs.readFileSync(descriptionsPath));
    } catch (error) {
        console.error('Error reading descriptions.json:', error.message);
        return;
    }

    // Get the items in the current directory
    let items = fs.readdirSync(process.cwd(), { withFileTypes: true });

    // Only include files starting with . if the -a option was specified
    const args = process.argv.slice(2);
    const showHidden = args.includes('-a') || args.includes('--all');
    if (!showHidden) {
        items = items.filter(item => !item.name.startsWith('.'));
    }

    // Create blank descriptions for each item that doesn't have a description in descriptions.json
    for (const item of items) {
        const itemName = item.name;
        const itemPath = path.join(process.cwd(), itemName);
        if (!descriptions.hasOwnProperty(itemPath)) {
            descriptions[itemPath] = '';
        }
    }

    // Write the updated descriptions to descriptions.json
    try {
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions));
    } catch (error) {
        console.error('Error writing descriptions.json:', error.message);
        return;
    }

    // Display each item and its description
    const maxNameLength = Math.max(...items.map(item => item.name.length));
    for (const item of items) {
        const itemName = item.name;
        const itemPath = path.join(process.cwd(), itemName);
        const description = descriptions[itemPath];
        console.log("\033[1m\033[34m" + itemName.padEnd(maxNameLength) + "\033[0m" + `\t\t${description}`);
    }
}



// Function to display the items in the specified directory
function lsDir(dirPath, showHidden) {
    const descriptionsPath = path.join(__dirname, 'descriptions.json');

    // If descriptions.json doesn't exist, create an empty object
    if (!fs.existsSync(descriptionsPath)) {
        fs.writeFileSync(descriptionsPath, '{}');
    }

    // Read the descriptions from descriptions.json
    let descriptions = {};
    try {
        descriptions = JSON.parse(fs.readFileSync(descriptionsPath));
    } catch (error) {
        console.error(`Error reading descriptions.json in ${dirPath}:`, error.message);
        return;
    }

    // Get the items in the specified directory
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    let longestNameLength = 0;
    items.forEach((item) => {
        if (showHidden || !item.name.startsWith(".")) { // Only consider non-hidden files if -a is not passed
            if (item.name.length > longestNameLength) {
                longestNameLength = item.name.length;
            }
        }
    });

    // Create blank descriptions for each item that doesn't have a description in descriptions.json
    for (const item of items) {
        const itemName = item.name;
        const itemPath = path.join(dirPath, itemName);
        if (!descriptions.hasOwnProperty(itemPath)) {
            descriptions[itemPath] = '';
        }
    }

    // Write the updated descriptions to descriptions.json
    try {
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions));
    } catch (error) {
        console.error(`Error writing descriptions.json in ${dirPath}:`, error.message);
        return;
    }

    // Display each item and its description
    for (const item of items) {
        const itemName = item.name;
        const itemPath = path.join(dirPath, itemName);
        const description = descriptions[itemPath];

        if (!showHidden && itemName.startsWith(".")) {
            continue;
        }

        console.log("\033[1m\033[34m" + `${itemName}${"\t".repeat(Math.max(1, Math.ceil(longestNameLength - itemName.length + 1)))}` + "\033[0m" + `${description}`);
    }
}

// Create all blank entries in descriptions.json for the current directory and all subdirectories
function createBlankEntries() {
    const descriptionsPath = path.join(__dirname, 'descriptions.json');

    // If descriptions.json doesn't exist, create an empty object
    if (!fs.existsSync(descriptionsPath)) {
        fs.writeFileSync(descriptionsPath, '{}');
    }

    // Read the descriptions from descriptions.json
    let descriptions = {};
    try {
        descriptions = JSON.parse(fs.readFileSync(descriptionsPath));
    } catch (error) {
        console.error('Error reading descriptions.json:', error.message);
        return;
    }

    // Get all files and directories recursively below the current directory
    const allItems = glob.sync('**/*', {
        cwd: process.cwd(),
        dot: true,
        ignore: ['node_modules/**/*', 'descriptions.json', '**/.git/**/*'],
    });

    // Create blank descriptions for each item that doesn't have a description in descriptions.json
    for (const itemPath of allItems) {
        if (!descriptions.hasOwnProperty(itemPath)) {
            descriptions[itemPath] = '';
        }
    }

    // Write the updated descriptions to descriptions.json
    try {
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions));
    } catch (error) {
        console.error('Error writing descriptions.json:', error.message);
        return;
    }

    console.log('Blank entries created for all files and directories below the current directory');
}


// Function to run the ls command
function run() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        ls();
        //} else if (args.includes('-i') || args.includes('--init')) {
        //    createBlankEntries();
        //    return;
    } else {
        let showHidden = false;
        let directories = [];
        let helpMenu = false;

        args.forEach(arg => {
            switch (arg) {
                case '-h':
                case '--help':
                    helpMenu = true;
                    help();
                    break;
                case '-a':
                case '--all':
                    showHidden = true;
                    break;
                default:
                    if (fs.existsSync(arg)) {
                        directories.push(arg);
                    }
                    break;
            }
        });

        if (directories.length === 0 && !helpMenu) {
            ls();
        } else {
            directories.forEach(dir => lsDir(dir, showHidden));
        }
    }
}



// Run the ls command
run();
