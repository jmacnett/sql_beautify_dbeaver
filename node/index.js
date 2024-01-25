'use strict';

const fs = require('fs');
const beautify = require('./beautify');

async function main() {
    if(!fs.existsSync(process.argv[2])) {
        console.error(`File '${process.argv[2]}' does not exist`);
        process.exit(1);
    }
    // read raw input
    const raw = fs.readFileSync(process.argv[2], 'utf8');
    const sql = beautify.process(raw);
    console.log(sql);
}

main()
    .finally(()=> {
        //console.log("Execution complete!");
    });