const handlebars = require('handlebars');
const config = require("./config.json");
const fs = require('fs')

const {port, themeName} = config;


async function compileFile(path, config) {
  const file = await readFile(`./input/${path}`);
  console.log(file)
  const template = handlebars.compile(file);
  const result = template(config);
  writeToFile(`./output/${path}`, result);

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


function writeToFile(path, content){
  return new Promise((res, rej) => {
    fs.writeFile(path, content, function(err) {
      if(err) {
        rej(err);
        return;
      }
      res(true);
    });
  })
}



compileFile('docker-compose.yml', config);


console.log(config);
