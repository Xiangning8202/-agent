export const roles = {
  admin: { id: "U-001", name: "张小野", role: "admin", roleLabel: "管理员", department: "增长运营中心" },
  employee: { id: "U-002", name: "李思远", role: "employee", roleLabel: "正式员工", department: "品牌市场部" },
  partner: { id: "P-001", name: "赵一鸣", role: "partner", roleLabel: "代理商", department: "华东渠道合作商" }
};

export const initialState = {
  role: "employee",
  route: "image",
  toast: "",
  drawer: null,
  modal: null,
  topPanel: null,
  generationMode: "native",
  conversationCleared: false,
  taskType: "全部任务类型",
  assetType: "全部",
  knowledgeType: "common",
  knowledgeCategory: 0,
  accountTab: "accounts",
  drafts: {},
  selectedAssets: new Set()
};

let state = structuredClone({ ...initialState, selectedAssets: [] });
const listeners = new Set();

export function getState() {
  return { ...state, selectedAssets: new Set(state.selectedAssets) };
}

export function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener(getState()));
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setRole(role) {
  if (!roles[role]) throw new Error(`Unknown role: ${role}`);
  setState({ role, route: role === "partner" ? "partner-assets" : "image", drawer: null, modal: null, topPanel: null });
}

export function saveDraft(key, value) {
  const drafts = { ...state.drafts, [key]: { ...value, savedAt: new Date().toISOString() } };
  setState({ drafts, toast: "草稿已保存，并同步给 Agent" });
  return drafts[key];
}

export function resetState() {
  state = structuredClone({ ...initialState, selectedAssets: [] });
}

export function canView(route, role) {
  const partnerRoutes = new Set(["partner-assets", "partner-downloads"]);
  if (role === "partner") return partnerRoutes.has(route);
  return !partnerRoutes.has(route);
}
