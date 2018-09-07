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

function writeToOutput(path, content, outputDir){
  const outputPath = path.replace(/input/, outputDir )

  // make sure all dirs exist before writing file
  outputPath.split('/').reduce(function(prev, curr, i) {
    if (fs.existsSync(prev) === false) {
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

async function compileFile(path, config) {
  const file = await readFile(path);
  const template = handlebars.compile(file);
  const result = template(config);
  writeToOutput(path, result, config.output);

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

function createDirectory(path){
  if (fs.existsSync(path)) {
    return;
  }
  fs.mkdirSync(path);

}

export async function compileFilesInDir(path, config) {
  return new Promise((res, rej) => {
    fs.readdir(path, async (err, files) => {
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

