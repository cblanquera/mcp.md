//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/check-rules.js';

describe('tool: checklist', () => {
  it('builds a grouped checklist from rules', async () => {
    const { store } = setup();
    const res = await tool.handler({
      task: 'write code per style guide',
      topics: ['coding'],
      // snake_case everywhere:
      require_tags: ['ruleset']
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.format).to.equal('json');
    expect(actual.checklist).to.have.keys(['MUST','SHOULD','MUST NOT','UNKNOWN']);
    expect(actual.checklist.MUST.length + actual.checklist['MUST NOT'].length + actual.checklist.SHOULD.length).to.be.greaterThan(0);
  });

  it('can return markdown format', async () => {
    const { store } = setup();
    const res = await tool.handler({
      task: 'follow rules',
      topics: ['coding'],
      require_tags: ['ruleset'],
      format: 'markdown'
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.format).to.equal('markdown');
    expect(actual.checklist).to.be.a('string');
    expect(actual.checklist).to.contain('##');
  });
});
