type LoadingHandler = { increment: () => void; decrement: () => void };
let loadingHandler: LoadingHandler | null = null;

export function setLoadingHandler(handler: LoadingHandler) {
  loadingHandler = handler;
}

export function getLoadingHandler() {
  return loadingHandler;
}
