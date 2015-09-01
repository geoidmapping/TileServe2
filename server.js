var express = require("express"),
    app = express(),
    MBTiles = require('mbtiles'),
    server = require('http').createServer(app),
    find = require('find'),
    open = require("mac-open"),
    io = require('socket.io')(server),
    p = require("path"),
    fs = require('graceful-fs'),
    mkdirp = require('mkdirp'),
   sqlite3 = require('sqlite3').verbose();

// path to the mbtiles; default is the server.js directory
var tilesDir = __dirname;

// Set mime type from user input
function getContentType(t) {
    if (t === "jpg") {
        return "image/jpeg";
    }
    if (t === "png") {
        return "image/png";
    }
}

app.use(express.static(__dirname));

app.get("/", function (req, res) {
  res.redirect("/index.html");
});


app.get('/:s/:z/:x/:y.:t', function(req, res) {
    new MBTiles(p.join(tilesDir, req.params.s + '.mbtiles'), function(err, mbtiles) {
        mbtiles.getTile(req.params.z, req.params.x, req.params.y, function(err, tile, headers) {
            if (err) {
                res.set({
                    "Content-Type": "text/plain"
                });
                res.status(404).send('Tile rendering error: ' + err + '\n');
            } else {
                res.set({
                    "Content-Type": getContentType(req.params.t),
                    "Cache-Control": "public, max-age=2592000" 
                });
                res.send(tile);
            }
        });
        if (err) console.log("error opening database");
    });
});

console.log('Listening on port: ' + 3001);
server.listen(3001);


  open("http://localhost:" + '3001' + "/index.html");



io.on('connection', function (socket) {
  var addedUser = false;
console.log('Listening');
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
    
    
    
    
    
  });
  
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  
  
  socket.on('folders', function(msg){
    console.log(tilesDir+"/"+msg.basename);
     read(msg.id, tilesDir+"/"+msg.basename, "png");
    //read(dbname, mbpath, imgtype);
    
  });


  socket.on('Rtiles', function(msg){
       io.emit('resetTiles', 'reset');
    console.log('message: ' + msg);
    metadata(tilesDir);
  });

  });
  
  
 
var metadata = function getmetadatga(pathed){

find.file(/\.mbtiles$/, pathed, function(files) {
    
  console.log(files);
 
    for(i=0; i<files.length; i++)  
    {
        new MBTiles(files[i], function(err, mbtiles) {
               mbtiles.getInfo(function(err, mbtiles) {
                        // console.log(data);
                                       
    io.emit('recTiles', mbtiles);
    
  });
});
                        
                        //datas.push(mbtiles)
    }
               });

 
 
}


  
 var read = function parsembtiles(dbname, mbpath, imgtype) {
    
     var db = new sqlite3.Database(mbpath, sqlite3.OPEN_READONLY);
    
    console.log(mbpath);
    
    mkdirp(tilesDir+'/'+'extracted'+'/'+dbname, function (err) {
        if (err) console.error(err)
        else console.log('dir made!')  
    });
     
    db.each("select zoom_level, tile_column, tile_row, tile_data from tiles", function(err, row) {
       
        mkdirp(tilesDir+'/'+'extracted'+'/'+dbname+'/'+row.zoom_level+'/'+row.tile_column, function (err) {
            if (err) console.error(err)
            else console.log('pow!')
            var y = Math.pow(2, row.zoom_level) - row.tile_row - 1;
            fs.writeFile(tilesDir+'/'+'extracted'+'/'+dbname+'/'+row.zoom_level+'/'+row.tile_column+'/'+y+".png", row.tile_data, 'base64', function(err) {
            if(err)console.log(err);
            });
        
        });   
            
    // console.log(row.zoom_level + ": ");
     // fs.writeFile("files/"+row.zoom_level+"testit.txt", row.zoom_level, function(err) {});
     // console.log("yo"+res);
      //res++;
        //console.log(res);
       
  });
    
};
 
