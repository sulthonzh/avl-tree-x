/**
 * avl-tree-x — Zero-dep AVL self-balancing binary search tree.
 *
 * AVL trees maintain O(log n) height by tracking balance factors
 * and performing rotations after insert/delete operations.
 *
 * Properties:
 *   - Binary search tree invariant: left < node < right
 *   - Height difference between subtrees ≤ 1 (AVL property)
 *   - All operations O(log n) worst-case
 */

'use strict';

/**
 * @typedef {object} AVLNode
 * @property {*} value
 * @property {AVLNode|null} left
 * @property {AVLNode|null} right
 * @property {number} height — height of node (leaf = 1)
 */

/** Create a new AVL node. */
function makeNode(value) {
  return { value, left: null, right: null, height: 1 };
}

/** Get height of a node (null = 0). */
function height(node) {
  return node === null ? 0 : node.height;
}

/** Compute balance factor: left height − right height. */
function balanceFactor(node) {
  return node === null ? 0 : height(node.left) - height(node.right);
}

/** Update height based on children. */
function updateHeight(node) {
  node.height = 1 + Math.max(height(node.left), height(node.right));
}

/**
 * Right rotation (LL case).
 *     y              x
 *    / \           /   \
 *   x   C   →     A     y
 *  / \                  / \
 * A   B                B   C
 */
function rotateRight(y) {
  const x = y.left;
  const B = x.right;
  x.right = y;
  y.left = B;
  updateHeight(y);
  updateHeight(x);
  return x;
}

/**
 * Left rotation (RR case).
 *   x                y
 *  / \             /   \
 * A   y     →     x     C
 *    / \         / \
 *   B   C       A   B
 */
function rotateLeft(x) {
  const y = x.right;
  const B = y.left;
  y.left = x;
  x.right = B;
  updateHeight(x);
  updateHeight(y);
  return y;
}

/** Rebalance a node if its balance factor is violated. */
function rebalance(node) {
  updateHeight(node);
  const bf = balanceFactor(node);
  if (bf > 1) {
    // Left-heavy
    if (balanceFactor(node.left) < 0) {
      // LR case
      node.left = rotateLeft(node.left);
    }
    return rotateRight(node); // LL or LR-then-LL
  }
  if (bf < -1) {
    // Right-heavy
    if (balanceFactor(node.right) > 0) {
      // RL case
      node.right = rotateRight(node.right);
    }
    return rotateLeft(node); // RR or RL-then-RR
  }
  return node;
}

/** Insert a value into the subtree, return new root. */
function insertNode(node, value, compare) {
  if (node === null) return makeNode(value);
  const cmp = compare(value, node.value);
  if (cmp < 0) {
    node.left = insertNode(node.left, value, compare);
  } else if (cmp > 0) {
    node.right = insertNode(node.right, value, compare);
  } else {
    // Duplicate — replace value (or ignore). We replace.
    node.value = value;
    return node;
  }
  return rebalance(node);
}

/** Find minimum node in a subtree. */
function findMin(node) {
  while (node.left !== null) node = node.left;
  return node;
}

/** Delete a value from subtree, return new root. */
function deleteNode(node, value, compare) {
  if (node === null) return null;
  const cmp = compare(value, node.value);
  if (cmp < 0) {
    node.left = deleteNode(node.left, value, compare);
  } else if (cmp > 0) {
    node.right = deleteNode(node.right, value, compare);
  } else {
    // Found node to delete
    if (node.left === null) return node.right;
    if (node.right === null) return node.left;
    // Two children: replace with in-order successor
    const successor = findMin(node.right);
    node.value = successor.value;
    node.right = deleteNode(node.right, successor.value, compare);
  }
  return rebalance(node);
}

/** Search for a value, return node or null. */
function searchNode(node, value, compare) {
  while (node !== null) {
    const cmp = compare(value, node.value);
    if (cmp < 0) node = node.left;
    else if (cmp > 0) node = node.right;
    else return node;
  }
  return null;
}

/** Count nodes in a subtree. */
function countNodes(node) {
  if (node === null) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

/** In-order traversal (sorted order). */
function inOrder(node, fn) {
  if (node === null) return;
  inOrder(node.left, fn);
  fn(node.value);
  inOrder(node.right, fn);
}

/** Pre-order traversal. */
function preOrder(node, fn) {
  if (node === null) return;
  fn(node.value);
  preOrder(node.left, fn);
  preOrder(node.right, fn);
}

/** Post-order traversal. */
function postOrder(node, fn) {
  if (node === null) return;
  postOrder(node.left, fn);
  postOrder(node.right, fn);
  fn(node.value);
}

/** Level-order (BFS) traversal. */
function levelOrder(root, fn) {
  if (root === null) return;
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    fn(node.value);
    if (node.left !== null) queue.push(node.left);
    if (node.right !== null) queue.push(node.right);
  }
}

/** Collect all values in [low, high] range. */
function rangeSearchNode(node, low, high, compare, result) {
  if (node === null) return;
  const cmpLow = compare(node.value, low);
  const cmpHigh = compare(node.value, high);
  if (cmpLow > 0) {
    rangeSearchNode(node.left, low, high, compare, result);
  }
  if (cmpLow >= 0 && cmpHigh <= 0) {
    result.push(node.value);
  }
  if (cmpHigh < 0) {
    rangeSearchNode(node.right, low, high, compare, result);
  }
}

/** Find the in-order predecessor (largest value < target). */
function predecessorNode(node, value, compare, candidate) {
  let current = node;
  let pred = candidate;
  while (current !== null) {
    const cmp = compare(value, current.value);
    if (cmp > 0) {
      pred = current.value;
      current = current.right;
    } else if (cmp < 0) {
      current = current.left;
    } else {
      // Found exact: predecessor is max of left subtree
      if (current.left !== null) {
        let t = current.left;
        while (t.right !== null) t = t.right;
        return t.value;
      }
      break;
    }
  }
  return pred;
}

/** Find the in-order successor (smallest value > target). */
function successorNode(node, value, compare, candidate) {
  let current = node;
  let succ = candidate;
  while (current !== null) {
    const cmp = compare(value, current.value);
    if (cmp < 0) {
      succ = current.value;
      current = current.left;
    } else if (cmp > 0) {
      current = current.right;
    } else {
      // Found exact: successor is min of right subtree
      if (current.right !== null) {
        let t = current.right;
        while (t.left !== null) t = t.left;
        return t.value;
      }
      break;
    }
  }
  return succ;
}

/** Count values < target (rank of target). */
function rankNode(node, value, compare) {
  if (node === null) return 0;
  const cmp = compare(value, node.value);
  if (cmp <= 0) {
    return rankNode(node.left, value, compare);
  }
  return 1 + countNodes(node.left) + rankNode(node.right, value, compare);
}

/** Select the k-th smallest value (0-indexed). Returns null if k out of range. */
function selectNode(node, k) {
  if (node === null) return null;
  const leftCount = countNodes(node.left);
  if (k < leftCount) return selectNode(node.left, k);
  if (k === leftCount) return node.value;
  return selectNode(node.right, k - leftCount - 1);
}

/** Serialize node to JSON-compatible object. */
function toJSONNode(node) {
  if (node === null) return null;
  return {
    v: node.value,
    h: node.height,
    l: toJSONNode(node.left),
    r: toJSONNode(node.right),
  };
}

/** Deserialize JSON-compatible object to node. */
function fromJSONNode(obj) {
  if (obj === null) return null;
  const node = {
    value: obj.v,
    height: obj.h,
    left: fromJSONNode(obj.l),
    right: fromJSONNode(obj.r),
  };
  return node;
}

/** Default numeric comparator. */
const defaultCompare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * AVL Tree — self-balancing binary search tree.
 */
class AVLTree {
  /**
   * @param {function(a,b):number} [compare] — comparator function (-1, 0, 1)
   */
  constructor(compare = defaultCompare) {
    this._root = null;
    this._compare = compare;
    this._size = 0;
  }

  /**
   * Create an AVLTree from an iterable.
   * @param {Iterable} items
   * @param {function(a,b):number} [compare]
   * @returns {AVLTree}
   */
  static from(items, compare) {
    const tree = new AVLTree(compare);
    for (const item of items) tree.insert(item);
    return tree;
  }

  /** Insert a value. Returns the tree for chaining. */
  insert(value) {
    const found = searchNode(this._root, value, this._compare);
    if (found === null) this._size++;
    this._root = insertNode(this._root, value, this._compare);
    return this;
  }

  /** Insert multiple values. */
  insertAll(values) {
    for (const v of values) this.insert(v);
    return this;
  }

  /** Delete a value. Returns true if deleted, false if not found. */
  delete(value) {
    const found = searchNode(this._root, value, this._compare);
    if (found === null) return false;
    this._root = deleteNode(this._root, value, this._compare);
    this._size--;
    return true;
  }

  /** Search for a value. Returns true if found. */
  has(value) {
    return searchNode(this._root, value, this._compare) !== null;
  }

  /** Find a value (returns the stored value or undefined). */
  find(value) {
    const node = searchNode(this._root, value, this._compare);
    return node ? node.value : undefined;
  }

  /** Minimum value in the tree. */
  min() {
    if (this._root === null) return undefined;
    return findMin(this._root).value;
  }

  /** Maximum value in the tree. */
  max() {
    if (this._root === null) return undefined;
    let node = this._root;
    while (node.right !== null) node = node.right;
    return node.value;
  }

  /** Number of nodes. */
  get size() {
    return this._size;
  }

  /** Is the tree empty? */
  isEmpty() {
    return this._root === null;
  }

  /** Height of the tree (0 for empty). */
  height() {
    return height(this._root);
  }

  /** Clear all nodes. */
  clear() {
    this._root = null;
    this._size = 0;
    return this;
  }

  /** In-order traversal (sorted). Pass a callback or collect into array. */
  inOrder(fn) {
    const result = typeof fn === 'function' ? null : [];
    const cb = typeof fn === 'function' ? fn : (v) => result.push(v);
    inOrder(this._root, cb);
    return result;
  }

  /** Pre-order traversal. */
  preOrder(fn) {
    const result = typeof fn === 'function' ? null : [];
    const cb = typeof fn === 'function' ? fn : (v) => result.push(v);
    preOrder(this._root, cb);
    return result;
  }

  /** Post-order traversal. */
  postOrder(fn) {
    const result = typeof fn === 'function' ? null : [];
    const cb = typeof fn === 'function' ? fn : (v) => result.push(v);
    postOrder(this._root, cb);
    return result;
  }

  /** Level-order (BFS) traversal. */
  levelOrder(fn) {
    const result = typeof fn === 'function' ? null : [];
    const cb = typeof fn === 'function' ? fn : (v) => result.push(v);
    levelOrder(this._root, cb);
    return result;
  }

  /** Get all values in sorted order (shorthand for inOrder()). */
  toArray() {
    return this.inOrder();
  }

  /** Iterator over values in sorted order. */
  [Symbol.iterator]() {
    // In-order iterative traversal using a stack
    const stack = [];
    let current = this._root;
    return {
      next() {
        while (current !== null) {
          stack.push(current);
          current = current.left;
        }
        if (stack.length === 0) return { done: true };
        const node = stack.pop();
        current = node.right;
        return { value: node.value, done: false };
      },
    };
  }

  /**
   * Find all values in range [low, high] (inclusive).
   * @returns {Array}
   */
  rangeSearch(low, high) {
    const result = [];
    rangeSearchNode(this._root, low, high, this._compare, result);
    return result;
  }

  /**
   * Find the largest value strictly less than the target.
   * @returns {undefined} if no predecessor exists
   */
  predecessor(value) {
    return predecessorNode(this._root, value, this._compare, undefined);
  }

  /**
   * Find the smallest value strictly greater than the target.
   * @returns {undefined} if no successor exists
   */
  successor(value) {
    return successorNode(this._root, value, this._compare, undefined);
  }

  /**
   * Count of values strictly less than the given value.
   * Equivalent to the "rank" of a value.
   * @returns {number}
   */
  rank(value) {
    return rankNode(this._root, value, this._compare);
  }

  /**
   * Get the k-th smallest value (0-indexed).
   * @param {number} k
   * @returns {*} the value, or undefined if k is out of range
   */
  select(k) {
    if (k < 0 || k >= this._size) return undefined;
    return selectNode(this._root, k);
  }

  /** Serialize to JSON-compatible object. */
  toJSON() {
    return { root: toJSONNode(this._root), size: this._size };
  }

  /** Deserialize from JSON-compatible object. */
  static fromJSON(obj, compare = defaultCompare) {
    const tree = new AVLTree(compare);
    tree._root = fromJSONNode(obj.root);
    tree._size = obj.size;
    return tree;
  }

  /**
   * Verify the AVL property (for testing/debugging).
   * Returns true if the tree is a valid AVL tree.
   */
  isValid() {
    const check = (node) => {
      if (node === null) return { valid: true, height: 0, max: -Infinity, min: Infinity };
      const left = check(node.left);
      const right = check(node.right);
      if (!left.valid || !right.valid) return { valid: false };
      const bf = left.height - right.height;
      const h = 1 + Math.max(left.height, right.height);
      // AVL balance check
      if (Math.abs(bf) > 1) return { valid: false };
      // Height consistency check
      if (node.height !== h) return { valid: false };
      // BST property check
      if (node.left !== null && left.max >= node.value) return { valid: false };
      if (node.right !== null && right.min <= node.value) return { valid: false };
      return {
        valid: true,
        height: h,
        max: node.right === null ? node.value : right.max,
        min: node.left === null ? node.value : left.min,
      };
    };
    return check(this._root).valid;
  }
}

module.exports = { AVLTree, defaultCompare };
