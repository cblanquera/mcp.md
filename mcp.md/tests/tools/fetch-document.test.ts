//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/fetch-document.js';

describe('tool: fetch_document', () => {
  it('fetches a whole document', async () => {
    const { store } = setup();
    const res = await tool.handler({
      topic: 'coding',
      document: 'Coding-Standards.md'
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.sections).to.be.an('array').that.is.not.empty;
  });

  it('fetches only selected sections by id', async () => {
    const { store } = setup();
    const res = await tool.handler({
      topic: 'coding',
      document: 'Coding-Standards.md',
      sections: ['coding:Coding-Standards.md#1.3']
    }, store);
    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.sections).to.have.length(1);
    expect(actual.sections[0].id).to.equal('coding:Coding-Standards.md#1.3');
  });
});
