const getScriptUrl = (environment, live) => {
  let envDomainPart = "";
  if (environment === "staging") {
    envDomainPart = "staging.";
  } else if (environment === "development") {
    envDomainPart = "dev.";
  }
  return `https://${envDomainPart}js${live ? "" : "-sandbox"}.getcatch.com/catchjs/v1/catch.js`;
};
let catchPromise = null;
const loadCatchjs = (options) => {
  if (catchPromise) {
    return catchPromise;
  }
  catchPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Catch.js must be loaded in a browser environment."));
      return;
    }
    const { live = false, environment = "production" } = options || {};
    if (environment !== "production") {
      console.warn(`Load Catch.js: A non-production version of Catch.js is being requested. The ${environment} build of Catch.js is intended only for internal/experimental use and provides no guarantee of stability. Proceed with caution.`);
    }
    let catchjs = getNamespace();
    if (catchjs) {
      const currentMode = catchjs.info.mode;
      if (live && currentMode !== "live" || !live && currentMode === "live") {
        reject(new Error(`Catch.js has already been loaded in different mode: ${currentMode}.`));
        return;
      }
      resolve(catchjs);
      return;
    }
    const scriptUrl = getScriptUrl(environment, live);
    let inject = false;
    let script = document.querySelector(`script[src="${scriptUrl}"]`);
    if (!script) {
      inject = true;
      script = document.createElement("script");
      script.src = scriptUrl;
    }
    script.addEventListener("load", () => {
      catchjs = getNamespace();
      if (catchjs) {
        resolve(catchjs);
      } else {
        reject(new Error("Catch.js not available."));
      }
    });
    script.addEventListener("error", () => {
      reject(new Error("Failed to load Catch.js"));
    });
    if (inject) {
      const node = document.head || document.body;
      if (node) {
        node.appendChild(script);
      } else {
        reject(new Error("Catch.js requires a <body> element."));
      }
    }
  });
  return catchPromise;
};
const getNamespace = () => window.catchjs;
export { loadCatchjs };
