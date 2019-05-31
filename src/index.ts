"use strict";

import { extend } from "./extend";
import { MeterProvider } from "./provider";

const meterify = function(
  web3Instance: any,
  host = "http://localhost:8669",
  timeout = 0
) {
  const provider = new MeterProvider(host, timeout);
  web3Instance.setProvider(provider);

  extend(web3Instance);

  return web3Instance;
};

export { meterify };
