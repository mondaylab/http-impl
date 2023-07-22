class Interceptor {
  constructor() {
    this.aspects = [];
  }
  /**
   use(async (context, next) => {
    ...request...
    await next()
    ...response...
   })
   */

  use(/* async */ functor) {
    this.aspects.push(functor); // 嗯……记得大写……找了半天bug才发现是这里的问题
    return this;
  }

  async run(context) {
    const aspects = this.aspects;

    const proc = aspects.reduceRight(
      function (a, b) {
        // eslint-disable-line
        return async () => {
          await b(context, a);
        };
      },
      () => Promise.resolve()
    );

    try {
      await proc();
    } catch (ex) {
      console.error(ex.message);
    }

    return context;
  }
}

module.exports = Interceptor;
