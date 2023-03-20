/**
 * @fileoverview CUSTOM LS
 * A custom ls command that allows you to add descriptions to your files and folders.
 * Copyright (c) 2023 Spencer Boggs
 */

const fs = require('fs');
const path = require('path');

// Function to display the help menu
function help() {
    console.log('Usage: cls [options][paths...]');
    console.log('\nOptions:');
    console.log('\tList information about the FILEs (the current directory by default).');
    console.log('\t-h, --help\t\tDisplay this help menu');
    console.log('\t-a, --all\t\tDo not ignore entries starting with .');
}

// Function to display the items in the current directory
// Function should display the name of the file or folder and the description from descriptions.json in the same folder as the file
function ls() {
    // Get the descriptions from the description.json file
    const descriptions = JSON.parse(fs.readFileSync(path.join(__dirname, 'descriptions.json'), 'utf8'));
    
    // Move to the directory the user is in
    const dir = process.cwd();
    process.chdir(dir);

    // Then get the full file path for each file in the directory
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        // Get the full path for the file
        const filePath = path.join(dir, file);
    });

    console.log(descriptions);
    
}

// Function to display the items in the specified directory
function lsDir(dir) {

}

// Function to run the ls command
function run() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        ls();
    } else {
        args.forEach(arg => {
            switch (arg) {
                case '-h':
                case '--help':
                    help();
                    break;
                case '-l':
                case '--long':
                    console.log('Long listing format');
                    break;
                case '-a':
                case '--all':
                    console.log('Do not ignore entries starting with .');
                    break;
                default:
                    lsDir(arg);
                    break;
            }
        });
    }
}

run();

