const fs = require('fs');
const path = require('path');

const Koa = require('koa');
const koaBody  = require('koa-body');
const koaStatic = require('koa-static');

const app = new Koa();

const staticPath = path.resolve(__dirname, 'public');
const uploadPath = path.resolve(__dirname, 'public/upload');

app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: uploadPath
  }
}));

app.use(koaStatic(staticPath));

app.use(async ctx => {
  if (ctx.path == '/') {
    ctx.set({
      'Content-Type': 'text/html'
    });
    ctx.body = fs.createReadStream(__dirname + '/public/index.html');
  } else if (ctx.path == '/upload' && ctx.method == 'POST') {
    let files = ctx.request.files.file;
    if (!Array.isArray(files)) files = [files];
    const urls = [];
    for (const file of files) {
      if (file.name != '') {
        fs.renameSync(file.path, path.join(uploadPath, file.name));
        urls.push(`http://${ctx.request.header.host}/upload/${file.name}`);
      }
    }
    ctx.body = {
      code: 200,
      data: {
        urls,
        success: urls.length,
        total: files.length 
      }
    };
  }
});

app.listen(8080);