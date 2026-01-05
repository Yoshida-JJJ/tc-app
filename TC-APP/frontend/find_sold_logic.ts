import fs from 'fs';
import path from 'path';

const filePath = '/Users/jun_yoshida/Documents/my-pj/TC-APP/frontend/app/collection/page.tsx';
const content = fs.readFileSync(filePath, 'utf-8');

const regex = /\/\/\s*History:\s*Sold\s*Items[\s\S]*?setHistorySold/g;
const match = content.match(regex);
if (match) {
    console.log(match[0]);
} else {
    console.log('Not found');
}
