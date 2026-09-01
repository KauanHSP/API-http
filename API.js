import http from 'node:http';
import { URL } from 'node:url';

const porta = 3000;

const tarefas = [
    { id: 1, nome: 'lavar louças' },
    { id: 2, nome: 'comparar uma RTX 5090' },
    { id: 3, nome: 'testar uma batata'}
]

const server = http.createServer((req, res) => {

    const urlOBJ = new URL(req.url, `http://${req.headers.host}`);

    res.setHeader('Content-Type', 'application/json');

    if (req.method == 'GET' && req.url == '/tarefas') {

        res.statusCode = 200;
        res.end(JSON.stringify(tarefas));

    } else if (req.method == 'POST' && req.url == '/tarefas') {

        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {

                const novaTarefa = JSON.parse(body);

                if (!novaTarefa.nome) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'O campo "nome" é obrigatório.' }));
                }

                const tarefaCriada = { id: tarefas.length + 1, nome: novaTarefa.nome };
                tarefas.push(tarefaCriada);
                res.statusCode = 201;
                res.end(JSON.stringify(tarefaCriada));

            } catch (error) {

                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'JSON inválido.' }));

            }
        })
    } else if (req.method == 'GET' && urlOBJ.pathname == '/tarefas/busca') {

        const nome = urlOBJ.searchParams.get('nome');

        if (!nome) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'O parâmetro "nome" é obrigatório.' }));
            return
        }

        const resultados = tarefas.filter(tarefa => tarefa.nome.toLocaleLowerCase().includes(nome.toLocaleLowerCase()));
        res.statusCode = 200;
        res.end(JSON.stringify(resultados));
        
    } else if (req.method == 'DELETE' && urlOBJ.pathname == '/tarefas') {
        const index = Number(urlOBJ.searchParams.get('index'));

        if (!index) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'O parâmetro "id" é obrigatório.' }));
            return;
        }

        if (index < 0 || index >= tarefas.length) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Índice inválido. Nenhuma tarefa encontrada.' }));
        return;

        const tarefaRemovida = tarefas.splice(index, 1);
        res.statusCode = 200;
        res.end(JSON.stringify({ message: 'Tarefa removida com sucesso.', tarefa: tarefaRemovida[0] }));
        }
    }
    else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Rota não encontrada.' }));
    }
    

})

server.listen(porta, () => {
    console.log(`Servidor rodando na porta ${porta}`);
})