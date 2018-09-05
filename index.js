const handlebars = require('handlebars');
const config = require("./config.json");
const fs = require('fs')

const inputFolder = './input'
const outputFolder = './output'

function log(...data){
  console.log(data)
}

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

function writeToOutput(path, content){
  const outputPath = path.replace(/input/, 'output')

  // make sure all dirs exist before writing file
  outputPath.split('/').reduce(function(prev, curr, i) {
    if (fs.existsSync(prev) === false) {
      fs.mkdirSync(prev);
    }
    return prev + '/' + curr;
  });

  log(`Writing ${outputPath}`)
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
  writeToOutput(path, result);

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
  log(`Creating ${path}`)
  fs.mkdirSync(path);

}

async function compileFilesInDir(path ) {
  return new Promise((res, rej) => {
    fs.readdir(path, async (err, files) => {
      const compilePromises = files.map(file => {
        return new Promise(async (res, rej) => {
          const filePath = `${path}/${file}`
          try {
            const isDirectory = await isDir(filePath);
            if (isDirectory){
              await compileFilesInDir(filePath);
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


async function main(){
  try {
    await compileFilesInDir(inputFolder)
    log('Done');
  } catch(e) {
    log(e);
  }

}

main();
