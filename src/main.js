import {compileFilesInDir} from './templating.js';
import {log} from './log.js';
import prompt from 'prompt';


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
