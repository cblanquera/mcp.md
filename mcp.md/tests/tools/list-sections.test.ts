//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/list-sections.js';

describe('tool: list_sections', () => {
  it('lists sections for a document', async () => {
    const { store } = setup();
    const res = await tool.handler({
      topic: 'coding',
      document: 'Coding-Standards.md'
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.sections).to.be.an('array').that.is.not.empty;
    expect(actual.sections[0]).to.have.keys(['id','section_path']);
  });
});
