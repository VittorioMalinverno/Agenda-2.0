let aggiungi_promemoria = document.getElementById("aggiungi_promemoria");
let tabella_lista_promemoria = document.getElementById("lista_promemoria");
const schema_tabella_promemoria = "<tr> <td>NOME_PROMEMORIA</td> <td>STATO_PROMEMORIA</td> <td><button type='button' class='btn btn-danger elimina' id='TASTO_CANCELLA'>Cancella</button></td> <td><button type='button' class='btn btn-success completa' id='TASTO_COMPLETATO'>Completato</button></td> </tr>";

fetch("/todo").then((response) => response.json()).then((todos) => {
    render(todos.todos);
})

aggiungi_promemoria.onclick = () => {
    fetch("/todo/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"nome":document.getElementById("promemoria").value, "stato":false})
    }).then(() => {
        fetch("/todo").then((response) => response.json()).then((todos) => {
            render(todos.todos);
        })
    })
};

const render = (lista_promemoria) => {

    let html = "";
    lista_promemoria.forEach((promemoria) => {
        let tabella_promemoria = schema_tabella_promemoria.replace("NOME_PROMEMORIA", promemoria.nome);
        tabella_promemoria = tabella_promemoria.replace("TASTO_CANCELLA", "cancella_" + promemoria.id);
        tabella_promemoria = tabella_promemoria.replace("TASTO_COMPLETATO", "completa_" + promemoria.id);
        if (promemoria.stato) {
            tabella_promemoria = tabella_promemoria.replace("STATO_PROMEMORIA", "Fatto");
        } else {
            tabella_promemoria = tabella_promemoria.replace("STATO_PROMEMORIA", "Incompleto");
        }
        html += tabella_promemoria;
    })
    tabella_lista_promemoria.innerHTML = html;

    const tasto_elimina = document.querySelectorAll('.elimina');
    tasto_elimina.forEach((button) => {
        button.onclick = () => {
            const id_da_trovare = parseInt(button.id.replace("cancella_", ""));
            fetch("/todo/cancella/"+id_da_trovare, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            }).then(() => {
                fetch("/todo").then((response) => response.json()).then((todos) => {
                    render(todos.todos);
                })
            })
        }
    })

    const tasto_completa = document.querySelectorAll('.completa');
    tasto_completa.forEach((button) => {
        button.onclick = () => {
            const id_da_trovare = parseInt(button.id.replace("completa_", ""));
            const promemoria = lista_promemoria.find((element) => element.id == id_da_trovare);
            fetch("/todo/complete", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(promemoria)
            }).then(() => {
                fetch("/todo").then((response) => response.json()).then((todos) => {
                    render(todos.todos);
                })
            })
        }
    })
}
