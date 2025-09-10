//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/list-topics.js';

describe('tool: list_topics', () => {
  it('returns available topics', async () => {
    const { store } = setup();
    const res = await tool.handler(store);
    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.topics).to.include('coding');
  });
});
