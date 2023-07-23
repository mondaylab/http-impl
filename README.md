# http-impl

# 基础信息

## 材料backup

juejin小册：[从前端到全栈](https://juejin.cn/book/7133100888566005763?utm_source=course_list)

本仓库沉淀内容：理解http部分 → 12-22节

## 相关数据
[COVID 19 数据](https://github.com/maxMaxineChen/COVID-19-worldwide-json-data-script)



# 仓库相关

## 代码结构


文章目录结构如下所示：

```bash
|——
```



## 数据解析类型

从页面提交数据到拦截器，可以通过POST请求来提交。`POST` 请求与 `GET` 请求不同，有多种数据提交方式，由 `request` 的 `Content-Type` 字段决定，其中常用的有`application/x-www-form-urlencoded`、`application/json`、`multipart/form-data`等。

**第一种：** `application/x-www-form-urlencoded` 。

`application/x-www-form-urlencoded`是最常见的数据提交方式，在这种方式下，`POST` 的 `body` 中的数据格式和 `GET` 的 `URL` 参数的格式一样，都是经过 `URLEncode` 的`key1=value1&key2=value2&...` 的形式。所以，解析这种方式提交的数据，我们可以和解析 `GET` 里的参数一样，**具体操作如下：**

```bash
POST http://www.example.com HTTP/1.1
Content-Type: application/x-www-form-urlencoded;charset=utf-8

title=test&sub%5B%5D=1&sub%5B%5D=2&sub%5B%5D=3
```

**第二种：** `application/json` 。

需要注意的是，如果是`applicaiton/json`格式，body 中的数据是字符串化的 JSON 数据，我们直接通过 JSON.parse 解析即可。

```bash
POST http://www.example.com HTTP/1.1
Content-Type: application/json;charset=utf-8

{"title":"test","sub":[1,2,3]}
```

**第三种：** `multipart/form-data`。

`multipart/form-data`格式则稍稍复杂，这种格式是用来发送多种格式的数据的，比如文件上传或者发送二进制数据等，`multipart/form-data`会在请求的 body 中生成分隔符，用来分隔不同的字段，所以用这种格式提交的数据内容大致如下：

```bash
POST http://www.example.com HTTP/1.1
Content-Type:multipart/form-data; boundary=----WebKitFormBoundaryrGKCBY7qhFd3TrwA

------WebKitFormBoundaryrGKCBY7qhFd3TrwA
Content-Disposition: form-data; name="text"

title
------WebKitFormBoundaryrGKCBY7qhFd3TrwA
Content-Disposition: form-data; name="file"; filename="chrome.png"
Content-Type: image/png

PNG ... content of chrome.png ...
------WebKitFormBoundaryrGKCBY7qhFd3TrwA--
```



## 代码组织形式

一般来说，实现一个服务器接口是在服务器端做两件事情，如下：

- 在`model`模块中添加一个方法操作数据库；
- 在`server`中添加一个拦截切面，提供一个`URL`给前端调用。（这个`URL`就是我们平常调用的接口地址）

在前端也做`2`件事情：

- 用`fetch`方法调用对应的`URL`发送请求；
- 根据请求返回的结果更新`UI`界面。

服务端的两件事情，分别属于两个不同的层次，一个是模型（model）层，一个是逻辑（logical）层，如果我们把逻辑层再细分，考虑服务端渲染又可以分为视图（view）层和控制（controller）层，这样我们的服务器就开始有了MVC模式的雏形，MVC时服务器常用的设计模型。











