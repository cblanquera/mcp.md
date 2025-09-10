//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/summarize-context.js';

describe('tool: summarize_context', () => {
  it('gathers sections by ids with soft char cap', async () => {
    const { store } = setup();
    const res = await tool.handler({
      ids: ['coding:Coding-Standards.md#1.1','coding:Coding-Standards.md#1.2'],
      max_chars: 500,
      strip_code: false,
      include_meta: true
    }, store);
    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.gathered).to.be.an('array').that.is.not.empty;
    expect(actual.totalChars).to.be.a('number');
  });

  it('gathers by document', async () => {
    const { store } = setup();
    const res = await tool.handler({
      topic: 'coding',
      document: 'Coding-Standards.md',
      max_chars: 1000
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.gathered).to.be.an('array').that.is.not.empty;
  });
});
