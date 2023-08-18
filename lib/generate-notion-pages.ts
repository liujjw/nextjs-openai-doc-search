import { Client } from '@notionhq/client';
import { NotionToMarkdown } from "notion-to-md";
import { readdir, readFile, stat, writeFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config()

async function generateMdFiles() {
  const notion = new Client({ auth: process.env.NOTION_KEY });
  const n2m = new NotionToMarkdown({ notionClient: notion });

  let counter = 0;
  while (true) {
    const pageID = process.env['NOTION_PAGE_ID' + '_' + counter];
    if (!pageID) break;
    const mdblocks = await n2m.pageToMarkdown(pageID);
    const mdString = n2m.toMarkdownString(mdblocks);
    
    const fileName = pageID + '.md';
    const content = mdString.parent;

    const outputDirectory = path.join(process.cwd(), 'pages');
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory);
    }

    try {
      const filePath = path.join(outputDirectory, fileName);
      await writeFile(filePath, content);  
      counter++;
    } catch (e) {
      console.error(e);
      break;
    }
  }
}

generateMdFiles().then(() => {
  console.log("generated notion md pages");
});