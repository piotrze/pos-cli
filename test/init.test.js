const exec = require('./utils/exec');
const cliPath = require('./utils/cliPath');

const glob = require('tiny-glob');

const cwd = name => `${process.cwd()}/test/fixtures/init/${name}`;

test('Does not override default directory contents without force flag', async () => {
  try {
    await exec(`${cliPath} init`, { cwd: cwd('notEmpty') });
  } catch(e) {
    const files = await glob('**', { cwd: cwd('notEmpty'), filesOnly: true });
    expect(files.length).toBe(0);
    expect(`${e}`).toMatch('Init failed. Reason: destination directory is not empty, aborting. Use options.force to override');
  }
});

test('Default directory structure is created', async () => {
  const { stdout } = await exec(`${cliPath} init --force`, { cwd: cwd('default') });

  expect(stdout).toMatch('Directory structure sucessfully created.');

  const files = await glob('**', { cwd: cwd('default'), filesOnly: true });
  expect(files).toContain('app/translations/en.yml');
  expect(files).toContain('app/views/partials/layout/footer.liquid');
  expect(files).toContain('app/notifications/sms_notifications/example.liquid');
  expect(files).toContain('app/authorization_policies/example_policy.liquid');
  expect(files).toContain('app/graph_queries/example.graphql');
  expect(files).toContain('app/notifications/api_call_notifications/example.liquid');
  expect(files).toContain('app/notifications/email_notifications/example.liquid');
});

test.only('Inits with custom url and branch', async () => {
  // const { stdout } = await exec(`${cliPath} init --force`, { cwd: cwd('custom') });

  // expect(stdout).toMatch('Directory structure sucessfully created.');

  // const files = await glob('**', { cwd: cwd('default'), filesOnly: true });
  // expect(files).toContain('app/translations/en.yml');
  // expect(files).toContain('app/views/partials/layout/footer.liquid');
  // expect(files).toContain('app/notifications/sms_notifications/example.liquid');
  // expect(files).toContain('app/authorization_policies/example_policy.liquid');
  // expect(files).toContain('app/graph_queries/example.graphql');
  // expect(files).toContain('app/notifications/api_call_notifications/example.liquid');
  // expect(files).toContain('app/notifications/email_notifications/example.liquid');

});