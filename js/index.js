/*NOTE: firefox setTimout() is bugged (Bug 814651)*/
/*TODO list: 
1. Personalized player names
2. clear up code
3. Implementing alpha-beta algorithm to improve performance*/
$(function() {  
  $('#menu-close').click(function() {
    $('.menu-overlay').fadeOut();
  });
  $('#menu-open').click(function() {
    $('.menu-overlay').fadeIn();
  });
  
  $('#human-player').click(function() {
    $('#game').remove();
    $('#game-container').html('<canvas id="game" width="250px" height="250px"></canvas>');
    gameEngine(1, 0);
    $('.menu-overlay').fadeOut();
  });
  $('#pc-player').click(function() {
    $('#game').remove();
    $('#game-container').html('<canvas id="game" width="250px" height="250px"></canvas>');
    if($('#pcFirst').prop('checked')) gameEngine(2, 1);
    else gameEngine(1, 2);
    $('.menu-overlay').fadeOut();
  });
  
  gameEngine(1, 2);
});

function gameEngine(plyrSeed, pcSeed) {
  var game = document.getElementById('game');
  var reset = document.getElementById('reset');
  var ctx = game.getContext('2d');
  var w = game.width;
  var h = game.height;
  var cells = [
    [
      {cx: w/2 - h/2, cy: 0},
      {cx: w/2 - h/6, cy: 0},
      {cx: w/2 + h/6, cy: 0}
    ],
    [
      {cx: w/2 - h/2, cy: h/3},
      {cx: w/2 - h/6, cy: h/3},
      {cx: w/2 + h/6, cy: h/3}
    ],
    [
      {cx: w/2 - h/2, cy: h*2/3},
      {cx: w/2 - h/6, cy: h*2/3},
      {cx: w/2 + h/6, cy: h*2/3}
    ]
  ];
  var moves = 0;
  var points = [0, 0];
  var ready = 1;
  var tris = 0;
  
  clear();
  points = [0, 0];
  document.getElementById('points1').innerHTML = 0;
  document.getElementById('points2').innerHTML = 0;
  
  game.addEventListener('click', function(event) {run(event);});

  reset.addEventListener('click', function() {
    clear();
    points = [0, 0];
    document.getElementById('points1').innerHTML = 0;
    document.getElementById('points2').innerHTML = 0;
  });

  function gameBoard() {
    var px = 0, j = 0, i = 0;
    moves = 0;

    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;


    for(j in cells) {
      for(i in cells[j]) {
        cells[j][i].val = 0;
      }
    }

    ready = 0;
    var slowDraw = setInterval(function(){
      px++;
      ctx.beginPath();
      ctx.moveTo(w/2 - h/6, px-1);
      ctx.lineTo(w/2 - h/6, px);
      ctx.moveTo(w/2 + h/6, h-px+1);
      ctx.lineTo(w/2 + h/6, h-px);
      ctx.moveTo(w/2 - h/2 + px-1, h/3);
      ctx.lineTo(w/2 - h/2 + px, h/3);
      ctx.moveTo(w/2 + h/2 - px + 1, 2*h/3);
      ctx.lineTo(w/2 + h/2 - px, 2*h/3);
      ctx.stroke();
      if(px === h) {
        px = 0;
        ready = 1;
        clearInterval(slowDraw);
        return 0;
      }
    }, 1);

    return 0;
  }
  function getCell(cells, x, y) {
    var j = 0, i = 0;

    for(j in cells) {
      for(i in cells[j]) {
        if(cells[j][i].cx <= x && cells[j][i].cx + h/3 >= x && cells[j][i].cy <= y && cells[j][i].cy + h/3 >= y) {
          return [j, i];
        } 
      }
    }
  }
  function cross(x, y) {
    var pxh = 0, pxw = 0;

    ctx.strokeStyle = "#F00";
    ctx.lineWidth = 3;
    ctx.shadowColor = '#900';
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.shadowBlur = 5;

    ready = 0;
    var slowDrawL = setInterval(function() {
      ctx.beginPath();
      ctx.moveTo(x+pxw+10, y+pxh+10);
      ctx.lineTo(x+(++pxw)+10, y+(++pxh)+10);
      ctx.stroke();
      if(pxh === Math.round(h/3)-20 && pxw === Math.round(h/3)-20) {
        ready = 1;
        return clearInterval(slowDrawL);
      }
    }, 1);

    ctx.beginPath();
    ctx.moveTo(x+h/3-10, y+10);
    ctx.lineTo(x+10, y+h/3-10);
    ctx.stroke();

    return 1;
  }
  function circle(x, y) {
    var r = Math.sqrt(h*h/36) - 10;
    var perc = 0;

    ctx.strokeStyle = "#00F";
    ctx.lineWidth = 3;
    ctx.shadowColor = '#009';
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.shadowBlur = 5;

    ready = 0;
    var slowDraw = setInterval(function() {
      ctx.beginPath();
      ctx.arc(x+h/6, y+h/6, r, 2*(perc/100)*Math.PI, 2*(++perc/100)*Math.PI);
      ctx.stroke();
      if(perc === 100) {
        ready = 1;
        return clearInterval(slowDraw);
      }
    }, 1);

    return 2;
  }
  function clear() {
    var wait = setInterval(function() {
      if(ready) {
        ctx.clearRect(0,0,w,h);
        gameBoard();
        firstRun();
        clearInterval(wait);
      }
    }, 1);

    return 0;
  }
  function chkTris(cells) {
    var i = 0;

    //check horizontals
    for(i = 0; i < cells.length; i++) {
      if(cells[i][0].val !== 0 && (cells[i][0].val === cells[i][1].val && cells[i][0].val === cells[i][2].val)) {
        document.getElementById('points' + cells[i][0].val).innerHTML = ++points[cells[i][0].val-1];
        alert('Player ' + cells[i][0].val + ' wins!', clear());
        return 1;
      }
    }

    //check verticals
    for(i = 0; i < cells.length; i++) {
      if((cells[0][i].val === cells[1][i].val && cells[0][i].val === cells[2][i].val) && cells[0][i].val !== 0) {
        document.getElementById('points' + cells[0][i].val).innerHTML = ++points[cells[0][i].val-1];
        alert('Player ' + cells[0][i].val + ' wins!', clear());
        return 1;
      }
    }

    //check 1st diagonal
    if((cells[0][0].val === cells[1][1].val && cells[2][2].val === cells[0][0].val) && cells[0][0].val !== 0) {
      document.getElementById('points' + cells[0][0].val).innerHTML = ++points[cells[0][0].val-1];
      alert('Player ' + cells[0][0].val + ' wins!', clear());
      return 1;
    }

    //check 2nd diagonal
    if((cells[0][2].val === cells[1][1].val && cells[2][0].val === cells[0][2].val) && cells[0][2].val !== 0) {
      document.getElementById('points' + cells[0][2].val).innerHTML = ++points[cells[0][2].val-1];
      alert('Player ' + cells[0][2].val + ' wins!', clear());
      return 1;
    }

    if(moves === cells.length*cells.length - 1) {
      clear();
      return 1;
    }

    return 0;
  }
  function run(event) {
    var c = getCell(cells, event.offsetX, event.offsetY);

    if(cells[c[0]][c[1]].val === 0 && ready === 1) {
      if(moves%2 === 0) {
        cells[c[0]][c[1]].val = cross(cells[c[0]][c[1]].cx, cells[c[0]][c[1]].cy);
        tris = chkTris(cells);
        moves++;
        if(pcSeed === 2 && !tris) {
          var wait = setInterval(function() {
            if(ready) {
              var iaC = ia(cells, moves);
              cells[iaC.row][iaC.col].val = circle(cells[iaC.row][iaC.col].cx, cells[iaC.row][iaC.col].cy);
              chkTris(cells);
              moves++;
              clearInterval(wait);
            }
          }, 1);
        }
      } else {
        cells[c[0]][c[1]].val = circle(cells[c[0]][c[1]].cx, cells[c[0]][c[1]].cy);
        chkTris(cells);
        moves++;
        if(pcSeed === 1 && !tris) {
          var wait = setInterval(function() {
            if(ready === 1) {
              var iaC = ia(cells, moves);
              cells[iaC.row][iaC.col].val = cross(cells[iaC.row][iaC.col].cx, cells[iaC.row][iaC.col].cy);
              chkTris(cells);
              moves++;
              clearInterval(wait);
            }
          }, 1);
        }
      }
    }

    return 0;
  }
  function firstRun() {
    if(pcSeed === 1 && !tris) {
      var wait = setInterval(function() {
        if(ready) {
          var iaC = ia(cells, moves);
          cells[iaC.row][iaC.col].val = cross(cells[iaC.row][iaC.col].cx, cells[iaC.row][iaC.col].cy);
          chkTris(cells);
          moves++;
          clearInterval(wait);
        }
      }, 1);
    }
    
    return 0;
  }
  
  //IA functions
  function ia(cells, moves) {
    //reference to minimax algorithm: http://www.geeksforgeeks.org/minimax-algorithm-in-game-theory-set-3-tic-tac-toe-ai-finding-optimal-move/
    var bestMove = {val: -Infinity, row: 0, col: 0};
    var moveVal = 0;
    
    for(var i in cells) {
      for(var j in cells[i]) {
        if(cells[i][j].val === 0) {
          cells[i][j].val = pcSeed;
          moveVal = minimax(cells, 0, false);
          cells[i][j].val = 0;
          
          if(moveVal > bestMove.val) {
            bestMove.val = moveVal;
            bestMove.row = i;
            bestMove.col = j;
          }
        }
      }
    }
    
    return bestMove;
  }
  function evaluate(cells) {
    /*heuristic function for the current board*/
    //checking for rows;
    for(var row in cells) {
      if(cells[row][0].val === cells[row][1].val && cells[row][0].val === cells[row][2].val) {
        if(cells[row][0].val === pcSeed) return 10;
        else if(cells[row][0].val === plyrSeed) return -10;
      }
    }
    
    //checking for columns;
    for(var col in cells) {
      if(cells[0][col].val === cells[1][col].val && cells[0][col].val === cells[2][col].val) {
        if(cells[0][col].val === pcSeed) return 10;
        else if(cells[0][col].val === plyrSeed) return -10;
      }
    }
    
    //checking for diagonals;
    if(cells[0][0].val === cells[1][1].val && cells[0][0].val === cells[2][2].val) {
      if(cells[0][0].val === pcSeed) return 10;
      else if(cells[0][0].val === plyrSeed) return -10;
    }
    
    if(cells[0][2].val === cells[1][1].val && cells[0][2].val === cells[2][0].val) {
      if(cells[0][2].val === pcSeed) return 10;
      else if(cells[0][2].val === plyrSeed) return -10;
    }
    
    //If no winner;
    return 0;
  }
  function minimax(cells, depth, isMax) {
    var best = 0, i = 0, j = 0;
    var score = evaluate(cells);
    
    if(score === 10) {
      return score - depth;
    }
    
    if(score === -10) {
      return score + depth;
    }
    
    if(isMoveLeft(cells) === false) {
      return 0;
    }
    
    if(isMax) {
      best = -Infinity;
      
      for(i in cells) {
        for(j in cells[i]) {
          if(cells[i][j].val === 0) {
            cells[i][j].val = pcSeed;
            best = Math.max(best, minimax(cells, depth+1, !isMax));
            cells[i][j].val = 0;
          }
        }
      }
      
      return best;
    }
    
    if(!isMax) {
      best = Infinity;
      
      for(i in cells) {
        for(j in cells[i]) {
          if(cells[i][j].val === 0) {
            cells[i][j].val = plyrSeed;
            best = Math.min(best, minimax(cells, depth+1, !isMax));
            cells[i][j].val = 0;
          }
        }
      }
      
      return best;
    }
  }
  function isMoveLeft(cells) {
    for(var i in cells) {
      for(var j in cells[i]) {
        if(cells[i][j].val === 0) return true;
      }
    }
    return false;
  }
}
