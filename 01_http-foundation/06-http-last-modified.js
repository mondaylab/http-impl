/**
 * @description 用协商缓存发起请求
 */

const server = http.createServer((req, res) => {
  let filePath = path.resolve(
    __dirname,
    path.join('www', url.fileURLToPath(`file:///${req.url}`))
  );

  if (fs.existsSync(filePath)) {
    // 通过fs.statSync获取文件信息
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    if (fs.existsSync(filePath)) {
      const { ext } = path.parse(filePath);
      const stats = fs.statSync(filePath);
      const timeStamp = req.headers['if-modified-since'];
      let status = 200;
      /**
       * stats.mtimeMs表示文件的修改时间
       * 设置stats.mtimeMs为last-modified响应头的值
       * 这样，当浏览器第一次收到响应时，就会缓存响应内容，并且在以后访问同一个 URL 的时候，
       * 自动带上If-Modified-Since请求头，内容为之前Last-Modified响应头的时间戳。
       */
      if (timeStamp && Number(timeStamp) === stats.mtimeMs) {
        // 如果timeStamp和stats.mtimeMS相等，说明文件内容没有修改
        status = 304;
      }
      res.writeHead(status, {
        'Content-Type': mime.getType(ext),
        'Cache-Control': 'max-age=86400', // 强缓存一天
        'Last-Modified': stats.mtimeMs
      });
      if (status === 200) {
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
      } else {
        res.end(); // 如果状态码不是200，不用返回Body
      }
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>Not Found</h1>');
  }
});
