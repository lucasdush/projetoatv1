// Configura o banco de dados básico (Dexie / IndexedDB)
const db = new Dexie("ChamadosDB");
db.version(1).stores({
    chamados: '++id, numero, nome, telefone, cliente, tipo, prioridade, status'
});

function definirPrioridade(){
    let problemaElement = document.getElementById("problema")
    if(!problemaElement) return
    
    let problema = parseInt(problemaElement.value)
    let prioridade = document.getElementById("prioridade")

    if(problema === 3){
        prioridade.value = "Grave"
    } else if(problema === 2){
        prioridade.value = "Média"
    } else {
        prioridade.value = "Leve"
    }
}

async function gerarChamado(event){
    event.preventDefault()

    let numero = Math.floor(Math.random()*9000)+1000

    let chamado = {
        numero: numero,
        nome: document.getElementById("nome").value,
        telefone: document.getElementById("telefone").value,
        cliente: document.getElementById("cliente").value,
        tipo: document.getElementById("tipo").value,
        prioridade: document.getElementById("prioridade").value,
        descricao: document.getElementById("descricao").value,
        status: "Aberto"
    }

    try {
        await db.chamados.add(chamado);
        
        const resultado = document.getElementById("resultado")
        if (resultado) {
            resultado.innerText = "Chamado Nº " + numero + " criado com sucesso!"
            resultado.style.color = "green"
        }

        document.querySelector("form").reset()
        if (document.getElementById("prioridade")) {
            document.getElementById("prioridade").value = ""
        }
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar o chamado.");
    }
}

async function carregarChamados(statusFiltro = "Finalizado"){
    let tabela = document.getElementById("tabela")
    if(!tabela) return

    tabela.innerHTML = "<tr><td colspan='8'>Carregando...</td></tr>"

    try {
        // Busca os chamados do banco de dados IndexedDB
        const chamados = await db.chamados
            .where("status")
            .equals(statusFiltro)
            .toArray();

        tabela.innerHTML = ""

        if (chamados.length === 0) {
            tabela.innerHTML = `<tr><td colspan='8'>Nenhum chamado ${statusFiltro.toLowerCase()}.</td></tr>`
            return
        }

        chamados.forEach((c) => {
            let acao = statusFiltro === "Aberto" ? `<td><button onclick="finalizar(${c.id})">Finalizar</button></td>` : ""
            
            let linha = `
            <tr>
                <td>${c.numero}</td>
                <td>${c.nome || '-'}</td>
                <td>${c.telefone || '-'}</td>
                <td>${c.cliente}</td>
                <td>${c.tipo}</td>
                <td>${c.prioridade}</td>
                <td>${c.status}</td>
                ${acao}
            </tr>`

            tabela.innerHTML += linha
        })
    } catch (error) {
        console.error("Erro ao carregar:", error);
        tabela.innerHTML = "<tr><td colspan='8'>Erro ao carregar chamados.</td></tr>"
    }
}

async function finalizar(id){
    try {
        await db.chamados.update(id, { status: "Finalizado" });
        location.reload();
    } catch (error) {
        console.error("Erro ao finalizar:", error);
        alert("Erro ao finalizar o chamado.");
    }
}

// Inicializa a carga dependendo da página
window.onload = () => {
    if(window.location.pathname.includes("lista.html")) {
        carregarChamados("Finalizado")
    } else if(window.location.pathname.includes("fila.html")) {
        carregarChamados("Aberto")
    }
}
