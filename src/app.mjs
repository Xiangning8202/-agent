import { canView, getState, setRole, setState, subscribe } from "./state.mjs";
import { pageHeader, renderShell } from "./ui.mjs";

const app = document.querySelector("#app");

async function render() {
  const state = getState();
  if (!canView(state.route, state.role)) {
    setState({ route: state.role === "partner" ? "partner-assets" : "image" });
    return;
  }
  app.innerHTML = renderShell(state);
  document.querySelectorAll("[data-route]").forEach((button) => button.addEventListener("click", () => setState({ route: button.dataset.route, drawer: null, modal: null, topPanel: null })));
  document.querySelectorAll("[data-top-panel]").forEach((button) => button.addEventListener("click", () => setState({ topPanel: state.topPanel === button.dataset.topPanel ? null : button.dataset.topPanel })));
  document.querySelector("[data-close-top]")?.addEventListener("click", () => setState({ topPanel: null }));
  document.querySelector("#role-switch")?.addEventListener("change", (event) => setRole(event.target.value));
  const content = document.querySelector("#content");
  try {
    const module = await import("./features.mjs");
    content.innerHTML = module.renderRoute(getState());
    module.bindRoute?.(getState());
  } catch (error) {
    content.innerHTML = `${pageHeader("页面暂时不可用", "请刷新后重试")}<div class="error-box">${error.message}</div>`;
    console.error(error);
  }
}

subscribe(render);
render();
