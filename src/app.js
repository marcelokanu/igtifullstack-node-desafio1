const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());


const states = JSON.parse(fs.readFileSync(__dirname + '/json/Estados.json', 'utf8', (err, data) => {
  console.log(err);
  console.log(data);
}));



const citys = JSON.parse(fs.readFileSync(__dirname + '/json/Cidades.json', 'utf8', (err, data) => {
  console.log(err);
  console.log(data);
}));



const cidades_estados = [] 
citys.map(cidade => {
  const {Sigla} = states.find(estado => estado.ID === cidade.Estado)
  if (!cidades_estados[Sigla]) cidades_estados[Sigla] = []
  cidades_estados[Sigla].push(cidade.Nome)
  return cidades_estados;
})

//console.log(cidades_estados)


app.get("/", (req, res) => {
  return res.json(cidades_estados);
});

app.get("/estados", (req, res) => {
  return res.json(states);
});
app.get("/cidades", (req, res) => {
  return res.json(citys);
});

module.exports = app;
