import assert from "node:assert/strict";
import test from "node:test";

import { translations } from "../src/i18n/index.js";

test("every locale distinguishes matching files from matching folders", () => {
  for (const [language, messages] of Object.entries(translations)) {
    const found = messages.found("11", "3");
    const progress = messages.scanningProgress("11", "3", "/search/root");

    assert.match(found, /11/, `${language} found text omits the file count`);
    assert.match(found, /3/, `${language} found text omits the folder count`);
    assert.match(progress, /11/, `${language} progress text omits the file count`);
    assert.match(progress, /3/, `${language} progress text omits the folder count`);
    assert.match(progress, /\/search\/root/, `${language} progress text omits the current path`);
  }
});
