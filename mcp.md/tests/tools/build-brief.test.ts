//modules
import { expect } from 'chai';
//tests
import setup from '../workspace/fixture.js';
//src
import * as tool from '../../src/tools/build-brief.js';

describe('tool: build_brief', () => {
  it('returns a brief with references from ruleset', async () => {
    const { store } = setup();
    const res = await tool.handler({
      task: 'follow coding style',
      topics: ['coding'],
      require_tags: ['ruleset']
    }, store);

    const actual = JSON.parse(res.content[0].text as string);
    const refs = actual.references || actual.brief?.references;
    expect(refs, 'expected references array').to.be.an('array');
    expect(refs.length).to.be.greaterThan(0);
  });
});
