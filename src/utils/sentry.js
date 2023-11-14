const Sentry = require("@sentry/node");
const { ProfilingIntegration } = require("@sentry/profiling-node");

const sentryInit = (app) => {
    Sentry.init({
        dsn: 'https://6526f7269046d41251e9115680752bef@o4506153693020160.ingest.sentry.io/4506224607821824',
        integrations: [
          // enable HTTP calls tracing
          new Sentry.Integrations.Http({ tracing: true }),
          // enable Express.js middleware tracing
          new Sentry.Integrations.Express({ app }),
          new ProfilingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0,
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: 1.0,
    });
}

module.exports = { Sentry, sentryInit };