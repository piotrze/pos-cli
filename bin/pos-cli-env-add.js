#!/usr/bin/env node

const program = require('commander'),
  fs = require('fs'),
  rl = require('readline'),
  logger = require('../lib/logger'),
  validate = require('../lib/validators'),
  files = require('../lib/files'),
  Portal = require('../lib/portal');

// turn to promise
const getPassword = () => {
  return new Promise((resolve, reject) => {
    const reader = rl.createInterface({ input: process.stdin, output: process.stdout });
    reader.stdoutMuted = true;
    reader.question('Password: ', password => {
      reader.close();
      logger.Info('');
      resolve(password);
    });

    reader._writeToOutput = stringToWrite => {
      (reader.stdoutMuted && reader.output.write('*')) || reader.output.write(stringToWrite);
    };
  });
};

const storeEnvironment = settings => {
  logger.Debug(`[storeEnvironment] ${JSON.stringify(settings, null, 2)}`);

  const environmentSettings = {
    [settings.endpoint]: {
      url: settings.url,
      token: settings.token,
      email: settings.email
    }
  };

  const configPath = files.getConfigPath();
  logger.Debug(`[storeEnvironment] Current config path: ${configPath}`);

  const newSettings = Object.assign({}, files.getConfig(), environmentSettings);
  fs.writeFileSync(configPath, JSON.stringify(newSettings, null, 2));
};

const checkParams = params => {
  validate.existence({ argumentValue: params.email, argumentName: 'email', fail: program.help.bind(program) });
  validate.existence({ argumentValue: params.url, argumentName: 'URL', fail: program.help.bind(program) });
  validate.existence({ argumentValue: program.args[0], argumentName: 'environment', fail: program.help.bind(program) });
  validate.email(params.email);

  if (params.url.slice(-1) != '/') {
    params.url = params.url + '/';
  }

  validate.url(params.url);
};

program
  .name('pos-cli env add')
  .arguments('[environment]', 'name of environment. Example: staging')
  .option('--email <email>', 'Partner Portal account email. Example: admin@example.com')
  .option('--url <url>', 'marketplace url. Example: https://example.com')
  .option(
    '--token <token>',
    'if you have a token you can add it directly to pos-cli configuration without connecting to portal'
  )
  .action((environment, params) => {
    checkParams(params);
    const settings = { url: params.url, endpoint: environment, email: params.email };

    if (params.token) {
      storeEnvironment(Object.assign(settings, { token: params.token }));
      logger.Success(`Environment ${params.url} as ${environment} has been added successfuly.`);
      process.exit(0);
    }

    logger.Info(
      `Please make sure that you have a permission to deploy. \n
      You can verify it here: ${Portal.HOST}/me/permissions`,
      { hideTimestamp: true }
    );

    getPassword().then(password => {
      logger.Info(`Asking ${Portal.HOST} for access token...`);

      Portal.login(params.email, password, params.url)
        .then(response => {
          const token = response[0].token;

          if (token) {
            storeEnvironment(Object.assign(settings, { token }));
            logger.Success(`Environment ${params.url} as ${environment} has been added successfuly.`);
          }
        })
        .catch(e => {
          logger.Error('Response from server invalid, token is missing.');
        });
    });
  });

program.parse(process.argv);
