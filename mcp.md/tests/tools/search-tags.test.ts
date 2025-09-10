//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/search-tags.js';

describe('tool: search_tags', () => {
  it('suggests tags for phrases', async () => {
    const { store } = setup();
    const res = await tool.handler({
      phrases: ['style guide', 'coding']
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.suggestions).to.be.an('array').with.length(2);
    expect(actual.suggestions[0]).to.be.an('array');
  });
});
