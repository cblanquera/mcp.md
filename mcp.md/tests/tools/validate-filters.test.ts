//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/validate-filters.js';

describe('tool: validate_filters', () => {
  it('validates topics and tags and suggests alternatives', async () => {
    const { store } = setup();
    const res = await tool.handler({
      topics: ['coding','unknown-topic'],
      include_tags: ['style guide','missing-tag'],
      suggest_on_missing: true
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.topics.ok).to.include('coding');
    expect(actual.topics.missing).to.include('unknown-topic');
    expect(actual.include_tags.missing).to.include('missing-tag'); // note: tool may output snake_case or camel, adjust if needed
    expect(actual.suggestions).to.be.an('object');
  });
});
