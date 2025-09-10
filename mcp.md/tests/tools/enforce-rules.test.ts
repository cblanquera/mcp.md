//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/enforce-rules.js';

describe('tool: enforce_rules', () => {
  it('returns applicable rules for a draft', async () => {
    const { store } = setup();
    const res = await tool.handler({
      draft: 'this is my draft following coding standards',
      topics: ['coding'],
      require_tags: ['ruleset']
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.rules).to.be.an('array');
    // at least one ruleset section should be returned from seeded store
    expect(actual.rules.length).to.be.greaterThan(0);
  });
});
