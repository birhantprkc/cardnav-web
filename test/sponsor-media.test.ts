import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm, writeFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { serveSponsorMedia } from '../src/sponsor-media.js';

test('serves original Unicode filenames while rejecting traversal, symlinks and unsupported formats', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'sponsor-media-'));
  const previous = process.env.MEDIA_UPLOAD_DIR;
  process.env.MEDIA_UPLOAD_DIR = directory;
  try {
    await writeFile(path.join(directory, '图片 logo.png'), Buffer.from([137, 80, 78, 71]));
    await symlink(path.join(directory, '图片 logo.png'), path.join(directory, 'link.png'));
    const response = await serveSponsorMedia('图片 logo.png');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/png');
    assert.equal((await response.arrayBuffer()).byteLength, 4);
    assert.equal(await (await serveSponsorMedia('图片 logo.png', 'HEAD')).text(), '');
    for (const name of ['../secret.png', 'nested/image.png', 'link.png', 'image.html', 'missing.png', 'a\\b.png']) {
      assert.equal((await serveSponsorMedia(name)).status, 404, name);
    }
  } finally {
    if (previous === undefined) delete process.env.MEDIA_UPLOAD_DIR;
    else process.env.MEDIA_UPLOAD_DIR = previous;
    await rm(directory, { recursive: true, force: true });
  }
});


test('serves imported SVG artwork with inline styles and an isolated document policy', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'sponsor-svg-'));
  const previous = process.env.MEDIA_UPLOAD_DIR;
  process.env.MEDIA_UPLOAD_DIR = directory;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><style>rect { fill: red; }</style><rect width="40" height="20"/></svg>';
  try {
    await writeFile(path.join(directory, '原始标志.svg'), svg);
    await symlink(path.join(directory, '原始标志.svg'), path.join(directory, 'link.svg'));
    const response = await serveSponsorMedia('原始标志.svg');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/svg+xml');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    const policy = response.headers.get('content-security-policy')!;
    assert.match(policy, /(?:^|; )sandbox(?:;|$)/);
    assert.match(policy, /default-src 'none'/);
    assert.match(policy, /style-src 'unsafe-inline'/);
    assert.match(policy, /img-src data:/);
    assert.equal(await response.text(), svg);
    const head = await serveSponsorMedia('原始标志.svg', 'HEAD');
    assert.equal(head.headers.get('content-type'), 'image/svg+xml');
    assert.equal(await head.text(), '');
    assert.equal((await serveSponsorMedia('link.svg')).status, 404);
  } finally {
    if (previous === undefined) delete process.env.MEDIA_UPLOAD_DIR;
    else process.env.MEDIA_UPLOAD_DIR = previous;
    await rm(directory, { recursive: true, force: true });
  }
});
