# Ghost theme environment

inspired by https://www.steelcm.com/ghost-theme-development-using-docker/

## TODO

set up templating for docker-compose

## Prerequesites

First make sure to have [docker](https://docs.docker.com/) and [docker-compose](https://docs.docker.com/compose/) installed. These
will be used to run the **Ghost** instance for the theme developemt inside of a container.

## Creating a new theme

The first thing you need to do is to install this script with `npm install -g ghothede`.

Now just run it with `ghothede`. 
You will be asked a few questions.

The script will now create the necessary files into the specified **output** folder (default is `ouput`).

Once completed `cd` into to that folder (`cd output`) and run `docker-compose up -d`. This will start the **Ghost** container in the background.

Your instance will be available at `http://localhost:$PORT` where `$PORT` is the one you specified during the questions.

Finish the setup and activate your theme as usual.

$SCREENSHOT

Now everything is set up to develop the theme.

## Developing the theme

Inside the created folder you need to run `npm install` to install all **node** dependencies and then start the development **gulp** script with either `npm run start` or `gulp watch`.

All the files for theme are located under `src`. 

**CSS** and **JS** files should be put under `src/assets/css`/`src/assets/js`.

For more info on theme development head over to the [official docs](https://themes.ghost.org/docs).
