var http = require('http');
var url = require('url');
var fs = require('fs');
var qs = require('querystring');
var template = require('./template.js')

var app = http.createServer(function(request, response){
    var _url = request.url;
    var pathName = url.parse(_url, true).pathname;
    var queryData = url.parse(_url, true).query;
    if(pathName === '/'){
        if(queryData.id === undefined){
            fs.readdir('./data', 'utf8', (err, fileList) => {
                var title = 'Hello Main';
                var description = 'This is main page';
                var list = template.list(fileList);
                var temp = template.html(title, list,
                     `<article>${description}</article>`,
                     `<a href="/create">create</a>`);
                response.writeHead(200);
                response.end(temp);
            });
        }
        else{
            fs.readdir('./data', 'utf8', (err, fileList) => {
                fs.readFile(`./data/${queryData.id}`, 'utf8', function(err, description){
                    var title = queryData.id;
                    console.log(title);
                    var list = template.list(fileList);
                    temp = template.html(title, list,
                    `<article>${description}</article>`,
                    `<a href="/create">create</a>
                    <a href="/update?id=${title}">update</a>
                    <form action="/process_delete" method="POST">
                        <input type="hidden" name="id" value=${title}>
                        <input type="submit" value="delete">
                    </form>`)
                    response.writeHead(200);
                    response.end(temp);
                });
            });
        }
    }
    else if(pathName === '/create'){
        fs.readdir('./data', 'utf8', (err, fileList) => {
            var title = 'Create';
            var list = template.list(fileList);
            var temp = template.html(title, list,
                `
                <form action="/process_create" method="POST">
                    <p>
                        <input type="text" name="title" placeholder="title">
                    </p>
                    <p>
                        <textarea name="description"></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                `
                ,
                '');
            response.writeHead(200);
            response.end(temp);
        });
    }
    else if(pathName === '/process_create'){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            console.log(post);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`./data/${title}`, description, 'utf8', function(err){
                response.writeHead(302, {Location: `/?id=${title}`});
                response.end();
            });
            
        });
        
    }
    else if(pathName === '/update'){
        fs.readdir('./data', 'utf8', (err, fileList) => {
            var originId = queryData.id;
            fs.readFile(`./data/${originId}`, `utf8`, function(err, description){
                var title = originId;
                var list = template.list(fileList);
                var temp = template.html(title, list,
                    `
                    <form action="/process_update" method="POST">
                    <input type="hidden" name="id" value=${title}>
                        <p>
                            <input type="text" name="title" value=${title}>
                        </p>
                        <p>
                            <textarea name="description">${description}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>
                    `
                    ,
                    '');
                response.writeHead(200);
                response.end(temp);
            });
        });
    }
    else if(pathName === '/process_update'){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            console.log(post);
            var title = post.title;
            var id = post.id;
            var description = post.description;
            fs.rename(`./data/${id}`, `./data/${title}`, function(err){
                fs.writeFile(`./data/${title}`, description, 'utf8', function(err){
                    response.writeHead(302, {Location: `/?id=${title}`});
                    response.end();
                });
            });
        });
    }
    else if(pathName === `/process_delete`){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            
            var post = qs.parse(body);
            var id = post.id;
            console.log(body);
            fs.unlink(`./data/${id}`, function(err){
                response.writeHead(302, {Location: `/`});
                response.end();
            });
         });
    }
    else{
        response.writeHead(404);
        response.end("not found");
    }
});

app.listen(3000);