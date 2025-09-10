//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/cite-context.js';

describe('tool: cite_context', () => {
  it('resolves section ids into citation metadata', async () => {
    const { store } = setup();
    const ids = [
      'coding:Coding-Standards.md#1',
      'coding:standards.md#1'
    ];
    const res = await tool.handler({ ids }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.citations).to.be.an('array').with.length(2);
    expect(actual.citations[0]).to.have.property('topic');
    expect(actual.citations[0]).to.have.property('document');
    expect(actual.citations[1].error).to.equal('not_found');
  });
});
