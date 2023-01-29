#!/usr/bin/env node

import cluster from "node:cluster";
import { getEnv, toStr, toInt, toBool, toList } from "../src/utils.js";
import { DemergiProxy } from "../src/proxy.js";
import { DemergiResolver } from "../src/resolver.js";
import { Logger } from "../src/logger.js";

const options = {
  addr: toStr(getEnv("DEMERGI_ADDR")),
  port: toInt(getEnv("DEMERGI_PORT")),
  hostList: toList(getEnv("DEMERGI_HOST_LIST")),
  workers: toInt(getEnv("DEMERGI_WORKERS")),
  inactivityTimeout: toInt(getEnv("DEMERGI_INACTIVITY_TIMEOUT")),
  happyEyeballs: toBool(getEnv("DEMERGI_HAPPY_EYEBALLS")),
  happyEyeballsTimeout: toInt(getEnv("DEMERGI_HAPPY_EYEBALLS_TIMEOUT")),
  dnsMode: toStr(getEnv("DEMERGI_DNS_MODE")),
  dnsCacheSize: toInt(getEnv("DEMERGI_DNS_CACHE_SIZE")),
  dohUrl: toStr(getEnv("DEMERGI_DOH_URL")),
  dohTlsServername: toStr(getEnv("DEMERGI_DOH_TLS_SERVERNAME")),
  dohTlsPin: toStr(getEnv("DEMERGI_DOH_TLS_PIN")),
  dotHost: toStr(getEnv("DEMERGI_DOT_HOST")),
  dotPort: toInt(getEnv("DEMERGI_DOT_PORT")),
  dotTlsServername: toStr(getEnv("DEMERGI_DOT_TLS_SERVERNAME")),
  dotTlsPin: toStr(getEnv("DEMERGI_DOT_TLS_PIN")),
  httpsClientHelloSize: toInt(getEnv("DEMERGI_HTTPS_CLIENTHELLO_SIZE")),
  httpsClientHelloTLSv: toInt(getEnv("DEMERGI_HTTPS_CLIENTHELLO_TLSV")),
  httpNewlineSeparator: toStr(getEnv("DEMERGI_HTTP_NEWLINE_SEPARATOR")),
  httpMethodSeparator: toStr(getEnv("DEMERGI_HTTP_METHOD_SEPARATOR")),
  httpTargetSeparator: toStr(getEnv("DEMERGI_HTTP_TARGET_SEPARATOR")),
  httpHostHeaderSeparator: toStr(getEnv("DEMERGI_HTTP_HOST_HEADER_SEPARATOR")),
  httpMixHostHeaderCase: toBool(getEnv("DEMERGI_HTTP_MIX_HOST_HEADER_CASE")),
  logLevel: toStr(getEnv("DEMERGI_LOG_LEVEL")),
};

const argv = process.argv.slice(2);
getopts: for (let i = 0; i < argv.length; i++) {
  switch (argv[i]) {
    case "-A":
    case "--addr":
      options.addr = toStr(argv[++i]);
      break;
    case "-P":
    case "--port":
      options.port = toInt(argv[++i]);
      break;
    case "-H":
    case "--host-list":
      options.hostList = toList(argv[++i]);
      break;
    case "-W":
    case "--workers":
      options.workers = toInt(argv[++i]);
      break;
    case "--inactivity-timeout":
      options.inactivityTimeout = toInt(argv[++i]);
      break;
    case "--happy-eyeballs":
      options.happyEyeballs = toBool(argv[++i]);
      break;
    case "--happy-eyeballs-timeout":
      options.happyEyeballsTimeout = toInt(argv[++i]);
      break;
    case "--dns-mode":
      options.dnsMode = toStr(argv[++i]);
      break;
    case "--dns-cache-size":
      options.dnsCacheSize = toInt(argv[++i]);
      break;
    case "--doh-url":
      options.dohUrl = toStr(argv[++i]);
      break;
    case "--doh-tls-servername":
      options.dohTlsServername = toStr(argv[++i]);
      break;
    case "--doh-tls-pin":
      options.dohTlsPin = toStr(argv[++i]);
      break;
    case "--dot-host":
      options.dotHost = toStr(argv[++i]);
      break;
    case "--dot-port":
      options.dotPort = toInt(argv[++i]);
      break;
    case "--dot-tls-servername":
      options.dotTlsServername = toStr(argv[++i]);
      break;
    case "--dot-tls-pin":
      options.dotTlsPin = toStr(argv[++i]);
      break;
    case "--https-clienthello-size":
      options.httpsClientHelloSize = toInt(argv[++i]);
      break;
    case "--https-clienthello-tlsv":
      options.httpsClientHelloTLSv = toStr(argv[++i]);
      break;
    case "--http-newline-separator":
      options.httpNewlineSeparator = toStr(argv[++i]);
      break;
    case "--http-method-separator":
      options.httpMethodSeparator = toStr(argv[++i]);
      break;
    case "--http-target-separator":
      options.httpTargetSeparator = toStr(argv[++i]);
      break;
    case "--http-host-header-separator":
      options.httpHostHeaderSeparator = toStr(argv[++i]);
      break;
    case "--http-mix-host-header-case":
      options.httpMixHostHeaderCase = toBool(argv[++i]);
      break;
    case "-l":
    case "--log-level":
      options.logLevel = toStr(argv[++i]);
      break;
    case "-v":
    case "--version":
      console.log(`Demergi 1.4.0`);
      process.exit(0);
      break;
    case "-h":
    case "--help":
      console.log(
        [
          `Usage: demergi [OPTION]...`,
          ``,
          `A proxy server that helps to bypass the DPI systems implemented by various ISPs.`,
          ``,
          `Proxy:`,
          `  -A, --addr STR, $DEMERGI_ADDR`,
          `  The address to bind the server to ("::" by default).`,
          ``,
          `  -P, --port NUM, $DEMERGI_PORT`,
          `  The port to bind the server to (8080 by default).`,
          ``,
          `  -H, --host-list STR, $DEMERGI_HOST_LIST`,
          `  The host list separated by commas or spaces to apply the evasion techniques,`,
          `  will be applied to all hosts if unspecified (unspecified by default).`,
          ``,
          `  -W, --workers NUM, $DEMERGI_WORKERS`,
          `  The number of workers (0 by default).`,
          ``,
          `  --inactivity-timeout NUM, $DEMERGI_INACTIVITY_TIMEOUT`,
          `  Maximum time in ms before the connection is closed due to inactivity`,
          `  (60000 by default).`,
          ``,
          `  --happy-eyeballs BOOL, $DEMERGI_HAPPY_EYEBALLS`,
          `  Enable Happy Eyeballs algorithm (RFC 8305) (EXPERIMENTAL) (false by default).`,
          ``,
          `  --happy-eyeballs-timeout NUM, $DEMERGI_HAPPY_EYEBALLS_TIMEOUT`,
          `  Maximum time in ms for IPv6 before trying IPv4 (250 by default).`,
          ``,
          `Resolver:`,
          `  --dns-mode STR, $DEMERGI_DNS_MODE`,
          `  The DNS resolver mode, valid values are "plain", "doh" and "dot" ("dot" by`,
          `  default).`,
          ``,
          `  --dns-cache-size NUM, $DEMERGI_DNS_CACHE_SIZE`,
          `  The maximum number of entries in the DNS cache (100000 by default).`,
          ``,
          `  --doh-url STR, $DEMERGI_DOH_URL`,
          `  The DoH URL ("https://1.0.0.1/dns-query" by default).`,
          ``,
          `  --doh-tls-servername STR, $DEMERGI_DOH_TLS_SERVERNAME`,
          `  The server name to check in the DoH server certificate (unspecified by`,
          `  default).`,
          ``,
          `  --doh-tls-pin STR, $DEMERGI_DOH_TLS_PIN`,
          `  The pin to check in the DoH server certificate. The pin must be a base64`,
          `  encoded SHA256 hash of the public key (unspecified by default).`,
          ``,
          `  --dot-host STR, $DEMERGI_DOT_HOST`,
          `  The DoT server host ("1.0.0.1" by default).`,
          ``,
          `  --dot-port NUM, $DEMERGI_DOT_PORT`,
          `  The DoT server port (853 by default).`,
          ``,
          `  --dot-tls-servername STR, $DEMERGI_DOT_TLS_SERVERNAME`,
          `  The server name to check in the DoT server certificate (unspecified by`,
          `  default).`,
          ``,
          `  --dot-tls-pin STR, $DEMERGI_DOT_TLS_PIN`,
          `  The pin to check in the DoT server certificate. The pin must be a base64`,
          `  encoded SHA256 hash of the public key (unspecified by default).`,
          ``,
          `HTTPS:`,
          `  --https-clienthello-size NUM, $DEMERGI_HTTPS_CLIENTHELLO_SIZE`,
          `  The maximum chunk size in bytes for the ClientHello packet. A less than 1`,
          `  value disables fragmentation (40 by default).`,
          ``,
          `  --https-clienthello-tlsv STR, $DEMERGI_HTTPS_CLIENTHELLO_TLSV`,
          `  The TLS protocol version to set in the ClientHello packet, valid values are`,
          `  "1.0", "1.1", "1.2" and "1.3" ("1.3" by default).`,
          ``,
          `HTTP:`,
          `  --http-newline-separator STR, $DEMERGI_HTTP_NEWLINE_SEPARATOR`,
          `  The string to use to separate new lines ("\\r\\n" by default).`,
          ``,
          `  --http-method-separator STR, $DEMERGI_HTTP_METHOD_SEPARATOR`,
          `  The string to use to separate the HTTP method from the target (" " by`,
          `  default).`,
          ``,
          `  --http-target-separator STR, $DEMERGI_HTTP_TARGET_SEPARATOR`,
          `  The string to use to separate the target from the HTTP version (" " by`,
          `  default).`,
          ``,
          `  --http-host-header-separator STR, $DEMERGI_HTTP_HOST_HEADER_SEPARATOR`,
          `  The string to use to separate the host header key from its value (":" by`,
          `  default).`,
          ``,
          `  --http-mix-host-header-case BOOL, $DEMERGI_HTTP_MIX_HOST_HEADER_CASE`,
          `  Alternate upper and lower case in the host header (true by default).`,
          ``,
          `Info:`,
          `  -l, --log-level STR, $DEMERGI_LOG_LEVEL`,
          `  The log level, valid values are "debug", "info", "warn", "error" and "none"`,
          `  ("info" by default).`,
          ``,
          `  -v, --version`,
          `  Show version and quit.`,
          ``,
          `  -h, --help`,
          `  Show this help and quit.`,
        ].join("\n")
      );
      process.exit(0);
      break;
    case "--":
      break getopts;
    default:
      console.log(
        [
          `Illegal option "${argv[i]}".`,
          `Try "--help" for usage information.`,
        ].join("\n")
      );
      process.exit(1);
  }
}

if (options.logLevel?.length > 0) {
  Logger.level = options.logLevel;
}

if (options.workers > 0 && cluster.isPrimary) {
  cluster.on("online", (worker) => {
    Logger.debug(`Worker ${worker.process.pid} started`);
  });

  cluster.on("exit", (worker, code, signal) => {
    Logger.debug(`Worker ${worker.process.pid} died (${signal || code})`);
  });

  for (let i = 0; i < options.workers; i++) {
    cluster.fork();
  }
} else {
  const proxy = new DemergiProxy({
    addr: options.addr,
    port: options.port,
    hostList: options.hostList,
    inactivityTimeout: options.inactivityTimeout,
    happyEyeballs: options.happyEyeballs,
    happyEyeballsTimeout: options.happyEyeballsTimeout,
    httpsClientHelloSize: options.httpsClientHelloSize,
    httpsClientHelloTLSv: options.httpsClientHelloTLSv,
    httpNewlineSeparator: options.httpNewlineSeparator,
    httpMethodSeparator: options.httpMethodSeparator,
    httpTargetSeparator: options.httpTargetSeparator,
    httpHostHeaderSeparator: options.httpHostHeaderSeparator,
    httpMixHostHeaderCase: options.httpMixHostHeaderCase,
    resolver: new DemergiResolver({
      dnsMode: options.dnsMode,
      dnsCacheSize: options.dnsCacheSize,
      dohUrl: options.dohUrl,
      dohTlsServername: options.dohTlsServername,
      dohTlsPin: options.dohTlsPin,
      dotHost: options.dotHost,
      dotPort: options.dotPort,
      dotTlsServername: options.dotTlsServername,
      dotTlsPin: options.dotTlsPin,
    }),
  });

  (async () => {
    await proxy.start();
    Logger.info(`Listening on ${proxy.addr}:${proxy.port}`);

    for (const event of ["SIGINT", "SIGTERM"]) {
      process.on(event, async () => {
        await proxy.stop();
        Logger.info("Exiting");
        process.exit(0);
      });
    }
  })();
}
