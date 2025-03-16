import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'
import { parse } from 'csv-parse';
import busboy from 'busboy';

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', search ? {
        title: search,
        description: search,
        completed_at: search,
        create_at: search,
        update_at: search,
      } : null)

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body;
  
      // Valida se os campos obrigatórios estão presentes
      if (!title || !description) {
        return res.writeHead(400).end(JSON.stringify({ error: "Title and description are required" }));
      }
  
      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
  
      database.insert('tasks', task);
  
      return res.writeHead(201).end();
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params; // Obtém o ID da tarefa da URL
      const { title, description } = req.body; // Obtém os campos atualizáveis do corpo da requisição
  
      // Busca a tarefa no banco de dados
      const task = database.select('tasks', { id })[0];
  
      // Verifica se a tarefa existe
      if (!task) {
        return res.writeHead(404).end(JSON.stringify({ error: "Task not found" }));
      }
  
      // Atualiza a tarefa no banco de dados
      database.update('tasks', id, {
        title: title ?? task.title, // Mantém o título existente se não for fornecido
        description: description ?? task.description, // Mantém a descrição existente se não for fornecida
        updated_at: new Date().toISOString(), // Atualiza o campo `updated_at`
      });
  
      // Retorna uma resposta vazia com status 204 (No Content)
      return res.writeHead(204).end();
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params; // Obtém o ID da tarefa da URL
  
      // Busca a tarefa no banco de dados
      const task = database.select('tasks', { id })[0];
  
      // Verifica se a tarefa existe
      if (!task) {
        return res.writeHead(404).end(JSON.stringify({ error: "Task not found" }));
      }
  
      // Exclui a tarefa do banco de dados
      database.delete('tasks', id);
  
      // Retorna uma resposta vazia com status 204 (No Content)
      return res.writeHead(204).end();
    }
  },
 
]
