//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/fetch-section.js';

describe('tool: fetch_section', () => {
  it('fetches sections and expands neighbors', async () => {
    const { store } = setup();
    const res = await tool.handler({
      ids: ['coding:Coding-Standards.md#1.2'],
      expand: { before: 1, after: 1 }
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.sections).to.be.an('array');
    // with neighbors, expect more than the single seed
    expect(actual.sections.length).to.be.greaterThan(1);
  });
});
