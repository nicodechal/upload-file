const forms = require('formidable');

function parseBody(opts = {}) {

  opts.progressListener = 
    Object.prototype.hasOwnProperty.call(opts, 'progressListener') 
      ? opts.progressListener 
      : Function.prototype;

  return async function (ctx, next) {
    const formData = await formy(ctx, opts);
    // eslint-disable-next-line require-atomic-updates
    ctx.request.formData = formData;
    return next();
  };
}

function formy (ctx, opts) {
  return new Promise((resolve, reject) => {
    const form = forms.IncomingForm(opts);
    const fields = {}, files = {};

    form.on('end', function() {
      return resolve({
        fields,
        files
      });
    }).on('error', function (e) {
      return reject(e);
    }).on('field', function(field, value) {
      fields[field] = value;
    }).on('file', function(field, file) {
      files[field] = file;
    }).on('progress', function(cur, total) {
      opts.progressListener.call(this, cur, total);
    });
    form.parse(ctx.req);
  });
}
module.exports = parseBody;