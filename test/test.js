const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { AVLTree } = require('../src/index.js');

describe('AVLTree — Construction & Basic', () => {
  it('creates empty tree', () => {
    const t = new AVLTree();
    assert.equal(t.size, 0);
    assert.equal(t.isEmpty(), true);
    assert.equal(t.height(), 0);
    assert.equal(t.min(), undefined);
    assert.equal(t.max(), undefined);
  });

  it('creates from iterable', () => {
    const t = AVLTree.from([5, 3, 7, 1, 4]);
    assert.equal(t.size, 5);
    assert.equal(t.isEmpty(), false);
  });
});

describe('AVLTree — Insert', () => {
  it('inserts values and maintains AVL property', () => {
    const t = new AVLTree();
    for (let i = 1; i <= 100; i++) t.insert(i);
    assert.equal(t.size, 100);
    assert.ok(t.isValid());
    // Sequential insert of 1..100 should yield height ~7-8 (log2(100) ≈ 6.6)
    assert.ok(t.height() <= 8, `height ${t.height()} should be ≤ 8`);
  });

  it('inserts random values and stays valid', () => {
    const t = new AVLTree();
    const vals = new Set();
    for (let i = 0; i < 500; i++) {
      const v = Math.floor(Math.random() * 1000);
      vals.add(v);
      t.insert(v);
    }
    assert.equal(t.size, vals.size);
    assert.ok(t.isValid());
  });

  it('handles duplicates (replace)', () => {
    const t = AVLTree.from([5, 3, 5, 7]);
    assert.equal(t.size, 3);
    assert.ok(t.isValid());
  });

  it('supports insertAll chaining', () => {
    const t = new AVLTree();
    t.insertAll([10, 5, 15, 3, 7]);
    assert.equal(t.size, 5);
    assert.ok(t.isValid());
  });
});

describe('AVLTree — Delete', () => {
  it('deletes leaf node', () => {
    const t = AVLTree.from([10, 5, 15, 3, 7]);
    assert.equal(t.delete(7), true);
    assert.equal(t.size, 4);
    assert.ok(t.isValid());
    assert.equal(t.has(7), false);
  });

  it('deletes node with one child', () => {
    const t = AVLTree.from([10, 5, 15, 3]);
    assert.equal(t.delete(5), true);
    assert.equal(t.size, 3);
    assert.ok(t.isValid());
    assert.equal(t.has(5), false);
    assert.equal(t.has(3), true);
  });

  it('deletes node with two children', () => {
    const t = AVLTree.from([10, 5, 15, 3, 7, 12, 20]);
    assert.equal(t.delete(10), true);
    assert.ok(t.isValid());
    assert.equal(t.has(10), false);
  });

  it('deletes root when single node', () => {
    const t = AVLTree.from([42]);
    assert.equal(t.delete(42), true);
    assert.equal(t.size, 0);
    assert.equal(t.isEmpty(), true);
  });

  it('returns false for non-existent value', () => {
    const t = AVLTree.from([1, 2, 3]);
    assert.equal(t.delete(99), false);
  });

  it('bulk delete maintains AVL property', () => {
    const t = AVLTree.from(Array.from({ length: 50 }, (_, i) => i + 1));
    for (let i = 1; i <= 25; i++) {
      t.delete(i);
    }
    assert.equal(t.size, 25);
    assert.ok(t.isValid());
  });
});

describe('AVLTree — Search', () => {
  it('finds existing values', () => {
    const t = AVLTree.from([5, 3, 7, 1, 4, 6, 8]);
    assert.equal(t.has(4), true);
    assert.equal(t.has(1), true);
    assert.equal(t.has(8), true);
  });

  it('returns false for missing values', () => {
    const t = AVLTree.from([1, 2, 3]);
    assert.equal(t.has(0), false);
    assert.equal(t.has(4), false);
  });

  it('find returns stored value', () => {
    const t = AVLTree.from([42, 17, 99]);
    assert.equal(t.find(42), 42);
    assert.equal(t.find(99), 99);
    assert.equal(t.find(100), undefined);
  });
});

describe('AVLTree — Min / Max', () => {
  it('finds min and max', () => {
    const t = AVLTree.from([50, 25, 75, 10, 30, 60, 90, 5]);
    assert.equal(t.min(), 5);
    assert.equal(t.max(), 90);
  });

  it('min/max on empty tree returns undefined', () => {
    const t = new AVLTree();
    assert.equal(t.min(), undefined);
    assert.equal(t.max(), undefined);
  });
});

describe('AVLTree — Traversals', () => {
  const t = AVLTree.from([50, 25, 75, 10, 30, 60, 90]);

  it('in-order returns sorted', () => {
    assert.deepEqual(t.inOrder(), [10, 25, 30, 50, 60, 75, 90]);
  });

  it('pre-order', () => {
    // Root should be first
    const result = t.preOrder();
    assert.equal(result[0], 50);
    assert.equal(result.length, 7);
  });

  it('post-order', () => {
    // Root should be last
    const result = t.postOrder();
    assert.equal(result[result.length - 1], 50);
    assert.equal(result.length, 7);
  });

  it('level-order (BFS)', () => {
    const result = t.levelOrder();
    assert.equal(result[0], 50); // root
    assert.equal(result.length, 7);
  });

  it('toArray returns sorted array', () => {
    assert.deepEqual(t.toArray(), [10, 25, 30, 50, 60, 75, 90]);
  });

  it('traversal with callback', () => {
    const collected = [];
    t.inOrder((v) => collected.push(v * 2));
    assert.deepEqual(collected, [20, 50, 60, 100, 120, 150, 180]);
  });
});

describe('AVLTree — Iterator', () => {
  it('iterates in sorted order', () => {
    const t = AVLTree.from([5, 3, 7, 1, 4]);
    const result = [...t];
    assert.deepEqual(result, [1, 3, 4, 5, 7]);
  });

  it('works with spread and for-of', () => {
    const t = AVLTree.from([30, 10, 20]);
    const collected = [];
    for (const v of t) collected.push(v);
    assert.deepEqual(collected, [10, 20, 30]);
  });

  it('empty tree iterator', () => {
    const t = new AVLTree();
    assert.deepEqual([...t], []);
  });
});

describe('AVLTree — Range Search', () => {
  it('finds values in inclusive range', () => {
    const t = AVLTree.from([10, 20, 30, 40, 50, 25, 35]);
    assert.deepEqual(t.rangeSearch(20, 35), [20, 25, 30, 35]);
  });

  it('single value range', () => {
    const t = AVLTree.from([1, 2, 3, 4, 5]);
    assert.deepEqual(t.rangeSearch(3, 3), [3]);
  });

  it('range with no results', () => {
    const t = AVLTree.from([1, 2, 3]);
    assert.deepEqual(t.rangeSearch(10, 20), []);
  });

  it('full range returns all', () => {
    const t = AVLTree.from([5, 3, 7]);
    assert.deepEqual(t.rangeSearch(3, 7), [3, 5, 7]);
  });

  it('empty tree range search', () => {
    const t = new AVLTree();
    assert.deepEqual(t.rangeSearch(1, 10), []);
  });
});

describe('AVLTree — Predecessor / Successor', () => {
  const t = AVLTree.from([10, 20, 30, 40, 50]);

  it('finds predecessor', () => {
    assert.equal(t.predecessor(30), 20);
    assert.equal(t.predecessor(10), undefined);
  });

  it('finds successor', () => {
    assert.equal(t.successor(30), 40);
    assert.equal(t.successor(50), undefined);
  });

  it('predecessor of non-existent value', () => {
    assert.equal(t.predecessor(25), 20);
    assert.equal(t.predecessor(5), undefined);
  });

  it('successor of non-existent value', () => {
    assert.equal(t.successor(25), 30);
    assert.equal(t.successor(55), undefined);
  });
});

describe('AVLTree — Rank / Select', () => {
  const t = AVLTree.from([50, 25, 75, 10, 30, 60, 90]);

  it('rank counts values less than target', () => {
    assert.equal(t.rank(50), 3); // 10, 25, 30 < 50
    assert.equal(t.rank(10), 0);
    assert.equal(t.rank(90), 6);
  });

  it('rank for non-existent value', () => {
    assert.equal(t.rank(40), 3); // 10, 25, 30 < 40
  });

  it('select returns k-th smallest (0-indexed)', () => {
    assert.equal(t.select(0), 10);
    assert.equal(t.select(3), 50);
    assert.equal(t.select(6), 90);
  });

  it('select out of range returns undefined', () => {
    assert.equal(t.select(-1), undefined);
    assert.equal(t.select(7), undefined);
  });
});

describe('AVLTree — Serialization', () => {
  it('toJSON / fromJSON round-trip', () => {
    const t = AVLTree.from([50, 25, 75, 10, 30, 60, 90, 5, 15]);
    const json = t.toJSON();
    const restored = AVLTree.fromJSON(json);
    assert.equal(restored.size, t.size);
    assert.deepEqual(restored.toArray(), t.toArray());
    assert.ok(restored.isValid());
  });

  it('serialize empty tree', () => {
    const t = new AVLTree();
    const json = t.toJSON();
    const restored = AVLTree.fromJSON(json);
    assert.equal(restored.size, 0);
    assert.equal(restored.isEmpty(), true);
  });
});

describe('AVLTree — Clear', () => {
  it('clears the tree', () => {
    const t = AVLTree.from([1, 2, 3, 4, 5]);
    t.clear();
    assert.equal(t.size, 0);
    assert.equal(t.isEmpty(), true);
    assert.equal(t.height(), 0);
  });
});

describe('AVLTree — Custom Comparator', () => {
  it('works with string comparator', () => {
    const t = new AVLTree((a, b) => a.localeCompare(b));
    t.insertAll(['banana', 'apple', 'cherry', 'date']);
    assert.deepEqual(t.toArray(), ['apple', 'banana', 'cherry', 'date']);
    assert.ok(t.isValid());
  });

  it('works with reverse comparator', () => {
    const t = new AVLTree((a, b) => b - a);
    t.insertAll([3, 1, 4, 1, 5, 9, 2, 6]);
    assert.deepEqual(t.toArray(), [9, 6, 5, 4, 3, 2, 1]);
  });

  it('works with object key comparator', () => {
    const t = new AVLTree((a, b) => a.id - b.id);
    t.insertAll([{ id: 3, name: 'c' }, { id: 1, name: 'a' }, { id: 2, name: 'b' }]);
    const sorted = t.toArray();
    assert.equal(sorted[0].id, 1);
    assert.equal(sorted[1].id, 2);
    assert.equal(sorted[2].id, 3);
  });
});

describe('AVLTree — isValid', () => {
  it('valid for valid AVL tree', () => {
    const t = AVLTree.from([1, 2, 3, 4, 5, 6, 7]);
    assert.equal(t.isValid(), true);
  });

  it('valid for empty tree', () => {
    const t = new AVLTree();
    assert.equal(t.isValid(), true);
  });

  it('valid for single node', () => {
    const t = AVLTree.from([42]);
    assert.equal(t.isValid(), true);
  });
});

describe('AVLTree — Stress Test', () => {
  it('random insert/delete stays balanced', () => {
    const t = new AVLTree();
    const values = Array.from({ length: 200 }, () => Math.floor(Math.random() * 1000));
    const unique = [...new Set(values)];

    // Insert all
    for (const v of unique) t.insert(v);
    assert.equal(t.size, unique.length);
    assert.ok(t.isValid());

    // Delete half
    const toDelete = unique.slice(0, Math.floor(unique.length / 2));
    for (const v of toDelete) t.delete(v);
    assert.ok(t.isValid());

    // Height should still be logarithmic
    const expectedMax = Math.ceil(1.44 * Math.log2(t.size + 2));
    assert.ok(t.height() <= expectedMax + 2, `height ${t.height()} vs expected ~${expectedMax}`);
  });

  it('sequential ascending then descending delete', () => {
    const t = AVLTree.from(Array.from({ length: 100 }, (_, i) => i));
    assert.ok(t.isValid());
    // Delete from the end
    for (let i = 99; i >= 50; i--) {
      t.delete(i);
    }
    assert.ok(t.isValid());
    assert.equal(t.size, 50);
    assert.deepEqual(t.toArray(), Array.from({ length: 50 }, (_, i) => i));
  });
});
