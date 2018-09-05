const {compileFilesInDir} = require('./src/templating.js');
const {log} = require('./src/log.js');


async function main(){
  try {
    await compileFilesInDir('./input');
    log('Done');
  } catch(e) {
    log(e);
  }
}

main();
