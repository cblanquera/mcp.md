//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/compare-context.js';

describe('tool: compare_context', () => {
  it('compares pairs and reports cosine + hints', async () => {
    const { store } = setup();
    const res = await tool.handler({
      left_ids: ['coding:Coding-Standards.md#1.1'],
      right_ids: ['coding:Coding-Standards.md#1.2'],
      similarity: true,
      diff_hints: true
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.pairs).to.have.length(1);
    const pair = actual.pairs[0];
    expect(pair.left.id).to.equal('coding:Coding-Standards.md#1.1');
    expect(pair.right.id).to.equal('coding:Coding-Standards.md#1.2');
    expect(pair).to.have.property('cosine');
    expect(pair.hints).to.have.property('rule_changed');
  });
});
