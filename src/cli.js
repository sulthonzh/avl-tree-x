#!/usr/bin/env node
/**
 * avl-tree-x CLI
 *
 * Usage:
 *   avltree insert 5 3 7 1 4 --json
 *   avltree info --json
 *   avltree search 4
 *   avltree delete 3
 *   avltree range 1 4
 *   avltree order    # in-order
 *   avltree rank 4
 *   avltree select 2
 *   avltree demo
 */

'use strict';

const { AVLTree } = require('./index.js');

const VERSION = '1.1.0';

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: avltree <command> [args] [--json]');
    console.error('Commands: insert, delete, search, range, order, rank, select, min, max, height, info, demo');
    console.error('       avltree --version | -V');
    process.exit(1);
  }
  if (args[0] === '--version' || args[0] === '-V' || args[0] === 'version') {
    console.log(VERSION);
    process.exit(0);
  }
  const jsonFlag = args.includes('--json');
  const filtered = args.filter((a) => a !== '--json');
  return { command: filtered[0], values: filtered.slice(1).map((v) => Number(v)), json: jsonFlag };
}

function output(data, asJson) {
  if (asJson) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    if (Array.isArray(data)) {
      data.forEach((v) => console.log(v));
    } else if (typeof data === 'object') {
      Object.entries(data).forEach(([k, v]) => console.log(`${k}: ${v}`));
    } else {
      console.log(data);
    }
  }
}

function main() {
  const { command, values, json } = parseArgs(process.argv);

  switch (command) {
    case 'demo': {
      const tree = AVLTree.from([10, 20, 30, 40, 50, 25]);
      output({ tree: tree.toArray(), height: tree.height(), size: tree.size, valid: tree.isValid() }, json);
      break;
    }
    case 'insert': {
      if (values.length === 0) {
        // Read from stdin
        let input = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => (input += chunk));
        process.stdin.on('end', () => {
          const items = input.trim().split(/[\s,\n]+/).map(Number).filter((n) => !isNaN(n));
          const tree = AVLTree.from(items);
          output({ inserted: items.length, size: tree.size, height: tree.height(), valid: tree.isValid(), sorted: tree.toArray() }, json);
        });
      } else {
        const tree = AVLTree.from(values);
        output({ inserted: values.length, size: tree.size, height: tree.height(), valid: tree.isValid(), sorted: tree.toArray() }, json);
      }
      break;
    }
    default: {
      // For commands that need numbers
      if (values.length === 0) {
        console.error(`Command "${command}" needs at least one value`);
        process.exit(1);
      }
      // Build a demo tree from values for stateless CLI
      const tree = AVLTree.from(values);
      switch (command) {
        case 'search':
          output({ found: tree.has(values[0]) }, json);
          break;
        case 'min':
          output(tree.min(), json);
          break;
        case 'max':
          output(tree.max(), json);
          break;
        case 'height':
          output(tree.height(), json);
          break;
        case 'order':
          output(tree.toArray(), json);
          break;
        case 'rank':
          output(tree.rank(values[0]), json);
          break;
        case 'select':
          output(tree.select(values[0]), json);
          break;
        case 'range':
          output(tree.rangeSearch(values[0], values[1] ?? values[0]), json);
          break;
        case 'info':
          output({ size: tree.size, height: tree.height(), min: tree.min(), max: tree.max(), valid: tree.isValid() }, json);
          break;
        default:
          console.error(`Unknown command: ${command}`);
          process.exit(1);
      }
    }
  }
}

main();
