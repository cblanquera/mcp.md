//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/list-tags.js';

describe('tool: list_tags', () => {
  it('lists tags (optionally filtered)', async () => {
    const { store } = setup();
    const res = await tool.handler({ query: 'style' }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.tags).to.be.an('array');
    expect(actual.tags.some((t: string) => t.includes('style'))).to.equal(true);
  });
});
