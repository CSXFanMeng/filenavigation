export function autoSelectDuplicatePaths(groups) {
  const selected = new Set();
  for (const group of groups || []) {
    const files = [...(group.files || [])].sort((left, right) =>
      Number(right.modified_ms || 0) - Number(left.modified_ms || 0)
      || String(left.relative_path || left.path).localeCompare(String(right.relative_path || right.path))
    );
    files.slice(1).forEach((file) => selected.add(file.path));
  }
  return selected;
}

export function getDuplicateSelectionStats(groups, selectedPaths) {
  let count = 0;
  let bytes = 0;
  for (const group of groups || []) {
    for (const file of group.files || []) {
      if (selectedPaths.has(file.path)) {
        count += 1;
        bytes += Number(file.size || group.size || 0);
      }
    }
  }
  return { count, bytes };
}

export function buildDuplicateDeleteGroups(groups, selectedPaths) {
  const payload = [];
  for (const group of groups || []) {
    const files = group.files || [];
    const deletePaths = files.filter((file) => selectedPaths.has(file.path)).map((file) => file.path);
    if (deletePaths.length === 0) continue;

    const keep = files.find((file) => !selectedPaths.has(file.path));
    if (!keep) {
      throw new Error("duplicateKeepRequired");
    }
    payload.push({
      hash: group.hash,
      keep_path: keep.path,
      delete_paths: deletePaths
    });
  }
  return payload;
}
