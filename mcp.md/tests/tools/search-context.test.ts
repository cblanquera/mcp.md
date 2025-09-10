//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/search-context.js';

describe('tool: search_context', () => {
  it('returns hits for a general query', async () => {
    const { store } = setup();
    const res = await tool.handler({
      query: 'coding'
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.hits).to.be.an('array').that.is.not.empty;
  });
});
