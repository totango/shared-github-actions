'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'require-jira-title.yml');
const workflow = fs.readFileSync(workflowPath, 'utf8');
const patternMatch = workflow.match(/const jiraKeyPattern = '((?:\\.|[^'])*)';/);

assert.ok(patternMatch, 'workflow must define jiraKeyPattern');
assert.match(
  workflow,
  /matching \$\{jiraKeyPattern\}/,
  'workflow failure output must report the policy pattern it applies',
);
const jiraKeyPattern = JSON.parse(`"${patternMatch[1]}"`);
const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'jira-title-cases.json'), 'utf8'));

for (const { title, accepted } of cases) {
  assert.equal(
    new RegExp(jiraKeyPattern).test(title),
    accepted,
    `expected ${JSON.stringify(title)} to be ${accepted ? 'accepted' : 'rejected'}`,
  );
}

console.log(`Validated ${cases.length} Jira title fixtures against the workflow policy pattern.`);
