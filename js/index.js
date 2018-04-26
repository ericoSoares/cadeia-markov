let ctmc = [];
let ctmcGI = [];
let dtmc = [];
let estadoAtual = 0;
let numSaltos;
let estados = [];
let estadosPorcent = [];
let seqSim;

$("#calcular").click(() => {
  reset();
  estadoAtual = $("#estIni").val() || 0;
  numSaltos = $("#qntSaltos").val() || 100;
  let auxMat = $("#matVal").val();
  auxMat = auxMat.replace(/\,/g, ".");
  console.log(auxMat);
  auxMat = auxMat.split("\n");
  auxMat = auxMat.filter((elem) => {
    return !elem.includes("#");
  });
  auxMat = auxMat.filter((elem) => {
    return elem.length != 0;
  });
  console.log(auxMat);
  let numEstados = parseInt(auxMat[0]);
  auxMat.splice(0, 1);
  ctmc = auxMat.join("|");
  console.log(ctmc);
  if (validaCTMC(ctmc)) {
    ctmc = ctmc.split("|");
    for (let i = 0; i < ctmc.length; i++) {
      ctmc[i] = ctmc[i].trim().split(" ");
    }
    console.log("CTMC:");
    console.log(ctmc);
    if (validaEstados()) {
      transformInt();
      convertGI();
      convertDTMC();
      simulacao(numSaltos);
      formataMat();
    }
  }
});

//Converte toda a matriz de String para Int
function transformInt() {
  for (let i = 0; i < ctmc.length; i++) {
    for (let j = 0; j < ctmc[i].length; j++) {
      ctmc[i][j] = parseFloat(ctmc[i][j]);
    }
  }
}

//Converte CTMC para GI
function convertGI() {
  //Cria copia da CTMC
  ctmcGI = [];
  for (var i = 0; i < ctmc.length; i++) {
    ctmcGI.push(ctmc[i].slice());
  }
  //Executa logica na diagonal principal da ctmcGI
  for (let i = 0; i < ctmcGI.length; i++) {
    let soma = 0;
    for (let j = 0; j < ctmcGI[i].length; j++) {
      soma += ctmcGI[i][j];
    }
    ctmcGI[i][i] = soma * (-1);
  }
  console.log("Gerador Infinitesimal:");
  console.log(ctmcGI);
}

//Encontra MAX e realiza conversão de CTMC para DTMC
function convertDTMC() {
  //Encontra o MAX
  let MAX = ctmcGI[0][0];
  for (let i = 1; i < ctmcGI.length; i++) {
    if (Math.abs(ctmcGI[i][i]) > Math.abs(MAX)) {
      MAX = ctmcGI[i][i];
    }
  }

  //Gera matriz DTMC
  for (let i = 0; i < ctmcGI.length; i++) {
    let aux = [];
    for (let j = 0; j < ctmcGI[i].length; j++) {
      let aux2 = ctmcGI[i][j] / MAX;
      if (i == j) {
        aux.push(1 - aux2);
      } else {
        aux.push(-aux2);
      }
    }
    dtmc.push(aux);
  }
  console.log("MAX: " + MAX);
  console.log("DTMC gerada:");
  console.log(dtmc);
}

function simulacao(passos) {
  estados = [];
  for (let i = 0; i < dtmc.length; i++) {
    estados.push(0);
  }
  for (let x = 0; x < passos; x++) {
    let anterior = 0;
    let aux = dtmc[estadoAtual];
    rand = Math.random();
    for (let i = 0; i < aux.length; i++) {
      if (aux[i] != 0) {
        if (rand >= anterior && rand < aux[i] + anterior) {
          estadoAtual = i;
          estados[estadoAtual]++;
          i = aux.length;
        }
        anterior += aux[i];
      }
    }
    seqSim.push({ num: rand, est: estadoAtual });
  }
  console.log("Número de visitas à cada estado:");
  console.log(estados);
  console.log("Total de movimentações: " + estados.reduce(function (a, b) { return a + b; }, 0));
}

function formataMat() {
  let aux = [];
  $("#mostraResultados").html("<p align='center'><strong>Resultados da simulação:</strong></p>");
  $("#mostraResultados").append("<br><strong>DTMC:</strong><br>");
  let str = "";
  for(let i = 0; i < dtmc.length; i++) {
    for(let j = 0; j < dtmc[i].length; j++) {
      str += dtmc[i][j].toFixed(4) + " | ";
    }
    str += "<br>";
  }
  $("#mostraResultados").append(str + "<br>");
  $("#mostraResultados").append("<br>Pressione <strong>[Ctrl + Shift + J]</strong> para ver mais detalhes (Chrome e Firefox)<br><br>");
  $("#mostraResultados").append("Total de saltos: <strong>" + numSaltos + "</strong><br>");
  for (let i = 0; i < estados.length; i++) {
    aux.push({ ind: i, est: estados[i] });
  }
  aux.sort(function (a, b) {
    if (a.est < b.est) {
      return 1;
    }
    if (a.est > b.est) {
      return -1;
    }
    return 0;
  });
  for (let i = 0; i < aux.length; i++) {
    $("#mostraResultados").append("Estado <strong>" + aux[i].ind + "</strong>: <strong>" + aux[i].est + "</strong> visitas -> <strong>" + ((aux[i].est / numSaltos) * 100).toFixed(4) + "%</strong> <br>");
  }
  $("#mostraResultados").append("<br><strong>Sequencia de saltos:</strong><br><br>");
  for (let i = 0; i < seqSim.length; i++) {
    $("#mostraResultados").append("Numero aleatório gerado: <strong>" + seqSim[i].num.toFixed(14) + "</strong>, foi para o estado <strong>" + seqSim[i].est + "</strong><br>");
  }
}

function reset() {
  ctmc = [];
  ctmcGI = [];
  dtmc = [];
  estados = [];
  estadosPorcent = [];
  seqSim = [];
}

function validaCTMC(mat) {
  if (mat.match(/[^(\d\|\.\s)]/g)) {
    alert("ERRO: CTMC contém caracteres inválidos!");
    return false;
  }
  return true;
}

function validaEstados() {
  if (estadoAtual > ctmc.length - 1 || estadoAtual.match(/[^(\d)]/g)) {
    alert("ERRO: Estado inicial inválido!");
    return false;
  }
  if (numSaltos.match(/[^(\d)]/g)) {
    alert("ERRO: Quantidade de saltos inválida!");
    return false;
  }
  let aux = ctmc[0].length;
  if (ctmc.length != aux) {
    alert("ERRO: CTMC não é NxN!")
    return false;
  }
  for (let i = 0; i < ctmc.length; i++) {
    if (ctmc[i][i] != 0) {
      alert("ERRO: CTMC deve ter diagonal principal nula!");
      return false;
    }
  }
  for (let i = 0; i < ctmc.length; i++) {
    if (ctmc[i].length != aux) {
      alert("ERRO: CTMC não é NxN!");
      return false;
    }
  }
  return true;
}
