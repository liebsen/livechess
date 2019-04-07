$(document).ready(function() {
  var socket = io();  
  var board,
    synced = false,
    game = new Chess(),
    statusEl = $('#status'),
    fenEl = $('#fen'),
    pgnEl = $('#pgn');
    firstEl = $('#first');
    nextEl = $('#next');
    backEl = $('#back');
    lastEl = $('#last');
    flipEl = $('#flip');

    backEl.click(function(){
      board.position(game.back())
    })

    nextEl.click(function(){
      board.position(game.next())
    })

    firstEl.click(function(){
      board.position(game.first())
    })

    lastEl.click(function(){
      board.position(game.last())
    })

    flipEl.click(function(){
      board.flip()
      var head = $('.boardhead').html(),
      foot = $('.boardfoot').html()
      $('.boardhead').html(foot)
      $('.boardfoot').html(head)
    })   

  var updateStatus = function() {
    var status = '';
    var moveColor = 'Blancas';
    var turn = game.turn()
    var pgn = game.pgn()

    if(!synced && data.turn){
      turn = data.turn
      pgn = data.pgn
    } 

    if (turn === 'b') {
      moveColor = 'Negras';
    }

    // checkmate?
    if (game.in_checkmate() === true) {
      status = 'Juego finalizado. ' + moveColor + ' en jaquemate.';
    }

    // draw?
    else if (game.in_draw() === true) {
      status = 'Juego finalizado, tablas.';
    }

    // game still on
    else {
      status = moveColor + ' por mover.';

      // check?
      if (game.in_check() === true) {
        status += ', ' + moveColor + ' están en jaque.';
      }
    }
    statusEl.html(status);
    //fenEl.html(game.fen());
    pgnEl.html(pgn);
  };

  var pos = 'start';

  if(data.fen){
    pos = data.fen
  }

  var cfg = {
    draggable: false,
    position: pos
  };

  if(data.pgn){
    game.load_pgn(data.pgn)
  }
 
  if(data.pgn && pos == 'start'){
    setTimeout(function(){
      lastEl.click()
    },500)
  } 
  
  socket.emit('join', data.room);  //join room as defined by query parameter in URL bar

  socket.on('undo', function(){ //remote undo by peer
    game.undo()
    updateStatus();
    board.position(game.fen());
  })

  socket.on('move', function(moveObj){ //remote move by peer
    console.log('peer move: ' + JSON.stringify(moveObj));
     var move = game.move(moveObj);
    // illegal move
    if (move === null) {
      return;
    }
    updateStatus();
    board.position(game.fen());
  });

  board = ChessBoard('board', cfg);
  updateStatus();

  ['white','black','whiteelo','blackelo','event','date','site','eco','result'].forEach(function(entry) {
    if(data[entry]){
      $('#' + entry).text(data[entry])  
    }
  })
});