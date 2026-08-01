function normalizedRelativePath(result, rootPath) {
  const supplied = String(result.relative_path || "").replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");
  if (supplied) {
    return supplied;
  }

  const absolute = String(result.path || "");
  const root = String(rootPath || "").replace(/[\\/]+$/, "");
  if (root && absolute.toLocaleLowerCase().startsWith(root.toLocaleLowerCase())) {
    const derived = absolute.slice(root.length).replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");
    if (derived) {
      return derived;
    }
  }

  return String(result.name || "");
}

function joinPath(rootPath, segments) {
  const root = String(rootPath || "");
  const separator = root.includes("\\") ? "\\" : "/";
  const base = root.replace(/[\\/]+$/, "");
  const suffix = segments.join(separator);
  if (!base && root.startsWith("/")) {
    return `/${suffix}`;
  }
  return base ? `${base}${separator}${suffix}` : suffix;
}

function modifiedTimestamp(value) {
  return Date.parse(value || "") || 0;
}

function finalizeNode(node) {
  node.children.forEach(finalizeNode);
  if (node.is_dir) {
    node.size = node.children.reduce((total, child) => total + child.size, 0);
    node.modified_sort = Math.max(modifiedTimestamp(node.modified), ...node.children.map((child) => child.modified_sort));
  } else {
    node.modified_sort = modifiedTimestamp(node.modified);
  }
  delete node.child_map;
}

export function buildResultTree(results, rootPath) {
  const roots = [];
  const rootMap = new Map();

  for (const result of results) {
    const relativePath = normalizedRelativePath(result, rootPath);
    const segments = relativePath.split("/").filter(Boolean);
    if (segments.length === 0) {
      continue;
    }

    let siblings = roots;
    let siblingMap = rootMap;
    const pathSegments = [];

    segments.forEach((segment, index) => {
      pathSegments.push(segment);
      const isResult = index === segments.length - 1;
      let node = siblingMap.get(segment);

      if (!node) {
        const isDirectory = isResult ? Boolean(result.is_dir) : true;
        node = {
          name: segment,
          path: isResult ? result.path : joinPath(rootPath, pathSegments),
          relative_path: pathSegments.join("/"),
          kind: isDirectory ? "directory" : "file",
          is_dir: isDirectory,
          size: isResult && !isDirectory ? Number(result.size || 0) : 0,
          modified: isResult ? result.modified : null,
          matched: isResult,
          synthetic: !isResult,
          children: [],
          child_map: new Map()
        };
        siblingMap.set(segment, node);
        siblings.push(node);
      } else if (isResult) {
        node.path = result.path;
        node.kind = result.kind;
        node.is_dir = Boolean(result.is_dir);
        node.size = node.is_dir ? 0 : Number(result.size || 0);
        node.modified = result.modified;
        node.matched = true;
        node.synthetic = false;
      }

      siblings = node.children;
      siblingMap = node.child_map;
    });
  }

  roots.forEach(finalizeNode);
  return roots;
}

export function filterResultTree(nodes, query, type) {
  const needle = String(query || "").trim().toLocaleLowerCase();

  const filterNode = (node) => {
    const children = node.children.map(filterNode).filter(Boolean);
    const kindMatches = type === "all" || node.kind === type;
    const textMatches =
      !needle || `${node.name}\n${node.relative_path}\n${node.path}`.toLocaleLowerCase().includes(needle);
    const selfMatches = node.matched && kindMatches && textMatches;

    if (!selfMatches && children.length === 0) {
      return null;
    }

    return { ...node, visible_match: selfMatches, children };
  };

  return nodes.map(filterNode).filter(Boolean);
}

function compareNodes(left, right, sort, language) {
  if (left.is_dir !== right.is_dir) {
    return left.is_dir ? -1 : 1;
  }

  const nameOrder = left.name.localeCompare(right.name, language, {
    numeric: true,
    sensitivity: "base"
  });

  if (sort === "name-desc") {
    return -nameOrder;
  }

  if (sort === "modified-desc" || sort === "modified-asc") {
    const difference = left.modified_sort - right.modified_sort;
    return (sort === "modified-desc" ? -difference : difference) || nameOrder;
  }

  if (sort === "size-desc" || sort === "size-asc") {
    const difference = left.size - right.size;
    return (sort === "size-desc" ? -difference : difference) || nameOrder;
  }

  return nameOrder;
}

export function sortResultTree(nodes, sort, language) {
  return [...nodes]
    .sort((left, right) => compareNodes(left, right, sort, language))
    .map((node) => ({ ...node, children: sortResultTree(node.children, sort, language) }));
}

export function flattenResultTree(nodes, collapsedPaths, depth = 0) {
  const rows = [];
  for (const node of nodes) {
    const collapsed = node.is_dir && collapsedPaths.has(node.relative_path);
    rows.push({ ...node, depth, collapsed });
    if (node.is_dir && !collapsed) {
      rows.push(...flattenResultTree(node.children, collapsedPaths, depth + 1));
    }
  }
  return rows;
}

export function countResultTree(nodes) {
  return nodes.reduce((total, node) => total + 1 + countResultTree(node.children), 0);
}

export function countVisibleResults(nodes) {
  return nodes.reduce(
    (total, node) => total + (node.visible_match ? 1 : 0) + countVisibleResults(node.children),
    0
  );
}
