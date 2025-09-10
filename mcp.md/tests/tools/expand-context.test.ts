//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/expand-context.js';

describe('tool: expand_context', () => {
  it('expands by neighbors and related-by-tags', async () => {
    const { store } = setup();
    const res = await tool.handler({
      ids: ['coding:Coding-Standards.md#1.2'],
      neighbors: { before: 1, after: 1 },
      related_by_tags: true,
      limit_related: 10,
      unique_only: true
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.seeds).to.deep.equal(['coding:Coding-Standards.md#1.2']);
    expect(actual.neighbors).to.include('coding:Coding-Standards.md#1.3.1');
    expect(actual.neighbors).to.include('coding:Coding-Standards.md#1.2.2');
    expect(actual.expanded).to.be.an('array').that.is.not.empty;
  });
});
