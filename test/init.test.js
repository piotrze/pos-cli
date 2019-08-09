/* global afterAll, beforeAll */
const glob = require('tiny-glob');
const rimraf = require('rimraf');

const exec = require('./utils/exec');
const cliPath = require('./utils/cliPath');

const cwd = name => `${process.cwd()}/test/fixtures/init/${name}`;

const expectedFiles = [
  'app/translations/en.yml',
  'app/views/partials/layout/footer.liquid',
  'app/notifications/sms_notifications/example.liquid',
  'app/authorization_policies/example_policy.liquid',
  'app/graph_queries/example.graphql',
  'app/notifications/api_call_notifications/example.liquid',
  'app/notifications/email_notifications/example.liquid'
];

test('Does not override default directory contents without force flag', async () => {
  try {
    await exec(`${cliPath} init`, { cwd: cwd('notEmpty') });
  } catch (e) {
    const files = await glob('**', { cwd: cwd('notEmpty'), filesOnly: true, dot: true });
    expect(files.length).toBe(1);
    expect(`${e}`).toMatch(
      'Init failed. Reason: destination directory is not empty, aborting. Use options.force to override'
    );
  }
});

test('Default directory structure is created, --force is working', async () => {
  const { stdout } = await exec(`${cliPath} init --force`, { cwd: cwd('default') });
  const files = await glob('**', { cwd: cwd('default'), filesOnly: true });


  expect(stdout).toMatch('Directory structure sucessfully created.');

  expectedFiles.forEach(expected => {
    expect(files).toContain(expected);
  });
});

test('Inits with custom url and branch', async () => {
  const url = 'git@bitbucket.org:pavelloz/directory-structure.git';
  const branch = 'pos-cli-test';

  const { stdout } = await exec(`${cliPath} init --url ${url} --branch ${branch} --force`, { cwd: cwd('custom') });
  const files = await glob('**', { cwd: cwd('custom'), filesOnly: true });


  expect(stdout).toMatch('Directory structure sucessfully created.');

  expectedFiles.forEach(expected => {
    expect(files).toContain(expected);
  });
});

const cleanup = () => {
  const opts = {
    glob: {
      dot: true
    }
  };

  rimraf.sync(`${cwd('custom')}/*`, opts);
  rimraf.sync(`${cwd('default')}/*`, opts);
};

afterAll(cleanup);
beforeAll(cleanup);
