'use strict';

const {compileFilesInDir} = require('./src/templating.js');
const {log} = require('./src/log.js');
const prompt = require('prompt');


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
        },
        output: {
          description: `Where should the files be generated to? `,
          default: 'output',
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
    await compileFilesInDir(`${__dirname}/input`, config);
    log('All done. Go to the output directory and start the docker container with `docker-compose up -d`. Then active the theme in Ghost and start developing on the theme files in the `src` directory. For more information head over to Documentation.');
  } catch(e) {
    log(e);
  }
}

main();
