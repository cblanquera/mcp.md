//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/extract-code.js';

describe('tool: extract_code', () => {
  it('extracts fenced code blocks from a section', async () => {
    const { store } = setup();
    const res = await tool.handler({
      // this one has a code fence in mock
      ids: [
        'coding:Coding-Standards.md#1.2.1',
        'coding:Coding-Standards.md#1.2.2'
      ]
    }, store);
    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.count).to.be.a('number');
    expect(actual.blocks).to.be.an('array');
    // since #2 has a code fence in mocks, expect at least one block
    expect(actual.count).to.be.greaterThan(0);
  });
});
