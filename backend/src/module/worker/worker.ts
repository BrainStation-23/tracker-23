import { parentPort, workerData } from 'worker_threads';

function processData(data: any) {
  return data;
}

if (parentPort) {
  const result = processData(workerData);
  parentPort.postMessage(result);
}
