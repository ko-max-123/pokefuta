(() => {
  if (!("serviceWorker" in navigator)) return;
  if (!/^https?:$/.test(window.location.protocol)) return;

  const script = document.currentScript;
  if (!script?.src) return;

  const siteRoot = new URL("../../", script.src);
  const serviceWorkerUrl = new URL("service-worker.js", siteRoot);

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(serviceWorkerUrl, {
        scope: siteRoot.pathname
      });
      registration.update();
    } catch (error) {
      console.warn("PWAの準備に失敗しました。", error);
    }
  });
})();
