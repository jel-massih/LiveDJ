$(function(){
  var socket = io.connect('http://192.241.169.33:8080/');
  
  socket.on('connect', function(){
    var delivery = new Delivery(socket);

      $("#update").click(function(evt){
        socket.emit('updateClients');
      });
       $("#resync").click(function(evt){
        socket.emit('resyncClients');
      });

    delivery.on('delivery.connect',function(delivery){
      console.log("connect!");
      $("#upload").click(function(evt){
        console.log("Uploading!");
        var file = $("input[type=file]")[0].files[0];
        delivery.send(file);
        evt.preventDefault();
      });
    });

    delivery.on('send.success',function(fileUID){
      console.log("file was successfully sent.");
    });
  });
});