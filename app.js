const fs = require('fs');
const path = require('path');

const Koa = require('koa');
const parser  = require('./parser.js');
const koaStatic = require('koa-static');

const app = new Koa();

const staticPath = './public';
const uploadPath = './public/upload';

app.use(parser({
  multiples: true
}));

app.use(koaStatic(path.join(__dirname, staticPath)));

app.use(async ctx => {
  if (ctx.path == '/') {
    ctx.set({
      'Content-Type': 'text/html'
    });
    ctx.body = fs.createReadStream(__dirname + '/public/index.html');
  } else if (ctx.path == '/upload' && ctx.method == 'POST') {
    const { files } = ctx.request.formData;
    const file = files.file;

    if (file.name != '') {
      fs.renameSync(file.path, path.join(uploadPath, file.name));
      ctx.body = {
        code: 200,
        data: {
          url: `http://${ctx.request.header.host}/upload/${file.name}`
        }
      };
    } else {
      ctx.body = {
        code: 500,
        data: 'Error'
      };
    }
  }
});

app.listen(8080);