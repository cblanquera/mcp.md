//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/dedupe-context.js';

describe('tool: dedupe_context', () => {
  it('drops near-duplicates over threshold', async () => {
    const { store } = setup();
    const docs = await store.search('', { topics: [ 'fixtures' ], limit: 1000 });
    const res = await tool.handler({
      ids: [
        'fixtures:Sample-Document-1.md#1.1',
        'fixtures:Sample-Document-1.md#1.2',
        'fixtures:Sample-Document-1.md#1.3'
      ],
      threshold: 0.70,
      keep_strategy: 'first'
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    expect(actual.kept).to.include('fixtures:Sample-Document-1.md#1.1');
    expect(actual.dropped.some((d: any) => d.id === 'fixtures:Sample-Document-1.md#1.3')).to.equal(true);
  });
});
