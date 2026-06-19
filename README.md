# avl-tree-x

Zero-dependency AVL self-balancing binary search tree for Node.js.

Insert, delete, and search are all **O(log n)** worst-case — guaranteed by AVL rebalancing after every modification.

## Install

```bash
npm install avl-tree-x
```

## Why?

Plain BSTs degrade to O(n) linked lists on sorted input. AVL trees solve this by tracking balance factors and rotating when subtrees differ in height by more than 1. This library gives you a clean, battle-tested AVL tree with zero dependencies and a comprehensive API — not just insert/delete/search, but range queries, rank, select, predecessor/successor, multiple traversals, and serialization.

## Quick Start

```js
const { AVLTree } = require('avl-tree-x');

const tree = new AVLTree();
tree.insert(50).insert(25).insert(75).insert(10).insert(30);

console.log(tree.toArray());        // [10, 25, 30, 50, 75]
console.log(tree.has(30));          // true
console.log(tree.min());            // 10
console.log(tree.max());            // 75
console.log(tree.height());         // 3

tree.delete(25);
console.log(tree.toArray());        // [10, 30, 50, 75]
```

## API

### Construction

#### `new AVLTree(compare?)`
Create an empty tree with an optional comparator (default: numeric ascending).

#### `AVLTree.from(iterable, compare?)`
Build a tree from an iterable. Example:

```js
const t = AVLTree.from([5, 3, 7, 1, 4]);
```

### Insertion

| Method | Description |
|--------|-------------|
| `insert(value)` | Insert a value. Returns tree for chaining. Duplicates replace. |
| `insertAll(values)` | Insert multiple values. Chainable. |

### Deletion

| Method | Description |
|--------|-------------|
| `delete(value)` | Delete a value. Returns `true` if found, `false` otherwise. |

### Search

| Method | Description |
|--------|-------------|
| `has(value)` | Returns `true` if value exists. |
| `find(value)` | Returns the stored value or `undefined`. |

### Stats

| Method | Description |
|--------|-------------|
| `size` | Number of nodes (getter). |
| `isEmpty()` | Boolean. |
| `height()` | Tree height (0 for empty, 1 for single node). |
| `min()` | Smallest value or `undefined`. |
| `max()` | Largest value or `undefined`. |
| `clear()` | Remove all nodes. Chainable. |

### Traversals

All traversal methods accept an optional callback. If no callback is given, they return an array.

| Method | Order |
|--------|-------|
| `inOrder(fn?)` | Left → Node → Right (sorted) |
| `preOrder(fn?)` | Node → Left → Right |
| `postOrder(fn?)` | Left → Right → Node |
| `levelOrder(fn?)` | BFS, level by level |
| `toArray()` | Shorthand for `inOrder()` — sorted array |

### Iterator

The tree implements `Symbol.iterator`, so you can use it in `for...of` loops and with spread syntax:

```js
const tree = AVLTree.from([3, 1, 4, 1, 5, 9, 2, 6]);

for (const value of tree) {
  console.log(value); // 1, 2, 3, 4, 5, 6, 9
}

const [smallest] = tree; // 1
```

### Range Queries

#### `rangeSearch(low, high)`
Return all values in `[low, high]` (inclusive), sorted.

```js
tree.rangeSearch(3, 6); // [3, 4, 5, 6]
```

### Predecessor & Successor

| Method | Description |
|--------|-------------|
| `predecessor(value)` | Largest value strictly less than target. `undefined` if none. |
| `successor(value)` | Smallest value strictly greater than target. `undefined` if none. |

Works for both existing and non-existing target values:

```js
tree.predecessor(4);  // 3 (largest < 4)
tree.successor(4);    // 5 (smallest > 4)
tree.predecessor(0);  // undefined
```

### Rank & Select

| Method | Description |
|--------|-------------|
| `rank(value)` | Count of values strictly less than target. |
| `select(k)` | k-th smallest value (0-indexed). `undefined` if out of range. |

```js
const t = AVLTree.from([10, 20, 30, 40, 50]);

t.rank(30);   // 2 (two values < 30)
t.select(2);  // 30 (3rd smallest, 0-indexed)
```

### Serialization

#### `toJSON()`
Returns `{ root, size }` — a JSON-compatible representation.

#### `AVLTree.fromJSON(obj, compare?)`
Reconstruct a tree from `toJSON()` output.

```js
const json = tree.toJSON();
// store or transmit...
const restored = AVLTree.fromJSON(json);
```

### Validation

#### `isValid()`
Returns `true` if the tree satisfies:
- BST property (left < node < right)
- AVL balance property (height difference ≤ 1)
- Height metadata consistency

Useful for testing and debugging.

### Custom Comparators

```js
// Strings
const strings = new AVLTree((a, b) => a.localeCompare(b));
strings.insertAll(['cherry', 'apple', 'banana']);

// Objects by key
const users = new AVLTree((a, b) => a.id - b.id);
users.insertAll([{ id: 3 }, { id: 1 }, { id: 2 }]);

// Reverse order
const desc = new AVLTree((a, b) => b - a);
```

## CLI

```bash
# Insert numbers and see the tree
avltree insert 10 20 30 40 50 25 --json

# In-order output
avltree order 10 20 30 40 50 25

# Range query
avltree range 10 30 10 20 30 40 50 25

# Rank and select
avltree rank 30 10 20 30 40 50 25
avltree select 2 10 20 30 40 50 25

# Demo
avltree demo

# From stdin
echo "5 3 7 1 4 2 6 8" | avltree insert
```

## Performance

All operations are **O(log n)** worst-case:

| Operation | Complexity |
|-----------|------------|
| insert | O(log n) |
| delete | O(log n) |
| search | O(log n) |
| min / max | O(log n) |
| predecessor / successor | O(log n) |
| rank | O(log n) |
| select | O(log n) |
| rangeSearch | O(log n + k) where k = results |
| toArray / inOrder | O(n) |

## Real-World Examples

### 1. Leaderboard with Rank Queries

```js
const { AVLTree } = require('avl-tree-x');

// Store scores in an AVL tree for fast rank lookups
const scores = new AVLTree();

// Add player scores
[850, 1200, 430, 990, 1500, 670, 2100, 1100].forEach((s) => scores.insert(s));

// "What rank is a score of 990?"
console.log(scores.rank(990)); // 3 (three scores below)

// "What's the 3rd highest score?" (0-indexed from smallest)
console.log(scores.select(scores.size - 3)); // 1200

// "Show me all scores between 800 and 1200"
console.log(scores.rangeSearch(800, 1200)); // [850, 990, 1100, 1200]
```

### 2. Event Scheduling (Find Next Available Slot)

```js
const { AVLTree } = require('avl-tree-x');

// Store booked timestamps (Unix epoch seconds)
const bookings = AVLTree.from([1000, 2000, 3000, 4000, 5000]);

// Find the next available slot after timestamp 2500
const next = bookings.successor(2500);
console.log(next); // 3000

// Find the last booking before 2500
const prev = bookings.predecessor(2500);
console.log(prev); // 2000
```

### 3. De-duplication with Order Statistics

```js
const { AVLTree } = require('avl-tree-x');

// Process a stream of events, keeping only unique IDs
const seen = new AVLTree();
const events = [42, 17, 42, 99, 17, 55, 99, 3];

for (const id of events) {
  if (!seen.has(id)) {
    seen.insert(id);
    console.log(`Added ${id}, rank: ${seen.rank(id)}, total unique: ${seen.size}`);
  }
}
// Final sorted unique IDs:
console.log([...seen]); // [3, 17, 42, 55, 99]
```

## Comparison

| Feature | avl-tree-x | [avl](https://www.npmjs.com/package/avl) | [bintrees](https://www.npmjs.com/package/bintrees) | [sorted-btree](https://www.npmjs.com/package/sorted-btree) |
|---------|-----------|-----|---------|--------------|
| Dependencies | **0** | 0 | 0 | 1 |
| Balance type | AVL | AVL | Red-Black (unbalanced BST too) | B-tree |
| Range queries | ✅ | ❌ | ❌ | ✅ |
| Rank / Select | ✅ | ❌ | ❌ | ❌ |
| Predecessor / Successor | ✅ | ✅ | ✅ | ✅ |
| Iterator protocol | ✅ | ✅ | ❌ | ✅ |
| Serialization | ✅ | ❌ | ❌ | ❌ |
| Custom comparator | ✅ | ✅ | ✅ | ✅ |
| CLI tool | ✅ | ❌ | ❌ | ❌ |
| Tree validation | ✅ | ❌ | ❌ | ❌ |
| Node.js >= | 18 | 4 | 0.8 | 8 |

## License

MIT
