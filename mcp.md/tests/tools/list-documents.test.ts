//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/list-documents.js';

describe('tool: list_documents', () => {
  it('lists documents by topic', async () => {
    const { store } = setup();
    const res = await tool.handler({
      topics: ['coding']
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.documents).to.be.an('array').that.is.not.empty;
  });
});
