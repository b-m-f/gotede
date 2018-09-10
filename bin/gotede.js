'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var handlebars = _interopDefault(require('handlebars'));
var fs = _interopDefault(require('fs'));
var prompt = _interopDefault(require('prompt'));

function log(...data){
  console.log(data);
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
  const file = await readFile(path);
  const template = handlebars.compile(file);
  const result = template(config);
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
      }); 
  })
}

async function compileFilesInDir(path, config) {
  return new Promise((res, rej) => {
    fs.readdir(path, async (err, files) => {
      if (err){
        rej(err);
        return;
      }
      const compilePromises = files.map(file => {
        return new Promise(async (res, rej) => {
          const filePath = `${path}/${file}`;
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
      });
      await Promise.all(compilePromises);
      res();
    });
  })
}

function getConfig() {
    const schema = {
      properties: {
        themeName: {
          description: `Please enter the name for your theme`,
          required: true
        },
        port: {
          description: `Under which port should ghost be available on your computer? `,
          required: true
        }
      }
  };

  return new Promise((res, rej) => {
      prompt.start();
      prompt.get(schema, function (err, result) {
        if(err){
          rej(err); 
        }
        res(result);
    });
  })

}

async function main(){
  try {
    const config = await getConfig();
    config.source = `${__dirname}/src`;
    config.destination = `${process.cwd()}/${config.themeName}`;
    await compileFilesInDir(config.source, config);
    log('All done. Go to the output directory and start the docker container with `docker-compose up -d`. Then active the theme in Ghost and start developing on the theme files in the `src` directory. For more information head over to Documentation.');
  } catch(e) {
    log(e);
  }
}

main();
