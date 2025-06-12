const todoInput = document.getElementById('todoInput');
const addTodoButton = document.getElementById('addTodo');
const todoList = document.getElementById('todoList');

addTodoButton.addEventListener('click', addTodo);

function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText !== '') {
        const li = document.createElement('li');
        li.innerHTML = `<span>${todoText}</span><button class="delete">Delete</button>`;
        todoList.appendChild(li);
        todoInput.value = '';

        const deleteButton = li.querySelector('.delete');
        deleteButton.addEventListener('click', deleteTodo);

        function deleteTodo() {
            li.remove();
        }
    }
}
