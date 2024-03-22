const express = require("express");
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const path = require('path');
const http = require('http');
app.use("/", express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
server.listen(5000, () => {
    console.log("- server running");
});

//lista dei promemoria e contatore dei singoli promemoria
let lista_promemoria = [];

const fs = require('fs');

const mysql = require('mysql2');
const conf = require('./conf.js');
const connection = mysql.createConnection(conf);

const executeQuery = (sql) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, function (err, result) {
            if (err) {
                console.error(err);
                reject();
            }
            resolve(result);
        });
    })
}

const createTable = () => {
    return executeQuery(`
        CREATE TABLE IF NOT EXISTS promemoria (
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        nome VARCHAR(255) NOT NULL,
        stato BOOLEAN NOT NULL
        )
    `);
}

const insert = (promemoria) => {
    const template = `INSERT INTO promemoria (nome, stato) VALUES ('NOME', STATO)`;
    let sql = template.replace("NOME", promemoria.nuovo_promemoria.nome);
    sql = sql.replace("STATO", promemoria.nuovo_promemoria.stato);
    return executeQuery(sql);
}

app.post("/todo/add", (req, res) => {
    const nuovo_promemoria = req.body;
    createTable().then(() => {
        insert({ nuovo_promemoria }).then(() => {
            res.json({ result: "OK" });
        });
    });
});

const select = () => {
    const sql = `SELECT * FROM promemoria`;
    return executeQuery(sql);
}

app.get("/todo", (req, res) => {
    select().then((contenuto_database) => {
        lista_promemoria = contenuto_database;
        res.json({ todos: lista_promemoria });
    });
});

const cancella = (id_da_trovare) => {
    const sql = `DELETE FROM promemoria WHERE id = ` + id_da_trovare;
    return executeQuery(sql);
}

app.delete("/todo/cancella/:id_da_trovare", (req, res) => {
    const id_da_trovare = parseInt(req.params.id_da_trovare);
    cancella(id_da_trovare).then(() => {
        res.json({ result: "OK" });
    })
});

const completa = (promemoria) => {
    const sql = `UPDATE promemoria SET stato = true WHERE id =` + promemoria.id;
    return executeQuery(sql);
}

app.put("/todo/complete", (req, res) => {
    const promemoria = req.body;
    completa(promemoria).then(() => {
        res.json({ result: "OK" });
    })
});
