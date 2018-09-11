import handlebars from 'handlebars';
import fs from 'fs';
import {log} from './log.js';


function readFile(path){
  return new Promise((res, rej) => {
    fs.readFile(path, 'utf8', function (err, data) {
      if (err) {
        rej(err);
        return;
      }
      res(data);
    });
  })
}

function getOutPutPath(inputPath, config){
  const relativePath = inputPath.replace(config.source,'');
  return `${config.destination}/${relativePath}`;

}

function writeToOutput(path, content, config){
  // get the correct input file path here
  const outputPath = getOutPutPath(path, config);

  // make sure all dirs exist before writing file
  outputPath.split('/').reduce(function(prev, curr, i) {
    if (prev && fs.existsSync(prev) === false) {
      fs.mkdirSync(prev);
    }
    return prev + '/' + curr;
  });

  return new Promise((res, rej) => {
    fs.writeFile(outputPath, content, function(err) {
      if(err) {
        rej(err);
        return;
      }
      res(true);
    });
  })
}

// get root path and file relative for output writer
async function compileFile(path, config) {
  const fileExtension = path.split('.').pop();
  const file = await readFile(path);
  const template = handlebars.compile(file);
  const result = fileExtension === 'hbs' ? file : template(config);
  writeToOutput(path, result, config);
}

async function isDir(path){
  return new Promise((res, rej) => {
      fs.stat(path, async (err, stats) => {
        if(err) {
          rej(err);
          return;
        }
        if(stats.isDirectory()){
          res(true);
          return;
        }
        res(false);
      }) 
  })
}

export async function compileFilesInDir(path, config) {
  return new Promise((res, rej) => {
    fs.readdir(path, async (err, files) => {
      if (err){
        rej(err);
        return;
      }
      const compilePromises = files.map(file => {
        return new Promise(async (res, rej) => {
          const filePath = `${path}/${file}`
          try {
            const isDirectory = await isDir(filePath);
            if (isDirectory){
              await compileFilesInDir(filePath, config);
              res();
            }
            else {
              try{
                await compileFile(filePath, config);
                res();
              }
              catch(e){
                rej(e);
              }
            }
          }
          catch(e){
            rej(e);
          }
        })
      })
      await Promise.all(compilePromises);
      res();
    });
  })
}

