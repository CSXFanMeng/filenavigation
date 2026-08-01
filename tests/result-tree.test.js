import test from "node:test";
import assert from "node:assert/strict";

import {
  buildResultTree,
  countResultTree,
  countVisibleResults,
  filterResultTree,
  flattenResultTree,
  sortResultTree
} from "../src/result-tree.js";

const results = [
  {
    name: "large.bin",
    path: "D:\\xx\\123\\abc\\large.bin",
    relative_path: "123/abc/large.bin",
    kind: "file",
    is_dir: false,
    size: 900,
    modified: "2026-07-20 10:00:00"
  },
  {
    name: "small.txt",
    path: "D:\\xx\\123\\small.txt",
    relative_path: "123/small.txt",
    kind: "file",
    is_dir: false,
    size: 100,
    modified: "2026-07-21 10:00:00"
  },
  {
    name: "top.txt",
    path: "D:\\xx\\top.txt",
    relative_path: "top.txt",
    kind: "file",
    is_dir: false,
    size: 50,
    modified: "2026-07-22 10:00:00"
  }
];

test("builds a hierarchy relative to the selected root and totals folder sizes", () => {
  const tree = buildResultTree(results, "D:\\xx");

  assert.deepEqual(tree.map((node) => node.name), ["123", "top.txt"]);
  assert.equal(tree[0].path, "D:\\xx\\123");
  assert.equal(tree[0].size, 1_000);
  assert.equal(tree[0].children[0].name, "abc");
  assert.equal(tree[0].children[0].size, 900);
});

test("sorts folders before files and recursively sorts by name", () => {
  const sorted = sortResultTree(buildResultTree(results, "D:\\xx"), "name-asc", "en");

  assert.deepEqual(sorted.map((node) => node.name), ["123", "top.txt"]);
  assert.deepEqual(sorted[0].children.map((node) => node.name), ["abc", "small.txt"]);
});

test("size sorting uses aggregated folder sizes", () => {
  const extra = {
    ...results[2],
    name: "middle.bin",
    path: "D:\\xx\\middle.bin",
    relative_path: "middle.bin",
    size: 800
  };
  const sorted = sortResultTree(buildResultTree([...results, extra], "D:\\xx"), "size-desc", "en");

  assert.deepEqual(sorted.map((node) => node.name), ["123", "middle.bin", "top.txt"]);
});

test("filtering keeps ancestor folders and collapsing hides descendants", () => {
  const tree = buildResultTree(results, "D:\\xx");
  const filtered = filterResultTree(tree, "large", "file");

  assert.equal(countResultTree(filtered), 3);
  assert.equal(countVisibleResults(filtered), 1);
  assert.deepEqual(flattenResultTree(filtered, new Set()).map((node) => node.name), ["123", "abc", "large.bin"]);
  assert.deepEqual(flattenResultTree(filtered, new Set(["123"])).map((node) => node.name), ["123"]);
});
