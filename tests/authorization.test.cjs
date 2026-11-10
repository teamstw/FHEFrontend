const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
// Execute the real policy module after erasing its TypeScript-only imports.
const moduleUnderTest = { exports: {} };
const source = fs.readFileSync(
  path.join(__dirname, "../src/lib/authorization.ts"),
  "utf8",
);
new Function(
  "exports",
  ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
)(moduleUnderTest.exports);
const { canManageRole, scopeRole, canChangeMember } = moduleUnderTest.exports;
const groups = [
  { id: "a1", name: "Group 1", enterpriseName: "Enterprise A", role: "Owner" },
  { id: "b1", name: "Group 1", enterpriseName: "Enterprise B", role: "Member" },
  { id: "free", name: "Research", enterpriseName: null, role: "Admin" },
];
const workspaces = [
  { id: "a", name: "Enterprise A", type: "enterprise", role: "Member" },
  { id: "b", name: "Enterprise B", type: "enterprise", role: "Owner" },
];
for (const role of [
  "Owner",
  "Admin",
  "Member",
  null,
  undefined,
  "owner",
  "Enterprise Owner",
  "SuperAdmin",
])
  test("management gate: " + role, () =>
    assert.equal(canManageRole(role), role === "Owner" || role === "Admin"),
  );
test("Group Owner does not grant Enterprise management", () =>
  assert.equal(scopeRole("Enterprise A", groups, workspaces), "Member"));
test("Enterprise Owner does not grant Group management", () =>
  assert.equal(
    scopeRole("Enterprise B / Group 1", groups, workspaces),
    "Member",
  ));
test("same group name in different enterprises resolves independently", () =>
  assert.equal(
    scopeRole("Enterprise A / Group 1", groups, workspaces),
    "Owner",
  ));
test("independent group keeps own role", () =>
  assert.equal(
    scopeRole("Independent / Research", groups, workspaces),
    "Admin",
  ));
test("personal owner can manage own resources", () =>
  assert.equal(scopeRole("Personal", groups, workspaces), "Owner"));
test("unknown scope is denied", () =>
  assert.equal(scopeRole("Enterprise AA", groups, workspaces), null));
test("missing enterprise role is denied", () =>
  assert.equal(
    scopeRole("Enterprise C", groups, [
      { name: "Enterprise C", type: "enterprise" },
    ]),
    null,
  ));
test("ambiguous group scope is denied", () =>
  assert.equal(
    scopeRole("Enterprise A / Group 1", [...groups, groups[0]], workspaces),
    null,
  ));
for (const actor of ["Owner", "Admin", "Member", null])
  for (const target of ["Owner", "Admin", "Member"])
    test(actor + " managing " + target, () =>
      assert.equal(
        canChangeMember(actor, target),
        target !== "Owner" &&
          (actor === "Owner" || (actor === "Admin" && target === "Member")),
      ),
    );
