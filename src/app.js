import "bootstrap/dist/css/bootstrap.min.css"; 
import "./styles/style.css";
import taskFieldTemplate from "./templates/taskField.html";
import noAccessTemplate from "./templates/noAccess.html";
import adminAddUser from "./templates/adminAddUser.html";
import dropdownMenu from "./templates/dropdownMenu.html";
import adminMenu from "./templates/adminMenu.html";
import { User } from "./models/User";
import { Task } from "./models/Task";
import { generateTestUser } from "./utils";
import { generateUser } from "./utils";
import { generateTask } from "./utils";
import { taskAndUserDelete } from "./utils";
import { usersInStorage } from "./utils";
import { State } from "./state";
import { authUser } from "./services/auth";
import { isUserTask } from "./services/taskUser";
import { isUserTaskAll } from "./services/taskUser";
import { logout } from "./services/auth";

export const appState = new State();

const loginForm = document.querySelector("#app-login-form");
const navBar=document.querySelector(".navbar-nav");
var todoListId='';//собираем id пользователя для корректной работы администрирования тасков (при клике по пользователю в списке - ему же и запишем задачу)

//функция показа верхнего меню в мобильной версии
document.querySelector(".navbar-toggler").addEventListener('click', () => {
  document.querySelector(".navbar-collapse").classList.toggle('show');
})

generateTestUser(User);

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const login = formData.get("login");
  const password = formData.get("password");


if (authUser(login, password)){
  //Если пользователь является админом - сделаем ему интерфейс админа с доп кнопками и возможностью добавления пользователей, в противном случае обычная Таска
  if(appState.currentUser.isAdmin === true){
    content (taskFieldTemplate);
    alert('Вы вошли как Администратор!');
    navBar.innerHTML = adminMenu;
  }else{
    navBar.innerHTML = '<li class="nav-item"><a class="nav-link active" aria-current="page" href="#" id="home">Мои задачи</a></li>';
    content (taskFieldTemplate);
  }

  //После авторизации, заменяем форму входа на кнопку выхода

  loginForm.innerHTML = '<div class="navbar-brand">' + login + '</div>'+dropdownMenu;
  document.querySelector('.dropdownmenu').addEventListener("click", function (e) {
    e.preventDefault();
    if(document.querySelector('.dropdownmenu')){
      document.querySelector('.dropdown-content').classList.toggle('block');
      document.querySelector('.svg').classList.toggle('noblock');
      document.querySelector('.svgout').classList.toggle('block');
    }
  });
//при клике по кнопке выхода - оповестим пользователя и выкинем его на заглушку
document.querySelector('.logout').addEventListener("click", function (e) {
  e.preventDefault();
  alert('Вы вышли из учетной записи');
logout();
content (noAccessTemplate);
navBar.innerHTML = '';
loginForm.innerHTML = '<input class="form-control me-2" name="login" autocomplete="username" type="text" placeholder="Логин" aria-label="Login"><input class="form-control me-2" name="password" autocomplete="current-password" type="password" placeholder="Пароль" aria-label="Password"><button id="app-login-btn" class="btn btn-outline-info" type="submit">Войти</button>';
});

todoList(appState.currentUser.id);
todoListId=appState.currentUser.id;

// логика верхнего меню
navBar.addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelector(".active").classList.remove("active");
  if (event.target.id === 'addUser') {// страница добавления и удаления пользователей
    event.target.classList.add('active');
    content (adminAddUser);

    //блок вывода списка пользователей, для просмотра и удаления
    const adminUsersList = document.querySelector(".admin-users-list");
    userslist (adminUsersList,'delete');
    //функция удаления пользователя
    adminUsersList.addEventListener("click", function (el) {
      if(el.target.classList.contains('delUser')){
        if(el.target.id==appState.currentUser.id){
          alert('Удалить себя нельзя');
        }else{
          taskAndUserDelete (el.target.id, 'users' );//функция используется для удаления пользователя
          userslist (adminUsersList,'delete');
          alert('Пользователь удален');
        }
    }
    });

    //форма добавления нового пользователя
    const adminForm = document.querySelector("#admin-login-form");
    adminForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(adminForm);
      const login = formData.get("login");
      const password = formData.get("password");
      const isAdmin = formData.get("isAdmin")=='1' ? true : false;
      generateUser(User, login, password, isAdmin);//функция добавления пользователя
      userslist (adminUsersList,'delete');
    });
  }
  if (event.target.id === 'all'){//страница просмотра всех таск пользователей
    event.target.classList.add('active');
    content (taskFieldTemplate);
    //функция, выводящая все записи всех пользователей
    todoList(appState.currentUser.id, true);
    document.querySelectorAll('.add-task-btn').forEach(el=>el.style.display='none');//скроем кнопки добавления для всех пользователей, в противном случае будет путаница
    todoListId=appState.currentUser.id;
    //блок вывода списка всех пользователей, для того, чтобы администрировать таски
    //допишем список пользователей на страницу с задачами
    document.querySelector('.todo').insertAdjacentHTML('afterbegin', '<div class="admin-users"><h2 class="admin-users-title">Список задач пользователей</h2><div class="admin-users-list"></div></div>');
    const admUsersList = document.querySelector(".admin-users-list");
    //запустим функцию вывода списка пользователей для просмотра
    userslist (admUsersList,'view');
    //функция просмотра от лица пользователя
    admUsersList.addEventListener("click", function (el) {
      if(el.target.classList.contains('viewUser')){
        if(el.target.id=='viewAll'){
          todoList(appState.currentUser.id, true);
          todoListId=appState.currentUser.id;
          document.querySelectorAll('.add-task-btn').forEach(el=>el.style.display='none');//уберем кнопки добавления при просмотре общего списка
          //alert('Вы просматриваете задачи всех пользователей');
        }else{
          todoList(el.target.id);
          todoListId=el.target.id;
          document.querySelectorAll('.add-task-btn').forEach(el=>el.style.display='block');
          //alert('Вы просматриваете задачи пользователя '+el.target.closest('.admin-users-list__item').querySelector('#usLogin').textContent);
        }
        if(document.querySelector('.activeblock')){document.querySelector('.activeblock').classList.remove("activeblock")}
        el.target.closest('.admin-users-list__item').classList.add("activeblock");
      }
    });

  }  
  if (event.target.id === 'home'){//домашняя страница
    event.target.classList.add('active');
    content (taskFieldTemplate);
    todoList(appState.currentUser.id);//вывод данных только выбранного пользователя
    todoListId=appState.currentUser.id;
  }
});


} else {
  content (noAccessTemplate);//вывод контента для неавторизованных
}


});

//функция добавления на страницу данных
function content (add){
  document.querySelector("#content").innerHTML = add;
}

//функция вывода списка пользователей
function userslist (block,action){
  let usersStorage=usersInStorage('users');
  if (usersStorage){
    block.innerHTML='<div class="admin-users-list__item"><span><b>Логин пользователя</b></span><span><b>Роль</b></span><span><b>Действие</b></span></div>';
    if(action=='view'){block.innerHTML+='<div class="admin-users-list__item activeblock"><span>Все пользователи</span><span>Все роли</span><span class="viewUser" id="viewAll">Просмотреть</span>'+'</div>';}
    for (let userIn of usersStorage) {
      //if(userIn.id==appState.currentUser.id) continue;
      block.innerHTML+='<div class="admin-users-list__item" id="'+userIn.id+'"><span id="usLogin">'+userIn.login+'</span><span>'+((userIn.isAdmin) ? 'Администратор' : 'Пользователь') +'</span>'+((action=="delete")?'<span class="delUser" id="'+userIn.id+'">Удалить</span>':'<span class="viewUser" id="'+userIn.id+'">Просмотреть</span>')+'</div>';
    }
  }
}



//функция записи задач в блок из локального хранилища
function todoStorage (userId, storagekey, block, All){
  let isStorageTask='';
  if(All){
    isStorageTask= isUserTaskAll(userId, '', storagekey);
  }else{
    isStorageTask= isUserTask(userId, '', storagekey);
  }
  document.querySelector('.'+storagekey+'-tasks').innerHTML= Array.isArray(isStorageTask) ? isStorageTask.length : 0;
  block.innerHTML ='';
  if(Array.isArray(isStorageTask) && isStorageTask.length){
  for (let sTask of isStorageTask) {
    block.innerHTML += ('<li class="dropdown-menu liitem" draggable="true" style="display:flex; padding:10px; position:relative; flex-direction: column;">'+sTask.text+'<span class="itemDel" id="'+sTask.id+'">X</span></li>');
  }
  deleteTask(userId, storagekey, block, All);
  disableButton(storagekey,false);
}else{
  block.innerHTML = ('<li class="dropdown-menu" style="display:flex; padding:10px; position:relative; flex-direction: column;">'+isStorageTask+'</li>');
  disableButton(storagekey,true);
  }
}

//функция записи задач в селекторы из локального хранилища
function todoStorageSel (userId, storagekey, All){
  let isStorageTask= All ? isUserTaskAll(userId, '', storagekey) : isUserTask(userId, '', storagekey);
  let block ='';
  if(Array.isArray(isStorageTask)){
  for (let sTask of isStorageTask) {
    block += ('<option value="'+sTask.id+'">'+sTask.text+'</option>');
  }
return block;
}
}


//событие взятия элемента со свойством draggable=true (задал его каждому элементу при создании)
document.querySelector(".container").addEventListener('dragstart', (evt) => {
  if(evt.target.classList.contains("dropdown-menu")){
    evt.target.classList.add('selected');
    hideInput()
  }
});
//событие завершения перетаскивания элемента
document.querySelector(".container").addEventListener(`dragend`, (evt) => {
  evt.target.classList.remove(`selected`);
  document.querySelector("#progressButton").style.background="";//удаляем белый фон блоков, куда можно переместить элемент
  document.querySelector("#finishButton").style.background="";
  if(document.querySelector('#progressList').querySelector('.liitem')){document.getElementById("finishButton").disabled = false;}//если есть элементы в предыдущих списках - отменим дисебл кнопки
  if(document.querySelector('#readyList').querySelector('.liitem')){document.getElementById("progressButton").disabled = false;}
});
//событие перетаскивания
document.querySelector(".container").addEventListener(`dragover`, (evt) => {
  evt.preventDefault();
  dragoverN(evt.target,'progressButton');
  dragoverN(evt.target,'finishButton');
});
//событие броса (отпускания) элемента
document.querySelector(".container").addEventListener(`drop`, (evt) => {
  evt.preventDefault();
  if(evt.target.closest("#progressButton")){//задаем возможность бросить эемент на кнопку
    dropN(evt.target,'progress','ready');
  }
  if(evt.target.closest("#finishButton")){//задаем возможность бросить эемент на кнопку
    dropN(evt.target,'finish','progress');
  }

});
//функция, отслеживающая перетаскивание элемента
function dragoverN(evnt,btn){
  let currentElement = evnt;
  //исключим возможности кидания элементов в кнопки этого же списка или минуя соседние списки
  if ((currentElement.id == "finishButton") && ((document.querySelector(`.selected`).closest('#readyList')) || (document.querySelector(`.selected`).closest('#finishList')) ) ) {document.getElementById("finishButton").disabled = true;}
  if ((currentElement.id == "progressButton") && ((document.querySelector(`.selected`).closest('#finishList')) || (document.querySelector(`.selected`).closest('#progressList')) ) ) {document.getElementById("progressButton").disabled = true;}
  if (currentElement.id == btn) {
    currentElement.style.background="green";// окрасим зону зеленым при наведении элемента
  }else{
    document.querySelector("#"+btn).style.background="white";// окрасим блоки, куда можно поместить элемент
  }
}
//Функция броса элемента в новый раздел
function dropN(evnt,thisactionKey,deltasktostorage){
  let activeElement = document.querySelector(`.selected`);
  let currentElement = evnt;
  if ((currentElement.id == "finishButton") && (activeElement.closest('#readyList')) ) {alert('нельзя нерешенную задачу поместить в список завершенных!'); return}
  if (currentElement.id == thisactionKey+"Button") {
    let blocklist= document.querySelector("#"+thisactionKey+"List");
    let blocklistold= document.querySelector("#"+deltasktostorage+"List");
    if(activeElement.textContent){
      let usAll;
      if(document.querySelector("#viewAll")){if(document.querySelector("#viewAll").closest(".activeblock")){usAll=true;}else{usAll='';}}//Если выбраны все пользователи
      generateTask(Task, todoListId, activeElement.childNodes[0].textContent, thisactionKey);//white to localstorage
      deleteTask(todoListId, deltasktostorage, blocklist, usAll, activeElement.querySelector(`.itemDel`).id);//удаление таски из старого списка
      todoStorage (todoListId, thisactionKey, blocklist, usAll);//обновление списков таск, после перетаскивания
      todoStorage (todoListId, deltasktostorage, blocklistold, usAll);
    }
  }
  document.querySelector("#"+thisactionKey+"Button").style.background="";
  //return;
}


//функция обработки листа задач
function todoList(userId, All){
    const readyList= document.querySelector("#readyList");
    const progressList= document.querySelector("#progressList");
    const finishList= document.querySelector("#finishList");
    const storageKeyReady = 'ready';
    const storageKeyProgress = 'progress';
    const storageKeyFinish = 'finish';
    todoStorage (userId, storageKeyReady, readyList, All);
    todoStorage (userId, storageKeyProgress, progressList, All);
    todoStorage (userId, storageKeyFinish, finishList, All);
  document.querySelector(".todo").addEventListener('click', (event) => {
  if (event.target.id === 'readyButton') {
    hideInput()
    const forInputReady=document.querySelector(".forInputReady");
    forInputReady.innerHTML = '<input type="text" class="form-control" id="readyText"><button class="readySubmit btn btn-outline-primary">ок</button>';
    document.querySelector(".readySubmit").addEventListener('click', (e)=>{
      e.preventDefault();
      let readyText=document.querySelector("#readyText").value;
      forInputReady.innerHTML ='';
      if(readyText){
      generateTask(Task, userId, readyText, storageKeyReady);//white to localstorage
      todoStorage (userId, storageKeyReady, readyList, All);
      }
    });

    }
    if (event.target.id === 'progressButton') {
      hideInput()
      const forInputProgress=document.querySelector(".forInputProgress");
      forInputProgress.innerHTML = '<select class="form-control" id="progressText">'+todoStorageSel(userId, storageKeyReady, All)+'</select><button class="progressSubmit btn btn-outline-primary">ок</button>';
      document.querySelector(".progressSubmit").addEventListener('click', (e)=>{
        e.preventDefault();
        let progressText=document.querySelector("#progressText");
        forInputProgress.innerHTML ='';
        if(progressText.value){
        generateTask(Task, userId, progressText.options[progressText.selectedIndex].text, storageKeyProgress);//white to localstorage
        todoStorage (userId, storageKeyProgress, progressList, All);
        deleteTask(userId, storageKeyReady, readyList, All, progressText.value);
        }
      });


    }
    if (event.target.id === 'finishButton') {
      hideInput()
      const forInputFinish=document.querySelector(".forInputFinish");
      forInputFinish.innerHTML = '<select class="form-control" id="finishText">'+todoStorageSel(userId, storageKeyProgress, All)+'</select><button class="finishSubmit btn btn-outline-primary">ок</button>';
      document.querySelector(".finishSubmit").addEventListener('click', (e)=>{
        e.preventDefault();
        let finishText=document.querySelector("#finishText");
        forInputFinish.innerHTML ='';
        if(finishText.value){
        generateTask(Task, userId, finishText.options[finishText.selectedIndex].text, storageKeyFinish);//white to localstorage
        todoStorage (userId, storageKeyFinish, finishList, All);
        deleteTask(userId, storageKeyProgress, progressList, All, finishText.value);
        }
      });

    }
  })

  
  


}

//функция скрывания всех блоков при клике
function hideInput(){
  let hidetrue='';
  if(document.querySelector(".readySubmit")){document.querySelector(".forInputReady").innerHTML =''; hidetrue=true;}
  if(document.querySelector(".progressSubmit")){document.querySelector(".forInputProgress").innerHTML =''; hidetrue=true;}
  if(document.querySelector(".finishSubmit")){document.querySelector(".forInputFinish").innerHTML =''; hidetrue=true;}
  if(hidetrue==true){ return true;}
}


function disableButton(button,disabled){
  switch (button) {
    case 'ready':
      document.getElementById("progressButton").disabled = disabled;
      break;
    case 'progress':
      document.getElementById("finishButton").disabled = disabled;
      break;
  }
}

function deleteTask(userId, storagekey, block, All, delforselectid){

//функция удаления задач при добавлении в другой список
if(delforselectid){
  taskAndUserDelete(delforselectid,storagekey);
  todoStorage (userId, storagekey, block, All);
}else{

//функция удаления задач
  const taskItems = document.querySelectorAll('.itemDel');
  let delId='';
  taskItems.forEach(taskItem => {
    taskItem.addEventListener('click', function handleClick(event) {
      delId=event.target.id;
      taskAndUserDelete(delId,storagekey);
      todoStorage (userId, storagekey, block, All)
    });
});
}

}