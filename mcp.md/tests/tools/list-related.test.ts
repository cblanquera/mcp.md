//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/list-related.js';

describe('tool: list_related', () => {
  it('finds related sections by tags', async () => {
    const { store } = setup();
    const res = await tool.handler({
      id: 'coding:Coding-Standards.md#1',
      strategy: 'tags'
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.related).to.be.an('array');
  });

  it('finds neighbors within the same document', async () => {
    const { store } = setup();
    const res = await tool.handler({
      id: 'coding:Coding-Standards.md#1.2',
      strategy: 'document',
      limit: 5
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.related).to.be.an('array');
  });
});
