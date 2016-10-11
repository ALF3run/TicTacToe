/*NOTE: firefox setTimout() is bugged (Bug 814651)*/
/*TODO list: 
1. Personalized player names
2. Choose X or O*/
$(function() {
  $('.menu-overlay').hide();
  
  $('#menu-close').click(function() {
    $('.menu-overlay').fadeOut();
  });
  $('#menu-open').click(function() {
    $('.menu-overlay').fadeIn();
  });
  
  $('#human-player').click(function() {
    $('#game').remove();
    $('#game-container').html('<canvas id="game" width="250px" height="250px"></canvas>');
    gameEngine(0);
    $('.menu-overlay').fadeOut();
  });
  $('#pc-player').click(function() {
    $('#game').remove();
    $('#game-container').html('<canvas id="game" width="250px" height="250px"></canvas>');
    gameEngine(2);
    $('.menu-overlay').fadeOut();
  });
  
  gameEngine(2);
})

function gameEngine(oppSeed) {
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
  var pcSeed = oppSeed;
  var plyrSeed = 1;
  var tris = 0;
  
  
  clear();
  points = [0, 0];
  document.getElementById('points1').innerHTML = 0;
  document.getElementById('points2').innerHTML = 0;

  game.addEventListener('click', function(event) {run(event)});

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
  function ia() {
    //Still not unbeatable, even if the ia now lose with only one combination.
    /*reference to minimax algorithm: 
      1. https://www.ntu.edu.sg/home/ehchua/programming/java/JavaGame_TicTacToe_AI.html
      2. http://neverstopbuilding.com/minimax*/
    var bestChoose = {score: -Infinity, min: 0, row: 0, col: 0};
    var j = 0, i = 0, n = 0, m = 0, min = 0;

    for(j in cells) {
      for(i in cells[j]) {
        if(cells[j][i].val === 0) {
          cells[j][i].val = pcSeed;
          cells[j][i].maxScore = evaluate();
          /*START - determines which position is the best*/
          console.log('end of first evaluation');
          if(bestChoose.score < cells[j][i].maxScore) {
            bestChoose.score = cells[j][i].maxScore;
            bestChoose.row = j;
            bestChoose.col = i;
          }
          /*END - determines which position is the best*/
          /*START - evaluates which is the best between two postions that look both good*/
          else if(bestChoose.score === cells[j][i].maxScore) {
            /*START - evaluates next best possible moves of opponent.*/
            for(n in cells) {
              for(m in cells[n]) {
                if(cells[n][m].val === 0) {
                  cells[n][m].val = plyrSeed;
                  cells[n][m].minScore = evaluate();
                  if(min > cells[n][m].minScore) min = cells[n][m].minScore;
                  cells[n][m].val = 0;
                }
              }
            }
            console.log('min: ' + min);
            cells[j][i].val = 0;
            cells[bestChoose.row][bestChoose.col].val = 2;
            for(n in cells) {
              for(m in cells[n]) {
                if(cells[n][m].val === 0) {
                  cells[n][m].val = plyrSeed;
                  cells[n][m].minScore = evaluate();
                  if(bestChoose.min > cells[n][m].minScore) bestChoose.min = cells[n][m].minScore;
                  cells[n][m].val = 0;
                }
              }
            }
            console.log('bestChoose.min: ' + bestChoose.min);
            cells[bestChoose.row][bestChoose.col].val = 0;
            /*END - evaluates next best possible moves of opponent.*/
            /*START - determines which of the two positions is the worst for the opponent*/
            if(bestChoose.min < min) {
              bestChoose.score = cells[j][i].maxScore;
              bestChoose.row = j;
              bestChoose.col = i;
            }
            /*END - determines which of the two positions is the worst for the opponent*/
          }
          /*END - evaluates which is the best between two postions that look both good*/
          cells[j][i].val = 0;
        }
      }
    }
    
    console.log(bestChoose);
    cells[bestChoose.row][bestChoose.col].val = circle(cells[bestChoose.row][bestChoose.col].cx, cells[bestChoose.row][bestChoose.col].cy);

    return 0;
  }
  function evaluateLine(row1, col1, row2, col2, row3, col3) {
    var score = 0;
    /*heuristic function for evaluating lines*/
    // First cell
    if (cells[row1][col1].val == pcSeed) {
      score = 1;
    } else if (cells[row1][col1].val == plyrSeed) {
      score = -1;
    }

    // Second cell
    if (cells[row2][col2].val == pcSeed) {
      if (score == 1) {   // cell1 is mySeed
        score = 10;
      } else if (score == -1) {  // cell1 is oppSeed
        return 0;
      } else {  // cell1 is empty
        score = 1;
      }
    } else if (cells[row2][col2].val == plyrSeed) {
      if (score == -1) { // cell1 is oppSeed
        score = -10;
      } else if (score == 1) { // cell1 is mySeed
        return 0;
      } else {  // cell1 is empty
        score = -1;
      }
    }

    // Third cell
    if (cells[row3][col3].val == pcSeed) {
      if (score > 0) {  // cell1 and/or cell2 is mySeed
        score *= 10;
      } else if (score < 0) {  // cell1 and/or cell2 is oppSeed
        return 0;
      } else {  // cell1 and cell2 are empty
        score = 1;
      }
    } else if (cells[row3][col3].val == plyrSeed) {
      if (score < 0) {  // cell1 and/or cell2 is oppSeed
        score *= 10;
      } else if (score > 1) {  // cell1 and/or cell2 is mySeed
        return 0;
      } else {  // cell1 and cell2 are empty
        score = -1;
      }
    }
    return score;
  }
  function evaluate() {
    var score = 0;

    /*heuristic function for the current board*/
    score += evaluateLine(0, 0, 0, 1, 0, 2);  // row 0
    score += evaluateLine(1, 0, 1, 1, 1, 2);  // row 1
    score += evaluateLine(2, 0, 2, 1, 2, 2);  // row 2
    score += evaluateLine(0, 0, 1, 0, 2, 0);  // col 0
    score += evaluateLine(0, 1, 1, 1, 2, 1);  // col 1
    score += evaluateLine(0, 2, 1, 2, 2, 2);  // col 2
    score += evaluateLine(0, 0, 1, 1, 2, 2);  // diagonal
    score += evaluateLine(0, 2, 1, 1, 2, 0);  // alternate diagonal
    console.log('total score:' + score);
    return score;
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
              ia();
              chkTris(cells);
              moves++;
              clearInterval(wait);
            }
          });
        }
      } else {
        cells[c[0]][c[1]].val = circle(cells[c[0]][c[1]].cx, cells[c[0]][c[1]].cy);
        chkTris(cells);
        moves++;
      }
    }

    return 0;
  }
}
