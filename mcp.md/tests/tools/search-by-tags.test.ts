//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/search-by-tags.js';

describe('tool: search_by_tags', () => {
  it('returns hits when tags match', async () => {
    const { store } = setup();
    const res = await tool.handler({
      query: 'anything',
      topics: ['coding'],
      require_tags: ['ruleset']
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.hits).to.be.an('array').that.is.not.empty;
  });
});
