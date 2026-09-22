import assert from "node:assert/strict";
import test from "node:test";

import {
  autoSelectDuplicatePaths,
  buildDuplicateDeleteGroups,
  getDuplicateSelectionStats
} from "../src/duplicates.js";

const groups = [{
  hash: "a".repeat(64),
  size: 10,
  files: [
    { path: "/old", relative_path: "old", size: 10, modified_ms: 1 },
    { path: "/new", relative_path: "new", size: 10, modified_ms: 3 },
    { path: "/middle", relative_path: "middle", size: 10, modified_ms: 2 }
  ]
}];

test("auto-selection keeps the newest file in every duplicate group", () => {
  const selected = autoSelectDuplicatePaths(groups);
  assert.deepEqual([...selected].sort(), ["/middle", "/old"]);
  assert.deepEqual(getDuplicateSelectionStats(groups, selected), { count: 2, bytes: 20 });
});

test("delete payload always names an unselected file to keep", () => {
  const payload = buildDuplicateDeleteGroups(groups, new Set(["/old"]));
  assert.equal(payload[0].keep_path, "/new");
  assert.deepEqual(payload[0].delete_paths, ["/old"]);
});

test("delete payload rejects selecting every file in a group", () => {
  assert.throws(
    () => buildDuplicateDeleteGroups(groups, new Set(["/old", "/new", "/middle"])),
    /duplicateKeepRequired/
  );
});
