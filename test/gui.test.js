const exec = require('./utils/exec');
const readFile = require('./utils/readFile');
const execAsync = require('child_process').exec;
const rimraf = require('rimraf');

require('dotenv').config();

const cliPath = require('./utils/cliPath');
require('dotenv').config();

const cwd = `${process.cwd()}/test/fixtures/gui/`;

describe.skip('GUI', () => {
  test('Graphiql loads', async () => {
    const cmd = execAsync(`${cliPath} gui serve test > output.txt`, { cwd, env: process.env });
    const pid = cmd.pid;
    process.kill(pid);

    console.log(cwd, pid);

    const output = readFile(`${cwd}/output.txt`);

    expect(output).toMatch('https://qa-17263.staging.oregon.platform-os.com/');
    expect(output).toMatch('http://localhost:3333/gui/editor');
    expect(output).toMatch('http://localhost:3333/gui/graphql');
  });

  test('Informs user when port is already taken', async () => {
  });

  test('Port argument works', async () => {
    const { stdout } = await exec(`${cliPath} gui serve test --port 1337`, { cwd });
    // expect(output).toMatch('http://localhost:1337/gui/editor');

  });
});
