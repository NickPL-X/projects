// 用一个 todo 参数返回一个 todo cell 的 HTML 字符串
var templateTodo = function(todo) {
    var t = `
        <div class="todo-cell">
            <i class="todo-done fa fa-square-o" aria-hidden="true"></i>
            <span contenteditable="true">${todo}</span>
            <i class="todo-edit fa fa-pencil" aria-hidden="true"></i>
            <i class="todo-delete fa fa-trash-o fa-fw"></i>
        </div>
    `
    return t
}

// 载入所有存储在 localStorage 里面的 todo
var loadTodos = function() {
    var s = localStorage.savedTodos
    if (s == undefined) {
        return []
    } else {
        var ts = JSON.parse(s)
        return ts
    }
}
// 获取所有存储在 localStorage 里的 todos
var todos = loadTodos()

// add 的时候调用一个函数把 todo 存储到 localStorage 里面
var saveTodo = function(todo) {
    // 添加到 todos 数组
    todos.push(todo)
    var s = JSON.stringify(todos)
    localStorage.savedTodos = s
}

// 删除 todo
var deleteTodo = function(container, todoCell) {
    // 遍历 container 的所有子元素
    for (var i = 0; i < container.children.length; i++) {
        var todo = container.children[i]
        // log('i',i)
        // log('todo',todo)
        // 如果 todo 和 todoCell 是同一个元素,
        // 说明 i 就是我们要找的下标
        if (todo == todoCell) {
            // log('i',i)
            // log('todo', todo)
            todos.splice(i, 1)
            var s = JSON.stringify(todos)
            localStorage.savedTodos = s
            // log(todos,'todos')
        }
    }
}

// 编辑 todo
var editTodo = function(container, todoCell) {
    // 遍历 container 的所有子元素
    for (var i = 0; i < container.children.length; i++) {
        var todo = container.children[i]
        // 如果 todo 和 todoCell 是同一个元素,
        // 说明 i 就是我们要找的下标
        if (todo == todoCell) {
            // 得到修改后的字符串并更新
            todos[i] = todo.innerText
            var s = JSON.stringify(todos)
            localStorage.savedTodos = s
            // log(todos,'todos')
        }
    }
}
// 交换某个元素 class 的函数
var exchangeClass = function(element, className1, className2) {
    if (element.classList.contains(className1)) {
        element.classList.remove(className1)
        element.classList.add(className2)
    } else {
        element.classList.remove(className2)
        element.classList.add(className1)
    }
}
// 给 add button 绑定添加 todo 事件
var bindEventAdd = function() {
    var addButton = e('#id-button-add')
    addButton.addEventListener('click', function() {
        // log('click')
        // 获得 input.value
        // 1. 获取一个元素
        var todoInput = e('#id-input-todo')
        // 2. 用 .value 属性获取用户输入的字符串
        var todo = todoInput.value
        // log('todo value', todo, typeof todo)
        // 存储到 localStorage 中
        saveTodo(todo)
        // 添加到 container 中
        var todoContainer = e('#id-div-container')
        var t = templateTodo(todo)
        todoContainer.insertAdjacentHTML('beforeend', t)
    })
}

// 给delete button添加事件
var bindEventDelete = function() {
    var todoContainer = e('#id-div-container')
    todoContainer.addEventListener('click', function(event) {
        // log('container click', event, event.target)
        // 获取被点击的元素
        var target = event.target
        // 得到被点击的元素后, 通过查看它的 class 来判断它是哪个按钮
        if (target.classList.contains('todo-delete')) {
            // log('delete')
            var todoCell = target.parentElement
            var container = todoCell.parentElement
            // 点击删除的时候, 从 localStorage 里面删除相应的 todo
            deleteTodo(container, todoCell)
            todoCell.remove()
        }
    })
}

// 给完成添加事件
var bindEventDone = function() {
    var todoContainer = e('#id-div-container')
    todoContainer.addEventListener('click', function(event) {
        // log('container click', event, event.target)
        // 获取被点击的元素
        var target = event.target
        // 得到被点击的元素后, 通过查看它的 class 来判断它是哪个按钮
        if (target.classList.contains('todo-done')) {
            var className1 = 'fa-square-o'
            var className2 = 'fa-check-square-o'
            exchangeClass(target, className1, className2)
        }
    })
}

// 添加编辑功能
var bindEventEdit = function() {
    var todoContainer = e('#id-div-container')
    todoContainer.addEventListener('click', function(event) {
        // log('container click', event, event.target)
        // 获取被点击的元素
        var target = event.target
        // 得到被点击的元素后, 通过查看它的 class 来判断它是哪个按钮
        if (target.classList.contains('todo-edit')) {
            var todoCell = target.parentElement
            var container = todoCell.parentElement
            // 点击编辑的时候, 将修改后的内容加入 localstorge 中
            editTodo(container, todoCell)
        }
    })
}

// 把所有的 todos 插入到页面中
var insertTodos = function(todos) {
    for (var i = 0; i < todos.length; i++) {
        var todo = todos[i]
        var todoContainer = e('#id-div-container')
        var t = templateTodo(todo)
        todoContainer.insertAdjacentHTML('beforeend', t)
    }
}

var _main = function() {
    insertTodos(todos)
    bindEventAdd()
    bindEventDelete()
    bindEventDone()
    bindEventEdit()
}

_main()
