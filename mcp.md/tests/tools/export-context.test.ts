//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/export-context.js';

describe('tool: export_context', () => {
  it('exports selected ids as JSON with meta', async () => {
    const { store } = setup();
    const res = await tool.handler({
      ids: ['coding:Coding-Standards.md#1.1','coding:Coding-Standards.md#1.3'],
      format: 'json',
      include_meta: true
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.format).to.equal('json');
    expect(actual.sections).to.have.length(2);
    expect(actual.sections[0]).to.have.keys(['id','section_path','text','tags']);
  });

  it('exports a document as Markdown', async () => {
    const { store } = setup();
    const res = await tool.handler({
      topic: 'coding',
      document: 'Coding-Standards.md',
      format: 'markdown'
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.format).to.equal('markdown');
    expect(actual.content).to.be.a('string');
    expect(actual.content).to.contain('###');
  });
});
