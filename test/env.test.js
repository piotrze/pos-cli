const exec = require('./utils/exec');
const cliPath = require('./utils/cliPath');
const readJSON = require('./utils/readJSON');

require('dotenv').config();

const cwd = name => `${process.cwd()}/test/fixtures/env/${name}`;

const cfg = {
  email: 'test@example.com',
  url: 'https://example.com/',
  token: 'xyz'
};

describe('Add', () => {
  test('Works when passing all arguments through ENVs', async () => {
    const args = `--email ${cfg.email} --url ${cfg.url} --token ${cfg.token}`;
    const { stdout } = await exec(`${cliPath} env add test ${args}`, { cwd: cwd('add') });

    const savedConfig = readJSON(`${cwd('add')}/.pos`);

    expect(savedConfig.test).toEqual(cfg);
    expect(stdout).toMatch(`Environment ${cfg.url} as test has been added successfuly.`);
  });

  test('Works when inserting password via CLI', async () => {
    const { MPKIT_EMAIL, MPKIT_URL, MPKIT_TOKEN, MPKIT_PASSWORD } = process.env;
    const args = `--email ${MPKIT_EMAIL} --url ${MPKIT_URL}`;
    const { stdout } = await exec(`echo '${MPKIT_PASSWORD}' | ${cliPath} env add test2 ${args}`, { cwd: cwd('add') });

    const savedConfig = readJSON(`${cwd('add')}/.pos`);

    expect(savedConfig.test2.token).toBe(MPKIT_TOKEN);
    expect(stdout).toMatch(`Environment ${MPKIT_URL} as test2 has been added successfuly.`);
  });

  test('Errors when credentials are incorrect', async () => {
    const args = `--email ${cfg.email} --url ${cfg.url}`;
    const env = Object.assign(process.env, { CI: true });
    try {
      await exec(`echo 'xyz' | ${cliPath} env add test3 ${args}`, { cwd: cwd('add'), env });
    } catch(e) {
      const savedConfig = readJSON(`${cwd('add')}/.pos`);

      expect(savedConfig.test3).toBeUndefined();
      expect(`${e}`).toMatch('Response from server invalid, token is missing.');
    }
  });
});

describe('List', () => {
  test('Shows added env', async () => {
    const { stdout } = await exec(`${cliPath} env list`, { cwd: cwd('list/correct') });
    expect(stdout).toMatch('test');
    expect(stdout).toMatch('https://example.com');
  });

  test('Errors if file is invalid', async () => {
    const env = Object.assign(process.env, { CI: true });

    try {
      await exec(`${cliPath} env list`, { cwd: cwd('list/incorrect'), env });
    } catch (error) {
      expect(`${error}`).toMatch('incorrect/.pos is not a valid JSON file. Use https://jsonlint.com to lint your JSON syntax.');
      expect(`${error}`).toMatch('Error thrown by the parser: Unexpected token [ in JSON at position 3');
    }

  });
});