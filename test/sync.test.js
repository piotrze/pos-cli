// const { exec } = require('child_process');

const exec = require('./utils/exec');
const cliPath = require('./utils/cliPath');
const wait = require('./utils/wait');

require('dotenv').config();

const TIMEOUT = 10000;
jest.setTimeout(TIMEOUT);

const cwd = () => `${process.cwd()}/test/fixtures/sync`;

const run = () => exec(`${cliPath} sync`, { cwd: cwd(), env: process.env, timeout: (TIMEOUT - 1000) });

describe.only('Success', () => {

  test('Shows success message with URL', async done => {
    // expect.assertions(1);

    const { stdout } = await run();

    console.log(stdout);
    await wait(500);
    // cmd.stdout.on('data', async data => {
    expect(stdout).toMatch(`Synchronizing changes to: ${process.env.MPKIT_URL}`);

    await exec('touch hello.liquid', { cwd: `${cwd()}/app/views/pages` });

    await wait(1000);

    expect(stdout).toMatch(`hello.liquid`);

    done();
    // });

    // cmd.kill();

    // cmd.stderr.on('data', data => {
    //   console.log(`stderr: ${data}`);
    // });

    // cmd.on('close', code => {
    //   console.log(`child process exited with code ${code}`);
    // });

    // cmd.kill();
  });

  // afterAll(() => {
  // });
});

test('app/ - Shows success message after file sync', async done => {
//  expect.assertions(1);

  const cmd = run();

  cmd.stdout.on('data', async data => {
    console.log('stdout', data);
    await execp('touch hello.liquid', { cwd: `${cwd()}/app/views/pages` });
    await wait(1500);
    expect(data).toMatch('Synced: views/pages/hello.liquid');
    done();
  });

  cmd.kill();

});

test('modules/ - Shows success message after file sync', async () => {
});

test('marketplace_builder/ - Shows success message after file sync', async () => {
});

test('Shows error and does not exit', async () => {

});