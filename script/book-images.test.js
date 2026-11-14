const { test } = require('node:test');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

test('image preview/apply supports new editions without writing official metadata', () => {
    execFileSync('python3', ['-c', `
import importlib.util
import json
import tempfile
from pathlib import Path
from PIL import Image
import sys

spec = importlib.util.spec_from_file_location('book_images', sys.argv[1])
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
for existing in (False, True):
    with tempfile.TemporaryDirectory(prefix='book-images-test-') as temp:
        root = Path(temp)
        raw = root / 'data/_raw'
        raw.mkdir(parents=True)
        official = root / 'data/book/test-book.json'
        old = {'id': 'test-book', 'editions': [{'id': 'old', 'thumbnail': '/old.jpg', 'gellery_imgs': []}]}
        if existing:
            official.parent.mkdir(parents=True)
            official.write_text(json.dumps(old))
        before = official.read_bytes() if existing else None
        draft = {'id': 'test-book', 'editions': [*old['editions'], {'id': 'new', 'thumbnail': '', 'gellery_imgs': []}]}
        (raw / 'book.json').write_text(json.dumps(draft))
        (raw / 'evidence.json').write_text(json.dumps({'images': []}))
        Image.new('RGB', (1800, 2400), 'ivory').save(raw / 'source.jpg')
        plan = {'book_id': 'test-book', 'images': [{'source': 'source.jpg', 'name': 'new-cover.jpg',
                'edition_id': 'new', 'role': 'thumbnail', 'reason': 'New edition cover'}]}
        (raw / 'image-plan.json').write_text(json.dumps(plan))
        report = module.preview(root)
        assert report['images'][0]['bytes_after'] < report['images'][0]['bytes_before']
        module.apply(root)
        saved = json.loads((raw / 'book.json').read_text())
        assert saved['editions'][0] == old['editions'][0]
        assert saved['editions'][1]['thumbnail'] == '/assets/img/books/test-book/new-cover.jpg'
        assert saved['editions'][1]['gellery_imgs'] == []
        assert len(list((root / 'assets/img/books/test-book').iterdir())) == 1
        assert official.read_bytes() == before if existing else not official.exists()
        evidence = json.loads((raw / 'evidence.json').read_text())
        assert evidence['images'][0]['edition_id'] == 'new'
        assert evidence['images'][0]['asset_sha256'] == module.digest(root / evidence['images'][0]['asset'])
`, path.join(__dirname, 'book-images.py')], { encoding: 'utf8' });
});
